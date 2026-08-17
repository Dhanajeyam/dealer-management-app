import React from 'react'
import { User, Phone, MapPin, Edit3, Trash2, Eye } from 'lucide-react'

export default function FarmerCard({ farmer, onView, onEdit, onDelete }) {
  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderRadius: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '1rem'
    }}>
      {/* Top Header: Avatar + Actions */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            border: '1px solid rgba(45, 90, 39, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => onEdit(farmer)}
              title="Edit Farmer"
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '8px',
                padding: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(farmer)}
              title="Delete Farmer"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                borderRadius: '8px',
                padding: '0.35rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Farmer Name */}
        <h4 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: 'var(--text-main)',
          marginBottom: '0.65rem',
          lineHeight: '1.3'
        }}>
          {farmer.name}
        </h4>

        {/* Details Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
          {farmer.village ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <MapPin size={14} color="var(--accent)" />
              <span>Village: <strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{farmer.village}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <MapPin size={14} />
              <span>Village not specified</span>
            </div>
          )}

          {farmer.phone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Phone size={14} color="var(--primary)" />
              <span>Phone: <strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{farmer.phone}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <Phone size={14} />
              <span>Phone not provided</span>
            </div>
          )}

          {Number(farmer.outstanding_balance || 0) > 0 && (
            <div style={{
              marginTop: '0.3rem',
              padding: '0.35rem 0.6rem',
              borderRadius: '8px',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '0.78rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              width: 'fit-content'
            }}>
              Credit Due: ₹{Number(farmer.outstanding_balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Button: View Profile */}
      <button
        onClick={() => onView(farmer)}
        style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: '10px',
          background: 'var(--bg-surface-hover)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          fontSize: '0.85rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginTop: '0.5rem',
          transition: 'all 0.2s'
        }}
      >
        <Eye size={15} /> View Purchase History
      </button>
    </div>
  )
}
