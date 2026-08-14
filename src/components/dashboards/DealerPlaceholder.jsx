import React from 'react'
import { Store, LogOut, Package, Users, ShoppingCart, BarChart3, CheckCircle2 } from 'lucide-react'

export default function DealerPlaceholder({ profile, user, onSignOut }) {
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Store size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              {profile?.shop_name || 'Dealer Workspace'}
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={12} /> Approved Dealer Account
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
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} /> Step 4 Complete: Authenticated & Approved
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>
            Dealer Dashboard (Coming in Steps 5–8)
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Your account is verified and authenticated. Inventory stock management, farmer records, cart billing, and revenue analytics will be added in upcoming steps.
          </p>
        </div>

        {/* Feature Modules Roadmap Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <Package size={28} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Stock Inventory</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Add/edit agri-chemical inventory grouped by brand, with quantity adjustments.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <Users size={28} color="#3b82f6" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Farmer Directory</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Manage customer farmer profiles, contact info, and village purchase histories.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <ShoppingCart size={28} color="#f59e0b" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Sales & Billing</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Quick cart checkout with automatic stock deduction and WiFi bill printing.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', opacity: 0.7 }}>
            <BarChart3 size={28} color="#a855f7" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Analytics Dashboard</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Revenue totals (day/week/month), top selling products, and low stock warnings.
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
        Agri-Chemical Dealer Portal • Approved Dealer Session Active
      </footer>
    </div>
  )
}
