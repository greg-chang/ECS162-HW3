<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import AddComment from './AddComment.svelte';

  export let isOpen: boolean;
  export let article: any;

  const dispatch = createEventDispatcher();

  function closePopup() {
    dispatch('close');
  }

  // Comments logic (moved from Comments.svelte)
  interface Comment {
    _id?: string;
    uuid: string;
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

  function cleanArticleId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-]/g, '_');
  }

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

  $: if (isOpen && article) {
    fetchComments();
  }

  async function fetchComments() {
    if (!article?._id) return;
    try {
      isLoading = true;
      error = '';
      const cleanId = cleanArticleId(article._id);
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
      const cleanId = cleanArticleId(article._id);
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
      comments = [comment, ...comments];
      newComment = '';
    } catch (e) {
      error = 'Failed to add comment';
      console.error(e);
    }
  }

  async function deleteComment(comment: Comment) {
    try {
      error = '';
      const response = await fetch(`http://localhost:8000/api/comments/${encodeURIComponent(comment.uuid)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      comments = comments.filter(c => c.uuid !== comment.uuid);
    } catch (e: any) {
      error = e.message || 'Failed to delete comment';
      console.error('Delete error:', e);
    }
  }
</script>
<div class="article-popup-root">
    {#if isOpen && article}
    <div class="popup-overlay" on:click={closePopup}>
      <div class="popup-panel slide-in" on:click|stopPropagation>
        <div class="popup-header">
          <div class="popup-title" title={article.headline.main}>
            {article.headline.main}
          </div>
          <button class="close-button" on:click={closePopup}>x</button>
        </div>
        <hr class="popup-divider" />
        <div class="comments-header">
            <span class="comments-title">Comments</span>
            <span class="comments-count">{comments.length}</span>
        </div>
        <div class="comments-section">
          {#if error && !isLoading}
            <div class="error">{error}</div>
          {/if}
          <AddComment
            bind:value={newComment}
            loading={isLoading}
            error={error && !isLoading ? error : ''}
            on:submit={() => addComment()}
          />
          {#if isLoading}
            <div class="loading">Loading comments...</div>
          {:else if comments.length === 0}
            <p class="no-comments">No comments yet. Be the first to comment!</p>
          {:else}
            <div class="comments-list">
              {#each comments as comment, index (comment.uuid || index)}
                <div class="comment">
                  <div class="comment-header">
                    <div class="pfp-circle">a</div>
                    <span class="comment-username">{comment.user_id}</span>
                  </div>
                  <div class="comment-content">{comment.content}</div>
                  <div class="comment-actions">
                    <button class="reply-btn" type="button" on:click={() => console.log('hello')}>Reply</button>
                    <button class="delete-btn" type="button" on:click={() => deleteComment(comment)}>Delete</button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>


<style lang="scss">
.article-popup-root {
  font-family: Arial, Helvetica, sans-serif;

  // Optionally, override for headings, etc.
  h1, h2, h3, .comments-title {
    font-family: Arial, Helvetica, sans-serif;
  }
}


.comments-title {
  font-size: 2rem;
  font-weight: bold;
  padding-bottom: 1rem;
}

.comment-content {
  font-size: 1.1rem;
}
.comments-count {
  font-size: 1.75rem;
}
.popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  /* Keep overlay, but don't center content */
}

.popup-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 100vw;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  z-index: 1001;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  border-radius: 0;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
  display: flex;
  flex-direction: column;
}

.popup-title {
  font-size: 2rem;
  font-weight: bold;
  padding-bottom: 1rem;
}

.slide-in {
  transform: translateX(0);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.article-content {
  margin-bottom: 2rem;
}

img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.caption {
  font-style: italic;
  color: #666;
  font-size: 0.9rem;
}

.read-more {
  display: inline-block;
  margin-top: 1rem;
  color: #007bff;
  text-decoration: none;
}

.read-more:hover {
  text-decoration: underline;
}

.article-title {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.2;
}

.comments-divider {
  margin: 2rem 0 1rem 0;
  border: none;
  border-top: 1px solid #eee;
}

.comment {
  margin-bottom: 2rem;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
}
.pfp-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #bbb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.comment-username {
  font-weight: bold;
  font-size: 1.25rem;
  color: #111;
}
.comment-content {
  margin-bottom: 0.5rem;
  word-break: break-word;
}
.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}
.reply-btn {
  background: none;
  border: none;
  color: #6c859e;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
}
.reply-btn:hover {
  text-decoration: underline;
}
.delete-btn {
  background: none;
  border: none;
  color: #666;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  transition: color 0.15s;
}
.delete-btn:hover {
  text-decoration: underline;
  color: #222;
}
</style> 