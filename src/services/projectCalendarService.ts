import { supabase } from '@/lib/supabase';

export interface ProjectCalendarEvent {
  id: string;
  project_id: string;
  user_id: string;
  event_date: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectCalendarEventInput {
  project_id: string;
  event_date: string;
  title: string;
  description?: string;
}

export interface UpdateProjectCalendarEventInput {
  event_date?: string;
  title?: string;
  description?: string;
}

// Get all calendar events for a project
export const getProjectCalendarEvents = async (projectId: string): Promise<ProjectCalendarEvent[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_calendar_events')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching project calendar events:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProjectCalendarEvents:', error);
    throw error;
  }
};

// Get events for a specific date
export const getProjectCalendarEventsByDate = async (
  projectId: string,
  date: string
): Promise<ProjectCalendarEvent[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_calendar_events')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('event_date', date)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project calendar events by date:', error);
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProjectCalendarEventsByDate:', error);
    throw error;
  }
};

// Create a new calendar event
export const createProjectCalendarEvent = async (
  input: CreateProjectCalendarEventInput
): Promise<ProjectCalendarEvent> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_calendar_events')
      .insert({
        user_id: user.id,
        project_id: input.project_id,
        event_date: input.event_date,
        title: input.title,
        description: input.description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project calendar event:', error);
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createProjectCalendarEvent:', error);
    throw error;
  }
};

// Update a calendar event
export const updateProjectCalendarEvent = async (
  id: string,
  input: UpdateProjectCalendarEventInput
): Promise<ProjectCalendarEvent> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_calendar_events')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project calendar event:', error);
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateProjectCalendarEvent:', error);
    throw error;
  }
};

// Delete a calendar event
export const deleteProjectCalendarEvent = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('project_calendar_events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting project calendar event:', error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProjectCalendarEvent:', error);
    throw error;
  }
};

