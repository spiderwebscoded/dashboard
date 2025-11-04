import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isAuthenticated?: boolean;
  onNavigateToDashboard?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  mobileMenuOpen,
  setMobileMenuOpen,
  isAuthenticated = false,
  onNavigateToDashboard,
}) => {
  return (
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
            {isAuthenticated && onNavigateToDashboard ? (
              <Button 
                onClick={onNavigateToDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Dashboard
              </Button>
            ) : (
              <Link to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Sign In
                </Button>
              </Link>
            )}
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
            {isAuthenticated && onNavigateToDashboard ? (
              <Button 
                onClick={onNavigateToDashboard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
              >
                Dashboard
              </Button>
            ) : (
              <Link to="/login" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

