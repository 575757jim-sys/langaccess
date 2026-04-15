import { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, GraduationCap } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [enrolledTrack, setEnrolledTrack] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    const enrolled = params.get('enrolled');
    setSessionId(sid);
    setEnrolledTrack(enrolled);
  }, []);

  const isCertificate = !!enrolledTrack;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        {isCertificate ? (
          <>
            <h1 className="text-3xl font-bold text-white mb-3">Payment Confirmed — You're Enrolled!</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              You now have full access to your LangAccess Certificate program.
            </p>

            <div className="bg-[#111827] rounded-2xl border border-green-500/20 p-5 mb-8 text-left">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm mb-1">Your certificate program is ready</p>
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

            <button
              onClick={() => { window.location.href = `/certificates?enrolled=${enrolledTrack}&stripe=success`; }}
              className="w-full py-3 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors mb-4"
            >
              Start Your Certificate
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-white mb-3">Payment confirmed</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Your order is being processed. You'll receive a confirmation email with your order details shortly.
            </p>
            {sessionId && (
              <p className="text-slate-600 text-xs mb-8 font-mono">
                Ref: {sessionId.slice(-12)}
              </p>
            )}
          </>
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
