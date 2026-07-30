import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { UserPlus, Mail, Lock, Store, Phone, AlertCircle, Info, ArrowLeft } from 'lucide-react'

export default function SignupForm({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!email || !password || !shopName || !phone) {
      setError('Please fill in all required fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')
    setIsRateLimited(false)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            shop_name: shopName.trim(),
            phone: phone.trim(),
            role: 'dealer'
          }
        }
      })

      if (authError) {
        if (authError.message?.toLowerCase().includes('rate limit')) {
          setIsRateLimited(true)
        }
        throw authError
      }

      const user = data.user
      if (user) {
        // Fallback explicit profile insertion to ensure profile exists
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role: 'dealer',
            shop_name: shopName.trim(),
            phone: phone.trim(),
            status: 'pending'
          }, { onConflict: 'id' })

        if (profileError && !profileError.message?.includes('duplicate key')) {
          console.warn('Profile upsert fallback warning:', profileError)
        }
      }

      if (onSuccess) onSuccess(user)
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.2rem' }}>
          Create Dealer Account
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Register your shop to get started
        </p>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '600' }}>{error}</span>
          </div>

          {isRateLimited && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#d1d5db',
              fontSize: '0.8rem',
              lineHeight: '1.5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: '600', marginBottom: '0.3rem' }}>
                <Info size={14} /> Supabase Rate Limit Notice:
              </div>
              In Supabase Dashboard -&gt; Authentication -&gt; Providers -&gt; Email, turn OFF "Confirm Email" to bypass signup rate limits.
            </div>
          )}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Shop / Business Name
        </label>
        <div style={{ position: 'relative' }}>
          <Store size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Greenfield Agro Supplies"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Phone Number
        </label>
        <div style={{ position: 'relative' }}>
          <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Email Address
        </label>
        <div style={{ position: 'relative' }}>
          <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="dealer@shop.com"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.75rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
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
        <UserPlus size={18} />
        {loading ? 'Creating Dealer Account...' : 'Register Dealer Account'}
      </button>

      {/* Already have an account divider & link */}
      <div style={{
        height: '1px',
        background: 'var(--border-color)',
        margin: '0.5rem 0 0.25rem 0'
      }} />

      <div style={{ textAlign: 'center' }}>
        <button
          type="button"
          onClick={onSwitchToLogin}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <ArrowLeft size={14} /> Already have an account? <span style={{ color: '#10b981', fontWeight: '600' }}>Sign In</span>
        </button>
      </div>
    </form>
  )
}
