import { supabase } from '@/lib/supabase';

export interface FocusSession {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number; // in seconds
  created_at: string;
}

export interface CreateFocusSessionInput {
  task_id: string;
  start_time: string;
  end_time: string;
  duration: number;
}

// Get all focus sessions for a task
export const getFocusSessions = async (taskId: string): Promise<FocusSession[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('task_id', taskId)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching focus sessions:', error);
      throw new Error(`Failed to fetch focus sessions: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFocusSessions:', error);
    throw error;
  }
};

// Create a new focus session
export const createFocusSession = async (input: CreateFocusSessionInput): Promise<FocusSession> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        task_id: input.task_id,
        start_time: input.start_time,
        end_time: input.end_time,
        duration: input.duration,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating focus session:', error);
      throw new Error(`Failed to create focus session: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createFocusSession:', error);
    throw error;
  }
};

// Delete a focus session
export const deleteFocusSession = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('focus_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting focus session:', error);
      throw new Error(`Failed to delete focus session: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteFocusSession:', error);
    throw error;
  }
};

