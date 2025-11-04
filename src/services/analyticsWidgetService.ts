import { supabase } from '@/lib/supabase';

export type WidgetType = 'stat' | 'bar_chart' | 'pie_chart' | 'line_chart' | 'area_chart' | 'list' | 'summary';
export type WidgetSize = 'small' | 'medium' | 'large';
export type DataSource = 'manual' | 'team' | 'projects' | 'clients' | 'tasks' | 'revenue';

export interface AnalyticsWidget {
  id: string;
  user_id: string;
  widget_type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  data_source: DataSource;
  config: {
    data?: any;
    visualization?: any;
    filters?: any;
    aggregation?: string;
    limit?: number;
    colors?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface CreateWidgetInput {
  widget_type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  data_source: DataSource;
  config?: AnalyticsWidget['config'];
}

export interface UpdateWidgetInput {
  title?: string;
  size?: WidgetSize;
  position?: number;
  config?: AnalyticsWidget['config'];
}

// Get all widgets for current user
export const getAnalyticsWidgets = async (): Promise<AnalyticsWidget[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analytics_widgets')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching analytics widgets:', error);
      throw new Error(`Failed to fetch widgets: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAnalyticsWidgets:', error);
    throw error;
  }
};

// Create a new widget
export const createAnalyticsWidget = async (input: CreateWidgetInput): Promise<AnalyticsWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analytics_widgets')
      .insert({
        user_id: user.id,
        widget_type: input.widget_type,
        title: input.title,
        size: input.size,
        position: input.position,
        data_source: input.data_source,
        config: input.config || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analytics widget:', error);
      throw new Error(`Failed to create widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in createAnalyticsWidget:', error);
    throw error;
  }
};

// Update a widget
export const updateAnalyticsWidget = async (
  id: string,
  input: UpdateWidgetInput
): Promise<AnalyticsWidget> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('analytics_widgets')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating analytics widget:', error);
      throw new Error(`Failed to update widget: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in updateAnalyticsWidget:', error);
    throw error;
  }
};

// Delete a widget
export const deleteAnalyticsWidget = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('analytics_widgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting analytics widget:', error);
      throw new Error(`Failed to delete widget: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteAnalyticsWidget:', error);
    throw error;
  }
};

// Reorder widgets
export const reorderAnalyticsWidgets = async (widgetIds: string[]): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const updates = widgetIds.map((widgetId, index) => 
      supabase
        .from('analytics_widgets')
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
    console.error('Error in reorderAnalyticsWidgets:', error);
    throw error;
  }
};

// Initialize default widgets
export const initializeDefaultWidgets = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const defaultWidgets: CreateWidgetInput[] = [
      {
        widget_type: 'stat',
        title: 'Team Members',
        size: 'small',
        position: 0,
        data_source: 'team',
        config: { aggregation: 'count' },
      },
      {
        widget_type: 'stat',
        title: 'Total Clients',
        size: 'small',
        position: 1,
        data_source: 'clients',
        config: { aggregation: 'count' },
      },
      {
        widget_type: 'stat',
        title: 'Total Projects',
        size: 'small',
        position: 2,
        data_source: 'projects',
        config: { aggregation: 'count' },
      },
      {
        widget_type: 'bar_chart',
        title: 'Team & Client Overview',
        size: 'medium',
        position: 3,
        data_source: 'team',
        config: { aggregation: 'count' },
      },
      {
        widget_type: 'pie_chart',
        title: 'Project Status',
        size: 'medium',
        position: 4,
        data_source: 'projects',
        config: { aggregation: 'status' },
      },
    ];

    for (const widget of defaultWidgets) {
      await createAnalyticsWidget(widget);
    }
  } catch (error) {
    console.error('Error in initializeDefaultWidgets:', error);
    throw error;
  }
};
