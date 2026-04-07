import { GameRoute, Player, Pokemon, RunType } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { MapPin, Plus, Link2, Skull } from 'lucide-react';

interface RouteCardProps {
  route: GameRoute;
  players: Player[];
  pokemon: Pokemon[];
  onAddCapture: () => void;
  runType?: RunType;
}

const resultLabels: Record<string, { label: string; className: string }> = {
  captured: { label: 'Capturado', className: 'status-captured' },
  failed: { label: 'Fallo', className: 'status-failed' },
  repeated: { label: 'Repetido', className: 'text-muted-foreground bg-muted border-border' },
  ko: { label: 'KO', className: 'status-ko' },
};

const routeStatusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-muted text-muted-foreground border-border' },
  completed: { label: 'Completada', className: 'status-captured' },
  no_encounter: { label: 'Sin encuentro', className: 'bg-muted text-muted-foreground border-border' },
  blocked: { label: 'Bloqueada', className: 'status-ko' },
};

export function RouteCard({ route, players, pokemon, onAddCapture, runType = 'soul_link' }: RouteCardProps) {
  const statusInfo = routeStatusLabels[route.status] || routeStatusLabels.pending;

  return (
    <div className="glass-card p-4 animate-slide-up border-2 border-border pokemon-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading text-[8px] leading-relaxed">{route.name}</h3>
            <span className={`status-badge text-[9px] mt-0.5 ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <button
          onClick={onAddCapture}
          className="touch-target w-8 h-8 rounded-lg bg-accent/20 text-accent-foreground hover:bg-accent/40 transition-colors duration-150 flex items-center justify-center border border-accent/30"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {route.captures.length > 0 ? (
        <div className={`rounded-lg overflow-hidden ${route.captures.length > 1 && runType === 'soul_link' ? 'border-2 border-primary/20 bg-primary/[0.03]' : ''}`}>
          {route.captures.length > 1 && runType === 'soul_link' && (
            <div className="flex items-center gap-1 px-3 pt-2 pb-1">
              <Link2 className="w-3 h-3 text-primary/60" />
              <span className="text-[9px] font-bold text-primary/60 uppercase tracking-wider font-body">Grupo vinculado</span>
            </div>
          )}
          <div className="space-y-1 p-1.5">
            {route.captures.map(capture => {
              const player = players.find(p => p.id === capture.playerId);
              const poke = pokemon.find(p => p.id === capture.pokemonId);
              const rInfo = resultLabels[capture.result] || resultLabels.captured;

              if (!player) return null;

              const isDead = poke?.status === 'dead';

              return (
                <div key={capture.playerId} className={`flex items-center gap-2 rounded-md px-3 py-2 border ${isDead ? 'bg-muted/60 opacity-50 border-destructive/20' : 'bg-card/80 border-border/50'}`}>
                  <PlayerBadge player={player} size="sm" />
                  {poke ? (
                    <>
                      <img
                        src={poke.imageUrl}
                        alt={poke.species}
                        className={`w-8 h-8 pixelated ${isDead ? 'grayscale' : ''}`}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate font-body ${isDead ? 'text-muted-foreground line-through' : ''}`}>
                          {poke.species}
                          {poke.nickname && <span className="text-muted-foreground ml-1 font-normal">"{poke.nickname}"</span>}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground font-body">Sin captura</p>
                    </div>
                  )}
                  {isDead ? (
                    <span className="status-badge text-[9px] bg-destructive/15 text-destructive border-destructive/30 flex items-center gap-0.5">
                      <Skull className="w-3 h-3" /> Muerto
                    </span>
                  ) : (
                    <span className={`status-badge text-[9px] ${rInfo.className}`}>{rInfo.label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2 font-body">Sin capturas aún</p>
      )}
    </div>
  );
}
