import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Send, CheckCircle } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
  onOrderCards?: () => void;
}

interface FormState {
  name: string;
  email: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  profession: string;
  locations: string;
  source: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profession?: string;
  locations?: string;
  source?: string;
  agreement?: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  profession: '',
  locations: '',
  source: '',
  message: '',
};

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
];

const PLACEHOLDER_AMBASSADORS = [
  { name: 'Maria S.', city: 'San Jose, CA', profession: 'Pediatric Nurse', initial: 'M' },
  { name: 'Carlos R.', city: 'Fresno, CA', profession: 'Construction Foreman', initial: 'C' },
  { name: 'Jasmine T.', city: 'Los Angeles, CA', profession: 'Elementary Teacher', initial: 'J' },
  { name: 'David M.', city: 'Sacramento, CA', profession: 'Social Worker', initial: 'D' },
  { name: 'Priya K.', city: 'Oakland, CA', profession: 'Mental Health Counselor', initial: 'P' },
];

const SOURCE_OPTIONS = [
  'A colleague or friend',
  'Social media',
  'Google search',
  'LangAccess newsletter',
  'Community organization',
  'Healthcare conference',
  'Other',
];

function useCountUp(target: number, duration = 2000, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, started]);
  return count;
}

function StatCounter({ value, label, started }: { value: number; label: string; started: boolean }) {
  const count = useCountUp(value, 1800, started);
  return (
    <div className="text-center">
      <p className="text-5xl font-bold text-green-400 tabular-nums">
        {count.toLocaleString()}
        {value >= 1000 ? '+' : ''}
      </p>
      <p className="text-slate-400 text-sm mt-2 font-medium">{label}</p>
    </div>
  );
}

