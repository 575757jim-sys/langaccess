import { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, GraduationCap, Loader2 } from 'lucide-react';
import { CERT_TRACKS, TrackId } from '../data/certificateData';
import { supabase } from '../lib/supabase';
import { loadLocalProgress, saveLocalProgress } from '../utils/certPersistence';
import { getSessionId, SESSION_STORAGE_KEY } from '../utils/sessionId';

function markTrackPurchasedLocally(trackId: TrackId) {
  const progress = loadLocalProgress();
  const updated = {
    ...progress,
    purchased: { ...progress.purchased, [trackId]: true },
  };
  saveLocalProgress(updated);
}

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verifiedTrack, setVerifiedTrack] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [selectedNavTrack, setSelectedNavTrack] = useState<TrackId | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appSession = params.get('app_session');
    if (appSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, appSession);
    }
    console.log('Using session_id:', getSessionId());
    const sid = params.get('session_id');
    const t = params.get('track');
    setSessionId(sid);

    const dest = t
      ? `/certificates?track=${t}&enrolled=1${sid ? `&session_id=${sid}` : ''}`
      : `/certificates${sid ? `?session_id=${sid}&enrolled=1` : ''}`;
    window.location.replace(dest);
  }, []);

  const trackData = verifiedTrack
    ? CERT_TRACKS.find(ct => ct.id === (verifiedTrack as TrackId))
    : null;
  const trackLabel = trackData?.title ?? null;

  const handleGoToCertificates = () => {
    if (verifiedTrack) {
      let dest = `/certificates?track=${verifiedTrack}&enrolled=1`;
      if (sessionId) dest += `&session_id=${sessionId}`;
      window.location.href = dest;
    } else if (selectedNavTrack) {
      let dest = `/certificates?track=${selectedNavTrack}&enrolled=1`;
      if (sessionId) dest += `&session_id=${sessionId}`;
      window.location.href = dest;
    } else if (sessionId) {
      window.location.href = `/certificates?session_id=${sessionId}&enrolled=1`;
    } else {
      window.location.href = '/certificates';
    }
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

        {resolving && (
          <div className="bg-[#111827] rounded-2xl border border-white/10 p-5 mb-6 flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-slate-400 text-sm">Confirming your enrollment…</span>
          </div>
        )}

        {!resolving && unverified && (
          <div className="bg-[#111827] rounded-2xl border border-amber-500/30 p-5 mb-6 text-left">
            <p className="text-amber-300 font-semibold text-sm mb-1">Enrollment pending confirmation</p>
            <p className="text-slate-400 text-xs mb-4">
              Your payment was received. Go to the Certificates page — your purchased track will unlock automatically once our system confirms the payment. This usually takes a few seconds.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CERT_TRACKS.map(t => {
                const dest = sessionId
                  ? `/certificates?track=${t.id}&enrolled=1&session_id=${sessionId}`
                  : `/certificates?track=${t.id}&enrolled=1`;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      console.log('[PaymentSuccess] navigating to:', dest);
                      setSelectedNavTrack(t.id);
                      window.location.href = dest;
                    }}
                    className={`px-3 py-2.5 rounded-xl bg-gradient-to-br ${t.color} text-white text-xs font-semibold text-left transition-opacity ${selectedNavTrack === t.id ? 'ring-2 ring-white/50' : 'hover:opacity-90'}`}
                  >
                    {t.title}
                  </button>
                );
              })}
            </div>
            <p className="text-slate-600 text-xs mt-3">Selecting a track above only navigates you to that section — it does not unlock it.</p>
          </div>
        )}

        {!resolving && verifiedTrack && (
          <div className="bg-[#111827] rounded-2xl border border-green-500/20 p-5 mb-6 text-left">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm mb-1">
                  {trackLabel
                    ? `Your ${trackLabel} certificate track is now unlocked.`
                    : 'Your certificate program is ready.'}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  All 5 modules are available. Head to the Certificates page to begin.
                </p>
                {sessionId && (
                  <p className="text-slate-600 text-xs mt-2 font-mono">
                    Ref: {sessionId.slice(-12)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {!resolving && (
          <button
            onClick={handleGoToCertificates}
            className="w-full py-3 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors mb-6 flex items-center justify-center gap-2"
          >
            Go to Certificates Page
          </button>
        )}

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
