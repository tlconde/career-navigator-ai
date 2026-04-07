import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageShellProps = {
  /** Omitted when `showHeader` is false */
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Default matches most tool pages; wide for hubs like Advanced */
  width?: 'default' | 'wide';
  className?: string;
  /** Set false when the page manages its own vertical rhythm (e.g. full-height chat) */
  showHeader?: boolean;
};

export function PageShell({
  title,
  subtitle,
  children,
  width = 'default',
  className,
  showHeader = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto px-4 py-10 md:py-12',
        width === 'wide' ? 'max-w-5xl' : 'max-w-3xl',
        className,
      )}
    >
      {showHeader && (
        <header className="mb-8 md:mb-10 max-w-2xl">
          {title ? (
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
          ) : null}
          {subtitle ? (
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>
      )}
      {children}
    </div>
  );
}
