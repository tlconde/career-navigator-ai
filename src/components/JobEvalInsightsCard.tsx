import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { EvaluateHandoff } from '@/lib/evaluateTypes';

type JobEvalInsightsCardProps = {
  jobEval: EvaluateHandoff;
  onDismiss?: () => void;
  /** When true, show title/hint from cv.* i18n keys */
  variant: 'form' | 'preview';
};

export function JobEvalInsightsCard({ jobEval, onDismiss, variant }: JobEvalInsightsCardProps) {
  const { t } = useTranslation();

  const title = variant === 'form' ? t('cv.jobEvalContextTitle') : t('cv.previewJobEvalTitle');
  const hint = variant === 'form' ? t('cv.jobEvalContextHint') : t('cv.previewJobEvalHint');

  return (
    <Card className="border-border/80 bg-muted/20 shadow-none">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{hint}</p>
            {jobEval.jobUrl?.trim() && (
              <p className="text-xs text-muted-foreground break-all">
                <span className="font-medium text-foreground">{t('evaluate.jobUrlLabel')}: </span>
                {jobEval.jobUrl.trim()}
              </p>
            )}
          </div>
          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground"
              onClick={onDismiss}
              aria-label={t('cv.jobEvalDismiss')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {jobEval.structured ? (
          <div className="space-y-3 text-sm">
            {(jobEval.structured.roleTitle || jobEval.structured.matchGrade) && (
              <p>
                {jobEval.structured.roleTitle && (
                  <span className="font-medium text-foreground">{jobEval.structured.roleTitle}</span>
                )}
                {jobEval.structured.roleTitle && jobEval.structured.matchGrade && ' · '}
                {jobEval.structured.matchGrade && (
                  <span className="text-muted-foreground">{jobEval.structured.matchGrade}</span>
                )}
              </p>
            )}
            {jobEval.structured.mustHaveKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalMustHave')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jobEval.structured.mustHaveKeywords.map((k, i) => (
                    <span
                      key={`must-${i}-${k}`}
                      className="inline-flex rounded-md bg-background/80 border border-border px-2 py-0.5 text-xs"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {jobEval.structured.recommendedKeywords.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalRecommended')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {jobEval.structured.recommendedKeywords.map((k, i) => (
                    <span key={`rec-${i}-${k}`} className="inline-flex rounded-md bg-muted/80 px-2 py-0.5 text-xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {jobEval.structured.missingAreas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalGaps')}
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {jobEval.structured.missingAreas.map((line, i) => (
                    <li key={`gap-${i}-${line.slice(0, 24)}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {jobEval.structured.prioritySkillsToAdd.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalPrioritySkills')}
                </p>
                <p className="text-muted-foreground">{jobEval.structured.prioritySkillsToAdd.join(' · ')}</p>
              </div>
            )}
            {jobEval.structured.cvBulletImprovements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalBulletIdeas')}
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {jobEval.structured.cvBulletImprovements.map((line, i) => (
                    <li key={`bullet-${i}-${line.slice(0, 24)}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            {jobEval.structured.atsNotes.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {t('cv.jobEvalAtsNotes')}
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {jobEval.structured.atsNotes.map((line, i) => (
                    <li key={`ats-${i}-${line.slice(0, 24)}`}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('cv.jobEvalMarkdownOnly')}</p>
        )}
      </CardContent>
    </Card>
  );
}
