import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Plus, Play, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col dot-texture">
      <div className="gradient-header px-4 pt-12 pb-8 text-center border-b-2 border-accent/30">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Pokéball"
            className="w-8 h-8 pixelated"
          />
          <h1 className="font-heading text-xs text-primary-foreground leading-relaxed">Pokémon Añil</h1>
        </div>
        <p className="font-heading text-[8px] text-accent">Tracker</p>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 -mt-4">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full glass-card-elevated p-4 flex items-center gap-3 mb-6 pokemon-hover active:scale-[0.98] border-2 border-accent/30"
        >
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center border border-accent-foreground/10">
            <Plus className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="text-left">
            <p className="font-heading text-[8px] leading-relaxed">Nueva partida</p>
            <p className="text-xs text-muted-foreground font-body">Comienza una nueva aventura</p>
          </div>
        </button>

        {runs.length === 0 ? (
          <div className="text-center py-16">
            {/* Pokéball SVG empty state */}
            <div className="mx-auto w-24 h-24 mb-4 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3"/>
                <path d="M2,50 L98,50" stroke="currentColor" strokeWidth="3"/>
                <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3"/>
                <circle cx="50" cy="50" r="6" fill="currentColor" opacity="0.3"/>
                <path d="M2,50 Q50,20 98,50" fill="hsl(0 80% 40%)" opacity="0.15"/>
              </svg>
            </div>
            <p className="font-heading text-[8px] text-muted-foreground leading-relaxed">No hay partidas aún</p>
            <p className="text-muted-foreground text-xs mt-2 font-body">Crea tu primera partida para empezar</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-heading text-[8px] text-muted-foreground uppercase leading-relaxed">Partidas</h2>
            {runs.map(run => (
              <div key={run.id} className="glass-card p-4 animate-slide-up border-2 border-border pokemon-hover">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleSelect(run.id)}
                    className="flex-1 text-left flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                    <div>
                      <p className="font-heading text-[8px] leading-relaxed">{run.name}</p>
                      <p className="text-xs text-muted-foreground font-body">
                        {run.players.length} jugador{run.players.length !== 1 ? 'es' : ''} · ❤️ {run.lives}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteRun(run.id)}
                    className="touch-target w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {run.players.length > 0 && (
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {run.players.map(p => (
                      <span
                        key={p.id}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold text-primary-foreground font-body border border-black/10"
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
        <DialogContent className="rounded-xl glass-card-elevated max-w-sm border-2 border-accent/30">
          <DialogHeader>
            <DialogTitle className="font-heading text-[10px] leading-relaxed">Nueva partida</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleCreate(); }} className="space-y-4 pt-2">
            <Input
              placeholder="Nombre de la partida"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="rounded-md border-2 font-body"
              autoFocus
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 disabled:opacity-40 border-2 border-accent-foreground/10 font-body"
              style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
            >
              Crear partida
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
