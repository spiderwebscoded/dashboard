
import { supabase } from '@/lib/supabase';
import { TeamMember, Client, Project, RevenueData, ProjectTypeData } from '@/types/database';

// Initial team data
const teamData: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Arnold',
    role: 'Chairperson',
    workload: 0,
    activeProjects: 0,
    availability: 'Available',
    skills: ['Web', 'Bargain', 'C++', 'Many more'],
  },
  {
    name: 'Nigel',
    role: 'CEO',
    workload: 0,
    activeProjects: 0,
    availability: 'Available',
    skills: ['Business', 'Persuasive', 'C++', 'Many more'],
  },
  {
    name: 'Kamo',
    role: 'CTO',
    workload: 0,
    activeProjects: 0,
    availability: 'Available',
    skills: ['Ace', 'Relentless', 'C++', 'Many more'],
  },
];

// Initial client data
const clientsData: Omit<Client, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Gareth',
    company: 'TRENDZ-SA.',
    email: 'info@trendz-sa.co.za',
    phone: '+27 79 620 6277',
    activeProjects: 0,
    totalProjects: 1,
    status: 'Past Client',
  },
  {
    name: 'Jason',
    company: 'U+',
    email: 'info@uplus-sa.co.za',
    phone: '+27 74 299 9950/+27 62 834 8553/+27 61 822 4076',
    activeProjects: 0,
    totalProjects: 1,
    status: 'Past Client',
  },
  {
    name: 'Chamu',
    company: 'EndUser Industrial Systems',
    email: 'sales@end-user.co.za',
    phone: '+27 62 481 7789',
    activeProjects: 0,
    totalProjects: 1,
    status: 'Past Client',
  },
  {
    name: 'Aleck & Musekiwa ',
    company: 'Kuyasa Fuels ',
    email: 'non ',
    phone: '+27 82 884 0636/+27 66 476 2579',
    activeProjects: 1,
    totalProjects: 1,
    status: 'Active',
  },
];

// Initial project data
const projectsData: Omit<Project, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'TRENDZ-SA',
    client: 'Gareth',
    description: 'Creation of a custom Shopify store, featuring tailored template design, integrated payment gateways, advanced functionality, and seamless user experience, all built to meet specific business needs.',
    progress: 100,
    status: 'Past Client',
    deadline: '1 Oct 2023, 1 April 2025',
    team: [
      { id: '1', name: 'Arnold' },
      { id: '2', name: 'Nigel' },
      { id: '3', name: 'Kamo' },
    ],
  },
  {
    title: 'U+',
    client: 'Jason & Kelly',
    description: 'Development of a bespoke Shopify store for a jewelry business, featuring custom-designed templates, integrated payment systems, advanced inventory management, personalized product pages, and a seamless shopping experience optimized for both desktop and mobile users.',
    progress: 100,
    status: 'Past Client',
    deadline: '2024,2024',
    team: [
      { id: '1', name: 'Kamo' },
      { id: '5', name: 'Nigel' },
      { id: '6', name: 'Arnold' },
    ],
  },
  {
    title: 'Spiderwebscoded',
    client: 'Spiderwebscoded',
    description: 'Redesign and development of our business website, showcasing our services and expertise with a professional custom layout, enhanced UI/UX, responsive design, integrated contact forms, and optimized performance for a seamless user experience',
    progress: 100,
    status: 'Completed',
    deadline: 'Apr 10, 2025',
    team: [
      { id: '2', name: 'Arnold' },
      { id: '3', name: 'Nigel' },
      { id: '6', name: 'Kamo' },
    ],
  },
];

// Revenue data
const revenueData: Omit<RevenueData, 'id' | 'created_at'>[] = [
  { month: 'Jan', value: 0, year: 2025 },
  { month: 'Feb', value: 0, year: 2025 },
  { month: 'Mar', value: 0, year: 2025 },
  { month: 'Apr', value: 0, year: 2025 },
  { month: 'May', value: 0, year: 2025 },
  { month: 'Jun', value: 0, year: 2025 },
];

