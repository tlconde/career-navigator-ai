export interface ExperienceRow {
  jobTitle: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationRow {
  degree: string;
  school: string;
  year: string;
}

/** Structured CV fields for the wizard + AI extraction */
export interface CvFormExtraction {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  languages: string;
  skills: string;
  targetRole: string;
  experiences: ExperienceRow[];
  educations: EducationRow[];
}

export function emptyCvForm(): CvFormExtraction {
  return {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    languages: '',
    skills: '',
    targetRole: '',
    experiences: [{ jobTitle: '', company: '', duration: '', description: '' }],
    educations: [{ degree: '', school: '', year: '' }],
  };
}
