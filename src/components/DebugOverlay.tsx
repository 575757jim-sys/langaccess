import { useState, useEffect, useRef } from 'react';
import { X, Bug } from 'lucide-react';

interface LogEntry {
  message: string;
  timestamp: string;
}

const MAX_LOGS = 10;
const logBuffer: LogEntry[] = [];
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(fn => fn());
}

function timestamp() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`;
}

function formatArgs(args: unknown[]): string {
  return args.map(a => {
    if (a instanceof Error) return `${a.name}: ${a.message}`;
    if (typeof a === 'object' && a !== null) {
      try { return JSON.stringify(a); } catch { return String(a); }
    }
    return String(a);
  }).join(' ');
}

(function patchConsole() {
  const orig = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    orig(...args);
    const entry: LogEntry = { message: formatArgs(args), timestamp: timestamp() };
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOGS) logBuffer.shift();
    notify();
  };
  const origWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    origWarn(...args);
    const entry: LogEntry = { message: `[warn] ${formatArgs(args)}`, timestamp: timestamp() };
    logBuffer.push(entry);
    if (logBuffer.length > MAX_LOGS) logBuffer.shift();
    notify();
  };
})();

window.addEventListener('error', (e) => {
  const entry: LogEntry = {
    message: `[uncaught] ${e.message} @ ${e.filename}:${e.lineno}`,
    timestamp: timestamp()
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
  notify();
});

window.addEventListener('unhandledrejection', (e) => {
  const entry: LogEntry = {
    message: `[promise] ${e.reason instanceof Error ? e.reason.message : String(e.reason)}`,
    timestamp: timestamp()
  };
  logBuffer.push(entry);
  if (logBuffer.length > MAX_LOGS) logBuffer.shift();
  notify();
});

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([...logBuffer]);
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handler = () => setLogs([...logBuffer]);
    listenerRef.current = handler;
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '16px',
          zIndex: 9999,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#1e293b',
          border: '2px solid #475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        }}
        aria-label="Open debug overlay"
      >
        <Bug size={22} color="#94a3b8" />
        {logs.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            fontSize: '10px',
            fontWeight: 700,
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}>
            {logs.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'monospace',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #334155',
            flexShrink: 0,
          }}>
            <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 700 }}>
              Debug Console ({logs.length} entries)
            </span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => { logBuffer.length = 0; setLogs([]); }}
                style={{
                  background: 'none',
                  border: '1px solid #475569',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} color="#94a3b8" />
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            {logs.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                No errors logged yet.
              </p>
            ) : (
              logs.map((log, i) => (
                <div key={i} style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  borderLeft: '3px solid #ef4444',
                }}>
                  <div style={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}>
                    {log.timestamp}
                  </div>
                  <div style={{
                    color: '#fca5a5',
                    fontSize: '12px',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {log.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
