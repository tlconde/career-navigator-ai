import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguagePicker from './LanguagePicker';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/interview', label: t('nav.interview') },
    { path: '/cv', label: t('nav.cv') },
    { path: '/evaluate', label: t('nav.evaluate') },
    { path: '/tips', label: t('nav.tips') },
    { path: '/advanced', label: t('nav.advanced') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top thin rule — editorial masthead */}
      <div className="h-[3px] bg-ink" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-ink/15 bg-background/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between gap-6">
          <Link
            to="/"
            className="group flex items-baseline gap-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <span className="font-display text-2xl md:text-[1.75rem] font-medium italic tracking-tight leading-none">
              Career<span className="text-primary">Bridge</span>
            </span>
            <span className="hidden sm:inline font-mono-mark text-[10px] uppercase tracking-[0.18em] text-muted-foreground translate-y-[-2px]">
              No. 01
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2 text-[13px] tracking-wide transition-colors ${
                    active
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-primary" aria-hidden />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguagePicker />
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-ink/15 bg-background px-5 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-2 py-3 text-sm border-b border-ink/10 last:border-0 transition-colors ${
                  location.pathname === item.path
                    ? 'text-primary font-medium'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 bg-ink text-ink-foreground">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6 space-y-3">
            <div className="font-display text-3xl md:text-4xl italic leading-none">
              Career<span className="text-primary">Bridge</span>
            </div>
            <p className="text-sm text-ink-foreground/65 max-w-md leading-relaxed">
              {t('app.footer')}
            </p>
          </div>
          <div className="md:col-span-3 space-y-2 text-sm">
            <p className="font-mono-mark uppercase tracking-[0.18em] text-[10px] text-ink-foreground/50 mb-2">
              Tools
            </p>
            {navItems.slice(1).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block text-ink-foreground/80 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="md:col-span-3 space-y-2 text-sm">
            <p className="font-mono-mark uppercase tracking-[0.18em] text-[10px] text-ink-foreground/50 mb-2">
              Source
            </p>
            <p className="text-ink-foreground/65 leading-relaxed">
              {t('app.footerCredit')}{' '}
              <a
                href="https://github.com/santifer/career-ops"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-foreground hover:text-primary underline underline-offset-4 decoration-ink-foreground/30"
              >
                career-ops
              </a>
            </p>
            <Link to="/advanced" className="inline-block text-ink-foreground/80 hover:text-primary">
              {t('app.footerMoreTools')} →
            </Link>
          </div>
        </div>
        <div className="border-t border-ink-foreground/12">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-4 flex justify-between text-[11px] font-mono-mark uppercase tracking-[0.18em] text-ink-foreground/45">
            <span>Vol. 01 · Edition 2025</span>
            <span>Made with care</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
