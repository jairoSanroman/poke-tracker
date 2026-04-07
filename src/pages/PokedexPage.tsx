import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { PokemonCard } from '@/components/PokemonCard';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Input } from '@/components/ui/input';
import { Search, Skull } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pokemon, PokemonStatus } from '@/types/pokemon';
import { getPokemonArtwork, getPokemonSprite, GENERATIONS, getGeneration } from '@/data/pokemon';
import { useRunCaptures, useUpdateCaptureStatus, useInsertCapture, CaptureRow } from '@/hooks/useCaptures';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { upsertCaptureRecord } from '@/lib/capturePersistence';

export default function PokedexPage() {
  const { getActiveRun, activeRunId, updatePokemon } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [playerFilter, setPlayerFilter] = useState<string>('all');
  const [genFilter, setGenFilter] = useState<number | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [editNickname, setEditNickname] = useState('');

  const [deathModalOpen, setDeathModalOpen] = useState(false);
  const [linkedCaptures, setLinkedCaptures] = useState<CaptureRow[]>([]);
  const [loadingDeath, setLoadingDeath] = useState(false);

  const { data: dbCaptures = [] } = useRunCaptures(activeRunId);
  const updateStatus = useUpdateCaptureStatus();
  const queryClient = useQueryClient();
  const insertCapture = useInsertCapture();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

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
    if (genFilter !== null && getGeneration(p.speciesId) !== genFilter) return false;
    return true;
  });

  const handleStatusChange = (pokemonId: string, status: PokemonStatus) => {
    if (!activeRunId) return;
    updatePokemon(activeRunId, pokemonId, { status });
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
    if (!activeRunId || !run) return;
    const isSoulLink = (run.runType || 'soul_link') === 'soul_link';
    setLoadingDeath(true);

      let dbCapture = dbCaptures.find(c => c.id === pokemon.id);
      if (!dbCapture) {
        const route = run.routes.find(r => r.id === pokemon.routeId);
        if (!route) {
          updatePokemon(activeRunId, pokemon.id, { status: 'dead' as PokemonStatus });
          setSelectedPokemon({ ...pokemon, status: 'dead' as PokemonStatus });
          setLinkedCaptures([]);
          setDeathModalOpen(true);
          return;
        }

        const player = run.players.find(p => p.id === pokemon.playerId);
        const insertedCapture = await upsertCaptureRecord({
          id: pokemon.id,
          runId: activeRunId,
          playerId: pokemon.playerId,
          playerInitials: player?.initials,
          playerColor: player?.color,
          routeName: route.name,
          routeStatus: route.status,
          species: pokemon.species,
          speciesId: pokemon.speciesId,
          nickname: pokemon.nickname,
          imageUrl: pokemon.imageUrl,
          status: 'dead',
        });
        dbCapture = insertedCapture as CaptureRow;
      } else {
        await updateStatus.mutateAsync({ id: pokemon.id, status: 'dead' });
      }

      updatePokemon(activeRunId, pokemon.id, { status: 'dead' as PokemonStatus });

      console.log('[handleMarkDead] source pokemon route', {
        pokemonId: pokemon.id,
        runId: activeRunId,
        routeId: dbCapture.route_id,
        playerId: pokemon.playerId,
      });

      const { data: routeLinkedCaptures, error: linkError } = await supabase
        .from('captures')
        .select('*')
        .eq('run_id', activeRunId)
        .eq('route_id', dbCapture.route_id)
        .neq('player_id', pokemon.playerId);

      if (linkError) {
        throw linkError;
      }

      const linkedList = routeLinkedCaptures || [];
      console.log('[handleMarkDead] linked search results', linkedList);
      const linkedIdsToUpdate = linkedList
        .filter(capture => capture.status !== 'dead')
        .map(capture => capture.id);

      let updatedLinkedCaptures: CaptureRow[] = [];
      if (linkedIdsToUpdate.length > 0) {
        const { data: updatedRows, error: updateLinkedError } = await supabase
          .from('captures')
          .update({ status: 'dead' })
          .eq('run_id', activeRunId)
          .eq('route_id', dbCapture.route_id)
          .neq('player_id', pokemon.playerId)
          .neq('status', 'dead')
          .select('*');

        if (updateLinkedError) {
          throw updateLinkedError;
        }

        updatedLinkedCaptures = (updatedRows || []) as CaptureRow[];
      }

      console.log('[handleMarkDead] linked route captures', {
        runId: activeRunId,
        routeId: dbCapture.route_id,
        found: linkedList.length,
        updated: updatedLinkedCaptures.length,
      });

      linkedList.forEach((linkedCapture) => {
        updatePokemon(activeRunId, linkedCapture.id, { status: 'dead' as PokemonStatus });
      });

      await queryClient.invalidateQueries({ queryKey: ['captures', activeRunId] });
      await queryClient.refetchQueries({ queryKey: ['captures', activeRunId], exact: true });

      setLinkedCaptures(linkedList.map(lc => ({ ...lc, status: 'dead' })));
      setSelectedPokemon({ ...pokemon, status: 'dead' as PokemonStatus });
      setDeathModalOpen(true);
    } catch (err: any) {
      const msg = err?.message || err?.details || JSON.stringify(err);
      console.error('Error al marcar como muerto:', err);
      toast.error(`Error: ${msg}`);
    } finally {
      setLoadingDeath(false);
    }
  };

  return (
    <GameLayout
      title="Pokédex"
      headerRight={
        <span className="font-body text-xs text-primary-foreground/60">{mergedPokemon.length} registrados</span>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o mote..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-md border-2 font-body" />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {statuses.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-150 border font-body ${
                statusFilter === s.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setGenFilter(null)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border font-body ${genFilter === null ? 'bg-accent text-accent-foreground border-accent' : 'bg-muted text-muted-foreground border-border'}`}
          >
            Todas
          </button>
          {GENERATIONS.map(g => (
            <button
              key={g.id}
              onClick={() => setGenFilter(g.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all border font-body ${genFilter === g.id ? 'bg-accent text-accent-foreground border-accent' : 'bg-muted text-muted-foreground border-border'}`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {run.players.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setPlayerFilter('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 border font-body ${
                playerFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              Todos
            </button>
            {run.players.map(p => (
              <button
                key={p.id}
                onClick={() => setPlayerFilter(p.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-150 border font-body ${
                  playerFilter === p.id ? 'ring-2 ring-offset-1 ring-offset-background' : 'opacity-60'
                }`}
                style={{ backgroundColor: p.color, color: '#fff', borderColor: p.color }}
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
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 mb-3 opacity-30">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3"/>
                <path d="M2,50 L98,50" stroke="currentColor" strokeWidth="3"/>
                <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              {run.pokemon.length === 0 ? 'Sin Pokémon registrados. ¡Ve a Rutas para capturar!' : 'Sin resultados'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedPokemon && !deathModalOpen} onOpenChange={v => { if (!v) setSelectedPokemon(null); }}>
        <DialogContent className="rounded-xl glass-card-elevated max-w-sm max-h-[85vh] overflow-y-auto pokedex-border">
          {selectedPokemon && (() => {
            const player = run.players.find(p => p.id === selectedPokemon.playerId);
            const route = run.routes.find(r => r.id === selectedPokemon.routeId);
            const isDead = selectedPokemon.status === 'dead';
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-heading text-[10px] flex items-center gap-2 leading-relaxed">
                    {selectedPokemon.species}
                    <span className="text-[9px] text-muted-foreground font-body">
                      #{String(selectedPokemon.speciesId).padStart(3, '0')}
                    </span>
                    {isDead && (
                      <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-destructive font-body">
                        <Skull className="w-3.5 h-3.5" /> Muerto
                      </span>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className={`w-32 h-32 rounded-lg bg-muted/30 flex items-center justify-center border-2 border-border ${isDead ? 'grayscale opacity-50' : ''}`}>
                    <img
                      src={getPokemonArtwork(selectedPokemon.speciesId)}
                      alt={selectedPokemon.species}
                      className="w-28 h-28 object-contain drop-shadow-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = selectedPokemon.imageUrl; }}
                    />
                  </div>

                  <div className="w-full space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Mote"
                        value={editNickname}
                        onChange={e => setEditNickname(e.target.value)}
                        onBlur={handleSaveNickname}
                        className="rounded-md flex-1 border-2 font-body"
                      />
                    </div>

                    {player && (
                      <div className="flex items-center gap-2 text-sm font-body">
                        <span className="text-muted-foreground">Capturado por:</span>
                        <PlayerBadge player={player} size="sm" showLabel />
                      </div>
                    )}

                    {route && (
                      <div className="text-sm font-body">
                        <span className="text-muted-foreground">Ruta: </span>
                        <span className="font-bold">{route.name}</span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-body">Estado</p>
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
                              className={`px-2 py-1.5 rounded-md text-xs font-bold transition-all duration-150 border-2 font-body ${
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

                    {!isDead && (
                      <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); console.log('[UI] Marcar como muerto clicked'); handleMarkDead(selectedPokemon); }}
                        disabled={loadingDeath}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border-2 border-destructive/30 bg-destructive/10 text-destructive font-bold text-sm hover:bg-destructive/20 transition-all duration-150 active:translate-y-0.5 font-body"
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
        <DialogContent className="rounded-xl glass-card-elevated max-w-sm max-h-[85vh] overflow-y-auto border-2 border-destructive">
          <DialogHeader>
            <DialogTitle className="font-heading text-[10px] flex items-center gap-2 text-destructive leading-relaxed">
              <Skull className="w-5 h-5" />
              Pokémon muerto
            </DialogTitle>
          </DialogHeader>

          {selectedPokemon && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-24 h-24 rounded-lg bg-muted/30 flex items-center justify-center border-2 border-destructive/20 grayscale opacity-50">
                <img
                  src={getPokemonArtwork(selectedPokemon.speciesId)}
                  alt={selectedPokemon.species}
                  className="w-20 h-20 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).src = selectedPokemon.imageUrl; }}
                />
              </div>
              <p className="text-sm font-bold text-center font-body">
                {selectedPokemon.species}
                {selectedPokemon.nickname && <span className="text-muted-foreground ml-1 font-normal">"{selectedPokemon.nickname}"</span>}
                <span className="block text-xs text-muted-foreground mt-0.5 font-normal">ha muerto</span>
              </p>

              <div className="w-full border-t-2 border-border pt-3">
                {linkedCaptures.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground mb-3 text-center font-body">
                      Este Pokémon estaba vinculado con los siguientes Pokémon del otro jugador:
                    </p>
                    <div className="space-y-2">
                      {linkedCaptures.map(cap => {
                        const player = run.players.find(p => p.id === cap.player_id);
                        return (
                          <div key={cap.id} className="flex items-center gap-3 bg-muted/50 rounded-md px-3 py-2.5 border-2 border-border">
                            <img
                              src={cap.species_id ? getPokemonSprite(cap.species_id) : cap.image_url || '/placeholder.svg'}
                              alt={cap.species}
                              className="w-10 h-10 object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate font-body">{cap.species}</p>
                              {cap.nickname && <p className="text-xs text-muted-foreground truncate font-body">"{cap.nickname}"</p>}
                            </div>
                            {player && <PlayerBadge player={player} size="sm" />}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 font-body">
                    Este Pokémon no tiene Pokémon vinculados de otros jugadores.
                  </p>
                )}
              </div>

              <button
                onClick={() => { setDeathModalOpen(false); setLinkedCaptures([]); setSelectedPokemon(null); }}
                className="w-full bg-accent text-accent-foreground font-bold py-2.5 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 border-2 border-accent-foreground/10 font-body"
                style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
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
