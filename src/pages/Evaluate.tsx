import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileEdit } from 'lucide-react';
import { streamChat } from '@/lib/chat';
import { streamChatToString } from '@/lib/streamChatToString';
import { parseEvaluateStructuredJson } from '@/lib/parseEvaluateJsonResponse';
import type { EvaluateStructured } from '@/lib/evaluateTypes';
import { readCvEvaluatePrefill } from '@/lib/cvEvaluatePrefill';
import { fetchJobPostingText } from '@/lib/fetchJobPostingUrl';
import { useToast } from '@/hooks/use-toast';

const Evaluate = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const [jobDesc, setJobDesc] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [result, setResult] = useState('');
  const [structured, setStructured] = useState<EvaluateStructured | null>(null);
  const [resolvedJobDesc, setResolvedJobDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStructuredLoading, setIsStructuredLoading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  const prefillOnceRef = useRef(false);

  useEffect(() => {
    if (prefillOnceRef.current) return;
    const s = routerLocation.state as { evaluatePrefillSkills?: string } | null;
    if (s?.evaluatePrefillSkills?.trim()) {
      prefillOnceRef.current = true;
      setUserSkills(s.evaluatePrefillSkills);
      navigate(routerLocation.pathname, { replace: true, state: {} });
      return;
    }
    const snap = readCvEvaluatePrefill();
    if (snap?.trim()) {
      prefillOnceRef.current = true;
      setUserSkills(snap);
    }
  }, [routerLocation.state, routerLocation.pathname, navigate]);

  const fetchStructured = async (effectiveJobDesc: string) => {
    setIsStructuredLoading(true);
    setStructured(null);
    try {
      const res = await streamChatToString({
        type: 'evaluate_structured',
        language: i18n.language?.split('-')[0] || 'en',
        messages: [
          {
            role: 'user',
            content: `Evaluate this job for structuring the candidate's CV for ATS and the role below.\n\n**Job Description:**\n${effectiveJobDesc}\n\n**My Skills & Experience:**\n${userSkills || 'Not provided'}`,
          },
        ],
      });
      if (res.ok) {
        const parsed = parseEvaluateStructuredJson(res.text);
        setStructured(parsed);
        if (!parsed) {
          toast({
            title: t('evaluate.structuredPartial'),
            description: t('evaluate.structuredPartialHint'),
          });
        }
      } else {
        toast({ title: t('evaluate.structuredFailed'), variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: t('evaluate.structuredFailed'), variant: 'destructive' });
    } finally {
      setIsStructuredLoading(false);
    }
  };

  const canAnalyze = jobDesc.trim().length > 0 || jobUrl.trim().length > 0;

  const analyze = async () => {
    if (!canAnalyze) return;

    let effectiveJobDesc = jobDesc.trim();
    const urlTrim = jobUrl.trim();

    if (urlTrim) {
      setIsFetchingUrl(true);
      const res = await fetchJobPostingText(urlTrim);
      setIsFetchingUrl(false);
      if (res.ok && res.text.trim()) {
        const banner = t('evaluate.urlFetchedBanner');
        effectiveJobDesc = effectiveJobDesc ? `${effectiveJobDesc}\n\n---\n${banner}\n${res.text}` : `${banner}\n${res.text}`;
      } else if (res.ok && !res.text.trim()) {
        toast({ title: t('evaluate.urlFetchEmpty'), variant: 'destructive' });
        if (!effectiveJobDesc) return;
      } else {
        toast({
          title: t('evaluate.urlFetchFailed'),
          description: !res.ok ? res.error : undefined,
          variant: 'destructive',
        });
        if (!effectiveJobDesc) return;
      }
    }

    if (!effectiveJobDesc.trim()) {
      toast({ title: t('evaluate.needJobDescOrUrl'), variant: 'destructive' });
      return;
    }

    setResolvedJobDesc(effectiveJobDesc);
    setIsLoading(true);
    setShowRetry(false);
    setResult('');
    setStructured(null);

    const userMessage = `Please evaluate this job for me.\n\n**Job Description:**\n${effectiveJobDesc}\n\n**My Skills & Experience:**\n${userSkills || 'Not provided — please give general advice'}`;

    let output = '';
    await streamChat({
      messages: [{ role: 'user', content: userMessage }],
      type: 'evaluate',
      language: i18n.language?.split('-')[0] || 'en',
      onDelta: (chunk) => {
        output += chunk;
        setResult(output);
      },
      onDone: () => {
        setIsLoading(false);
        setShowRetry(false);
        void fetchStructured(effectiveJobDesc);
      },
      onError: (errorType) => {
        setIsLoading(false);
        setShowRetry(true);
        toast({ title: t(`common.${errorType}`), variant: 'destructive' });
      },
    });
  };

  const handoffJobDesc = resolvedJobDesc || jobDesc.trim();

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
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder={t('evaluate.jobDescPlaceholder')}
              rows={8}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('evaluate.jobUrlLabel')}</label>
            <Input
              type="url"
              inputMode="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder={t('evaluate.jobUrlPlaceholder')}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground mt-1.5">{t('evaluate.jobUrlHint')}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">{t('evaluate.yourSkills')}</label>
            <Textarea
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder={t('evaluate.yourSkillsPlaceholder')}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1.5">{t('evaluate.skillsPrefillHint')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={analyze}
              disabled={!canAnalyze || isLoading || isFetchingUrl}
              className="w-full sm:flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('evaluate.analyzing')}
                </>
              ) : isFetchingUrl ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('evaluate.fetchingUrl')}
                </>
              ) : (
                t('evaluate.analyze')
              )}
            </Button>
            {showRetry && !isLoading && (
              <Button type="button" variant="outline" onClick={analyze} disabled={!canAnalyze} className="w-full sm:w-auto">
                {t('evaluate.retry')}
              </Button>
            )}
          </div>
        </div>

        {result && (
          <>
            <Card className="mt-6">
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{result}</ReactMarkdown>
              </CardContent>
            </Card>

            {isStructuredLoading && (
              <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                {t('evaluate.preparingHandoff')}
              </p>
            )}

            {!isStructuredLoading && (
              <div className="mt-4">
                <Button asChild className="w-full sm:w-auto">
                  <Link
                    to="/cv"
                    state={{
                      evaluateHandoff: {
                        jobDesc: handoffJobDesc,
                        userSkills,
                        markdown: result,
                        structured,
                        jobUrl: jobUrl.trim() || undefined,
                      },
                    }}
                  >
                    <FileEdit className="h-4 w-4 mr-2" />
                    {t('evaluate.useInCv')}
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Evaluate;
