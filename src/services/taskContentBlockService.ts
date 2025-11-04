import { supabase } from '@/lib/supabase';

export interface TaskContentBlock {
  id: string;
  task_id: string;
  user_id: string;
  type: 'text' | 'heading' | 'heading2' | 'checklist' | 'code' | 'quote' | 'image' | 'link' | 'list';
  content: string;
  metadata: {
    checked?: boolean;
    items?: Array<{ id: string; text: string; checked?: boolean }>;
    language?: string;
    url?: string;
  };
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskContentBlockInput {
  task_id: string;
  type: TaskContentBlock['type'];
  content: string;
  metadata?: TaskContentBlock['metadata'];
  position: number;
}

export interface UpdateTaskContentBlockInput {
  type?: TaskContentBlock['type'];
  content?: string;
  metadata?: TaskContentBlock['metadata'];
  position?: number;
}

// Get all content blocks for a task
export const getTaskContentBlocks = async (taskId: string): Promise<TaskContentBlock[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('task_content_blocks')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching task content blocks:', error);
      throw new Error(`Failed to fetch content blocks: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTaskContentBlocks:', error);
    throw error;
  }
};

// Create a new content block
export const createTaskContentBlock = async (
  input: CreateTaskContentBlockInput
): Promise<TaskContentBlock> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('task_content_blocks')
      .insert({
        user_id: user.id,
        task_id: input.task_id,
        type: input.type,
        content: input.content,
        metadata: input.metadata || {},
        position: input.position,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task content block:', error);
      throw new Error(`Failed to create content block: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createTaskContentBlock:', error);
    throw error;
  }
};

// Update a content block
export const updateTaskContentBlock = async (
  id: string,
  input: UpdateTaskContentBlockInput
): Promise<TaskContentBlock> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('task_content_blocks')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task content block:', error);
      throw new Error(`Failed to update content block: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateTaskContentBlock:', error);
    throw error;
  }
};

// Delete a content block
export const deleteTaskContentBlock = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('task_content_blocks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task content block:', error);
      throw new Error(`Failed to delete content block: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteTaskContentBlock:', error);
    throw error;
  }
};

// Reorder content blocks (update positions)
export const reorderTaskContentBlocks = async (
  taskId: string,
  blockIds: string[]
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update each block's position
    const updates = blockIds.map((blockId, index) => 
      supabase
        .from('task_content_blocks')
        .update({ position: index })
        .eq('id', blockId)
        .eq('user_id', user.id)
        .eq('task_id', taskId)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error reordering blocks:', errors);
      throw new Error('Failed to reorder some blocks');
    }
  } catch (error) {
    console.error('Error in reorderTaskContentBlocks:', error);
    throw error;
  }
};

