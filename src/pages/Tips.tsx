import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import ChatInterface from '@/components/ChatInterface';

const Tips = () => {
  const { t } = useTranslation();

  const quickPrompts = [
    { label: t('tips.quickPrompts.salary'), message: t('tips.quickPrompts.salary') },
    { label: t('tips.quickPrompts.coverLetter'), message: t('tips.quickPrompts.coverLetter') },
    { label: t('tips.quickPrompts.linkedin'), message: t('tips.quickPrompts.linkedin') },
    { label: t('tips.quickPrompts.findJobs'), message: t('tips.quickPrompts.findJobs') },
    { label: t('tips.quickPrompts.ats'), message: t('tips.quickPrompts.ats') },
  ];

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4">
        <header className="shrink-0 space-y-1 pb-4 pt-8">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t('tips.title')}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('tips.subtitle')}</p>
        </header>
        <ChatInterface type="tips" quickPrompts={quickPrompts} />
      </div>
    </Layout>
  );
};

export default Tips;
