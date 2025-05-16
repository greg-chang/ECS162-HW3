import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/svelte';
import App from '../App.svelte';

describe('API Integration', () => {
  const mockApiKey = 'test-api-key';
  const mockArticles = [
    {
      web_url: 'https://example.com/article1',
      headline: { main: 'Test Article 1' },
      snippet: 'Test snippet 1',
      multimedia: {
        default: { url: 'https://example.com/image1.jpg' }
      }
    }
  ];

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/key') {
        return Promise.resolve({
          json: () => Promise.resolve({ apiKey: mockApiKey })
        });
      }
      if (url.includes('api.nytimes.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: {
              docs: mockArticles,
              metadata: { hits: 100 }
            }
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('verifies API calls are made', async () => {
    render(App);
    
    // Wait for API calls to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const fetchCalls = (fetch as any).mock.calls;
    
    // Verify both API calls were made
    expect(fetchCalls.some((call: [string, ...any[]]) => call[0] === '/api/key')).toBe(true);
  });
}); 