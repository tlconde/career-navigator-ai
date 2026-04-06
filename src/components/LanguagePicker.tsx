import { useTranslation } from 'react-i18next';
import { languages } from '@/i18n/config';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LanguagePicker = () => {
  const { i18n } = useTranslation();

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    const lang = languages.find(l => l.code === value);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = value;
  };

  return (
    <Select value={i18n.language?.split('-')[0] || 'en'} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px] bg-card border-border">
        <Globe className="h-4 w-4 mr-2 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguagePicker;
