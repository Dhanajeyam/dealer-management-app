import React from 'react'
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('CRITICAL UNHANDLED APPLICATION ERROR:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-primary, #0b1320)',
          color: '#fff',
          fontFamily: "var(--font-family, 'Inter', sans-serif)"
        }}>
          <div className="glass-card" style={{
            maxWidth: '560px',
            width: '100%',
            padding: '2.5rem',
            borderRadius: '20px',
            background: 'rgba(30, 41, 59, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.015em' }}>
              Application Encountered an Error
            </h2>

            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              An unexpected error occurred. The application stopped rendering to prevent data corruption. Click below to reload.
            </p>

            <button
              onClick={this.handleReload}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                marginBottom: '1rem'
              }}
            >
              <RefreshCw size={18} /> Reload Application
            </button>

            {/* Expandable Technical Diagnostic Details */}
            <div style={{ marginTop: '1rem', textAlign: 'left' }}>
              <button
                type="button"
                onClick={this.toggleDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  margin: '0 auto'
                }}
              >
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {this.state.showDetails ? 'Hide Error Diagnostic' : 'Show Technical Error Diagnostic'}
              </button>

              {this.state.showDetails && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: '#f87171',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  <strong>{this.state.error?.toString()}</strong>
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
