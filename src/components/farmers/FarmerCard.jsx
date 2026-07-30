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
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="#10b981" />
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
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
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
          fontSize: '1.15rem',
          fontWeight: '800',
          color: '#fff',
          marginBottom: '0.65rem',
          lineHeight: '1.3'
        }}>
          {farmer.name}
        </h4>

        {/* Details Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
          {farmer.village ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af' }}>
              <MapPin size={14} color="#3b82f6" />
              <span>Village: <strong style={{ color: '#fff' }}>{farmer.village}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <MapPin size={14} />
              <span>Village not specified</span>
            </div>
          )}

          {farmer.phone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9ca3af' }}>
              <Phone size={14} color="#10b981" />
              <span>Phone: <strong style={{ color: '#fff' }}>{farmer.phone}</strong></span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)' }}>
              <Phone size={14} />
              <span>Phone not provided</span>
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
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          marginTop: '0.5rem'
        }}
      >
        <Eye size={14} color="#10b981" />
        View Profile &amp; History
      </button>
    </div>
  )
}
