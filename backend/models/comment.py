from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
import uuid 

class Comment(BaseModel):
    _id: Optional[str] = None  # MongoDB document ID (optional for new comments)
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))  # Unique identifier for the comment
    article_id: str  # The NYT article ID
    user_id: str     # The user who made the comment
    content: str     # The comment text
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None 