// Create comments collection with validation rules
db.createCollection("comments", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["article_id", "user_id", "content", "created_at"],
      properties: {
        article_id: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        user_id: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        content: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        created_at: {
          bsonType: "date",
          description: "must be a date and is required"
        },
        updated_at: {
          bsonType: ["date", "null"],
          description: "must be a date or null"
        }
      }
    }
  }
});

// Create indexes for better query performance
db.comments.createIndex({ "article_id": 1 });  // Index for finding comments by article
db.comments.createIndex({ "user_id": 1 });     // Index for finding comments by user
db.comments.createIndex({ "created_at": -1 }); // Index for sorting by creation date 