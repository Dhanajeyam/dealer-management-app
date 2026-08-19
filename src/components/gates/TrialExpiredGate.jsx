import React, { useState } from 'react'
import { Hourglass, RefreshCw, LogOut, Store, Mail, Sparkles } from 'lucide-react'

export default function TrialExpiredGate({ profile, user, onRefresh, onSignOut }) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    if (onRefresh) await onRefresh()
    setTimeout(() => setRefreshing(false), 500)
  }

  const trialEndDateStr = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        padding: 'clamp(1.25rem, 5vw, 2.25rem)',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        {/* Animated Hourglass / Expired Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.25)'
        }}>
          <Hourglass size={36} color="#DC2626" className="status-pulse" />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.015em' }}>
          Your Free Trial Has Ended
        </h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Your 7-day free trial period has concluded. To continue accessing your stock inventory, 15-second billing, and farmer credit ledger, please contact the platform administrator to activate your account.
        </p>

        {/* Account Info Details Box */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#0F172A', fontWeight: '600' }}>
              <Store size={18} color="#16A34A" />
              <span style={{ fontSize: '0.95rem' }}>{profile?.shop_name || 'Dealer Shop'}</span>
            </div>
            <span style={{
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              fontSize: '0.72rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Trial Expired
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748B' }}>
            <Mail size={15} />
            <span>{user?.email}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <span>Trial Ended:</span>
            <strong style={{ color: '#0F172A' }}>{trialEndDateStr}</strong>
          </div>
        </div>

        {/* Support Callout */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '14px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          fontSize: '0.85rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          textAlign: 'left'
        }}>
          <Sparkles size={18} color="#16A34A" style={{ flexShrink: 0 }} />
          <span>
            Ready to upgrade? Email <strong>support@chemicalshop.in</strong> or speak with your system administrator to unlock permanent access.
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              flex: 1,
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: '#16A34A',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'status-pulse' : ''} />
            {refreshing ? 'Checking Status...' : 'Check Activation Status'}
          </button>

          <button
            onClick={onSignOut}
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
