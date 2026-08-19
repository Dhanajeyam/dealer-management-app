import React from 'react'
import { ShieldX, LogOut, Mail } from 'lucide-react'

export default function BlockedGate({ user, onSignOut }) {
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
        maxWidth: '480px',
        width: '100%',
        padding: 'clamp(1.25rem, 5vw, 2.25rem)',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #FEE2E2',
        boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '22px',
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)'
        }}>
          <ShieldX size={36} color="#DC2626" />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0F172A', marginBottom: '0.6rem', letterSpacing: '-0.015em' }}>
          Account Blocked
        </h2>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Your dealer account ({user?.email}) has been blocked by system administration. You currently do not have access to any platform features.
        </p>

        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '14px',
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          color: '#B91C1C',
          fontSize: '0.88rem',
          fontWeight: '600',
          marginBottom: '1.75rem',
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
  )
}
