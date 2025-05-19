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

<div class="add-comment-root">
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
</div>
