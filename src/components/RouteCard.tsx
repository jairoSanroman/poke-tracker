import { GameRoute, Player, Pokemon } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { MapPin, Plus, Link2 } from 'lucide-react';

interface RouteCardProps {
  route: GameRoute;
  players: Player[];
  pokemon: Pokemon[];
  onAddCapture: () => void;
}

const resultLabels: Record<string, { label: string; className: string }> = {
  captured: { label: 'Capturado', className: 'status-captured' },
  failed: { label: 'Fallo', className: 'status-failed' },
  repeated: { label: 'Repetido', className: 'text-muted-foreground bg-muted' },
  ko: { label: 'KO', className: 'status-ko' },
};

const routeStatusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-muted text-muted-foreground' },
  completed: { label: 'Completada', className: 'status-captured' },
  no_encounter: { label: 'Sin encuentro', className: 'bg-muted text-muted-foreground' },
  blocked: { label: 'Bloqueada', className: 'status-ko' },
};

export function RouteCard({ route, players, pokemon, onAddCapture }: RouteCardProps) {
  const statusInfo = routeStatusLabels[route.status] || routeStatusLabels.pending;

  return (
    <div className="glass-card p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm">{route.name}</h3>
            <span className={`status-badge text-[10px] mt-0.5 ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        <button
          onClick={onAddCapture}
          className="touch-target w-8 h-8 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-150 flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {route.captures.length > 0 ? (
        <div className={`rounded-xl overflow-hidden ${route.captures.length > 1 ? 'border border-primary/15 bg-primary/[0.03]' : ''}`}>
          {route.captures.length > 1 && (
            <div className="flex items-center gap-1 px-3 pt-2 pb-1">
              <Link2 className="w-3 h-3 text-primary/60" />
              <span className="text-[9px] font-medium text-primary/60 uppercase tracking-wider">Grupo vinculado</span>
            </div>
          )}
          <div className="space-y-1 p-1.5">
            {route.captures.map(capture => {
              const player = players.find(p => p.id === capture.playerId);
              const poke = pokemon.find(p => p.id === capture.pokemonId);
              const rInfo = resultLabels[capture.result] || resultLabels.captured;

              if (!player) return null;

              return (
                <div key={capture.playerId} className="flex items-center gap-2 bg-card/80 rounded-lg px-3 py-2">
                  <PlayerBadge player={player} size="sm" />
                  {poke ? (
                    <>
                      <img
                        src={poke.imageUrl}
                        alt={poke.species}
                        className="w-8 h-8 pixelated"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {poke.species}
                          {poke.nickname && <span className="text-muted-foreground ml-1">"{poke.nickname}"</span>}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Sin captura</p>
                    </div>
                  )}
                  <span className={`status-badge text-[10px] ${rInfo.className}`}>{rInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">Sin capturas aún</p>
      )}
    </div>
  );
}
