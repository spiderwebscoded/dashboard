
import { supabase } from '@/lib/supabase';
import { Notification } from '@/context/NotificationContext';

// Create a new notification
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'read'>
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        read: false,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get notifications for a specific user
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (id: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Delete a notification
export const deleteNotification = async (id: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};

// Create system notification for important events
export const createSystemNotification = async (
  userId: string, 
  title: string, 
  message: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_type: 'system',
      read: false,
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
  }
};

// Create project-related notification
export const createProjectNotification = async (
  userId: string,
  title: string,
  message: string,
  projectId: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_to: projectId,
      related_type: 'project',
      read: false,
    });
  } catch (error) {
    console.error('Error creating project notification:', error);
  }
};

// Create client-related notification
export const createClientNotification = async (
  userId: string,
  title: string,
  message: string,
  clientId: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_to: clientId,
      related_type: 'client',
      read: false,
    });
  } catch (error) {
    console.error('Error creating client notification:', error);
  }
};

// Create analytics-related notification
export const createAnalyticsNotification = async (
  userId: string,
  title: string,
  message: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_type: 'analytics',
      read: false,
    });
  } catch (error) {
    console.error('Error creating analytics notification:', error);
  }
};

// Create revenue-related notification
export const createRevenueNotification = async (
  userId: string,
  title: string,
  message: string,
  revenueId?: string
): Promise<void> => {
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type: 'info',
      related_to: revenueId,
      related_type: 'revenue',
      read: false,
    });
  } catch (error) {
    console.error('Error creating revenue notification:', error);
  }
};
