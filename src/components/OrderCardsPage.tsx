import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Loader2, CreditCard, MapPin, Hash, ShoppingCart, Pencil, Download, AlertCircle } from 'lucide-react';
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

interface ShippingForm {
  fullName: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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

function generateQRCodeUrl(ambassadorCode: string): string {
  const target = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(target)}&bgcolor=ffffff&color=000000&margin=2`;
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

function validateShipping(form: ShippingForm): Partial<Record<keyof ShippingForm, string>> {
  const errors: Partial<Record<keyof ShippingForm, string>> = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Street address is required';
  if (!form.city.trim()) errors.city = 'City is required';
  if (!form.state.trim()) errors.state = 'State is required';
  if (!form.postalCode.trim()) errors.postalCode = 'ZIP code is required';
  if (!form.country.trim()) errors.country = 'Country is required';
  return errors;
}

function isShippingComplete(form: ShippingForm): boolean {
  return Object.keys(validateShipping(form)).length === 0;
}

function buildShippingFormFromAmbassador(ambassador: AmbassadorData | null): ShippingForm {
  const cityState = (ambassador?.city_state || '').trim();
  const parts = cityState.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts[0] || '';
  const state = parts.length > 1 ? parts[1].toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : '';

  return {
    fullName: (ambassador?.full_name || '').trim(),
    email: (ambassador?.email || '').trim(),
    addressLine1: (ambassador?.street_address || '').trim(),
    city,
    state,
    postalCode: (ambassador?.zip_code || '').trim(),
    country: 'US',
  };
}

export default function OrderCardsPage({ onBack, onGateBack }: Props) {
  const [step, setStep] = useState<Step>('loading');
  const [ambassador, setAmbassador] = useState<AmbassadorData | null>(null);
  const [quantity, setQuantity] = useState(25);
  const [errorMsg, setErrorMsg] = useState('');
  const [finalPrintAssetUrl, setFinalPrintAssetUrl] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [composeStep, setComposeStep] = useState('');
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '', email: '', addressLine1: '', city: '', state: '', postalCode: '', country: 'US',
  });
  const [shippingTouched, setShippingTouched] = useState<Partial<Record<keyof ShippingForm, boolean>>>({});
  const [pendingOrderData, setPendingOrderData] = useState<{
    fullName: string;
    formattedCityState: string;
    city: string;
    state: string;
    slug: string;
    ambassadorCode: string;
    finalPrintAssetUrl: string;
    email: string;
    addressLine1: string;
    postalCode: string;
    country: string;
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
        setShippingForm(buildShippingFormFromAmbassador(data));
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
            const amb: AmbassadorData = {
              id: parsed.code || '',
              full_name: parsed.name || '',
              email: parsed.email || '',
              street_address: null,
              city_state: cityState,
              zip_code: null,
              slug: null,
              ref_code: parsed.code || null,
            };
            setAmbassador(amb);
            setShippingForm(buildShippingFormFromAmbassador(amb));
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
      setShippingForm(buildShippingFormFromAmbassador(data));
      setStep('ready');
    }
    loadAmbassador();
  }, []);

  function updateShippingField(field: keyof ShippingForm, value: string) {
    setShippingForm(prev => ({ ...prev, [field]: value }));
    setShippingTouched(prev => ({ ...prev, [field]: true }));
  }

  function touchAllFields() {
    const all: Partial<Record<keyof ShippingForm, boolean>> = {};
    (Object.keys(shippingForm) as (keyof ShippingForm)[]).forEach(k => { all[k] = true; });
    setShippingTouched(all);
  }

  const shippingErrors = validateShipping(shippingForm);
  const shippingReady = isShippingComplete(shippingForm);

  const handleGetPrice = async () => {
    if (!ambassador) return;
    if (!shippingReady) return;

    setStep('previewing');
    setErrorMsg('');

    const { fullName, email, addressLine1, city, state, postalCode, country } = shippingForm;
    const formattedCityState = state ? `${city}, ${state}` : city;
    const slug = ambassador.slug || ambassador.ref_code || ambassador.id || 'langaccess';
    const ambassadorCode = ambassador.ref_code || ambassador.id || slug;
    const orderId = `order-${ambassador.id || 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const qrDestinationUrl = `https://langaccess.org/join?code=${encodeURIComponent(ambassadorCode)}`;

    console.log('[OrderCards] ambassadorCode:', ambassadorCode);
    console.log('[OrderCards] qrDestinationUrl:', qrDestinationUrl);
    console.log('[OrderCards] fullName:', fullName);
    console.log('[OrderCards] email:', email);
    console.log('[OrderCards] addressLine1:', addressLine1);
    console.log('[OrderCards] city:', city);
    console.log('[OrderCards] state:', state);
    console.log('[OrderCards] postalCode:', postalCode);
    console.log('[OrderCards] country:', country);
    console.log('[OrderCards] Selected quantity:', quantity);

    let resolvedFinalPrintAssetUrl = '';
    let resolvedQrImageUrl = '';
    let stepLabel = 'not_started';

    try {
      const pdfRes = await fetch('/.netlify/functions/generate-card-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          full_name: fullName,
          city_state: formattedCityState,
          slug,
          ambassador_id: ambassadorCode,
        }),
      });
      if (pdfRes.ok) {
        const pdfData = await pdfRes.json();
        if (pdfData.finalPrintAssetUrl) {
          resolvedFinalPrintAssetUrl = pdfData.finalPrintAssetUrl;
        }
        if (pdfData.qrImageUrl) {
          resolvedQrImageUrl = pdfData.qrImageUrl;
        }
        stepLabel = pdfData.composeStep || 'success';
        console.log('[OrderCards] generate-card-pdf composeStep:', pdfData.composeStep);
        console.log('[OrderCards] qrImageUrl from response:', pdfData.qrImageUrl || '(none)');
        console.log('[OrderCards] finalPrintAssetUrl from response:', pdfData.finalPrintAssetUrl || '(none)');
      } else {
        stepLabel = `generate_card_pdf_http_${pdfRes.status}`;
        console.warn('[OrderCards] generate-card-pdf failed:', pdfRes.status);
      }
    } catch (imgErr) {
      stepLabel = 'generate_card_pdf_network_error';
      console.warn('[OrderCards] generate-card-pdf error:', imgErr);
    }

    console.log('[OrderCards] resolvedFinalPrintAssetUrl:', resolvedFinalPrintAssetUrl || '(none)');
    console.log('[OrderCards] resolvedQrImageUrl:', resolvedQrImageUrl || '(none)');
    console.log('[OrderCards] Preview will render:', resolvedFinalPrintAssetUrl ? `finalPrintAssetUrl: ${resolvedFinalPrintAssetUrl}` : 'loading state (no finalPrintAssetUrl)');

    setFinalPrintAssetUrl(resolvedFinalPrintAssetUrl);
    setQrImageUrl(resolvedQrImageUrl);
    setComposeStep(stepLabel);
    setPendingOrderData({
      fullName,
      formattedCityState,
      city,
      state,
      slug,
      ambassadorCode,
      finalPrintAssetUrl: resolvedFinalPrintAssetUrl,
      email,
      addressLine1,
      postalCode,
      country,
    });

    console.log('[OrderCards] finalPrintAssetUrl stored in state:', resolvedFinalPrintAssetUrl || '(none — will use fallback at Gelato step)');
    console.log('[OrderCards] Gelato quote request starting...');
    setStep('submitting');

    const gelatoQuotePayload = {
      ambassador_id: ambassador.id,
      full_name: fullName,
      email,
      phone: '',
      shipping_address: addressLine1,
      city,
      state,
      zip: postalCode,
      quantity,
      finalPrintAssetUrl: resolvedFinalPrintAssetUrl || undefined,
      frontFileUrl: resolvedFinalPrintAssetUrl || undefined,
    };

    console.log('[OrderCards] gelatoQuotePayload:', JSON.stringify(gelatoQuotePayload));

    try {
      const gelatoRes = await fetch('/.netlify/functions/create-gelato-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gelatoQuotePayload),
      });

      console.log('[OrderCards] Gelato response received — status:', gelatoRes.status);

      if (!gelatoRes.ok) {
        const errBody = await gelatoRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[OrderCards] Gelato error response:', errBody);
        throw new Error(errBody.error || `Order service returned ${gelatoRes.status}. Please try again.`);
      }

      const data = await gelatoRes.json();
      console.log('[OrderCards] gelatoResponse:', data);

      const resolvedQty = data.quantity ?? quantity;
      const gelatoBaseCost = data.price ?? null;
      const markup = getMarkup(resolvedQty);
      const finalTotal = gelatoBaseCost != null ? parseFloat((gelatoBaseCost + markup).toFixed(2)) : null;

      console.log('[OrderCards] gelatoBaseCost:', gelatoBaseCost);
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

    const { fullName, email, addressLine1, city, state, postalCode, country } = pendingOrderData;
    if (!fullName || !email || !addressLine1 || !city || !state || !postalCode || !country) {
      setCheckoutError('Please complete all required fields before checkout.');
      return;
    }

    const refCode = ambassador.ref_code || ambassador.id || '';
    const qty = quoteResult.quantity;
    const gelatoBaseCost = quoteResult.gelatoBaseCost;
    const markup = quoteResult.markup;
    const finalTotal = quoteResult.finalTotal;
    const printUrl = pendingOrderData.finalPrintAssetUrl || finalPrintAssetUrl || '';

    console.log('[OrderCards] Stripe checkout starting');
    console.log('[OrderCards] ambassadorCode:', refCode);
    console.log('[OrderCards] fullName:', fullName);
    console.log('[OrderCards] email:', email);
    console.log('[OrderCards] addressLine1:', addressLine1);
    console.log('[OrderCards] city:', city);
    console.log('[OrderCards] state:', state);
    console.log('[OrderCards] postalCode:', postalCode);
    console.log('[OrderCards] country:', country);
    console.log('[OrderCards] quantity:', qty);
    console.log('[OrderCards] gelatoBaseCost:', gelatoBaseCost);
    console.log('[OrderCards] markup:', markup);
    console.log('[OrderCards] finalTotal:', finalTotal);
    console.log('[OrderCards] finalPrintAssetUrl (going to checkout):', printUrl);

    setCheckoutLoading(true);
    setCheckoutError('');

    const stripeCheckoutPayload = {
      full_name: fullName,
      email,
      quantity: qty,
      ref_code: refCode,
      gelato_base_cost: gelatoBaseCost,
      markup,
      product_price: gelatoBaseCost,
      shipping_price: 0,
      total_price: finalTotal,
      currency: quoteResult.currency,
      shipment_method_name: '',
      street_address: addressLine1,
      city,
      state,
      zip: postalCode,
      country,
      order_type: 'card_order',
      ambassador_id: ambassador.id,
      final_print_asset_url: printUrl,
      front_file_url: printUrl,
      back_file_url: '',
    };

    console.log('[OrderCards] --- Pre-checkout payload summary ---');
    console.log('[OrderCards] fullName:', fullName);
    console.log('[OrderCards] email:', email);
    console.log('[OrderCards] addressLine1:', addressLine1);
    console.log('[OrderCards] city:', city);
    console.log('[OrderCards] state:', state);
    console.log('[OrderCards] postalCode:', postalCode);
    console.log('[OrderCards] country:', country);
    console.log('[OrderCards] ambassadorCode (ref_code):', refCode);
    console.log('[OrderCards] finalPrintAssetUrl:', printUrl || '(none)');
    console.log('[OrderCards] stripeCheckoutPayload:', JSON.stringify(stripeCheckoutPayload));

    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeCheckoutPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        const dbMsg = data.db_error_message ? ` DB: ${data.db_error_message}` : '';
        const dbCode = data.db_error_code ? ` [${data.db_error_code}]` : '';
        const dbHint = data.db_error_hint ? ` Hint: ${data.db_error_hint}` : '';
        const fullMsg = `${data.error || 'Could not start checkout.'}${dbCode}${dbMsg}${dbHint}`;
        console.error('[OrderCards] Checkout session failed — saveOrder response:', JSON.stringify(data));
        throw new Error(fullMsg);
      }

      if (!data.url) {
        console.error('[OrderCards] No redirect URL returned from checkout session:', JSON.stringify(data));
        throw new Error('Checkout session created but no redirect URL was returned.');
      }

      console.log('[OrderCards] Stripe checkout session created, redirecting to:', data.url);
      window.location.href = data.url;
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Something went wrong. Please try again.';
      console.error('[OrderCards] Stripe checkout error (full):', msg);
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
    const resolvedFinalTotal = quoteResult?.finalTotal ?? null;
    const hasFinalTotal = resolvedFinalTotal != null;
    const refCode = ambassador?.ref_code || ambassador?.id || '';
    const cityStateDisplay = pendingOrderData?.formattedCityState || normalizeCityState(ambassador?.city_state || '');
    const ambassadorCode = ambassador?.ref_code || ambassador?.id || ambassador?.slug || 'demo123';
    const qrDownloadUrl = generateQRCodeUrl(ambassadorCode);
    const printPreviewUrl = pendingOrderData?.finalPrintAssetUrl || finalPrintAssetUrl || '';
    const checkoutReady = hasFinalTotal && !checkoutLoading;

    console.log('[OrderCards] Review screen — qrImageUrl state:', qrImageUrl || '(none)');
    console.log('[OrderCards] Review screen — finalPrintAssetUrl state:', finalPrintAssetUrl || '(none)');
    console.log('[OrderCards] Review screen — pendingOrderData.finalPrintAssetUrl:', pendingOrderData?.finalPrintAssetUrl || '(none)');
    console.log('[OrderCards] Review screen — printPreviewUrl (resolved):', printPreviewUrl || '(none)');
    console.log('[OrderCards] Review screen — rendering preview as:', printPreviewUrl ? `image: ${printPreviewUrl}` : 'loading state');

    return (
      <div className="bg-[#0a0f1e] text-white" style={{ minHeight: '100dvh' }}>
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

        <div className="max-w-lg mx-auto px-4 pt-8" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>

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
                    {currencySymbol}{resolvedFinalTotal!.toFixed(2)}{' '}
                    <span className="text-slate-500 font-normal">{quoteResult!.currency}</span>
                  </span>
                </div>
              )}

              {cityStateDisplay && (
                <div className="flex items-center gap-3 px-5 py-4">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-400 text-sm flex-1">Ships to</span>
                  <span className="text-white font-medium text-sm">{cityStateDisplay}</span>
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

          <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden mb-5">
            <div className="px-5 py-3 border-b border-white/5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Your card preview</p>
            </div>
            {printPreviewUrl ? (
              <>
                <div className="p-3" style={{ background: '#0b0d12' }}>
                  <img
                    src={printPreviewUrl}
                    alt="Your card print preview"
                    className="w-full"
                    style={{ borderRadius: 12 }}
                    onLoad={() => console.log('[OrderCards] Card preview image loaded successfully:', printPreviewUrl)}
                    onError={() => console.error('[OrderCards] Card preview image FAILED to load:', printPreviewUrl)}
                  />
                </div>
                <div className="px-5 py-3">
                  <p className="text-slate-500 text-xs">This is the exact image that will be printed on your cards with your QR code embedded.</p>
                </div>
              </>
            ) : (
              <div className="px-5 py-8 flex flex-col items-center gap-3" style={{ background: '#0b0d12' }}>
                <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
                <p className="text-slate-500 text-xs text-center">Preparing your printable card preview...</p>
              </div>
            )}
          </div>

          <a
            href={qrDownloadUrl}
            download={`langaccess-qr-${ambassadorCode}.png`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0d1f17] border border-green-500/40 hover:border-green-400/70 hover:bg-green-500/10 text-green-400 font-semibold text-sm px-4 py-3 rounded-xl transition-all mb-5"
            style={{ touchAction: 'manipulation' }}
          >
            <Download className="w-4 h-4" />
            Download QR Code — use it now, cards ship later
          </a>

          <p className="text-slate-500 text-xs text-center mb-1">
            Each card you distribute helps someone find real help nearby.
          </p>
          <p className="text-slate-600 text-xs text-center mb-2">
            Secure payment via Stripe. Your card is not charged until you complete checkout.
          </p>
          <p className="text-slate-600 text-xs text-center mb-6">
            No print order is submitted until payment is completed.
          </p>

          {checkoutError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs leading-relaxed">{checkoutError}</p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={!checkoutReady}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-3 mb-3"
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
            style={{ touchAction: 'manipulation', paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)', minHeight: 56 }}
          >
            <Pencil className="w-4 h-4" />
            Edit Order
          </button>
        </div>
      </div>
    );
  }

  const isGenerating = step === 'previewing' || step === 'submitting';
  const ambassadorCode = ambassador?.ref_code || ambassador?.id || ambassador?.slug || 'demo123';
  const qrDownloadUrl = generateQRCodeUrl(ambassadorCode);
  const refCodeDisplay = ambassador?.ref_code || ambassador?.id || '';

  const inputBase = 'w-full bg-[#0a0f1e] border rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-colors focus:border-green-500/60';
  const inputNormal = `${inputBase} border-white/15 hover:border-white/25`;
  const inputError = `${inputBase} border-red-500/50 focus:border-red-400`;

  function fieldClass(field: keyof ShippingForm) {
    return shippingTouched[field] && shippingErrors[field] ? inputError : inputNormal;
  }

  return (
    <div className="bg-[#0a0f1e] text-white" style={{ minHeight: '100dvh' }}>
      <SEO title="Order My Cards | LangAccess" description="Order your personalized LangAccess ambassador cards." path="/order-cards" />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors" style={{ touchAction: 'manipulation' }}>
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

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>

        <div>
          <h1 className="text-2xl font-bold text-white leading-tight mb-1">Order Your Ambassador Cards</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Each card you hand out helps someone find food, shelter, or medical care nearby.
          </p>
        </div>

        <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Shipping Details</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                className={fieldClass('fullName')}
                value={shippingForm.fullName}
                onChange={e => updateShippingField('fullName', e.target.value)}
                placeholder="Your full name"
                disabled={isGenerating}
              />
              {shippingTouched.fullName && shippingErrors.fullName && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{shippingErrors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Email Address <span className="text-red-400">*</span></label>
              <input
                type="email"
                className={fieldClass('email')}
                value={shippingForm.email}
                onChange={e => updateShippingField('email', e.target.value)}
                placeholder="you@example.com"
                disabled={isGenerating}
              />
              {shippingTouched.email && shippingErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{shippingErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Street Address <span className="text-red-400">*</span></label>
              <input
                type="text"
                className={fieldClass('addressLine1')}
                value={shippingForm.addressLine1}
                onChange={e => updateShippingField('addressLine1', e.target.value)}
                placeholder="123 Main St"
                disabled={isGenerating}
              />
              {shippingTouched.addressLine1 && shippingErrors.addressLine1 && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{shippingErrors.addressLine1}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">City <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={fieldClass('city')}
                  value={shippingForm.city}
                  onChange={e => updateShippingField('city', e.target.value)}
                  placeholder="Oakland"
                  disabled={isGenerating}
                />
                {shippingTouched.city && shippingErrors.city && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{shippingErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">State <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={fieldClass('state')}
                  value={shippingForm.state}
                  onChange={e => updateShippingField('state', e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="CA"
                  maxLength={2}
                  disabled={isGenerating}
                />
                {shippingTouched.state && shippingErrors.state && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{shippingErrors.state}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">ZIP Code <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={fieldClass('postalCode')}
                  value={shippingForm.postalCode}
                  onChange={e => updateShippingField('postalCode', e.target.value)}
                  placeholder="94601"
                  disabled={isGenerating}
                />
                {shippingTouched.postalCode && shippingErrors.postalCode && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{shippingErrors.postalCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Country <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  className={fieldClass('country')}
                  value={shippingForm.country}
                  onChange={e => updateShippingField('country', e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="US"
                  maxLength={2}
                  disabled={isGenerating}
                />
                {shippingTouched.country && shippingErrors.country && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{shippingErrors.country}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111827] rounded-2xl border border-green-500/25 p-5">
            <p className="text-white font-bold text-sm mb-2">Start helping right away</p>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Save your QR code to your phone, print it, or share it. Every scan connects someone to food, shelter, or local services nearby.
            </p>
            <a
              href={qrDownloadUrl}
              download={`langaccess-qr-${ambassadorCode}.png`}
              target="_blank"
              rel="noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0d1f17] border border-green-500/40 hover:border-green-400/70 hover:bg-green-500/10 text-green-400 font-semibold text-sm px-4 py-3 rounded-xl transition-all"
              style={{ touchAction: 'manipulation' }}
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </a>
          </div>
        </div>

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

        {refCodeDisplay && (
          <div className="bg-[#111827] rounded-2xl border border-white/10 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Ambassador Code</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-white font-mono font-medium text-sm">{refCodeDisplay}</p>
              <p className="text-slate-500 text-xs mt-1">Linked to your personalized QR code</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-400 text-sm">{errorMsg}</p>
          </div>
        )}

        <div className="pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
          {!shippingReady && Object.keys(shippingTouched).length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400 text-xs leading-relaxed">Please complete all required fields before checkout.</p>
            </div>
          )}
          <button
            onClick={() => { touchAllFields(); if (shippingReady && !isGenerating) handleGetPrice(); }}
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
