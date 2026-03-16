import { useState } from 'react';
import { Download, BookOpen, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SECTORS = [
  'Healthcare',
  'Education',
  'Construction',
  'Community Outreach',
  'Government / Compliance',
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function ToolkitRequestSection() {
  const [email, setEmail] = useState('');
  const [sector, setSector] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setSubmitting(true);
    try {
      await supabase.from('toolkit_requests').insert({
        email: trimmed,
        sector: sector || null,
        source: 'toolkit_request',
      });
      setSubmittedEmail(trimmed);

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-toolkit-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email: trimmed }),
        });
        if (res.ok) {
          setEmailSent(true);
        } else {
          console.error('send-toolkit-email: non-ok response', res.status);
        }
      } catch (emailErr) {
        console.error('send-toolkit-email: fetch error', emailErr);
      }
    } catch {
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="max-w-xl mx-auto">
        <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Free toolkit used by healthcare, schools, and outreach teams implementing language access programs.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-6 pt-7 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  Free Language Access Toolkit
                </h2>
                <p className="text-slate-300 text-sm mt-0.5">
                  For Healthcare, Education, and Community Organizations
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mt-4">
              Download a practical guide for implementing language access programs and supporting Title VI and California LEP compliance.
            </p>
          </div>

          <div className="px-6 py-6">
            {submitted ? (
              <div className="flex flex-col items-center text-center gap-4 py-2">
                <CheckCircle className="w-10 h-10 text-green-500" />
                <div>
                  <p className="font-bold text-slate-800 text-lg">Your toolkit is ready.</p>
                </div>
                <a
                  href="/LangAccess_Strategic_Framework_v3.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  Download Toolkit
                </a>
                <p className="text-xs text-slate-400">
                  {emailSent
                    ? `Your toolkit has been sent to ${submittedEmail}.`
                    : 'A copy will also be sent to your email.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="toolkit-email" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Email address <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="toolkit-email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    maxLength={254}
                    placeholder="you@organization.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:bg-white focus:ring-2 ${emailError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200 focus:border-blue-400'}`}
                  />
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="toolkit-sector" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Sector <span className="text-slate-300">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      id="toolkit-sector"
                      value={sector}
                      onChange={e => setSector(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 pr-9 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                    >
                      <option value="">Select your sector</option>
                      {SECTORS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 active:scale-[0.98]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Get Free Toolkit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
