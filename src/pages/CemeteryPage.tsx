import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { getPokemonArtwork } from '@/data/pokemon';
import { Input } from '@/components/ui/input';
import { Skull, Sparkles, Search, X } from 'lucide-react';
import type { CaptureResult } from '@/types/pokemon';

type StatusFilter = 'all' | CaptureResult;

const STATUS_OPTIONS: { value: StatusFilter; label: string; emoji: string; color: string }[] = [
  { value: 'all', label: 'Todos', emoji: '◆', color: '#94a3b8' },
  { value: 'captured', label: 'Capturado', emoji: '✓', color: '#22c55e' },
  { value: 'failed', label: 'Fallo', emoji: '✗', color: '#ef4444' },
  { value: 'repeated', label: 'Repetido', emoji: '↻', color: '#eab308' },
  { value: 'ko', label: 'KO', emoji: '☠', color: '#64748b' },
];

interface Entry {
  key: string;
  result: CaptureResult;
  playerId: string;
  routeId: string;
  pokemonId?: string;
  speciesId?: number;
  species?: string;
  nickname?: string;
  imageUrl?: string;
  order: number;
}

export default function CemeteryPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  const pokemonById = useMemo(
    () => Object.fromEntries((run?.pokemon ?? []).map(p => [p.id, p])),
    [run]
  );

  const allEntries: Entry[] = useMemo(() => {
    if (!run) return [];
    const entries: Entry[] = [];
    let order = 0;
    for (const route of run.routes) {
      for (const cap of route.captures) {
        const poke = cap.pokemonId ? pokemonById[cap.pokemonId] : undefined;
        entries.push({
          key: `${route.id}-${cap.playerId}-${cap.pokemonId ?? 'none'}-${order}`,
          result: cap.result,
          playerId: cap.playerId,
          routeId: route.id,
          pokemonId: cap.pokemonId,
          speciesId: poke?.speciesId,
          species: poke?.species,
          nickname: poke?.nickname,
          imageUrl: poke?.imageUrl,
          order: order++,
        });
      }
    }
    return entries.reverse();
  }, [run, pokemonById]);

  if (!run) return null;

  const query = search.trim().toLowerCase();
  const entries = allEntries
    .filter(e => playerFilter === 'all' || e.playerId === playerFilter)
    .filter(e => statusFilter === 'all' || e.result === statusFilter)
    .filter(e => {
      if (!query) return true;
      const name = e.nickname?.toLowerCase() || '';
      const species = e.species?.toLowerCase() || '';
      return name.includes(query) || species.includes(query);
    });

  const playerById = Object.fromEntries(run.players.map(p => [p.id, p]));
  const routeById = Object.fromEntries(run.routes.map(r => [r.id, r]));

  const countByPlayer = (id: string) =>
    allEntries.filter(e => (statusFilter === 'all' || e.result === statusFilter) && e.playerId === id).length;
  const countByStatus = (s: StatusFilter) =>
    s === 'all'
      ? allEntries.filter(e => playerFilter === 'all' || e.playerId === playerFilter).length
      : allEntries.filter(e => e.result === s && (playerFilter === 'all' || e.playerId === playerFilter)).length;

  const totalAll = allEntries.filter(e => statusFilter === 'all' || e.result === statusFilter).length;
  const isFallenView = statusFilter === 'ko' || statusFilter === 'all';

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

          {/* Status filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {STATUS_OPTIONS.map(opt => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-body font-bold border-2 transition-all flex items-center gap-1.5 ${
                    active ? 'text-white' : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                  style={active ? { backgroundColor: opt.color, borderColor: opt.color } : {}}
                >
                  <span>{opt.emoji}</span>
                  {opt.label} ({countByStatus(opt.value)})
                </button>
              );
            })}
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
                Todos ({totalAll})
              </button>
              {run.players.map(player => {
                const active = playerFilter === player.id;
                return (
                  <button
                    key={player.id}
                    onClick={() => setPlayerFilter(player.id)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-body font-bold border-2 transition-all flex items-center gap-2 ${
                      active ? 'text-white' : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-slate-500'
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

          {/* Search */}
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar por especie o mote..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-9 bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-500 text-xs h-9"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center">
                <Sparkles className="w-12 h-12 text-amber-300 animate-pulse" />
              </div>
              <h3 className="font-heading text-xs sm:text-sm text-amber-200 leading-relaxed">
                Sin resultados
              </h3>
              <p className="text-xs text-slate-300 font-body max-w-sm mx-auto">
                Prueba a cambiar los filtros o la búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {entries.map(entry => {
                const player = playerById[entry.playerId];
                const route = routeById[entry.routeId];
                const status = STATUS_OPTIONS.find(s => s.value === entry.result)!;
                const isFallen = entry.result === 'ko';
                return (
                  <div
                    key={entry.key}
                    className="relative bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-2 border-slate-700 rounded-t-[40px] rounded-b-lg p-4 pt-6 flex flex-col items-center text-center shadow-lg hover:border-slate-500 transition-colors"
                  >
                    <div
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-bold text-white flex items-center gap-1"
                      style={{ backgroundColor: status.color }}
                    >
                      <span>{status.emoji}</span>
                      {status.label}
                    </div>
                    {isFallen && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-600 text-xl select-none">
                        ✝
                      </div>
                    )}

                    <div className={`w-20 h-20 mt-4 mb-2 ${isFallen ? 'grayscale opacity-70' : ''}`}>
                      {entry.speciesId ? (
                        <img
                          src={getPokemonArtwork(entry.speciesId)}
                          alt={entry.species ?? 'Pokémon'}
                          className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]"
                          loading="lazy"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.src = entry.imageUrl || '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl text-slate-600">
                          ?
                        </div>
                      )}
                    </div>

                    {isFallen && (
                      <p className="font-heading text-[9px] text-slate-300 leading-relaxed">
                        Aquí descansa
                      </p>
                    )}
                    <p className="font-heading text-[10px] sm:text-xs text-slate-100 leading-relaxed mt-1">
                      {entry.nickname || entry.species || '—'}
                    </p>
                    {entry.nickname && entry.species && (
                      <p className="text-[10px] text-slate-400 font-body italic">({entry.species})</p>
                    )}

                    <div className="w-full border-t border-slate-700 my-3" />

                    <div className="space-y-1 text-[10px] font-body text-slate-400 w-full">
                      <p>
                        <span className="text-slate-500">{isFallen ? 'Caído en:' : 'Ruta:'}</span>{' '}
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
                      {isFallen && (
                        <p className="italic text-slate-500 pt-1">✦ Descanse en paz ✦</p>
                      )}
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
