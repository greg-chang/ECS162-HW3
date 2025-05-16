from datetime import datetime
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
from models.comment import Comment

class CommentService:
    def __init__(self, mongo_client: MongoClient):
        self.db = mongo_client.get_default_database()
        self.comments = self.db.comments

    def create_comment(self, comment: Comment) -> Comment:
        """Create a new comment with validation"""
        # Validate required fields
        if not comment.article_id or not comment.user_id or not comment.content:
            raise ValueError("article_id, user_id, and content are required")
        
        # Ensure created_at is set
        if not comment.created_at:
            comment.created_at = datetime.utcnow()
        
        comment_dict = comment.dict(exclude={'id'})  # Exclude _id if it exists
        result = self.comments.insert_one(comment_dict)
        
        # Add the _id to the comment object
        comment_dict['_id'] = str(result.inserted_id)
        return Comment(**comment_dict)

    def get_comments_by_article(self, article_id: str) -> List[Comment]:
        """Get all comments for a specific article"""
        cursor = self.comments.find({"article_id": article_id}).sort("created_at", -1)
        return [Comment(**{**doc, '_id': str(doc['_id'])}) for doc in cursor]

    def update_comment(self, comment_id: str, content: str) -> Optional[Comment]:
        """Update an existing comment"""
        if not content:
            raise ValueError("content is required")
            
        try:
            result = self.comments.update_one(
                {"_id": ObjectId(comment_id)},
                {
                    "$set": {
                        "content": content,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            if result.modified_count:
                doc = self.comments.find_one({"_id": ObjectId(comment_id)})
                return Comment(**{**doc, '_id': str(doc['_id'])})
            return None
        except Exception as e:
            raise ValueError(f"Invalid comment ID: {str(e)}")

    def delete_comment(self, comment_id: str) -> bool:
        """Delete a comment"""
        if not comment_id:
            raise ValueError("Comment ID is required")
            
        try:
            # Validate ObjectId format
            if not ObjectId.is_valid(comment_id):
                raise ValueError(f"Invalid comment ID format: {comment_id}")
                
            result = self.comments.delete_one({"_id": ObjectId(comment_id)})
            return result.deleted_count > 0
        except Exception as e:
            raise ValueError(f"Failed to delete comment: {str(e)}") 