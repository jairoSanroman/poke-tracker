import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Usuario o contraseña incorrectos');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 gradient-header opacity-20" />
      
      <div className={`relative z-10 w-full max-w-sm space-y-8 ${shaking ? 'animate-shake' : ''}`}>
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-3xl gradient-primary mx-auto flex items-center justify-center shadow-lg mb-4">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Pokémon Añil</h1>
          <p className="text-sm text-muted-foreground">Tracker · Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-elevated p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</label>
            <Input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Tu usuario"
              className="rounded-xl h-12"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Tu contraseña"
                className="rounded-xl h-12 pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors touch-target"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm font-medium px-4 py-2.5 rounded-xl animate-slide-up">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password.trim()}
            className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
