import { Player } from '@/types/pokemon';

interface PlayerBadgeProps {
  player: Player;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeMap = {
  sm: { container: 'w-6 h-6', text: 'text-[9px]' },
  md: { container: 'w-8 h-8', text: 'text-xs' },
  lg: { container: 'w-12 h-12', text: 'text-sm' },
};

export function PlayerBadge({ player, size = 'md', showLabel = false }: PlayerBadgeProps) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-1.5">
      {player.avatar ? (
        <img
          src={player.avatar}
          alt={player.initials}
          className={`${s.container} rounded-full object-cover ring-2 ring-offset-1 ring-offset-background transition-transform duration-150 hover:scale-110`}
          style={{ ringColor: player.color } as any}
        />
      ) : (
        <div
          className={`${s.container} rounded-full flex items-center justify-center font-bold text-primary-foreground shadow-sm transition-transform duration-150 hover:scale-110 ${s.text}`}
          style={{ backgroundColor: player.color }}
        >
          {player.initials}
        </div>
      )}
      {showLabel && (
        <span className="text-sm font-medium text-foreground">{player.initials}</span>
      )}
    </div>
  );
}
