
import { supabase } from '@/lib/supabase';
import { Project, TeamMember, Client, RevenueData } from '@/types/database';
import { createAnalyticsNotification } from './notificationService';

export interface AnalyticsSummary {
  teamCount: number;
  clientCount: number;
  projectCount: number;
  completedProjects: number;
  inProgressProjects: number;
  totalRevenue: number;
  avgProjectProgress: number;
  teamWorkloadAvg: number;
  topClients: {
    name: string;
    projectCount: number;
  }[];
  recentProjects: Project[];
}

export interface CustomAnalytic {
  id: string;
  user_id: string;
  title: string;
  chart_type: 'stat' | 'bar_chart' | 'pie_chart' | 'line_chart' | 'area_chart';
  data_points: Array<{ label?: string; name?: string; value: number }>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get team count
    const { count: teamCount } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
      
    // Get client count
    const { count: clientCount } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
      
    // Get projects with status summary
    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);
    
    // Get revenue data
    const { data: revenueData } = await supabase
      .from('revenue_data')
      .select('value')
      .eq('user_id', user.id);
      
    // Get team data for workload average
    const { data: teamData } = await supabase
      .from('team_members')
      .select('workload')
      .eq('user_id', user.id);
    
    // Process the data
    const projectCount = projects?.length || 0;
    const completedProjects = projects?.filter(p => p.status === 'Completed').length || 0;
    const inProgressProjects = projects?.filter(p => p.status === 'In Progress').length || 0;
    
    const totalRevenue = revenueData?.reduce((sum, item) => {
      const numericValue = typeof item.value === 'number' ? item.value : 0;
      return sum + numericValue;
    }, 0) || 0;
    
    const avgProjectProgress = projects && projects.length > 0
      ? projects.reduce((sum, project) => sum + (project.progress || 0), 0) / projects.length 
      : 0;
      
    const teamWorkloadAvg = teamData && teamData.length > 0
      ? teamData.reduce((sum, member) => sum + (member.workload || 0), 0) / teamData.length
      : 0;
    
    // Calculate top clients by project count
    const clientProjectMap: Record<string, number> = {};
    if (projects) {
      projects.forEach(project => {
        const clientName = project.client;
        if (!clientProjectMap[clientName]) {
          clientProjectMap[clientName] = 0;
        }
        clientProjectMap[clientName]++;
      });
    }
    
    const topClients = Object.entries(clientProjectMap)
      .map(([name, projectCount]) => ({ name, projectCount }))
      .sort((a, b) => b.projectCount - a.projectCount)
      .slice(0, 5);
    
    // Get recent projects
    const recentProjects = [...(projects || [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    return {
      teamCount: teamCount || 0,
      clientCount: clientCount || 0,
      projectCount,
      completedProjects,
      inProgressProjects,
      totalRevenue,
      avgProjectProgress,
      teamWorkloadAvg,
      topClients,
      recentProjects
    };
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    throw error;
  }
};

// Functions for revenue data
export const getRevenueData = async (): Promise<RevenueData[]> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('revenue_data')
      .select('*')
      .eq('user_id', user.id)
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
    
    return data as RevenueData[] || [];
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    throw error;
  }
};

export const saveRevenueData = async (data: Omit<RevenueData, 'id' | 'created_at' | 'updated_at'>): Promise<RevenueData> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found when saving revenue data');
      throw new Error('User not authenticated. Please log in again.');
    }

    console.log('Saving revenue data with user_id:', user.id);
    console.log('Revenue data:', data);

    const { data: result, error } = await supabase
      .from('revenue_data')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error saving revenue data:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      let errorMessage = error.message;
      
      // Provide more specific error messages
      if (error.message.includes('column') && error.message.includes('user_id')) {
        errorMessage = 'Database not configured. Please run the SQL migration first.';
      } else if (error.code === 'PGRST301' || error.message.includes('RLS')) {
        errorMessage = 'Permission denied. Please check database RLS policies.';
      } else if (error.message.includes('violates')) {
        errorMessage = 'Data validation error. Please check all required fields.';
      }
      
      throw new Error(errorMessage);
    }
    
    // Create notification for new revenue data
    await createAnalyticsNotification(
      user.id,
      'New Revenue Data Added',
      `Revenue data for ${data.month} ${data.year} has been added.`
    );
    
    return result as RevenueData;
  } catch (error) {
    console.error('Error in saveRevenueData:', error);
    throw error;
  }
};

