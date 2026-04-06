import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Search, Lightbulb, Heart, Shield } from 'lucide-react';
import Layout from '@/components/Layout';

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

  return (
    <Layout>
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
            <Shield className="h-4 w-4" />
            <span>No account needed • No data stored • 100% private</span>
          </div>
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
    </Layout>
  );
};

export default Index;
