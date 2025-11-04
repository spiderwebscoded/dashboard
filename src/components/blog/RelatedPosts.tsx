import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRelatedPosts } from '@/services/blogService';
import BlogCard from './BlogCard';
import { Loader2 } from 'lucide-react';

interface RelatedPostsProps {
  postId: string;
  limit?: number;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ postId, limit = 3 }) => {
  const { data: relatedPosts = [], isLoading } = useQuery({
    queryKey: ['related-posts', postId, limit],
    queryFn: () => getRelatedPosts(postId, limit),
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;

