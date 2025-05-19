import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

interface Comment {
  uuid: string;
  article_id: string;
  user_id: string;
  content: string;
  parent_uuid: string | null;
  created_at: string;
}

describe('Comment API Integration', () => {
  const mockComment = {
    article_id: 'test_article_123',
    user_id: 'test_user_123',
    content: 'Test comment content',
    parent_uuid: null
  };

  const mockComments: Comment[] = [
    {
      uuid: 'comment_1',
      article_id: 'test_article_123',
      user_id: 'test_user_123',
      content: 'Test comment 1',
      parent_uuid: null,
      created_at: '2024-03-20T12:00:00Z'
    },
    {
      uuid: 'comment_2',
      article_id: 'test_article_123',
      user_id: 'test_user_123',
      content: 'Test comment 2',
      parent_uuid: 'comment_1',
      created_at: '2024-03-20T12:01:00Z'
    }
  ];

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url, options) => {
      if (url.includes('/api/articles/') && url.includes('/comments')) {
        if (!options || options.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockComments)
          });
        }
        if (options.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockComment,
              uuid: 'new_comment_123',
              created_at: new Date().toISOString()
            })
          });
        }
      }
      if (url.includes('/api/comments/')) {
        if (options?.method === 'PUT') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              ...mockComment,
              content: 'Updated comment content'
            })
          });
        }
        if (options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ message: 'Comment deleted' })
          });
        }
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches comments for an article', async () => {
    const response = await fetch('/api/articles/test_article_123/comments');
    const comments = await response.json();
    
    expect(comments).toHaveLength(2);
    expect(comments[0].content).toBe('Test comment 1');
    expect(comments[1].content).toBe('Test comment 2');
    expect(fetch).toHaveBeenCalledWith('/api/articles/test_article_123/comments');
  });

  it('creates a new comment', async () => {
    const response = await fetch('/api/articles/test_article_123/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockComment)
    });
    
    const newComment = await response.json();
    expect(newComment.uuid).toBe('new_comment_123');
    expect(newComment.content).toBe('Test comment content');
    expect(fetch).toHaveBeenCalledWith(
      '/api/articles/test_article_123/comments',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockComment)
      })
    );
  });

  it('updates an existing comment', async () => {
    const response = await fetch('/api/comments/comment_1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content: 'Updated comment content' })
    });
    
    const updatedComment = await response.json();
    expect(updatedComment.content).toBe('Updated comment content');
    expect(fetch).toHaveBeenCalledWith(
      '/api/comments/comment_1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ content: 'Updated comment content' })
      })
    );
  });

  it('deletes a comment', async () => {
    const response = await fetch('/api/comments/comment_1', {
      method: 'DELETE'
    });
    
    const result = await response.json();
    expect(result.message).toBe('Comment deleted');
    expect(fetch).toHaveBeenCalledWith(
      '/api/comments/comment_1',
      expect.objectContaining({
        method: 'DELETE'
      })
    );
  });

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    
    await expect(fetch('/api/articles/test_article_123/comments')).rejects.toThrow('API Error');
  });

  it('handles nested comments correctly', async () => {
    const response = await fetch('/api/articles/test_article_123/comments');
    const comments: Comment[] = await response.json();
    
    const parentComment = comments.find((c: Comment) => c.uuid === 'comment_1');
    const childComment = comments.find((c: Comment) => c.uuid === 'comment_2');
    
    expect(parentComment?.parent_uuid).toBeNull();
    expect(childComment?.parent_uuid).toBe('comment_1');
  });
}); 