import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Plus, Play, Trash2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function HomePage() {
  const { runs, createRun, deleteRun, setActiveRun } = useGameStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createRun(newName.trim());
    setNewName('');
    setShowCreate(false);
    setActiveRun(id);
    navigate('/dashboard');
  };

  const handleSelect = (id: string) => {
    setActiveRun(id);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-header px-4 pt-12 pb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary-foreground/80" />
          <h1 className="font-heading text-2xl font-bold text-primary-foreground">Pokémon Añil</h1>
        </div>
        <p className="text-primary-foreground/70 text-sm">Tracker</p>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 -mt-4">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full glass-card-elevated p-4 flex items-center gap-3 mb-6 hover:border-primary/40 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="font-heading font-semibold text-sm">Nueva partida</p>
            <p className="text-xs text-muted-foreground">Comienza una nueva aventura</p>
          </div>
        </button>

        {runs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No hay partidas aún</p>
            <p className="text-muted-foreground text-xs mt-1">Crea tu primera partida para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wider">Partidas</h2>
            {runs.map(run => (
              <div key={run.id} className="glass-card p-4 animate-slide-up">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelect(run.id)}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-sm">{run.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.players.length} jugador{run.players.length !== 1 ? 'es' : ''} · ❤️ {run.lives}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteRun(run.id)}
                    className="touch-target w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {run.players.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {run.players.map(p => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-primary-foreground"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.initials}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Nueva partida</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleCreate(); }} className="space-y-4 pt-2">
            <Input
              placeholder="Nombre de la partida"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="rounded-xl"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              Crear partida
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
