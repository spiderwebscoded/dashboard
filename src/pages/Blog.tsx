import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPosts } from '@/services/blogService';
import { getTags } from '@/services/blogTagService';
import BlogCard from '@/components/blog/BlogCard';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2, Menu, X as CloseIcon, Sun, Moon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

const Blog = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | undefined>(
    searchParams.get('tag') || undefined
  );
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_viewed'>('newest');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Fetch blog posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['blog-posts', searchQuery, selectedTagId, sortBy],
    queryFn: () => getBlogPosts({
      searchQuery: searchQuery || undefined,
      tagId: selectedTagId,
      sortBy,
      status: 'published',
    }),
  });

  // Fetch tags
  const { data: tags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: getTags,
  });

  const selectedTag = tags.find(t => t.id === selectedTagId);

  const handleTagSelect = (tagId: string) => {
    setSelectedTagId(tagId === 'all' ? undefined : tagId);
    if (tagId === 'all') {
      searchParams.delete('tag');
    } else {
      searchParams.set('tag', tagId);
    }
    setSearchParams(searchParams);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTagId(undefined);
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isAuthenticated={isAuthenticated}
        onNavigateToDashboard={() => navigate('/dashboard')}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog & Updates</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Insights, tutorials, and updates from our team
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="pl-9 bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tag Filter */}
            <Select value={selectedTagId || 'all'} onValueChange={handleTagSelect}>
              <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_viewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            {/* New Post Button (for authenticated users) */}
            {isAuthenticated && (
              <Button
                onClick={() => navigate('/dashboard/blog')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Manage Posts
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {(selectedTag || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {selectedTag && (
                <Badge variant="secondary" className="gap-1">
                  {selectedTag.name}
                  <button onClick={() => handleTagSelect('all')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {postsLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        )}

        {/* Posts Grid */}
        {!postsLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!postsLoading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || selectedTag
                ? 'Try adjusting your filters'
                : 'No blog posts have been published yet'}
            </p>
            {(searchQuery || selectedTag) && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;

