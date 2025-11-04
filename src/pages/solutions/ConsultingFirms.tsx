import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ArrowRight, Sun, Moon, Quote, Menu, X } from 'lucide-react';
import IndustryHero from '@/components/solutions/IndustryHero';
import PreviewClients from '@/components/landing/PreviewClients';
import PreviewProjects from '@/components/landing/PreviewProjects';
import PreviewRevenue from '@/components/landing/PreviewRevenue';
import PreviewTeam from '@/components/landing/PreviewTeam';
import PreviewAnalytics from '@/components/landing/PreviewAnalytics';
import { mockProjects, mockTeamMembers, mockClients, mockRevenue, mockAnalytics } from '@/data/consultingMockData';

const ConsultingFirms = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Prepare stats for analytics and revenue preview
  const stats = {
    revenue: {
      total: mockRevenue.reduce((sum, month) => sum + month.revenue, 0),
      thisMonth: mockRevenue[mockRevenue.length - 1].revenue,
      lastMonth: mockRevenue[mockRevenue.length - 2].revenue,
      growth: parseFloat((((mockRevenue[mockRevenue.length - 1].revenue - mockRevenue[mockRevenue.length - 2].revenue) / mockRevenue[mockRevenue.length - 2].revenue) * 100).toFixed(1)),
    },
    projects: { total: mockProjects.length, inProgress: mockProjects.filter(p => p.status === 'In Progress').length },
    clients: { total: mockClients.length, active: mockClients.filter(c => c.status === 'active').length },
    tasks: { total: 0, completed: 0 },
    teamMembers: { total: mockTeamMembers.length, available: mockTeamMembers.filter(m => m.status === 'available').length },
  };

  const revenueData = mockRevenue.map(item => ({
    month: item.month,
    revenue: item.revenue,
    projects: mockProjects.filter(p => p.status === 'In Progress').length,
  }));

  const features = [
    {
      title: 'Client Engagement Management',
      description: 'Track client relationships, manage engagement history, and maintain detailed records of all interactions.',
      component: PreviewClients,
      data: { clients: mockClients },
    },
    {
      title: 'Advisory Project Tracking',
      description: 'Manage consulting engagements, track deliverables, and ensure timely completion of all advisory projects.',
      component: PreviewProjects,
      data: { projects: mockProjects },
    },
    {
      title: 'Revenue & Billing Insights',
      description: 'Monitor billable hours, track engagement profitability, and analyze revenue across all client projects.',
      component: PreviewRevenue,
      data: { stats, revenueData },
    },
    {
      title: 'Consultant Team Management',
      description: 'Coordinate consultants, track utilization rates, manage expertise areas, and optimize team allocation.',
      component: PreviewTeam,
      data: { teamMembers: mockTeamMembers },
    },
    {
      title: 'Practice Analytics',
      description: 'Measure engagement success, analyze consultant performance, and track key practice metrics.',
      component: PreviewAnalytics,
      data: { stats, revenueData },
    },
  ];

  const benefits = [
    {
      stat: '65%',
      label: 'Higher Utilization',
      description: 'More billable hours through better planning',
    },
    {
      stat: '88%',
      label: 'Client Retention',
      description: 'Exceptional service leads to long-term clients',
    },
    {
      stat: '2.5x',
      label: 'Faster Proposals',
      description: 'Reuse knowledge and accelerate new engagements',
    },
  ];

  const testimonial = {
    quote: "SpiderWebsCoded revolutionized how we manage client engagements. Our utilization rates are up 40% and clients love the transparency.",
    author: 'Dr. Robert Mitchell',
    role: 'Managing Partner',
    company: 'Strategic Advisory Group',
  };

  return (
    <div
      className={`min-h-screen overflow-x-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-sky-900'
          : 'bg-white'
      }`}
    >
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full backdrop-blur-md border-b z-50 ${
          theme === 'dark'
            ? 'bg-white/10 border-white/20'
            : 'bg-white/90 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <h1
                  className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  SpiderWebsCoded
                </h1>
              </Link>
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
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
                }`}>
                  Solutions
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
                theme === 'dark' ? 'text-blue-300' : 'text-blue-600'
              }`}>
                Solutions
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
      <IndustryHero
        title="Consulting Firm Solutions"
        subtitle="Management Consulting"
        description="Comprehensive engagement management tools designed to help consulting firms deliver exceptional results and maximize profitability."
        icon={Briefcase}
        stats={[
          { label: 'Client Engagements', value: '6,200+' },
          { label: 'Consulting Firms', value: '450+' },
          { label: 'Avg Utilization', value: '78%' },
          { label: 'ROI Improvement', value: '+52%' },
        ]}
        theme={theme}
        iconColor="text-purple-600 bg-purple-100 dark:bg-purple-900/20"
      />

      {/* Features Section */}
      <section
        className={`py-24 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800 to-blue-900'
            : 'bg-gradient-to-br from-blue-50 to-cyan-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              className={`mb-6 px-6 py-3 text-sm font-semibold ${
                theme === 'dark'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              Key Features
            </Badge>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Built for{' '}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Strategic Impact
              </span>
            </h2>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div key={index}>
                <h3
                  className={`text-2xl font-bold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-lg mb-6 ${
                    theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {feature.description}
                </p>
                <div
                  className={`rounded-2xl border overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/20'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <feature.component theme={theme} {...feature.data} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        className={`py-24 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-900 to-slate-900'
            : 'bg-gradient-to-br from-gray-50 to-blue-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Real Results for Consultancies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className={`border-2 backdrop-blur-md ${
                  theme === 'dark'
                    ? 'border-white/20 bg-white/10'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent`}
                  >
                    {benefit.stat}
                  </div>
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {benefit.label}
                  </h3>
                  <p
                    className={`${
                      theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
                    }`}
                  >
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section
        className={`py-24 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800 to-blue-900'
            : 'bg-white'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card
            className={`border-2 backdrop-blur-md ${
              theme === 'dark'
                ? 'border-white/20 bg-white/10'
                : 'border-gray-200 bg-white'
            }`}
          >
            <CardContent className="p-12">
              <Quote
                className={`h-12 w-12 mb-6 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              />
              <p
                className={`text-2xl mb-8 leading-relaxed ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                "{testimonial.quote}"
              </p>
              <div>
                <p
                  className={`font-semibold text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {testimonial.author}
                </p>
                <p
                  className={`${
                    theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
                  }`}
                >
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-24 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'
            : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Ready to Optimize Your
            <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              {' '}
              Practice?
            </span>
          </h2>
          <p
            className={`text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}
          >
            Join leading consulting firms maximizing engagement value with
            SpiderWebsCoded
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" state={{ isSignUp: true }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-12 border-t ${
          theme === 'dark'
            ? 'bg-slate-900 text-gray-300 border-white/10'
            : 'bg-gray-100 text-gray-600 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className={theme === 'dark' ? 'text-blue-100' : 'text-gray-600'}>
            © 2025 SpiderWebsCoded. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ConsultingFirms;


