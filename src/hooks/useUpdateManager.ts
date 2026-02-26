import { useState, useEffect, useCallback, useRef } from 'react';

export function useUpdateManager() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const autoApplyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerSkipWaiting = useCallback((reg: ServiceWorkerRegistration) => {
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  const scheduleAutoApply = useCallback((reg: ServiceWorkerRegistration) => {
    if (autoApplyTimer.current) clearTimeout(autoApplyTimer.current);
    autoApplyTimer.current = setTimeout(() => {
      triggerSkipWaiting(reg);
    }, 4000);
    setUpdateAvailable(true);
  }, [triggerSkipWaiting]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        setRegistration(reg);

        if (reg.waiting) {
          if (!navigator.serviceWorker.controller) {
            triggerSkipWaiting(reg);
          } else {
            scheduleAutoApply(reg);
          }
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (!navigator.serviceWorker.controller) {
                triggerSkipWaiting(reg);
              } else {
                scheduleAutoApply(reg);
              }
            }
          });
        });
      })
      .catch(() => {});

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return () => {
      if (autoApplyTimer.current) clearTimeout(autoApplyTimer.current);
    };
  }, [scheduleAutoApply, triggerSkipWaiting]);

  const applyUpdate = useCallback(() => {
    if (autoApplyTimer.current) clearTimeout(autoApplyTimer.current);
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      window.location.reload();
      return;
    }
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.update();
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
          window.location.reload();
        }
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }, []);

  return { updateAvailable, applyUpdate, checkForUpdates };
}
