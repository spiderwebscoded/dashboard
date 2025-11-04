import { supabase } from '@/lib/supabase';

export type WidgetType = 
  | 'recent_tasks'
  | 'active_projects'
  | 'team_overview'
  | 'client_list'
  | 'revenue_chart'
  | 'quick_stats'
  | 'activity_feed'
  | 'calendar'
  | 'focus_timer'
  | 'notes';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateWidgetInput {
  widget_type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  config?: Record<string, any>;
}

export interface UpdateWidgetInput {
  title?: string;
  size?: WidgetSize;
  position?: number;
  config?: Record<string, any>;
}

// Get all widgets for current user
export const getDashboardWidgets = async (): Promise<DashboardWidget[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching dashboard widgets:', error);
      throw new Error(`Failed to fetch widgets: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDashboardWidgets:', error);
    throw error;
  }
};

// Create a new widget
export const createDashboardWidget = async (input: CreateWidgetInput): Promise<DashboardWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        user_id: user.id,
        widget_type: input.widget_type,
        title: input.title,
        size: input.size,
        position: input.position,
        config: input.config || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard widget:', error);
      throw new Error(`Failed to create widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createDashboardWidget:', error);
    throw error;
  }
};

// Update a widget
export const updateDashboardWidget = async (
  id: string,
  input: UpdateWidgetInput
): Promise<DashboardWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard widget:', error);
      throw new Error(`Failed to update widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateDashboardWidget:', error);
    throw error;
  }
};

// Delete a widget
export const deleteDashboardWidget = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting dashboard widget:', error);
      throw new Error(`Failed to delete widget: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteDashboardWidget:', error);
    throw error;
  }
};

// Reorder widgets
export const reorderDashboardWidgets = async (widgetIds: string[]): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updates = widgetIds.map((widgetId, index) => 
      supabase
        .from('dashboard_widgets')
        .update({ position: index })
        .eq('id', widgetId)
        .eq('user_id', user.id)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error reordering widgets:', errors);
      throw new Error('Failed to reorder some widgets');
    }
  } catch (error) {
    console.error('Error in reorderDashboardWidgets:', error);
    throw error;
  }
};

// Initialize default widgets for new users
export const initializeDefaultDashboardWidgets = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const defaultWidgets: CreateWidgetInput[] = [
      {
        widget_type: 'quick_stats',
        title: 'Quick Stats',
        size: 'large',
        position: 0,
        config: {},
      },
      {
        widget_type: 'recent_tasks',
        title: 'Recent Tasks',
        size: 'medium',
        position: 1,
        config: { limit: 5 },
      },
      {
        widget_type: 'active_projects',
        title: 'Active Projects',
        size: 'medium',
        position: 2,
        config: { limit: 4 },
      },
      {
        widget_type: 'activity_feed',
        title: 'Recent Activity',
        size: 'large',
        position: 3,
        config: { limit: 10 },
      },
    ];

    for (const widget of defaultWidgets) {
      await createDashboardWidget(widget);
    }
  } catch (error) {
    console.error('Error in initializeDefaultDashboardWidgets:', error);
    throw error;
  }
};
