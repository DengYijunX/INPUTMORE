export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
  sourceName?: string;
  publishedAt?: string;
};

export interface SearchProvider {
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
}
