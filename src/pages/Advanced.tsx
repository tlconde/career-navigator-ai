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
  ArrowUpRight,
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
      <PageShell
        title={t('advanced.title')}
        subtitle={t('advanced.subtitle')}
        eyebrow="Appendix"
        width="wide"
      >
        {/* Why this exists — editorial sidebar block */}
        <section className="mb-16 grid grid-cols-12 gap-6 md:gap-8 border-t border-ink/15 pt-10">
          <div className="col-span-12 md:col-span-3">
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-foreground/60">
              Note
            </p>
            <h2 className="mt-2 font-display text-2xl italic font-normal leading-tight">
              {t('advanced.whyTitle')}
            </h2>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5 space-y-4">
            <p className="text-[15px] md:text-base text-foreground/85 leading-relaxed">
              {t('advanced.whyBody')}
            </p>
            <a
              href="https://github.com/santifer/career-ops"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-mark text-[11px] uppercase tracking-[0.16em] text-foreground hover:text-primary transition-colors"
            >
              {t('advanced.careerOpsRepo')}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        {/* Tools — numbered editorial grid, no rounded cards */}
        <section>
          <div className="flex items-end justify-between mb-6 border-b-2 border-ink pb-3">
            <p className="font-mono-mark text-[10px] uppercase tracking-[0.22em] text-foreground">
              The Index · {ADVANCED_TOOL_IDS.length} entries
            </p>
            <p className="hidden sm:block font-mono-mark text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Open · Free · Private
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15 border border-ink/15">
            {ADVANCED_TOOL_IDS.map((id, idx) => {
              const Icon = ICONS[id];
              const num = String(idx + 1).padStart(2, '0');
              return (
                <li key={id} className="contents">
                  <Link
                    to={`/advanced/${id}`}
                    className="group relative block bg-background hover:bg-accent/40 transition-colors duration-300 p-6 md:p-8"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <span className="font-display text-4xl md:text-5xl font-light leading-none text-primary">
                        {num}
                      </span>
                      <Icon className="h-5 w-5 text-foreground/40" strokeWidth={1.25} />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-normal leading-tight mb-2 text-foreground">
                      {t(`advanced.tools.${id}.title`)}
                    </h3>
                    <p className="text-[14px] text-muted-foreground leading-relaxed max-w-md">
                      {t(`advanced.tools.${id}.desc`)}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-1.5 font-mono-mark text-[11px] uppercase tracking-[0.16em] text-foreground">
                      {t('advanced.openTool')}
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
