import { supabase } from '@/lib/supabase';

export interface TeamMemberStats {
  task_count: number;
  completed_task_count: number;
  active_project_count: number;
  workload: number;
}

// Calculate team member statistics using the database function
export const calculateTeamMemberStats = async (memberId: string): Promise<TeamMemberStats> => {
  try {
    const { data, error } = await supabase.rpc('calculate_team_member_stats', {
      member_id: memberId
    });

    if (error) {
      console.error('Error calculating team member stats:', error);
      throw new Error(`Failed to calculate stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        task_count: 0,
        completed_task_count: 0,
        active_project_count: 0,
        workload: 0
      };
    }

    return data[0];
  } catch (error) {
    console.error('Error in calculateTeamMemberStats:', error);
    throw error;
  }
};

// Update team member record with calculated statistics
export const updateTeamMemberStats = async (memberId: string): Promise<void> => {
  try {
    const stats = await calculateTeamMemberStats(memberId);

    const { error } = await supabase
      .from('team_members')
      .update({
        workload: stats.workload,
        activeProjects: stats.active_project_count
      })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating team member stats:', error);
      throw new Error(`Failed to update stats: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in updateTeamMemberStats:', error);
    throw error;
  }
};

// Bulk update all team member statistics
export const updateAllTeamStats = async (): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: members, error } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching team members:', error);
      throw new Error(`Failed to fetch team members: ${error.message}`);
    }

    if (!members || members.length === 0) {
      return;
    }

    // Update each member's stats
    const updates = members.map(member => updateTeamMemberStats(member.id));
    await Promise.all(updates);
  } catch (error) {
    console.error('Error in updateAllTeamStats:', error);
    throw error;
  }
};

// Get team member stats without updating the database
export const getTeamMemberStats = async (memberId: string): Promise<TeamMemberStats> => {
  return calculateTeamMemberStats(memberId);
};
