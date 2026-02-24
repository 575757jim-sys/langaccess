import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RequestLanguageFormProps {
  onClose?: () => void;
  standalone?: boolean;
}

const SECTORS = ['Healthcare', 'Education', 'Construction', 'Social Services', 'Legal', 'Other'];

export default function RequestLanguageForm({ onClose, standalone }: RequestLanguageFormProps) {
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [languageRequested, setLanguageRequested] = useState('');
  const [sector, setSector] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase
      .from('language_requests')
      .insert({
        name: name.trim(),
        organization: organization.trim(),
        language_requested: languageRequested.trim(),
        sector: sector,
      });

    setSubmitting(false);

    if (dbError) {
      setError('There was a problem submitting your request. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h4 className="text-xl font-bold text-green-800 mb-2">Request Submitted</h4>
        <p className="text-green-700 mb-4">
          Thank you. Your language request has been received. Our editorial team will review it and prioritize based on community need.
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-sm text-green-700 hover:text-green-900 underline"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={standalone ? 'bg-white rounded-2xl shadow-md p-8' : ''}>
      {standalone && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Request a Language</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Your Name <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Organization <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="County Health Department"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Language Requested <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={languageRequested}
            onChange={(e) => setLanguageRequested(e.target.value)}
            placeholder="e.g. Hmong, Armenian, Somali"
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Primary Sector <span className="text-red-500">*</span>
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 bg-white"
          >
            <option value="">Select a sector</option>
            {SECTORS.map((s) => (
              <option key={s} value={s.toLowerCase()}>{s}</option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
