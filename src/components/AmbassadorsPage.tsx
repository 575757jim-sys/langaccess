import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MapPin, Send, CheckCircle } from 'lucide-react';
import SEO from './SEO';
import { supabase } from '../lib/supabase';

interface Props {
  onBack: () => void;
}

interface AmbassadorForm {
  name: string;
  email: string;
  city: string;
  profession: string;
  locations: string;
  source: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  city?: string;
  profession?: string;
  locations?: string;
  agreement?: string;
}

const EMPTY_FORM: AmbassadorForm = {
  name: '',
  email: '',
  city: '',
  profession: '',
  locations: '',
  source: '',
  message: '',
};

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
  const [form, setForm] = useState<AmbassadorForm>(EMPTY_FORM);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
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
    if (!form.city.trim()) next.city = 'City & state is required.';
    if (!form.profession.trim()) next.profession = 'Profession is required.';
    if (!form.locations.trim()) next.locations = 'Distribution location is required.';
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
      const { data: existing, error: lookupError } = await supabase
        .from('ambassadors')
        .select('id')
        .eq('email', form.email.trim())
        .maybeSingle();

      if (lookupError) {
        console.error('Duplicate check error:', lookupError);
      }

      if (existing) {
        setDuplicateEmail(true);
        return;
      }

      const ambassador_id = crypto.randomUUID();

      const { error: insertError } = await supabase
        .from('ambassadors')
        .insert({
          id: ambassador_id,
          full_name: form.name.trim(),
          email: form.email.trim(),
          city_state: form.city.trim(),
          profession: form.profession.trim(),
          distribution_location: form.locations.trim(),
          how_heard: form.source || null,
          additional_context: form.message.trim() || null,
          agreement_accepted: true,
          agreement_timestamp: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Ambassador insert error:', insertError);
        setSubmitError('Signup failed: ' + (insertError?.message ?? 'unknown error') + ' (code: ' + (insertError?.code ?? '?') + ')');
        return;
      }

      let slug = '';
      let qrUrl = '';

      try {
        const qrRes = await fetch('/.netlify/functions/generate-qr-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ambassador_id, full_name: form.name.trim(), city_state: form.city.trim() }),
        });
        if (qrRes.ok) {
          const qrData = await qrRes.json();
          slug = qrData.slug ?? '';
          qrUrl = qrData.qrUrl ?? '';
        }
      } catch {
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      fetch(`${supabaseUrl}/functions/v1/send-ambassador-welcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ full_name: form.name.trim(), email: form.email.trim(), slug, qrUrl }),
      }).catch(err => { console.error('send-ambassador-welcome failed:', err); });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unexpected error. Please try again.';
      console.error('handleSubmit threw:', err);
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
            Got 10 minutes<br />
            <span className="text-green-400">and a pocket?</span>
          </h1>
          <p className="text-slate-200 text-lg font-medium mb-3 max-w-2xl mx-auto leading-relaxed">
            If someone needs food, shelter, or other services — this card will help.
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
            { step: '01', title: 'Sign Up Below', desc: 'Tell us who you are and where you work. Takes 2 minutes.' },
            { step: '02', title: 'Get Your Cards', desc: 'We ship a pack of 25 LangAccess reference cards to your location.' },
            { step: '03', title: 'Share Them', desc: 'Leave them in waiting rooms, break rooms, teacher lounges, or hand them directly to colleagues.' },
          ].map(item => (
            <div key={item.step} className="bg-[#111827] rounded-2xl p-6 border border-white/10">
              <p className="text-4xl font-bold text-green-500/30 mb-3">{item.step}</p>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="signup" className="max-w-2xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Join the Brigade</h2>
          <p className="text-slate-400 text-sm">Fill out the form below. We'll reach out within 48 hours.</p>
        </div>

        {duplicateEmail ? (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Already registered</h3>
            <p className="text-slate-400 text-sm">
              This email is already registered. Check your inbox for your welcome email.
            </p>
          </div>
        ) : submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">You're in.</h3>
            <p className="text-slate-400 text-sm">
              Check your email — your QR code and next steps are waiting. Your free card pack ships within 5 days.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="bg-[#111827] rounded-2xl p-8 border border-white/10 space-y-5">
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3 text-red-400 text-sm">
                {submitError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Maria Sanchez"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.name ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="maria@example.com"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.email ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  City & State *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="San Jose, CA"
                    className={`w-full bg-white/5 border rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.city ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
                  />
                </div>
                {errors.city && <p className="text-red-400 text-xs mt-1.5">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Profession *
                </label>
                <input
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  placeholder="Nurse, Teacher, Foreman..."
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.profession ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
                />
                {errors.profession && <p className="text-red-400 text-xs mt-1.5">{errors.profession}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Where Would You Distribute Cards? *
              </label>
              <input
                name="locations"
                value={form.locations}
                onChange={handleChange}
                placeholder="Valley Medical Center waiting room, Lincoln Elementary break room..."
                className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none text-sm transition-colors ${errors.locations ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-green-500/50'}`}
              />
              {errors.locations && <p className="text-red-400 text-xs mt-1.5">{errors.locations}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                How Did You Hear About Us?
              </label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500/50 text-sm transition-colors appearance-none"
              >
                <option value="" className="bg-[#111827] text-slate-400">Select one...</option>
                {SOURCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-[#111827]">{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Anything Else? (Optional)
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
              <label className={`flex items-start gap-3 cursor-pointer group`}>
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
                    className="sr-only peer"
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

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Join the Ambassador Brigade'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

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
