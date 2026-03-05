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
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/30 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            {isDark ? <Sun className="w-5 h-5 text-primary" /> : <Moon className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading font-semibold text-sm">Modo {isDark ? 'claro' : 'oscuro'}</p>
            <p className="text-xs text-muted-foreground">Cambiar apariencia</p>
          </div>
        </button>

        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-heading font-semibold text-sm">Pokémon Añil Tracker</p>
            <p className="text-xs text-muted-foreground">v1.0.0 · Nuzlocke & Soul Link</p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-destructive/10 text-destructive font-semibold py-3.5 rounded-xl transition-all duration-150 hover:bg-destructive/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
