
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
  avatar?: string;
  workload: number;
  activeProjects: number;
  availability: 'Available' | 'Busy' | 'Away' | 'Offline';
  skills: string[];
  created_at?: string;
  updated_at?: string;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  logo?: string;
  industry?: string;
  contract_value?: number;
  priority?: 'High' | 'Medium' | 'Low';
  website?: string;
  status: 'Active' | 'Potential' | 'Former' | 'Past Client';
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  id: string;
  title: string;
  client: string;
  description: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Planning' | 'On Hold' | 'Past Client';
  deadline: string;
  team: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  created_at?: string;
  updated_at?: string;
};

export type RevenueData = {
  id: string;
  month: string;
  value: number;
  year: number;
  costs?: number;
  notes?: string;
  category?: string;
  source?: string;
  created_at?: string;
};

export type ProjectTypeData = {
  id: string;
  name: string;
  value: number;
  created_at?: string;
};

export type BlogPost = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_name: string;
  author_avatar?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  tags?: BlogTag[];
};

export type BlogTag = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type BlogPostTag = {
  post_id: string;
  tag_id: string;
};
