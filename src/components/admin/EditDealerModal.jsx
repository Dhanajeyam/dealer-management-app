import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { isValidGstin } from '../../lib/validation'
import { X, Building2, Phone, MapPin, FileText, ShieldCheck, AlertCircle, Save, Clock, Sparkles, Calendar } from 'lucide-react'

export default function EditDealerModal({ dealer, isOpen, onClose, onDealerUpdated }) {
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [status, setStatus] = useState('pending')
  const [isTrial, setIsTrial] = useState(true)
  const [trialEndsAt, setTrialEndsAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (dealer) {
      setShopName(dealer.shop_name || '')
      setPhone(dealer.phone || '')
      setAddress(dealer.address || '')
      setGstin(dealer.gstin || '')
      setStatus(dealer.status || 'pending')
      setIsTrial(Boolean(dealer.is_trial))

      if (dealer.trial_ends_at) {
        const d = new Date(dealer.trial_ends_at)
        const dateStr = d.toISOString().split('T')[0]
        setTrialEndsAt(dateStr)
      } else {
        // Default 7 days from now
        const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        setTrialEndsAt(d.toISOString().split('T')[0])
      }

      setError('')
    }
  }, [dealer])

  if (!isOpen || !dealer) return null

  const handleAddDays = (days) => {
    let baseDate = trialEndsAt ? new Date(trialEndsAt) : new Date()
    if (isNaN(baseDate.getTime()) || baseDate < new Date()) {
      baseDate = new Date()
    }
    const nextDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
    setTrialEndsAt(nextDate.toISOString().split('T')[0])
    setIsTrial(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!shopName.trim()) {
      setError('Shop name is required.')
      return
    }

    const cleanGstin = gstin.trim().toUpperCase()
    if (cleanGstin && !isValidGstin(cleanGstin)) {
      setError('Invalid GSTIN format. GSTIN must be 15 characters (e.g. 33ABCDE1234F1Z5).')
      return
    }

    setLoading(true)
    setError('')

    try {
      const cleanAddress = address.trim() || null
      const finalGstin = cleanGstin || null

      let finalTrialEndsAt = null
      if (isTrial && trialEndsAt) {
        finalTrialEndsAt = new Date(`${trialEndsAt}T23:59:59.999Z`).toISOString()
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          shop_name: shopName.trim(),
          phone: phone.trim() || null,
          address: cleanAddress,
          gstin: finalGstin,
          status: status,
          is_trial: isTrial,
          trial_ends_at: finalTrialEndsAt
        })
        .eq('id', dealer.id)

      if (updateErr) {
        console.warn('Full profiles update failed, trying core fields:', updateErr)
        const { error: fallbackErr } = await supabase
          .from('profiles')
          .update({
            shop_name: shopName.trim(),
            phone: phone.trim() || null,
            status: status
          })
          .eq('id', dealer.id)

        if (fallbackErr) throw fallbackErr
      }

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
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
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
            <Building2 size={22} color="var(--info)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Edit Dealer & Subscription
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
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
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
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
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
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                GSTIN Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33ABCDE1234F1Z5"
                maxLength={15}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  letterSpacing: '0.05em'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Shop Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Road, Erode, Tamil Nadu"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Account Approval Status
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
                color: 'var(--text-main)',
                fontSize: '0.9rem'
              }}
            >
              <option value="approved">Approved (Active Access)</option>
              <option value="pending">Pending Approval</option>
              <option value="blocked">Blocked (Access Revoked)</option>
            </select>
          </div>

          {/* Subscription / Free Trial Section */}
          <div style={{
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color={isTrial ? 'var(--warning)' : 'var(--primary)'} /> Subscription Model
              </span>
              <button
                type="button"
                onClick={() => setIsTrial(!isTrial)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: isTrial ? 'var(--warning-bg)' : 'var(--primary-light)',
                  color: isTrial ? 'var(--warning)' : 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {isTrial ? 'Free Trial Mode' : 'Paid / Permanent'}
              </button>
            </div>

            {isTrial ? (
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                  Trial Expiration Date
                </label>
                <input
                  type="date"
                  value={trialEndsAt}
                  onChange={(e) => setTrialEndsAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    marginBottom: '0.65rem'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick extend:</span>
                  <button
                    type="button"
                    onClick={() => handleAddDays(3)}
                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDays(7)}
                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddDays(14)}
                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                  >
                    +14 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTrial(false)}
                    style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'var(--primary-light)', border: '1px solid rgba(22,163,74,0.3)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', marginLeft: 'auto' }}
                  >
                    Make Paid
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} /> Permanent account with no expiration or access restrictions.
              </div>
            )}
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
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-glow)'
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
