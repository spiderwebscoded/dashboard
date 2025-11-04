import { supabase } from '@/lib/supabase';

export type WidgetType = 'member_info' | 'skills' | 'notes' | 'activity' | 'tasks';

export interface TeamMemberWidget {
  id: string;
  team_member_id: string;
  user_id: string;
  widget_type: WidgetType;
  title: string;
  position: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateWidgetInput {
  team_member_id: string;
  widget_type: WidgetType;
  title: string;
  position: number;
  config?: Record<string, any>;
}

export interface UpdateWidgetInput {
  title?: string;
  position?: number;
  config?: Record<string, any>;
}

// Get all widgets for a team member (for current user)
export const getTeamMemberWidgets = async (teamMemberId: string): Promise<TeamMemberWidget[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('team_member_widgets')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching team member widgets:', error);
      throw new Error(`Failed to fetch widgets: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTeamMemberWidgets:', error);
    throw error;
  }
};

// Create a new widget
export const createTeamMemberWidget = async (input: CreateWidgetInput): Promise<TeamMemberWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('team_member_widgets')
      .insert({
        user_id: user.id,
        team_member_id: input.team_member_id,
        widget_type: input.widget_type,
        title: input.title,
        position: input.position,
        config: input.config || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating team member widget:', error);
      throw new Error(`Failed to create widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createTeamMemberWidget:', error);
    throw error;
  }
};

// Update a widget
export const updateTeamMemberWidget = async (
  id: string,
  input: UpdateWidgetInput
): Promise<TeamMemberWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('team_member_widgets')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member widget:', error);
      throw new Error(`Failed to update widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateTeamMemberWidget:', error);
    throw error;
  }
};

// Delete a widget
export const deleteTeamMemberWidget = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('team_member_widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting team member widget:', error);
      throw new Error(`Failed to delete widget: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteTeamMemberWidget:', error);
    throw error;
  }
};

// Reorder widgets (update positions)
export const reorderTeamMemberWidgets = async (
  teamMemberId: string,
  widgetIds: string[]
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update each widget's position
    const updates = widgetIds.map((widgetId, index) => 
      supabase
        .from('team_member_widgets')
        .update({ position: index })
        .eq('id', widgetId)
        .eq('user_id', user.id)
        .eq('team_member_id', teamMemberId)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error reordering widgets:', errors);
      throw new Error('Failed to reorder some widgets');
    }
  } catch (error) {
    console.error('Error in reorderTeamMemberWidgets:', error);
    throw error;
  }
};

// Initialize default widgets for a team member
export const initializeDefaultWidgets = async (teamMemberId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const defaultWidgets: CreateWidgetInput[] = [
      {
        team_member_id: teamMemberId,
        widget_type: 'member_info',
        title: 'Member Information',
        position: 0,
      },
      {
        team_member_id: teamMemberId,
        widget_type: 'skills',
        title: 'Skills',
        position: 1,
      },
    ];

    for (const widget of defaultWidgets) {
      await createTeamMemberWidget(widget);
    }
  } catch (error) {
    console.error('Error in initializeDefaultWidgets:', error);
    throw error;
  }
};

