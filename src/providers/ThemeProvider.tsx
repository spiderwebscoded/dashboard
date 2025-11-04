
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemePreference, saveThemePreference } from '@/services/profileService';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isThemeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      // First check localStorage for immediate theme application
      const savedTheme = localStorage.getItem('theme') as Theme;
      
      if (savedTheme) {
        setThemeState(savedTheme);
      }
      
      // Then try to load from database (for authenticated users)
      try {
        const dbTheme = await getThemePreference();
        if (dbTheme && dbTheme !== savedTheme) {
          setThemeState(dbTheme);
          localStorage.setItem('theme', dbTheme);
        }
      } catch (error) {
        // Ignore errors - user might not be authenticated
      }
      
      // If still no theme, check system preference
      if (!savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setThemeState(prefersDark ? 'dark' : 'light');
      }
      
      setIsThemeLoaded(true);
    };
    
    loadTheme();
  }, []);

  useEffect(() => {
    if (isThemeLoaded) {
      // Add transition class
      document.documentElement.classList.add('color-theme-in-transition');
      
      // Update localStorage
      localStorage.setItem('theme', theme);
      
      // Sync to database (fire and forget)
      saveThemePreference(theme).catch(() => {
        // Ignore errors - user might not be authenticated
      });
      
      // Update document class
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Remove transition class
      const timeoutId = setTimeout(() => {
        document.documentElement.classList.remove('color-theme-in-transition');
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme, isThemeLoaded]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isThemeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
