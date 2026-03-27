import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

const QUANTITY_OPTIONS = [
  { value: 25, label: '25 cards', cost: '$8–10' },
  { value: 50, label: '50 cards', cost: '$10–13' },
  { value: 100, label: '100 cards', cost: '$13–15' },
];

interface AmbassadorData {
  id: string;
  full_name: string;
  email: string;
  street_address: string | null;
  city_state: string;
  zip_code: string | null;
  slug: string | null;
}

type LoadState = 'loading' | 'ready' | 'not_found';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function CardPreview({ slug, fullName, cityState }: { slug: string; fullName: string; cityState: string }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://langaccess.org/r/' + slug)}&bgcolor=ffffff&color=000000&margin=2`;
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-xl" style={{ background: '#0b0d0c', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex" style={{ minHeight: 148 }}>
        <div className="w-1.5 flex-shrink-0" style={{ background: '#2dff72' }} />
        <div className="flex-1 p-5 flex gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-base leading-tight mb-1">One Card. One Lifeline.</p>
            <p className="text-slate-400 text-sm mb-4">Scan to find help near you</p>
            <div className="flex gap-2 text-lg">
              <span>&#127822;</span>
              <span>&#128716;</span>
              <span>&#127973;</span>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
            <div className="rounded-lg overflow-hidden" style={{ background: 'white', padding: 4, width: 80, height: 80 }}>
              <img src={qrUrl} alt="QR code" width={72} height={72} className="block" />
            </div>
            <p className="text-xs font-semibold" style={{ color: '#2dff72' }}>langaccess.org</p>
          </div>
        </div>
      </div>
      <div className="px-5 pb-3 flex justify-end">
        <p className="text-xs font-medium" style={{ color: '#2dff72' }}>
          {fullName} &nbsp;&bull;&nbsp; {cityState}
        </p>
      </div>
    </div>
  );
}

