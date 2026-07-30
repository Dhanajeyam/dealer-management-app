import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import { Sparkles, LogIn, UserPlus } from 'lucide-react'

export default function AuthCard({ onAuthSuccess }) {
  const [tab, setTab] = useState('login') // 'login' | 'signup'

  return (
    <div style={{
      maxWidth: '440px',
      width: '100%',
      margin: '0 auto'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
          Agri-Chemical Portal
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Multi-dealer stock & sales management platform
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        {/* Tab switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          padding: '0.35rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          marginBottom: '1.75rem'
        }}>
          <button
            onClick={() => setTab('login')}
            style={{
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background: tab === 'login' ? 'var(--bg-surface-hover)' : 'transparent',
              color: tab === 'login' ? '#10b981' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>

          <button
            onClick={() => setTab('signup')}
            style={{
              padding: '0.6rem',
              borderRadius: '9px',
              border: 'none',
              background: tab === 'signup' ? 'var(--bg-surface-hover)' : 'transparent',
              color: tab === 'signup' ? '#10b981' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <UserPlus size={16} /> Register Dealer
          </button>
        </div>

        {tab === 'login' ? (
          <LoginForm onSuccess={onAuthSuccess} />
        ) : (
          <SignupForm onSuccess={onAuthSuccess} />
        )}
      </div>

      {/* Admin Notice */}
      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Admins use the standard Sign In tab. Admin accounts are managed directly by platform administration.
      </div>
    </div>
  )
}
