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
          className={`${s.container} rounded-full object-cover border-2 transition-transform duration-150 hover:scale-110`}
          style={{ borderColor: player.color }}
        />
      ) : (
        <div
          className={`${s.container} rounded-full flex items-center justify-center font-bold text-primary-foreground border-2 border-foreground/10 transition-transform duration-150 hover:scale-110 ${s.text} font-body`}
          style={{ backgroundColor: player.color }}
        >
          {player.initials}
        </div>
      )}
      {showLabel && (
        <span className="text-sm font-bold text-foreground font-body">{player.initials}</span>
      )}
    </div>
  );
}
