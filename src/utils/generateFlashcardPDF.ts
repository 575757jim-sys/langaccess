import { jsPDF } from 'jspdf';
import { CertTrack, KeyPhrase } from '../data/certificateData';
import { supabase } from '../lib/supabase';

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

function wrapCentered(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  if (lines.length <= maxLines) return lines;
  const truncated = lines.slice(0, maxLines);
  const last = truncated[maxLines - 1];
  truncated[maxLines - 1] = last.replace(/\s*\S*$/, '') + '…';
  return truncated;
}

function drawCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  phrase: PhraseRow,
  trackTitle: string
) {
  const half = h / 2;

  doc.setDrawColor(180, 190, 205);
  doc.setLineWidth(0.5);
  doc.rect(x, y, w, h, 'S');

  doc.setLineDashPattern([3, 3], 0);
  doc.setDrawColor(120, 130, 145);
  doc.line(x + 4, y + half, x + w - 4, y + half);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(6);
  doc.setTextColor(140, 150, 165);
  doc.setFont('helvetica', 'normal');
  doc.text('fold here', x + w / 2, y + half - 2, { align: 'center' });

  const padX = 10;
  const innerW = w - padX * 2;

  const topCenterY = y + half / 2;
  const topTextMaxWidth = innerW;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const engLines = wrapCentered(doc, phrase.english, topTextMaxWidth, 4);

  const engLineH = 13;
  const engBlockH = engLines.length * engLineH;
  const engStartY = topCenterY + engBlockH / 2 - engLineH / 2;

  doc.setTextColor(10, 15, 30);
  for (let i = 0; i < engLines.length; i++) {
    const line = engLines[i];
    const drawY = engStartY - i * engLineH;
    doc.text(line, x + w / 2, drawY, { align: 'center', angle: 180 });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(34, 140, 80);
  doc.text('EN', x + w / 2, y + 10, { align: 'center', angle: 180 });

  const labelTop = trackTitle.toUpperCase();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(150, 160, 175);
  doc.text(labelTop, x + w / 2, y + 18, { align: 'center', angle: 180 });

  const bottomCenterY = y + half + half / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const spaLines = wrapCentered(doc, phrase.spanish, innerW, 4);
  const spaLineH = 14;
  const spaBlockH = spaLines.length * spaLineH;
  const spaStartY = bottomCenterY - spaBlockH / 2 + spaLineH * 0.75;

  doc.setTextColor(10, 15, 30);
  for (let i = 0; i < spaLines.length; i++) {
    doc.text(spaLines[i], x + w / 2, spaStartY + i * spaLineH, { align: 'center' });
  }

  if (phrase.context) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(130, 140, 155);
    const ctxLines = wrapCentered(doc, phrase.context, innerW, 2);
    const ctxStartY = y + h - 10 - (ctxLines.length - 1) * 8;
    for (let i = 0; i < ctxLines.length; i++) {
      doc.text(ctxLines[i], x + w / 2, ctxStartY + i * 8, { align: 'center' });
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(34, 140, 80);
  doc.text('ES', x + w / 2, y + half + 12, { align: 'center' });
}

function drawCover(doc: jsPDF, track: CertTrack, userName: string | undefined, totalCards: number, sheets: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(2);
  doc.rect(28, 28, W - 56, H - 56, 'S');

  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('LANGACCESS  ·  PRINTABLE FLASHCARDS', W / 2, 110, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.text(track.title, W / 2, 165, { align: 'center' });
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Fold-and-Cut Spanish Flashcards', W / 2, 194, { align: 'center' });

  if (userName) {
    doc.setTextColor(160, 170, 185);
    doc.setFontSize(11);
    doc.text(`Prepared for ${userName}`, W / 2, 224, { align: 'center' });
  }

  doc.setTextColor(200, 210, 225);
  doc.setFontSize(11);
  const intro = [
    'HOW TO USE:',
    '',
    '1. Print this PDF on standard letter-size paper (single-sided).',
    '2. Cut along the solid lines to separate each card.',
    '3. Fold each card along the dashed center line.',
    '4. The fold puts English on one side and Spanish on the other.',
    '',
    'Tip: Print on cardstock for longer-lasting cards.',
    'Keep a stack in your pocket or on the dashboard for quick review.',
  ];
  let y = 280;
  for (const line of intro) {
    doc.text(line, W / 2, y, { align: 'center' });
    y += 18;
  }

  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(1);
  doc.line(W / 2 - 40, H - 170, W / 2 + 40, H - 170);

  doc.setTextColor(34, 197, 94);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`${totalCards} CARDS  ·  ${sheets} SHEET${sheets === 1 ? '' : 'S'}`, W / 2, H - 148, { align: 'center' });

  doc.setTextColor(160, 170, 185);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Every phrase is drawn directly from your certificate curriculum.', W / 2, H - 124, { align: 'center' });
  doc.text('Future updates to this track are included free, forever.', W / 2, H - 108, { align: 'center' });
}

function drawSheetHeader(doc: jsPDF, track: CertTrack, sheetNum: number, totalSheets: number) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(10, 15, 30);
  doc.text('LANGACCESS FLASHCARDS', 36, 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(110, 120, 135);
  doc.text(`${track.title}  ·  Sheet ${sheetNum} / ${totalSheets}`, W - 36, 24, { align: 'right' });
}

function drawSheetFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 165);
  doc.text('Cut along solid lines. Fold along dashed lines. English on one side, Spanish on the other.', W / 2, H - 18, { align: 'center' });
}

async function logDownload(track: CertTrack, cardCount: number) {
  try {
    await supabase.from('interaction_logs').insert({
      language: 'spanish',
      sector: track.id,
      event_type: 'flashcard_pdf_download',
      event_data: { track_id: track.id, track_title: track.title, card_count: cardCount },
    });
  } catch {
    /* non-blocking */
  }
}

export function generateFlashcardPDF(track: CertTrack, userName?: string): void {
  const phrases = collectPhrases(track);
  if (phrases.length === 0) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  const MARGIN_X = 36;
  const MARGIN_TOP = 40;
  const MARGIN_BOTTOM = 28;
  const COLS = 3;
  const ROWS = 3;
  const PER_SHEET = COLS * ROWS;

  const cardW = (W - MARGIN_X * 2) / COLS;
  const cardH = (H - MARGIN_TOP - MARGIN_BOTTOM) / ROWS;

  const totalSheets = Math.ceil(phrases.length / PER_SHEET);

  drawCover(doc, track, userName, phrases.length, totalSheets);

  for (let sheet = 0; sheet < totalSheets; sheet++) {
    doc.addPage();
    drawSheetHeader(doc, track, sheet + 1, totalSheets);
    drawSheetFooter(doc);

    for (let i = 0; i < PER_SHEET; i++) {
      const phraseIdx = sheet * PER_SHEET + i;
      if (phraseIdx >= phrases.length) break;
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const x = MARGIN_X + col * cardW;
      const y = MARGIN_TOP + row * cardH;
      drawCard(doc, x, y, cardW, cardH, phrases[phraseIdx], track.title);
    }
  }

  const safeTitle = track.title.replace(/\s+/g, '-');
  doc.save(`LangAccess-Flashcards-${safeTitle}.pdf`);

  void logDownload(track, phrases.length);
}
