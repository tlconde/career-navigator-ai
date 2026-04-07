import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import ChatInterface from '@/components/ChatInterface';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Interview = () => {
  const { t } = useTranslation();
  const [jobType, setJobType] = useState('');
  const [started, setStarted] = useState(false);

  const quickPrompts = [
    { label: t('interview.quickPrompts.challenge'), message: t('interview.quickPrompts.challenge') },
    { label: t('interview.quickPrompts.teamwork'), message: t('interview.quickPrompts.teamwork') },
    { label: t('interview.quickPrompts.project'), message: t('interview.quickPrompts.project') },
    { label: t('interview.quickPrompts.mistake'), message: t('interview.quickPrompts.mistake') },
  ];

  const handleStart = () => {
    if (jobType.trim()) setStarted(true);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex h-[calc(100vh-8rem)] flex-col px-4">
        <header className="shrink-0 space-y-1 pt-8 pb-5">
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t('interview.title')}</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('interview.subtitle')}</p>
        </header>

        {!started ? (
          <div className="flex flex-1 items-center justify-center pb-12">
            <div className="w-full max-w-md space-y-5">
              <p className="text-center text-[15px] font-medium text-foreground">{t('interview.jobPrompt')}</p>
              <Input
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                placeholder={t('interview.jobPlaceholder')}
                className="text-center"
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              />
              <Button onClick={handleStart} disabled={!jobType.trim()} className="w-full">
                {t('interview.start')}
              </Button>
            </div>
          </div>
        ) : (
          <ChatInterface
            type="interview"
            quickPrompts={quickPrompts}
            context={`The user is preparing for a job as: ${jobType}`}
            initialMessages={[
              { role: 'user', content: `I'm preparing for an interview for a ${jobType} position. Please start the mock interview.` },
            ]}
          />
        )}
      </div>
    </Layout>
  );
};

export default Interview;
