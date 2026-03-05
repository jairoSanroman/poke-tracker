import { NavLink } from 'react-router-dom';
import { Home, Map, BookOpen, Package, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/routes', icon: Map, label: 'Rutas' },
  { to: '/pokedex', icon: BookOpen, label: 'Pokédex' },
  { to: '/items', icon: Package, label: 'Objetos' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card-elevated rounded-none border-t border-border/50 bottom-safe-area lg:hidden">
      <div className="flex items-center justify-around px-1 pt-2 pb-1 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 touch-target ${
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
