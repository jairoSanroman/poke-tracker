import { Player } from '@/types/pokemon';

interface PlayerBadgeProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function PlayerBadge({ player, size = 'md', showLabel = false }: PlayerBadgeProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-primary-foreground shadow-sm transition-transform duration-150 hover:scale-110`}
        style={{ backgroundColor: player.color }}
      >
        {player.initials}
      </div>
      {showLabel && (
        <span className="text-sm font-medium text-foreground">{player.initials}</span>
      )}
    </div>
  );
}
