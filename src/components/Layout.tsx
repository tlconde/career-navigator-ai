import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguagePicker from './LanguagePicker';
import { Briefcase, Menu, X } from 'lucide-react';
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
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Briefcase className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
            <span className="font-heading text-base font-semibold tracking-tight">{t('app.title')}</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguagePicker />
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden border-t border-border bg-background px-4 py-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/80 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-muted-foreground space-y-2">
          <p>{t('app.footer')}</p>
          <p>
            <Link to="/advanced" className="underline hover:text-foreground transition-colors">
              {t('app.footerMoreTools')}
            </Link>
            <span aria-hidden className="mx-1.5">
              ·
            </span>
            {t('app.footerCredit')}{' '}
            <a
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              career-ops
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
