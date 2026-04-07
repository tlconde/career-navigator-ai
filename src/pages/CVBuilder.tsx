import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Download, Trash2, Sparkles, Pencil, Upload, ChevronDown, Check } from 'lucide-react';
import { streamChat } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';
import type { CvFormExtraction } from '@/lib/cvFormTypes';
import { mergeCvExtractions } from '@/lib/cvFormMerge';
import { parseCvExtractionJson } from '@/lib/parseCvJsonResponse';
import { parseCvFromTextHeuristic } from '@/lib/parseCvFromText';
import { streamChatToString } from '@/lib/streamChatToString';
import type { EvaluateHandoff } from '@/lib/evaluateTypes';
import { formatEvaluationContextForPrompt } from '@/lib/evaluateTypes';
import { formatCvExtractionForEvaluate, saveCvEvaluatePrefill } from '@/lib/cvEvaluatePrefill';
import { JobEvalInsightsCard } from '@/components/JobEvalInsightsCard';

interface Experience {
  jobTitle: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

const MAX_CV_UPLOAD_BYTES = 512 * 1024;
const MAX_PDF_BYTES = 3 * 1024 * 1024;

const EVAL_HANDOFF_STORAGE_KEY = 'careerbridge-eval-handoff-v1';

function readPersistedEvalHandoff(): EvaluateHandoff | null {
  try {
    const raw = sessionStorage.getItem(EVAL_HANDOFF_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EvaluateHandoff;
  } catch {
    return null;
  }
}

function persistEvalHandoff(h: EvaluateHandoff) {
  try {
    sessionStorage.setItem(EVAL_HANDOFF_STORAGE_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

function clearPersistedEvalHandoff() {
  try {
    sessionStorage.removeItem(EVAL_HANDOFF_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Collapsed until a CV file is uploaded — then sections expand so parsed fields are visible. */
const SECTION_KEYS = ['personal', 'skills', 'experience', 'education', 'generate'] as const;

function collapsedSectionsState(): Record<string, boolean> {
  return Object.fromEntries(SECTION_KEYS.map((k) => [k, false]));
}

function expandedSectionsState(): Record<string, boolean> {
  return Object.fromEntries(SECTION_KEYS.map((k) => [k, true]));
}

const CVBuilder = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const routerLocation = useRouterLocation();
  const navigate = useNavigate();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(collapsedSectionsState);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [languages, setLanguages] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([{ jobTitle: '', company: '', duration: '', description: '' }]);
  const [educations, setEducations] = useState<Education[]>([{ degree: '', school: '', year: '' }]);
  const [targetRole, setTargetRole] = useState('');
  const [targetRoleSuggestion, setTargetRoleSuggestion] = useState('');
  const [jobEval, setJobEval] = useState<EvaluateHandoff | null>(null);

  const [cvOutput, setCvOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'form' | 'result'>('form');

  const [uploadedCvText, setUploadedCvText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isStructuringCv, setIsStructuringCv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfParseLockRef = useRef(false);
  const uploadGenerationRef = useRef(0);
  const evalPersistedLoadedRef = useRef(false);

  useEffect(() => {
    const state = routerLocation.state as { evaluateHandoff?: EvaluateHandoff } | null;
    if (state?.evaluateHandoff) {
      persistEvalHandoff(state.evaluateHandoff);
      setJobEval(state.evaluateHandoff);
      navigate(routerLocation.pathname, { replace: true, state: {} });
      evalPersistedLoadedRef.current = true;
      toast({ title: t('cv.jobEvalLoaded') });
      return;
    }
    if (!evalPersistedLoadedRef.current) {
      evalPersistedLoadedRef.current = true;
      const persisted = readPersistedEvalHandoff();
      if (persisted) setJobEval(persisted);
    }
  }, [routerLocation.state, routerLocation.pathname, navigate, toast, t]);

  useEffect(() => {
    const r = jobEval?.structured?.roleTitle?.trim();
    if (r) {
      setTargetRoleSuggestion((prev) => prev || r);
    }
  }, [jobEval]);

  const clearJobEval = () => {
    setJobEval(null);
    clearPersistedEvalHandoff();
  };

  const evaluationPromptBlock = jobEval ? `\n\n${formatEvaluationContextForPrompt(jobEval)}\n` : '';

  const addExperience = () => setExperiences([...experiences, { jobTitle: '', company: '', duration: '', description: '' }]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));
  const updateExperience = (i: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[i] = { ...updated[i], [field]: value };
    setExperiences(updated);
  };

  const addEducation = () => setEducations([...educations, { degree: '', school: '', year: '' }]);
  const removeEducation = (i: number) => setEducations(educations.filter((_, idx) => idx !== i));
  const updateEducation = (i: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[i] = { ...updated[i], [field]: value };
    setEducations(updated);
  };

  const buildUserInfo = () =>
    `
Name: ${name}
Email: ${email || '(not provided)'}
Phone: ${phone || '(not provided)'}
Location: ${location || '(not provided)'}
LinkedIn: ${linkedin || '(not provided)'}
GitHub: ${github || '(not provided)'}
Languages: ${languages || '(not provided — omit a Languages section if empty)'}

Skills:
${skills}

Experience:
${experiences.map(e => `- ${e.jobTitle} at ${e.company} (${e.duration}): ${e.description}`).join('\n')}

Education:
${educations.map(e => `- ${e.degree} from ${e.school} (${e.year})`).join('\n')}

Target Role: ${targetRole}
    `.trim();

  const uploadBlock =
    uploadedCvText.trim() === ''
      ? ''
      : `

## User-uploaded CV (source text — merge, polish, and ATS-optimize for the target role)
Filename: ${uploadedFileName || 'upload'}
---
${uploadedCvText}
---
Use this as primary content when the form below is incomplete. Prefer the structured form for contact details when both specify them.
`;

  const applyCvFormToState = (m: CvFormExtraction) => {
    setName(m.name);
    setEmail(m.email);
    setPhone(m.phone);
    setLocation(m.location);
    setLinkedin(m.linkedin);
    setGithub(m.github);
    setLanguages(m.languages);
    setSkills(m.skills);
    if (m.targetRole?.trim()) setTargetRoleSuggestion(m.targetRole.trim());
    const hasExp = m.experiences.some(
      (e) => e.jobTitle.trim() || e.company.trim() || e.duration.trim() || e.description.trim(),
    );
    setExperiences(hasExp ? m.experiences : [{ jobTitle: '', company: '', duration: '', description: '' }]);
    const hasEdu = m.educations.some((e) => e.degree.trim() || e.school.trim() || e.year.trim());
    setEducations(hasEdu ? m.educations : [{ degree: '', school: '', year: '' }]);
  };

  const finishLoad = async (text: string, fileName: string) => {
    const gen = ++uploadGenerationRef.current;
    setOpenSections(expandedSectionsState());
    setUploadedCvText(text);
    setUploadedFileName(fileName);
    const stem = fileName.replace(/\.[^.]+$/, '');
    const heuristic = parseCvFromTextHeuristic(text, stem);
    const heuristicForm = mergeCvExtractions(heuristic, null);
    applyCvFormToState(heuristicForm);
    toast({ title: t('cv.uploadOk') });

    if (gen !== uploadGenerationRef.current) return;

    setIsStructuringCv(true);
    let finalMerged: CvFormExtraction = heuristicForm;
    try {
      const res = await streamChatToString({
        type: 'cvparse',
        language: i18n.language?.split('-')[0] || 'en',
        messages: [
          {
            role: 'user',
            content: `Extract structured data from this resume or CV. Map every job, school, skill block, and language list you can find into the JSON fields. Use empty strings only when a field is truly absent.

---BEGIN---
${text.slice(0, 100000)}
---END---`,
          },
        ],
      });
      if (gen !== uploadGenerationRef.current) return;
      if (res.ok) {
        const parsed = parseCvExtractionJson(res.text);
        if (parsed) {
          finalMerged = mergeCvExtractions(heuristic, parsed);
          applyCvFormToState(finalMerged);
          toast({ title: t('cv.structureDone') });
        } else {
          const hasRichHeuristic =
            !!heuristicForm.skills?.trim() ||
            heuristicForm.experiences?.some((e) => e.jobTitle || e.company || e.description) ||
            heuristicForm.educations?.some((e) => e.degree || e.school);
          if (hasRichHeuristic) {
            toast({
              title: t('cv.structureHeuristicOnly'),
              description: t('cv.structureHeuristicOnlyHint'),
            });
          } else {
            toast({
              title: t('cv.structurePartial'),
              description: t('cv.structurePartialHint'),
            });
          }
        }
      } else {
        toast({ title: t('cv.structureFailed'), variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      if (gen === uploadGenerationRef.current) {
        toast({ title: t('cv.structureFailed'), variant: 'destructive' });
      }
    } finally {
      if (gen === uploadGenerationRef.current) {
        setIsStructuringCv(false);
        saveCvEvaluatePrefill(formatCvExtractionForEvaluate(finalMerged));
      }
    }
  };

  const processUploadedFile = async (file: File) => {
    const lower = file.name.toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isText = lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.markdown');

    if (!isPdf && !isText) {
      toast({ title: t('cv.uploadBadType'), variant: 'destructive' });
      return;
    }

    const maxBytes = isPdf ? MAX_PDF_BYTES : MAX_CV_UPLOAD_BYTES;
    if (file.size > maxBytes) {
      toast({ title: isPdf ? t('cv.uploadPdfTooLarge') : t('cv.uploadTooLarge'), variant: 'destructive' });
      return;
    }

    if (isPdf) {
      if (pdfParseLockRef.current) return;
      pdfParseLockRef.current = true;
      setIsParsingPdf(true);
      try {
        const { extractTextFromPdf } = await import('@/lib/extractPdfText');
        const text = await extractTextFromPdf(file);
        if (!text.trim()) {
          toast({ title: t('cv.uploadPdfEmpty'), variant: 'destructive' });
          return;
        }
        await finishLoad(text, file.name);
      } catch (e) {
        console.error(e);
        toast({ title: t('cv.uploadPdfError'), variant: 'destructive' });
      } finally {
        setIsParsingPdf(false);
        pdfParseLockRef.current = false;
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      void finishLoad(text, file.name);
    };
    reader.onerror = () => toast({ title: t('cv.uploadReadError'), variant: 'destructive' });
    reader.readAsText(file);
  };

  const clearUpload = () => {
    uploadGenerationRef.current += 1;
    setIsStructuringCv(false);
    setUploadedCvText('');
    setUploadedFileName(null);
    setOpenSections(collapsedSectionsState());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void processUploadedFile(f);
  };

  const onDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isParsingPdf) return;
    const f = e.dataTransfer.files?.[0];
    if (f) void processUploadedFile(f);
  };

  const generateCV = async () => {
    setIsGenerating(true);
    setCurrentScreen('result');
    const userInfo = buildUserInfo();

    const instruction = `Please create a professional, ATS-optimized CV in markdown with this information:

${userInfo}
${uploadBlock}
${evaluationPromptBlock}
STRICT RULES:
- Use ONLY the contact details given above. Do NOT output placeholders like [Phone Number], [Email Address], [LinkedIn URL], or similar — write the real values or leave that part out.
- If LinkedIn or GitHub are "(not provided)", omit those links entirely.
- If Languages are provided, include a clear **Languages** section. If not provided and relevant, you may skip or mention one line only if the user listed languages elsewhere.
`;

    let result = '';
    await streamChat({
      messages: [{ role: 'user', content: instruction }],
      type: 'cv',
      language: i18n.language?.split('-')[0] || 'en',
      onDelta: (chunk) => {
        result += chunk;
        setCvOutput(result);
      },
      onDone: () => {
        setIsGenerating(false);
      },
      onError: (errorType) => {
        setIsGenerating(false);
        toast({ title: t(`common.${errorType}`), variant: 'destructive' });
      },
    });
  };

  const applySuggestionsToCv = async () => {
    if (!cvOutput.trim()) return;
    setIsApplying(true);
    let result = '';
    const mergePrompt = `You previously produced the CV and any ATS / optimization advice below.

TASK: Output ONLY the full updated CV as markdown. Merge all useful recommendations (new sections like Languages, keywords, tightened bullets) INTO the CV itself.

- Integrate concrete content from any "ATS Optimization", "Professional Advice", or similar sections into the right CV sections, then remove those meta sections OR reduce them to a 2-line optional note at the end.
- Keep real contact details only — never use bracket placeholders.
- If a Languages section was recommended and user data supports it, add it.
${evaluationPromptBlock ? `\nWhen revising, apply these job-specific insights:\n${evaluationPromptBlock}\n` : ''}
--- CV to revise ---
${cvOutput}
--- END ---`;

    await streamChat({
      messages: [{ role: 'user', content: mergePrompt }],
      type: 'cv',
      language: i18n.language?.split('-')[0] || 'en',
      onDelta: (chunk) => {
        result += chunk;
        setCvOutput(result);
      },
      onDone: () => {
        setIsApplying(false);
        toast({ title: t('cv.applyDone') });
      },
      onError: (errorType) => {
        setIsApplying(false);
        toast({ title: t(`common.${errorType}`), variant: 'destructive' });
      },
    });
  };

  const downloadCV = () => {
    const blob = new Blob([cvOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name || 'cv'}_resume.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    setCvOutput('');
    setCurrentScreen('form');
    setName('');
    setEmail('');
    setPhone('');
    setLocation('');
    setLinkedin('');
    setGithub('');
    setLanguages('');
    setSkills('');
    setExperiences([{ jobTitle: '', company: '', duration: '', description: '' }]);
    setEducations([{ degree: '', school: '', year: '' }]);
    setTargetRole('');
    setTargetRoleSuggestion('');
    clearUpload();
    clearJobEval();
  };

  const sectionHasContent = (key: string): boolean => {
    switch (key) {
      case 'personal':
        return !!(name || email || phone || location || linkedin || github || languages);
      case 'skills':
        return !!skills.trim();
      case 'experience':
        return experiences.some((e) => e.jobTitle || e.company);
      case 'education':
        return educations.some((e) => e.degree || e.school);
      case 'generate':
        return !!targetRole.trim();
      default:
        return false;
    }
  };

  const SectionHeader = ({ sectionKey, number, title }: { sectionKey: string; number: number; title: string }) => (
    <CollapsibleTrigger className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors text-left">
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
          sectionHasContent(sectionKey) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}
      >
        {sectionHasContent(sectionKey) ? <Check className="h-3.5 w-3.5" /> : number}
      </div>
      <span className="font-semibold text-foreground flex-1">{title}</span>
      <ChevronDown
        className={`h-4 w-4 text-muted-foreground transition-transform ${
          openSections[sectionKey] ? 'rotate-180' : ''
        }`}
      />
    </CollapsibleTrigger>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {currentScreen === 'form' ? (
          <>
            <h1 className="text-2xl font-bold text-foreground font-['Nunito'] mb-1">{t('cv.title')}</h1>
            <p className="text-sm text-muted-foreground mb-2">{t('cv.subtitle')}</p>
            <p className="text-sm mb-6">
              <Link to="/evaluate" state={{ evaluatePrefillSkills: buildUserInfo() }} className="text-primary hover:underline font-medium">
                {t('cv.openJobEvaluate')}
              </Link>
              <span className="text-muted-foreground"> — {t('cv.openJobEvaluateHint')}</span>
            </p>

            {/* Upload area */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf"
              className="sr-only"
              aria-label={t('cv.uploadButton')}
              onChange={onFileInputChange}
              disabled={isParsingPdf}
            />
            <Card
              className="border-dashed border-2 bg-muted/30 mb-6"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={onDropUpload}
            >
              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-medium text-foreground">{t('cv.uploadTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('cv.uploadHint')}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isParsingPdf}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isParsingPdf ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('cv.uploadPdfParsing')}</>
                    ) : isStructuringCv ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t('cv.structuringFields')}</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" /> {t('cv.uploadButton')}</>
                    )}
                  </Button>
                  {uploadedFileName && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearUpload} disabled={isParsingPdf}>
                      {t('cv.uploadClear')}
                    </Button>
                  )}
                </div>
                {uploadedFileName && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{uploadedFileName}</span>
                    {' · '}
                    {uploadedCvText.length.toLocaleString()} {t('cv.uploadChars')}
                  </p>
                )}
              </CardContent>
            </Card>

            {jobEval && (
              <div className="mb-6">
                <JobEvalInsightsCard jobEval={jobEval} onDismiss={clearJobEval} variant="form" />
              </div>
            )}

            {/* Vertical collapsible sections */}
            <div className="space-y-3">
          {/* Section 1: Personal Info */}
          <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
            <Card>
              <SectionHeader sectionKey="personal" number={1} title={t('cv.step1')} />
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <Input placeholder={t('cv.name')} value={name} onChange={e => setName(e.target.value)} />
                  <Input placeholder={t('cv.email')} value={email} onChange={e => setEmail(e.target.value)} type="email" />
                  <Input placeholder={t('cv.phone')} value={phone} onChange={e => setPhone(e.target.value)} />
                  <Input placeholder={t('cv.location')} value={location} onChange={e => setLocation(e.target.value)} />
                  <Input placeholder={t('cv.linkedin')} value={linkedin} onChange={e => setLinkedin(e.target.value)} />
                  <Input placeholder={t('cv.github')} value={github} onChange={e => setGithub(e.target.value)} />
                  <Textarea
                    placeholder={t('cv.languagesPlaceholder')}
                    value={languages}
                    onChange={e => setLanguages(e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 2: Skills */}
          <Collapsible open={openSections.skills} onOpenChange={() => toggleSection('skills')}>
            <Card>
              <SectionHeader sectionKey="skills" number={2} title={t('cv.step2')} />
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <Textarea
                    value={skills}
                    onChange={e => setSkills(e.target.value)}
                    placeholder={t('cv.skillsPlaceholder')}
                    rows={5}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 3: Experience */}
          <Collapsible open={openSections.experience} onOpenChange={() => toggleSection('experience')}>
            <Card>
              <SectionHeader sectionKey="experience" number={3} title={t('cv.step3')} />
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  {experiences.map((exp, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                          {experiences.length > 1 && (
                            <button type="button" onClick={() => removeExperience(i)} className="text-destructive hover:opacity-70">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <Input placeholder={t('cv.jobTitle')} value={exp.jobTitle} onChange={e => updateExperience(i, 'jobTitle', e.target.value)} />
                        <Input placeholder={t('cv.company')} value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                        <Input placeholder={t('cv.duration')} value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} />
                        <Textarea placeholder={t('cv.description')} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={2} />
                      </CardContent>
                    </Card>
                  ))}
                  <button type="button" onClick={addExperience} className="text-sm text-primary hover:underline flex items-center gap-1">
                    {t('cv.addExperience')}
                  </button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 4: Education */}
          <Collapsible open={openSections.education} onOpenChange={() => toggleSection('education')}>
            <Card>
              <SectionHeader sectionKey="education" number={4} title={t('cv.step4')} />
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  {educations.map((edu, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                          {educations.length > 1 && (
                            <button type="button" onClick={() => removeEducation(i)} className="text-destructive hover:opacity-70">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <Input placeholder={t('cv.degree')} value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
                        <Input placeholder={t('cv.school')} value={edu.school} onChange={e => updateEducation(i, 'school', e.target.value)} />
                        <Input placeholder={t('cv.year')} value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} />
                      </CardContent>
                    </Card>
                  ))}
                  <button type="button" onClick={addEducation} className="text-sm text-primary hover:underline flex items-center gap-1">
                    {t('cv.addEducation')}
                  </button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Section 5: Target Role & Generate */}
          <Collapsible open={openSections.generate} onOpenChange={() => toggleSection('generate')}>
            <Card>
              <SectionHeader sectionKey="generate" number={5} title={t('cv.step5')} />
              <CollapsibleContent>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <Input
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder={
                      targetRoleSuggestion
                        ? `${t('cv.targetPlaceholder')} (${targetRoleSuggestion})`
                        : t('cv.targetPlaceholder')
                    }
                  />
                  {targetRoleSuggestion && !targetRole.trim() && (
                    <p className="text-xs text-muted-foreground">
                      Suggested from your current CV role: <span className="font-medium">{targetRoleSuggestion}</span>. Update this to the next role you want.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('cv.regenerateHint')}</p>
                  <Button onClick={generateCV} disabled={isGenerating || !name.trim()} className="w-full">
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('cv.generating')}</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> {cvOutput ? t('cv.regenerate') : t('cv.generate')}</>
                    )}
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
            </div>
          </>
        ) : (
          <div className="mt-8 space-y-4">
            {jobEval && (
              <JobEvalInsightsCard jobEval={jobEval} onDismiss={clearJobEval} variant="preview" />
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold font-['Nunito']">{t('cv.preview')}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t('cv.previewHelp')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={downloadCV} variant="outline" size="sm" type="button">
                  <Download className="h-4 w-4 mr-2" /> {t('cv.download')}
                </Button>
                <Button
                  onClick={applySuggestionsToCv}
                  disabled={isApplying}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {isApplying ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('cv.applying')}</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> {t('cv.applySuggestions')}</>
                  )}
                </Button>
              </div>
            </div>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="edit" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  {t('cv.editMarkdown')}
                </TabsTrigger>
                <TabsTrigger value="preview">{t('cv.previewRendered')}</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-4">
                <Textarea
                  value={cvOutput}
                  onChange={(e) => setCvOutput(e.target.value)}
                  className="min-h-[min(70vh,520px)] font-mono text-sm leading-relaxed resize-y"
                  spellCheck={false}
                  disabled={isApplying}
                  aria-label={t('cv.editMarkdown')}
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{cvOutput}</ReactMarkdown>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen('form')}
                className="w-full"
                type="button"
              >
                {t('cv.editQuestionnaire')}
              </Button>
              <Button variant="ghost" onClick={startOver} className="w-full text-muted-foreground" type="button">
                {t('cv.startOver')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CVBuilder;
