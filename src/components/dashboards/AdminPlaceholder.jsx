import React from 'react'
import { ShieldCheck, LogOut, Users, CheckCircle2, AlertCircle, Trophy, BarChart3 } from 'lucide-react'

export default function AdminPlaceholder({ profile, user, onSignOut }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 19, 32, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
          }}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              System Administration
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={12} /> Global Admin Access
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
          <button
            onClick={onSignOut}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={16} /> Admin Authenticated
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem', letterSpacing: '-0.015em' }}>
            Admin Dashboard (Coming in Step 9)
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            You are logged in as a platform Administrator. Dealer approvals, status management, drill-down sales oversight, and dealer leaderboards will be implemented in Step 9.
          </p>
        </div>

        {/* Feature Roadmap Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <Users size={28} color="#3b82f6" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dealer Management</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Approve pending dealer signups, edit dealer details, or block compromised accounts.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <BarChart3 size={28} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Sales Drill-Down</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              View revenue, transactions, and product metrics for any dealer on the platform.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <Trophy size={28} color="#f59e0b" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Platform Leaderboards</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Rank dealers by total revenue, top selling products, and active farmer coverage.
            </p>
          </div>
        </div>
      </main>

      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        Agri-Chemical Management App • Admin Role Active
      </footer>
    </div>
  )
}