export default function AmbassadorsPage({ onBack, onOrderCards }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderPromptDismissed, setOrderPromptDismissed] = useState(false);
  const [selectedQty, setSelectedQty] = useState<25 | 50 | 100>(25);
  const [ambassadorSlug, setAmbassadorSlug] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.streetAddress.trim()) next.streetAddress = 'Street address is required.';
    if (!form.city.trim()) next.city = 'City is required.';
    if (!form.state) next.state = 'State is required.';
    if (!form.zipCode.trim()) next.zipCode = 'ZIP code is required.';
    else if (!/^\d{5}$/.test(form.zipCode.trim())) next.zipCode = 'ZIP code must be 5 digits.';
    if (!form.profession.trim()) next.profession = 'Profession is required.';
    if (!form.locations.trim()) next.locations = 'Distribution location is required.';
    if (!form.source) next.source = 'Please let us know how you heard about us.';
    if (!agreementChecked) next.agreement = 'You must agree to the terms before submitting.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('ambassadors')
        .insert({
          full_name: form.name.trim(),
          email: form.email.trim(),
          street_address: form.streetAddress.trim(),
          city_state: form.city.trim() + ', ' + form.state,
          zip_code: form.zipCode.trim(),
          profession: form.profession.trim(),
          distribution_location: form.locations.trim(),
          how_heard: form.source,
          additional_context: form.message.trim(),
          agreement_accepted: true,
          agreement_timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      localStorage.setItem('ambassador_id', data.id);
      setSubmitted(true);
      window.scrollTo(0, 0);

      const fullName = form.name.trim();
      const email = form.email.trim();
      const cityState = form.city.trim() + ', ' + form.state;

      try {
        const qrRes = await fetch('/.netlify/functions/generate-qr-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ambassador_id: data.id, full_name: fullName, city_state: cityState }),
        });
        const qrData = await qrRes.json();
        console.log('QR slug generated — slug:', qrData.slug, 'qrUrl:', qrData.qrUrl);
        if (qrData.slug) setAmbassadorSlug(qrData.slug);
        await fetch('/.netlify/functions/send-ambassador-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: fullName, email, slug: qrData.slug, qrUrl: qrData.qrUrl, ambassador_id: data.id }),
        });
      } catch (emailErr) {
        console.error('Post-submit background step failed:', emailErr);
      }

    } catch (err: unknown) {
      console.error('Submit error:', err);
      const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
      if (msg.includes('duplicate key')) {
        setSubmitError('This email is already registered as an Ambassador. Check your inbox for your welcome email.');
      } else {
        setSubmitError('Error: ' + msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (err?: string) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${err ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`;

  const signupSection = (
    <div id="signup" className="max-w-2xl mx-auto px-4 pb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Join the Brigade</h2>
        <p className="text-slate-400 text-sm">Join the movement. Takes 2 minutes.</p>
      </div>

      {submitted ? (
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-14 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-green-400 mb-4">You're in the Brigade!</h3>
            <p className="text-green-200 text-base leading-relaxed max-w-md mx-auto">
              Check your email — we've sent your QR code and your link to order cards.
            </p>
          </div>

          {!orderPromptDismissed && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Now Order Your Cards</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-1">
                Printed with your unique QR code. You pay printing and shipping only.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed mb-1">
                At cost. No markup. Just impact.
              </p>
              <p className="text-slate-500 text-sm mb-6">
                Estimated cost: $8–15 depending on location.
              </p>

              <div className="flex gap-3 mb-6">
                {([25, 50, 100] as const).map(qty => (
                  <button
                    key={qty}
                    onClick={() => setSelectedQty(qty)}
                    className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      selectedQty === qty
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:border-green-500/40 hover:text-white'
                    }`}
                  >
                    {qty} cards
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const url = ambassadorSlug
                    ? `/order-cards?ref=${encodeURIComponent(ambassadorSlug)}`
                    : '/order-cards';
                  window.location.href = url;
                }}
                className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 mb-4"
              >
                Order My Cards
                <Send className="w-4 h-4" />
              </button>

              <button
                onClick={() => setOrderPromptDismissed(true)}
                className="w-full text-center text-slate-500 hover:text-slate-400 text-sm transition-colors"
              >
                Skip for now — I'll order later
              </button>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="bg-[#111827] rounded-2xl p-8 border border-white/10 space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Full Name *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Maria Sanchez" className={fieldClass(errors.name)} />
              {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="maria@example.com" className={fieldClass(errors.email)} />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Mailing Address for Your Card Pack *
            </label>
            <div className="space-y-3">
              <div>
                <input name="streetAddress" value={form.streetAddress} onChange={handleChange} placeholder="123 Main St" className={fieldClass(errors.streetAddress)} />
                {errors.streetAddress && <p className="text-red-400 text-xs mt-1.5">{errors.streetAddress}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="San Jose"
                      className={`w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.city ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
                    />
                  </div>
                  {errors.city && <p className="text-red-400 text-xs mt-1.5">{errors.city}</p>}
                </div>
                <div>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:outline-none text-sm transition-colors appearance-none ${errors.state ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'} ${!form.state ? 'text-slate-600' : 'text-white'}`}
                  >
                    <option value="" className="bg-[#111827] text-slate-400">State</option>
                    {US_STATES.map(s => (
                      <option key={s} value={s} className="bg-[#111827] text-white">{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-400 text-xs mt-1.5">{errors.state}</p>}
                </div>
                <div>
                  <input
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleChange}
                    placeholder="ZIP code"
                    maxLength={5}
                    className={fieldClass(errors.zipCode)}
                  />
                  {errors.zipCode && <p className="text-red-400 text-xs mt-1.5">{errors.zipCode}</p>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Profession *</label>
            <input name="profession" value={form.profession} onChange={handleChange} placeholder="Nurse, Teacher, Foreman..." className={fieldClass(errors.profession)} />
            {errors.profession && <p className="text-red-400 text-xs mt-1.5">{errors.profession}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Where Would You Hand Out Cards? *</label>
            <input
              name="locations"
              value={form.locations}
              onChange={handleChange}
              placeholder="Valley Medical waiting room, Lincoln Elementary break room, job site..."
              className={fieldClass(errors.locations)}
            />
            {errors.locations && <p className="text-red-400 text-xs mt-1.5">{errors.locations}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">How Did You Hear About Us? *</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 focus:outline-none text-sm transition-colors appearance-none ${errors.source ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'} ${!form.source ? 'text-slate-600' : 'text-white'}`}
            >
              <option value="" className="bg-[#111827] text-slate-400">Select one...</option>
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-[#111827] text-white">{opt}</option>
              ))}
            </select>
            {errors.source && <p className="text-red-400 text-xs mt-1.5">{errors.source}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Tell Us About a Language Barrier You Witnessed <span className="normal-case font-normal text-slate-500">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us about a time language barriers impacted someone you work with..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors resize-none"
            />
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={e => {
                    setAgreementChecked(e.target.checked);
                    if (e.target.checked && errors.agreement) {
                      setErrors(prev => ({ ...prev, agreement: undefined }));
                    }
                  }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${errors.agreement ? 'border-red-500/60' : 'border-white/20 group-hover:border-green-500/50'} ${agreementChecked ? 'bg-green-500 border-green-500' : 'bg-white/5'}`}>
                  {agreementChecked && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-300 leading-snug">
                I agree to distribute cards only in professional settings and not to misrepresent LangAccess services.
              </span>
            </label>
            {errors.agreement && <p className="text-red-400 text-xs mt-1.5 ml-8">{errors.agreement}</p>}
          </div>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Join the Ambassador Brigade
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <SEO
        title="Ambassador Brigade | LangAccess"
        description="Join the LangAccess Ambassador Brigade. Distribute language access cards in your community and help break down language barriers in healthcare, education, and more."
        path="/ambassadors"
      />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Ambassador Brigade</h1>
            <p className="text-xs text-slate-500">Join the movement</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(34,197,94,0.12) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            One Card.<br />
            <span className="text-green-400">One Lifeline.</span>
          </h1>
          <p className="text-slate-200 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Carry a card. Connect someone to help.
          </p>
          <a
            href="#signup"
            className="inline-flex items-center gap-2 mt-8 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-base"
          >
            Become an Ambassador
            <Send className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-widest text-center mb-3">
          Your Card
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3 leading-snug">
          What you will be handing out
        </h2>
        <p className="text-slate-400 text-sm text-center max-w-xl mx-auto mb-12 leading-relaxed">
          Every card connects someone to food, shelter, restrooms, power, and crisis aid in 6 languages. Your unique QR code is printed on every card you receive.
        </p>

        <div className="flex flex-col md:flex-row gap-10 items-start justify-center">

          {/* ── FRONT ── */}
          <div className="w-full max-w-[480px] mx-auto flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 text-center">Front</p>
            {/* 3.5:2 aspect ratio = padding-top 57.14% */}
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
              style={{ paddingTop: '57.14%', background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-[5%]">

                {/* Top section */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black leading-none mb-[2%]" style={{ fontSize: 'clamp(18px,3.5vw,28px)' }}>One Card.</p>
                    <p className="text-white font-black leading-none mb-[3%]" style={{ fontSize: 'clamp(18px,3.5vw,28px)' }}>One Lifeline.</p>
                    <p className="font-semibold leading-none mb-[2%]" style={{ color: '#22c55e', fontSize: 'clamp(9px,1.5vw,13px)' }}>Scan for nearby help now</p>
                    <p className="text-slate-400 leading-none" style={{ fontSize: 'clamp(8px,1.2vw,11px)' }}>Shows help near your location</p>
                  </div>
                  {/* QR placeholder */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-1" style={{ width: 'clamp(52px,11%,72px)' }}>
                    <div className="w-full aspect-square bg-white rounded-md flex items-center justify-center p-[6%]">
                      <svg viewBox="0 0 64 64" className="w-full h-full">
                        <rect x="2" y="2" width="22" height="22" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                        <rect x="8" y="8" width="10" height="10" fill="#000"/>
                        <rect x="40" y="2" width="22" height="22" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                        <rect x="46" y="8" width="10" height="10" fill="#000"/>
                        <rect x="2" y="40" width="22" height="22" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                        <rect x="8" y="46" width="10" height="10" fill="#000"/>
                        <rect x="40" y="40" width="5" height="5" fill="#000"/>
                        <rect x="49" y="40" width="5" height="5" fill="#000"/>
                        <rect x="58" y="40" width="5" height="5" fill="#000"/>
                        <rect x="40" y="49" width="5" height="5" fill="#000"/>
                        <rect x="54" y="49" width="5" height="5" fill="#000"/>
                        <rect x="40" y="58" width="5" height="5" fill="#000"/>
                        <rect x="53" y="53" width="11" height="11" fill="#000"/>
                      </svg>
                    </div>
                    <p className="font-semibold text-center leading-none" style={{ color: '#22c55e', fontSize: 'clamp(6px,1vw,9px)' }}>langaccess.org</p>
                  </div>
                </div>

                {/* Icon row */}
                <div className="flex items-center gap-[2%] flex-wrap">
                  {[
                    { label: 'Food', color: '#22c55e', path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z' },
                    { label: 'Shelter', color: '#60a5fa', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                    { label: 'Medical', color: '#f87171', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                    { label: 'Restrooms', color: '#a78bfa', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { label: 'Power', color: '#fbbf24', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
                  ].map(icon => (
                    <div key={icon.label} className="flex items-center gap-1 bg-white/5 rounded-md px-[2%] py-[1%]">
                      <svg style={{ width: 'clamp(8px,1.4vw,11px)', height: 'clamp(8px,1.4vw,11px)', color: icon.color, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
                      </svg>
                      <span className="text-white font-medium leading-none" style={{ fontSize: 'clamp(6px,1vw,9px)' }}>{icon.label}</span>
                    </div>
                  ))}
                </div>

                {/* Free help line */}
                <div>
                  <p className="font-semibold leading-none mb-[1.5%]" style={{ color: '#22c55e', fontSize: 'clamp(7px,1.1vw,10px)' }}>Free help &bull; No sign-up required</p>
                  <p className="text-slate-300 font-medium leading-none mb-[1%]" style={{ fontSize: 'clamp(7px,1vw,9px)' }}>English &bull; Espa&ntilde;ol &bull; Tagalog</p>
                  <p className="text-slate-500 leading-none mb-[2%]" style={{ fontSize: 'clamp(6px,0.9vw,8px)' }}>Ti&#7871;ng Vi&#7879;t &bull; &#20013;&#25991;</p>
                  {/* No smartphone pill */}
                  <div className="inline-flex items-center bg-white/8 border border-white/10 rounded-full px-[2%] py-[0.8%]">
                    <span className="text-slate-300 leading-none" style={{ fontSize: 'clamp(6px,0.9vw,8px)' }}>No smartphone? Call or text 211</span>
                  </div>
                </div>

                {/* Bottom bar */}
                <div
                  className="flex items-center justify-between rounded-lg px-[3%] py-[1.5%] -mx-[5%] -mb-[5%]"
                  style={{ background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="font-bold text-white leading-none" style={{ fontSize: 'clamp(8px,1.3vw,11px)' }}>LangAccess.org</span>
                  <div className="w-[5%] aspect-square bg-white rounded-sm flex items-center justify-center p-[4%]" style={{ minWidth: 18 }}>
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                      <rect x="1" y="1" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                      <rect x="4" y="4" width="6" height="6" fill="#000"/>
                      <rect x="19" y="1" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                      <rect x="22" y="4" width="6" height="6" fill="#000"/>
                      <rect x="1" y="19" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                      <rect x="4" y="22" width="6" height="6" fill="#000"/>
                      <rect x="19" y="19" width="4" height="4" fill="#000"/>
                      <rect x="25" y="19" width="4" height="4" fill="#000"/>
                      <rect x="19" y="25" width="4" height="4" fill="#000"/>
                      <rect x="25" y="25" width="7" height="7" fill="#000"/>
                    </svg>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── BACK ── */}
          <div className="w-full max-w-[480px] mx-auto flex-shrink-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 text-center">Back</p>
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.55)]"
              style={{ paddingTop: '57.14%', background: '#0B1F3A', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-[5%]">

                {/* Header */}
                <div>
                  <p className="text-white font-black leading-none" style={{ fontSize: 'clamp(11px,2vw,16px)' }}>Find help near you:</p>
                  <p className="font-semibold leading-none mt-[1%]" style={{ color: '#22c55e', fontSize: 'clamp(7px,1.1vw,10px)' }}>Free &bull; No sign-up required</p>
                </div>

                {/* Middle: icon grid + QR */}
                <div className="flex items-start gap-[4%]">
                  {/* 2x3 icon grid */}
                  <div className="grid grid-cols-2 gap-x-[4%] gap-y-[6%] flex-1">
                    {[
                      { label: 'Food', color: '#22c55e', path: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.4 6M17 13l1.4 6M9 19a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z' },
                      { label: 'Shelter', color: '#60a5fa', path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                      { label: 'Medical', color: '#f87171', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
                      { label: 'Restrooms', color: '#a78bfa', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                      { label: 'Power', color: '#fbbf24', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
                      { label: 'Narcan', color: '#f59e0b', isAmber: true, path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
                    ].map(icon => (
                      <div key={icon.label} className="flex items-center gap-[6%]">
                        <svg style={{ width: 'clamp(9px,1.5vw,12px)', height: 'clamp(9px,1.5vw,12px)', color: icon.color, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
                        </svg>
                        <span
                          className="leading-none font-medium"
                          style={{ fontSize: 'clamp(7px,1.1vw,9px)', color: icon.isAmber ? '#f59e0b' : 'white' }}
                        >{icon.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR column */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 'clamp(48px,10%,66px)' }}>
                    <div className="w-full aspect-square bg-white rounded-md p-[5%] relative">
                      {/* Corner markers */}
                      <div className="absolute top-[8%] left-[8%] w-[25%] h-[25%] border-[2px] border-black rounded-sm" />
                      <div className="absolute top-[8%] right-[8%] w-[25%] h-[25%] border-[2px] border-black rounded-sm" />
                      <div className="absolute bottom-[8%] left-[8%] w-[25%] h-[25%] border-[2px] border-black rounded-sm" />
                    </div>
                    <p className="text-slate-400 text-center leading-none" style={{ fontSize: 'clamp(5px,0.9vw,8px)' }}>Shows help near you</p>
                  </div>
                </div>

                {/* Crisis numbers */}
                <div className="flex items-center gap-[2%] flex-wrap">
                  {[
                    { num: '911', label: 'Emergency', es: 'Emergencia', chip: '#ef4444' },
                    { num: '988', label: 'Crisis / Mental Health', es: 'Crisis / Salud Mental', chip: '#f97316' },
                    { num: '211', label: 'Local Resources', es: 'Recursos Locales', chip: '#3b82f6' },
                  ].map(c => (
                    <div key={c.num} className="flex items-start gap-[4%]">
                      <span className="rounded-md text-white font-black leading-none px-[5%] py-[2%] flex-shrink-0" style={{ background: c.chip, fontSize: 'clamp(8px,1.4vw,11px)' }}>{c.num}</span>
                      <div>
                        <p className="text-white leading-none font-medium" style={{ fontSize: 'clamp(6px,1vw,9px)' }}>{c.label}</p>
                        <p className="text-slate-400 leading-none" style={{ fontSize: 'clamp(5px,0.85vw,7.5px)' }}>{c.es}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Used by line */}
                <p className="text-slate-500 italic leading-none" style={{ fontSize: 'clamp(6px,0.9vw,8px)' }}>Used by local outreach teams</p>

                {/* No smartphone pill */}
                <div className="inline-flex items-center self-start bg-white/8 border border-white/10 rounded-full px-[2%] py-[0.8%]">
                  <span className="text-slate-300 leading-none" style={{ fontSize: 'clamp(6px,0.9vw,8px)' }}>No smartphone? Call or text 211</span>
                </div>

                {/* Bottom bar */}
                <div
                  className="flex items-center justify-between rounded-lg px-[3%] py-[1.5%] -mx-[5%] -mb-[5%]"
                  style={{ background: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <span className="font-bold text-white leading-none" style={{ fontSize: 'clamp(8px,1.3vw,11px)' }}>LangAccess.org</span>
                  <span className="text-slate-400 leading-none" style={{ fontSize: 'clamp(5px,0.9vw,8px)' }}>EN &bull; ES &bull; TL &bull; VI &bull; &#20013;&#25991; &bull; &#24191;&#26481;&#35441;</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      <div ref={statsRef} className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-6 bg-[#111827] rounded-2xl p-8 border border-white/10">
          <StatCounter value={20} label="Active Ambassadors" started={statsVisible} />
          <StatCounter value={250} label="Cards Distributed" started={statsVisible} />
          <StatCounter value={8} label="Cities Reached" started={statsVisible} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { step: '01', title: 'Sign Up', desc: 'Tell us who you are and where you work. Takes 2 minutes.' },
            { step: '02', title: 'Order Your Cards', desc: 'Order a pack of 25, 50, or 100 cards printed with your unique QR code. You pay printing and shipping cost only — no markup.' },
            { step: '03', title: 'Share Them', desc: 'Leave them in waiting rooms, break rooms, or hand them directly to anyone who needs help finding food, shelter, or crisis support.' },
          ].map(item => (
            <div key={item.step} className="bg-[#111827] rounded-2xl p-6 border border-white/10">
              <p className="text-4xl font-bold text-green-500/30 mb-3">{item.step}</p>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {signupSection}

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Ambassador Wall</h2>
          <p className="text-slate-500 text-sm mt-1">Our founding ambassadors</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PLACEHOLDER_AMBASSADORS.map((a) => (
            <div
              key={a.name}
              className="bg-[#111827] rounded-2xl p-5 border border-white/10 text-center hover:border-green-500/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-3 text-green-400 font-bold text-lg group-hover:bg-green-500/20 transition-colors">
                {a.initial}
              </div>
              <p className="text-white font-semibold text-sm leading-tight">{a.name}</p>
              <p className="text-green-400 text-xs mt-1">{a.city}</p>
              <p className="text-slate-500 text-xs mt-0.5">{a.profession}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <a
            href="#signup"
            className="text-slate-400 text-sm hover:text-green-400 transition-colors"
          >
            Want to see your name here? <span className="text-green-400 font-semibold">Become an Ambassador →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
