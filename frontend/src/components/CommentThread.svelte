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
<div class="comment-thread-root">

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
      {#if !comment.parent_uuid}
        <hr class="comment-divider" />
      {/if}
    </div>
</div>
