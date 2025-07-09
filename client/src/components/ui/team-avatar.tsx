
import { cn } from "@/lib/utils";
import { getTeamColorHex, getTeamAvatarGradient } from "@/lib/teamColorUtils";
import { TeamColor } from "@/lib/teamColorUtils";

interface TeamAvatarProps {
  teamName: string;
  teamColor?: TeamColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function TeamAvatar({ 
  teamName, 
  teamColor, 
  size = 'md', 
  className 
}: TeamAvatarProps) {
  // Generate team initials (up to 3 characters)
  const getTeamInitials = (name: string) => {
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    } else if (words.length === 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    }
  };

  const initials = getTeamInitials(teamName);
  const gradient = getTeamAvatarGradient(teamColor);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg'
  };

  return (
    <div 
      className={cn(
        "relative rounded-lg flex items-center justify-center font-bold text-white shadow-lg border-2 border-white/20",
        sizeClasses[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
      }}
    >
      {/* Team logo placeholder - could be replaced with actual logos */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 to-transparent" />
      
      {/* Team initials */}
      <span className="relative z-10 drop-shadow-sm">
        {initials}
      </span>
      
      {/* Subtle pattern overlay for team distinction */}
      <div className="absolute inset-0 rounded-lg opacity-20">
        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full" />
        <div className="absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full" />
        <div className="absolute bottom-1 right-1 w-1 h-1 bg-white rounded-full" />
      </div>
    </div>
  );
}
