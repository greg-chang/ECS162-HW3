<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import ArticlePopup from './components/ArticlePopup.svelte';

  let currentPage = 0;
  let isLoading = false;
  let hasMoreArticles = true;
  let errorMessage = '';
  const RESULTS_PER_PAGE = 20;
  
  interface Article {
    web_url: string;
    headline: { main: string };
    snippet: string;
    multimedia: {
      caption: string;
      credit: string;
      default: {
        url: string;
        height: number;
        width: number;
      };
      thumbnail: {
        url: string;
        height: number;
        width: number;
      };
    };
  }
  
  let articles: Article[] = [];
  let locations = ['Sacramento', 'Davis'];
  let selectedArticle: Article | null = null;
  let isPopupOpen = false;

  onMount(() => {
    fetchData();
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  function handleScroll() {
    if (isLoading || !hasMoreArticles || errorMessage) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 1000;
    
    if (scrollPosition >= threshold) {
      loadMoreArticles();
    }
  }

  async function loadMoreArticles() {
    if (isLoading || !hasMoreArticles || errorMessage) return;
    
    currentPage++;
    await fetchArticles();
  }

  async function fetchData() {
    try {
      errorMessage = '';
      // Reset state for new search
      currentPage = 0;
      articles = [];
      hasMoreArticles = true;
      
      await fetchArticles();
    } catch (error) {
      console.error('Failed to fetch data:', error);
      errorMessage = 'Failed to initialize the application. Please try refreshing the page.';
    }
  }

  async function fetchArticles() {
    if (isLoading) return;
    
    try {
      isLoading = true;
      errorMessage = '';
      
      const articlesRes = await fetch(
        `/api/articles?page=${currentPage}&${locations.map(loc => `locations=${encodeURIComponent(loc)}`).join('&')}`
      );

      if (!articlesRes.ok) {
        throw new Error(`HTTP error! status: ${articlesRes.status}`);
      }

      const data = await articlesRes.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      hasMoreArticles = data.has_more;
      if (data.articles.length > 0) {
        articles = [...articles, ...data.articles];
      }
      
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      errorMessage = 'Failed to load more articles. Please try again later.';
      hasMoreArticles = false;
    } finally {
      isLoading = false;
    }
  }

  function openArticle(article: Article) {
    selectedArticle = article;
    isPopupOpen = true;
  }

  function closePopup() {
    isPopupOpen = false;
    selectedArticle = null;
  }

</script>

<main>
    <Header />

    <section>
      <div class="container">
        {#each articles as article, i}
          <div class="column">
            <div class="section">
              <div class="section-content" on:click={() => openArticle(article)} style="cursor: pointer;">
                {#if article.multimedia && article.multimedia.default}
                  <img src={article.multimedia.default.url} alt={article.headline.main}>
                {:else}
                  <img src="/image1.png" alt="No image available">
                {/if}
                <h2>{article.headline.main}</h2>
                <p>{article.snippet}</p>
                {#if article.multimedia && article.multimedia.caption}
                  <p class="caption">{article.multimedia.caption}</p>
                {/if}
              </div>
              <hr />
            </div>
          </div>
        {/each}
      </div>
      {#if isLoading}
        <div class="loading">Loading more articles...</div>
      {/if}
      {#if errorMessage}
        <div class="error">{errorMessage}</div>
      {/if}
    </section>
</main>

<ArticlePopup isOpen={isPopupOpen} article={selectedArticle} on:close={closePopup} />

