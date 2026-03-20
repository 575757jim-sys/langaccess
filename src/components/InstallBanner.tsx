import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DISMISSED_KEY = 'langaccess_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (isInStandaloneMode()) return;
    if (window.innerWidth >= 768) return;

    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const handleAdd = async () => {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === 'accepted') {
        dismiss();
      }
    } else {
      const msg = isIos()
        ? 'On iPhone: tap the Share button then "Add to Home Screen"'
        : 'On Android: tap the menu then "Add to Home Screen"';
      alert(msg);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#0b0d0c',
        borderTop: '2px solid #2dff72',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
      }}
    >
      <img
        src="/icon-192.png"
        alt="LangAccess"
        style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#ffffff', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
          Add to Home Screen
        </p>
        <p style={{ color: '#6b7280', fontSize: 12, margin: 0, marginTop: 2, lineHeight: 1.4 }}>
          Access resources instantly, works offline
        </p>
      </div>

      <button
        onClick={handleAdd}
        style={{
          background: '#2dff72',
          color: '#0b0d0c',
          fontSize: 13,
          fontWeight: 700,
          border: 'none',
          borderRadius: 8,
          padding: '6px 14px',
          cursor: 'pointer',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        Add
      </button>

      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#6b7280',
          padding: 4,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
