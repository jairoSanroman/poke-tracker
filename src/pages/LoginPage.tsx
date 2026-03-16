import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-4 dot-texture">
      <div className={`relative z-10 w-full max-w-sm space-y-8 ${shaking ? 'animate-shake' : ''}`}>
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-xl bg-accent mx-auto flex items-center justify-center border-2 border-accent-foreground/10" style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.2)' }}>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
              alt="Pokéball"
              className="w-12 h-12 pixelated"
            />
          </div>
          <div>
            <h1 className="font-heading text-sm text-primary-foreground leading-relaxed">Pokémon Añil</h1>
            <p className="font-heading text-[8px] text-accent mt-1">Tracker</p>
          </div>
          <p className="text-sm text-primary-foreground/60 font-body">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card-elevated p-6 space-y-4 border-2 border-accent/30">
          <div className="space-y-2">
            <label className="text-[10px] font-heading text-muted-foreground uppercase">Usuario</label>
            <Input
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Tu usuario"
              className="rounded-md h-12 border-2 font-body"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-heading text-muted-foreground uppercase">Contraseña</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Tu contraseña"
                className="rounded-md h-12 pr-12 border-2 font-body"
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
            <div className="bg-destructive/10 text-destructive text-sm font-bold px-4 py-2.5 rounded-md animate-slide-up border border-destructive/30 font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username.trim() || !password.trim()}
            className="w-full bg-accent text-accent-foreground font-bold py-3.5 rounded-md transition-all duration-150 hover:brightness-110 active:translate-y-0.5 disabled:opacity-40 flex items-center justify-center gap-2 border-2 border-accent-foreground/10 font-body text-sm"
            style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}
          >
            <LogIn className="w-5 h-5" />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
