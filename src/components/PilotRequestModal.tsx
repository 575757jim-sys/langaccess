import { useState } from 'react';
import { X, Compass, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

const SECTORS = [
  'Healthcare',
  'Education',
  'Construction',
  'Community Outreach',
  'Government / Compliance',
];

const STAFF_SIZES = ['1–10', '11–50', '51–200', '200+'];

interface FormState {
  organization: string;
  sector: string;
  staff_size: string;
  name: string;
  email: string;
  message: string;
}

const EMPTY: FormState = {
  organization: '',
  sector: '',
  staff_size: '',
  name: '',
  email: '',
  message: '',
};

export default function PilotRequestModal({ onClose }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.schema('public').from('pilot_requests').insert({
        organization: form.organization.trim(),
        sector: form.sector,
        staff_size: form.staff_size,
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      }, { count: 'exact' });

      if (dbError) throw new Error(dbError.message);

      fetch('/.netlify/functions/send-pilot-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: form.organization.trim(),
          sector: form.sector,
          staff_size: form.staff_size,
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      }).catch(() => {});

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-base leading-tight">Request Institutional Pilot</h2>
              <p className="text-slate-400 text-xs">Multi-team deployments &amp; compliance integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 safe-bottom-padding">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Request received.</h3>
                <p className="text-slate-500 text-sm mt-1">We'll be in touch within 1 business day.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valley Health District"
                  value={form.organization}
                  onChange={set('organization')}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Sector <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.sector}
                  onChange={set('sector')}
                  className={inputClass}
                >
                  <option value="" disabled>Select sector…</option>
                  {SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Approximate Staff Size <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.staff_size}
                  onChange={set('staff_size')}
                  className={inputClass}
                >
                  <option value="" disabled>Select size…</option>
                  {STAFF_SIZES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={set('name')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@org.com"
                    value={form.email}
                    onChange={set('email')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Message <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your needs, timeline, or any questions…"
                  value={form.message}
                  onChange={set('message')}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-md"
              >
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
