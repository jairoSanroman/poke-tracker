import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { getPokemonArtwork } from '@/data/pokemon';
import { Input } from '@/components/ui/input';
import { Skull, Sparkles, Search } from 'lucide-react';

export default function CemeteryPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');


  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const allFallen = run.pokemon
    .filter(p => p.status === 'dead' || p.status === 'ko')
    .slice()
    .reverse();

  const fallen = playerFilter === 'all'
    ? allFallen
    : allFallen.filter(p => p.playerId === playerFilter);

  const playerById = Object.fromEntries(run.players.map(p => [p.id, p]));
  const routeById = Object.fromEntries(run.routes.map(r => [r.id, r]));

  const countByPlayer = (id: string) => allFallen.filter(p => p.playerId === id).length;

  return (
    <GameLayout title="⚰️ Cementerio">
      <div className="min-h-[60vh] -mx-4 px-4 py-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl border-2 border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_rgba(148,163,184,0.3),_transparent_60%)]" />

        <div className="relative space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 py-4">
            <div className="flex justify-center">
              <Skull className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="font-heading text-sm sm:text-base text-slate-200 leading-relaxed">
              Cementerio de los Caídos
            </h2>
            <p className="text-xs text-slate-400 font-body italic max-w-md mx-auto">
              "Aquellos que dieron su vida por la aventura. Que su sacrificio nunca sea olvidado."
            </p>
          </div>

          {/* Player filter */}
          {run.players.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setPlayerFilter('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-body font-bold border-2 transition-all ${
                  playerFilter === 'all'
                    ? 'bg-slate-200 text-slate-900 border-slate-200'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                Todos ({allFallen.length})
              </button>
              {run.players.map(player => {
                const active = playerFilter === player.id;
                return (
                  <button
                    key={player.id}
                    onClick={() => setPlayerFilter(player.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-body font-bold border-2 transition-all flex items-center gap-2 ${
                      active
                        ? 'text-white'
                        : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                    style={active ? { backgroundColor: player.color, borderColor: player.color } : {}}
                  >
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white"
                      style={{ backgroundColor: active ? 'rgba(0,0,0,0.3)' : player.color }}
                    >
                      {player.initials}
                    </span>
                    {player.initials} ({countByPlayer(player.id)})
                  </button>
                );
              })}
            </div>
          )}

          {fallen.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center">
                <Sparkles className="w-12 h-12 text-amber-300 animate-pulse" />
              </div>
              <h3 className="font-heading text-xs sm:text-sm text-amber-200 leading-relaxed">
                {playerFilter === 'all' ? '¡Ninguna baja!' : 'Sin caídos para este entrenador'}
              </h3>
              <p className="text-xs text-slate-300 font-body max-w-sm mx-auto">
                {playerFilter === 'all'
                  ? 'Tu equipo permanece intacto. Sigue así, entrenador. La leyenda apenas comienza.'
                  : 'Este entrenador aún no ha sufrido pérdidas. Que la suerte le acompañe.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fallen.map(pokemon => {
                const player = playerById[pokemon.playerId];
                const route = routeById[pokemon.routeId];
                return (
                  <div
                    key={pokemon.id}
                    className="relative bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-2 border-slate-700 rounded-t-[40px] rounded-b-lg p-4 pt-6 flex flex-col items-center text-center shadow-lg hover:border-slate-500 transition-colors"
                  >
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-600 text-xl select-none">
                      ✝
                    </div>

                    <div className="w-20 h-20 mt-4 mb-2 grayscale opacity-70">
                      <img
                        src={getPokemonArtwork(pokemon.speciesId)}
                        alt={pokemon.species}
                        className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = pokemon.imageUrl || '/placeholder.svg';
                        }}
                      />
                    </div>

                    <p className="font-heading text-[9px] text-slate-300 leading-relaxed">
                      Aquí descansa
                    </p>
                    <p className="font-heading text-[10px] sm:text-xs text-slate-100 leading-relaxed mt-1">
                      {pokemon.nickname || pokemon.species}
                    </p>
                    {pokemon.nickname && (
                      <p className="text-[10px] text-slate-400 font-body italic">
                        ({pokemon.species})
                      </p>
                    )}

                    <div className="w-full border-t border-slate-700 my-3" />

                    <div className="space-y-1 text-[10px] font-body text-slate-400 w-full">
                      <p>
                        <span className="text-slate-500">Caído en:</span>{' '}
                        <span className="text-slate-200">{route?.name ?? 'Ruta desconocida'}</span>
                      </p>
                      {player && (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-slate-500">Entrenador:</span>
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                            style={{ backgroundColor: player.color }}
                          >
                            {player.initials}
                          </span>
                        </div>
                      )}
                      <p className="italic text-slate-500 pt-1">
                        ✦ Descanse en paz ✦
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
