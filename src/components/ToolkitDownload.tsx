import { useState } from 'react';
import { Download, Mail, CheckCircle, X, Loader2, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TOOLKIT_URL = '/LangAccess_Strategic_Framework_v3.pdf';

type Step = 'idle' | 'email-prompt' | 'saving' | 'done';

export default function ToolkitDownload() {
  const [step, setStep] = useState<Step>('idle');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  function openToolkit() {
    window.open(TOOLKIT_URL, '_blank');
  }

  function handleDownloadClick() {
    setStep('email-prompt');
    setEmail('');
    setEmailError('');
  }

  function handleSkip() {
    openToolkit();
    setStep('done');
  }

  async function handleSubmitEmail() {
    const trimmed = email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (trimmed) {
      setStep('saving');
      try {
        await supabase.from('email_captures').upsert(
          { email: trimmed, source: 'toolkit_download' },
          { onConflict: 'email' }
        );
      } catch {
        // silent — don't block the download
      }

      try {
        const { error: fnError } = await supabase.functions.invoke('send-toolkit-email', {
          body: { email: trimmed },
        });
        if (fnError) {
          console.error('send-toolkit-email: invoke error', fnError);
        }
      } catch (emailErr) {
        console.error('send-toolkit-email: fetch error', emailErr);
      }
    }

    openToolkit();
    setStep('done');
  }

  function handleClose() {
    setStep('idle');
    setEmail('');
    setEmailError('');
  }

  return (
    <section className="py-16 bg-slate-900 border-t border-slate-800">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1">Free Resource</p>
                <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">
                  Download the Language Access Toolkit
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  A practical guide for organizations implementing Title VI and California LEP language access programs. Includes policy templates, staff checklists, and compliance documentation.
                </p>

                {step === 'idle' && (
                  <button
                    onClick={handleDownloadClick}
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-600/25 hover:scale-[1.02] active:scale-[0.98] text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download Toolkit
                  </button>
                )}

                {(step === 'email-prompt' || step === 'saving') && (
                  <div className="bg-slate-700/60 border border-slate-600 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-200">
                        Get updates on new toolkit resources?
                      </p>
                      <button
                        onClick={handleClose}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">Optional — skip to download immediately.</p>

                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitEmail()}
                          placeholder="your@email.com (optional)"
                          disabled={step === 'saving'}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={handleSubmitEmail}
                        disabled={step === 'saving'}
                        className="inline-flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-60 flex-shrink-0"
                      >
                        {step === 'saving' ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                        ) : (
                          <><Download className="w-3.5 h-3.5" /> Download</>
                        )}
                      </button>
                    </div>

                    {emailError && (
                      <p className="text-xs text-red-400 mt-1">{emailError}</p>
                    )}

                    <button
                      onClick={handleSkip}
                      disabled={step === 'saving'}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2 mt-1"
                    >
                      Skip and download without email
                    </button>
                  </div>
                )}

                {step === 'done' && (
                  <div className="flex items-center gap-2.5 text-teal-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-semibold">Your toolkit request has been sent.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
