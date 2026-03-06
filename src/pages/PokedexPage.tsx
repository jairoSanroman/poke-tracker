import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { PokemonCard } from '@/components/PokemonCard';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Input } from '@/components/ui/input';
import { Search, Skull } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pokemon, PokemonStatus } from '@/types/pokemon';
import { getPokemonArtwork, getPokemonSprite } from '@/data/kanto';
import { useRunCaptures, useUpdateCaptureStatus, useInsertCapture, CaptureRow } from '@/hooks/useCaptures';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function PokedexPage() {
  const { getActiveRun, activeRunId, updatePokemon } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [editNickname, setEditNickname] = useState('');

  // Death flow state
  const [deathModalOpen, setDeathModalOpen] = useState(false);
  const [linkedCaptures, setLinkedCaptures] = useState<CaptureRow[]>([]);
  const [loadingDeath, setLoadingDeath] = useState(false);

  const { data: dbCaptures = [] } = useRunCaptures(activeRunId);
  const updateStatus = useUpdateCaptureStatus();
  const insertCapture = useInsertCapture();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  // Merge local pokemon with DB status (DB is source of truth for status)
  const mergedPokemon = run.pokemon.map(p => {
    const dbCapture = dbCaptures.find(c => c.id === p.id);
    if (dbCapture) {
      return { ...p, status: dbCapture.status as PokemonStatus };
    }
    return p;
  });

  const statuses = [
    { value: 'all', label: 'Todos' },
    { value: 'captured', label: 'Capturados' },
    { value: 'in_team', label: 'En equipo' },
    { value: 'dead', label: 'Muertos' },
    { value: 'ko', label: 'KO' },
    { value: 'seen', label: 'Vistos' },
  ];

  const filtered = mergedPokemon.filter(p => {
    if (search && !p.species.toLowerCase().includes(search.toLowerCase()) && !(p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (playerFilter !== 'all' && p.playerId !== playerFilter) return false;
    return true;
  });

  const handleStatusChange = (pokemonId: string, status: PokemonStatus) => {
    if (!activeRunId) return;
    updatePokemon(activeRunId, pokemonId, { status });
    // Also update in DB
    const dbCapture = dbCaptures.find(c => c.id === pokemonId);
    if (dbCapture) {
      updateStatus.mutate({ id: pokemonId, status });
    }
    setSelectedPokemon(prev => prev && prev.id === pokemonId ? { ...prev, status } : prev);
  };

  const handleSaveNickname = () => {
    if (!activeRunId || !selectedPokemon) return;
    updatePokemon(activeRunId, selectedPokemon.id, { nickname: editNickname || undefined });
    setSelectedPokemon(prev => prev ? { ...prev, nickname: editNickname || undefined } : prev);
  };

  const handleMarkDead = async (pokemon: Pokemon) => {
    if (!activeRunId) return;
    setLoadingDeath(true);

    try {
      // Ensure this capture exists in DB
      let dbCapture = dbCaptures.find(c => c.id === pokemon.id);
      if (!dbCapture) {
        // Insert into DB first
        await insertCapture.mutateAsync({
          id: pokemon.id,
          run_id: activeRunId,
          player_id: pokemon.playerId,
          route_id: pokemon.routeId,
          species: pokemon.species,
          species_id: pokemon.speciesId,
          nickname: pokemon.nickname || '',
          image_url: pokemon.imageUrl,
          origin_type: 'route',
          origin_id: pokemon.routeId,
          status: 'dead',
        });
      } else {
        // Update status to dead
        await updateStatus.mutateAsync({ id: pokemon.id, status: 'dead' });
      }

      // Update local store
      updatePokemon(activeRunId, pokemon.id, { status: 'dead' as PokemonStatus });

      // Fetch linked captures (same origin_type + origin_id, different player)
      const originType = dbCapture?.origin_type || 'route';
      const originId = dbCapture?.origin_id || pokemon.routeId;

      const { data: linked, error } = await supabase
        .from('captures')
        .select('*')
        .eq('origin_type', originType)
        .eq('origin_id', originId)
        .neq('player_id', pokemon.playerId);

      if (error) throw error;

      setLinkedCaptures(linked || []);
      setSelectedPokemon({ ...pokemon, status: 'dead' as PokemonStatus });
      setDeathModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Error al marcar como muerto');
    } finally {
      setLoadingDeath(false);
    }
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedPokemon && !deathModalOpen} onOpenChange={v => { if (!v) setSelectedPokemon(null); }}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm max-h-[85vh] overflow-y-auto">
          {selectedPokemon && (() => {
            const player = run.players.find(p => p.id === selectedPokemon.playerId);
            const route = run.routes.find(r => r.id === selectedPokemon.routeId);
            const isDead = selectedPokemon.status === 'dead';
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading flex items-center gap-2">
                    {selectedPokemon.species}
                    <span className="text-sm text-muted-foreground font-normal">
                      #{String(selectedPokemon.speciesId).padStart(3, '0')}
                    </span>
                    {isDead && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-destructive">
                        <Skull className="w-3.5 h-3.5" /> Muerto
                      </span>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <img
                    src={getPokemonArtwork(selectedPokemon.speciesId)}
                    alt={selectedPokemon.species}
                    className={`w-32 h-32 object-contain drop-shadow-lg ${isDead ? 'grayscale opacity-50' : ''}`}
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
                              disabled={isDead}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                                selectedPokemon.status === s
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                              } ${isDead ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                              {labels[s]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mark as dead button */}
                    {!isDead && (
                      <button
                        onClick={() => handleMarkDead(selectedPokemon)}
                        disabled={loadingDeath}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/20 transition-all duration-150 active:scale-[0.98]"
                      >
                        <Skull className="w-4 h-4" />
                        {loadingDeath ? 'Marcando...' : 'Marcar como muerto'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Death linked modal */}
      <Dialog open={deathModalOpen} onOpenChange={v => { if (!v) { setDeathModalOpen(false); setLinkedCaptures([]); } }}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2 text-destructive">
              <Skull className="w-5 h-5" />
              Pokémon muerto
            </DialogTitle>
          </DialogHeader>

          {selectedPokemon && (
            <div className="flex flex-col items-center gap-4 py-2">
              <img
                src={getPokemonArtwork(selectedPokemon.speciesId)}
                alt={selectedPokemon.species}
                className="w-24 h-24 object-contain grayscale opacity-50"
                onError={(e) => { (e.target as HTMLImageElement).src = selectedPokemon.imageUrl; }}
              />
              <p className="text-sm font-semibold text-center">
                {selectedPokemon.species}
                {selectedPokemon.nickname && <span className="text-muted-foreground ml-1">"{selectedPokemon.nickname}"</span>}
                <span className="block text-xs text-muted-foreground mt-0.5">ha muerto</span>
              </p>

              <div className="w-full border-t border-border pt-3">
                {linkedCaptures.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3 text-center">
                      Este Pokémon estaba vinculado con los siguientes Pokémon del otro jugador:
                    </p>
                    <div className="space-y-2">
                      {linkedCaptures.map(cap => {
                        const player = run.players.find(p => p.id === cap.player_id);
                        return (
                          <div key={cap.id} className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5 border border-border/50">
                            <img
                              src={cap.species_id ? getPokemonSprite(cap.species_id) : cap.image_url || '/placeholder.svg'}
                              alt={cap.species}
                              className="w-10 h-10 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{cap.species}</p>
                              {cap.nickname && <p className="text-xs text-muted-foreground truncate">"{cap.nickname}"</p>}
                            </div>
                            {player && <PlayerBadge player={player} size="sm" />}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Este Pokémon no tiene Pokémon vinculados de otros jugadores.
                  </p>
                )}
              </div>

              <button
                onClick={() => { setDeathModalOpen(false); setLinkedCaptures([]); setSelectedPokemon(null); }}
                className="w-full gradient-primary text-primary-foreground font-semibold py-2.5 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                Entendido
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}
