import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  FolderKanban, 
  Users, 
  Briefcase, 
  BarChart3, 
  CheckSquare, 
  DollarSign,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import PreviewProjects from '@/components/landing/PreviewProjects';
import PreviewTasks from '@/components/landing/PreviewTasks';
import PreviewTeam from '@/components/landing/PreviewTeam';
import PreviewClients from '@/components/landing/PreviewClients';
import PreviewAnalytics from '@/components/landing/PreviewAnalytics';
import PreviewRevenue from '@/components/landing/PreviewRevenue';

const Features = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const featuresData = [
    {
      id: 'project-management',
      title: 'Project Management',
      icon: FolderKanban,
      shortDescription: 'Organize and track all your projects with intuitive tools',
      longDescription: 'Take control of your agency projects with powerful project management tools. Track progress, manage timelines, and ensure every project stays on schedule and within budget. Our intuitive interface makes it easy to visualize project status at a glance.',
      benefits: [
        'Intuitive kanban boards for visual workflow management',
        'Timeline views to track project milestones and deadlines',
        'Real-time progress tracking with completion percentages',
        'Custom project statuses and workflows tailored to your agency',
        'Team member assignment and workload distribution',
        'Client project portfolio views',
      ],
      component: PreviewProjects,
      color: 'blue',
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      icon: Users,
      shortDescription: 'Manage your team efficiently with workload tracking',
      longDescription: 'Build high-performing teams with comprehensive team management features. Track workloads, manage skills, and ensure optimal resource allocation across all projects. Keep your team balanced and productive with real-time availability insights.',
      benefits: [
        'Real-time team member availability status tracking',
        'Workload tracking to prevent burnout and optimize productivity',
        'Skills management to match team capabilities with project needs',
        'Role-based permissions and access control for security',
        'Team performance analytics and reporting',
        'Contact information and communication tools',
      ],
      component: PreviewTeam,
      color: 'purple',
    },
    {
      id: 'task-tracking',
      title: 'Task Tracking',
      icon: CheckSquare,
      shortDescription: 'Never miss a deadline with comprehensive task management',
      longDescription: 'Stay on top of every detail with powerful task tracking tools. Organize tasks by priority, track due dates, and ensure nothing falls through the cracks. Our kanban-style board makes it easy to see what needs to be done at a glance.',
      benefits: [
        'Kanban board with To Do, In Progress, and Done columns',
        'Priority levels (High, Medium, Low) for better organization',
        'Due date tracking with visual calendar integration',
        'Task assignment and ownership management',
        'Status updates and progress tracking',
        'Quick task completion and inline editing',
      ],
      component: PreviewTasks,
      color: 'emerald',
    },
    {
      id: 'client-management',
      title: 'Client Management',
      icon: Briefcase,
      shortDescription: 'Keep all client information organized in one place',
      longDescription: 'Maintain strong client relationships with centralized client management. Store contact details, track project history, and monitor revenue per client. Everything you need to deliver exceptional client service.',
      benefits: [
        'Complete client contact information database',
        'Active and inactive client status tracking',
        'Project count and history per client',
        'Revenue tracking and financial overview',
        'Email and phone contact management',
        'Client communication logs and notes',
      ],
      component: PreviewClients,
      color: 'orange',
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      icon: BarChart3,
      shortDescription: 'Make data-driven decisions with comprehensive analytics',
      longDescription: 'Transform your data into actionable insights with our comprehensive analytics dashboard. Track key metrics across projects, teams, clients, and revenue to make informed decisions that drive your agency forward.',
      benefits: [
        'Comprehensive metrics across all agency operations',
        'Real-time data visualization and reporting',
        'Key performance indicators at a glance',
        'Team, client, project, and task analytics',
        'Trend analysis and growth tracking',
        'Customizable dashboard views',
      ],
      component: PreviewAnalytics,
      color: 'pink',
    },
    {
      id: 'revenue-insights',
      title: 'Revenue Insights',
      icon: DollarSign,
      shortDescription: 'Track financial performance with revenue analytics',
      longDescription: 'Monitor your agency\'s financial health with detailed revenue insights. Track monthly trends, identify growth opportunities, and understand your revenue streams. Make strategic decisions backed by clear financial data.',
      benefits: [
        'Monthly revenue tracking and visualization',
        'Growth percentage and trend analysis',
        'Revenue comparison across time periods',
        'Project-based revenue breakdown',
        'Financial forecasting and projections',
        'Clear visual charts and graphs',
      ],
      component: PreviewRevenue,
      color: 'teal',
    },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900' 
        : 'bg-white'
    }`}>
      {/* Navigation */}
      <nav className={`fixed top-0 w-full backdrop-blur-md border-b z-50 ${
        theme === 'dark' 
          ? 'bg-white/10 border-white/20' 
          : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link to="/">
                  <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    SpiderWebsCoded
                  </h1>
                </Link>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/features" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Features
                </Link>
                <Link to="/solutions" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Solutions
                </Link>
                <Link to="/blog" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
                }`}>
                  Blog
                </Link>
              </div>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`focus:outline-none ${
                  theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`md:hidden backdrop-blur-md border-t ${
            theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/90 border-gray-200'
          }`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/features" className={`block px-3 py-2 rounded-md text-base font-medium ${
                theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
              }`}>
                Features
              </Link>
              <Link to="/solutions" className={`block px-3 py-2 rounded-md text-base font-medium ${
                theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
              }`}>
                Solutions
              </Link>
              <Link to="/blog" className={`block px-3 py-2 rounded-md text-base font-medium ${
                theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-700 hover:text-blue-600'
              }`}>
                Blog
              </Link>
              <Link to="/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className={`mb-6 px-6 py-3 text-sm font-semibold ${
            theme === 'dark' 
              ? 'bg-white/20 text-white border-white/30' 
              : 'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            Features
          </Badge>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-6 break-words ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              {' '}Modern Agencies
            </span>
          </h1>
          <p className={`text-xl sm:text-2xl max-w-3xl mx-auto mb-8 ${
            theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            Everything you need to manage projects, teams, clients, and grow your agency efficiently
          </p>
          <Link to="/login" state={{ isSignUp: true }}>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 text-lg rounded-xl shadow-xl">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Sections */}
      {featuresData.map((feature, index) => {
        const isEven = index % 2 === 0;
        const FeatureIcon = feature.icon;
        
        return (
          <section
            key={feature.id}
            id={feature.id}
            className={`py-16 ${
              theme === 'dark'
                ? isEven ? 'bg-slate-900/50' : 'bg-slate-800/30'
                : isEven ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                isEven ? '' : 'lg:grid-flow-dense'
              }`}>
                {/* Text Content */}
                <div className={isEven ? '' : 'lg:col-start-2'}>
                  <Badge className={`mb-4 px-4 py-2 text-xs font-semibold ${
                    theme === 'dark' 
                      ? 'bg-white/20 text-white border-white/30' 
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>
                    Feature {index + 1}
                  </Badge>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      feature.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      feature.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      feature.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/20' :
                      feature.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      feature.color === 'pink' ? 'bg-pink-100 dark:bg-pink-900/20' :
                      'bg-teal-100 dark:bg-teal-900/20'
                    }`}>
                      <FeatureIcon className={`h-8 w-8 ${
                        feature.color === 'blue' ? 'text-blue-600' :
                        feature.color === 'purple' ? 'text-purple-600' :
                        feature.color === 'emerald' ? 'text-emerald-600' :
                        feature.color === 'orange' ? 'text-orange-600' :
                        feature.color === 'pink' ? 'text-pink-600' :
                        'text-teal-600'
                      }`} />
                    </div>
                    <h2 className={`text-3xl sm:text-4xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h2>
                  </div>

                  <p className={`text-lg mb-6 leading-relaxed ${
                    theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {feature.longDescription}
                  </p>

                  <div className="space-y-3 mb-8">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Key Benefits:
                    </h3>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            feature.color === 'blue' ? 'text-blue-500' :
                            feature.color === 'purple' ? 'text-purple-500' :
                            feature.color === 'emerald' ? 'text-emerald-500' :
                            feature.color === 'orange' ? 'text-orange-500' :
                            feature.color === 'pink' ? 'text-pink-500' :
                            'text-teal-500'
                          }`} />
                          <span className={`text-base ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to="/login" state={{ isSignUp: true }}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-base rounded-xl shadow-lg">
                      Get Started with {feature.title}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Preview Component */}
                <div className={isEven ? 'lg:col-start-2' : 'lg:col-start-1 lg:row-start-1'}>
                  <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
                    <feature.component theme={theme} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Final CTA Section */}
      <section className={`py-24 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' 
          : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 break-words ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Experience
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {' '}All These Features?
            </span>
          </h2>
          <p className={`text-lg sm:text-xl mb-8 max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            Join thousands of agencies using SpiderWebsCoded to streamline their operations and grow their business
          </p>
          <Link to="/login" state={{ isSignUp: true }}>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-12 py-6 text-xl rounded-2xl shadow-2xl">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          <p className={`text-base mt-6 ${
            theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
          }`}>
            <CheckCircle className="inline h-5 w-5 text-green-400 mr-2" />
            No credit card required • Free forever plan • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 border-t ${
        theme === 'dark' 
          ? 'bg-slate-900 text-gray-300 border-white/10' 
          : 'bg-gray-100 text-gray-600 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link to="/" className={`text-xl font-bold mb-4 inline-block ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            SpiderWebsCoded
          </Link>
          <p className={`text-sm ${theme === 'dark' ? 'text-blue-100' : 'text-gray-600'}`}>
            © 2025 SpiderWebsCoded. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Features;

