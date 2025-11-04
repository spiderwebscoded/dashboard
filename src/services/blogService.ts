import { supabase } from '@/lib/supabase';
import { BlogPost, BlogTag } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export interface BlogPostFilters {
  status?: 'draft' | 'published' | 'archived';
  tagId?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'most_viewed';
  limit?: number;
  offset?: number;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_name: string;
  author_avatar?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featured_image?: string;
  author_name?: string;
  author_avatar?: string;
  status?: 'draft' | 'published' | 'archived';
  published_at?: string;
}

// Helper function to generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .substring(0, 100); // Limit length
};

// Get all blog posts with optional filters
export const getBlogPosts = async (filters?: BlogPostFilters): Promise<BlogPost[]> => {
  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default to published posts for public view
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        query = query.eq('status', 'published');
      }
    }

    if (filters?.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,excerpt.ilike.%${filters.searchQuery}%`);
    }

    if (filters?.tagId) {
      // Filter by tag through junction table
      const { data: postIds } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .eq('tag_id', filters.tagId);
      
      if (postIds && postIds.length > 0) {
        const ids = postIds.map(p => p.post_id);
        query = query.in('id', ids);
      } else {
        return []; // No posts with this tag
      }
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'oldest':
        query = query.order('published_at', { ascending: true, nullsFirst: false });
        break;
      case 'most_viewed':
        query = query.order('view_count', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('published_at', { ascending: false, nullsFirst: false });
        break;
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error fetching blog posts",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Transform the nested tags structure
    const posts = data?.map(post => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || []
    })) || [];

    return posts as BlogPost[];
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    throw error;
  }
};

// Get a single blog post by slug
export const getBlogPost = async (slug: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching blog post:', error);
      toast({
        title: "Error fetching blog post",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    // Transform the nested tags structure
    const post = {
      ...data,
      tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || []
    };

    return post as BlogPost;
  } catch (error) {
    console.error('Error in getBlogPost:', error);
    throw error;
  }
};

// Get a single blog post by ID
export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching blog post:', error);
      throw error;
    }

    const post = {
      ...data,
      tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || []
    };

    return post as BlogPost;
  } catch (error) {
    console.error('Error in getBlogPostById:', error);
    throw error;
  }
};

// Create a new blog post
export const createBlogPost = async (input: CreateBlogPostInput): Promise<BlogPost> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const errorMsg = 'User not authenticated. Please log in and try again.';
      toast({
        title: "Authentication Required",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }

    // Validate required fields
    if (!input.title || !input.slug || !input.content || !input.author_name) {
      const errorMsg = 'Missing required fields. Please fill in title, slug, content, and author name.';
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }

    // Set published_at if status is published and not provided
    const postData = {
      ...input,
      user_id: user.id,
      published_at: input.status === 'published' && !input.published_at 
        ? new Date().toISOString() 
        : input.published_at
    };

    console.log('Creating blog post with data:', postData);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating blog post:', error);
      const errorMsg = error.message || 'Failed to create blog post';
      toast({
        title: "Error creating blog post",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }

    if (!data) {
      const errorMsg = 'No data returned from database';
      toast({
        title: "Error creating blog post",
        description: errorMsg,
        variant: "destructive"
      });
      throw new Error(errorMsg);
    }

    toast({
      title: "Blog post created",
      description: `"${input.title}" has been created successfully.`
    });

    return data as BlogPost;
  } catch (error) {
    console.error('Error in createBlogPost:', error);
    // Re-throw to let the mutation handle it
    throw error;
  }
};

// Update a blog post
export const updateBlogPost = async (id: string, input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // If changing to published status and no published_at, set it
    const updateData = { ...input };
    if (input.status === 'published' && !input.published_at) {
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single();
      
      if (!existingPost?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error updating blog post",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Blog post updated",
      description: `"${data.title}" has been updated successfully.`
    });

    return data as BlogPost;
  } catch (error) {
    console.error('Error in updateBlogPost:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlogPost = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error deleting blog post",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Blog post deleted",
      description: "The blog post has been deleted successfully."
    });
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    throw error;
  }
};

// Increment view count
export const incrementViewCount = async (id: string): Promise<void> => {
  try {
    // Get current view count
    const { data: post } = await supabase
      .from('blog_posts')
      .select('view_count')
      .eq('id', id)
      .single();

    if (post) {
      await supabase
        .from('blog_posts')
        .update({ view_count: (post.view_count || 0) + 1 })
        .eq('id', id);
    }
  } catch (error) {
    // Silent fail for view count - not critical
    console.warn('Error incrementing view count:', error);
  }
};

// Get related posts by shared tags
export const getRelatedPosts = async (postId: string, limit: number = 5): Promise<BlogPost[]> => {
  try {
    // First, get the current post's tags
    const { data: currentPost } = await supabase
      .from('blog_posts')
      .select(`
        tags:blog_post_tags(
          tag_id
        )
      `)
      .eq('id', postId)
      .single();

    if (!currentPost || !currentPost.tags || currentPost.tags.length === 0) {
      return [];
    }

    const tagIds = currentPost.tags.map((t: any) => t.tag_id);

    // Get posts that share tags
    const { data: relatedPostIds } = await supabase
      .from('blog_post_tags')
      .select('post_id')
      .in('tag_id', tagIds)
      .neq('post_id', postId);

    if (!relatedPostIds || relatedPostIds.length === 0) {
      return [];
    }

    // Count shared tags for each related post
    const postTagCounts: { [key: string]: number } = {};
    relatedPostIds.forEach(({ post_id }) => {
      postTagCounts[post_id] = (postTagCounts[post_id] || 0) + 1;
    });

    // Get unique post IDs
    const uniquePostIds = Object.keys(postTagCounts);

    // Fetch the related posts
    const { data: relatedPosts, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `)
      .in('id', uniquePostIds)
      .eq('status', 'published')
      .limit(limit * 2); // Get more to sort by relevance

    if (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }

    // Transform and sort by relevance
    const posts = relatedPosts?.map(post => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || [],
      sharedTagCount: postTagCounts[post.id] || 0
    })) || [];

    // Sort by shared tag count (descending), then by published date (descending)
    posts.sort((a, b) => {
      if (b.sharedTagCount !== a.sharedTagCount) {
        return b.sharedTagCount - a.sharedTagCount;
      }
      return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
    });

    return posts.slice(0, limit) as BlogPost[];
  } catch (error) {
    console.error('Error in getRelatedPosts:', error);
    return [];
  }
};

// Get user's own blog posts (including drafts)
export const getMyBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        tags:blog_post_tags(
          tag:blog_tags(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my blog posts:', error);
      toast({
        title: "Error fetching your blog posts",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    const posts = data?.map(post => ({
      ...post,
      tags: post.tags?.map((t: any) => t.tag).filter(Boolean) || []
    })) || [];

    return posts as BlogPost[];
  } catch (error) {
    console.error('Error in getMyBlogPosts:', error);
    throw error;
  }
};

