import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { LivesCounter } from '@/components/LivesCounter';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Map, BookOpen, Users, ChevronRight, Link2, Shuffle } from 'lucide-react';
import { useEffect } from 'react';

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

  const quickLinks = [
    { to: '/routes', icon: Map, label: 'Rutas', desc: `${completedRoutes}/${run.routes.length} completadas`, color: 'bg-primary/10 text-primary border-primary/20' },
    { to: '/pokedex', icon: BookOpen, label: 'Pokédex', desc: `${totalCaptures} capturados`, color: 'bg-destructive/10 text-destructive border-destructive/20' },
    { to: '/players', icon: Users, label: 'Jugadores', desc: `${run.players.length} jugador${run.players.length !== 1 ? 'es' : ''}`, color: 'bg-accent/10 text-accent-foreground border-accent/20' },
  ];

  return (
    <GameLayout title={run.name} gradient>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md border font-body ${runTypeInfo.className}`}>
            <runTypeInfo.icon className="w-3.5 h-3.5" />
            {runTypeInfo.label}
          </span>
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
      </div>
    </GameLayout>
  );
}
