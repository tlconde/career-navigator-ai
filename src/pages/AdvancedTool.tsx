import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ChatInterface from '@/components/ChatInterface';
import ApplicationTracker from '@/components/ApplicationTracker';
import { isAdvancedToolId, type ChatCoachType } from '@/lib/coach-types';
import { ArrowLeft } from 'lucide-react';

const AdvancedTool = () => {
  const { t } = useTranslation();
  const { toolId = '' } = useParams<{ toolId: string }>();

  if (!isAdvancedToolId(toolId)) {
    return <Navigate to="/advanced" replace />;
  }

  if (toolId === 'tracker') {
    return (
      <Layout>
        <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl flex-col px-4">
          <header className="shrink-0 pb-2 pt-8">
            <Link
              to="/advanced"
              className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              {t('advanced.back')}
            </Link>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {t('advanced.tools.tracker.title')}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t('advanced.tools.tracker.desc')}</p>
          </header>
          <ApplicationTracker />
        </div>
      </Layout>
    );
  }

  const chatType = toolId as ChatCoachType;
  const placeholder = t(`advanced.tools.${toolId}.placeholder`);

  const quickPrompts =
    toolId === 'batch'
      ? [
          {
            label: t('advanced.quick.batchTemplate'),
            message: t('advanced.quick.batchTemplateMsg'),
          },
        ]
      : toolId === 'pipeline'
        ? [
            {
              label: t('advanced.quick.pipelineTemplate'),
              message: t('advanced.quick.pipelineTemplateMsg'),
            },
          ]
        : toolId === 'outreach'
          ? [
              {
                label: t('advanced.quick.outreachLinkedIn'),
                message: t('advanced.quick.outreachLinkedInMsg'),
              },
            ]
          : undefined;

  return (
    <Layout>
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-4">
        <header className="shrink-0 pb-3 pt-8">
          <Link
            to="/advanced"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            {t('advanced.back')}
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {t(`advanced.tools.${toolId}.title`)}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t(`advanced.tools.${toolId}.desc`)}</p>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatInterface
            type={chatType}
            inputPlaceholder={placeholder}
            quickPrompts={quickPrompts}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AdvancedTool;
