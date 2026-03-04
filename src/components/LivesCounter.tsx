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
  const isLow = livesPercent <= 30;
  const isCritical = livesPercent <= 10;

  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className={`flex items-center gap-1.5 ${animating ? 'animate-bounce-subtle' : ''}`}>
        <Heart
          className={`w-5 h-5 transition-colors duration-200 ${
            isCritical ? 'text-destructive fill-destructive' :
            isLow ? 'text-warning fill-warning' :
            'text-accent fill-accent'
          }`}
        />
        <span className={`text-2xl font-heading font-bold tabular-nums transition-colors duration-200 ${
          isCritical ? 'text-destructive' : isLow ? 'text-warning' : 'text-foreground'
        }`}>
          {run.lives}
        </span>
        <span className="text-sm text-muted-foreground">/ {run.maxLives}</span>
      </div>

      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isCritical ? 'bg-destructive' : isLow ? 'bg-warning' : 'gradient-accent'
          }`}
          style={{ width: `${livesPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => handleChange(-1)}
          disabled={run.lives <= 0}
          className="touch-target w-9 h-9 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-30 transition-colors duration-150"
        >
          <Minus className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => handleChange(1)}
          className="touch-target w-9 h-9 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors duration-150"
        >
          <Plus className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
}
