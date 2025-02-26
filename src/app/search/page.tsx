'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  score: number;
  updatedAt: string;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<
    'all' | 'document' | 'outline'
  >('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'title'>(
    'relevance'
  );

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, selectedType, selectedTags, sortBy]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('q', query);
      if (selectedType !== 'all') {
        params.set('type', selectedType);
      }
      selectedTags.forEach((tag) => params.append('tags[]', tag));
      params.set('sortBy', sortBy);

      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 via-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-background/50 border-b border-border/50 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
            Search Notes
          </h1>
          <p className="text-sm text-muted-foreground">
            Search across your entire knowledge base
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-64 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Note Type
            </h3>
            <div className="space-y-2">
              {['all', 'document', 'outline'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as typeof selectedType)}
                  className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                    selectedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Sort By
            </h3>
            <div className="space-y-2">
              {['relevance', 'date', 'title'].map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort as typeof sortBy)}
                  className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                    sortBy === sort
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/10'
                  }`}>
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full px-4 py-2 rounded-lg bg-background/50 border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/80">
                Search
              </button>
            </div>
          </form>

          {/* Results */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent" />
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleNoteClick(result.id)}
                  className="p-4 rounded-lg border border-border/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  <h3 className="text-lg font-medium mb-2">{result.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.excerpt}
                  </p>
                  <div className="flex items-center gap-2">
                    {result.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
