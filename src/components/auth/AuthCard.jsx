import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { Sparkles, LogIn, UserPlus } from 'lucide-react'

export default function AuthCard({ onAuthSuccess }) {
  const [view, setView] = useState('login') // 'login' | 'signup' | 'forgot_password'

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
        {/* Navigation Tabs (Only visible when not on forgot_password) */}
        {view !== 'forgot_password' && (
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
              onClick={() => setView('login')}
              style={{
                padding: '0.6rem',
                borderRadius: '9px',
                border: 'none',
                background: view === 'login' ? 'var(--bg-surface-hover)' : 'transparent',
                color: view === 'login' ? '#10b981' : 'var(--text-muted)',
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
              onClick={() => setView('signup')}
              style={{
                padding: '0.6rem',
                borderRadius: '9px',
                border: 'none',
                background: view === 'signup' ? 'var(--bg-surface-hover)' : 'transparent',
                color: view === 'signup' ? '#10b981' : 'var(--text-muted)',
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
        )}

        {view === 'login' && (
          <LoginForm
            onSuccess={onAuthSuccess}
            onForgotPassword={() => setView('forgot_password')}
          />
        )}

        {view === 'signup' && (
          <SignupForm onSuccess={onAuthSuccess} />
        )}

        {view === 'forgot_password' && (
          <ForgotPasswordForm onBackToLogin={() => setView('login')} />
        )}
      </div>
    </div>
  )
}
