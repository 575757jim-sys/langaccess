import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2, CreditCard, Image as ImageIcon } from 'lucide-react';
import SEO from './SEO';

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
  ref_code: string | null;
}

type Step = 'loading' | 'unauthorized' | 'ready' | 'previewing' | 'submitting' | 'success';

interface QuoteResult {
  price: number | null;
  currency: string;
  quantity: number;
}

const QUANTITY_OPTIONS = [
  { value: 25, label: '25 cards', cost: '$8–10' },
  { value: 50, label: '50 cards', cost: '$10–13' },
  { value: 100, label: '100 cards', cost: '$13–15' },
];

function generateQRCodeUrl(ambassadorId: string): string {
  const target = `https://langaccess.org/help?ref=${encodeURIComponent(ambassadorId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}&bgcolor=ffffff&color=000000&margin=2`;
}

function CardFrontPreview({ slug, fullName, cityState, ambassadorId }: { slug: string; fullName: string; cityState: string; ambassadorId?: string }) {
  const effectiveId = ambassadorId || slug || 'demo123';
  const qrUrl = generateQRCodeUrl(effectiveId);

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

function normalizeCityState(raw: string): string {
  const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const city = parts[0];
    const state = parts[1].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    if (city.length >= 2 && state.length === 2) return `${city}, ${state}`;
    if (city.length >= 2) return city;
  }
  if (parts.length === 1 && parts[0].length >= 2) return parts[0];
  return '';
}

function splitCityState(cityState: string): { city: string; state: string } {
  const parts = cityState.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || '';
  const state = parts.length > 1 ? parts[1].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : '';
  return { city, state };
}

