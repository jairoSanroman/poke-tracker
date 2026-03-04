import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store/gameStore';
import { KANTO_POKEMON, getPokemonSprite } from '@/data/kanto';
import { Player, CaptureResult } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { Check, X, RotateCcw, Skull, Link2, Users } from 'lucide-react';

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
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const [result, setResult] = useState<CaptureResult>('captured');
  const [step, setStep] = useState<'player' | 'pokemon' | 'details'>('player');

  const run = getActiveRun();

  // Get companion captures for this route (excluding selected player)
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

  const filteredPokemon = KANTO_POKEMON.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const reset = () => {
    setSearch('');
    setSelectedPlayer(null);
    setSelectedPokemon(null);
    setNickname('');
    setResult('captured');
    setStep('player');
  };

  const handleConfirm = () => {
    if (!activeRunId || !selectedPlayer || !selectedPokemon) return;
    const species = KANTO_POKEMON.find(p => p.id === selectedPokemon)!;
    addCapture(activeRunId, routeId, selectedPlayer, selectedPokemon, species.name, nickname || undefined, result);
    reset();
    onOpenChange(false);
  };

  const CompanionSection = () => {
    if (!selectedPlayer) return null;

    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">Capturas de compañeros en esta ruta</span>
        </div>

        {hasCompanionCaptures ? (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {companionCaptures.map(({ capture, player, pokemon }) => (
              <div
                key={capture.playerId}
                className="flex-shrink-0 w-[130px] rounded-xl border border-primary/15 bg-card/80 p-2.5 flex flex-col items-center gap-1.5 relative"
              >
                <div className="absolute top-1.5 left-1.5">
                  <Link2 className="w-3 h-3 text-primary/50" />
                </div>
                <div className="absolute top-1.5 right-1.5">
                  {player && <PlayerBadge player={player} size="sm" />}
                </div>
                {pokemon ? (
                  <>
                    <img
                      src={pokemon.imageUrl}
                      alt={pokemon.species}
                      className="w-12 h-12 pixelated mt-1"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <span className="text-[11px] font-semibold text-center leading-tight">{pokemon.species}</span>
                    {pokemon.nickname && (
                      <span className="text-[9px] text-muted-foreground truncate max-w-full">"{pokemon.nickname}"</span>
                    )}
                  </>
                ) : (
                  <div className="w-12 h-12 mt-1 rounded-lg bg-muted/50 flex items-center justify-center">
                    <X className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
                <span className={`status-badge text-[9px] ${
                  capture.result === 'captured' ? 'status-captured' :
                  capture.result === 'failed' ? 'status-failed' :
                  capture.result === 'ko' ? 'status-ko' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {capture.result === 'captured' ? 'Capturado' :
                   capture.result === 'failed' ? 'Fallo' :
                   capture.result === 'ko' ? 'KO' : 'Repetido'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 rounded-xl bg-muted/30">
            <p className="text-[11px] text-muted-foreground">Aún nadie ha capturado nada aquí</p>
          </div>
        )}

        {hasCompanionCaptures && result === 'captured' && (
          <div className="flex items-center gap-1.5 mt-2.5 px-1">
            <Link2 className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-primary/80 font-medium">
              Tu captura se vinculará a este grupo de ruta
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md mx-auto rounded-3xl glass-card-elevated border-border/50 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {step === 'player' ? 'Seleccionar jugador' :
             step === 'pokemon' ? 'Elegir Pokémon' :
             'Detalles de captura'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{routeName}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'player' && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                {players.map(player => (
                  <button
                    key={player.id}
                    onClick={() => { setSelectedPlayer(player.id); setStep('pokemon'); }}
                    className="glass-card p-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-all duration-150 active:scale-95"
                  >
                    <PlayerBadge player={player} size="lg" />
                    <span className="text-sm font-medium">{player.initials}</span>
                  </button>
                ))}
              </div>

              {/* Show all captures in this route even before selecting player */}
              {run && (() => {
                const allCaptures = run.routes.find(r => r.id === routeId)?.captures || [];
                if (allCaptures.length === 0) return null;
                return (
                  <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Capturas en esta ruta</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {allCaptures.map(c => {
                        const p = run.players.find(pl => pl.id === c.playerId);
                        const pk = run.pokemon.find(pm => pm.id === c.pokemonId);
                        if (!p) return null;
                        return (
                          <div key={c.playerId} className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-card/70 border border-border/40 px-3 py-2">
                            <PlayerBadge player={p} size="sm" />
                            {pk && (
                              <img src={pk.imageUrl} alt={pk.species} className="w-7 h-7 pixelated"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                            )}
                            <span className="text-[11px] font-medium">{pk ? pk.species : 'Fallo'}</span>
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
              <Input
                placeholder="Buscar Pokémon..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="rounded-xl"
                autoFocus
              />
              <div className="grid grid-cols-3 gap-2 pr-1 max-h-[35vh] overflow-y-auto">
                {filteredPokemon.map(poke => (
                  <button
                    key={poke.id}
                    onClick={() => { setSelectedPokemon(poke.id); setStep('details'); }}
                    className={`glass-card p-2 flex flex-col items-center gap-1 hover:border-primary/50 transition-all duration-150 active:scale-95 ${
                      selectedPokemon === poke.id ? 'border-primary ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <img
                      src={getPokemonSprite(poke.id)}
                      alt={poke.name}
                      className="w-12 h-12 pixelated"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <span className="text-[10px] font-medium text-center leading-tight">{poke.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'details' && selectedPokemon && (
            <div className="flex flex-col gap-4 py-2">
              <CompanionSection />

              <div className="flex items-center gap-3 justify-center">
                <img
                  src={getPokemonSprite(selectedPokemon)}
                  alt=""
                  className="w-16 h-16 pixelated"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div>
                  <p className="font-heading font-semibold">
                    {KANTO_POKEMON.find(p => p.id === selectedPokemon)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">#{String(selectedPokemon).padStart(3, '0')}</p>
                </div>
              </div>

              <Input
                placeholder="Mote (opcional)"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="rounded-xl text-center"
              />

              <div className="grid grid-cols-2 gap-2">
                {CAPTURE_RESULTS.map(cr => (
                  <button
                    key={cr.value}
                    onClick={() => setResult(cr.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${cr.className} ${
                      result === cr.value ? 'ring-2 ring-offset-1 ring-offset-background' : 'opacity-60'
                    }`}
                    style={result === cr.value ? { boxShadow: '0 0 0 2px currentColor' } : {}}
                  >
                    {cr.icon}
                    {cr.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleConfirm}
                className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
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
