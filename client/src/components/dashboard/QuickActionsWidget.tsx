import { Link } from 'wouter';
import { 
  CalendarPlus, 
  UserPlus, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Download 
} from 'lucide-react';
import { BaseWidget } from '@/components/ui/base-widget';
import { Button } from '@/components/ui/button';

interface QuickActionsWidgetProps {
  className?: string;
  gameId?: string;
}

export function QuickActionsWidget({ className, gameId }: QuickActionsWidgetProps) {
  console.log('QuickActionsWidget rendering');
  const actions = [
    {
      icon: CalendarPlus,
      label: 'Add Game',
      href: '/games/new',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Schedule new game'
    },
    {
      icon: UserPlus,
      label: 'Add Player',
      href: '/players/new',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Register new player'
    },
    {
      icon: ClipboardList,
      label: 'Manage Roster',
      href: `/roster/${gameId}`,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Set team lineup'
    },
    {
      icon: BarChart3,
      label: 'View Stats',
      href: '/statistics',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Performance data'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Configure app'
    },
    {
      icon: Download,
      label: 'Export Data',
      href: '/data-management',
      color: 'bg-teal-500 hover:bg-teal-600',
      description: 'Backup & export'
    }
  ];

  return (
    <BaseWidget title="Quick Actions" className={className}>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className={`
                  h-auto p-3 flex flex-col items-center justify-center space-y-2 
                  hover:shadow-md transition-all duration-200 group
                  border-gray-200 hover:border-gray-300
                `}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-900 group-hover:text-gray-700">
                    {action.label}
                  </div>
                  <div className="text-[10px] text-gray-500 group-hover:text-gray-600">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          );
        })}
      </div>
    </BaseWidget>
  );
}

export default QuickActionsWidget;