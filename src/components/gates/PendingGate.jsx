import React, { useState } from 'react'
import { Clock, RefreshCw, LogOut, Store, Phone, Mail } from 'lucide-react'

export default function PendingGate({ profile, user, onRefresh, onSignOut }) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    if (onRefresh) await onRefresh()
    setTimeout(() => setRefreshing(false), 500)
  }

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
        {/* Animated Clock / Pending Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: '#FEF3C7',
          border: '1px solid #FCD34D',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.25)'
        }}>
          <Clock size={36} color="#D97706" className="status-pulse" />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.015em' }}>
          Account Pending Approval
        </h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Your dealer registration has been submitted successfully. An administrator will review and approve your account within 24 hours.
        </p>

        {/* Account Info Details Box */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#0F172A', fontWeight: '700' }}>
            <Store size={18} color="#16A34A" />
            <span style={{ fontSize: '0.95rem' }}>{profile?.shop_name || 'Dealer Shop'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748B' }}>
            <Mail size={16} />
            <span>{user?.email}</span>
          </div>
          {profile?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748B' }}>
              <Phone size={16} />
              <span>{profile.phone}</span>
            </div>
          )}
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
            {refreshing ? 'Checking Approval...' : 'Check Approval Status'}
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
