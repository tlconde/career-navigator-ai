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
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-6xl font-black text-primary/15 mb-2" aria-hidden>
          404
        </p>
        <h1 className="mb-2 text-2xl font-bold font-['Nunito'] text-foreground">{t('notFound.title')}</h1>
        <p className="mb-6 text-muted-foreground max-w-md">{t('notFound.body')}</p>
        <Button asChild>
          <Link to="/">{t('notFound.home')}</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFound;
