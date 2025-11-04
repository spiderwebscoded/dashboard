import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Code,
  Briefcase,
  HardHat,
  HeartPulse,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import IndustryCard from '@/components/solutions/IndustryCard';

const Solutions = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const industries = [
    {
      name: 'Marketing & Creative Agencies',
      description:
        'Streamline campaign management, client relationships, and creative workflows with tools built for modern marketing teams.',
      icon: Palette,
      features: ['Campaign Tracking', 'Creative Projects', 'Client Portal', 'Content Calendar'],
      link: '/solutions/marketing',
      iconColor: 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
    },
    {
      name: 'Software Development',
      description:
        'Manage sprints, track bugs, coordinate releases, and keep your development team aligned with agile project management.',
      icon: Code,
      features: ['Sprint Planning', 'Code Reviews', 'Bug Tracking', 'Release Management'],
      link: '/solutions/software',
      iconColor: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
    },
    {
      name: 'Consulting Firms',
      description:
        'Track client engagements, manage billable hours, deliver insights, and scale your consulting practice efficiently.',
      icon: Briefcase,
      features: ['Engagement Tracking', 'Billable Hours', 'Advisory Projects', 'Client Reports'],
      link: '/solutions/consulting',
      iconColor: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    },
    {
      name: 'Construction & Engineering',
      description:
        'Coordinate projects, manage sites, track materials, and ensure safety compliance across all your construction projects.',
      icon: HardHat,
      features: ['Project Planning', 'Site Management', 'Material Tracking', 'Safety Compliance'],
      link: '/solutions/construction',
      iconColor: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    },
    {
      name: 'Healthcare & Medical',
      description:
        'Improve patient care, coordinate staff, manage facilities, and ensure compliance with healthcare-specific project tools.',
      icon: HeartPulse,
      features: ['Patient Programs', 'Staff Coordination', 'Facility Management', 'HIPAA Compliance'],
      link: '/solutions/healthcare',
      iconColor: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
    },
  ];

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
                <Link
                  to="/features"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-white hover:text-blue-300'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Features
                </Link>
                <Link
                  to="/solutions"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-blue-300'
                      : 'text-blue-600'
                  }`}
                >
                  Solutions
                </Link>
                <Link
                  to="/blog"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'text-white hover:text-blue-300'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
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
                  theme === 'dark'
                    ? 'text-white hover:text-blue-300'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden backdrop-blur-md border-t ${
              theme === 'dark'
                ? 'bg-white/10 border-white/20'
                : 'bg-white/90 border-gray-200'
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/features"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  theme === 'dark'
                    ? 'text-white hover:text-blue-300'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Features
              </Link>
              <Link
                to="/solutions"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  theme === 'dark'
                    ? 'text-blue-300'
                    : 'text-blue-600'
                }`}
              >
                Solutions
              </Link>
              <Link
                to="/blog"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  theme === 'dark'
                    ? 'text-white hover:text-blue-300'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge
              className={`mb-6 px-6 py-3 text-sm font-semibold ${
                theme === 'dark'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              Industry Solutions
            </Badge>
            <h1
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Built for
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                {' '}
                Your Industry
              </span>
            </h1>
            <p
              className={`text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed ${
                theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              Discover how SpiderWebsCoded adapts to the unique needs of your
              industry with specialized workflows, features, and tools.
            </p>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 py-12 backdrop-blur-sm rounded-3xl ${
              theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
            }`}
          >
            <div className="text-center">
              <div
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                5+
              </div>
              <div
                className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
                }`}
              >
                Industries Served
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                15K+
              </div>
              <div
                className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
                }`}
              >
                Active Projects
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                98%
              </div>
              <div
                className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
                }`}
              >
                Satisfaction Rate
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-4xl md:text-5xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                24/7
              </div>
              <div
                className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-blue-200' : 'text-gray-600'
                }`}
              >
                Support Available
              </div>
            </div>
          </div>

          {/* Industry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {industries.slice(0, 3).map((industry, index) => (
              <IndustryCard
                key={index}
                name={industry.name}
                description={industry.description}
                icon={industry.icon}
                features={industry.features}
                link={industry.link}
                theme={theme}
                iconColor={industry.iconColor}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {industries.slice(3).map((industry, index) => (
              <IndustryCard
                key={index}
                name={industry.name}
                description={industry.description}
                icon={industry.icon}
                features={industry.features}
                link={industry.link}
                theme={theme}
                iconColor={industry.iconColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`py-24 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800 to-blue-900'
            : 'bg-gradient-to-br from-blue-50 to-cyan-50'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-8 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Ready to Transform Your
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {' '}
              Business?
            </span>
          </h2>
          <p
            className={`text-lg sm:text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-blue-100' : 'text-gray-600'
            }`}
          >
            Join thousands of organizations who have already improved their
            productivity with SpiderWebsCoded
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login" state={{ isSignUp: true }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-12 py-8 text-xl rounded-2xl shadow-2xl"
              >
                Start Free Today
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

export default Solutions;


