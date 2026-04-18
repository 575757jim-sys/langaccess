import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../utils/sessionId';

interface Props {
  onBack?: () => void;
  trackId?: string;
}

const TRACK_PROMPTS: Record<string, { title: string; phrases: { id: string; english: string }[] }> = {
  education: {
    title: 'Education Spanish',
    phrases: [
      { id: 'ed-1', english: 'Hi, I\'m glad you made it.' },
      { id: 'ed-2', english: 'Your child is safe and had a good day.' },
      { id: 'ed-3', english: 'Please call if you\'ll be late.' },
      { id: 'ed-4', english: 'Let\'s schedule a conference.' },
      { id: 'ed-5', english: 'Thank you for letting me know.' },
      { id: 'ed-6', english: 'I need your signature here.' },
      { id: 'ed-7', english: 'Your child is doing very well.' },
      { id: 'ed-8', english: 'Do you have any questions?' },
      { id: 'ed-9', english: 'We have a translator available.' },
      { id: 'ed-10', english: 'Have a good evening.' },
    ],
  },
  healthcare: {
    title: 'Healthcare Spanish',
    phrases: [
      { id: 'hc-1', english: 'I\'m here to help you.' },
      { id: 'hc-2', english: 'Can you tell me your full name?' },
      { id: 'hc-3', english: 'Where does it hurt?' },
      { id: 'hc-4', english: 'On a scale of 1 to 10...' },
      { id: 'hc-5', english: 'Are you allergic to any medication?' },
      { id: 'hc-6', english: 'Please take a deep breath.' },
      { id: 'hc-7', english: 'We\'re almost done.' },
      { id: 'hc-8', english: 'You\'re doing great.' },
      { id: 'hc-9', english: 'The doctor will see you shortly.' },
      { id: 'hc-10', english: 'Do you have any questions?' },
    ],
  },
  construction: {
    title: 'Construction Spanish',
    phrases: [
      { id: 'co-1', english: 'Good morning. Safety first.' },
      { id: 'co-2', english: 'Watch the open trench.' },
      { id: 'co-3', english: 'Always wear your hard hat.' },
      { id: 'co-4', english: 'Stop. Wait for my signal.' },
      { id: 'co-5', english: 'Any questions?' },
      { id: 'co-6', english: 'We start at 7 am sharp.' },
      { id: 'co-7', english: 'Lunch is from 12 to 12:30.' },
      { id: 'co-8', english: 'Clean up before you leave.' },
      { id: 'co-9', english: 'Report any injury immediately.' },
      { id: 'co-10', english: 'Good work today.' },
    ],
  },
};

export default function SelfAssessmentPage({ onBack, trackId }: Props) {
  const resolvedTrack = trackId || getTrackFromQuery() || 'education';
  const config = TRACK_PROMPTS[resolvedTrack] || TRACK_PROMPTS.education;

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'before' | 'after'>('before');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [beforeRatings, setBeforeRatings] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    (async () => {
      const session_id = getSessionId();
      try {
        const { data } = await supabase
          .from('self_assessments')
          .select('phase, ratings, created_at')
          .eq('session_id', session_id)
          .eq('track_id', resolvedTrack)
          .order('created_at', { ascending: true });

        const before = data?.find((d) => d.phase === 'before');
        const after = data?.find((d) => d.phase === 'after');

        if (before) {
          setBeforeRatings((before.ratings as Record<string, number>) || {});
          if (!after) {
            setPhase('after');
          } else {
            setPhase('after');
            setRatings((after.ratings as Record<string, number>) || {});
            setSubmitted(true);
          }
        }
      } catch (err) {
        console.error('load self assessment error', err);
      }
      setLoading(false);
    })();
  }, [resolvedTrack]);

  const allAnswered = config.phrases.every((p) => ratings[p.id] !== undefined);

  const avg = (obj: Record<string, number>) => {
    const vals = Object.values(obj);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const delta = useMemo(() => {
    if (!beforeRatings) return 0;
    return avg(ratings) - avg(beforeRatings);
  }, [ratings, beforeRatings]);

  const handleSubmit = async () => {
    setSaving(true);
    const session_id = getSessionId();
    try {
      await supabase.from('self_assessments').insert({
        session_id,
        track_id: resolvedTrack,
        phase,
        ratings,
      });
      setSubmitted(true);
      if (phase === 'before') {
        setBeforeRatings(ratings);
      }
    } catch (err) {
      console.error('save assessment error', err);
    }
    setSaving(false);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-slate-900">Confidence Check</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
            {phase === 'before' ? 'Before you start' : 'Two weeks in'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {config.title}: how confident are you?
          </h1>
          <p className="text-slate-600 text-[15px] leading-[1.6]">
            Rate how comfortable you feel saying each of these out loud today, 1 (not at all) to
            5 (I could say this naturally). You&apos;ll answer the same list again later so you can
            see your growth.
          </p>
        </div>

        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : submitted && phase === 'after' && beforeRatings ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Your confidence shift</div>
                <div className="text-3xl font-bold text-emerald-700">
                  {delta > 0 ? '+' : ''}
                  {delta.toFixed(2)} points
                </div>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              Across {config.phrases.length} phrases, your average self-rating went from{' '}
              <span className="font-semibold text-slate-800">{avg(beforeRatings).toFixed(2)}</span>{' '}
              to{' '}
              <span className="font-semibold text-slate-800">{avg(ratings).toFixed(2)}</span>.
            </p>
            <ul className="divide-y divide-slate-100">
              {config.phrases.map((p) => {
                const b = beforeRatings[p.id] ?? 0;
                const a = ratings[p.id] ?? 0;
                const d = a - b;
                return (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-800 flex-1 min-w-0 truncate">
                      {p.english}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {b} <span className="mx-1">to</span> {a}
                    </span>
                    <span
                      className={`text-xs font-semibold tabular-nums w-10 text-right ${
                        d > 0 ? 'text-emerald-700' : d < 0 ? 'text-rose-700' : 'text-slate-400'
                      }`}
                    >
                      {d > 0 ? '+' : ''}
                      {d}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
            <ul className="divide-y divide-slate-100">
              {config.phrases.map((p) => (
                <li key={p.id} className="py-4">
                  <div className="text-sm font-medium text-slate-800 mb-3">{p.english}</div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((v) => {
                      const selected = ratings[p.id] === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setRatings({ ...ratings, [p.id]: v })}
                          className={`flex-1 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
                            selected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                          aria-pressed={selected}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                {Object.keys(ratings).length} of {config.phrases.length} rated
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || saving}
                className="px-5 h-11 rounded-xl bg-blue-600 text-white font-semibold disabled:bg-slate-200 disabled:text-slate-500 hover:bg-blue-700 transition-colors active:scale-95 inline-flex items-center gap-2"
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Saved
                  </>
                ) : saving ? (
                  'Saving...'
                ) : phase === 'before' ? (
                  'Save my starting point'
                ) : (
                  'See my growth'
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function getTrackFromQuery(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('track');
  } catch {
    return null;
  }
}
