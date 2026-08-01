import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Building2, Phone, ShieldCheck, AlertCircle, Save } from 'lucide-react'

export default function EditDealerModal({ dealer, isOpen, onClose, onDealerUpdated }) {
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (dealer) {
      setShopName(dealer.shop_name || '')
      setPhone(dealer.phone || '')
      setStatus(dealer.status || 'pending')
      setError('')
    }
  }, [dealer])

  if (!isOpen || !dealer) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!shopName.trim()) {
      setError('Shop name is required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          shop_name: shopName.trim(),
          phone: phone.trim() || null,
          status: status
        })
        .eq('id', dealer.id)

      if (updateErr) throw updateErr

      if (onDealerUpdated) onDealerUpdated()
      onClose()
    } catch (err) {
      console.error('Failed to update dealer:', err)
      setError(err.message || 'Failed to update dealer profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1500,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={22} color="#3b82f6" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              Edit Dealer Details
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Shop / Business Name
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="approved">Approved (Active Access)</option>
              <option value="pending">Pending Approval</option>
              <option value="blocked">Blocked (Access Revoked)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.7rem',
                borderRadius: '10px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
