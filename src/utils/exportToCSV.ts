import { Phrase } from '../data/phrases';
import { Language, Sector } from '../data/phrases';
import { PhraseGroup } from '../data/subcategories';

interface ExportRow {
  sector: string;
  subcategory: string;
  english: string;
  translation: string;
  isVital: string;
  lastReviewed: string;
  reviewedBy: string;
  version: string;
}

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportPhrasesToCSV = (
  phraseGroups: PhraseGroup[],
  language: Language,
  sector: Sector,
  subcategory: string
): void => {
  const headers = ['Sector', 'Subcategory', 'English', language.charAt(0).toUpperCase() + language.slice(1), 'Vital', 'Last Reviewed', 'Reviewed By', 'Version'];

  const rows: ExportRow[] = [];

  phraseGroups.forEach((group) => {
    group.phrases.forEach((phrase: Phrase) => {
      rows.push({
        sector,
        subcategory: group.groupLabel,
        english: phrase.english,
        translation: phrase.translation,
        isVital: phrase.isVital ? 'Yes' : 'No',
        lastReviewed: phrase.lastReviewed || '2026-02-24',
        reviewedBy: phrase.reviewedBy || 'LangAccess Editorial Review',
        version: phrase.version || '1.0',
      });
    });
  });

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => [
      escapeCSV(row.sector),
      escapeCSV(row.subcategory),
      escapeCSV(row.english),
      escapeCSV(row.translation),
      escapeCSV(row.isVital),
      escapeCSV(row.lastReviewed),
      escapeCSV(row.reviewedBy),
      escapeCSV(row.version),
    ].join(','))
  ];

  const csvContent = csvLines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `langaccess-${sector}-${subcategory}-${language}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
