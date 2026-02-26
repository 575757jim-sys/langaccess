import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UpdateToastProps {
  visible: boolean;
  onRefresh: () => void;
  onDismiss: () => void;
}

export default function UpdateToast({ visible, onRefresh, onDismiss }: UpdateToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(t);
    } else {
      setShow(false);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="flex items-center gap-3 bg-slate-900 text-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-700">
        <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">New Update Available.</span>
        <button
          onClick={onRefresh}
          className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap underline underline-offset-2"
        >
          Tap to Refresh
        </button>
        <button
          onClick={onDismiss}
          className="ml-1 text-slate-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
