
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

const DashboardLayout = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Animation effect on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Track window resize for responsive margin
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content with fade-in animation */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          marginLeft: isMobile ? '0' : 'var(--sidebar-width, 260px)'
        }}
      >
        <Header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 shadow-sm" />
        <main className="flex-1 overflow-auto no-scrollbar pb-8">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
