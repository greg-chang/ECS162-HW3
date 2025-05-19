<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let value: string = '';
  export let loading: boolean = false;
  export let error: string = '';

  const dispatch = createEventDispatcher();

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    dispatch('input', target.value);
  }

  function handleSubmit() {
    if (value.trim() && !loading) {
      dispatch('submit', value);
    }
  }

  function handleCancel() {
    dispatch('cancel');
    dispatch('input', ''); // clear input
  }
</script>

<div class="add-comment">
  <input
    type="text"
    bind:value={value}
    placeholder="Share your thoughts."
    on:input={handleInput}
    disabled={loading}
    class="comment-input"
    maxlength="200"
  />
  <div class="button-row">
    <button class="cancel-btn" type="button" on:click={handleCancel} disabled={loading}>CANCEL</button>
    <button class="submit-btn" type="button" on:click={handleSubmit} disabled={loading || !value.trim()}>SUBMIT</button>
  </div>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  
</div>

<style>
  .add-comment {
    margin-bottom: 1.5rem;
  }
  .comment-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #ccc;
    border-radius: 4px;
    font-size: 1.15rem;
    margin-bottom: 0.75rem;
    box-sizing: border-box;
    outline: none;
  }
  .comment-input:focus {
    border-color: #007bff;
  }
  .button-row {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    align-items: center;
  }
  .cancel-btn {
    background: #fff;
    color: #111;
    border: 1px solid #222;
    font-weight: 700;
    border-radius: 6px;
    padding: 0.5rem 0.5rem;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .cancel-btn:disabled {
    color: #aaa;
    border-color: #ccc;
    cursor: not-allowed;
  }
  .submit-btn {
    background: #6c859e;
    color: #fff;
    border: none;
    font-weight: 700;
    border-radius: 6px;
    padding: 0.5rem 0.5em;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.15s;
  }
  .submit-btn:disabled {
    background: #b3c0cc;
    cursor: not-allowed;
  }
  .error {
    color: #dc3545;
    margin-top: 0.5rem;
  }
</style> 