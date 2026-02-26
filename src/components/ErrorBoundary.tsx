import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '2.5rem' }}>!</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0, maxWidth: '320px' }}>
            The app encountered an unexpected error. Please reload the page to try again.
          </p>
          {this.state.error && (
            <pre style={{
              fontSize: '0.7rem',
              color: '#64748b',
              background: '#1e293b',
              padding: '12px',
              borderRadius: '8px',
              maxWidth: '340px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              textAlign: 'left',
              margin: 0,
            }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '8px',
              padding: '10px 24px',
              backgroundColor: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
