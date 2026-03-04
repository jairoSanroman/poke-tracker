import { Pokemon, Player } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { getPokemonArtwork } from '@/data/kanto';

interface PokemonCardProps {
  pokemon: Pokemon;
  player?: Player;
  onClick?: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  seen: { label: 'Visto', className: 'status-seen' },
  captured: { label: 'Capturado', className: 'status-captured' },
  ko: { label: 'KO', className: 'status-ko' },
  in_team: { label: 'En equipo', className: 'bg-primary/15 text-primary' },
  boxed: { label: 'En caja', className: 'bg-muted text-muted-foreground' },
};

export function PokemonCard({ pokemon, player, onClick }: PokemonCardProps) {
  const status = statusConfig[pokemon.status] || statusConfig.seen;

  return (
    <button
      onClick={onClick}
      className="glass-card p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all duration-200 active:scale-95 animate-fade-scale relative group"
    >
      {player && (
        <div className="absolute top-2 right-2">
          <PlayerBadge player={player} size="sm" />
        </div>
      )}
      <div className="w-16 h-16 flex items-center justify-center">
        <img
          src={getPokemonArtwork(pokemon.speciesId)}
          alt={pokemon.species}
          className="w-full h-full object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('sprites/pokemon/')) {
              target.src = pokemon.imageUrl;
            } else {
              target.src = '/placeholder.svg';
            }
          }}
        />
      </div>
      <span className="text-xs font-semibold text-center leading-tight">{pokemon.species}</span>
      {pokemon.nickname && (
        <span className="text-[10px] text-muted-foreground truncate max-w-full">"{pokemon.nickname}"</span>
      )}
      <span className={`status-badge text-[10px] ${status.className}`}>{status.label}</span>
    </button>
  );
}
