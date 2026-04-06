import { useState } from 'react';
import { X, Star, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailCaptureModalProps {
  sector: string;
  phrase: string;
  onSave: (email: string) => void;
  onDismiss: () => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function EmailCaptureModal({ sector, phrase, onSave, onDismiss }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await supabase.from('email_captures').upsert(
        { email: trimmed, source: 'favorites_modal', sector, phrase },
        { onConflict: 'email', ignoreDuplicates: true }
      );
    } catch {
    } finally {
      setSaving(false);
    }
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 px-6 pt-6 pb-5">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <h2 className="text-white font-semibold text-base leading-tight">
              Save Your Favorite Phrases
            </h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Share your email and we'll keep you updated on new phrase packs and features. Your phrases are saved on this device.
          </p>
        </div>

        <div className="px-6 py-5 space-y-4 safe-bottom-padding">
          <div className="space-y-1.5">
            <label htmlFor="email-capture-input" className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="email-capture-input"
                type="email"
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={254}
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:bg-white focus:ring-2 ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-slate-200 focus:border-slate-400'}`}
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-medium text-sm py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Keep Me Updated
              </>
            )}
          </button>

          <button
            onClick={onDismiss}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
