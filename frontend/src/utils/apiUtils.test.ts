import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchArticles, fetchApiKey } from './apiUtils';

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
      if (url === '/api/me') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: {
              id: '123',
              username: 'testuser',
              email: 'test@example.com'
            }
          })
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

  it('fetches API key successfully', async () => {
    const result = await fetchApiKey();
    expect(result).toBe(mockApiKey);
    expect(fetch).toHaveBeenCalledWith('/api/key');
  });

  it('fetches articles successfully', async () => {
    const result = await fetchArticles(mockApiKey);
    expect(result.docs).toEqual(mockArticles);
    expect(result.metadata.hits).toBe(100);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('api.nytimes.com'));
  });

  it('handles API errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    await expect(fetchArticles(mockApiKey)).rejects.toThrow('API Error');
  });

  it('fetches user data from /api/me', async () => {
    const response = await fetch('/api/me');
    const data = await response.json();
    
    expect(data.user).toBeDefined();
    expect(data.user.id).toBe('123');
    expect(data.user.username).toBe('testuser');
    expect(data.user.email).toBe('test@example.com');
    expect(fetch).toHaveBeenCalledWith('/api/me');
  });

  it('handles /api/me errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));
    await expect(fetch('/api/me')).rejects.toThrow('API Error');
  });
}); 