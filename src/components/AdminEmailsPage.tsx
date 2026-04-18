import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Lock, AlertCircle, CheckCircle2, Clock, SkipForward, Eye, CalendarClock, ShieldAlert, XCircle } from 'lucide-react';

type CampaignKey = 'first_win' | 'day3_nudge';

interface Summary {
  campaign: CampaignKey;
  total: number;
  sent: number;
  pending: number;
  skipped: number;
  opened: number;
  bounced: number;
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
  bounced_at: string | null;
}

interface Upcoming {
  id: string;
  campaign: CampaignKey;
  email: string;
  track_title: string;
  track_id: string;
  scheduled_at: string;
}

interface Suppression {
  email: string;
  reason: string;
  bounce_type: string | null;
  created_at: string;
}

interface StatsResponse {
  summary: Summary[];
  recent: Recent[];
  upcoming: Upcoming[];
  upcoming_window_hours: number;
  suppressions: Suppression[];
  suppressions_total: number;
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
  if (row.bounced_at) {
    return (
      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
        <XCircle className="w-3 h-3" /> Bounced
      </span>
    );
  }
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
    return (
      d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return iso;
  }
}

function formatRelative(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMin = Math.round((then - now) / 60000);
    if (diffMin < 0) return 'overdue';
    if (diffMin < 60) return `in ${diffMin}m`;
    const h = Math.round(diffMin / 60);
    if (h < 24) return `in ${h}h`;
    const d = Math.round(h / 24);
    return `in ${d}d`;
  } catch {
    return '';
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

  const upcomingByCampaign = {
    first_win: (data?.upcoming || []).filter((u) => u.campaign === 'first_win'),
    day3_nudge: (data?.upcoming || []).filter((u) => u.campaign === 'day3_nudge'),
  };

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
              <p className="text-xs text-slate-400">Scheduling, open rates & suppressions</p>
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

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.summary?.map((s) => (
            <div
              key={s.campaign}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <CampaignLabel campaign={s.campaign} />
                <span className="text-xs text-slate-500">
                  {s.campaign === 'first_win'
                    ? 'Sent 7 days after enrollment'
                    : 'Sent 3 days after enrollment (skipped if module 1 done)'}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                <Stat label="Total" value={s.total} />
                <Stat label="Sent" value={s.sent} tone="green" />
                <Stat label="Pending" value={s.pending} tone="amber" />
                <Stat label="Skipped" value={s.skipped} tone="slate" />
                <Stat label="Opens" value={s.opened} tone="sky" />
                <Stat label="Bounced" value={s.bounced} tone="red" />
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
            <div className="col-span-full text-center py-12 text-slate-500">No data yet.</div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
              Scheduled in the next 24 hours
            </h2>
            <span className="text-xs text-slate-600">
              · {(data?.upcoming || []).length} queued
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UpcomingPanel
              title="Day 7 · First Win"
              items={upcomingByCampaign.first_win}
              tone="green"
            />
            <UpcomingPanel
              title="Day 3 · Nudge"
              items={upcomingByCampaign.day3_nudge}
              tone="amber"
            />
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold mb-4">
            Recent activity
          </h2>
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
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-semibold">
              Suppressed addresses
            </h2>
            <span className="text-xs text-slate-600">
              · {data?.suppressions_total || 0} total
            </span>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            {(data?.suppressions || []).length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500 text-sm">
                No suppressed addresses. Bounced and complained emails will appear here and be auto-skipped on future sends.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03] border-b border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.suppressions || []).map((s) => (
                      <tr key={s.email} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{s.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                            {s.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{s.bounce_type || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(s.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {data?.generated_at && (
            <p className="text-xs text-slate-600 mt-4 text-right">
              Updated {formatDate(data.generated_at)}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'white',
}: {
  label: string;
  value: number;
  tone?: 'white' | 'green' | 'amber' | 'slate' | 'sky' | 'red';
}) {
  const colorClass =
    tone === 'green' ? 'text-green-400' :
    tone === 'amber' ? 'text-amber-400' :
    tone === 'slate' ? 'text-slate-400' :
    tone === 'sky' ? 'text-sky-400' :
    tone === 'red' ? 'text-red-400' :
    'text-white';
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

function UpcomingPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: Upcoming[];
  tone: 'green' | 'amber';
}) {
  const accent =
    tone === 'green'
      ? 'border-green-500/25 bg-green-500/5'
      : 'border-amber-500/25 bg-amber-500/5';
  return (
    <div className={`rounded-2xl border ${accent} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-xs text-slate-400 font-semibold">{items.length} queued</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500 py-6 text-center">Nothing scheduled for the next 24 hours.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{u.email}</p>
                <p className="text-xs text-slate-500 truncate">
                  {u.track_title || u.track_id}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-300 font-semibold">
                  {formatRelative(u.scheduled_at)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {new Date(u.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
