import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Radar,
  Layers,
  Table2,
  ListOrdered,
  FileEdit,
  Mail,
  Building2,
  GraduationCap,
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { ADVANCED_TOOL_IDS, type AdvancedToolId } from '@/lib/coach-types';

const ICONS: Record<AdvancedToolId, typeof Radar> = {
  scan: Radar,
  batch: Layers,
  tracker: Table2,
  pipeline: ListOrdered,
  apply: FileEdit,
  outreach: Mail,
  deep: Building2,
  training: GraduationCap,
  project: FolderKanban,
};

const Advanced = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold font-['Nunito'] text-foreground">
            {t('advanced.title')}
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">{t('advanced.subtitle')}</p>
        </header>

        <section className="rounded-2xl border border-border bg-card/60 p-6 space-y-3">
          <h2 className="font-bold text-foreground font-['Nunito']">{t('advanced.whyTitle')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{t('advanced.whyBody')}</p>
          <a
            href="https://github.com/santifer/career-ops"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('advanced.careerOpsRepo')}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </section>

        <section>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADVANCED_TOOL_IDS.map((id) => {
              const Icon = ICONS[id];
              return (
                <li key={id}>
                  <Link
                    to={`/advanced/${id}`}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all h-full"
                  >
                    <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="font-bold text-foreground font-['Nunito']">
                        {t(`advanced.tools.${id}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(`advanced.tools.${id}.desc`)}
                      </p>
                      <span className="text-sm font-medium text-primary">{t('advanced.openTool')} →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default Advanced;
