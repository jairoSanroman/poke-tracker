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
  in_team: { label: 'En equipo', className: 'bg-primary/15 text-primary border-primary/30' },
  boxed: { label: 'En caja', className: 'bg-muted text-muted-foreground border-border' },
  dead: { label: 'Muerto', className: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function PokemonCard({ pokemon, player, onClick }: PokemonCardProps) {
  const status = statusConfig[pokemon.status] || statusConfig.seen;
  const isDead = pokemon.status === 'dead';

  return (
    <button
      onClick={onClick}
      className={`glass-card p-3 flex flex-col items-center gap-1.5 pokemon-hover active:scale-95 animate-fade-scale relative group border-2 ${isDead ? 'opacity-50 grayscale' : 'border-border'}`}
    >
      {player && (
        <div className="absolute top-1.5 right-1.5">
          <PlayerBadge player={player} size="sm" />
        </div>
      )}
      {isDead && (
        <div className="absolute top-1.5 left-1.5">
          <Skull className="w-4 h-4 text-destructive" />
        </div>
      )}
      <div className="w-14 h-14 flex items-center justify-center">
        <img
          src={getPokemonArtwork(pokemon.speciesId)}
          alt={pokemon.species}
          className={`w-full h-full object-contain drop-shadow-md transition-transform duration-150 group-hover:scale-110 ${isDead ? 'grayscale' : ''}`}
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
      <span className="text-[10px] font-bold text-center leading-tight font-body">{pokemon.species}</span>
      {pokemon.nickname && (
        <span className="text-[9px] text-muted-foreground truncate max-w-full font-body">"{pokemon.nickname}"</span>
      )}
      <span className={`status-badge text-[9px] ${status.className} ${isDead ? 'flex items-center gap-0.5' : ''}`}>
        {isDead && <Skull className="w-3 h-3" />}
        {status.label}
      </span>
    </button>
  );
}
