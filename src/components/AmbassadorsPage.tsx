import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, MapPin, Send, CheckCircle } from 'lucide-react';
import SEO from './SEO';

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
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
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const airtableKey = import.meta.env.VITE_AIRTABLE_API_KEY as string | undefined;
    const airtableBase = import.meta.env.VITE_AIRTABLE_BASE_ID as string | undefined;

    if (airtableKey && airtableBase) {
      try {
        const res = await fetch(`https://api.airtable.com/v0/${airtableBase}/Ambassadors`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${airtableKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              Name: form.name,
              Email: form.email,
              City: form.city,
              Profession: form.profession,
              Locations: form.locations,
              Source: form.source,
              Message: form.message,
              'Submitted At': new Date().toISOString(),
            },
          }),
        });
        if (!res.ok) throw new Error('Airtable error');
        setSubmitted(true);
      } catch {
        setError('Could not submit via API. Opening email fallback...');
        openMailto();
      }
    } else {
      openMailto();
    }

    setSubmitting(false);
  };

  const openMailto = () => {
    const body = encodeURIComponent(
      `Ambassador Signup\n\nName: ${form.name}\nEmail: ${form.email}\nCity: ${form.city}\nProfession: ${form.profession}\nDistribution Locations: ${form.locations}\nHow they heard: ${form.source}\n\nMessage:\n${form.message}`
    );
    window.open(`mailto:hello@langaccess.org?subject=Ambassador+Signup&body=${body}`, '_blank');
    setSubmitted(true);
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
          <p className="text-slate-300 text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
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
          <StatCounter value={312} label="Active Ambassadors" started={statsVisible} />
          <StatCounter value={8400} label="Cards Distributed" started={statsVisible} />
          <StatCounter value={47} label="Cities Reached" started={statsVisible} />
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

        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You're in!</h3>
            <p className="text-slate-400 text-sm">
              Thanks for joining, {form.name || 'Ambassador'}. We'll reach out at {form.email || 'your email'} within 48 hours with your card pack info.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#111827] rounded-2xl p-8 border border-white/10 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Full Name *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Maria Sanchez"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors"
                />
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
                  required
                  placeholder="maria@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors"
                />
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
                    required
                    placeholder="San Jose, CA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Profession *
                </label>
                <input
                  name="profession"
                  value={form.profession}
                  onChange={handleChange}
                  required
                  placeholder="Nurse, Teacher, Foreman..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors"
                />
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
                required
                placeholder="Valley Medical Center waiting room, Lincoln Elementary break room..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 text-sm transition-colors"
              />
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

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

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