// Project type data
const projectTypeData: Omit<ProjectTypeData, 'id' | 'created_at'>[] = [
  { name: 'Web Development', value: 38000 },
  { name: 'Mobile Apps', value: 0 },
  { name: 'UI/UX Design', value: 500 },
  { name: 'Consulting', value: 0 },
  { name: 'Maintenance', value: 0 },
];

// Function to migrate team data
export const migrateTeamData = async () => {
  const { data: existingTeamData, error: checkError } = await supabase
    .from('team_members')
    .select('*');
  
  if (checkError) {
    console.error('Error checking for existing team data:', checkError);
    return;
  }
  
  // Only migrate if the table is empty
  if (existingTeamData.length === 0) {
    const { error } = await supabase
      .from('team_members')
      .insert(teamData);
      
    if (error) {
      console.error('Error migrating team data:', error);
    } else {
      console.log('Team data migrated successfully');
    }
  } else {
    console.log('Team data already exists, skipping migration');
  }
};

// Function to migrate client data
export const migrateClientData = async () => {
  const { data: existingClientData, error: checkError } = await supabase
    .from('clients')
    .select('*');
  
  if (checkError) {
    console.error('Error checking for existing client data:', checkError);
    return;
  }
  
  // Only migrate if the table is empty
  if (existingClientData.length === 0) {
    const { error } = await supabase
      .from('clients')
      .insert(clientsData);
      
    if (error) {
      console.error('Error migrating client data:', error);
    } else {
      console.log('Client data migrated successfully');
    }
  } else {
    console.log('Client data already exists, skipping migration');
  }
};

// Function to migrate project data
export const migrateProjectData = async () => {
  const { data: existingProjectData, error: checkError } = await supabase
    .from('projects')
    .select('*');
  
  if (checkError) {
    console.error('Error checking for existing project data:', checkError);
    return;
  }
  
  // Only migrate if the table is empty
  if (existingProjectData.length === 0) {
    const { error } = await supabase
      .from('projects')
      .insert(projectsData);
      
    if (error) {
      console.error('Error migrating project data:', error);
    } else {
      console.log('Project data migrated successfully');
    }
  } else {
    console.log('Project data already exists, skipping migration');
  }
};

// Function to migrate revenue data
export const migrateRevenueData = async () => {
  const { data: existingRevenueData, error: checkError } = await supabase
    .from('revenue_data')
    .select('*');
  
  if (checkError) {
    console.error('Error checking for existing revenue data:', checkError);
    return;
  }
  
  // Only migrate if the table is empty
  if (existingRevenueData.length === 0) {
    const { error } = await supabase
      .from('revenue_data')
      .insert(revenueData);
      
    if (error) {
      console.error('Error migrating revenue data:', error);
    } else {
      console.log('Revenue data migrated successfully');
    }
  } else {
    console.log('Revenue data already exists, skipping migration');
  }
};

// Function to migrate project type data
export const migrateProjectTypeData = async () => {
  const { data: existingTypeData, error: checkError } = await supabase
    .from('project_type_data')
    .select('*');
  
  if (checkError) {
    console.error('Error checking for existing project type data:', checkError);
    return;
  }
  
  // Only migrate if the table is empty
  if (existingTypeData.length === 0) {
    const { error } = await supabase
      .from('project_type_data')
      .insert(projectTypeData);
      
    if (error) {
      console.error('Error migrating project type data:', error);
    } else {
      console.log('Project type data migrated successfully');
    }
  } else {
    console.log('Project type data already exists, skipping migration');
  }
};

// Run all migrations
export const migrateAllData = async () => {
  await migrateTeamData();
  await migrateClientData();
  await migrateProjectData();
  await migrateRevenueData();
  await migrateProjectTypeData();
};
