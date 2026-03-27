import { useState } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2 } from 'lucide-react';
import SEO from './SEO';

const QUANTITY_OPTIONS = [
  { value: 25, label: '25 cards' },
  { value: 50, label: '50 cards' },
  { value: 100, label: '100 cards' },
];

type Step = 'form' | 'submitting' | 'success' | 'error';

export default function PublicOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref') || '';

  const [step, setStep] = useState<Step>('form');
  const [quantity, setQuantity] = useState(25);
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !address.trim()) return;

    setStep('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/send-order-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          address: address.trim(),
          quantity,
          ref_code: refCode,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(body.error || 'Failed to send order');
      }

      setStep('success');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <SEO title="Order Confirmed | LangAccess" description="Your card order request has been received." path="/order-cards" />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Your order is on its way.</h1>
          <p className="text-slate-300 text-base leading-relaxed">
            We'll notify you when cards ship.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <SEO title="Order My Cards | LangAccess" description="Order your personalized LangAccess ambassador cards." path="/order-cards" />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <a
            href="/ambassador"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </a>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-10 pb-16">
        <h1 className="text-3xl font-bold text-white leading-tight mb-2">Order Your Cards</h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          Fill out the form below and we'll get your cards printed and shipped.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Mailing Address
            </label>
            <textarea
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              placeholder={"123 Main St\nCity, State ZIP"}
              className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Quantity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {QUANTITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuantity(opt.value)}
                  className={`rounded-xl p-4 text-center border transition-all ${
                    quantity === opt.value
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-white/20'
                  }`}
                >
                  <p className={`text-lg font-bold ${quantity === opt.value ? 'text-green-400' : 'text-white'}`}>
                    {opt.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {step === 'error' && errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={step === 'submitting'}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
          >
            {step === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending your order...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Submit Order
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
