import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Search, Lightbulb, Shield, ArrowUpRight, X, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

const PRIVACY_DISMISS_KEY = 'careerbridge-dismiss-privacy-v1';

const featureCards = [
  {
    num: '01',
    titleKey: 'home.evaluateTitle',
    descKey: 'home.evaluateDesc',
    path: '/evaluate',
    icon: Search,
    accent: 'primary' as const,
  },
  {
    num: '02',
    titleKey: 'home.cvTitle',
    descKey: 'home.cvDesc',
    path: '/cv',
    icon: FileText,
    accent: 'ink' as const,
  },
  {
    num: '03',
    titleKey: 'home.interviewTitle',
    descKey: 'home.interviewDesc',
    path: '/interview',
    icon: MessageSquare,
    accent: 'olive' as const,
  },
  {
    num: '04',
    titleKey: 'home.tipsTitle',
    descKey: 'home.tipsDesc',
    path: '/tips',
    icon: Lightbulb,
    accent: 'primary' as const,
  },
];

const marqueeWords = [
  'STAR+R method', 'ATS-optimized', '6 languages', 'No account', 'Private by default',
  'AI-guided CV', 'Real practice', 'Free forever', 'Built for newcomers',
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
        <div className="border-b border-ink/15 bg-accent/40 px-5 md:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[13px] text-foreground">
            <p className="flex items-start gap-2">
              <Shield className="h-4 w-4 shrink-0 mt-0.5 text-primary" aria-hidden />
              <span>{t('home.privacyBanner')}</span>
            </p>
            <button
              type="button"
              className="self-start sm:self-center inline-flex items-center gap-1 text-[12px] font-mono-mark uppercase tracking-[0.14em] text-foreground/70 hover:text-foreground transition-colors"
              onClick={dismissPrivacy}
            >
              <X className="h-3.5 w-3.5" />
              {t('home.privacyDismiss')}
            </button>
          </div>
        </div>
      )}

      {/* ── HERO — editorial masthead ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14">
          {/* Issue line */}
          <div className="flex items-center justify-between gap-4 pb-6 border-b-2 border-ink">
            <div className="flex items-center gap-3 font-mono-mark text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-foreground">
              <span>Issue 01</span>
              <span className="h-1 w-1 rounded-full bg-foreground/40" aria-hidden />
              <span>The job-search edition</span>
            </div>
            <span className="hidden sm:block font-mono-mark text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Free · Private · Open
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16 md:pb-24 grid grid-cols-12 gap-6 md:gap-8">
          {/* Left meta column */}
          <aside className="col-span-12 md:col-span-3 order-2 md:order-1 animate-rise" style={{ animationDelay: '120ms' }}>
            <div className="md:sticky md:top-28 space-y-6">
              <div className="space-y-1.5">
                <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary">
                  Feature
                </p>
                <p className="font-display text-lg italic text-foreground leading-snug">
                  A quiet, careful companion for the hardest part of starting over.
                </p>
              </div>
              <div className="rule-thick w-12" />
              <div className="space-y-2 text-[13px] text-muted-foreground leading-relaxed">
                <p>
                  Built on the <a href="https://github.com/santifer/career-ops" target="_blank" rel="noopener noreferrer" className="text-foreground underline decoration-primary/50 underline-offset-4 hover:decoration-primary">career-ops</a> methodology — refined for refugees, newcomers, and anyone rebuilding.
                </p>
              </div>
            </div>
          </aside>

          {/* Headline column */}
          <div className="col-span-12 md:col-span-9 order-1 md:order-2">
            <h1 className="font-display font-light tracking-[-0.02em] text-foreground leading-[0.92] text-[clamp(2.75rem,9vw,7.5rem)] animate-rise">
              Find work
              <br />
              <span className="italic font-normal">in a new</span>{' '}
              <span className="relative inline-block">
                <span className="underline-brush">country.</span>
              </span>
            </h1>

            <div className="mt-10 md:mt-14 grid grid-cols-12 gap-6 items-end">
              <p className="col-span-12 md:col-span-7 text-lg md:text-xl text-foreground/80 leading-relaxed max-w-xl animate-rise" style={{ animationDelay: '180ms' }}>
                Four AI tools — one private workspace. Practice interviews, build a CV that actually passes ATS, and analyse postings before you apply. No sign-up, no tracking, six languages.
              </p>
              <div className="col-span-12 md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-3 animate-rise" style={{ animationDelay: '260ms' }}>
                <Link
                  to="/evaluate"
                  className="group inline-flex items-center justify-between gap-4 bg-ink text-ink-foreground px-5 py-4 hover:bg-primary transition-colors duration-300"
                >
                  <span className="font-display text-lg italic">Begin with a job</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/cv"
                  className="group inline-flex items-center justify-between gap-4 border-2 border-ink/90 text-foreground px-5 py-4 hover:bg-ink hover:text-ink-foreground transition-colors duration-300"
                >
                  <span className="font-display text-lg italic">Build a CV</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee — editorial ticker */}
        <div className="border-y-2 border-ink bg-ink text-ink-foreground py-3 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap font-display italic text-2xl md:text-3xl">
            {[...marqueeWords, ...marqueeWords].map((w, i) => (
              <span key={i} className="mx-6 flex items-center gap-6">
                {w}
                <span className="text-primary text-3xl leading-none" aria-hidden>✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHAPTERS — the 4 tools as numbered articles ───────────────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary mb-3">
              Inside
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-[0.95] tracking-tight">
              Four chapters,
              <br />
              <span className="italic">one journey.</span>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-6 md:col-start-7 text-base md:text-lg text-muted-foreground leading-relaxed self-end">
            Pick any door. Most begin by evaluating a real posting — it teaches the AI what your CV needs to say, and what to practice for the interview.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
          {featureCards.map((card) => {
            const Icon = card.icon;
            const isInk = card.accent === 'ink';
            return (
              <Link
                key={card.path}
                to={card.path}
                className={`group relative block p-7 md:p-10 transition-colors duration-300 ${
                  isInk
                    ? 'bg-ink text-ink-foreground hover:bg-primary'
                    : 'bg-background hover:bg-accent/50'
                }`}
              >
                <div className="flex items-start justify-between mb-10 md:mb-16">
                  <span className={`font-display text-6xl md:text-7xl font-light leading-none ${
                    isInk ? 'text-primary' : 'text-primary'
                  }`}>
                    {card.num}
                  </span>
                  <Icon className={`h-7 w-7 ${isInk ? 'text-ink-foreground/60' : 'text-foreground/40'}`} strokeWidth={1.25} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-normal leading-tight mb-3">
                  {t(card.titleKey)}
                </h3>
                <p className={`text-[15px] leading-relaxed max-w-md ${
                  isInk ? 'text-ink-foreground/75' : 'text-muted-foreground'
                }`}>
                  {t(card.descKey)}
                </p>
                <div className={`mt-8 inline-flex items-center gap-2 font-mono-mark text-[11px] uppercase tracking-[0.18em] ${
                  isInk ? 'text-ink-foreground' : 'text-foreground'
                }`}>
                  Read chapter
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS — pull-quote style ───────────────────────────── */}
      <section className="bg-accent/30 border-y-2 border-ink/90">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary mb-4">
              How to use it
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light italic leading-[0.95]">
              In three
              <br />
              honest steps.
            </h2>
          </div>
          <ol className="col-span-12 md:col-span-8 space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-10">
            {[
              { n: '01', title: 'Evaluate', body: t('home.startPathEvaluate') + ' — paste a posting; get a grade A–F, gaps, and an action plan.', to: '/evaluate' },
              { n: '02', title: 'Build', body: t('home.startPathCv') + ' — answers from the evaluation flow into a tailored, ATS-friendly CV.', to: '/cv' },
              { n: '03', title: 'Track', body: t('home.startPathTracker') + ' — keep applications organised, fully on your device.', to: '/advanced/tracker' },
            ].map((s) => (
              <li key={s.n} className="space-y-3 border-t border-ink/30 pt-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono-mark text-xs tracking-[0.18em] text-foreground/60">STEP {s.n}</span>
                  <span className="font-display text-3xl italic text-primary">{s.n}</span>
                </div>
                <h3 className="font-display text-2xl font-normal">{s.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{s.body}</p>
                <Link
                  to={s.to}
                  className="inline-flex items-center gap-1.5 text-[12px] font-mono-mark uppercase tracking-[0.16em] text-foreground hover:text-primary transition-colors"
                >
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── ADVANCED TEASER — ink slab ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="bg-ink text-ink-foreground p-8 md:p-14 grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-8 space-y-4">
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-primary">
              Appendix · career-ops
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-[1.0]">
              {t('home.advancedTeaserTitle')}
            </h2>
            <p className="text-ink-foreground/75 leading-relaxed max-w-2xl text-[15px]">
              {t('home.advancedTeaserBody')}
            </p>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <Link
              to="/advanced"
              className="group inline-flex items-center gap-3 border-2 border-ink-foreground/80 px-5 py-3.5 hover:bg-primary hover:border-primary transition-colors"
            >
              <span className="font-display text-lg italic">{t('home.advancedTeaserCta')}</span>
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
