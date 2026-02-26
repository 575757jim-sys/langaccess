import { useState, useEffect } from 'react';
import { X, Share } from 'lucide-react';

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    ('standalone' in window.navigator) &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const DISMISSED_KEY = 'langaccess_install_dismissed';

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isIos() && !isInStandaloneMode() && !localStorage.getItem(DISMISSED_KEY)) {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg font-black">L</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">Install LangAccess</p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            Tap{' '}
            <span className="inline-flex items-center gap-0.5 text-blue-400 font-medium">
              <Share className="w-3.5 h-3.5" />
              Share
            </span>
            {' '}then <span className="text-blue-400 font-medium">"Add to Home Screen"</span> for offline access.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
