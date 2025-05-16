from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Comment(BaseModel):
    _id: Optional[str] = None
    article_id: str  # The NYT article ID
    user_id: str     # The user who made the comment
    content: str     # The comment text
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None 