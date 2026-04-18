import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Play, CheckCircle2, Volume2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../utils/sessionId';
import { playAudioFromGesture } from '../utils/speech';
import { recordMasteryEvent } from '../utils/masteryTracking';

interface Step {
  step: number;
  english: string;
  spanish: string;
  note?: string;
}

interface Scenario {
  slug: string;
  title: string;
  description: string;
  sector: string;
  phrases: Step[];
}

interface Props {
  onBack?: () => void;
}

export default function ScenarioChainsPage({ onBack }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Scenario | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('scenarios')
          .select('slug, title, description, sector, phrases')
          .order('created_at', { ascending: true });
        setScenarios((data as Scenario[]) ?? []);

        const session_id = getSessionId();
        const { data: done } = await supabase
          .from('scenario_completions')
          .select('scenario_slug')
          .eq('session_id', session_id);
        if (done) {
          setCompletedSlugs(new Set(done.map((d) => d.scenario_slug as string)));
        }
      } catch (err) {
        console.error('load scenarios error', err);
      }
      setLoading(false);
    })();
  }, []);

  const handleBack = () => {
    if (onBack) onBack();
    else if (window.history.length > 1) window.history.back();
    else window.location.href = '/';
  };

  const openScenario = (s: Scenario) => {
    setActive(s);
    setStepIdx(0);
  };

  const handleNext = async () => {
    if (!active) return;
    const currentStep = active.phrases[stepIdx];
    if (currentStep) {
      recordMasteryEvent({
        phraseId: `${active.slug}-step-${currentStep.step}`,
        level: 3,
        sector: active.sector,
      });
    }
    if (stepIdx < active.phrases.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      const session_id = getSessionId();
      try {
        await supabase.from('scenario_completions').insert({
          session_id,
          scenario_slug: active.slug,
        });
        setCompletedSlugs(new Set([...completedSlugs, active.slug]));
      } catch (err) {
        console.error('complete scenario error', err);
      }
      setActive(null);
      setStepIdx(0);
    }
  };

  const handleSpeak = (text: string) => {
    try {
      playAudioFromGesture(text, 'spanish');
    } catch (err) {
      console.error('speak error', err);
    }
  };

  if (active) {
    const step = active.phrases[stepIdx];
    const pct = Math.round(((stepIdx + 1) / active.phrases.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
            <button
              onClick={() => setActive(null)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
              aria-label="Exit scenario"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{active.title}</div>
              <div className="text-xs text-slate-500">
                Step {stepIdx + 1} of {active.phrases.length}
              </div>
            </div>
          </div>
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
              You say
            </div>
            <div className="text-xl font-semibold text-slate-900 mb-4">{step.english}</div>

            <div className="border-t border-slate-100 pt-4 mb-4">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                In Spanish
              </div>
              <div className="flex items-start gap-3">
                <div className="text-xl font-medium text-emerald-700 flex-1">{step.spanish}</div>
                <button
                  onClick={() => handleSpeak(step.spanish)}
                  className="w-11 h-11 flex-shrink-0 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all flex items-center justify-center"
                  aria-label="Play Spanish audio"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {step.note && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-900">
                <span className="font-semibold">Why it works: </span>
                {step.note}
              </div>
            )}
          </div>
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-bottom-padding">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleNext}
              className="w-full h-12 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-2"
            >
              {stepIdx < active.phrases.length - 1 ? (
                <>
                  Next step <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Finish scenario <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-lg font-semibold text-slate-900">Scenario Chains</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Real moments, start to finish
          </h1>
          <p className="text-slate-600 text-[15px] leading-[1.6]">
            Each scenario is a short, realistic conversation broken into the exact steps that
            make it land. Walk through one in under two minutes.
          </p>
        </div>

        {loading ? (
          <div className="text-slate-500">Loading scenarios...</div>
        ) : scenarios.length === 0 ? (
          <div className="text-slate-500">No scenarios yet.</div>
        ) : (
          <div className="grid gap-4">
            {scenarios.map((s) => {
              const done = completedSlugs.has(s.slug);
              return (
                <button
                  key={s.slug}
                  onClick={() => openScenario(s)}
                  className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      {done ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {s.sector}
                        </span>
                        {done && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{s.title}</h3>
                      <p className="text-sm text-slate-600 leading-[1.5]">{s.description}</p>
                      <div className="mt-3 text-xs text-slate-500">
                        {s.phrases.length} steps
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
