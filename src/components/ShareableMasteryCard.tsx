import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Download, Share2, Check, Sparkles, Globe as Globe2 } from 'lucide-react';
import { loadMasteryRows, MasteryRow } from '../utils/masteryTracking';

interface Props {
  onClose: () => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
  spanish: 'Spanish',
  mandarin: 'Mandarin',
  cantonese: 'Cantonese',
  vietnamese: 'Vietnamese',
  tagalog: 'Tagalog',
  korean: 'Korean',
  arabic: 'Arabic',
  hmong: 'Hmong',
};

interface CardStats {
  mastered: number;
  total: number;
  languages: string[];
  sectors: string[];
  topPhrases: MasteryRow[];
}

function computeStats(rows: MasteryRow[]): CardStats {
  const mastered = rows.filter((r) => r.level >= 3);
  const langs = new Set<string>();
  const sects = new Set<string>();
  for (const r of rows) {
    if (r.language) langs.add(r.language);
    if (r.sector) sects.add(r.sector);
  }
  const top = [...rows]
    .filter((r) => r.level >= 2)
    .sort((a, b) => b.level - a.level)
    .slice(0, 4);
  return {
    mastered: mastered.length,
    total: rows.length,
    languages: Array.from(langs),
    sectors: Array.from(sects),
    topPhrases: top,
  };
}

