import { useEffect, useState } from 'react';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get('session_id');
    setSessionId(sid);
    if (sid) {
      console.log('[PaymentSuccess] Payment successful for session:', sid);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Payment confirmed</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Your order is being processed. You'll receive a confirmation email with your order details shortly.
        </p>

        <div className="bg-[#111827] rounded-2xl border border-green-500/20 p-5 mb-8 text-left">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium text-sm mb-1">Your LangAccess Ambassador Cards are in production</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                They'll be shipped to the address you provided. Expect delivery in 7–14 business days.
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
