import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { REGIONS } from '@/data/regions';

type NodeColor = 'gray' | 'blue' | 'red' | 'green';

function getRouteNodeColor(route: { status: string; captures: { result: string }[] }): NodeColor {
  const hasDeath = route.captures.some(c => c.result === 'ko');
  const hasCapture = route.captures.some(c => c.result === 'captured');

  if (route.status === 'completed' && !hasDeath) return 'green';
  if (hasDeath) return 'red';
  if (hasCapture) return 'blue';
  return 'gray';
}

const colorMap: Record<NodeColor, { bg: string; border: string; text: string; glow: string }> = {
  gray: { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', glow: '' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
  red: { bg: 'bg-destructive/20', border: 'border-destructive', text: 'text-destructive', glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' },
  green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
};

export default function MapPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const regionInfo = REGIONS.find(r => r.id === run.region);
  const regionName = regionInfo ? `${regionInfo.emoji} ${regionInfo.name}` : run.region;

  return (
    <GameLayout title={`Mapa — ${regionName}`}>
      <div className="space-y-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs font-body mb-4 p-3 rounded-lg bg-card border-2 border-border">
          {([
            ['gray', 'Sin visitar'],
            ['blue', 'Captura sin bajas'],
            ['red', 'Hubo muerte'],
            ['green', 'Completada limpia'],
          ] as [NodeColor, string][]).map(([color, label]) => (
            <div key={color} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full border-2 ${colorMap[color].bg} ${colorMap[color].border}`} />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="relative flex flex-col items-center">
          {run.routes.map((route, i) => {
            const color = getRouteNodeColor(route);
            const styles = colorMap[color];
            const isLast = i === run.routes.length - 1;
            // Zigzag offset for visual interest
            const offset = i % 2 === 0 ? 'ml-0 mr-auto' : 'ml-auto mr-0';

            return (
              <div key={route.id} className="w-full max-w-md mx-auto flex flex-col items-center">
                {/* Connector line */}
                {i > 0 && (
                  <div className="w-0.5 h-6 bg-border" />
                )}

                {/* Node */}
                <button
                  onClick={() => navigate('/routes')}
                  className={`
                    group relative flex items-center gap-3 w-full px-4 py-3 rounded-xl
                    border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                    ${styles.bg} ${styles.border} ${styles.glow}
                  `}
                >
                  {/* Circle indicator */}
                  <div className={`
                    w-10 h-10 rounded-full border-3 flex items-center justify-center
                    font-heading text-[8px] shrink-0
                    ${styles.border} ${styles.bg} ${styles.text}
                  `}>
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Route info */}
                  <div className="flex-1 text-left">
                    <p className={`font-heading text-[9px] leading-relaxed ${styles.text}`}>
                      {route.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {route.captures.length > 0
                        ? `${route.captures.length} encuentro${route.captures.length > 1 ? 's' : ''}`
                        : 'Sin encuentros'}
                    </p>
                  </div>

                  {/* Status icon */}
                  <span className="text-lg">
                    {color === 'green' && '✅'}
                    {color === 'red' && '💀'}
                    {color === 'blue' && '🔵'}
                    {color === 'gray' && '⚪'}
                  </span>
                </button>

                {/* Final connector */}
                {!isLast && null}
              </div>
            );
          })}

          {/* End marker */}
          <div className="w-0.5 h-6 bg-border" />
          <div className="w-12 h-12 rounded-full border-3 border-accent bg-accent/20 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <p className="font-heading text-[8px] text-accent mt-1">Liga Pokémon</p>
        </div>
      </div>
    </GameLayout>
  );
}
