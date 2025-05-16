import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import App from '../App.svelte';

describe('Article Display', () => {
  const mockArticle = {
    web_url: 'https://example.com/article1',
    headline: { main: 'Test Article 1' },
    snippet: 'Test snippet 1',
    multimedia: {
      caption: 'Test caption',
      credit: 'Test credit',
      default: {
        url: 'https://example.com/image1.jpg',
        height: 100,
        width: 100
      },
      thumbnail: {
        url: 'https://example.com/image1-thumb.jpg',
        height: 50,
        width: 50
      }
    }
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/key') {
        return Promise.resolve({
          json: () => Promise.resolve({ apiKey: 'test-key' })
        });
      }
      if (url.includes('api.nytimes.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: {
              docs: [mockArticle],
              metadata: { hits: 100 }
            }
          })
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  it('displays article headline', async () => {
    render(App);
    await screen.findByText('Loading more articles...');
    const headline = await screen.findByText('Test Article 1');
    expect(headline).toBeTruthy();
  });

  it('displays article snippet', async () => {
    render(App);
    await screen.findByText('Loading more articles...');
    const snippet = await screen.findByText('Test snippet 1');
    expect(snippet).toBeTruthy();
  });

  it('displays article image', async () => {
    render(App);
    await screen.findByText('Loading more articles...');
    const image = await screen.findByAltText('Test Article 1');
    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('https://example.com/image1.jpg');
  });

  it('displays image caption when available', async () => {
    render(App);
    await screen.findByText('Loading more articles...');
    const captions = await screen.findAllByText('Test caption');
    expect(captions.length).toBeGreaterThan(0);
    expect(captions[0]).toBeTruthy();
  });
});

describe('Loading States', () => {
  it('shows loading message while fetching articles', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          json: () => Promise.resolve({ apiKey: 'test-key' })
        }), 100)
      )
    );

    render(App);
    const loadingMessage = await screen.findByText('Loading more articles...');
    expect(loadingMessage).toBeTruthy();
  });
});

describe('Error States', () => {
  it('displays error message when API fails', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.reject(new Error('API Error'))
    );

    render(App);
    const errorMessage = await screen.findByText('Failed to initialize the application. Please try refreshing the page.');
    expect(errorMessage).toBeTruthy();
  });
});

describe('Scroll Behavior', () => {
  it('loads more articles when scrolling near bottom', async () => {
    let page = 0;
    const mockArticles = Array(20).fill({
      web_url: 'https://example.com/article',
      headline: { main: 'Test Article' },
      snippet: 'Test snippet',
      multimedia: {
        caption: 'Test caption',
        credit: 'Test credit',
        default: {
          url: 'https://example.com/image.jpg',
          height: 100,
          width: 100
        },
        thumbnail: {
          url: 'https://example.com/image-thumb.jpg',
          height: 50,
          width: 50
        }
      }
    });

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/key') {
        return Promise.resolve({
          json: () => Promise.resolve({ apiKey: 'test-key' })
        });
      }
      if (url.includes('api.nytimes.com')) {
        const response = {
          ok: true,
          json: () => Promise.resolve({
            response: {
              docs: mockArticles,
              metadata: { hits: 100 }
            }
          })
        };
        page++;
        return Promise.resolve(response);
      }
      return Promise.reject(new Error('Not found'));
    });

    render(App);
    
    await screen.findByText('Loading more articles...');
    const initialArticles = await screen.findAllByText('Test Article');
    expect(initialArticles.length).toBe(20);
    
    Object.defineProperty(window, 'innerHeight', { value: 1000 });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000 });
    Object.defineProperty(window, 'scrollY', { value: 900 });
    
    fireEvent.scroll(window);
    
    await screen.findByText('Loading more articles...');
    const updatedArticles = await screen.findAllByText('Test Article');
    expect(updatedArticles.length).toBe(20);
  });
}); 