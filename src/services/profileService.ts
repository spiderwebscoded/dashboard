import { supabase } from '@/lib/supabase';

export type DashboardView = 'grid' | 'compact' | 'list';

/**
 * Get the user's dashboard view preference from their profile
 */
export const getDashboardViewPreference = async (): Promise<DashboardView> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'grid'; // Default for non-authenticated users
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('dashboard_view')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching dashboard view preference:', error);
      return 'grid';
    }

    // If no profile exists, return default
    if (!data) {
      return 'grid';
    }
    
    return (data?.dashboard_view as DashboardView) || 'grid';
  } catch (error) {
    console.error('Error in getDashboardViewPreference:', error);
    return 'grid';
  }
};

/**
 * Save the user's dashboard view preference to their profile
 */
export const saveDashboardViewPreference = async (view: DashboardView): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Use upsert to create profile if it doesn't exist
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        dashboard_view: view,
        display_name: user.email?.split('@')[0] || 'User'
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Error saving dashboard view preference:', error);
      throw new Error(`Failed to save view preference: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in saveDashboardViewPreference:', error);
    throw error;
  }
};

/**
 * Get the user's theme preference from their profile
 */
export const getThemePreference = async (): Promise<'light' | 'dark'> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'light'; // Default for non-authenticated users
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error || !data) {
      return 'light';
    }
    
    return (data?.theme as 'light' | 'dark') || 'light';
  } catch (error) {
    console.error('Error in getThemePreference:', error);
    return 'light';
  }
};

/**
 * Save the user's theme preference to their profile
 */
export const saveThemePreference = async (theme: 'light' | 'dark'): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return; // Don't throw, just return for non-authenticated users
    }
    
    // Use upsert to create profile if it doesn't exist
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        theme,
        display_name: user.email?.split('@')[0] || 'User'
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error('Error saving theme preference:', error);
    }
  } catch (error) {
    console.error('Error in saveThemePreference:', error);
  }
};

