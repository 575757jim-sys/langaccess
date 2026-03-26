import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MapPin, Send, CheckCircle } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
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

export default function AmbassadorsPage({ onBack }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      setSubmitted(true);
      window.scrollTo(0, 0);

      const fullName = form.name.trim();
      const email = form.email.trim();
      const cityState = form.city.trim() + ', ' + form.state;

      fetch('/.netlify/functions/generate-qr-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambassador_id: data.id, full_name: fullName, city_state: cityState }),
      })
        .then(r => r.json())
        .then(qrData => {
          fetch('/.netlify/functions/send-ambassador-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: fullName, email, slug: qrData.slug, qrUrl: qrData.qrUrl }),
          });
        })
        .catch(() => {});

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
        <p className="text-slate-400 text-sm">Join the Brigade. Order your cards at cost.</p>
      </div>

      {submitted ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-14 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-3xl font-bold text-green-400 mb-4">You are in the Brigade.</h3>
          <p className="text-green-200 text-base leading-relaxed max-w-md mx-auto">
            Check your email for your QR code and shipping details. Your free 25-card pack ships within 5 days.
          </p>
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
              Mailing Address for Your Free Card Pack *
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
              placeholder="Valley Medical Center waiting room, Lincoln Elementary break room..."
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
        description="Join the LangAccess Ambassador Brigade. Distribute free language access cards in your community and help break down language barriers in healthcare, education, and more."
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
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 text-green-400 text-sm font-medium mb-8">
            <Users className="w-4 h-4" />
            Community-Powered
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            One Card.<br />
            <span className="text-green-400">One Lifeline.</span>
          </h1>
          <p className="text-slate-200 text-lg font-medium mb-3 max-w-2xl mx-auto leading-relaxed">
            Carry a card. Connect someone to help.
          </p>
          <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
            Ambassadors distribute LangAccess cards at clinics, schools, job sites, and community centers.
          </p>
          <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
            No budget needed. No Spanish required. Just a willingness to hand someone a card that might change how they're treated at a doctor's office.
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

        <div className="flex flex-col md:flex-row gap-6 items-start justify-center">
          <div
            className="w-full max-w-[480px] mx-auto rounded-2xl shadow-2xl overflow-hidden flex-shrink-0"
            style={{ background: '#0b0d0c', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">LangAccess</span>
                <div className="flex gap-1.5">
                  {['ES', 'TL', 'VI', 'ZH'].map(lang => (
                    <span key={lang} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">{lang}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-base leading-tight mb-1">
                    Need help? We speak your language.
                  </h3>
                  <p className="text-slate-400 text-xs mb-4">Free resources. No app needed. 5 languages.</p>

                  <div className="space-y-2.5">
                    {[
                      {
                        icon: (
                          <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        ),
                        number: '211',
                        desc: 'Food, Shelter, Health, Utilities',
                        tag: 'CALL FREE',
                        tagColor: 'bg-green-500/20 text-green-400',
                      },
                      {
                        icon: (
                          <svg className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        ),
                        number: 'Text HOME to 741741',
                        desc: 'Crisis Text Line, 24/7',
                        tag: 'TEXT',
                        tagColor: 'bg-yellow-500/20 text-yellow-400',
                      },
                      {
                        icon: (
                          <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        ),
                        number: '988',
                        desc: 'Suicide and Crisis Lifeline, 24/7',
                        tag: 'CRISIS',
                        tagColor: 'bg-red-500/20 text-red-400',
                      },
                      {
                        icon: (
                          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        ),
                        number: 'Scan QR for resources',
                        desc: 'langaccess.org · your language · instant',
                        tag: 'SCAN',
                        tagColor: 'bg-blue-500/20 text-blue-400',
                      },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
                          {row.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold leading-tight truncate">{row.number}</p>
                          <p className="text-slate-500 text-[10px] leading-tight truncate">{row.desc}</p>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${row.tagColor}`}>{row.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className="w-16 h-16 rounded-lg flex flex-col items-center justify-center"
                    style={{ background: 'white' }}
                  >
                    <svg viewBox="0 0 64 64" className="w-12 h-12">
                      <rect x="4" y="4" width="24" height="24" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                      <rect x="10" y="10" width="12" height="12" fill="#000"/>
                      <rect x="36" y="4" width="24" height="24" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                      <rect x="42" y="10" width="12" height="12" fill="#000"/>
                      <rect x="4" y="36" width="24" height="24" rx="2" fill="none" stroke="#000" strokeWidth="3"/>
                      <rect x="10" y="42" width="12" height="12" fill="#000"/>
                      <rect x="36" y="36" width="6" height="6" fill="#000"/>
                      <rect x="46" y="36" width="6" height="6" fill="#000"/>
                      <rect x="36" y="46" width="6" height="6" fill="#000"/>
                      <rect x="46" y="46" width="14" height="14" fill="#000"/>
                    </svg>
                  </div>
                  <p className="text-[9px] text-slate-500 text-center leading-tight">Your personal<br/>QR</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
                <p className="text-[10px] text-slate-600">Your Name · Your City · Verified</p>
              </div>
            </div>
          </div>

          <div
            className="w-full max-w-[480px] mx-auto rounded-2xl shadow-2xl overflow-hidden flex-shrink-0"
            style={{ background: '#0a2214', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-green-400 text-xs font-bold uppercase tracking-wide mb-2.5">English</p>
                  <ul className="space-y-2">
                    {[
                      { bold: 'Call 211:', rest: 'Free 24/7. Food shelter health utilities.' },
                      { bold: 'Text HOME to 741741:', rest: 'Crisis support, confidential.' },
                      { bold: 'Call or Text 988:', rest: 'Crisis Lifeline, free, 24/7.' },
                      { bold: 'Scan QR:', rest: 'Full resources at langaccess.org' },
                    ].map((item, i) => (
                      <li key={i} className="text-[10px] leading-snug text-slate-300">
                        <span className="font-semibold text-white">{item.bold}</span>{' '}
                        <span className="text-slate-400">{item.rest}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-yellow-400 text-xs font-bold uppercase tracking-wide mb-2.5">Espanol</p>
                  <ul className="space-y-2">
                    {[
                      { bold: 'Llame al 211:', rest: 'Linea gratuita 24/7.' },
                      { bold: 'Escriba HOME al 741741:', rest: 'Apoyo en crisis.' },
                      { bold: 'Llame al 988:', rest: 'Linea de crisis, gratis.' },
                      { bold: 'Escanee el QR:', rest: 'Recursos en su idioma.' },
                    ].map((item, i) => (
                      <li key={i} className="text-[10px] leading-snug text-slate-300">
                        <span className="font-semibold text-white">{item.bold}</span>{' '}
                        <span className="text-slate-400">{item.rest}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-widest">LangAccess</span>
                <span className="text-slate-600 text-[10px]">langaccess.org</span>
                <span className="text-slate-600 text-[10px]">Distributed by a verified Ambassador</span>
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
      </div>
    </div>
  );
}
