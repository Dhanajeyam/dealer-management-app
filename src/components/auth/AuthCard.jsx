import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import { Sparkles, ArrowLeft } from 'lucide-react'

export default function AuthCard({ onAuthSuccess, initialView }) {
  const [view, setView] = useState(() => {
    if (initialView) return initialView
    const params = new URLSearchParams(window.location.search)
    return params.get('mode') === 'signup' ? 'signup' : 'login'
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'signup') {
      setView('signup')
    }
  }, [])

  return (
    <div style={{
      maxWidth: '440px',
      width: '100%',
      margin: '0 auto'
    }}>
      {/* Back to Home Navigation Link */}
      <div style={{ marginBottom: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontWeight: '500',
            textDecoration: 'none',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            transition: 'color 0.2s'
          }}
        >
          <ArrowLeft size={14} /> Back to Website
        </Link>
      </div>

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem', letterSpacing: '-0.015em' }}>
          Agri-Chemical Portal
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Multi-dealer stock & sales management platform
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="glass-card" style={{ padding: 'clamp(1.25rem, 5vw, 2rem)' }}>
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
