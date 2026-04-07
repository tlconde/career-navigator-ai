import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'careerbridge-tracker-v1';

export type TrackerRow = {
  id: string;
  company: string;
  role: string;
  status: string;
  url: string;
  notes: string;
  updated: string;
};

function loadRows(): TrackerRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrackerRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRows(rows: TrackerRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

const ApplicationTracker = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [rows, setRows] = useState<TrackerRow[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRows(loadRows());
  }, []);

  const persist = useCallback((next: TrackerRow[]) => {
    setRows(next);
    saveRows(next);
  }, []);

  const addRow = () => {
    const now = new Date().toISOString().slice(0, 10);
    persist([
      ...rows,
      {
        id: crypto.randomUUID(),
        company: '',
        role: '',
        status: t('advanced.tracker.statusApplied'),
        url: '',
        notes: '',
        updated: now,
      },
    ]);
  };

  const update = (id: string, patch: Partial<TrackerRow>) => {
    persist(
      rows.map((r) => (r.id === id ? { ...r, ...patch, updated: new Date().toISOString().slice(0, 10) } : r)),
    );
  };

  const remove = (id: string) => {
    persist(rows.filter((r) => r.id !== id));
  };

  const exportCsv = () => {
    const header = ['company', 'role', 'status', 'url', 'notes', 'updated'];
    const esc = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [r.company, r.role, r.status, r.url, r.notes, r.updated].map(esc).join(','),
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'applications.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast({ title: t('advanced.tracker.importCsvInvalid'), variant: 'destructive' });
        return;
      }
      const table = lines.map(parseCsvLine);
      const header = table[0].map((h) => h.trim().toLowerCase());
      const col = (name: string, fallback: number) => {
        const i = header.indexOf(name);
        return i >= 0 ? i : fallback;
      };
      const ci = col('company', 0);
      const ri = col('role', 1);
      const si = col('status', 2);
      const ui = col('url', 3);
      const ni = col('notes', 4);
      const udi = col('updated', 5);
      const imported: TrackerRow[] = table.slice(1).map((cells) => ({
        id: crypto.randomUUID(),
        company: cells[ci] ?? '',
        role: cells[ri] ?? '',
        status: cells[si] ?? '',
        url: cells[ui] ?? '',
        notes: cells[ni] ?? '',
        updated: (cells[udi] ?? '').trim() || new Date().toISOString().slice(0, 10),
      }));
      const replace = window.confirm(t('advanced.tracker.importReplaceConfirm'));
      setRows((prev) => {
        const next = replace ? imported : [...prev, ...imported];
        saveRows(next);
        return next;
      });
      toast({ title: t('advanced.tracker.importCsvOk') });
    };
    reader.onerror = () => toast({ title: t('advanced.tracker.importCsvInvalid'), variant: 'destructive' });
    reader.readAsText(file);
  };

  return (
    <div className="w-full space-y-4 pb-10">
      <input
        ref={importInputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label={t('advanced.tracker.importCsv')}
        onChange={onImportFile}
      />
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <p className="text-sm text-muted-foreground max-w-xl">{t('advanced.tracker.storageNote')}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            {t('advanced.tracker.exportCsv')}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            {t('advanced.tracker.importCsv')}
          </Button>
          <Button type="button" size="sm" onClick={addRow}>
            <Plus className="h-4 w-4 mr-1" />
            {t('advanced.tracker.addRow')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left">
              <th className="p-3 font-semibold min-w-[120px]">{t('advanced.tracker.colCompany')}</th>
              <th className="p-3 font-semibold min-w-[120px]">{t('advanced.tracker.colRole')}</th>
              <th className="p-3 font-semibold min-w-[100px]">{t('advanced.tracker.colStatus')}</th>
              <th className="p-3 font-semibold min-w-[160px]">{t('advanced.tracker.colUrl')}</th>
              <th className="p-3 font-semibold min-w-[140px]">{t('advanced.tracker.colNotes')}</th>
              <th className="p-3 font-semibold w-12" aria-label={t('advanced.tracker.remove')}>
                {' '}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {t('advanced.tracker.empty')}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 align-top">
                  <td className="p-2">
                    <Input
                      value={r.company}
                      onChange={(e) => update(r.id, { company: e.target.value })}
                      placeholder={t('advanced.tracker.phCompany')}
                      className="min-w-[7rem]"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.role}
                      onChange={(e) => update(r.id, { role: e.target.value })}
                      placeholder={t('advanced.tracker.phRole')}
                      className="min-w-[7rem]"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.status}
                      onChange={(e) => update(r.id, { status: e.target.value })}
                      placeholder={t('advanced.tracker.phStatus')}
                      className="min-w-[6rem]"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.url}
                      onChange={(e) => update(r.id, { url: e.target.value })}
                      placeholder="https://"
                      className="min-w-[10rem]"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={r.notes}
                      onChange={(e) => update(r.id, { notes: e.target.value })}
                      placeholder={t('advanced.tracker.phNotes')}
                      className="min-w-[8rem]"
                    />
                  </td>
                  <td className="p-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(r.id)}
                      aria-label={t('advanced.tracker.remove')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationTracker;
