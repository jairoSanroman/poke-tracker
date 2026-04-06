import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store/gameStore';
import { getPokemonSprite, GENERATIONS, getGeneration } from '@/data/pokemon';
import { usePokemonSpecies } from '@/hooks/usePokemonSpecies';
import { Player, CaptureResult } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { Check, X, RotateCcw, Skull, Link2, Users } from 'lucide-react';
import { upsertCaptureRecord } from '@/lib/capturePersistence';

interface CaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  players: Player[];
}

const CAPTURE_RESULTS: { value: CaptureResult; label: string; icon: React.ReactNode; className: string }[] = [
  { value: 'captured', label: 'Capturado', icon: <Check className="w-4 h-4" />, className: 'bg-success/15 text-success border-success/30 hover:bg-success/25' },
  { value: 'failed', label: 'Fallo', icon: <X className="w-4 h-4" />, className: 'bg-warning/15 text-warning border-warning/30 hover:bg-warning/25' },
  { value: 'repeated', label: 'Repetido', icon: <RotateCcw className="w-4 h-4" />, className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80' },
  { value: 'ko', label: 'KO', icon: <Skull className="w-4 h-4" />, className: 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25' },
];

export function CaptureDialog({ open, onOpenChange, routeId, routeName, players }: CaptureDialogProps) {
  const { addCapture, activeRunId, getActiveRun } = useGameStore();
  const { data: allSpecies = [], isLoading: loadingSpecies } = usePokemonSpecies();
  const [search, setSearch] = useState('');
  const [genFilter, setGenFilter] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const [result, setResult] = useState<CaptureResult>('captured');
  const [step, setStep] = useState<'player' | 'pokemon' | 'details'>('player');

  const run = getActiveRun();

  const companionCaptures = run
    ? run.routes
        .find(r => r.id === routeId)
        ?.captures.filter(c => c.playerId !== selectedPlayer)
        .map(c => {
          const player = run.players.find(p => p.id === c.playerId);
          const pokemon = run.pokemon.find(p => p.id === c.pokemonId);
          return { capture: c, player, pokemon };
        })
        .filter(c => c.player) || []
    : [];

  const hasCompanionCaptures = companionCaptures.length > 0;

  const filteredPokemon = allSpecies.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (genFilter !== null) {
      const gen = getGeneration(p.id);
      if (gen !== genFilter) return false;
    }
    return true;
  });

  const reset = () => {
    setSearch('');
    setGenFilter(null);
    setSelectedPlayer(null);
    setSelectedPokemon(null);
    setNickname('');
    setResult('captured');
    setStep('player');
  };

  const handleConfirm = async () => {
    if (!activeRunId || !selectedPlayer || !selectedPokemon) return;
    const species = allSpecies.find(p => p.id === selectedPokemon);
    if (!species) return;
    const createdPokemonId = addCapture(activeRunId, routeId, selectedPlayer, selectedPokemon, species.name, nickname || undefined, result);

    const route = run?.routes.find(r => r.id === routeId);
    const createdPokemon = getActiveRun()?.pokemon.find(p => p.id === createdPokemonId);

    if (route && createdPokemon) {
      const persistedStatus = result === 'captured' ? 'caught' : result === 'ko' ? 'dead' : result === 'failed' ? 'failed' : 'seen';
      const player = players.find(p => p.id === selectedPlayer);
      await upsertCaptureRecord({
        id: createdPokemon.id,
        runId: activeRunId,
        playerId: selectedPlayer,
        playerInitials: player?.initials,
        playerColor: player?.color,
        routeName: route.name,
        routeStatus: 'pending',
        species: species.name,
        speciesId: selectedPokemon,
        nickname: nickname || undefined,
        imageUrl: createdPokemon.imageUrl,
        status: persistedStatus,
      });
    }

    reset();
    onOpenChange(false);
  };

  const CompanionSection = () => {
    if (!selectedPlayer) return null;
    return (
      <div className="rounded-lg border-2 border-primary/20 bg-primary/[0.04] p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary font-body">Capturas de compañeros en esta ruta</span>
        </div>
        {hasCompanionCaptures ? (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {companionCaptures.map(({ capture, player, pokemon }) => (
              <div key={capture.playerId} className="flex-shrink-0 w-[130px] rounded-lg border-2 border-primary/15 bg-card/80 p-2.5 flex flex-col items-center gap-1.5 relative">
                <div className="absolute top-1.5 left-1.5"><Link2 className="w-3 h-3 text-primary/50" /></div>
                <div className="absolute top-1.5 right-1.5">{player && <PlayerBadge player={player} size="sm" />}</div>
                {pokemon ? (
                  <>
                    <img src={pokemon.imageUrl} alt={pokemon.species} className="w-12 h-12 pixelated mt-1" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                    <span className="text-[11px] font-bold text-center leading-tight font-body">{pokemon.species}</span>
                    {pokemon.nickname && <span className="text-[9px] text-muted-foreground truncate max-w-full font-body">"{pokemon.nickname}"</span>}
                  </>
                ) : (
                  <div className="w-12 h-12 mt-1 rounded-lg bg-muted/50 flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground/50" /></div>
                )}
                <span className={`status-badge text-[9px] ${capture.result === 'captured' ? 'status-captured' : capture.result === 'failed' ? 'status-failed' : capture.result === 'ko' ? 'status-ko' : 'bg-muted text-muted-foreground border-border'}`}>
                  {capture.result === 'captured' ? 'Capturado' : capture.result === 'failed' ? 'Fallo' : capture.result === 'ko' ? 'KO' : 'Repetido'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 rounded-lg bg-muted/30">
            <p className="text-[11px] text-muted-foreground font-body">Aún nadie ha capturado nada aquí</p>
          </div>
        )}
        {hasCompanionCaptures && result === 'captured' && (
          <div className="flex items-center gap-1.5 mt-2.5 px-1">
            <Link2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-primary/80 font-bold font-body">Tu captura se vinculará a este grupo de ruta</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md mx-auto rounded-xl glass-card-elevated pokedex-border max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-[10px] leading-relaxed">
            {step === 'player' ? 'Seleccionar jugador' : step === 'pokemon' ? 'Elegir Pokémon' : 'Detalles de captura'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-body">{routeName}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'player' && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                {players.map(player => (
                  <button key={player.id} onClick={() => { setSelectedPlayer(player.id); setStep('pokemon'); }} className="glass-card p-4 flex flex-col items-center gap-2 pokemon-hover transition-all duration-150 active:scale-95 border-2 border-border">
                    <PlayerBadge player={player} size="lg" />
                    <span className="text-sm font-bold font-body">{player.initials}</span>
                  </button>
                ))}
              </div>
              {run && (() => {
                const allCaptures = run.routes.find(r => r.id === routeId)?.captures || [];
                if (allCaptures.length === 0) return null;
                return (
                  <div className="rounded-lg border-2 border-border bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-muted-foreground font-body">Capturas en esta ruta</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {allCaptures.map(c => {
                        const p = run.players.find(pl => pl.id === c.playerId);
                        const pk = run.pokemon.find(pm => pm.id === c.pokemonId);
                        if (!p) return null;
                        return (
                          <div key={c.playerId} className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-card/70 border-2 border-border px-3 py-2">
                            <PlayerBadge player={p} size="sm" />
                            {pk && <img src={pk.imageUrl} alt={pk.species} className="w-7 h-7 pixelated" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />}
                            <span className="text-[11px] font-bold font-body">{pk ? pk.species : 'Fallo'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {step === 'pokemon' && (
            <div className="flex flex-col gap-3 min-h-0">
              <CompanionSection />
              <Input placeholder="Buscar Pokémon..." value={search} onChange={e => setSearch(e.target.value)} className="rounded-md border-2 font-body" autoFocus />
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
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
              {loadingSpecies ? (
                <p className="text-center text-sm text-muted-foreground py-8 font-body">Cargando Pokémon...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 pr-1 max-h-[35vh] overflow-y-auto">
                  {filteredPokemon.slice(0, 60).map(poke => (
                    <button
                      key={poke.id}
                      onClick={() => { setSelectedPokemon(poke.id); setStep('details'); }}
                      className={`glass-card p-2 flex flex-col items-center gap-1 pokemon-hover transition-all duration-150 active:scale-95 border-2 ${selectedPokemon === poke.id ? 'border-accent ring-2 ring-accent/30' : 'border-border'}`}
                    >
                      <img src={getPokemonSprite(poke.id)} alt={poke.name} className="w-12 h-12 pixelated" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                      <span className="text-[10px] font-bold text-center leading-tight font-body">{poke.name}</span>
                    </button>
                  ))}
                  {filteredPokemon.length > 60 && (
                    <p className="col-span-3 text-center text-[10px] text-muted-foreground py-2 font-body">
                      +{filteredPokemon.length - 60} más. Usa el buscador para refinar.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 'details' && selectedPokemon && (
            <div className="flex flex-col gap-4 py-2">
              <CompanionSection />
              <div className="flex items-center gap-3 justify-center">
                <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center border-2 border-border">
                  <img src={getPokemonSprite(selectedPokemon)} alt="" className="w-14 h-14 pixelated" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                </div>
                <div>
                  <p className="font-heading text-[9px] leading-relaxed">{allSpecies.find(p => p.id === selectedPokemon)?.name}</p>
                  <p className="text-xs text-muted-foreground font-body">#{String(selectedPokemon).padStart(4, '0')}</p>
                </div>
              </div>
              <Input placeholder="Mote (opcional)" value={nickname} onChange={e => setNickname(e.target.value)} className="rounded-md text-center border-2 font-body" />
              <div className="grid grid-cols-2 gap-2">
                {CAPTURE_RESULTS.map(cr => (
                  <button
                    key={cr.value}
                    onClick={() => setResult(cr.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-md border-2 text-sm font-bold transition-all duration-150 font-body ${cr.className} ${result === cr.value ? 'ring-2 ring-offset-1 ring-offset-background scale-[1.02]' : 'opacity-60'}`}
                  >
                    {cr.icon}
                    {cr.label}
                  </button>
                ))}
              </div>
              <button onClick={handleConfirm} className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 flex items-center justify-center gap-2 border-2 border-accent-foreground/10 font-body" style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}>
                {hasCompanionCaptures && result === 'captured' && <Link2 className="w-4 h-4" />}
                Confirmar captura
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
