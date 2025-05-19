export async function fetchApiKey(): Promise<string> {
  const response = await fetch('/api/key');
  const data = await response.json();
  return data.apiKey;
}

export async function fetchArticles(apiKey: string) {
  const response = await fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=${apiKey}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  const data = await response.json();
  return data.response;
} 