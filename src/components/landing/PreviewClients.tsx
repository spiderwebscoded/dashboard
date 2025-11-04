import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Briefcase, DollarSign } from 'lucide-react';
import { mockClients } from '@/data/mockData';

interface PreviewClientsProps {
  theme?: 'dark' | 'light';
  clients?: typeof mockClients;
}

const PreviewClients: React.FC<PreviewClientsProps> = ({ theme = 'dark', clients = mockClients }) => {
  const isDark = theme === 'dark';

  return (
    <div className={`w-full rounded-xl overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clients.map((client) => (
            <Card
              key={client.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className={`text-base ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {client.name}
                    </CardTitle>
                    <p className={`text-sm mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {client.company}
                    </p>
                  </div>
                  <Badge
                    variant={client.status === 'active' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {client.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                </div>

                {/* Client Metrics */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className={`h-4 w-4 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {client.projects_count} {client.projects_count === 1 ? 'project' : 'projects'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className={`h-4 w-4 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                    <span className={`text-sm font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${(client.total_revenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewClients;

