import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { isValidGstin } from '../../lib/validation'
import { X, Store, Phone, MapPin, FileText, AlertCircle, Save } from 'lucide-react'

export default function DealerProfileModal({ profile, isOpen, onClose, onProfileUpdated }) {
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [gstin, setGstin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (profile) {
      setShopName(profile.shop_name || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '')
      setGstin(profile.gstin || '')
      setError('')
    }
  }, [profile])

  if (!isOpen || !profile) return null

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

      let updateErr = null
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            shop_name: shopName.trim(),
            phone: phone.trim() || null,
            address: cleanAddress,
            gstin: finalGstin
          })
          .eq('id', profile.id)

        updateErr = error
      } catch (err) {
        updateErr = err
      }

      if (updateErr) {
        console.warn('Profiles table schema column missing, using user metadata fallback:', updateErr)
        
        // Fallback: update existing columns on profiles table
        await supabase
          .from('profiles')
          .update({
            shop_name: shopName.trim(),
            phone: phone.trim() || null
          })
          .eq('id', profile.id)

        // Save address and gstin in auth user_metadata fallback
        const { error: userMetaErr } = await supabase.auth.updateUser({
          data: {
            shop_name: shopName.trim(),
            phone: phone.trim() || null,
            address: cleanAddress,
            gstin: finalGstin
          }
        })

        if (userMetaErr) {
          throw updateErr
        }
      }

      if (onProfileUpdated) onProfileUpdated()
      onClose()
    } catch (err) {
      console.error('Failed to update dealer profile:', err)
      setError(err.message || 'Failed to update profile settings.')
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
            <Store size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Shop Profile Settings
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
              Shop / Business Name *
            </label>
            <div style={{ position: 'relative' }}>
              <Store size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Shop Address <span style={{ color: 'var(--text-dim)', fontWeight: 'normal' }}>(Printed on bills)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Road, Erode, Tamil Nadu"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              GSTIN Number <span style={{ color: 'var(--text-dim)', fontWeight: 'normal' }}>(Enables TAX INVOICE branding)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33ABCDE1234F1Z5"
                maxLength={15}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