function renderCardToCanvas(stats: CardStats): HTMLCanvasElement {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0f172a');
  bg.addColorStop(1, '#1e293b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.beginPath();
  ctx.arc(W - 80, 120, 260, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
  ctx.beginPath();
  ctx.arc(120, H - 180, 320, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('LANGACCESS', 80, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('My multilingual progress', 80, 160);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 68px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('I can already say', 80, 290);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 180px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText(String(stats.mastered || stats.total), 80, 470);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  const phraseWord = (stats.mastered || stats.total) === 1 ? 'phrase' : 'phrases';
  ctx.fillText(phraseWord, 80, 530);

  const languageLabel =
    stats.languages.length > 0
      ? stats.languages
          .map((l) => LANGUAGE_LABELS[l] || l.charAt(0).toUpperCase() + l.slice(1))
          .join(', ')
      : 'more languages';
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '36px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText(`in ${languageLabel}`, 80, 590);

  const cardY = 670;
  const cardH = 480;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  roundedRect(ctx, 80, cardY, W - 160, cardH, 32);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('TOP PHRASES I\u2019VE LEARNED', 120, cardY + 60);

  const phraseStartY = cardY + 110;
  const phrases = stats.topPhrases.length
    ? stats.topPhrases
    : ([
        { phrase_id: 'Where does it hurt?', language: null, sector: null, level: 2, first_seen_at: null, mastered_at: null, updated_at: null },
        { phrase_id: 'Please wait here.', language: null, sector: null, level: 2, first_seen_at: null, mastered_at: null, updated_at: null },
      ] as MasteryRow[]);

  phrases.slice(0, 4).forEach((p, i) => {
    const y = phraseStartY + i * 80;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(140, y + 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 32px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
    const text = p.phrase_id.length > 42 ? p.phrase_id.slice(0, 40) + '\u2026' : p.phrase_id;
    ctx.fillText(text, 170, y + 20);
    if (p.language) {
      ctx.fillStyle = '#64748b';
      ctx.font = '22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
      const lang = LANGUAGE_LABELS[p.language] || p.language;
      ctx.fillText(lang, 170, y + 52);
    }
  });

  ctx.fillStyle = '#94a3b8';
  ctx.font = '26px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('Learn yours free at', 80, H - 130);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 38px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif';
  ctx.fillText('langaccess.org', 80, H - 85);

  return canvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob failed'))), 'image/png', 0.95);
  });
}

export default function ShareableMasteryCard({ onClose }: Props) {
  const [rows, setRows] = useState<MasteryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'idle' | 'downloaded' | 'shared'>('idle');
  const previewRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const data = await loadMasteryRows();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => computeStats(rows), [rows]);

  const handleDownload = async () => {
    const canvas = renderCardToCanvas(stats);
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langaccess-progress-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus('downloaded');
    setTimeout(() => setStatus('idle'), 2500);
  };

  const handleShare = async () => {
    const shareText = `I can already say ${stats.mastered || stats.total} phrases in ${
      stats.languages.length || 1
    } language${stats.languages.length === 1 ? '' : 's'} with LangAccess.`;
    const shareUrl = 'https://langaccess.org';

    try {
      const canvas = renderCardToCanvas(stats);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'langaccess-progress.png', { type: 'image/png' });

      const nav = navigator as Navigator & {
        canShare?: (data: { files?: File[] }) => boolean;
        share?: (data: { files?: File[]; title?: string; text?: string; url?: string }) => Promise<void>;
      };

      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'My LangAccess progress', text: shareText, url: shareUrl });
        setStatus('shared');
        setTimeout(() => setStatus('idle'), 2500);
        return;
      }
      if (nav.share) {
        await nav.share({ title: 'My LangAccess progress', text: shareText, url: shareUrl });
        setStatus('shared');
        setTimeout(() => setStatus('idle'), 2500);
        return;
      }
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setStatus('shared');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      handleDownload();
    }
  };

  const languageDisplay =
    stats.languages.length > 0
      ? stats.languages
          .map((l) => LANGUAGE_LABELS[l] || l.charAt(0).toUpperCase() + l.slice(1))
          .join(', ')
      : 'your languages';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-lg">Share your progress</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div
            ref={previewRef}
            className="relative rounded-2xl overflow-hidden shadow-lg"
            style={{
              aspectRatio: '1080 / 1350',
              background:
                'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            }}
          >
            <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
              <div>
                <div className="text-emerald-400 font-bold tracking-widest text-xs">LANGACCESS</div>
                <div className="text-slate-400 text-xs mt-0.5">My multilingual progress</div>
              </div>
              <Globe2 className="w-5 h-5 text-emerald-400/70" />
            </div>

            <div className="absolute top-[18%] left-5 right-5">
              <div className="text-white text-xl font-bold leading-tight">I can already say</div>
              <div className="text-emerald-400 font-black leading-none mt-1" style={{ fontSize: 'clamp(56px, 16vw, 96px)' }}>
                {loading ? '—' : stats.mastered || stats.total || 0}
              </div>
              <div className="text-slate-200 font-bold text-base mt-1">
                {(stats.mastered || stats.total) === 1 ? 'phrase' : 'phrases'}
              </div>
              <div className="text-slate-300 text-sm mt-1 leading-snug">
                in {languageDisplay}
              </div>
            </div>

            <div className="absolute bottom-14 left-5 right-5 rounded-2xl bg-white/5 backdrop-blur p-4">
              <div className="text-emerald-400 font-bold tracking-widest text-[10px] mb-2">
                TOP PHRASES I&rsquo;VE LEARNED
              </div>
              {loading ? (
                <div className="text-slate-400 text-xs">Loading...</div>
              ) : stats.topPhrases.length === 0 ? (
                <div className="text-slate-400 text-xs">
                  Open a phrase card to start filling this in.
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {stats.topPhrases.slice(0, 3).map((p) => (
                    <li key={p.phrase_id} className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      <span className="text-white text-[13px] font-medium leading-snug truncate">
                        {p.phrase_id}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <div className="text-slate-400 text-[10px]">Learn yours free at</div>
                <div className="text-emerald-400 font-bold text-sm">langaccess.org</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {status === 'downloaded' ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {status === 'shared' ? (
                <>
                  <Check className="w-4 h-4" />
                  Shared
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Share
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-3 leading-snug">
            Your card is generated on-device. Nothing is posted without your tap.
          </p>
        </div>
      </div>
    </div>
  );
}
