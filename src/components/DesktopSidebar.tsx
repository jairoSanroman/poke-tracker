import { NavLink } from 'react-router-dom';
import { Home, Map, MapPin, BookOpen, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/routes', icon: Map, label: 'Rutas' },
  { to: '/map', icon: MapPin, label: 'Mapa' },
  { to: '/pokedex', icon: BookOpen, label: 'Pokédex' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function DesktopSidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r-2 border-sidebar-border h-screen sticky top-0">
      {/* Logo area */}
      <div className="p-5 flex items-center gap-3 border-b-2 border-sidebar-border">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
            alt="Pokéball"
            className="w-7 h-7 pixelated"
          />
        </div>
        <div>
          <p className="font-heading text-[9px] text-sidebar-foreground leading-relaxed">Pokémon</p>
          <p className="font-heading text-[8px] text-sidebar-primary leading-relaxed">Añil Tracker</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary border-l-4 border-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground border-l-4 border-transparent'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-body">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t-2 border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-all duration-150 font-body"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
