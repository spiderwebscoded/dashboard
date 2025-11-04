
import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/types/database';

// Get all team members
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
  
  // Map database column names to our interface properties
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    role: item.role,
    email: item.email,
    phone: item.phone,
    department: item.department,
    avatar: item.avatar,
    workload: item.workload || 0,
    activeProjects: item.activeprojects || 0, // Map activeprojects (db) to activeProjects (interface)
    availability: item.availability || 'Available',
    skills: Array.isArray(item.skills) ? item.skills : [],
    created_at: item.created_at,
    updated_at: item.updated_at,
  }));
};

// Get team member by ID
export const getTeamMemberById = async (id: string): Promise<TeamMember | null> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error(`Error fetching team member with ID ${id}:`, error);
    throw error;
  }
  
  if (!data) return null;
  
  // Map database column names to our interface properties
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    department: data.department,
    avatar: data.avatar,
    workload: data.workload || 0,
    activeProjects: data.activeprojects || 0, // Map activeprojects (db) to activeProjects (interface)
    availability: data.availability || 'Available',
    skills: Array.isArray(data.skills) ? data.skills : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Create a new team member
export const createTeamMember = async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found when creating team member');
    throw new Error('User not authenticated. Please log in again.');
  }

  // Format the data to match database column names
  const formattedMember = { 
    name: member.name,
    role: member.role,
    email: member.email,
    phone: member.phone,
    department: member.department,
    avatar: member.avatar,
    skills: Array.isArray(member.skills) ? member.skills : [],
    workload: typeof member.workload === 'number' ? member.workload : 0,
    activeprojects: typeof member.activeProjects === 'number' ? member.activeProjects : 0, // Use activeprojects for DB
    availability: member.availability || 'Available',
    user_id: user.id
  };

  console.log('Creating team member with data:', formattedMember);
  
  const { data, error } = await supabase
    .from('team_members')
    .insert(formattedMember)
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error creating team member:', error);
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
  
  // Map the returned data back to our interface format
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    department: data.department,
    avatar: data.avatar,
    workload: data.workload || 0,
    activeProjects: data.activeprojects || 0, // Map activeprojects (db) to activeProjects (interface)
    availability: data.availability || 'Available',
    skills: Array.isArray(data.skills) ? data.skills : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Update a team member
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  // Format updates to match database column names
  const formattedUpdates: any = {};
  
  // Only include fields that were provided in the updates
  if (updates.name !== undefined) formattedUpdates.name = updates.name;
  if (updates.role !== undefined) formattedUpdates.role = updates.role;
  if (updates.email !== undefined) formattedUpdates.email = updates.email;
  if (updates.phone !== undefined) formattedUpdates.phone = updates.phone;
  if (updates.department !== undefined) formattedUpdates.department = updates.department;
  if (updates.avatar !== undefined) formattedUpdates.avatar = updates.avatar;
  if (updates.availability !== undefined) formattedUpdates.availability = updates.availability;
  
  // Handle special fields with conversion
  if (updates.skills !== undefined) {
    formattedUpdates.skills = Array.isArray(updates.skills) ? updates.skills : [];
  }
  if (updates.workload !== undefined) {
    formattedUpdates.workload = typeof updates.workload === 'number' ? updates.workload : 0;
  }
  if (updates.activeProjects !== undefined) {
    formattedUpdates.activeprojects = typeof updates.activeProjects === 'number' ? updates.activeProjects : 0;
  }

  const { data, error } = await supabase
    .from('team_members')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating team member with ID ${id}:`, error);
    throw error;
  }
  
  // Map the returned data back to our interface format
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    phone: data.phone,
    department: data.department,
    avatar: data.avatar,
    workload: data.workload || 0,
    activeProjects: data.activeprojects || 0, // Map activeprojects (db) to activeProjects (interface)
    availability: data.availability || 'Available',
    skills: Array.isArray(data.skills) ? data.skills : [],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

// Delete a team member
export const deleteTeamMember = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting team member with ID ${id}:`, error);
    throw error;
  }
  
  return true;
};
