import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { SESSION_STORAGE_KEY, getSessionId } from './utils/sessionId';
import './index.css';

try {
  const params = new URLSearchParams(window.location.search);
  const appSession = params.get('app_session');
  if (appSession) {
    localStorage.setItem(SESSION_STORAGE_KEY, appSession);
  }
  console.log('Using session_id:', getSessionId());
} catch { /* no-op */ }

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in document');

createRoot(rootEl).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
