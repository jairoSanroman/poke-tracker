import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { LivesCounter } from '@/components/LivesCounter';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Map, BookOpen, Users, ChevronRight, Link2, Shuffle } from 'lucide-react';
import { useEffect } from 'react';
import { REGIONS } from '@/data/regions';
import { Progress } from '@/components/ui/progress';

function getRivalryBadge(deaths: number): string {
  if (deaths === 0) return '🏆 Imbatible';
  if (deaths <= 2) return '😬 Con suerte…';
  if (deaths <= 4) return '💀 Descuidado';
  if (deaths <= 7) return '☠️ Desastre ambulante';
  return '🪦 Leyenda del caos';
}

export default function DashboardPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const completedRoutes = run.routes.filter(r => r.status === 'completed').length;
  const totalCaptures = run.pokemon.filter(p => p.status === 'captured' || p.status === 'in_team' || p.status === 'boxed').length;
  const teamPokemon = run.pokemon.filter(p => p.status === 'in_team');

  const runTypeInfo = (run.runType || 'soul_link') === 'randomlocke'
    ? { label: 'Randomlocke', icon: Shuffle, className: 'bg-accent/20 text-accent-foreground border-accent/30' }
    : { label: 'Soul Link', icon: Link2, className: 'bg-primary/20 text-primary border-primary/30' };

  // Rivalry data
  const playerDeaths = run.players.map(p => ({
    player: p,
    deaths: run.pokemon.filter(pk => pk.playerId === p.id && (pk.status === 'dead' || pk.status === 'ko')).length,
  })).sort((a, b) => b.deaths - a.deaths);

  const maxDeaths = Math.max(...playerDeaths.map(p => p.deaths), 1);
  const minDeaths = Math.min(...playerDeaths.map(p => p.deaths));
  const isTied = playerDeaths.length >= 2 && playerDeaths[0].deaths === playerDeaths[playerDeaths.length - 1].deaths;

  const quickLinks = [
    { to: '/routes', icon: Map, label: 'Rutas', desc: `${completedRoutes}/${run.routes.length} completadas`, color: 'bg-primary/10 text-primary border-primary/20' },
    { to: '/pokedex', icon: BookOpen, label: 'Pokédex', desc: `${totalCaptures} capturados`, color: 'bg-destructive/10 text-destructive border-destructive/20' },
    { to: '/players', icon: Users, label: 'Jugadores', desc: `${run.players.length} jugador${run.players.length !== 1 ? 'es' : ''}`, color: 'bg-accent/10 text-accent-foreground border-accent/20' },
  ];

  return (
    <GameLayout title={run.name} gradient>
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border font-body ${runTypeInfo.className}`}>
            <runTypeInfo.icon className="w-3.5 h-3.5" />
            {runTypeInfo.label}
          </span>
          {(() => {
            const rInfo = REGIONS.find(r => r.id === (run.region || 'kanto'));
            return rInfo ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border font-body bg-muted/50 border-border">
                {rInfo.emoji} {rInfo.name}
              </span>
            ) : null;
          })()}
        </div>

        <LivesCounter />

        {run.players.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {run.players.map(p => (
              <PlayerBadge key={p.id} player={p} size="md" showLabel />
            ))}
          </div>
        )}

        <div className="space-y-2">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="w-full glass-card p-4 flex items-center gap-3 pokemon-hover transition-all duration-150 active:scale-[0.98] border-2 border-border"
            >
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center border`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-heading text-[8px] leading-relaxed">{label}</p>
                <p className="text-xs text-muted-foreground font-body">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {teamPokemon.length > 0 && (
          <div>
            <h2 className="font-heading text-[8px] text-muted-foreground uppercase leading-relaxed mb-3">Equipo actual</h2>
            <div className="grid grid-cols-3 gap-2">
              {teamPokemon.slice(0, 6).map(poke => {
                const player = run.players.find(p => p.id === poke.playerId);
                return (
                  <div key={poke.id} className="glass-card p-3 flex flex-col items-center gap-1 border-2 border-border pokemon-hover">
                    {player && <PlayerBadge player={player} size="sm" />}
                    <img
                      src={poke.imageUrl}
                      alt={poke.species}
                      className="w-12 h-12 pixelated"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <span className="text-[9px] font-bold text-center font-body">{poke.nickname || poke.species}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rivalidad Section */}
        {run.players.length >= 2 && (
          <div>
            <h2 className="font-heading text-[8px] text-muted-foreground uppercase leading-relaxed mb-3">⚔️ Rivalidad</h2>
            <div className="glass-card border-2 border-border p-4 space-y-3">
              {isTied && (
                <div className="text-center">
                  <span className="inline-block text-xs font-bold font-body px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent-foreground">
                    ⚔️ Empate técnico
                  </span>
                </div>
              )}
              {playerDeaths.map((pd, idx) => {
                const isWorst = !isTied && idx === 0 && pd.deaths > 0;
                const isBest = !isTied && pd.deaths === minDeaths;
                return (
                  <div key={pd.player.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <PlayerBadge player={pd.player} size="sm" />
                        <span className="text-xs font-bold font-body">{pd.player.initials}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-body text-muted-foreground">{pd.deaths} 💀</span>
                        {isWorst && (
                          <span className="text-[9px] font-bold font-body px-2 py-0.5 rounded-full bg-destructive/15 border border-destructive/25 text-destructive">
                            {getRivalryBadge(pd.deaths)}
                          </span>
                        )}
                        {isBest && (
                          <span className="text-[9px] font-bold font-body px-2 py-0.5 rounded-full bg-primary/15 border border-primary/25 text-primary">
                            😎 Va ganando
                          </span>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={maxDeaths > 0 ? (pd.deaths / maxDeaths) * 100 : 0}
                      className="h-2.5 rounded-full"
                      style={{
                        '--progress-color': pd.player.color,
                      } as React.CSSProperties}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}