export default function OrderCardsPage({ onBack, onGateBack }: Props) {
  const [step, setStep] = useState<Step>('loading');
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [quantity, setQuantity] = useState(25);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewCityState, setPreviewCityState] = useState('');
  const [composedPreviewUrl, setComposedPreviewUrl] = useState('');
  const [composeStep, setComposeStep] = useState('');
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [pendingOrderData, setPendingOrderData] = useState<{
    fullName: string;
    formattedCityState: string;
    city: string;
    state: string;
    slug: string;
    frontFileUrl: string;
    backFileUrl: string;
  } | null>(null);

  useEffect(() => {
    async function loadAmbassador() {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      const aidParam = params.get('aid');

      if (aidParam) {
        localStorage.setItem('ambassador_id', aidParam);
      }

      if (refParam) {
        const refUpper = refParam.toUpperCase();
        console.log('[OrderCards] Looking up ref_code:', refUpper);

        const res = await fetch('/.netlify/functions/lookup-ambassador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref_code: refUpper }),
        });
        const json = await res.json();
        console.log('[OrderCards] lookup-ambassador response:', json);

        if (!json.found || !json.ambassador) {
          setStep('unauthorized');
          return;
        }

        const data: AmbassadorData = json.ambassador;
        if (data.id) localStorage.setItem('ambassador_id', data.id);
        setAmbassador(data);
        setStep('ready');
        return;
      }

      const ambassadorId = aidParam || localStorage.getItem('ambassador_id');
      if (!ambassadorId) {
        const localData = localStorage.getItem('ambassador_data');
        if (localData) {
          try {
            const parsed = JSON.parse(localData);
            const rawCity = (parsed.city || '').trim();
            const cityParts = rawCity.split(',');
            const cityState = cityParts.length > 1
              ? `${cityParts[0].trim()}, ${cityParts[1].trim()}`
              : rawCity ? `${rawCity}, CA` : '';
            setAmbassador({
              id: parsed.code || '',
              full_name: parsed.name || '',
              email: parsed.email || '',
              street_address: null,
              city_state: cityState,
              zip_code: null,
              slug: null,
              ref_code: parsed.code || null,
            });
            setStep('ready');
          } catch {
            setStep('unauthorized');
          }
        } else {
          setStep('unauthorized');
        }
        return;
      }

      console.log('[OrderCards] Looking up by ambassador_id:', ambassadorId);

      const res = await fetch('/.netlify/functions/lookup-ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambassador_id: ambassadorId }),
      });
      const json = await res.json();
      console.log('[OrderCards] lookup-ambassador response:', json);

      if (!json.found || !json.ambassador) {
        setStep('unauthorized');
        return;
      }

      const data: AmbassadorData = json.ambassador;
      if (data.id) localStorage.setItem('ambassador_id', data.id);
      setAmbassador(data);
      setStep('ready');
    }

    loadAmbassador();
  }, []);

  function resolveAmbassadorFields(): { fullName: string; cityState: string } {
    let fullName = (ambassador?.full_name || '').trim();
    let cityState = (ambassador?.city_state || '').trim();

    const localData = localStorage.getItem('ambassador_data');
    const parsed = localData ? (() => { try { return JSON.parse(localData); } catch { return null; } })() : null;

    if (!fullName && parsed?.name) fullName = (parsed.name as string).trim();
    if (!cityState && parsed?.city) {
      const rawCity = (parsed.city as string).trim();
      const parts = rawCity.split(',');
      cityState = parts.length > 1
        ? `${parts[0].trim()}, ${parts[1].trim()}`
        : `${rawCity}, CA`;
    }

    if (!fullName) fullName = ambassador?.email?.split('@')[0] || 'Ambassador';
    if (!cityState) cityState = 'Your City, CA';

    return { fullName, cityState };
  }

  const handlePreview = async () => {
    if (!ambassador) return;
    setStep('previewing');
    setErrorMsg('');

    const fields = resolveAmbassadorFields();
    const { fullName } = fields;
    const formattedCityState = normalizeCityState(fields.cityState) || fields.cityState;
    const { city, state } = splitCityState(formattedCityState);
    const slug = ambassador.slug || ambassador.ref_code || ambassador.id || 'langaccess';
    const ambassadorId = ambassador.id || ambassador.ref_code || slug;
    const orderId = `order-${ambassador.id || 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const qrDestination = `https://langaccess.org/help?ref=${encodeURIComponent(ambassadorId)}`;
    console.log('[OrderCards] Final QR destination URL:', qrDestination);
    console.log('[OrderCards] handlePreview — fields resolved:', { fullName, formattedCityState, city, state, slug, ambassadorId });

    const fallbackFront = 'https://langaccess.org/card-front.pdf';
    const fallbackBack = 'https://langaccess.org/card-back.pdf';
    let frontFileUrl = fallbackFront;
    let backFileUrl = fallbackBack;
    let composed: string = '';
    let stepLabel = 'not_started';

    try {
      const pdfRes = await fetch('/.netlify/functions/generate-card-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, full_name: fullName, city_state: formattedCityState, slug, ambassador_id: ambassadorId }),
      });
      if (pdfRes.ok) {
        const pdfData = await pdfRes.json();
        if (pdfData.frontFileUrl) frontFileUrl = pdfData.frontFileUrl;
        if (pdfData.backFileUrl) backFileUrl = pdfData.backFileUrl;
        if (pdfData.composedDataUrl) composed = pdfData.composedDataUrl;
        stepLabel = pdfData.composeStep || 'success';
        console.log('[OrderCards] generate-card-pdf composeStep:', pdfData.composeStep);
      } else {
        stepLabel = `generate_card_pdf_http_${pdfRes.status}`;
        console.warn('[OrderCards] generate-card-pdf failed:', pdfRes.status, '— using fallback print assets');
      }
    } catch (imgErr) {
      stepLabel = 'generate_card_pdf_network_error';
      console.warn('[OrderCards] generate-card-pdf error:', imgErr, '— using fallback print assets');
    }

    console.log('[OrderCards] Final print asset URL:', composed ? '(composedDataUrl — base64 image)' : frontFileUrl);
    setComposedPreviewUrl(composed);
    setComposeStep(stepLabel);
    setPreviewCityState(formattedCityState);
    setPendingOrderData({ fullName, formattedCityState, city, state, slug, frontFileUrl, backFileUrl });
    setStep('ready');
  };

  const handleConfirmOrder = async () => {
    if (!ambassador || !pendingOrderData) return;

    console.log('[OrderCards] Confirm button tapped');
    setStep('submitting');
    setErrorMsg('');

    const fields = resolveAmbassadorFields();
    const fullName = (ambassador.full_name || '').trim() || pendingOrderData.fullName || fields.fullName;

    const { formattedCityState } = pendingOrderData;
    const { city: resolvedCity, state: resolvedState } = splitCityState(formattedCityState);

    const frontFileUrl = pendingOrderData.frontFileUrl || 'https://langaccess.org/card-front.pdf';
    const backFileUrl = pendingOrderData.backFileUrl || 'https://langaccess.org/card-back.pdf';

    const payload = {
      ambassador_id: ambassador.id,
      full_name: fullName,
      email: ambassador.email,
      phone: '',
      shipping_address: ambassador.street_address || '',
      city: resolvedCity,
      state: resolvedState,
      zip: ambassador.zip_code || '',
      quantity,
      frontFileUrl,
      backFileUrl,
    };

    console.log('[OrderCards] Payload built:', JSON.stringify(payload));
    console.log('[OrderCards] Gelato request starting...');

    try {
      const gelatoRes = await fetch('/.netlify/functions/create-gelato-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[OrderCards] Gelato response received — status:', gelatoRes.status);

      if (!gelatoRes.ok) {
        const errBody = await gelatoRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[OrderCards] Gelato error response:', errBody);
        throw new Error(errBody.error || `Order service returned ${gelatoRes.status}. Please try again.`);
      }

      const data = await gelatoRes.json();
      console.log('[OrderCards] Gelato success — full response:', data);
      setQuoteResult({
        price: data.price ?? null,
        currency: data.currency ?? 'USD',
        quantity: data.quantity ?? quantity,
      });
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
      console.error('[OrderCards] handleConfirmOrder error:', msg);
      setErrorMsg(msg);
      setStep('ready');
    }
  };

  const handleOrder = handlePreview;

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
    const hasPrice = quoteResult?.price != null;
    const formattedPrice = hasPrice
      ? (typeof quoteResult!.price === 'number'
          ? quoteResult!.price.toFixed(2)
          : String(quoteResult!.price))
      : null;
    const currencySymbol = quoteResult?.currency === 'USD' ? '$' : (quoteResult?.currency ?? '');
    const qty = quoteResult?.quantity ?? quantity;

    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col items-center justify-center px-4">
        <SEO title="Quote Received | LangAccess" description="Your LangAccess card quote has been calculated." path="/order-cards" />
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Quote received</h1>

          {hasPrice ? (
            <div className="bg-[#111827] rounded-2xl border border-green-500/20 p-6 mb-6">
              <p className="text-slate-400 text-sm mb-2">Your total</p>
              <p className="text-4xl font-bold text-green-400 mb-1">
                {currencySymbol}{formattedPrice}
              </p>
              <p className="text-slate-400 text-sm">
                for {qty} cards · {quoteResult!.currency}
              </p>
            </div>
          ) : (
            <div className="bg-[#111827] rounded-2xl border border-white/10 p-6 mb-6">
              <p className="text-slate-300 text-base leading-relaxed">
                Your quote for {qty} cards was calculated successfully.
              </p>
            </div>
          )}

          <p className="text-slate-500 text-xs mb-8">
            This is a price quote only. No order has been submitted yet.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
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

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-10" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>

        {ambassador && (
          <div className="bg-[#111827] rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Shipping To</h2>
                <p className="text-slate-500 text-xs mt-0.5">Auto-filled from your ambassador profile</p>
              </div>
              <button
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                Edit
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Name</p>
                <p className="text-white font-medium">{ambassador.full_name}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Location</p>
                <p className="text-white font-medium">{normalizeCityState(ambassador.city_state)}</p>
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
                slug={ambassador.slug || ''}
                fullName={ambassador.full_name}
                cityState={normalizeCityState(ambassador.city_state)}
                ambassadorId={ambassador.id || 'demo123'}
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

        {pendingOrderData && (
          <div className="bg-[#111827] rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-green-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {composedPreviewUrl ? 'Card Preview — Print Ready' : 'Print Asset Ready'}
              </h2>
            </div>

            {composedPreviewUrl ? (
              <div>
                <div className="rounded-xl overflow-hidden border border-white/10 mb-3">
                  <img
                    src={composedPreviewUrl}
                    alt="Your business card with QR code"
                    className="w-full block"
                    style={{ maxHeight: 260, objectFit: 'contain', background: '#000' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Your card is ready with your unique QR code. Shipping to{' '}
                  <span className="text-white font-medium">{previewCityState}</span>.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-black rounded-lg p-2" style={{ minWidth: 120 }}>
                  <div className="rounded overflow-hidden bg-white p-1" style={{ width: 90, height: 90 }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&ecc=H&data=${encodeURIComponent(`https://langaccess.org/help?ref=${encodeURIComponent(pendingOrderData.slug)}`)}`}
                      alt="QR code"
                      width={82}
                      height={82}
                      className="block"
                    />
                  </div>
                  <p className="text-[10px] font-semibold mt-1" style={{ color: '#2dff72' }}>langaccess.org</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium mb-1">QR code ready</p>
                  <p className="text-slate-400 text-xs leading-relaxed mb-2">
                    Your unique QR code is confirmed. Shipping to{' '}
                    <span className="text-white font-medium">{previewCityState}</span>.
                  </p>
                  {composeStep && composeStep !== 'success' && composeStep !== 'not_started' && (
                    <p className="text-slate-500 text-[10px]">
                      Preview unavailable. Your print file is ready.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
            <p className="text-amber-400 text-sm">{errorMsg}</p>
          </div>
        )}

        {pendingOrderData ? (
          <button
            onClick={handleConfirmOrder}
            disabled={step === 'submitting'}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
            style={{ position: 'relative', zIndex: 10, touchAction: 'manipulation', minHeight: 56 }}
          >
            {step === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting order...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Confirm &amp; Get Exact Price
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleOrder}
            disabled={step === 'previewing'}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
            style={{ position: 'relative', zIndex: 10, touchAction: 'manipulation', minHeight: 56 }}
          >
            {step === 'previewing' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preparing your card...
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Get Exact Price
              </>
            )}
          </button>
        )}

        <p className="text-slate-600 text-xs text-center pb-4">
          Payment is handled securely by Gelato at checkout. No payment info is stored here.
        </p>
      </div>
    </div>
  );
}
