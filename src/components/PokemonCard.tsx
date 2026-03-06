import { Pokemon, Player } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { getPokemonArtwork } from '@/data/pokemon';
import { Skull } from 'lucide-react';

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
  dead: { label: 'Muerto', className: 'bg-destructive/15 text-destructive' },
};

export function PokemonCard({ pokemon, player, onClick }: PokemonCardProps) {
  const status = statusConfig[pokemon.status] || statusConfig.seen;
  const isDead = pokemon.status === 'dead';

  return (
    <button
      onClick={onClick}
      className={`glass-card p-3 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all duration-200 active:scale-95 animate-fade-scale relative group ${isDead ? 'opacity-60 grayscale' : ''}`}
    >
      {player && (
        <div className="absolute top-2 right-2">
          <PlayerBadge player={player} size="sm" />
        </div>
      )}
      {isDead && (
        <div className="absolute top-2 left-2">
          <Skull className="w-4 h-4 text-destructive" />
        </div>
      )}
      <div className="w-16 h-16 flex items-center justify-center">
        <img
          src={getPokemonArtwork(pokemon.speciesId)}
          alt={pokemon.species}
          className={`w-full h-full object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110 ${isDead ? 'grayscale' : ''}`}
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
      <span className={`status-badge text-[10px] ${status.className} ${isDead ? 'flex items-center gap-0.5' : ''}`}>
        {isDead && <Skull className="w-3 h-3" />}
        {status.label}
      </span>
    </button>
  );
}
