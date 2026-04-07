import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GameLayout } from '@/components/GameLayout';
import { LogOut, Moon, Sun, Info, RefreshCw, Trash2, Plus, Play, Link2, Shuffle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RunType } from '@/types/pokemon';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const { runs, activeRunId, setActiveRun, deleteRun, createRun, getActiveRun } = useGameStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const [showSwitchRun, setShowSwitchRun] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [runType, setRunType] = useState<RunType>('soul_link');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRun = (id: string) => {
    setActiveRun(id);
    setShowSwitchRun(false);
    toast.success('Partida cambiada');
    navigate('/dashboard');
  };

  const handleDeleteRun = async () => {
    if (!activeRunId) return;
    setDeleting(true);
    try {
      // Delete from Supabase in order: captures → routes → run_players → runs
      await supabase.from('captures').delete().eq('run_id', activeRunId);
      await supabase.from('routes').delete().eq('run_id', activeRunId);
      await supabase.from('run_players').delete().eq('run_id', activeRunId);
      await supabase.from('runs').delete().eq('id', activeRunId);

      // Delete from local store
      deleteRun(activeRunId);
      toast.success('Partida eliminada');
      setShowDeleteConfirm(false);
      navigate('/');
    } catch (err: any) {
      console.error('Error deleting run:', err);
      toast.error('Error al eliminar la partida: ' + (err.message || 'desconocido'));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = createRun(newName.trim(), runType);
    setNewName('');
    setRunType('soul_link');
    setShowCreate(false);
    setActiveRun(id);
    toast.success('Partida creada');
    navigate('/dashboard');
  };

  const activeRun = getActiveRun();

  const runTypeOptions = [
    {
      value: 'soul_link' as RunType,
      icon: Link2,
      label: 'Soul Link',
      desc: 'Las capturas se vinculan entre jugadores. Si uno muere, el otro también.',
    },
    {
      value: 'randomlocke' as RunType,
      icon: Shuffle,
      label: 'Randomlocke',
      desc: 'Sin vinculación. Cada muerte solo afecta al dueño.',
    },
  ];

  const runTypeBadge = (type: RunType) => {
    if (type === 'randomlocke') return { label: '🔀 Randomlocke', className: 'bg-accent/20 text-accent-foreground border-accent/30' };
    return { label: '🔗 Soul Link', className: 'bg-primary/20 text-primary border-primary/30' };
  };

  return (
    <GameLayout title="Ajustes">
      <div className="space-y-3">
        {/* Switch run */}
        <button
          onClick={() => setShowSwitchRun(true)}
          className="w-full glass-card p-4 flex items-center gap-3 pokemon-hover transition-all duration-150 active:scale-[0.98] border-2 border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading text-[8px] leading-relaxed">Cambiar de partida</p>
            <p className="text-xs text-muted-foreground font-body">
              {activeRun ? `Actual: ${activeRun.name}` : 'Sin partida activa'}
            </p>
          </div>
        </button>

        {/* New run */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full glass-card p-4 flex items-center gap-3 pokemon-hover transition-all duration-150 active:scale-[0.98] border-2 border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Plus className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading text-[8px] leading-relaxed">Nueva partida</p>
            <p className="text-xs text-muted-foreground font-body">Comienza una nueva aventura</p>
          </div>
        </button>

        {/* Delete run */}
        {activeRun && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full glass-card p-4 flex items-center gap-3 pokemon-hover transition-all duration-150 active:scale-[0.98] border-2 border-destructive/30"
          >
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-heading text-[8px] leading-relaxed text-destructive">Borrar partida actual</p>
              <p className="text-xs text-muted-foreground font-body">Elimina "{activeRun.name}" y todos sus datos</p>
            </div>
          </button>
        )}

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="w-full glass-card p-4 flex items-center gap-3 pokemon-hover transition-all duration-150 active:scale-[0.98] border-2 border-border"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading text-[8px] leading-relaxed">Modo {isDark ? 'claro' : 'oscuro'}</p>
            <p className="text-xs text-muted-foreground font-body">Cambiar apariencia</p>
          </div>
        </button>

        {/* Info */}
        <div className="glass-card p-4 flex items-center gap-3 border-2 border-border">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Info className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading text-[8px] leading-relaxed">Pokémon Añil</p>
            <p className="text-xs text-muted-foreground font-body">v1.0.0 · Nuzlocke & Soul Link</p>
          </div>
        </div>

        {/* Logout */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-destructive text-destructive-foreground font-bold py-3.5 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 flex items-center justify-center gap-2 border-2 border-destructive font-body"
            style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Switch run dialog */}
      <Dialog open={showSwitchRun} onOpenChange={setShowSwitchRun}>
        <DialogContent className="rounded-xl glass-card-elevated max-w-sm border-2 border-accent/30">
          <DialogHeader>
            <DialogTitle className="font-heading text-[10px] leading-relaxed">Cambiar de partida</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 font-body">No hay partidas. Crea una nueva.</p>
            ) : (
              runs.map(run => {
                const badge = runTypeBadge(run.runType || 'soul_link');
                const isActive = run.id === activeRunId;
                return (
                  <button
                    key={run.id}
                    onClick={() => handleSwitchRun(run.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left flex items-center gap-3 transition-all duration-150 ${
                      isActive
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-muted-foreground/30 bg-muted/20'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-heading text-[8px] leading-relaxed truncate">{run.name}</p>
                        {isActive && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/30 text-accent-foreground border border-accent/30 font-body">Activa</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border font-body ${badge.className}`}>{badge.label}</span>
                        <span className="text-[10px] text-muted-foreground font-body">{run.players.length} jugador{run.players.length !== 1 ? 'es' : ''}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-xl glass-card-elevated max-w-sm border-2 border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-[10px] leading-relaxed">¿Borrar partida?</AlertDialogTitle>
            <AlertDialogDescription className="font-body text-sm">
              Se eliminará <strong>"{activeRun?.name}"</strong> junto con todas sus rutas, capturas y datos de jugadores. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body" disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRun}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
            >
              {deleting ? 'Eliminando...' : 'Sí, borrar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create run dialog */}
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
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 font-body">Tipo de Nuzlocke</p>
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
            </div>
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
    </GameLayout>
  );
}
