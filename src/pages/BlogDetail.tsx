import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBlogPost, incrementViewCount } from '@/services/blogService';
import RelatedPosts from '@/components/blog/RelatedPosts';
import Navbar from '@/components/landing/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Calendar, Eye, Edit, Loader2, Menu, X, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isOwner, setIsOwner] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => getBlogPost(slug!),
    enabled: !!slug,
  });

  // Check authentication and ownership
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (user && post && post.user_id === user.id) {
        setIsOwner(true);
      }
    };

    checkAuth();
  }, [post]);

  // Increment view count when post is loaded
  useEffect(() => {
    if (post?.id) {
      incrementViewCount(post.id);
    }
  }, [post?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Draft';
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar 
          theme={theme}
          toggleTheme={toggleTheme}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isAuthenticated={isAuthenticated}
          onNavigateToDashboard={() => navigate('/dashboard')}
        />
        <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}>
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar 
          theme={theme}
          toggleTheme={toggleTheme}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isAuthenticated={isAuthenticated}
          onNavigateToDashboard={() => navigate('/dashboard')}
        />
        <div className="flex flex-col justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)', marginTop: '64px' }}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isAuthenticated={isAuthenticated}
        onNavigateToDashboard={() => navigate('/dashboard')}
      />
      
      {/* Header with Featured Image */}
      <div className="mt-16">
      {post.featured_image && (
        <div className="w-full h-[400px] overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 md:p-10">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={() => navigate(`/blog?tag=${tag.id}`)}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 italic">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author_avatar} alt={post.author_name} />
                    <AvatarFallback>{getInitials(post.author_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {post.author_name}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.view_count || 0} views
                      </span>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/dashboard/blog')}
                    className="ml-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Post
                  </Button>
                )}
              </div>

              {/* Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none mt-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>

          {/* Related Posts */}
          {post.id && <RelatedPosts postId={post.id} limit={3} />}
        </div>
      </div>
      </div>
    </div>
  );
};

export default BlogDetail;

