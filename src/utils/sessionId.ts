const SESSION_KEY = 'langaccess_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    console.log('[sessionId] generated new session_id:', id);
  }
  return id;
}

export function adoptSessionIdFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get('app_session');
    if (!incoming) return null;
    const current = localStorage.getItem(SESSION_KEY);
    if (current !== incoming) {
      localStorage.setItem(SESSION_KEY, incoming);
      console.log('[sessionId] adopted session_id from URL:', incoming, 'previous:', current);
    } else {
      console.log('[sessionId] URL session_id matches stored value:', incoming);
    }
    return incoming;
  } catch (e) {
    console.warn('[sessionId] adoptSessionIdFromUrl failed:', e);
    return null;
  }
}
