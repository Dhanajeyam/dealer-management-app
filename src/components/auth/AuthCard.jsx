import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { Sparkles } from 'lucide-react'

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
      <div className="glass-card" style={{ padding: '2.25rem 2rem' }}>
        {view === 'login' && (
          <LoginForm
            onSuccess={onAuthSuccess}
            onForgotPassword={() => setView('forgot_password')}
            onSwitchToSignup={() => setView('signup')}
          />
        )}

        {view === 'signup' && (
          <SignupForm
            onSuccess={onAuthSuccess}
            onSwitchToLogin={() => setView('login')}
          />
        )}

        {view === 'forgot_password' && (
          <ForgotPasswordForm
            onBackToLogin={() => setView('login')}
          />
        )}
      </div>
    </div>
  )
}
