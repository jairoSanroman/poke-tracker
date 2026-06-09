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
        variant === 'default' && 'px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6',
        variant === 'fullBleed' && '-mx-3 px-3 sm:-mx-4 sm:px-4 lg:-mx-6 lg:px-6',
        className
      )}
    >
      {children}
    </div>
  );
}
