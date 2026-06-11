import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';

interface GameLayoutProps {
  children: ReactNode;
  title?: string;
  headerRight?: ReactNode;
  gradient?: boolean;
}

export function GameLayout({ children, title, headerRight, gradient = false }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {title && (
          <header className={`sticky top-0 z-40 border-b-2 ${gradient ? 'gradient-header text-primary-foreground border-accent/30' : 'bg-primary text-primary-foreground border-accent/30'}`}>
            <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
              <h1 className="font-heading text-[10px] sm:text-xs leading-relaxed">{title}</h1>
              {headerRight}
            </div>
          </header>
        )}
        <main className="flex-1 pb-24 lg:pb-8 overflow-x-hidden overflow-y-auto dot-texture px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
