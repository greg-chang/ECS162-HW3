<script lang="ts">
  import { onMount } from 'svelte';

  export let articleId: string;
  
  interface Comment {
    _id: string;
    article_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at?: string;
  }

  let comments: Comment[] = [];
  let newComment = '';
  let isLoading = false;
  let error = '';

  // Clean the article ID to make it URL-safe
  function cleanArticleId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-]/g, '_');
  }

  // Format date to be more readable
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  onMount(() => {
    fetchComments();
  });

  async function fetchComments() {
    try {
      isLoading = true;
      error = '';
      const cleanId = cleanArticleId(articleId);
      const response = await fetch(`http://localhost:8000/api/articles/${cleanId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      comments = await response.json();
    } catch (e) {
      error = 'Failed to load comments';
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    
    try {
      error = '';
      const cleanId = cleanArticleId(articleId);
      const response = await fetch(`http://localhost:8000/api/articles/${cleanId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          user_id: 'anonymous' // TODO: Replace with actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const comment = await response.json();
      comments = [comment, ...comments]; // Add new comment at the beginning
      newComment = '';
    } catch (e) {
      error = 'Failed to add comment';
      console.error(e);
    }
  }

  async function deleteComment(commentId: string) {
    try {
      error = '';
      const response = await fetch(`http://localhost:8000/api/comments/${encodeURIComponent(commentId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      comments = comments.filter(c => c._id !== commentId);
    } catch (e: any) {
      error = e.message || 'Failed to delete comment';
      console.error('Delete error:', e);
    }
  }
</script>

<div class="comments-section">
  <h3>Comments</h3>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="add-comment">
    <textarea
      bind:value={newComment}
      placeholder="Write a comment..."
      rows="3"
    ></textarea>
    <button on:click={addComment} disabled={isLoading || !newComment.trim()}>
      Post Comment
    </button>
  </div>

  {#if isLoading}
    <div class="loading">Loading comments...</div>
  {:else if comments.length === 0}
    <p class="no-comments">No comments yet. Be the first to comment!</p>
  {:else}
    <div class="comments-list">
      {#each comments as comment, index (comment._id || index)}
        <div class="comment">
          <div class="comment-content">
            <p>{comment.content}</p>
            <small class="comment-meta">
              Posted by {comment.user_id} • {formatDate(comment.created_at)}
              {#if comment.updated_at}
                <span class="edited">(edited)</span>
              {/if}
            </small>
          </div>
          <button class="delete-btn" on:click={() => deleteComment(comment._id)}>
            Delete
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .comments-section {
    margin-top: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 8px;
  }

  .add-comment {
    margin-bottom: 1rem;
  }

  textarea {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
  }

  button {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .comment {
    background: white;
    padding: 1rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .comment-content {
    flex: 1;
  }

  .comment-meta {
    color: #666;
    font-size: 0.9rem;
    display: block;
    margin-top: 0.5rem;
  }

  .edited {
    color: #999;
    font-style: italic;
  }

  .delete-btn {
    background: #dc3545;
    margin-left: 1rem;
  }

  .error {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    color: #666;
  }

  .no-comments {
    text-align: center;
    color: #666;
    font-style: italic;
  }
</style> 