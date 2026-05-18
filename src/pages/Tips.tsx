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
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-5 md:px-8">
        <header className="shrink-0 pt-10 pb-6 border-b border-ink/15 mb-4">
          <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary mb-2">
            Chapter 04 · Tips
          </p>
          <h1 className="font-display font-light tracking-[-0.015em] text-foreground leading-[0.95] text-[clamp(1.9rem,4.5vw,3rem)]">
            {t('tips.title')}
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed max-w-xl">
            {t('tips.subtitle')}
          </p>
        </header>
        <ChatInterface type="tips" quickPrompts={quickPrompts} />
      </div>
    </Layout>
  );
};

export default Tips;
