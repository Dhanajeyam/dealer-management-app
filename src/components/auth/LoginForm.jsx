import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginForm({ onSuccess, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in both email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (authError) {
        console.error('Supabase auth signin error:', authError)
        const msg = authError.message || authError.error_description || (typeof authError === 'string' ? authError : 'Invalid login credentials.')
        throw new Error(msg)
      }

      if (onSuccess) onSuccess(data.user)
    } catch (err) {
      const displayMsg = typeof err?.message === 'string' && err.message !== '{}' 
        ? err.message 
        : 'Invalid login credentials. Please check your email and password.'
      setError(displayMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Email Address
        </label>
        <div style={{ position: 'relative' }}>
          <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        marginTop: '-0.25rem'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: '#10b981', cursor: 'pointer' }}
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#10b981',
            fontSize: '0.85rem',
            fontWeight: '500',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          marginTop: '0.5rem',
          padding: '0.85rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-glow)',
          opacity: loading ? 0.7 : 1
        }}
      >
        <LogIn size={18} />
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
