import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Download, Plus, Trash2 } from 'lucide-react';
import { streamChat } from '@/lib/chat';
import { useToast } from '@/hooks/use-toast';

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

const CVBuilder = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([{ jobTitle: '', company: '', duration: '', description: '' }]);
  const [educations, setEducations] = useState<Education[]>([{ degree: '', school: '', year: '' }]);
  const [targetRole, setTargetRole] = useState('');

  // Output
  const [cvOutput, setCvOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    t('cv.step1'), t('cv.step2'), t('cv.step3'), t('cv.step4'), t('cv.step5'),
  ];

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

  const generateCV = async () => {
    setIsGenerating(true);
    const userInfo = `
Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}

Skills:
${skills}

Experience:
${experiences.map(e => `- ${e.jobTitle} at ${e.company} (${e.duration}): ${e.description}`).join('\n')}

Education:
${educations.map(e => `- ${e.degree} from ${e.school} (${e.year})`).join('\n')}

Target Role: ${targetRole}
    `.trim();

    let result = '';
    await streamChat({
      messages: [{ role: 'user', content: `Please create a professional, ATS-optimized CV with this information:\n\n${userInfo}` }],
      type: 'cv',
      language: i18n.language?.split('-')[0] || 'en',
      onDelta: (chunk) => {
        result += chunk;
        setCvOutput(result);
      },
      onDone: () => {
        setIsGenerating(false);
        setStep(5);
      },
      onError: (errorType) => {
        setIsGenerating(false);
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground font-['Nunito'] mb-1">{t('cv.title')}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t('cv.subtitle')}</p>

        {/* Stepper */}
        {step < 5 && (
          <div className="flex items-center gap-1 mb-8 overflow-x-auto">
            {steps.map((label, i) => (
              <div
                key={i}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  i === step ? 'bg-primary text-primary-foreground' :
                  i < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {i + 1}. {label}
              </div>
            ))}
          </div>
        )}

        {/* Step 0: Personal Info */}
        {step === 0 && (
          <div className="space-y-4">
            <Input placeholder={t('cv.name')} value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder={t('cv.email')} value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <Input placeholder={t('cv.phone')} value={phone} onChange={e => setPhone(e.target.value)} />
            <Input placeholder={t('cv.location')} value={location} onChange={e => setLocation(e.target.value)} />
            <Button onClick={() => setStep(1)} disabled={!name.trim()} className="w-full">{t('cv.next')}</Button>
          </div>
        )}

        {/* Step 1: Skills */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">{t('cv.skills')}</label>
            <Textarea
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder={t('cv.skillsPlaceholder')}
              rows={6}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)} className="flex-1">{t('cv.back')}</Button>
              <Button onClick={() => setStep(2)} className="flex-1">{t('cv.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">#{i + 1}</span>
                    {experiences.length > 1 && (
                      <button onClick={() => removeExperience(i)} className="text-destructive hover:opacity-70">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Input placeholder={t('cv.jobTitle')} value={exp.jobTitle} onChange={e => updateExperience(i, 'jobTitle', e.target.value)} />
                  <Input placeholder={t('cv.company')} value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} />
                  <Input placeholder={t('cv.duration')} value={exp.duration} onChange={e => updateExperience(i, 'duration', e.target.value)} />
                  <Textarea placeholder={t('cv.description')} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} rows={3} />
                </CardContent>
              </Card>
            ))}
            <button onClick={addExperience} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Plus className="h-4 w-4" /> {t('cv.addExperience')}
            </button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t('cv.back')}</Button>
              <Button onClick={() => setStep(3)} className="flex-1">{t('cv.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 3: Education */}
        {step === 3 && (
          <div className="space-y-4">
            {educations.map((edu, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">#{i + 1}</span>
                    {educations.length > 1 && (
                      <button onClick={() => removeEducation(i)} className="text-destructive hover:opacity-70">
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
            <button onClick={addEducation} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Plus className="h-4 w-4" /> {t('cv.addEducation')}
            </button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">{t('cv.back')}</Button>
              <Button onClick={() => setStep(4)} className="flex-1">{t('cv.next')}</Button>
            </div>
          </div>
        )}

        {/* Step 4: Target Role */}
        {step === 4 && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-foreground">{t('cv.targetRole')}</label>
            <Input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder={t('cv.targetPlaceholder')}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">{t('cv.back')}</Button>
              <Button onClick={generateCV} disabled={isGenerating} className="flex-1">
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('cv.generating')}</>
                ) : (
                  t('cv.generate')
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Preview */}
        {step === 5 && cvOutput && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-['Nunito']">{t('cv.preview')}</h2>
              <Button onClick={downloadCV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> {t('cv.download')}
              </Button>
            </div>
            <Card>
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{cvOutput}</ReactMarkdown>
              </CardContent>
            </Card>
            <Button variant="outline" onClick={() => { setStep(0); setCvOutput(''); }} className="w-full">
              {t('cv.back')} — Start Over
            </Button>
          </div>
        )}

        {/* Generating preview */}
        {isGenerating && cvOutput && step === 4 && (
          <Card className="mt-6">
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{cvOutput}</ReactMarkdown>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CVBuilder;
