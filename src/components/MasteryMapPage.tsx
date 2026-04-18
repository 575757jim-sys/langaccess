import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Headphones, Mic, ClipboardCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  loadMasteryRows,
  summarizeMastery,
  MASTERY_LABELS,
  MasteryLevel,
  MasteryRow,
} from '../utils/masteryTracking';

interface Props {
  onBack?: () => void;
}

const LEVEL_ICONS: Record<MasteryLevel, React.ComponentType<{ className?: string }>> = {
  1: Eye,
  2: Headphones,
  3: Mic,
  4: ClipboardCheck,
  5: CheckCircle2,
};

const LEVEL_COLORS: Record<MasteryLevel, { bg: string; text: string; ring: string; bar: string }> = {
  1: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', bar: 'bg-slate-400' },
  2: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200', bar: 'bg-sky-500' },
  3: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', bar: 'bg-amber-500' },
  4: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', bar: 'bg-emerald-500' },
  5: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200', bar: 'bg-teal-600' },
};

export default function MasteryMapPage({ onBack }: Props) {
  const [rows, setRows] = useState<MasteryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadMasteryRows();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  const { buckets, total, mastered } = summarizeMastery(rows);
  const pctMastered = total > 0 ? Math.round((mastered / total) * 100) : 0;

  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-slate-900">Your Mastery Map</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-baseline justify-between mb-2">
            <h1 className="text-2xl font-bold text-slate-900">Where your phrases stand</h1>
            <span className="text-sm text-slate-500">{total} tracked</span>
          </div>
          <p className="text-slate-600 text-[15px] leading-[1.6] mb-6">
            Every phrase you interact with climbs a five-step ladder. When a phrase reaches
            <span className="font-semibold text-emerald-700"> Quiz </span>
            or
            <span className="font-semibold text-teal-700"> Used</span>,
            it&apos;s yours.
          </p>

          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeDasharray={`${pctMastered}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{pctMastered}%</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-slate-500 uppercase tracking-wide mb-1">Mastered</div>
              <div className="text-3xl font-bold text-slate-900">
                {mastered}
                <span className="text-lg text-slate-400 font-semibold"> / {total || 0}</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                phrases at Quiz or Used level
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">The ladder</h2>
          <div className="space-y-3">
            {([1, 2, 3, 4, 5] as MasteryLevel[]).map((level) => {
              const Icon = LEVEL_ICONS[level];
              const colors = LEVEL_COLORS[level];
              const count = buckets[level];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={level} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${colors.bg} ${colors.ring}`}
                  >
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {level}. {MASTERY_LABELS[level]}
                      </span>
                      <span className="text-sm text-slate-500 tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors.bar} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recently moved</h2>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading your map...</div>
          ) : rows.length === 0 ? (
            <div className="text-slate-500 text-sm">
              No phrases tracked yet. Open a phrase card to start filling in your map.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.slice(0, 12).map((r) => {
                const lvl = Math.min(5, Math.max(1, r.level)) as MasteryLevel;
                const colors = LEVEL_COLORS[lvl];
                return (
                  <li key={r.phrase_id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">
                        {r.phrase_id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.sector || 'general'} {r.language ? `- ${r.language}` : ''}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {MASTERY_LABELS[lvl]}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
