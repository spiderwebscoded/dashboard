import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Briefcase } from 'lucide-react';
import { mockTeamMembers } from '@/data/mockData';

interface PreviewTeamProps {
  theme?: 'dark' | 'light';
  teamMembers?: typeof mockTeamMembers;
}

const PreviewTeam: React.FC<PreviewTeamProps> = ({ theme = 'dark', teamMembers = mockTeamMembers }) => {
  const isDark = theme === 'dark';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'on_leave':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'on_leave':
        return 'On Leave';
      default:
        return status;
    }
  };

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Avatar and Status */}
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                      alt={member.name}
                      className={`w-12 h-12 rounded-full object-cover border-2 ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      }`}
                    />
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                        isDark ? 'border-gray-800' : 'border-white'
                      } ${getStatusColor(member.status)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {member.name}
                    </h3>
                    <p className={`text-xs truncate ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {member.role}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge
                  variant={member.status === 'available' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {getStatusLabel(member.status)}
                </Badge>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Briefcase className="h-3 w-3 flex-shrink-0" />
                    <span>{member.projects_count} projects</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {/* Workload Bar */}
                {member.status !== 'on_leave' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        Workload
                      </span>
                      <span className={`font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {member.current_workload}%
                      </span>
                    </div>
                    <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className={`h-full transition-all duration-300 ${
                          member.current_workload >= 90 ? 'bg-red-500' :
                          member.current_workload >= 70 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${member.current_workload}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewTeam;

