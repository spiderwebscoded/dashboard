import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface Stat {
  label: string;
  value: string;
}

interface IndustryHeroProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  stats: Stat[];
  theme?: 'dark' | 'light';
  iconColor: string;
}

const IndustryHero: React.FC<IndustryHeroProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  stats,
  theme = 'dark',
  iconColor,
}) => {
  const isDark = theme === 'dark';

  return (
    <section className="relative pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/solutions">
          <Button
            variant="ghost"
            className={`mb-8 ${
              isDark
                ? 'text-white hover:text-blue-300 hover:bg-white/10'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Solutions
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <Badge
              className={`mb-6 px-6 py-3 text-sm font-semibold ${
                isDark
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              }`}
            >
              {subtitle}
            </Badge>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h1>
            <p
              className={`text-xl sm:text-2xl leading-relaxed mb-8 ${
                isDark ? 'text-blue-100' : 'text-gray-600'
              }`}
            >
              {description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div
                    className={`text-3xl sm:text-4xl font-bold mb-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {stat.value}
                  </div>
                  <div
                    className={`text-sm sm:text-base ${
                      isDark ? 'text-blue-200' : 'text-gray-600'
                    }`}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center lg:justify-end">
            <div
              className={`inline-flex items-center justify-center w-64 h-64 rounded-3xl ${iconColor} shadow-2xl`}
            >
              <Icon className="h-32 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryHero;


