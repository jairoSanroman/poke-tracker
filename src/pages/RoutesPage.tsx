import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { RouteCard } from '@/components/RouteCard';
import { CaptureDialog } from '@/components/CaptureDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function RoutesPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [search, setSearch] = useState('');
  const [captureRoute, setCaptureRoute] = useState<{ id: string; name: string } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'completed', label: 'Completadas' },
  ];

  const filteredRoutes = run.routes.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  return (
    <GameLayout title="Rutas">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ruta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                filter === f.value
                  ? 'gradient-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredRoutes.map(route => (
            <RouteCard
              key={route.id}
              route={route}
              players={run.players}
              pokemon={run.pokemon}
              onAddCapture={() => setCaptureRoute({ id: route.id, name: route.name })}
            />
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No se encontraron rutas</p>
        )}
      </div>

      {captureRoute && (
        <CaptureDialog
          open={!!captureRoute}
          onOpenChange={(v) => { if (!v) setCaptureRoute(null); }}
          routeId={captureRoute.id}
          routeName={captureRoute.name}
          players={run.players}
        />
      )}
    </GameLayout>
  );
}