export const updateRevenueData = async (id: string, data: Partial<RevenueData>): Promise<RevenueData> => {
  try {
    const { data: result, error } = await supabase
      .from('revenue_data')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating revenue data:', error);
      throw error;
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Create notification for updated revenue data
      await createAnalyticsNotification(
        user.id,
        'Revenue Data Updated',
        `Revenue data for ${result.month} ${result.year} has been updated.`
      );
    }
    
    return result as RevenueData;
  } catch (error) {
    console.error('Error in updateRevenueData:', error);
    throw error;
  }
};

export const deleteRevenueData = async (id: string): Promise<void> => {
  try {
    // Get revenue data before deletion
    const { data: revenueItem } = await supabase
      .from('revenue_data')
      .select('month, year')
      .eq('id', id)
      .single();
      
    const { error } = await supabase
      .from('revenue_data')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting revenue data:', error);
      throw error;
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && revenueItem) {
      // Create notification for deleted revenue data
      await createAnalyticsNotification(
        user.id,
        'Revenue Data Deleted',
        `Revenue data for ${revenueItem.month} ${revenueItem.year} has been deleted.`
      );
    }
  } catch (error) {
    console.error('Error in deleteRevenueData:', error);
    throw error;
  }
};

// Custom Analytics CRUD operations with Supabase
export const getCustomAnalytics = async (): Promise<CustomAnalytic[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('custom_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom analytics:', error);
      throw new Error(`Failed to fetch custom analytics: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCustomAnalytics:', error);
    return [];
  }
};

export const addCustomAnalytic = async (
  analytic: Omit<CustomAnalytic, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<CustomAnalytic> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('custom_analytics')
      .insert({
        user_id: user.id,
        title: analytic.title,
        chart_type: analytic.chart_type,
        data_points: analytic.data_points,
        notes: analytic.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding custom analytic:', error);
      throw new Error(`Failed to add custom analytic: ${error.message}`);
    }

    // Create notification for new custom analytic
    await createAnalyticsNotification(
      user.id,
      'Custom Analytic Added',
      `Custom analytic "${analytic.title}" has been added.`
    );

    return data;
  } catch (error) {
    console.error('Error in addCustomAnalytic:', error);
    throw error;
  }
};

export const updateCustomAnalytic = async (
  id: string,
  updates: Partial<Omit<CustomAnalytic, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<CustomAnalytic> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('custom_analytics')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating custom analytic:', error);
      throw new Error(`Failed to update custom analytic: ${error.message}`);
    }

    // Create notification for updated custom analytic
    await createAnalyticsNotification(
      user.id,
      'Custom Analytic Updated',
      `Custom analytic "${data.title}" has been updated.`
    );

    return data;
  } catch (error) {
    console.error('Error in updateCustomAnalytic:', error);
    throw error;
  }
};

export const deleteCustomAnalytic = async (id: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get analytic title before deletion for notification
    const { data: analytic } = await supabase
      .from('custom_analytics')
      .select('title')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    const { error } = await supabase
      .from('custom_analytics')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting custom analytic:', error);
      throw new Error(`Failed to delete custom analytic: ${error.message}`);
    }

    // Create notification for deleted custom analytic
    if (analytic) {
      await createAnalyticsNotification(
        user.id,
        'Custom Analytic Deleted',
        `Custom analytic "${analytic.title}" has been deleted.`
      );
    }
  } catch (error) {
    console.error('Error in deleteCustomAnalytic:', error);
    throw error;
  }
};
