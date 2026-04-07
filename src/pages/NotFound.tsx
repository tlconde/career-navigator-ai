import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error('404: non-existent route:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-28 text-center">
        <p className="mb-3 font-heading text-7xl font-semibold tabular-nums text-muted-foreground/25" aria-hidden>
          404
        </p>
        <h1 className="mb-2 font-heading text-2xl font-semibold tracking-tight text-foreground">{t('notFound.title')}</h1>
        <p className="mb-8 max-w-md text-sm text-muted-foreground leading-relaxed">{t('notFound.body')}</p>
        <Button asChild variant="default">
          <Link to="/">{t('notFound.home')}</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
