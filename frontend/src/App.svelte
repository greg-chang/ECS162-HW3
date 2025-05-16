<script lang="ts">
  import './app.css';
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';

  let apiKey: string = '';
  let currentPage = 0;
  let isLoading = false;
  let hasMoreArticles = true;
  let errorMessage = '';
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RATE_LIMIT_DELAY = 1000; // 1 second delay between requests
  const RESULTS_PER_PAGE = 20; // Increased from default 10 to 20
  
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

  // Helper function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch API key and articles sequentially
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
      retryCount = 0;
      // Fetch the API key
      const keyRes = await fetch('/api/key');
      const keyData = await keyRes.json();
      apiKey = keyData.apiKey;
      
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
      
      // Add delay between requests to prevent rate limiting
      await delay(RATE_LIMIT_DELAY);
      
      const locationQuery = locations
        .map(loc => `timesTag.location.contains:"${loc}"`)
        .join(' OR ');
      
      const articlesRes = await fetch(
        `https://api.nytimes.com/svc/search/v2/articlesearch.json?fq=(${locationQuery})&page=${currentPage}&api-key=${apiKey}`
      );

      if (!articlesRes.ok) {
        if (articlesRes.status === 429 && retryCount < MAX_RETRIES) {
          // Rate limit hit, wait longer and retry
          retryCount++;
          const backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, retryCount);
          await delay(backoffDelay);
          return fetchArticles();
        }
        throw new Error(`HTTP error! status: ${articlesRes.status}`);
      }

      const articlesData = await articlesRes.json();
      
      // Check if the response has the expected structure
      if (!articlesData?.response) {
        console.error('Invalid response structure:', articlesData);
        if (articlesData?.fault) {
          throw new Error(`API Error: ${articlesData.fault.faultstring || 'Unknown API error'}`);
        }
        throw new Error('Invalid API response structure');
      }

      // If docs is null, retry the request
      if (articlesData.response.docs === null && retryCount < MAX_RETRIES) {
        retryCount++;
        const backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, retryCount);
        console.log(`Retrying request (attempt ${retryCount}) after ${backoffDelay}ms delay`);
        await delay(backoffDelay);
        return fetchArticles();
      }

      // Check if we've reached the maximum number of results (1000)
      const totalHits = articlesData.response.metadata.hits;
      const currentOffset = currentPage * RESULTS_PER_PAGE;
      if (currentOffset >= 1000 || articlesData.response.docs === null || totalHits === 0) {
        hasMoreArticles = false;
        return;
      }

      const newArticles = articlesData.response.docs;
      if (newArticles.length === 0) {
        hasMoreArticles = false;
      } else {
        articles = [...articles, ...newArticles];
      }
      
      // Reset retry count on successful request
      retryCount = 0;
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      errorMessage = 'Failed to load more articles. Please try again later.';
      hasMoreArticles = false;
    } finally {
      isLoading = false;
    }
  }

  // Helper function to get the image URL from an article's multimedia
  function getArticleImage(article: Article): string {
    if (article.multimedia && article.multimedia.default) {
      return article.multimedia.default.url;
    }
    return '/image1.png'; // Fallback image
  }
</script>

<main>
    <Header {apiKey} />

    <section>
      <div class="container">
        {#each articles as article, i}
          <div class="column">
            <div class="section">
              <div class="section-content">
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

