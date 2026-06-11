import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** 
   * `default`: padding responsive normal (px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6).
   * `fullBleed`: compensa el padding del layout con márgenes negativos para que
   * el contenido ocupe todo el ancho disponible (útil para fondos de sección o
   * barras de filtros scrollables).
   */
  variant?: 'default' | 'fullBleed';
}

export function PageContainer({ children, className, variant = 'default' }: PageContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        // `default`: pass-through. El padding base lo aporta <main> en GameLayout,
        // garantizando que la variante `fullBleed` siempre rompa contra el mismo
        // padding (px-3 / sm:px-4 / lg:px-6) sin importar dónde se anide.
        variant === 'fullBleed' &&
          '-mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6 max-w-[calc(100%+1.5rem)] sm:max-w-[calc(100%+2rem)] lg:max-w-[calc(100%+3rem)]',
        className
      )}
    >
      {children}
    </div>
  );
}
