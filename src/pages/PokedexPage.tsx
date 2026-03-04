import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { PokemonCard } from '@/components/PokemonCard';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pokemon, PokemonStatus } from '@/types/pokemon';
import { getPokemonArtwork } from '@/data/kanto';

export default function PokedexPage() {
  const { getActiveRun, activeRunId, updatePokemon } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [editNickname, setEditNickname] = useState('');

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const statuses = [
    { value: 'all', label: 'Todos' },
    { value: 'captured', label: 'Capturados' },
    { value: 'in_team', label: 'En equipo' },
    { value: 'ko', label: 'KO' },
    { value: 'seen', label: 'Vistos' },
  ];

  const filtered = run.pokemon.filter(p => {
    if (search && !p.species.toLowerCase().includes(search.toLowerCase()) && !(p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (playerFilter !== 'all' && p.playerId !== playerFilter) return false;
    return true;
  });

  const handleStatusChange = (pokemonId: string, status: PokemonStatus) => {
    if (!activeRunId) return;
    updatePokemon(activeRunId, pokemonId, { status });
    setSelectedPokemon(prev => prev && prev.id === pokemonId ? { ...prev, status } : prev);
  };

  const handleSaveNickname = () => {
    if (!activeRunId || !selectedPokemon) return;
    updatePokemon(activeRunId, selectedPokemon.id, { nickname: editNickname || undefined });
    setSelectedPokemon(prev => prev ? { ...prev, nickname: editNickname || undefined } : prev);
  };

  return (
    <GameLayout title="Pokédex">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o mote..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-xl" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                statusFilter === s.value ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {run.players.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                playerFilter === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
              }`}
            >
              Todos
            </button>
            {run.players.map(p => (
              <button
                key={p.id}
                onClick={() => setPlayerFilter(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                  playerFilter === p.id ? 'ring-2 ring-offset-1 ring-offset-background' : 'opacity-60'
                }`}
                style={{ backgroundColor: p.color, color: '#fff' }}
              >
                {p.initials}
              </button>
            ))}
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map(poke => {
              const player = run.players.find(p => p.id === poke.playerId);
              return (
                <PokemonCard
                  key={poke.id}
                  pokemon={poke}
                  player={player}
                  onClick={() => { setSelectedPokemon(poke); setEditNickname(poke.nickname || ''); }}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-12">
            {run.pokemon.length === 0 ? 'Sin Pokémon registrados. ¡Ve a Rutas para capturar!' : 'Sin resultados'}
          </p>
        )}
      </div>

      <Dialog open={!!selectedPokemon} onOpenChange={v => { if (!v) setSelectedPokemon(null); }}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm max-h-[85vh] overflow-y-auto">
          {selectedPokemon && (() => {
            const player = run.players.find(p => p.id === selectedPokemon.playerId);
            const route = run.routes.find(r => r.id === selectedPokemon.routeId);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading flex items-center gap-2">
                    {selectedPokemon.species}
                    <span className="text-sm text-muted-foreground font-normal">
                      #{String(selectedPokemon.speciesId).padStart(3, '0')}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <img
                    src={getPokemonArtwork(selectedPokemon.speciesId)}
                    alt={selectedPokemon.species}
                    className="w-32 h-32 object-contain drop-shadow-lg"
                    onError={(e) => { (e.target as HTMLImageElement).src = selectedPokemon.imageUrl; }}
                  />

                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Mote"
                        value={editNickname}
                        onChange={e => setEditNickname(e.target.value)}
                        onBlur={handleSaveNickname}
                        className="rounded-xl flex-1"
                      />
                    </div>

                    {player && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Capturado por:</span>
                        <PlayerBadge player={player} size="sm" showLabel />
                      </div>
                    )}

                    {route && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ruta: </span>
                        <span className="font-medium">{route.name}</span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Estado</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['captured', 'in_team', 'boxed', 'ko', 'seen'] as PokemonStatus[]).map(s => {
                          const labels: Record<string, string> = {
                            captured: 'Capturado', in_team: 'En equipo', boxed: 'En caja', ko: 'KO', seen: 'Visto'
                          };
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(selectedPokemon.id, s)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                                selectedPokemon.status === s
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              {labels[s]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}
