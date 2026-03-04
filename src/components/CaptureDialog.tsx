import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/store/gameStore';
import { KANTO_POKEMON, getPokemonSprite } from '@/data/kanto';
import { Player, CaptureResult } from '@/types/pokemon';
import { PlayerBadge } from './PlayerBadge';
import { Check, X, RotateCcw, Skull } from 'lucide-react';

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
  const { addCapture, activeRunId } = useGameStore();
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<number | null>(null);
  const [nickname, setNickname] = useState('');
  const [result, setResult] = useState<CaptureResult>('captured');
  const [step, setStep] = useState<'player' | 'pokemon' | 'details'>('player');

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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md mx-auto rounded-3xl glass-card-elevated border-border/50 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {step === 'player' ? 'Seleccionar jugador' :
             step === 'pokemon' ? 'Elegir Pokémon' :
             'Detalles de captura'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{routeName}</p>
        </DialogHeader>

        {step === 'player' && (
          <div className="grid grid-cols-2 gap-3 py-4">
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
        )}

        {step === 'pokemon' && (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <Input
              placeholder="Buscar Pokémon..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="rounded-xl"
              autoFocus
            />
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-1 max-h-[45vh]">
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
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
            >
              Confirmar captura
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
