import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Plus, Play, Trash2, Link2, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RunType, RegionId } from '@/types/pokemon';
import { REGIONS } from '@/data/regions';

type CreateStep = 'name' | 'type' | 'region';

export default function HomePage() {
  const { runs, createRun, deleteRun, setActiveRun } = useGameStore();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [runType, setRunType] = useState<RunType>('soul_link');
  const [region, setRegion] = useState<RegionId>('kanto');
  const [step, setStep] = useState<CreateStep>('name');

  const resetCreate = () => {
    setNewName('');
    setRunType('soul_link');
    setRegion('kanto');
    setStep('name');
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createRun(newName.trim(), runType, region);
    resetCreate();
    setShowCreate(false);
    setActiveRun(id);
    navigate('/dashboard');
  };

  const handleSelect = (id: string) => {
    setActiveRun(id);
    navigate('/dashboard');
  };

  const runTypeOptions = [
    {
      value: 'soul_link' as RunType,
      icon: Link2,
      label: 'Soul Link',
      desc: 'Las capturas se vinculan entre jugadores por ruta. Si un Pokémon muere, su compañero vinculado también.',
    },
    {
      value: 'randomlocke' as RunType,
      icon: Shuffle,
      label: 'Randomlocke',
      desc: 'Pokémon aleatorios sin vinculación. Cada muerte solo afecta al jugador dueño.',
    },
  ];

  const runTypeBadge = (type: RunType) => {
    if (type === 'randomlocke') return { label: 'Randomlocke', className: 'bg-accent/20 text-accent-foreground border-accent/30' };
    return { label: 'Soul Link', className: 'bg-primary/20 text-primary border-primary/30' };
  };

  const regionInfo = REGIONS.find(r => r.id === region);

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
          onClick={() => { resetCreate(); setShowCreate(true); }}
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
            {runs.map(run => {
              const badge = runTypeBadge(run.runType || 'soul_link');
              const rInfo = REGIONS.find(r => r.id === (run.region || 'kanto'));
              return (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-heading text-[8px] leading-relaxed">{run.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-body ${badge.className}`}>{badge.label}</span>
                          {rInfo && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border font-body bg-muted/50 border-border">{rInfo.emoji} {rInfo.name}</span>}
                        </div>
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
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) resetCreate(); setShowCreate(open); }}>
        <DialogContent className="rounded-xl glass-card-elevated max-w-md border-2 border-accent/30">
          <DialogHeader>
            <DialogTitle className="font-heading text-[10px] leading-relaxed">
              {step === 'name' && 'Nueva partida'}
              {step === 'type' && 'Tipo de Nuzlocke'}
              {step === 'region' && 'Elige región'}
            </DialogTitle>
          </DialogHeader>

          {step === 'name' && (
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Nombre de la partida"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="rounded-md border-2 font-body"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) setStep('type'); }}
              />
              <button
                type="button"
                disabled={!newName.trim()}
                onClick={() => setStep('type')}
                className="w-full bg-accent text-accent-foreground font-bold py-3 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 disabled:opacity-40 border-2 border-accent-foreground/10 font-body flex items-center justify-center gap-2"
                style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'type' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-2">
                {runTypeOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRunType(opt.value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                      runType === opt.value
                        ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                        : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                    }`}
                  >
                    <opt.icon className={`w-5 h-5 mb-1.5 ${runType === opt.value ? 'text-accent-foreground' : 'text-muted-foreground'}`} />
                    <p className="font-heading text-[8px] leading-relaxed">{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('name')}
                  className="flex-1 bg-muted text-muted-foreground font-bold py-3 rounded-md border-2 border-border font-body flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep('region')}
                  className="flex-1 bg-accent text-accent-foreground font-bold py-3 rounded-md hover:brightness-110 border-2 border-accent-foreground/10 font-body flex items-center justify-center gap-2"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'region' && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {REGIONS.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRegion(r.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                      region === r.id
                        ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                        : 'border-border bg-muted/30 hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <p className="font-heading text-[8px] leading-relaxed mt-1">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body leading-tight">Gen {r.generation}</p>
                    <p className="text-[9px] text-muted-foreground/70 font-body leading-tight mt-0.5">{r.games}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('type')}
                  className="flex-1 bg-muted text-muted-foreground font-bold py-3 rounded-md border-2 border-border font-body flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 bg-accent text-accent-foreground font-bold py-3 rounded-md hover:brightness-110 active:translate-y-0.5 disabled:opacity-40 border-2 border-accent-foreground/10 font-body"
                  style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
                >
                  Crear partida
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
