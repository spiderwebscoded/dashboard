import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowRight,
  CheckCircle,
  FolderKanban,
  Users,
  Briefcase,
  BarChart3,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Target,
  Sparkles,
  Menu,
  X,
  Star,
  Sun,
  Moon,
} from 'lucide-react';
import PreviewDashboard from '@/components/landing/PreviewDashboard';
import PreviewProjects from '@/components/landing/PreviewProjects';
import PreviewTasks from '@/components/landing/PreviewTasks';
import PreviewTeam from '@/components/landing/PreviewTeam';
import PreviewAnalytics from '@/components/landing/PreviewAnalytics';
import PreviewClients from '@/components/landing/PreviewClients';
import PreviewRevenue from '@/components/landing/PreviewRevenue';
import Navbar from '@/components/landing/Navbar';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDemoView, setActiveDemoView] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [signupEmail, setSignupEmail] = useState('');
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleQuickSignup = () => {
    if (signupEmail.trim()) {
      navigate('/login', { 
        state: { 
          isSignUp: true, 
          prefillEmail: signupEmail 
        } 
      });
    } else {
      navigate('/login', { state: { isSignUp: true } });
    }
  };

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Show floating CTA after scrolling past hero
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  const demoViews = [
    { name: 'Dashboard', type: 'dashboard' as const },
    { name: 'Projects', type: 'projects' as const },
    { name: 'Tasks', type: 'tasks' as const },
    { name: 'Team', type: 'team' as const },
    { name: 'Analytics', type: 'analytics' as const },
  ];

  const renderDemoComponent = (type: string, theme: 'dark' | 'light') => {
    switch (type) {
      case 'dashboard':
        return <PreviewDashboard theme={theme} />;
      case 'projects':
        return <PreviewProjects theme={theme} />;
      case 'tasks':
        return <PreviewTasks theme={theme} />;
      case 'team':
        return <PreviewTeam theme={theme} />;
      case 'analytics':
        return <PreviewAnalytics theme={theme} />;
      default:
        return <PreviewDashboard theme={theme} />;
    }
  };

  const features = [
    {
      icon: FolderKanban,
      title: 'Project Management',
      description: 'Organize and track all your projects with intuitive kanban boards, timeline views, and progress tracking',
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      component: PreviewProjects,
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage your team efficiently with workload tracking, skill management, and real-time availability status',
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      component: PreviewTeam,
    },
    {
      icon: CheckSquare,
      title: 'Task Tracking',
      description: 'Never miss a deadline with comprehensive task management, priorities, and calendar integration',
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20',
      component: PreviewTasks,
    },
    {
      icon: Briefcase,
      title: 'Client Management',
      description: 'Keep all client information organized with contact details, project history, and communication logs',
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      component: PreviewClients,
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Make data-driven decisions with comprehensive analytics, custom reports, and insightful visualizations',
      color: 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
      component: PreviewAnalytics,
    },
    {
      icon: DollarSign,
      title: 'Revenue Insights',
      description: 'Track financial performance with revenue analytics, growth metrics, and profitability reports',
      color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
      component: PreviewRevenue,
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: '10x Productivity',
      description: 'Streamline workflows and boost team efficiency',
      stat: '+250%',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security for your data',
      stat: '99.9%',
    },
    {
      icon: Target,
      title: 'Goal Focused',
      description: 'Track progress and achieve objectives',
      stat: '100%',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds and get instant access to your personalized dashboard',
    },
    {
      number: '02',
      title: 'Set Up Your Workspace',
      description: 'Add your team members, clients, and projects to get organized',
    },
    {
      number: '03',
      title: 'Start Managing',
      description: 'Track progress, assign tasks, and watch your productivity soar',
    },
  ];

  return (
    <div className={`min-h-screen overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900' 
        : 'bg-white'
    }`}>
      {/* Navigation */}
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tight mb-8 break-words">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
               Your All-In-One Agency
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Management Platform
              </span>
            </h1>

            {/* Quick Signup Input - Moved below headline */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 max-w-2xl mx-auto px-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={`flex-1 px-6 py-3 text-base ${
                  theme === 'dark' 
                    ? 'bg-white/10 border-white/20 text-white placeholder:text-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              <Button
                onClick={handleQuickSignup}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Dashboard Preview - Moved after headline */}
          <div className="mt-12 mb-12 relative">
            <div className="relative mx-auto max-w-6xl transform hover:scale-[1.02] transition-transform duration-500">
              <PreviewDashboard theme={theme} />
            </div>
          </div>

          {/* CTA After Dashboard Preview */}
          <div className="text-center mt-8 mb-6">
            <Link to="/login" state={{ isSignUp: true }}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 text-lg rounded-xl shadow-xl">
                <span className="hidden sm:inline">Try It Free - No Credit Card Required</span>
                <span className="sm:hidden">Try It Free</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <p className={`text-xl sm:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed px-4 ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}>
              Track projects, manage teams, handle clients, and analyze performance with a single powerful dashboard. 
              Built for modern agencies that want to scale efficiently.
            </p>
            
            <div className="flex justify-center items-center mb-12 px-4">
              <Link to="/login" state={{ isSignUp: true }}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 sm:px-12 py-6 text-lg sm:text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
            
            <p className={`text-base sm:text-lg px-4 ${
              theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
            }`}>
              <CheckCircle className="inline h-5 w-5 text-green-400 mr-2" />
              No credit card required • Free forever plan • Setup in 2 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 backdrop-blur-sm ${
        theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>10K+</div>
              <div className={`text-sm sm:text-base ${
                theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
              }`}>Projects Managed</div>
            </div>
            <div>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>5K+</div>
              <div className={`text-sm sm:text-base ${
                theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
              }`}>Happy Users</div>
            </div>
            <div>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>99.9%</div>
              <div className={`text-sm sm:text-base ${
                theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
              }`}>Uptime</div>
            </div>
            <div>
              <div className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>24/7</div>
              <div className={`text-sm sm:text-base ${
                theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
              }`}>Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className={`py-24 ${
        theme === 'dark' ? 'bg-gradient-to-br from-slate-900 to-blue-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className={`mb-6 px-6 py-3 text-sm font-semibold ${
              theme === 'dark' 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>Interactive Demo</Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              See SpiderWebsCoded in
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Action</span>
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}>
              Explore different views and features of our platform
            </p>
          </div>

          <div className={`backdrop-blur-md rounded-3xl border p-4 sm:p-6 md:p-8 ${
            theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-gray-50 border-gray-200'
          }`}>
            {/* Demo Tabs */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
              {demoViews.map((view, index) => (
                <button
                  key={index}
                  onClick={() => setActiveDemoView(index)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base ${
                    activeDemoView === index
                      ? 'bg-blue-600 text-white shadow-lg'
                      : theme === 'dark'
                      ? 'bg-white/20 text-blue-100 hover:bg-white/30'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {view.name}
                </button>
              ))}
            </div>

            {/* Demo Component */}
            <div className={`relative overflow-hidden rounded-2xl border ${
              theme === 'dark' ? 'bg-white/5 border-white/20' : 'bg-white border-gray-200'
            }`}>
              <div className="w-full max-h-[600px] overflow-y-auto">
                {renderDemoComponent(demoViews[activeDemoView].type, theme)}
              </div>
            </div>
          </div>

          {/* CTA After Interactive Demo */}
          <div className="text-center mt-8">
            <p className={`text-lg mb-4 ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}>
              See how easy it is to manage your agency
            </p>
            <Link to="/login" state={{ isSignUp: true }}>
              <Button size="lg" className={`px-10 py-4 text-lg rounded-xl shadow-xl border-2 ${
                theme === 'dark'
                  ? 'bg-white text-blue-600 hover:bg-gray-100 border-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
              }`}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`py-24 ${
        theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-cyan-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className={`mb-6 px-6 py-3 text-sm font-semibold ${
              theme === 'dark' 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>Features</Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}>
              Powerful features designed to help you manage your business, team, and projects with ease
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border-2 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden ${
                  theme === 'dark'
                    ? 'border-white/20 bg-white/10 hover:border-blue-400/50'
                    : 'border-gray-200 bg-white hover:border-blue-400'
                }`}
              >
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className={`text-xl sm:text-2xl mb-4 break-words ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{feature.title}</CardTitle>
                  <CardDescription className={`text-base sm:text-lg leading-relaxed ${
                    theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative overflow-hidden rounded-xl h-48">
                    <div className="absolute inset-0 overflow-y-auto scrollbar-thin">
                      <feature.component theme={theme} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA After Features */}
          <div className="text-center mt-12">
            <h3 className={`text-2xl font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to streamline your agency?
            </h3>
            <Link to="/login" state={{ isSignUp: true }}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-10 py-4 text-lg rounded-xl shadow-xl">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-24 ${
        theme === 'dark' ? 'bg-gradient-to-br from-blue-900 to-slate-900' : 'bg-gradient-to-br from-gray-50 to-blue-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className={`border-2 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
                theme === 'dark'
                  ? 'border-white/20 bg-white/10 hover:border-cyan-400/50'
                  : 'border-gray-200 bg-white hover:border-cyan-400'
              }`}>
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/20 mb-8">
                    <benefit.icon className="h-10 w-10 text-cyan-400" />
                  </div>
                  <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{benefit.stat}</div>
                  <h3 className={`text-xl sm:text-2xl font-semibold mb-4 break-words ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{benefit.title}</h3>
                  <p className={`text-base sm:text-lg ${
                    theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                  }`}>{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA After Benefits */}
          <div className="text-center mt-12">
            <Link to="/login" state={{ isSignUp: true }}>
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-10 py-4 text-lg rounded-xl shadow-xl">
                <span className="hidden sm:inline">Join Thousands of Successful Agencies</span>
                <span className="sm:hidden">Join Now</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-24 ${
        theme === 'dark' ? 'bg-gradient-to-br from-slate-800 to-blue-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className={`mb-6 px-6 py-3 text-sm font-semibold ${
              theme === 'dark' 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>Simple Process</Badge>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 break-words ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Get Started in
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> 3 Easy Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center text-3xl font-bold mb-8 shadow-2xl">
                    {step.number}
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-semibold mb-6 break-words ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>{step.title}</h3>
                  <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${
                    theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                  }`}>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r ${
                    theme === 'dark' ? 'from-cyan-200/30 to-blue-200/30' : 'from-cyan-300/50 to-blue-300/50'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-24 ${
        theme === 'dark' ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 break-words ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Transform Your
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Business?</span>
          </h2>
          <p className={`text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
          }`}>
            Join thousands of agencies who have already improved their productivity and project delivery with SpiderWebsCoded
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Link to="/login" state={{ isSignUp: true }} className="w-full sm:w-auto">
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 sm:px-12 md:px-16 py-6 sm:py-8 text-lg sm:text-xl md:text-2xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto">
                Start Free Today
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
          <p className={`text-base sm:text-lg md:text-xl ${
            theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
          }`}>
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold underline">
              Sign in here
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 border-t ${
        theme === 'dark' 
          ? 'bg-slate-900 text-gray-300 border-white/10' 
          : 'bg-gray-100 text-gray-600 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className={`text-3xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>SpiderWebsCoded</h3>
              <p className={`text-lg mb-6 max-w-md ${
                theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
              }`}>
                The complete Agency Management Platform that helps you organize, track, and scale your operations.
              </p>
              <div className="flex space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                  <Star className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                  <Star className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                  <Star className={`h-5 w-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Features</Link></li>
                <li><Link to="/solutions" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Solutions</Link></li>
                <li><Link to="/blog" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Blog</Link></li>
                <li><Link to="/login" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Help Center</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Contact Us</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Documentation</a></li>
                <li><a href="#" className={`transition-colors ${
                  theme === 'dark' ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}>Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t mt-12 pt-8 text-center ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          }`}>
            <p className={theme === 'dark' ? 'text-blue-100' : 'text-gray-600'}>
              © 2025 SpiderWebsCoded. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA Bar - appears after scroll */}
      {showFloatingCTA && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 py-4 shadow-2xl transition-all duration-300 ${
          theme === 'dark' ? 'bg-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to transform your agency?
            </p>
            <Link to="/login" state={{ isSignUp: true }}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl whitespace-nowrap">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
