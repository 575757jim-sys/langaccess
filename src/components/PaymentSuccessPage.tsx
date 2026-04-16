import { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, GraduationCap, Loader2 } from 'lucide-react';
import { CERT_TRACKS, TrackId } from '../data/certificateData';
import { supabase } from '../lib/supabase';
import { loadLocalProgress, saveLocalProgress } from '../utils/certPersistence';

function markTrackPurchasedLocally(trackId: TrackId) {
  const progress = loadLocalProgress();
  const updated = {
    ...progress,
    purchased: { ...progress.purchased, [trackId]: true },
  };
  saveLocalProgress(updated);
  console.log("Success page: wrote purchase to localStorage for track:", trackId);
}

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [track, setTrack] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    const t = params.get('track');
    console.log("Success page: detected track:", t, "session_id:", sid);

    const isValidTrack = t ? !!CERT_TRACKS.find(ct => ct.id === t) : false;

    if (isValidTrack) {
      markTrackPurchasedLocally(t as TrackId);
      setSessionId(sid);
      setTrack(t);
    } else if (sid) {
      setSessionId(sid);
      setResolving(true);
      supabase
        .from('certificate_purchases')
        .select('track_id')
        .eq('stripe_session_id', sid)
        .maybeSingle()
        .then(({ data }) => {
          const resolved = data?.track_id ?? null;
          console.log("Success page: resolved track from DB:", resolved, "(URL had:", t, ")");
          if (resolved && CERT_TRACKS.find(ct => ct.id === resolved)) {
            markTrackPurchasedLocally(resolved as TrackId);
          }
          setTrack(resolved);
          setResolving(false);
        })
        .catch(() => {
          setTrack(t);
          setResolving(false);
        });
    } else {
      setSessionId(sid);
      setTrack(t);
    }
  }, []);

  const trackData = track ? CERT_TRACKS.find(ct => ct.id === (track as TrackId)) : null;
  const trackLabel = trackData?.title ?? null;

  const handleGoToCertificates = () => {
    let dest = '/certificates';
    if (track && CERT_TRACKS.find(ct => ct.id === (track as TrackId))) {
      dest = `/certificates?track=${track}&enrolled=1`;
      if (sessionId) dest += `&session_id=${sessionId}`;
    } else if (sessionId) {
      dest = `/certificates?session_id=${sessionId}&enrolled=1`;
    }
    console.log("Success page: routing to", dest);
    window.location.href = dest;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment Confirmed — You're Enrolled!</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          You now have full access to your LangAccess Certificate program.
        </p>

        <div className="bg-[#111827] rounded-2xl border border-green-500/20 p-5 mb-6 text-left">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm mb-1">
                {resolving
                  ? 'Confirming your enrollment…'
                  : trackLabel
                  ? `Your ${trackLabel} certificate program is ready.`
                  : 'Your certificate program is ready.'}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Head to the Certificates page to begin your coursework and track your progress.
              </p>
              {sessionId && (
                <p className="text-slate-600 text-xs mt-2 font-mono">
                  Ref: {sessionId.slice(-12)}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-xs mb-6">
          If you do not see your access immediately, refresh the certificate page.
        </p>

        {trackLabel && (
          <p className="text-green-400/80 text-xs font-medium mb-4">
            Purchased track: {trackLabel}
          </p>
        )}

        <button
          onClick={handleGoToCertificates}
          disabled={resolving}
          className="w-full py-3 px-6 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mb-2 flex items-center justify-center gap-2"
        >
          {resolving && <Loader2 className="w-4 h-4 animate-spin" />}
          Go to Certificates Page
        </button>

        <p className="text-slate-500 text-xs mb-4">
          On the Certificates page, select your purchased track to continue.
        </p>

        <button
          onClick={() => { window.location.href = '/'; }}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
