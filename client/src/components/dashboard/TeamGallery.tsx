import { Link } from 'wouter';
import { ClipboardList, CalendarPlus, UserPlus, LineChart } from 'lucide-react';
import { BaseWidget } from '@/components/ui/base-widget';

interface TeamGalleryProps {
  className?: string;
}

export default function TeamGallery({ className }: TeamGalleryProps) {
  return (
    <BaseWidget 
      title="Team Gallery" 
      description="Team photos and quick actions"
      className={className}
      contentClassName="p-6"
    >
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <img 
            src="https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
            alt="Netball team members posing" 
            className="w-full h-24 object-cover rounded" 
          />
          <img 
            src="https://images.unsplash.com/photo-1590556409324-aa1d726e5c3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
            alt="Players during practice" 
            className="w-full h-24 object-cover rounded" 
          />
          <img 
            src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
            alt="Team celebrating a win" 
            className="w-full h-24 object-cover rounded" 
          />
          <img 
            src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
            alt="Coach instructing team" 
            className="w-full h-24 object-cover rounded" 
          />
        </div>
        
        <h4 className="text-sm font-medium text-gray-600 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/roster">
            <a className="flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-colors p-4 rounded text-primary text-center">
              <ClipboardList className="w-5 h-5 mb-2" />
              <span className="text-sm font-semibold">Manage Roster</span>
            </a>
          </Link>
          
          <Link href="/games/new">
            <a className="flex flex-col items-center justify-center bg-secondary/5 hover:bg-secondary/10 transition-colors p-4 rounded text-secondary text-center">
              <CalendarPlus className="w-5 h-5 mb-2" />
              <span className="text-sm font-semibold">Add Game</span>
            </a>
          </Link>
          
          <Link href="/players/new">
            <a className="flex flex-col items-center justify-center bg-accent/5 hover:bg-accent/10 transition-colors p-4 rounded text-accent text-center">
              <UserPlus className="w-5 h-5 mb-2" />
              <span className="text-sm font-semibold">Add Player</span>
            </a>
          </Link>
          
          <Link href="/statistics">
            <a className="flex flex-col items-center justify-center bg-neutral-dark/5 hover:bg-neutral-dark/10 transition-colors p-4 rounded text-neutral-dark text-center">
              <LineChart className="w-5 h-5 mb-2" />
              <span className="text-sm font-semibold">View Stats</span>
            </a>
          </Link>
        </div>
    </BaseWidget>
  );
}
