import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      isDev: import.meta.env.DEV 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#F5F0EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            padding: 24,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😞</div>
            <h2 style={{ 
              color: '#1A1512', 
              fontSize: 20, 
              fontWeight: 700,
              marginBottom: 8 
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              color: '#6B6258', 
              fontSize: 13,
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              We encountered an unexpected error. Please try reloading the page or contact support.
            </p>
            
            {this.state.isDev && (
              <div style={{
                background: '#FEE8E8',
                border: '1px solid #FCCFCF',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                textAlign: 'left',
                fontSize: 12,
                color: '#8B3D3D',
                maxHeight: 150,
                overflowY: 'auto',
                fontFamily: 'monospace'
              }}>
                {this.state.error?.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={this.reset}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#FF6B35',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#E0D9D0',
                  color: '#1A1512',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
