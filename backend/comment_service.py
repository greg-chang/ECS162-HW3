from datetime import datetime
from typing import List, Optional
from pymongo import MongoClient
from bson import ObjectId
from models.comment import Comment
import uuid

class CommentService:
    def __init__(self, mongo_client: MongoClient):
        self.db = mongo_client.get_default_database()
        self.comments = self.db.comments

    def create_comment(self, comment: Comment) -> Comment:
        """Create a new comment with validation"""
        # Validate required fields
        if not comment.article_id or not comment.user_id or not comment.content:
            raise ValueError("article_id, user_id, and content are required")
        
        # If this is a reply, validate that the parent comment exists
        if comment.parent_uuid:
            parent_comment = self.comments.find_one({"uuid": comment.parent_uuid})
            if not parent_comment:
                raise ValueError("Parent comment not found")
        
        # Ensure created_at is set
        if not comment.created_at:
            comment.created_at = datetime.utcnow()
        
        # Assign a UUID if not provided
        if not comment.uuid:
            comment.uuid = str(uuid.uuid4())
        
        # Create comment document without _id
        comment_dict = comment.dict(exclude={'_id'})
        
        # Insert into MongoDB
        result = self.comments.insert_one(comment_dict)
        
        # Add the _id to the comment object
        comment_dict['_id'] = str(result.inserted_id)
        return Comment(**comment_dict)

    def get_comments_by_article(self, article_id: str) -> List[Comment]:
        """Get all comments for a specific article"""
        cursor = self.comments.find({"article_id": article_id}).sort("created_at", -1)
        comments = []
        for doc in cursor:
            # Convert MongoDB document to dict and ensure _id is included as string
            comment_dict = {
                '_id': str(doc['_id']),
                'uuid': doc['uuid'], 
                'article_id': doc['article_id'],
                'user_id': doc['user_id'],
                'content': doc['content'],
                'created_at': doc['created_at'],
                'updated_at': doc.get('updated_at')
            }
            comments.append(Comment(**comment_dict))
        return comments

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

    def delete_comment(self, comment_uuid: str) -> bool:
        """Delete a comment"""
        print(f"Attempting to delete comment with UUID: {comment_uuid}")
        print(f"UUID type: {type(comment_uuid)}")
        print(f"UUID length: {len(comment_uuid) if comment_uuid else 0}")
        
        if not comment_uuid:
            print("Error: Comment UUID is empty")
            raise ValueError("Comment UUID is required")
            
        try:
            # Validate UUID format
            if not uuid.UUID(comment_uuid):
                print(f"Error: Invalid UUID format: {comment_uuid}")
                raise ValueError(f"Invalid comment UUID format: {comment_uuid}")
                
            print(f"Converting to UUID: {comment_uuid}")
            uuid_obj = uuid.UUID(comment_uuid)
            print(f"Converted UUID: {uuid_obj}")
            
            result = self.comments.delete_one({"uuid": comment_uuid})
            print(f"Delete result: {result.deleted_count} documents deleted")
            
            if result.deleted_count == 0:
                print(f"Warning: No document found with UUID: {comment_uuid}")
                
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error during delete operation: {str(e)}")
            raise ValueError(f"Failed to delete comment: {str(e)}")

    def get_replies(self, parent_uuid: str) -> List[Comment]:
        """Get all replies for a specific comment"""
        cursor = self.comments.find({"parent_uuid": parent_uuid}).sort("created_at", 1)
        replies = []
        for doc in cursor:
            comment_dict = {
                '_id': str(doc['_id']),
                'uuid': doc['uuid'],
                'parent_uuid': doc.get('parent_uuid'),
                'article_id': doc['article_id'],
                'user_id': doc['user_id'],
                'content': doc['content'],
                'created_at': doc['created_at'],
                'updated_at': doc.get('updated_at')
            }
            replies.append(Comment(**comment_dict))
        return replies 