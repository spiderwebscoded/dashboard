import { supabase } from '@/lib/supabase';

export interface ProjectNote {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectNoteInput {
  project_id: string;
  title: string;
  content: string;
}

export interface UpdateProjectNoteInput {
  title?: string;
  content?: string;
}

// Get all notes for a project
export const getProjectNotes = async (projectId: string): Promise<ProjectNote[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching project notes:', error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProjectNotes:', error);
    throw error;
  }
};

// Create a new note
export const createProjectNote = async (input: CreateProjectNoteInput): Promise<ProjectNote> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_notes')
      .insert({
        user_id: user.id,
        project_id: input.project_id,
        title: input.title,
        content: input.content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project note:', error);
      throw new Error(`Failed to create note: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createProjectNote:', error);
    throw error;
  }
};

// Update a note
export const updateProjectNote = async (
  id: string,
  input: UpdateProjectNoteInput
): Promise<ProjectNote> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_notes')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project note:', error);
      throw new Error(`Failed to update note: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateProjectNote:', error);
    throw error;
  }
};

// Delete a note
export const deleteProjectNote = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting project note:', error);
      throw new Error(`Failed to delete note: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProjectNote:', error);
    throw error;
  }
};

