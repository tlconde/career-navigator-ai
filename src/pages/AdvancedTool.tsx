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
        <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-6rem)]">
          <div className="px-4 pt-6 pb-2">
            <Link
              to="/advanced"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('advanced.back')}
            </Link>
            <h1 className="text-2xl font-bold text-foreground font-['Nunito']">
              {t('advanced.tools.tracker.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t('advanced.tools.tracker.desc')}</p>
          </div>
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
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        <div className="px-4 pt-6 pb-2 shrink-0">
          <Link
            to="/advanced"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('advanced.back')}
          </Link>
          <h1 className="text-2xl font-bold text-foreground font-['Nunito']">
            {t(`advanced.tools.${toolId}.title`)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t(`advanced.tools.${toolId}.desc`)}</p>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
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
