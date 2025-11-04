
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/database';
import { createProjectNotification, createSystemNotification } from './notificationService';
import { toast } from '@/hooks/use-toast';

export const getProjects = async (): Promise<Project[]> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching projects:', error);
    toast({
      title: "Error fetching projects",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to fetch projects');
  }
  
  return data || [];
};

export const createProject = async (project: Partial<Project>): Promise<Project> => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No user found when creating project');
    throw new Error('User not authenticated. Please log in again.');
  }

  console.log('Creating project with user_id:', user.id);
  console.log('Project data:', project);

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...project, user_id: user.id })
    .select()
    .single();
  
  if (error) {
    console.error('Supabase error creating project:', error);
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
    
    toast({
      title: "Error creating project",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }

  // Create notifications for the new project
  await createSystemNotification(
    user.id,
    'New Project Created',
    `Project "${project.title}" has been created successfully.`
  );

  await createProjectNotification(
    user.id,
    'Project Created',
    `Project "${project.title}" has been created successfully.`,
    data.id
  );

  toast({
    title: "Project created",
    description: `${project.title} has been created successfully.`
  });
  
  return data;
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...project, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating project:', error);
    toast({
      title: "Error updating project",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to update project');
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Create notifications for the project update
    await createSystemNotification(
      user.id,
      'Project Updated',
      `Project "${data.title}" has been updated.`
    );
    
    await createProjectNotification(
      user.id,
      'Project Updated',
      `Project "${data.title}" has been updated successfully.`,
      data.id
    );

    toast({
      title: "Project updated",
      description: `${data.title} has been updated successfully.`
    });
  }
  
  return data;
};

export const deleteProject = async (id: string): Promise<void> => {
  // Get project details before deletion
  const { data: project } = await supabase
    .from('projects')
    .select('title')
    .eq('id', id)
    .single();
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting project:', error);
    toast({
      title: "Error deleting project",
      description: error.message,
      variant: "destructive"
    });
    throw new Error('Failed to delete project');
  }
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user && project) {
    // Create notifications for the project deletion
    await createSystemNotification(
      user.id,
      'Project Deleted',
      `Project "${project.title}" has been deleted.`
    );
    
    await createProjectNotification(
      user.id,
      'Project Deleted',
      `Project "${project.title}" has been removed from your account.`,
      id
    );

    toast({
      title: "Project deleted",
      description: `${project.title} has been deleted successfully.`
    });
  }
};

// Assign team members to a project
export const assignTeamToProject = async (
  projectId: string,
  teamMemberIds: string[]
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Delete existing assignments
    await supabase
      .from('project_team_members')
      .delete()
      .eq('project_id', projectId);

    // Insert new assignments
    if (teamMemberIds.length > 0) {
      const { error } = await supabase
        .from('project_team_members')
        .insert(
          teamMemberIds.map(memberId => ({
            project_id: projectId,
            team_member_id: memberId
          }))
        );

      if (error) {
        console.error('Error assigning team to project:', error);
        throw new Error(`Failed to assign team: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error in assignTeamToProject:', error);
    throw error;
  }
};

// Get project with team members from junction table
export const getProjectWithTeam = async (projectId: string): Promise<any> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        team_members:project_team_members(
          team_member:team_members(id, name, avatar, role)
        )
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching project with team:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getProjectWithTeam:', error);
    throw error;
  }
};

// Get projects for a specific team member
export const getProjectsForTeamMember = async (memberId: string): Promise<Project[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('project_team_members')
      .select(`
        project:projects(*)
      `)
      .eq('team_member_id', memberId);

    if (error) {
      console.error('Error fetching projects for team member:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // Extract projects from the nested structure
    const projects = data?.map(item => item.project).filter(Boolean) || [];
    return projects as Project[];
  } catch (error) {
    console.error('Error in getProjectsForTeamMember:', error);
    throw error;
  }
};
