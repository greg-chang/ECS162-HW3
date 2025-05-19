<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import AddComment from './AddComment.svelte';
  import CommentThread from './CommentThread.svelte';

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
    parent_uuid?: string;
  }

  let comments: Comment[] = [];
  let newComment = '';
  let replyContent = '';  // Separate variable for reply content
  let isLoading = false;
  let error = '';
  let replyingTo: string | null = null;  // Store the UUID of the comment being replied to
  let user: any = null;

  function cleanArticleId(id: string): string {
    return id.replace(/[^a-zA-Z0-9-]/g, '_');
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
      console.log(comments);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          user_id: user?.name || user?.email || 'anonymous',
        }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      newComment = '';
      await fetchComments();
    } catch (e) {
      error = 'Failed to add comment';
      console.error(e);
    }
  }

  async function addReply(content: string, parentUuid: string) {
    if (!content.trim() || !parentUuid) return;
    try {
      error = '';
      const cleanId = cleanArticleId(article._id);
      const response = await fetch(`http://localhost:8000/api/articles/${cleanId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          user_id: 'anonymous',
          parent_uuid: parentUuid
        }),
      });
      if (!response.ok) throw new Error('Failed to add reply');
      replyContent = '';
      replyingTo = null;
      await fetchComments();
    } catch (e) {
      error = 'Failed to add reply';
      console.error(e);
    }
  }

  function handleReply(commentUuid: string) {
    replyingTo = commentUuid;
    replyContent = '';  // Clear any previous reply content
  }

  function handleCancelReply() {
    replyingTo = null;
    replyContent = '';
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
      await fetchComments();
    } catch (e: any) {
      error = e.message || 'Failed to delete comment';
      console.error('Delete error:', e);
    }
  }

  onMount(() => {
    fetch('http://localhost:8000/api/me', {
      credentials: 'include'
    })
      .then(async (res) => {
        if (res.ok) {
          user = await res.json();
          console.log(user);
        } else {
          user = null;
        }
      })
      .catch(() => {
        user = null;
      });
  });
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
              {#each comments.filter(c => !c.parent_uuid) as comment}
                <CommentThread
                  comment={comment}
                  allComments={comments}
                  onReply={handleReply}
                  onDelete={deleteComment}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={val => replyContent = val}
                  addReply={addReply}
                  handleCancelReply={handleCancelReply}
                  user={user}
                >
                  {#if user && (user.name === 'admin' || user.name === 'moderator')}
                    <button class="delete-btn" type="button" on:click={() => deleteComment(comment)}>Delete</button>
                  {/if}
                </CommentThread>
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

</style> 