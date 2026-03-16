import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { GameLayout } from '@/components/GameLayout';
import { LogOut, Moon, Sun, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const { activeRunId } = useGameStore();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

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

  return (
    <GameLayout title="Ajustes">
      <div className="space-y-3">
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

        <div className="glass-card p-4 flex items-center gap-3 border-2 border-border">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
            <Info className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading text-[8px] leading-relaxed">Pokémon Añil</p>
            <p className="text-xs text-muted-foreground font-body">v1.0.0 · Nuzlocke & Soul Link</p>
          </div>
        </div>

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
    </GameLayout>
  );
}
