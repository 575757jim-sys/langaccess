import { jsPDF } from 'jspdf';
import { CertTrack, KeyPhrase } from '../data/certificateData';

interface PhraseRow extends KeyPhrase {
  moduleTitle: string;
}

function collectPhrases(track: CertTrack): PhraseRow[] {
  const out: PhraseRow[] = [];
  for (const mod of track.modules) {
    if (!mod.keyPhrases || mod.keyPhrases.length === 0) continue;
    for (const p of mod.keyPhrases) {
      out.push({ ...p, moduleTitle: mod.title });
    }
  }
  return out;
}

export function generatePocketPhrasePDF(track: CertTrack, userName?: string): void {
  const phrases = collectPhrases(track);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const MARGIN_X = 40;
  const MARGIN_TOP = 56;
  const MARGIN_BOTTOM = 48;

  const drawHeader = () => {
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, 44, 'F');
    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LANGACCESS', MARGIN_X, 22);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`${track.title} — Pocket Phrase Reference`, MARGIN_X, 36);
  };

  const drawFooter = (pageNum: number, totalPages: number) => {
    doc.setDrawColor(230, 232, 238);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, H - 32, W - MARGIN_X, H - 32);
    doc.setTextColor(130, 140, 155);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('langaccess.org  ·  Professional Spanish Communication Certificate Program', MARGIN_X, H - 18);
    doc.text(`Page ${pageNum} / ${totalPages}`, W - MARGIN_X, H - 18, { align: 'right' });
  };

  const drawCover = () => {
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, W, H, 'F');

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(2);
    doc.rect(28, 28, W - 56, H - 56, 'S');

    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('LANGACCESS  ·  POCKET REFERENCE', W / 2, 120, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(track.title, W / 2, 180, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('Spanish Phrase Reference', W / 2, 212, { align: 'center' });

    if (userName) {
      doc.setTextColor(160, 170, 185);
      doc.setFontSize(11);
      doc.text(`Prepared for ${userName}`, W / 2, 250, { align: 'center' });
    }

    doc.setTextColor(200, 210, 225);
    doc.setFontSize(11);
    const intro = [
      'Keep this pocket reference with you on the job.',
      'Every phrase is drawn from the certificate curriculum and',
      'organized by module so you can find what you need fast.',
      '',
      'Tip: print double-sided and fold for a pocket-sized booklet.',
    ];
    let y = 310;
    for (const line of intro) {
      doc.text(line, W / 2, y, { align: 'center' });
      y += 18;
    }

    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(1);
    doc.line(W / 2 - 40, H - 140, W / 2 + 40, H - 140);

    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('INCLUDES FUTURE UPDATES FREE', W / 2, H - 118, { align: 'center' });

    doc.setTextColor(160, 170, 185);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Your $39 enrollment includes every new phrase, module, and refresher', W / 2, H - 100, { align: 'center' });
    doc.text('we add to this track. No additional cost, ever.', W / 2, H - 86, { align: 'center' });
  };

  drawCover();

  doc.addPage();
  let pageNum = 2;
  drawHeader();

  let y = MARGIN_TOP + 20;
  let currentModule = '';

  const ensureSpace = (needed: number) => {
    if (y + needed > H - MARGIN_BOTTOM) {
      doc.addPage();
      pageNum += 1;
      drawHeader();
      y = MARGIN_TOP + 20;
      currentModule = '';
    }
  };

  for (const phrase of phrases) {
    if (phrase.moduleTitle !== currentModule) {
      ensureSpace(48);
      doc.setFillColor(34, 197, 94);
      doc.rect(MARGIN_X, y - 10, 3, 14, 'F');
      doc.setTextColor(10, 15, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(phrase.moduleTitle, MARGIN_X + 10, y);
      y += 18;
      currentModule = phrase.moduleTitle;
    }

    const englishLines = doc.splitTextToSize(phrase.english, W - MARGIN_X * 2 - 12);
    const spanishLines = doc.splitTextToSize(phrase.spanish, W - MARGIN_X * 2 - 12);
    const contextLines = phrase.context
      ? doc.splitTextToSize(phrase.context, W - MARGIN_X * 2 - 12)
      : [];

    const blockHeight =
      englishLines.length * 12 +
      spanishLines.length * 13 +
      contextLines.length * 11 +
      14;

    ensureSpace(blockHeight);

    doc.setDrawColor(230, 232, 238);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, y - 4, W - MARGIN_X, y - 4);

    doc.setTextColor(60, 70, 90);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const line of englishLines) {
      doc.text(line, MARGIN_X, y + 6);
      y += 12;
    }

    doc.setTextColor(10, 15, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    for (const line of spanishLines) {
      doc.text(line, MARGIN_X, y + 8);
      y += 13;
    }

    if (contextLines.length) {
      doc.setTextColor(130, 140, 155);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      for (const line of contextLines) {
        doc.text(line, MARGIN_X, y + 6);
        y += 11;
      }
    }

    y += 6;
  }

  const totalPages = pageNum;
  for (let p = 2; p <= totalPages; p++) {
    doc.setPage(p);
    drawFooter(p - 1, totalPages - 1);
  }

  const safeTitle = track.title.replace(/\s+/g, '-');
  doc.save(`LangAccess-PocketPhrases-${safeTitle}.pdf`);
}
