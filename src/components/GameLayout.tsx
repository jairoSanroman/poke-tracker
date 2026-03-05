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
          <header className={`sticky top-0 z-40 ${gradient ? 'gradient-header text-primary-foreground' : 'bg-background/80 backdrop-blur-xl border-b border-border/50'}`}>
            <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto lg:mx-0">
              <h1 className="font-heading text-lg font-bold">{title}</h1>
              {headerRight}
            </div>
          </header>
        )}
        <main className="flex-1 pb-24 lg:pb-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto lg:mx-0 px-4 py-4 lg:px-6">
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
