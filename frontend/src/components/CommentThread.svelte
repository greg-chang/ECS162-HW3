<script lang="ts">
  import CommentThread from './CommentThread.svelte';
  import AddComment from './AddComment.svelte';
  export let user: any;
  export let comment;
  export let allComments: any[] = [];
  export let onReply;
  export let onDelete;
  export let replyingTo;
  export let replyContent: string;
  export let setReplyContent: (value: string) => void;
  export let addReply: (content: string, parentUuid: string) => void;
  export let handleCancelReply: () => void;

  // Find replies to this comment
  $: replies = allComments.filter(c => c.parent_uuid === comment.uuid);
</script>

<div class="comment-thread {comment.parent_uuid ? 'reply' : ''}">
  <div class="comment">
    <div class="comment-header">
      <div class="pfp-circle">{comment.user_id[0]}</div>
      <span class="comment-username">{comment.user_id}</span>
    </div>
    <div class="comment-content">{comment.content}</div>
    <div class="comment-actions">
      <button class="reply-btn" type="button" on:click={() => onReply(comment.uuid)}>Reply</button>
      {#if user && (user.name === 'admin' || user.name === 'moderator')}
        <button class="delete-btn" type="button" on:click={() => onDelete(comment)}>Delete</button>
      {/if}
    </div>
    {#if replyingTo === comment.uuid}
      <div class="reply-form">
        <AddComment
          bind:value={replyContent}
          on:input={e => setReplyContent(e.detail)}
          on:submit={() => addReply(replyContent, comment.uuid)}
          on:cancel={handleCancelReply}
        />
      </div>
    {/if}
  </div>
  {#if replies.length}
    <div class="replies">
      {#each replies as reply}
        <CommentThread
            user={user}
            comment={reply}
            {allComments}
            {onReply}
            {onDelete}
            {replyingTo}
            {replyContent}
            {setReplyContent}
            {addReply}
            {handleCancelReply}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
.comment-thread {
  margin-bottom: 2rem;
}
.replies {
  margin-left: 2rem;
  border-left: 2px solid #eee;
  padding-left: 1rem;
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
.reply-form {
  margin-top: 1rem;
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 2px solid #eee;
}
</style>
