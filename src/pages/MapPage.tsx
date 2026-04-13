import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { REGIONS } from '@/data/regions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type NodeColor = 'gray' | 'blue' | 'red' | 'green';

function getRouteNodeColor(route: { status: string; captures: { result: string }[] }): NodeColor {
  const hasDeath = route.captures.some(c => c.result === 'ko');
  const hasCapture = route.captures.some(c => c.result === 'captured');
  if (route.status === 'completed' && !hasDeath) return 'green';
  if (hasDeath) return 'red';
  if (hasCapture) return 'blue';
  return 'gray';
}

const nodeStyles: Record<NodeColor, { bg: string; border: string; text: string; glow: string; label: string }> = {
  gray: { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', glow: '', label: 'Sin visitar' },
  blue: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-[0_0_14px_rgba(59,130,246,0.5)]', label: 'Captura sin bajas' },
  red: { bg: 'bg-destructive/20', border: 'border-destructive', text: 'text-destructive', glow: 'shadow-[0_0_14px_rgba(239,68,68,0.5)]', label: 'Hubo muerte' },
  green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-[0_0_14px_rgba(16,185,129,0.5)]', label: 'Completada limpia' },
};

const statusEmoji: Record<NodeColor, string> = { gray: '⚪', blue: '🔵', red: '💀', green: '✅' };

// Starter sprite per region for the header decoration
const regionStarters: Record<string, number> = {
  kanto: 25, johto: 155, hoenn: 258, sinnoh: 393, teselia: 495, kalos: 656, alola: 722, galar: 810,
};

export default function MapPage() {
  const { getActiveRun, activeRunId } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const safeRegion = run.region || 'kanto';
  const regionInfo = REGIONS.find(r => r.id === safeRegion);
  const regionName = regionInfo?.name ?? safeRegion;
  const regionEmoji = regionInfo?.emoji ?? '🗺️';
  const regionGames = regionInfo?.games ?? '';
  const starterSprite = regionStarters[safeRegion] ?? 25;

  // Group routes into rows of 3 for zigzag layout
  const rows: typeof run.routes[] = [];
  for (let i = 0; i < run.routes.length; i += 3) {
    rows.push(run.routes.slice(i, i + 3));
  }

  return (
    <GameLayout title={`Mapa — ${regionEmoji} ${regionName}`}>
      <div className="space-y-4">
        {/* Region header */}
        <div className="flex items-center justify-center gap-4 py-4 px-4 rounded-xl bg-card border-2 border-border">
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${starterSprite}.png`}
            alt={regionName}
            className="w-16 h-16 pixelated drop-shadow-lg"
          />
          <div className="text-center">
            <h2 className="font-heading text-base sm:text-lg text-foreground leading-relaxed">
              {regionEmoji} {regionName}
            </h2>
            <p className="text-xs text-muted-foreground font-body">{regionGames}</p>
            <p className="text-[10px] text-muted-foreground/70 font-body mt-0.5">
              {run.routes.length} ubicaciones · Gen {regionInfo?.generation ?? '?'}
            </p>
          </div>
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Pokéball"
            className="w-10 h-10 pixelated opacity-60"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-xs font-body p-2">
          {(['gray', 'blue', 'red', 'green'] as NodeColor[]).map(color => (
            <div key={color} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full border-2 ${nodeStyles[color].bg} ${nodeStyles[color].border}`} />
              <span className="text-muted-foreground">{nodeStyles[color].label}</span>
            </div>
          ))}
        </div>

        {/* Zigzag Map */}
        <div className="relative pb-8">
          {rows.map((row, rowIdx) => {
            const isReversed = rowIdx % 2 === 1;
            const displayRow = isReversed ? [...row].reverse() : row;
            const globalOffset = rowIdx * 3;

            return (
              <div key={rowIdx}>
                {/* Vertical connector from previous row */}
                {rowIdx > 0 && (
                  <div className={`flex ${isReversed ? 'justify-end pr-[calc(50%/3+24px)]' : 'justify-start pl-[calc(50%/3+24px)]'}`}>
                    <div className="w-0.5 h-8 bg-border/60" />
                  </div>
                )}

                {/* Row of nodes */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {displayRow.map((route, colIdx) => {
                    const actualIdx = isReversed
                      ? globalOffset + (row.length - 1 - colIdx)
                      : globalOffset + colIdx;
                    const color = getRouteNodeColor(route);
                    const styles = nodeStyles[color];
                    const showConnector = colIdx < displayRow.length - 1;

                    return (
                      <div key={route.id} className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => navigate('/routes')}
                              className={`
                                relative flex flex-col items-center justify-center
                                w-[72px] h-[72px] sm:w-20 sm:h-20
                                rounded-2xl border-2 transition-all duration-200
                                hover:scale-110 hover:z-10 active:scale-95
                                ${styles.bg} ${styles.border} ${styles.glow}
                              `}
                            >
                              <span className={`font-heading text-[10px] sm:text-xs leading-none ${styles.text}`}>
                                {String(actualIdx + 1).padStart(2, '0')}
                              </span>
                              <span className={`font-body text-[7px] sm:text-[8px] leading-tight mt-0.5 text-center px-1 truncate w-full ${styles.text}`}>
                                {route.name.length > 12 ? route.name.slice(0, 11) + '…' : route.name}
                              </span>
                              <span className="text-xs mt-0.5">{statusEmoji[color]}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[200px]">
                            <p className="font-heading text-[9px]">{route.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Estado: {styles.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {route.captures.length > 0
                                ? `${route.captures.length} encuentro${route.captures.length > 1 ? 's' : ''}`
                                : 'Sin encuentros aún'}
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {/* Horizontal connector */}
                        {showConnector && (
                          <div className="w-3 sm:w-4 h-0.5 bg-border/60" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* End marker - Liga Pokémon */}
          <div className="flex justify-center mt-2">
            <div className="w-0.5 h-6 bg-border/60" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full border-3 border-accent bg-accent/20 flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent)/0.4)]">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="font-heading text-[9px] text-accent mt-1">Liga Pokémon</p>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
