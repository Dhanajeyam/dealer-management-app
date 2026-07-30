import React from 'react'
import { X, User, Phone, MapPin, Calendar, ShoppingBag, Clock } from 'lucide-react'

export default function FarmerDetailModal({ farmer, isOpen, onClose }) {
  if (!isOpen || !farmer) return null

  const formattedDate = farmer.created_at 
    ? new Date(farmer.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently added'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        background: 'var(--bg-surface)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={24} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {farmer.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Farmer Customer Profile
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contact Info Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.9rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <Phone size={16} color="#10b981" />
            <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
            <strong style={{ marginLeft: 'auto' }}>{farmer.phone || 'Not provided'}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <MapPin size={16} color="#3b82f6" />
            <span style={{ color: 'var(--text-muted)' }}>Village:</span>
            <strong style={{ marginLeft: 'auto' }}>{farmer.village || 'Not specified'}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <Calendar size={16} color="#f59e0b" />
            <span style={{ color: 'var(--text-muted)' }}>Registered On:</span>
            <strong style={{ marginLeft: 'auto' }}>{formattedDate}</strong>
          </div>
        </div>

        {/* Purchase History Section (Placeholder for Step 7) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <ShoppingBag size={18} color="#10b981" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              Purchase History
            </h4>
          </div>

          <div style={{
            padding: '2rem 1.25rem',
            borderRadius: '14px',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px dashed var(--border-color)',
            textAlign: 'center'
          }}>
            <Clock size={28} color="var(--text-dim)" style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', marginBottom: '0.3rem' }}>
              No Purchase History Yet
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto', lineHeight: '1.4' }}>
              Recorded sales and bill transaction history for {farmer.name} will automatically appear here once Step 7 (Sales &amp; Billing) is implemented.
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ marginTop: '1.75rem', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
