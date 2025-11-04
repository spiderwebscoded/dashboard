
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: React.ReactNode;
  onAction?: () => void;
  actions?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  icon,
  onAction,
  actions
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50 h-64">
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>
      {onAction && actionLabel && (
        <Button onClick={onAction}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
      {actions}
    </div>
  );
};

export default EmptyState;
