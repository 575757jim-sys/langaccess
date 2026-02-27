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
          <div style={{ fontSize: '2.5rem' }}>&#9888;&#65039;</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>App Crash Detected</h1>
          {this.state.error && (
            <p style={{ color: '#fca5a5', fontSize: '0.9rem', margin: 0, maxWidth: '340px', fontWeight: 500 }}>
              Error: {this.state.error.message}
            </p>
          )}
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
            {this.state.error?.stack ?? 'No stack trace available'}
          </pre>
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
