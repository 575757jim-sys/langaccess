import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Lock, AlertCircle, CheckCircle2, Clock, SkipForward, Eye } from 'lucide-react';

type CampaignKey = 'first_win' | 'day3_nudge';

interface Summary {
  campaign: CampaignKey;
  total: number;
  sent: number;
  pending: number;
  skipped: number;
  opened: number;
  open_rate: number;
}

interface Recent {
  id: string;
  campaign: CampaignKey;
  email: string;
  track_id: string;
  track_title: string;
  scheduled_at: string;
  sent_at: string | null;
  skipped_at: string | null;
  opened_at: string | null;
}

interface StatsResponse {
  summary: Summary[];
  recent: Recent[];
  generated_at: string;
}

const TOKEN_KEY = 'langaccess_admin_token';

function CampaignLabel({ campaign }: { campaign: CampaignKey }) {
  const isFirstWin = campaign === 'first_win';
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
        isFirstWin
          ? 'bg-green-500/15 text-green-400 border border-green-500/30'
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      }`}
    >
      {isFirstWin ? 'Day 7 · First Win' : 'Day 3 · Nudge'}
    </span>
  );
}

function StatusPill({ row }: { row: Recent }) {
  if (row.opened_at) {
    return (
      <span className="inline-flex items-center gap-1 text-sky-400 text-xs font-semibold">
        <Eye className="w-3 h-3" /> Opened
      </span>
    );
  }
  if (row.sent_at) {
    return (
      <span className="inline-flex items-center gap-1 text-green-400 text-xs font-semibold">
        <CheckCircle2 className="w-3 h-3" /> Sent
      </span>
    );
  }
  if (row.skipped_at) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-semibold">
        <SkipForward className="w-3 h-3" /> Skipped
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function AdminEmailsPage() {
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [tokenInput, setTokenInput] = useState<string>('');
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async (tk: string) => {
    if (!tk) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-email-stats`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token: tk }),
      });
      if (res.status === 401) {
        setError('Invalid admin token.');
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
        setToken('');
        setData(null);
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        setError(`Error ${res.status}: ${text}`);
        return;
      }
      const json = (await res.json()) as StatsResponse;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStats(token);
  }, [token]);

  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) return;
    try { localStorage.setItem(TOKEN_KEY, clean); } catch { /* ignore */ }
    setToken(clean);
  };

  const handleSignOut = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken('');
    setData(null);
    setTokenInput('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmitToken}
          className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <h1 className="text-xl font-bold">Admin Sign-In</h1>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Enter the LangAccess admin token to view lifecycle email scheduling and open rates.
          </p>
          <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
            Admin Token
          </label>
          <input
            type="password"
            autoFocus
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 mb-4"
            placeholder="paste token"
          />
          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300 text-xs leading-relaxed">{error}</p>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-slate-950 font-bold py-3 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Lifecycle Emails</h1>
              <p className="text-xs text-slate-400">Scheduling & open rates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchStats(token)}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {data?.summary?.map((s) => (
            <div
              key={s.campaign}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <CampaignLabel campaign={s.campaign} />
                <span className="text-xs text-slate-500">
                  {s.campaign === 'first_win' ? 'Sent 7 days after enrollment' : 'Sent 3 days after enrollment (skipped if module 1 done)'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Total</p>
                  <p className="text-2xl font-bold">{s.total}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Sent</p>
                  <p className="text-2xl font-bold text-green-400">{s.sent}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-400">{s.pending}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Skipped</p>
                  <p className="text-2xl font-bold text-slate-400">{s.skipped}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Opens</p>
                  <p className="text-2xl font-bold text-sky-400">{s.opened}</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-400 font-semibold">Open rate</span>
                  <span className="text-xs text-sky-400 font-bold">{s.open_rate.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, s.open_rate)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          {!data?.summary && !loading && (
            <div className="col-span-full text-center py-12 text-slate-500">
              No data yet.
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">Recent activity</h2>
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Campaign</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recipient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Track</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent || []).map((row) => (
                    <tr key={`${row.campaign}-${row.id}`} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap"><CampaignLabel campaign={row.campaign} /></td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{row.email}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{row.track_title || row.track_id}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(row.scheduled_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusPill row={row} /></td>
                    </tr>
                  ))}
                  {(!data?.recent || data.recent.length === 0) && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                        No scheduled emails yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {data?.generated_at && (
            <p className="text-xs text-slate-600 mt-3 text-right">
              Updated {formatDate(data.generated_at)}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
