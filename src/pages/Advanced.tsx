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
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { PageShell } from '@/components/PageShell';
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
      <PageShell title={t('advanced.title')} subtitle={t('advanced.subtitle')} width="wide">
        <section className="mb-10 rounded-xl border border-border/80 bg-muted/15 px-5 py-5 md:px-6 md:py-6">
          <h2 className="font-heading text-base font-semibold text-foreground">{t('advanced.whyTitle')}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t('advanced.whyBody')}</p>
          <a
            href="https://github.com/santifer/career-ops"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary"
          >
            {t('advanced.careerOpsRepo')}
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </section>

        <section>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {ADVANCED_TOOL_IDS.map((id) => {
              const Icon = ICONS[id];
              return (
                <li key={id}>
                  <Link
                    to={`/advanced/${id}`}
                    className="group flex gap-4 rounded-xl border border-border/80 bg-background p-5 transition-colors hover:border-border hover:bg-muted/25"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-muted/30 text-muted-foreground transition-colors group-hover:border-border group-hover:text-foreground">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-heading text-base font-semibold text-foreground">{t(`advanced.tools.${id}.title`)}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t(`advanced.tools.${id}.desc`)}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground opacity-80 transition-opacity group-hover:opacity-100">
                        {t('advanced.openTool')}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </PageShell>
    </Layout>
  );
};

export default Advanced;