export default function PublicOrderPage() {
  const params = new URLSearchParams(window.location.search);
  const refCode = params.get('ref') || '';
  const aidCode = params.get('aid') || '';

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);

  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [zip, setZip] = useState('');
  const [quantity, setQuantity] = useState(25);

  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [stepLabel, setStepLabel] = useState('');

  useEffect(() => {
    if (!refCode && !aidCode) {
      setLoadState('not_found');
      return;
    }
    async function lookup() {
      try {
        const code = refCode ? refCode.toUpperCase() : aidCode;
        const response = await fetch('/.netlify/functions/lookup-ambassador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref_code: code })
        });
        const result = await response.json();
        if (!result.found || !result.ambassador) {
          setLoadState('not_found');
          return;
        }
        const amb = result.ambassador;
        setAmbassador(amb);
        const cityParts = amb.city_state?.split(',') ?? [];
        setCity(cityParts[0]?.trim() ?? '');
        setStateVal(cityParts[1]?.trim() ?? '');
        setStreetAddress(amb.street_address ?? '');
        setZip(amb.zip_code ?? '');
        setLoadState('ready');
      } catch {
        setLoadState('not_found');
      }
    }
    lookup();
  }, [refCode, aidCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambassador) return;
    if (!streetAddress.trim() || !city.trim() || !stateVal.trim() || !zip.trim()) return;

    setSubmitState('submitting');
    setErrorMsg('');

    try {
      setStepLabel('Generating your card artwork...');
      const pdfRes = await fetch('/.netlify/functions/generate-card-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_slug: ambassador.slug || ambassador.id,
          full_name: ambassador.full_name,
          city_state: ambassador.city_state,
        }),
      });

      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to generate card artwork');
      }

      const { frontFileUrl, backFileUrl } = await pdfRes.json();

      setStepLabel('Placing your print order...');
      const gelatoRes = await fetch('/.netlify/functions/create-gelato-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambassador_id: ambassador.id,
          full_name: ambassador.full_name,
          email: ambassador.email,
          phone: '',
          shipping_address: streetAddress.trim(),
          city: city.trim(),
          state: stateVal.trim(),
          zip: zip.trim(),
          quantity,
          frontFileUrl,
          backFileUrl,
        }),
      });

      if (!gelatoRes.ok) {
        const err = await gelatoRes.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || 'Failed to place order with printer');
      }

      const { gelatoOrderId } = await gelatoRes.json();

      setStepLabel('Sending confirmation email...');
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            full_name: ambassador.full_name,
            email: ambassador.email,
            quantity,
            gelato_order_id: gelatoOrderId,
            shipping_address: `${streetAddress.trim()}, ${city.trim()}, ${stateVal.trim()} ${zip.trim()}`,
          }),
        });
      } catch {
        // non-fatal
      }

      setSubmitState('success');
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Something went wrong. Please try again.');
      setSubmitState('error');
      setStepLabel('');
    }
  };

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (loadState === 'not_found') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <SEO title="Order Cards | LangAccess" description="Order your LangAccess ambassador cards." path="/order-cards" />
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Link Not Recognized</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            This order link doesn't match any ambassador account. Check your welcome email for the correct link, or sign up as an ambassador to get your own.
          </p>
          {(refCode || aidCode) && (
            <p className="text-slate-600 text-xs font-mono mb-8">
              ref: {refCode || aidCode}
            </p>
          )}
          <a
            href="/ambassador"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ambassador Sign-up
          </a>
        </div>
      </div>
    );
  }

  if (submitState === 'success') {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <SEO title="Order Confirmed | LangAccess" description="Your card order has been placed." path="/order-cards" />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Your cards are printing.</h1>
          <p className="text-slate-300 text-base leading-relaxed mb-2">
            Allow 5–7 business days for delivery.
          </p>
          <p className="text-green-400 text-sm font-medium mb-10">
            A confirmation email is on its way to {ambassador?.email}.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
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
        <p className="text-slate-400 text-sm leading-relaxed mb-1">Printed with your unique QR code.</p>
        <p className="text-slate-400 text-sm leading-relaxed mb-1">You pay printing and shipping only — at cost, no markup.</p>
        <p className="text-slate-500 text-xs mt-1 mb-8">Estimated cost: $8–15 depending on location.</p>

        {ambassador?.slug && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Your Card — Front Preview</p>
            <CardPreview
              slug={ambassador.slug}
              fullName={ambassador.full_name}
              cityState={ambassador.city_state}
            />
            <p className="text-slate-500 text-xs text-center mt-2">Your unique QR code is printed on every card</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Ordering For</p>
            <div className="bg-[#111827] border border-white/10 rounded-xl px-4 py-3">
              <p className="text-white font-medium text-sm">{ambassador?.full_name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{ambassador?.email}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Shipping Address</p>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="Street address"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
                />
                <input
                  type="text"
                  required
                  value={stateVal}
                  onChange={e => setStateVal(e.target.value)}
                  placeholder="State"
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
                />
              </div>
              <input
                type="text"
                required
                value={zip}
                onChange={e => setZip(e.target.value)}
                placeholder="ZIP code"
                pattern="\d{5}"
                title="5-digit ZIP code"
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Quantity</p>
            <div className="grid grid-cols-3 gap-3">
              {QUANTITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setQuantity(opt.value)}
                  className={`rounded-xl p-4 text-left border transition-all ${
                    quantity === opt.value
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-white/20'
                  }`}
                >
                  <p className={`text-base font-bold ${quantity === opt.value ? 'text-green-400' : 'text-white'}`}>
                    {opt.label}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">{opt.cost}</p>
                </button>
              ))}
            </div>
          </div>

          {submitState === 'error' && errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitState === 'submitting'}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
          >
            {submitState === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{stepLabel || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Place My Order
              </>
            )}
          </button>

          <p className="text-slate-600 text-xs text-center">
            Payment is collected by Gelato at fulfillment. No payment info is stored here.
          </p>
        </form>
      </div>
    </div>
  );
}
