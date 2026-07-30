import React from 'react'
import { ShieldX, LogOut, Mail } from 'lucide-react'

export default function BlockedGate({ user, onSignOut }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(30, 20, 20, 0.95) 0%, rgba(50, 20, 20, 0.8) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.3)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldX size={36} color="#ef4444" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
          Account Blocked
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Your dealer account ({user?.email}) has been blocked by system administration. You currently do not have access to any platform features.
        </p>

        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          fontSize: '0.85rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Mail size={16} /> Contact platform support to request account unblocking.
        </div>

        <button
          onClick={onSignOut}
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '12px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            color: '#fff',
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
  )
}
