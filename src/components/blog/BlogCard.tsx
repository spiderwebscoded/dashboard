import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPost } from '@/types/database';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface BlogCardProps {
  post: BlogPost;
  onClick?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/blog/${post.slug}`);
    }
  };

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
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col"
      onClick={handleClick}
    >
      {/* Featured Image */}
      {post.featured_image ? (
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225"%3E%3Crect fill="%23e5e7eb" width="400" height="225"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="18"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div className="text-white text-4xl font-bold opacity-50">
            {getInitials(post.title)}
          </div>
        </div>
      )}

      <CardHeader className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags?.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/blog?tag=${tag.id}`);
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {post.tags && post.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{post.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        
        {post.excerpt && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </CardHeader>

      <CardFooter className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author_avatar} alt={post.author_name} />
            <AvatarFallback className="text-xs">
              {getInitials(post.author_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {post.author_name}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(post.published_at)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Eye className="h-3 w-3" />
          <span>{post.view_count || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;

