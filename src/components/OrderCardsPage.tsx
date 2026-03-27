import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2, CreditCard } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
  onGateBack?: () => void;
}

interface AmbassadorData {
  id: string;
  full_name: string;
  email: string;
  street_address: string | null;
  city_state: string;
  zip_code: string | null;
  slug: string | null;
}

type Step = 'loading' | 'unauthorized' | 'ready' | 'submitting' | 'success' | 'error';

const QUANTITY_OPTIONS = [
  { value: 25, label: '25 cards', cost: '$8–10' },
  { value: 50, label: '50 cards', cost: '$10–13' },
  { value: 100, label: '100 cards', cost: '$13–15' },
];

function CardFrontPreview({ slug, fullName, cityState }: { slug: string; fullName: string; cityState: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://langaccess.org/r/${encodeURIComponent(slug)}&bgcolor=ffffff&color=000000&margin=2`;

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: '#0b0d0c', border: '1px solid rgba(255,255,255,0.08)', maxWidth: 520 }}
    >
      <div className="flex" style={{ minHeight: 160 }}>
        <div className="w-1.5 flex-shrink-0" style={{ background: '#2dff72' }} />
        <div className="flex-1 p-5 flex gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-lg leading-tight mb-1">One Card. One Lifeline.</p>
            <p className="text-slate-400 text-sm mb-4">Scan to find help near you</p>
            <div className="flex gap-2 text-xl">
              <span title="Food">&#127822;</span>
              <span title="Shelter">&#128716;</span>
              <span title="Medical">&#127973;</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="rounded-lg overflow-hidden" style={{ background: 'white', padding: 4, width: 88, height: 88 }}>
              <img
                src={qrUrl}
                alt="QR code"
                width={80}
                height={80}
                className="block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-xs font-semibold" style={{ color: '#2dff72' }}>langaccess.org</p>
            <p className="text-slate-500 text-[10px] text-center leading-tight">Español disponible<br/>al escanear</p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-3 flex justify-end">
        <p className="text-xs font-medium" style={{ color: '#2dff72' }}>
          {fullName} &nbsp;•&nbsp; {cityState}
        </p>
      </div>
    </div>
  );
}

export default function OrderCardsPage({ onBack, onGateBack }: Props) {
  const [step, setStep] = useState<Step>('loading');
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [quantity, setQuantity] = useState(25);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadAmbassador() {
      const urlParam = new URLSearchParams(window.location.search).get('aid');
      if (urlParam) {
        localStorage.setItem('ambassador_id', urlParam);
      }
      const ambassadorId = urlParam || localStorage.getItem('ambassador_id');

      if (!ambassadorId) {
        setStep('unauthorized');
        return;
      }

      const query = supabase.from('ambassadors').select('id, full_name, email, street_address, city_state, zip_code, slug').eq('id', ambassadorId);

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        setStep('unauthorized');
        return;
      }

      setAmbassador(data as AmbassadorData);
      setStep('ready');
    }

    loadAmbassador();
  }, []);

  const handleOrder = async () => {
    if (!ambassador) return;
    setStep('submitting');
    setErrorMsg('');

    try {
      const cityState = ambassador.city_state;

      const pdfRes = await fetch('/.netlify/functions/generate-card-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_slug: ambassador.slug || ambassador.id,
          full_name: ambassador.full_name,
          city_state: cityState,
        }),
      });

      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate card images');
      }

      const { frontFileUrl, backFileUrl } = await pdfRes.json();

      const cityParts = cityState.split(',');
      const city = cityParts[0]?.trim() || '';
      const state = cityParts[1]?.trim() || '';

      const gelatoRes = await fetch('/.netlify/functions/create-gelato-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassador_id: ambassador.id,
          full_name: ambassador.full_name,
          email: ambassador.email,
          phone: '',
          shipping_address: ambassador.street_address || '',
          city,
          state,
          zip: ambassador.zip_code || '',
          quantity,
          frontFileUrl,
          backFileUrl,
        }),
      });

      if (!gelatoRes.ok) {
        const err = await gelatoRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to place order');
      }

      setStep('success');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Something went wrong. Please try again.');
      setStep('error');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (step === 'unauthorized') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Ambassadors Only</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            This page is only accessible to verified LangAccess Ambassadors. Sign up on the Ambassador page to get your QR code and order cards.
          </p>
          <button
            onClick={onGateBack ?? onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <SEO title="Order Confirmed | LangAccess" description="Your LangAccess card order has been placed." path="/order-cards" />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Your cards are on their way.</h1>
          <p className="text-slate-300 text-base leading-relaxed mb-2">
            Allow 5–7 business days for delivery.
          </p>
          <p className="text-green-400 text-sm font-medium">
            Every card you hand out is tracked.
          </p>
          <button
            onClick={onBack}
            className="mt-10 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <SEO title="Order My Cards | LangAccess" description="Order your personalized LangAccess ambassador cards." path="/order-cards" />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 pb-2">
        <h1 className="text-3xl font-bold text-white leading-tight mb-3">Order Your Ambassador Cards</h1>
        <p className="text-slate-400 text-base leading-relaxed mb-1">
          Printed with your unique QR code.
        </p>
        <p className="text-slate-400 text-base leading-relaxed mb-1">
          You pay printing and shipping only.
        </p>
        <p className="text-slate-400 text-base leading-relaxed mb-1">
          At cost. No markup. Just impact.
        </p>
        <p className="text-slate-500 text-sm mt-3">
          Estimated cost: $8–15 depending on your location.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">

        {ambassador && (
          <div className="bg-[#111827] rounded-2xl p-6 border border-white/10">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Shipping To</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Name</p>
                <p className="text-white font-medium">{ambassador.full_name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-white font-medium">{ambassador.city_state}</p>
              </div>
              {ambassador.street_address && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">Street Address</p>
                  <p className="text-white font-medium">{ambassador.street_address}</p>
                </div>
              )}
              {ambassador.zip_code && (
                <div>
                  <p className="text-slate-500 text-xs mb-1">ZIP Code</p>
                  <p className="text-white font-medium">{ambassador.zip_code}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {ambassador?.slug && (
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Card Preview — Front</h2>
            <div className="flex justify-center">
              <CardFrontPreview
                slug={ambassador.slug}
                fullName={ambassador.full_name}
                cityState={ambassador.city_state}
              />
            </div>
            <p className="text-slate-500 text-xs text-center mt-3">Your unique QR code is printed on every card</p>
          </div>
        )}

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Select Quantity</h2>
          <div className="grid grid-cols-3 gap-3">
            {QUANTITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setQuantity(opt.value)}
                className={`rounded-xl p-4 text-left border transition-all ${
                  quantity === opt.value
                    ? 'border-green-500/60 bg-green-500/10'
                    : 'border-white/10 bg-[#111827] hover:border-white/20'
                }`}
              >
                <p className={`text-lg font-bold ${quantity === opt.value ? 'text-green-400' : 'text-white'}`}>
                  {opt.label}
                </p>
                <p className="text-slate-400 text-sm mt-1">{opt.cost}</p>
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
          onClick={handleOrder}
          disabled={step === 'submitting'}
          className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
        >
          {step === 'submitting' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating your card...
            </>
          ) : (
            <>
              <Package className="w-5 h-5" />
              Order My Cards
            </>
          )}
        </button>

        <p className="text-slate-600 text-xs text-center pb-4">
          Payment is handled securely by Gelato at checkout. No payment info is stored here.
        </p>
      </div>
    </div>
  );
}
