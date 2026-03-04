import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLAYER_COLORS } from '@/data/kanto';
import { Plus, Trash2 } from 'lucide-react';

export default function PlayersPage() {
  const { getActiveRun, activeRunId, addPlayer, removePlayer } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [showAdd, setShowAdd] = useState(false);
  const [initials, setInitials] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const handleAdd = () => {
    if (!initials.trim() || !activeRunId) return;
    addPlayer(activeRunId, initials.trim());
    setInitials('');
    setShowAdd(false);
  };

  return (
    <GameLayout title="Jugadores">
      <div className="space-y-4">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-sm">Añadir jugador</span>
        </button>

        {run.players.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No hay jugadores. ¡Añade al menos uno!</p>
        ) : (
          <div className="space-y-3">
            {run.players.map(player => {
              const playerPokemon = run.pokemon.filter(p => p.playerId === player.id);
              const captured = playerPokemon.filter(p => p.status === 'captured' || p.status === 'in_team' || p.status === 'boxed').length;
              const ko = playerPokemon.filter(p => p.status === 'ko').length;

              return (
                <div key={player.id} className="glass-card p-4 flex items-center gap-3 animate-slide-up">
                  <PlayerBadge player={player} size="lg" />
                  <div className="flex-1">
                    <p className="font-heading font-semibold">{player.initials}</p>
                    <p className="text-xs text-muted-foreground">
                      {captured} capturados · {ko} KO
                    </p>
                  </div>
                  <button
                    onClick={() => removePlayer(run.id, player.id)}
                    className="touch-target w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Nuevo jugador</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4 pt-2">
            <Input
              placeholder="Iniciales (2-3 letras)"
              value={initials}
              onChange={e => setInitials(e.target.value.slice(0, 3))}
              className="rounded-xl text-center text-xl font-heading font-bold uppercase"
              maxLength={3}
              autoFocus
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((color, i) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    className={`w-9 h-9 rounded-full transition-all duration-150 ${
                      selectedColor === i ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={initials.trim().length < 2}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              Añadir
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}
