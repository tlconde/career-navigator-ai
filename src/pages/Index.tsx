import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Search, Lightbulb, Heart, Shield, Sparkles, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const PRIVACY_DISMISS_KEY = 'careerbridge-dismiss-privacy-v1';

const featureCards = [
  {
    titleKey: 'home.interviewTitle',
    descKey: 'home.interviewDesc',
    path: '/interview',
    icon: MessageSquare,
    color: 'bg-primary/10 text-primary',
  },
  {
    titleKey: 'home.cvTitle',
    descKey: 'home.cvDesc',
    path: '/cv',
    icon: FileText,
    color: 'bg-accent/10 text-accent',
  },
  {
    titleKey: 'home.evaluateTitle',
    descKey: 'home.evaluateDesc',
    path: '/evaluate',
    icon: Search,
    color: 'bg-primary/10 text-primary',
  },
  {
    titleKey: 'home.tipsTitle',
    descKey: 'home.tipsDesc',
    path: '/tips',
    icon: Lightbulb,
    color: 'bg-accent/10 text-accent',
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
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-foreground">
            <p className="flex items-start gap-2 pr-8 sm:pr-0">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden />
              <span>{t('home.privacyBanner')}</span>
            </p>
            <Button type="button" variant="outline" size="sm" className="shrink-0 self-start sm:self-center" onClick={dismissPrivacy}>
              <X className="h-4 w-4 mr-1" />
              {t('home.privacyDismiss')}
            </Button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Heart className="h-4 w-4" /> {t('app.tagline')}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground font-['Nunito']">
            {t('home.hero')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('home.heroSub')}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0" />
            <span>{t('home.privacyLine')}</span>
          </div>
        </div>
      </section>

      {/* Start path */}
      <section className="pb-10 px-4">
        <div className="max-w-5xl mx-auto rounded-2xl border border-border bg-card/60 p-6 md:p-8">
          <h2 className="text-lg font-bold font-['Nunito'] text-foreground mb-2">{t('home.startPathTitle')}</h2>
          <p className="text-sm text-muted-foreground mb-4">{t('home.startPathIntro')}</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
            <li>
              <Link to="/evaluate" className="text-primary underline hover:opacity-90">
                {t('home.startPathEvaluate')}
              </Link>
            </li>
            <li>
              <Link to="/cv" className="text-primary underline hover:opacity-90">
                {t('home.startPathCv')}
              </Link>
            </li>
            <li>
              <Link to="/advanced/tracker" className="text-primary underline hover:opacity-90">
                {t('home.startPathTracker')}
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {/* Feature cards */}
      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group block rounded-2xl border border-border bg-card p-6 md:p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${card.color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors font-['Nunito']">
                  {t(card.titleKey)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(card.descKey)}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-5xl mx-auto rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              career-ops
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-['Nunito'] text-foreground">
              {t('home.advancedTeaserTitle')}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl">
              {t('home.advancedTeaserBody')}
            </p>
          </div>
          <Link
            to="/advanced"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            {t('home.advancedTeaserCta')}
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
