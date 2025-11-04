import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IndustryCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  link: string;
  theme?: 'dark' | 'light';
  iconColor: string;
}

const IndustryCard: React.FC<IndustryCardProps> = ({
  name,
  description,
  icon: Icon,
  features,
  link,
  theme = 'dark',
  iconColor,
}) => {
  const isDark = theme === 'dark';

  return (
    <Card
      className={`border-2 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group h-full flex flex-col ${
        isDark
          ? 'border-white/20 bg-white/10 hover:border-blue-400/50'
          : 'border-gray-200 bg-white hover:border-blue-400'
      }`}
    >
      <CardHeader className="flex-1">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${iconColor} mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle
          className={`text-2xl mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {name}
        </CardTitle>
        <CardDescription
          className={`text-lg leading-relaxed mb-6 ${
            isDark ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {description}
        </CardDescription>
        <div className="space-y-2">
          {features.map((feature, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`mr-2 ${
                isDark
                  ? 'border-white/30 text-blue-200'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {feature}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Link to={link}>
          <Button
            className={`w-full ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            Learn More
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default IndustryCard;


