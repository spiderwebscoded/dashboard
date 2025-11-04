import React from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface PersonalizedHeaderProps {
  className?: string;
}

const PersonalizedHeader: React.FC<PersonalizedHeaderProps> = ({ className }) => {
  const { userProfile, user } = useAuth();

  const getUserName = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Start your day strong! Track your progress here.";
    } else if (hour < 17) {
      return "Keep up the momentum! You're doing great.";
    } else {
      return "Great work today! Review your progress here.";
    }
  };

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Greeting */}
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            Hello, {getUserName()}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            Track your progress here. You're doing great!
          </p>
        </div>

        {/* Right side - Date */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedHeader;

