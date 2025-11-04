import { supabase } from '@/lib/supabase';
import { BlogTag } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { generateSlug } from './blogService';

// Get all tags
export const getTags = async (): Promise<BlogTag[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching tags:', error);
      toast({
        title: "Error fetching tags",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTags:', error);
    throw error;
  }
};

// Create a new tag
export const createTag = async (name: string): Promise<BlogTag> => {
  try {
    const slug = generateSlug(name);

    const { data, error } = await supabase
      .from('blog_tags')
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      // Check if tag already exists
      if (error.code === '23505') { // Unique violation
        // Try to fetch the existing tag
        const { data: existingTag } = await supabase
          .from('blog_tags')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (existingTag) {
          return existingTag as BlogTag;
        }
      }
      
      console.error('Error creating tag:', error);
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    return data as BlogTag;
  } catch (error) {
    console.error('Error in createTag:', error);
    throw error;
  }
};

// Get or create tag by name
export const getOrCreateTag = async (name: string): Promise<BlogTag> => {
  try {
    const slug = generateSlug(name);

    // Try to get existing tag
    const { data: existingTag } = await supabase
      .from('blog_tags')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingTag) {
      return existingTag as BlogTag;
    }

    // Create new tag if it doesn't exist
    return await createTag(name);
  } catch (error) {
    console.error('Error in getOrCreateTag:', error);
    throw error;
  }
};

// Assign tags to a post
export const assignTagsToPost = async (postId: string, tagIds: string[]): Promise<void> => {
  try {
    console.log('Assigning tags to post:', postId, tagIds);

    // First, delete existing tag associations
    const { error: deleteError } = await supabase
      .from('blog_post_tags')
      .delete()
      .eq('post_id', postId);

    if (deleteError) {
      console.warn('Error deleting existing tags (may be expected if no tags exist):', deleteError);
      // Don't throw - this might be a new post with no existing tags
    }

    // Insert new tag associations
    if (tagIds.length > 0) {
      const postTags = tagIds.map(tagId => ({
        post_id: postId,
        tag_id: tagId
      }));

      const { error } = await supabase
        .from('blog_post_tags')
        .insert(postTags);

      if (error) {
        console.error('Error assigning tags to post:', error);
        const errorMsg = error.message || 'Failed to assign tags';
        toast({
          title: "Error assigning tags",
          description: errorMsg,
          variant: "destructive"
        });
        throw new Error(errorMsg);
      }
    }

    console.log('Tags assigned successfully');
  } catch (error) {
    console.error('Error in assignTagsToPost:', error);
    throw error;
  }
};

// Get tags for a specific post
export const getPostTags = async (postId: string): Promise<BlogTag[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select(`
        tag:blog_tags(*)
      `)
      .eq('post_id', postId);

    if (error) {
      console.error('Error fetching post tags:', error);
      throw error;
    }

    return data?.map((item: any) => item.tag).filter(Boolean) || [];
  } catch (error) {
    console.error('Error in getPostTags:', error);
    throw error;
  }
};

// Get posts by tag
export const getPostsByTag = async (tagId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('blog_post_tags')
      .select('post_id')
      .eq('tag_id', tagId);

    if (error) {
      console.error('Error fetching posts by tag:', error);
      throw error;
    }

    return data?.map(item => item.post_id) || [];
  } catch (error) {
    console.error('Error in getPostsByTag:', error);
    throw error;
  }
};

// Delete a tag (will cascade delete post associations)
export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('blog_tags')
      .delete()
      .eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error deleting tag",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Tag deleted",
      description: "The tag has been deleted successfully."
    });
  } catch (error) {
    console.error('Error in deleteTag:', error);
    throw error;
  }
};

