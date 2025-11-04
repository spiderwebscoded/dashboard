import React, { useState, useEffect } from 'react';
import { BlogPost, BlogTag } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { generateSlug } from '@/services/blogService';
import { getTags, getOrCreateTag } from '@/services/blogTagService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface BlogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BlogFormData, tagIds: string[]) => Promise<void>;
  post?: BlogPost | null;
  isLoading?: boolean;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_name: string;
  author_avatar: string;
  status: 'draft' | 'published' | 'archived';
}

const BlogForm: React.FC<BlogFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  post,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    author_name: '',
    author_avatar: '',
    status: 'draft',
  });

  const [selectedTags, setSelectedTags] = useState<BlogTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Fetch all tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: getTags,
  });

  // Load user info for default author info
  useEffect(() => {
    const loadUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !post) {
        // Use email as author name by default (user can edit it)
        const defaultName = user.email?.split('@')[0] || 'Anonymous';
        setFormData(prev => ({
          ...prev,
          author_name: defaultName,
          author_avatar: '',
        }));
      }
    };

    if (open) {
      loadUserInfo();
    }
  }, [open, post]);

  // Load post data when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image || '',
        author_name: post.author_name,
        author_avatar: post.author_avatar || '',
        status: post.status,
      });
      setSelectedTags(post.tags || []);
      setAutoSlug(false);
    } else if (open) {
      // Reset form for new post
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author_name: formData.author_name, // Preserve author info
        author_avatar: formData.author_avatar,
        status: 'draft',
      });
      setSelectedTags([]);
      setAutoSlug(true);
    }
  }, [post, open]);

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: autoSlug ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSlugChange = (slug: string) => {
    setAutoSlug(false);
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const tag = await getOrCreateTag(newTagName.trim());
      if (!selectedTags.find(t => t.id === tag.id)) {
        setSelectedTags(prev => [...prev, tag]);
      }
      setNewTagName('');
    } catch (error) {
      console.error('Error adding tag:', error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId));
  };

  const handleSelectExistingTag = (tagId: string) => {
    const tag = availableTags.find(t => t.id === tagId);
    if (tag && !selectedTags.find(t => t.id === tag.id)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    const submitData = {
      ...formData,
      status,
    };

    const tagIds = selectedTags.map(t => t.id);
    await onSubmit(submitData, tagIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          <DialogDescription>
            {post ? 'Update your blog post details below' : 'Fill in the details to create a new blog post'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              URL Slug * {autoSlug && <span className="text-xs text-gray-500">(auto-generated)</span>}
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="url-friendly-slug"
              required
            />
            <p className="text-xs text-gray-500">
              Preview: /blog/{formData.slug || 'your-post-slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of your post (shown in cards)"
              rows={3}
            />
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label htmlFor="featured_image">Featured Image URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            {formData.featured_image && (
              <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
                <img
                  src={formData.featured_image}
                  alt="Preview"
                  className="max-w-full h-auto max-h-40 mx-auto rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect fill="%23ddd" width="200" height="120"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tag => (
                <Badge key={tag.id} variant="secondary" className="gap-1">
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Add new tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTagName.trim() || isCreatingTag}
              >
                {isCreatingTag ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>

            {availableTags.length > 0 && (
              <Select onValueChange={handleSelectExistingTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Or select existing tag" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags
                    .filter(tag => !selectedTags.find(t => t.id === tag.id))
                    .map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Author Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author_name">Author Name *</Label>
              <Input
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author_avatar">Author Avatar URL</Label>
              <Input
                id="author_avatar"
                value={formData.author_avatar}
                onChange={(e) => setFormData(prev => ({ ...prev, author_avatar: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
              placeholder="Write your blog post content here..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={isLoading || !formData.title || !formData.slug || !formData.content}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isLoading || !formData.title || !formData.slug || !formData.content}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {post?.status === 'published' ? 'Update' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogForm;

