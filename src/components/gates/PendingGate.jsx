import React, { useState } from 'react'
import { Clock, RefreshCw, LogOut, Store, Phone, Mail, ShieldAlert } from 'lucide-react'

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
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(19, 31, 51, 0.95) 0%, rgba(27, 42, 69, 0.8) 100%)'
      }}>
        {/* Animated Clock / Pending Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.2)'
        }}>
          <Clock size={36} color="#f59e0b" className="status-pulse" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
          Account Pending Approval
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Your dealer registration has been submitted successfully. An administrator will review and approve your account within 24 hours.
        </p>

        {/* Account Info Details Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '1.25rem',
          textAlign: 'left',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <Store size={16} color="#10b981" />
            <span style={{ fontWeight: '600' }}>{profile?.shop_name || 'Dealer Shop'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
            <Mail size={16} />
            <span>{user?.email}</span>
          </div>
          {profile?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
              <Phone size={16} />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              flex: 1,
              padding: '0.8rem 1.25rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: '600',
              cursor: refreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'status-pulse' : ''} />
            {refreshing ? 'Checking Approval...' : 'Check Approval Status'}
          </button>

          <button
            onClick={onSignOut}
            style={{
              padding: '0.8rem 1.25rem',
              borderRadius: '12px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontWeight: '600',
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
