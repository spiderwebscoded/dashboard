
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, FolderKanban, BarChart3, Settings, Menu, X, ChevronRight, UserCircle, DollarSign, CheckSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    path: '/dashboard'
  }, 
  {
    title: 'Projects',
    icon: <FolderKanban className="h-5 w-5" />,
    path: '/dashboard/projects'
  },
  {
    title: 'Tasks',
    icon: <CheckSquare className="h-5 w-5" />,
    path: '/dashboard/tasks'
  },
  {
    title: 'Team',
    icon: <Users className="h-5 w-5" />,
    path: '/dashboard/team'
  }, 
  {
    title: 'Clients',
    icon: <UserCircle className="h-5 w-5" />,
    path: '/dashboard/clients'
  },
  {
    title: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/dashboard/analytics'
  },
  {
    title: 'Revenue',
    icon: <DollarSign className="h-5 w-5" />,
    path: '/dashboard/revenue'
  },
  {
    title: 'Blog',
    icon: <FileText className="h-5 w-5" />,
    path: '/dashboard/blog'
  },
  {
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    path: '/dashboard/settings'
  }
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Function to toggle collapsed state with proper state update
  const toggleCollapsed = () => {
    setCollapsed(prevState => !prevState);
  };

  // Update CSS variable when sidebar collapses/expands
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '70px' : '260px'
    );
  }, [collapsed]);

  // Initialize CSS variable on mount
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', '260px');
  }, []);
  
  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden fixed top-4 left-4 z-50" 
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar for desktop */}
      <div 
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 z-40 transition-all duration-300 shadow-sm", 
          collapsed ? "w-[70px]" : "w-[260px]", 
          "hidden md:block", 
          className
        )}
      >
        <div className="flex justify-between items-center px-5 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className={cn("transition-opacity", collapsed ? "opacity-0 w-0" : "opacity-100")}>
            <h2 className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Spider
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
          </div>
          <Button 
            variant="ghost" 
            size="default" 
            onClick={toggleCollapsed} 
            className="text-gray-500 dark:text-gray-400"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")} />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          <ul className="space-y-2">
            {sidebarItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.title}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center rounded-xl px-4 py-3 transition-all duration-200 relative group",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 font-medium",
                      collapsed ? "justify-center" : ""
                    )}
                  >
                    {isActive && !collapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                    )}
                    <span className={cn(
                      "transition-transform group-hover:scale-110",
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
                    )}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="ml-3 text-sm">{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile sidebar */}
      <div 
        className={cn(
          "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 z-40 transition-all duration-300 shadow-xl md:hidden", 
          mobileOpen ? "translate-x-0" : "-translate-x-full", 
          "w-[280px]"
        )}
      >
        <div className="flex justify-center items-center px-5 py-6 border-b border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <h2 className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              Spider
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <ul className="space-y-2">
            {sidebarItems.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.title}>
                  <Link 
                    to={item.path} 
                    className={cn(
                      "flex items-center rounded-xl px-4 py-3 transition-all duration-200 relative",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                    )}
                    <span className={isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}>
                      {item.icon}
                    </span>
                    <span className="ml-3 text-sm">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
