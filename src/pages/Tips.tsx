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
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <div className="px-4 pt-6 pb-4 space-y-1">
          <h1 className="text-2xl font-bold text-foreground font-['Nunito']">{t('tips.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('tips.subtitle')}</p>
        </div>
        <ChatInterface type="tips" quickPrompts={quickPrompts} />
      </div>
    </Layout>
  );
};

export default Tips;
