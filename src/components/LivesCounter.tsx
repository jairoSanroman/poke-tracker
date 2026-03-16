import { Heart, Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';

export function LivesCounter() {
  const { getActiveRun, setLives } = useGameStore();
  const run = getActiveRun();
  const [animating, setAnimating] = useState(false);

  if (!run) return null;

  const handleChange = (delta: number) => {
    setLives(run.id, run.lives + delta);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
  };

  const livesPercent = run.maxLives > 0 ? (run.lives / run.maxLives) * 100 : 0;
  const hpColor = livesPercent > 50 ? 'hp-green' : livesPercent > 20 ? 'hp-yellow' : 'hp-red';

  return (
    <div className="glass-card p-3">
      {/* HP Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-heading text-[8px] text-muted-foreground">HP</span>
          <Heart
            className={`w-4 h-4 transition-colors duration-150 ${
              livesPercent <= 20 ? 'text-destructive fill-destructive' :
              livesPercent <= 50 ? 'text-warning fill-warning' :
              'text-success fill-success'
            } ${animating ? 'animate-bounce-subtle' : ''}`}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className={`font-heading text-[10px] tabular-nums transition-colors duration-150 ${
            livesPercent <= 20 ? 'text-destructive' : livesPercent <= 50 ? 'text-warning' : 'text-foreground'
          }`}>
            {run.lives}
          </span>
          <span className="font-heading text-[8px] text-muted-foreground">/ {run.maxLives}</span>
        </div>
      </div>

      {/* HP Bar - Pokémon style */}
      <div className="flex items-center gap-2">
        <div className="hp-bar-container flex-1">
          <div
            className={`hp-bar-fill ${hpColor}`}
            style={{ width: `${livesPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handleChange(-1)}
            disabled={run.lives <= 0}
            className="touch-target w-8 h-8 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-30 transition-colors duration-150 border border-destructive/20"
          >
            <Minus className="w-3.5 h-3.5 mx-auto" />
          </button>
          <button
            onClick={() => handleChange(1)}
            className="touch-target w-8 h-8 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors duration-150 border border-success/20"
          >
            <Plus className="w-3.5 h-3.5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
}
