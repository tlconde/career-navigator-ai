import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Search, Lightbulb, Shield, ArrowUpRight, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const PRIVACY_DISMISS_KEY = 'careerbridge-dismiss-privacy-v1';

const featureCards = [
  {
    titleKey: 'home.interviewTitle',
    descKey: 'home.interviewDesc',
    path: '/interview',
    icon: MessageSquare,
  },
  {
    titleKey: 'home.cvTitle',
    descKey: 'home.cvDesc',
    path: '/cv',
    icon: FileText,
  },
  {
    titleKey: 'home.evaluateTitle',
    descKey: 'home.evaluateDesc',
    path: '/evaluate',
    icon: Search,
  },
  {
    titleKey: 'home.tipsTitle',
    descKey: 'home.tipsDesc',
    path: '/tips',
    icon: Lightbulb,
  },
];

const Index = () => {
  const { t } = useTranslation();
  const [showPrivacyBanner, setShowPrivacyBanner] = useState(false);

  useEffect(() => {
    try {
      setShowPrivacyBanner(localStorage.getItem(PRIVACY_DISMISS_KEY) !== '1');
    } catch {
      setShowPrivacyBanner(true);
    }
  }, []);

  const dismissPrivacy = () => {
    try {
      localStorage.setItem(PRIVACY_DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowPrivacyBanner(false);
  };

  return (
    <Layout>
      {showPrivacyBanner && (
        <div className="border-b border-border/80 bg-muted/40 px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-foreground">
            <p className="flex items-start gap-2 pr-8 sm:pr-0">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
              <span>{t('home.privacyBanner')}</span>
            </p>
            <Button type="button" variant="outline" size="sm" className="shrink-0 self-start sm:self-center" onClick={dismissPrivacy}>
              <X className="h-4 w-4 mr-1" />
              {t('home.privacyDismiss')}
            </Button>
          </div>
        </div>
      )}

      {/* Hero — left-aligned rhythm, not centered marketing stack */}
      <section className="py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <p className="text-sm font-medium text-muted-foreground">{t('app.tagline')}</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.25rem] font-semibold tracking-tight text-foreground leading-[1.12]">
            {t('home.hero')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{t('home.heroSub')}</p>
          <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span>{t('home.privacyLine')}</span>
          </div>
        </div>
      </section>

      {/* Start path */}
      <section className="pb-12 px-4">
        <div className="max-w-3xl mx-auto rounded-xl border border-border/80 bg-card px-6 py-6 md:px-8 md:py-7">
          <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t('home.startPathTitle')}</h2>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t('home.startPathIntro')}</p>
          <ol className="list-decimal list-outside pl-5 space-y-2.5 text-sm text-foreground leading-relaxed">
            <li>
              <Link to="/evaluate" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
                {t('home.startPathEvaluate')}
              </Link>
            </li>
            <li>
              <Link to="/cv" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
                {t('home.startPathCv')}
              </Link>
            </li>
            <li>
              <Link to="/advanced/tracker" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
                {t('home.startPathTracker')}
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* Feature cards */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group flex gap-4 rounded-xl border border-border/80 bg-background p-5 md:p-6 transition-colors hover:bg-muted/30 hover:border-border"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/25 text-muted-foreground transition-colors group-hover:border-border group-hover:text-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <h2 className="font-heading text-lg font-semibold text-foreground">{t(card.titleKey)}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(card.descKey)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 rounded-xl border border-border/80 bg-muted/25 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="space-y-2 md:max-w-xl">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">career-ops</p>
            <h2 className="font-heading text-xl md:text-2xl font-semibold text-foreground">{t('home.advancedTeaserTitle')}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('home.advancedTeaserBody')}</p>
          </div>
          <Button asChild className="shrink-0 w-full md:w-auto">
            <Link to="/advanced" className="gap-2">
              {t('home.advancedTeaserCta')}
              <ArrowUpRight className="h-4 w-4 opacity-80" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
