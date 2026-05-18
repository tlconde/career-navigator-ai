import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageShellProps = {
  title?: string;
  subtitle?: string;
  /** Small uppercase eyebrow above the title (mono-mark style). Defaults to "Chapter". */
  eyebrow?: string;
  children: ReactNode;
  width?: 'default' | 'wide';
  className?: string;
  showHeader?: boolean;
};

export function PageShell({
  title,
  subtitle,
  eyebrow,
  children,
  width = 'default',
  className,
  showHeader = true,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16 md:pb-24',
        width === 'wide' ? 'max-w-6xl' : 'max-w-3xl',
        className,
      )}
    >
      {showHeader && (title || subtitle) && (
        <header className="mb-10 md:mb-14">
          {(eyebrow || title) && (
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary mb-4">
              {eyebrow ?? 'Chapter'}
            </p>
          )}
          {title && (
            <h1 className="font-display font-light tracking-[-0.015em] text-foreground leading-[0.95] text-[clamp(2rem,5.5vw,3.75rem)]">
              {title}
            </h1>
          )}
          {subtitle && (
            <>
              <div className="rule-thick w-12 mt-6" />
              <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
