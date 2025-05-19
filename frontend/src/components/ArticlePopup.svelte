<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Comments from './Comments.svelte';

  export let isOpen: boolean;
  export let article: any;

  const dispatch = createEventDispatcher();

  function closePopup() {
    dispatch('close');
  }
</script>

{#if isOpen && article}
  <div class="popup-overlay" on:click={closePopup}>
    <div class="popup-content" on:click|stopPropagation>
      <button class="close-button" on:click={closePopup}>×</button>
      
      <div class="article-content">
        <h2>{article.headline.main}</h2>
        {#if article.multimedia && article.multimedia.default}
          <img src={article.multimedia.default.url} alt={article.headline.main}>
        {/if}
        <p>{article.snippet}</p>
        {#if article.multimedia && article.multimedia.caption}
          <p class="caption">{article.multimedia.caption}</p>
        {/if}
        <a href={article.web_url} target="_blank" rel="noopener noreferrer" class="read-more">
          Read full article
        </a>
      </div>

      <Comments articleId={article._id} />
    </div>
  </div>
{/if}

<style>
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .popup-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
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
</style> 