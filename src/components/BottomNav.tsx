import { NavLink } from 'react-router-dom';
import { Home, Map, MapPin, BookOpen, Settings, Skull } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/routes', icon: Map, label: 'Rutas' },
  { to: '/map', icon: MapPin, label: 'Mapa' },
  { to: '/pokedex', icon: BookOpen, label: 'Pokédex' },
  { to: '/cemetery', icon: Skull, label: 'Cementerio' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t-2 border-accent/30 bottom-safe-area lg:hidden">
      <div className="flex items-center justify-around px-1 pt-2 pb-1 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-150 touch-target ${
                isActive
                  ? 'text-accent scale-105'
                  : 'text-primary-foreground/60 hover:text-primary-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-colors duration-150 ${isActive ? 'bg-accent/20' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-bold font-body">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
