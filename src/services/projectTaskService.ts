import { supabase } from '@/lib/supabase';

export interface ProjectTask {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string | null;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectTaskInput {
  title: string;
  description?: string;
  project_id?: string | null;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

export interface UpdateProjectTaskInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
}

// Get all tasks for the current user (optionally filtered by project)
export const getProjectTasks = async (projectId?: string): Promise<ProjectTask[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('project_tasks')
      .select(`
        *,
        assignee:team_members!assigned_to(id, name, avatar, role)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching project tasks:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProjectTasks:', error);
    throw error;
  }
};

// Create a new task
export const createProjectTask = async (input: CreateProjectTaskInput): Promise<ProjectTask> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description,
        project_id: input.project_id || null,
        priority: input.priority || 'medium',
        due_date: input.due_date,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project task:', error);
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createProjectTask:', error);
    throw error;
  }
};

// Update a task
export const updateProjectTask = async (
  id: string,
  input: UpdateProjectTaskInput
): Promise<ProjectTask> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project task:', error);
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateProjectTask:', error);
    throw error;
  }
};

// Delete a task
export const deleteProjectTask = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting project task:', error);
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProjectTask:', error);
    throw error;
  }
};

// Toggle task completion
export const toggleProjectTaskCompletion = async (id: string, completed: boolean): Promise<ProjectTask> => {
  return updateProjectTask(id, { completed });
};

// Assign task to team member
export const assignTaskToMember = async (
  taskId: string,
  teamMemberId: string | null
): Promise<ProjectTask> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .update({ assigned_to: teamMemberId })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select(`
        *,
        assignee:team_members!assigned_to(id, name, avatar, role)
      `)
      .single();

    if (error) {
      console.error('Error assigning task:', error);
      throw new Error(`Failed to assign task: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in assignTaskToMember:', error);
    throw error;
  }
};

// Get tasks assigned to a specific team member
export const getTasksForTeamMember = async (memberId: string): Promise<ProjectTask[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assignee:team_members!assigned_to(id, name, avatar, role)
      `)
      .eq('user_id', user.id)
      .eq('assigned_to', memberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks for team member:', error);
      throw new Error(`Failed to fetch tasks: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTasksForTeamMember:', error);
    throw error;
  }
};

