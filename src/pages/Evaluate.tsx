import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { streamChat } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';

const Evaluate = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [jobDesc, setJobDesc] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyze = async () => {
    if (!jobDesc.trim()) return;
    setIsLoading(true);
    setResult('');

    let output = '';
    await streamChat({
      messages: [
        {
          role: 'user',
          content: `Please evaluate this job for me.\n\n**Job Description:**\n${jobDesc}\n\n**My Skills & Experience:**\n${userSkills || 'Not provided — please give general advice'}`,
        },
      ],
      type: 'evaluate',
      language: i18n.language?.split('-')[0] || 'en',
      onDelta: (chunk) => {
        output += chunk;
        setResult(output);
      },
      onDone: () => setIsLoading(false),
      onError: (errorType) => {
        setIsLoading(false);
        toast({ title: t(`common.${errorType}`), variant: 'destructive' });
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground font-['Nunito'] mb-1">{t('evaluate.title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('evaluate.subtitle')}</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('evaluate.jobDesc')}</label>
            <Textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder={t('evaluate.jobDescPlaceholder')}
              rows={8}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('evaluate.yourSkills')}</label>
            <Textarea
              value={userSkills}
              onChange={e => setUserSkills(e.target.value)}
              placeholder={t('evaluate.yourSkillsPlaceholder')}
              rows={4}
            />
          </div>

          <Button onClick={analyze} disabled={!jobDesc.trim() || isLoading} className="w-full">
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('evaluate.analyzing')}</>
            ) : (
              t('evaluate.analyze')
            )}
          </Button>
        </div>

        {result && (
          <Card className="mt-6">
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{result}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Evaluate;
