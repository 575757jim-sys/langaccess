import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2, CreditCard, MapPin, Hash, ShoppingCart, Pencil, Download, Smartphone } from 'lucide-react';
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
  gelatoBaseCost: number | null;
  markup: number;
  finalTotal: number | null;
  price: number | null;
  currency: string;
  quantity: number;
}

const MARKUP_BY_QUANTITY: Record<number, number> = {
  25: 5.00,
  50: 7.00,
  100: 10.00,
};

function getMarkup(qty: number): number {
  return MARKUP_BY_QUANTITY[qty] ?? 5.00;
}

const QUANTITY_OPTIONS = [
  { value: 25, label: '25', sublabel: 'cards' },
  { value: 50, label: '50', sublabel: 'cards' },
  { value: 100, label: '100', sublabel: 'cards' },
];

function generateQRCodeUrl(ambassadorId: string): string {
  const target = `https://langaccess.org/help?ref=${encodeURIComponent(ambassadorId)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}&bgcolor=ffffff&color=000000&margin=2`;
}

function CardFrontPreview({ slug, fullName, cityState, ambassadorId }: {
  slug: string; fullName: string; cityState: string; ambassadorId?: string;
}) {
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
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <p className="text-xs font-semibold" style={{ color: '#2dff72' }}>langaccess.org</p>
            <p className="text-slate-500 text-[10px] text-center leading-tight">Español disponible<br />al escanear</p>
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
  const [composedPreviewUrl, setComposedPreviewUrl] = useState('');
  const [composeStep, setComposeStep] = useState('');
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
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

      if (aidParam) localStorage.setItem('ambassador_id', aidParam);

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
        if (!json.found || !json.ambassador) { setStep('unauthorized'); return; }
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
          } catch { setStep('unauthorized'); }
        } else { setStep('unauthorized'); }
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
      if (!json.found || !json.ambassador) { setStep('unauthorized'); return; }
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
      cityState = parts.length > 1 ? `${parts[0].trim()}, ${parts[1].trim()}` : `${rawCity}, CA`;
    }
    if (!fullName) fullName = ambassador?.email?.split('@')[0] || 'Ambassador';
    if (!cityState) cityState = 'Your City, CA';
    return { fullName, cityState };
  }

  const handleGetPrice = async () => {
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

    console.log('[OrderCards] Selected quantity:', quantity);
    console.log('[OrderCards] Ambassador code:', ambassador.ref_code || ambassador.id);
    console.log('[OrderCards] Final QR destination URL:', `https://langaccess.org/help?ref=${encodeURIComponent(ambassadorId)}`);
    console.log('[OrderCards] handleGetPrice — fields resolved:', { fullName, formattedCityState, city, state, slug, ambassadorId });

    const fallbackFront = 'https://langaccess.org/card-front.pdf';
    const fallbackBack = 'https://langaccess.org/card-back.pdf';
    let frontFileUrl = fallbackFront;
    let backFileUrl = fallbackBack;
    let composed = '';
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

    setComposedPreviewUrl(composed);
    setComposeStep(stepLabel);
    setPendingOrderData({ fullName, formattedCityState, city, state, slug, frontFileUrl, backFileUrl });

    console.log('[OrderCards] Gelato quote request starting...');
    setStep('submitting');

    const payload = {
      ambassador_id: ambassador.id,
      full_name: fullName,
      email: ambassador.email,
      phone: '',
      shipping_address: ambassador.street_address || '',
      city,
      state,
      zip: ambassador.zip_code || '',
      quantity,
      frontFileUrl,
      backFileUrl,
    };

    console.log('[OrderCards] Quote payload built:', JSON.stringify(payload));

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
      console.log('[OrderCards] Gelato quote success — full response:', data);

      const resolvedQty = data.quantity ?? quantity;
      const gelatoBaseCost = data.price ?? null;
      const markup = getMarkup(resolvedQty);
      const finalTotal = gelatoBaseCost != null ? parseFloat((gelatoBaseCost + markup).toFixed(2)) : null;

      console.log('[OrderCards] gelatoQuoteTotal:', gelatoBaseCost);
      console.log('[OrderCards] markup:', markup);
      console.log('[OrderCards] finalTotal:', finalTotal);

      setQuoteResult({
        gelatoBaseCost,
        markup,
        finalTotal,
        price: finalTotal,
        currency: data.currency ?? 'USD',
        quantity: resolvedQty,
      });
      setStep('success');
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
      console.error('[OrderCards] handleGetPrice error:', msg);
      setErrorMsg(msg);
      setStep('ready');
    }
  };

  const handleEditOrder = () => {
    setStep('ready');
    setErrorMsg('');
    setCheckoutError('');
  };

  const handleCheckout = async () => {
    if (!ambassador || !quoteResult || !pendingOrderData) return;

    const refCode = ambassador.ref_code || ambassador.id || '';
    const qty = quoteResult.quantity;
    const gelatoBaseCost = quoteResult.gelatoBaseCost;
    const markup = quoteResult.markup;
    const finalTotal = quoteResult.finalTotal;
    const cityState = pendingOrderData.formattedCityState;

    console.log('[OrderCards] Stripe checkout starting');
    console.log('[OrderCards] ambassadorCode:', refCode);
    console.log('[OrderCards] quantity:', qty);
    console.log('[OrderCards] gelatoBaseCost:', gelatoBaseCost);
    console.log('[OrderCards] markup:', markup);
    console.log('[OrderCards] finalTotal:', finalTotal);
    console.log('[OrderCards] stripeCheckoutAmount:', finalTotal);

    setCheckoutLoading(true);
    setCheckoutError('');

    const { city, state } = splitCityState(cityState);
    const fields = resolveAmbassadorFields();
    const fullName = (ambassador.full_name || '').trim() || pendingOrderData.fullName || fields.fullName;

    const payload = {
      full_name: fullName,
      email: ambassador.email,
      quantity: qty,
      ref_code: refCode,
      gelato_base_cost: gelatoBaseCost,
      markup,
      product_price: gelatoBaseCost,
      shipping_price: 0,
      total_price: finalTotal,
      currency: quoteResult.currency,
      shipment_method_name: '',
      street_address: ambassador.street_address || '',
      city,
      state,
      zip: ambassador.zip_code || '',
      order_type: 'card_order',
      ambassador_id: ambassador.id,
      front_file_url: pendingOrderData.frontFileUrl,
      back_file_url: pendingOrderData.backFileUrl,
    };

    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Could not start checkout. Please try again.');
      }

      console.log('[OrderCards] Stripe checkout session created, redirecting...');
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
      console.error('[OrderCards] Stripe checkout error:', msg);
      setCheckoutError(msg);
      setCheckoutLoading(false);
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
    const currencySymbol = quoteResult?.currency === 'USD' ? '$' : (quoteResult?.currency ?? '');
    const qty = quoteResult?.quantity ?? quantity;
    const gelatoBaseCost = quoteResult?.gelatoBaseCost ?? null;
    const markup = quoteResult?.markup ?? getMarkup(qty);
    const finalTotal = quoteResult?.finalTotal ?? null;
    const hasFinalTotal = finalTotal != null;
    const refCode = ambassador?.ref_code || ambassador?.id || '';
    const cityState = pendingOrderData?.formattedCityState || normalizeCityState(ambassador?.city_state || '');
    const ambassadorIdForQR = ambassador?.id || ambassador?.ref_code || ambassador?.slug || 'demo123';
    const qrDownloadUrl = generateQRCodeUrl(ambassadorIdForQR);

    return (
      <div className="min-h-screen bg-[#0a0f1e] text-white" style={{ WebkitOverflowScrolling: 'touch' }}>
        <SEO title="Your Quote | LangAccess" description="Your LangAccess card quote is ready." path="/order-cards" />

        <div className="sticky top-0 bg-[#0a0f1e] border-b border-white/10 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={handleEditOrder}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              style={{ touchAction: 'manipulation' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Edit Order</span>
            </button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 pt-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 200px)' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Your exact price is ready</h1>
            <p className="text-slate-400 text-sm">Review your order before checkout</p>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Order Summary</p>
            </div>
            <div className="divide-y divide-white/5">
              <div className="flex items-center gap-3 px-5 py-4">
                <Package className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <span className="text-slate-400 text-sm flex-1">Quantity</span>
                <span className="text-white font-medium text-sm">{qty} cards</span>
              </div>

              {gelatoBaseCost != null && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm flex-1">Base print + shipping</span>
                  <span className="text-white font-medium text-sm">{currencySymbol}{gelatoBaseCost.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center gap-3 px-5 py-4">
                <CreditCard className="w-4 h-4 text-slate-500 flex-shrink-0 opacity-0" />
                <span className="text-slate-400 text-sm flex-1">Service fee</span>
                <span className="text-white font-medium text-sm">{currencySymbol}{markup.toFixed(2)}</span>
              </div>

              {hasFinalTotal && (
                <div className="flex items-center gap-3 px-5 py-4 bg-white/[0.03]">
                  <CreditCard className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-white font-semibold text-sm flex-1">Total</span>
                  <span className="text-green-400 font-bold text-sm">
                    {currencySymbol}{finalTotal!.toFixed(2)}{' '}
                    <span className="text-slate-500 font-normal">{quoteResult!.currency}</span>
                  </span>
                </div>
              )}

              {cityState && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm flex-1">Ships to</span>
                  <span className="text-white font-medium text-sm">{cityState}</span>
                </div>
              )}

              {refCode && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <Hash className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm flex-1">Ambassador code</span>
                  <span className="text-white font-medium text-sm font-mono">{refCode}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-green-500/25 p-5 mb-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm mb-1">Start Helping Right Away</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Download your QR code so you can start helping immediately. Keep it on your phone, print it, or share it with others. Every scan can connect someone to food, shelter, or local services.
                </p>
              </div>
            </div>
            <a
              href={qrDownloadUrl}
              download={`langaccess-qr-${ambassadorIdForQR}.png`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0d1f17] border border-green-500/40 hover:border-green-400/70 hover:bg-green-500/10 text-green-400 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
              style={{ touchAction: 'manipulation' }}
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </a>
          </div>

          {composedPreviewUrl && (
            <div className="rounded-xl overflow-hidden border border-white/10 mb-5">
              <img
                src={composedPreviewUrl}
                alt="Your card preview"
                className="w-full block"
                style={{ maxHeight: 220, objectFit: 'contain', background: '#000' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {composeStep && composeStep !== 'success' && composeStep !== 'not_started' && !composedPreviewUrl && (
            <div className="bg-[#111827] rounded-xl border border-white/10 px-4 py-3 mb-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-slate-400 text-sm">Print file ready with your unique QR code</p>
            </div>
          )}

          <p className="text-slate-500 text-xs text-center mb-1">
            Each card you distribute helps someone find real help nearby.
          </p>
          <p className="text-slate-600 text-xs text-center">
            Secure payment via Stripe. Your card is not charged until you complete checkout.
          </p>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-30 bg-[#0a0f1e] border-t border-white/10"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
        >
          <div className="max-w-lg mx-auto px-4 pt-3">
            {checkoutError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-3">
                <p className="text-red-400 text-xs leading-relaxed">{checkoutError}</p>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || !hasFinalTotal}
              className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3 mb-2"
              style={{ minHeight: 56, touchAction: 'manipulation' }}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Starting checkout...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Continue to Checkout
                </>
              )}
            </button>
            <button
              onClick={handleEditOrder}
              className="w-full py-3 rounded-xl border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Pencil className="w-4 h-4" />
              Edit Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isGenerating = step === 'previewing' || step === 'submitting';
  const cityStateDisplay = normalizeCityState(ambassador?.city_state || '');
  const refCodeDisplay = ambassador?.ref_code || ambassador?.id || '';
  const fields = resolveAmbassadorFields();

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      <SEO title="Order My Cards | LangAccess" description="Order your personalized LangAccess ambassador cards." path="/order-cards" />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <div className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 pt-8 space-y-6" style={{ paddingBottom: 'calc(100px + env(safe-area-inset-bottom))' }}>

          <div>
            <h1 className="text-2xl font-bold text-white leading-tight mb-1">Order Your Ambassador Cards</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Each card you hand out helps someone find food, shelter, or medical care nearby. Printed at cost — no markup.
            </p>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Shipping To</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-xs mb-0.5">Name</p>
                  <p className="text-white font-medium text-sm truncate">{fields.fullName}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-xs mb-0.5">Location</p>
                  <p className="text-white font-medium text-sm truncate">{cityStateDisplay || fields.cityState}</p>
                </div>
              </div>
              {ambassador?.street_address && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Street Address</p>
                  <p className="text-white font-medium text-sm">{ambassador.street_address}</p>
                </div>
              )}
              {ambassador?.zip_code && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">ZIP Code</p>
                  <p className="text-white font-medium text-sm">{ambassador.zip_code}</p>
                </div>
              )}
            </div>
          </div>

          {ambassador?.slug && (() => {
            const ambassadorIdForQR = ambassador.id || ambassador.ref_code || ambassador.slug || 'demo123';
            const qrDownloadUrl = generateQRCodeUrl(ambassadorIdForQR);
            return (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Card Preview</p>
                  <CardFrontPreview
                    slug={ambassador.slug || ''}
                    fullName={fields.fullName}
                    cityState={cityStateDisplay || fields.cityState}
                    ambassadorId={ambassadorIdForQR}
                  />
                </div>

                <div className="bg-[#111827] rounded-2xl border border-white/10 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm mb-0.5">Use Your QR Code Right Away</p>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Download your QR code to start helping immediately. Every scan can connect someone to local resources.
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mb-3">Share it, print it, or keep it on your phone.</p>
                  <a
                    href={qrDownloadUrl}
                    download={`langaccess-qr-${ambassadorIdForQR}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#0d1f17] border border-green-500/30 hover:border-green-500/60 hover:bg-green-500/10 text-green-400 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </a>
                </div>
              </div>
            );
          })()}

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Select Quantity</p>
            <div className="grid grid-cols-3 gap-3">
              {QUANTITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setQuantity(opt.value)}
                  disabled={isGenerating}
                  className={`rounded-xl p-4 text-center border transition-all ${
                    quantity === opt.value
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/10 bg-[#111827] hover:border-white/25'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <p className={`text-2xl font-bold leading-none mb-1 ${quantity === opt.value ? 'text-green-400' : 'text-white'}`}>
                    {opt.label}
                  </p>
                  <p className="text-slate-500 text-xs">{opt.sublabel}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ambassador Code</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-white font-mono font-medium text-sm">{refCodeDisplay || '—'}</p>
              <p className="text-slate-500 text-xs mt-1">Linked to your personalized QR code</p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
              <p className="text-amber-400 text-sm">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-[#0a0f1e]/95 backdrop-blur border-t border-white/10 px-4 pt-3 z-20"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleGetPrice}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3"
            style={{ minHeight: 56, touchAction: 'manipulation' }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {step === 'previewing' ? 'Preparing your card...' : 'Getting your price...'}
              </>
            ) : (
              <>
                <Package className="w-5 h-5" />
                Get Exact Price
              </>
            )}
          </button>
          <p className="text-slate-600 text-xs text-center mt-2">
            Get your exact price instantly — no commitment
          </p>
        </div>
      </div>
    </div>
  );
}
