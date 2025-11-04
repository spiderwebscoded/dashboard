
import React, { useState, useEffect } from 'react';
import { User, Moon, Sun, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import NotificationCenter from './NotificationCenter';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, userProfile, user } = useAuth();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Get display name from profile or fallback to email
  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';
  
  // Handle scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.scrollY;
      const isScrolledDown = currentPosition > scrollPosition && currentPosition > 50;
      
      // Only update state if it's different
      if (isScrolledDown !== !isVisible) {
        setIsVisible(!isScrolledDown);
      }
      
      setScrollPosition(currentPosition);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition, isVisible]);
  
  const handleNavigateToSettings = () => {
    navigate('/dashboard/settings');
  };
  
  const handleLogout = async () => {
    try {
      // Use the signOut function from AuthContext
      await signOut();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to the login page
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className={cn(
      "bg-white/90 dark:bg-gray-800/90 border-b border-gray-200 dark:border-gray-700 py-3 px-4 sm:px-6 flex justify-end items-center transition-all duration-300",
      isVisible ? "transform-none" : "-translate-y-full",
      scrollPosition > 20 ? "shadow-sm" : "",
      className
    )}>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
          )}
        </Button>
        
        <NotificationCenter />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 group max-w-[200px] sm:max-w-none">
              <div className="bg-blue-500 text-white p-1 rounded-full transition-transform group-hover:scale-110 duration-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <span className="font-medium text-sm dark:text-gray-200 truncate hidden sm:inline-block max-w-[120px] lg:max-w-[200px]">
                {displayName}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 dark:bg-gray-800 dark:border-gray-700 animate-scale-in">
            <DropdownMenuItem 
              className="cursor-pointer dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              onClick={handleNavigateToSettings}
            >
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem 
              className="cursor-pointer text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
