import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Search, CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyCertificate } from '../utils/certPersistence';
import SEO from './SEO';

interface Props {
  onBack: () => void;
  initialCertId?: string;
}

type VerifyState = 'idle' | 'loading' | 'valid' | 'invalid' | 'error';

interface CertResult {
  userName: string;
  trackTitle: string;
  issuedAt: string;
}

export default function CertVerifyPage({ onBack, initialCertId = '' }: Props) {
  const [input, setInput] = useState(initialCertId);
  const [state, setState] = useState<VerifyState>('idle');
  const [result, setResult] = useState<CertResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const certId = input.trim().toUpperCase();
    if (!certId) return;

    setState('loading');
    setResult(null);

    const data = await verifyCertificate(certId);
    if (data === null) {
      setState('error');
    } else if (!data.valid) {
      setState('invalid');
    } else {
      setState('valid');
      setResult({
        userName: data.userName!,
        trackTitle: data.trackTitle!,
        issuedAt: data.issuedAt!,
      });
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <SEO
        title="Verify Certificate | LangAccess"
        description="Verify the authenticity of a LangAccess Professional Spanish Communication Certificate using its certificate ID."
        path="/verify"
      />

      <div className="sticky top-0 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Certificate Verification</h1>
            <p className="text-xs text-slate-500">Confirm the authenticity of a LangAccess certificate</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Verify a Certificate
          </h1>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            Enter a LangAccess certificate ID to confirm it was legitimately issued. Certificate IDs appear on the PDF in the format <span className="text-slate-300 font-mono text-sm">LA-2026-XXXXX</span>.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="bg-[#111827] rounded-2xl border border-white/10 p-8 mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Certificate ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="LA-2026-XXXXX"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-green-500/50 font-mono text-sm tracking-wider transition-colors"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={state === 'loading' || !input.trim()}
                className="px-5 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center gap-2"
              >
                {state === 'loading' ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Verify
              </button>
            </div>
          </form>

          {state === 'valid' && result && (
            <div className="bg-[#111827] rounded-2xl border border-green-500/30 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <p className="text-green-400 text-xs font-semibold tracking-widest uppercase mb-3">Certificate Valid</p>
              <h2 className="text-2xl font-bold text-white mb-1">{result.userName}</h2>
              <p className="text-slate-400 text-sm mb-5">
                Successfully completed the <span className="text-white font-medium">{result.trackTitle}</span> Track
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-500 text-xs mb-1">Track</p>
                  <p className="text-white text-sm font-medium">{result.trackTitle}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-slate-500 text-xs mb-1">Issued</p>
                  <p className="text-white text-sm font-medium">{formatDate(result.issuedAt)}</p>
                </div>
              </div>
              <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/5 text-left">
                <p className="text-slate-500 text-xs mb-1">Certificate ID</p>
                <p className="text-green-400 font-mono text-sm tracking-wider">{input.trim().toUpperCase()}</p>
              </div>
              <p className="text-slate-500 text-xs mt-6 leading-relaxed">
                This certificate was issued by LangAccess and is recorded in our database.
                It represents completion of all 5 modules in the {result.trackTitle} professional Spanish communication track.
              </p>
            </div>
          )}

          {state === 'invalid' && (
            <div className="bg-[#111827] rounded-2xl border border-red-500/30 p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-red-400 text-xs font-semibold tracking-widest uppercase mb-3">Not Found</p>
              <h2 className="text-xl font-bold text-white mb-2">Certificate Not Recognized</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                No certificate matching <span className="font-mono text-slate-300">{input.trim().toUpperCase()}</span> was found in our records.
                Please double-check the ID on the PDF and try again.
              </p>
              <p className="text-slate-500 text-xs mt-4">
                If you believe this is an error, contact <a href="mailto:hello@langaccess.org" className="text-green-400 hover:underline">hello@langaccess.org</a>
              </p>
            </div>
          )}

          {state === 'error' && (
            <div className="bg-[#111827] rounded-2xl border border-yellow-500/30 p-6 text-center">
              <p className="text-yellow-400 text-sm font-medium mb-1">Connection Error</p>
              <p className="text-slate-400 text-sm">Unable to reach the verification service. Please try again.</p>
            </div>
          )}

          <div className="mt-8 bg-[#111827] rounded-2xl border border-white/5 p-6">
            <h3 className="text-white font-semibold text-sm mb-3">How to find the Certificate ID</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 flex-shrink-0">1.</span>
                Open the PDF certificate downloaded from LangAccess
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 flex-shrink-0">2.</span>
                Locate the Certificate ID in the footer area of the certificate
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5 flex-shrink-0">3.</span>
                It follows the format <span className="font-mono text-slate-300">LA-2026-XXXXX</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
