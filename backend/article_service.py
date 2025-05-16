import os
import requests
import time
from typing import List, Dict, Any, Optional

class ArticleService:
    def __init__(self):
        self.api_key = os.getenv('NYT_API_KEY')
        self.base_url = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
        self.rate_limit_delay = 1  # 1 second delay between requests
        self.max_retries = 3
        self.results_per_page = 20
        self.max_results = 1000

    def _delay(self, ms: int) -> None:
        """Helper function to delay execution"""
        time.sleep(ms / 1000)  # Convert ms to seconds

    def fetch_articles(self, page: int = 0, locations: List[str] = None) -> Dict[str, Any]:
        """
        Fetch articles with pagination, retry logic, and error handling
        Returns a dictionary containing articles and metadata
        """
        if locations is None:
            locations = ['Sacramento', 'Davis']

        location_query = ' OR '.join([f'timesTag.location.contains:"{loc}"' for loc in locations])
        
        params = {
            'fq': f'({location_query})',
            'page': page,
            'api-key': self.api_key
        }

        retry_count = 0
        while retry_count < self.max_retries:
            try:
                # Add delay between requests to prevent rate limiting
                self._delay(self.rate_limit_delay)
                
                response = requests.get(self.base_url, params=params)
                response.raise_for_status()
                data = response.json()

                if not data.get('response'):
                    raise ValueError('Invalid API response structure')

                if data['response'].get('docs') is None and retry_count < self.max_retries:
                    retry_count += 1
                    continue

                # Check if we've reached the maximum number of results
                total_hits = data['response']['metadata']['hits']
                current_offset = page * self.results_per_page
                
                if current_offset >= self.max_results or data['response']['docs'] is None or total_hits == 0:
                    return {
                        'articles': [],
                        'has_more': False,
                        'total_hits': total_hits
                    }

                return {
                    'articles': data['response']['docs'],
                    'has_more': len(data['response']['docs']) > 0,
                    'total_hits': total_hits
                }

            except requests.exceptions.RequestException as e:
                if retry_count < self.max_retries:
                    retry_count += 1
                    # Exponential backoff
                    backoff_delay = self.rate_limit_delay * (2 ** retry_count)
                    self._delay(backoff_delay)
                    continue
                raise e

        raise Exception('Failed to fetch articles after maximum retries') 