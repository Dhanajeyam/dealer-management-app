import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getStoredTheme, setStoredTheme, getEffectiveTheme } from '../../lib/theme'
import { 
  Building2, 
  Store, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  ShieldCheck, 
  Mail, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  Laptop,
  Palette,
  QrCode
} from 'lucide-react'

export default function SettingsView({ profile, user, onProfileUpdated }) {
  // 1. Business Profile Form State
  const [shopName, setShopName] = useState(profile?.shop_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [address, setAddress] = useState(profile?.address || user?.user_metadata?.address || '')
  const [gstin, setGstin] = useState(profile?.gstin || user?.user_metadata?.gstin || '')
  const [upiId, setUpiId] = useState(profile?.upi_id || user?.user_metadata?.upi_id || '')

  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(null)
  const [profileError, setProfileError] = useState(null)

  useEffect(() => {
    if (profile) {
      setShopName(profile.shop_name || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || user?.user_metadata?.address || '')
      setGstin(profile.gstin || user?.user_metadata?.gstin || '')
      setUpiId(profile.upi_id || user?.user_metadata?.upi_id || '')
    }
  }, [profile, user])


  // 2. Password & Security State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass] = useState(false)

  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  // 3. Theme State
  const [themeSetting, setThemeSetting] = useState(() => getStoredTheme())
  const [effectiveTheme, setEffectiveTheme] = useState(() => getEffectiveTheme())

  const handleThemeChange = (newChoice) => {
    setThemeSetting(newChoice)
    setStoredTheme(newChoice)
    setEffectiveTheme(getEffectiveTheme(newChoice))
  }

  // Handle Business Profile Save
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSuccess(null)
    setProfileError(null)

    if (!shopName.trim()) {
      setProfileError('Shop Name cannot be empty.')
      return
    }

    const trimmedUpi = upiId.trim()
    const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

    if (trimmedUpi && !UPI_REGEX.test(trimmedUpi)) {
      setProfileError('Invalid UPI ID format. Must be in username@bank format (e.g. 9876543210@paytm or store@okicici).')
      return
    }

    setSavingProfile(true)
    try {
      const updates = {
        shop_name: shopName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        gstin: gstin.trim().toUpperCase(),
        upi_id: trimmedUpi
      }


      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      setProfileSuccess('Business profile updated successfully!')
      if (onProfileUpdated) onProfileUpdated()
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }


  // Handle Password Update with Security Verification
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPasswordSuccess(null)
    setPasswordError(null)

    if (!currentPassword) {
      setPasswordError('Please enter your current password to verify identity.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.')
      return
    }

    setUpdatingPassword(true)
    try {
      // 1. Re-authenticate user with current password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email,
        password: currentPassword
      })

      if (authError) {
        throw new Error('Current password is incorrect. Verification failed.')
      }

      // 2. Update password to newPassword
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      setPasswordSuccess('Account password successfully updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.')
    } finally {
      setUpdatingPassword(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* SECTION 1: BUSINESS PROFILE SETTINGS */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            border: '1px solid rgba(50, 214, 107, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Business Profile
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Shop credentials, contact info, and tax registration (GSTIN) shown on printed receipts
            </p>
          </div>
        </div>

        {profileError && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{profileError}</span>
          </div>
        )}

        {profileSuccess && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Shop / Store Name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Dharani Agro Store"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Store size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Contact Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              GSTIN Registration Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="e.g. 33AAAAA0000A1Z5"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase'
                }}
              />
              <FileText size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Store UPI ID (For QR Payments)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. 9876543210@paytm or shop@okicici"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <QrCode size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
            </div>
          </div>


          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Shop Address (Printed on Bills)
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete store address, village / town, pin code"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '1rem', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-new-sale"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
            >
              <Save size={18} />
              {savingProfile ? 'Saving...' : 'Save Business Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: ACCOUNT & SECURITY SETTINGS */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            border: '1px solid rgba(50, 214, 107, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Account &amp; Security
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Account email credentials and password re-authentication settings
            </p>
          </div>
        </div>

        {passwordError && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success)', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {/* Read-Only Account Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Registered Account Email (Display Only)
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <Mail size={18} color="var(--primary)" />
            <span>{user?.email || 'N/A'}</span>
          </div>
        </div>

        {/* Password Update Form */}
        <form onSubmit={handleUpdatePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Current Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Verify current password"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              New Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
              >
                {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Confirm New Password <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '10px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <KeyRound size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={updatingPassword}
              style={{
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                background: 'var(--primary)',
                border: 'none',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: updatingPassword ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px rgba(50, 214, 107, 0.28)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <KeyRound size={18} />
              {updatingPassword ? 'Updating...' : 'Update Security Password'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: THEME & APPEARANCE */}
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary-light)',
            border: '1px solid rgba(50, 214, 107, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Palette size={22} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Theme &amp; Appearance
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Choose application theme palette (Light, Dark, or System OS default) applied across all screens
            </p>
          </div>
        </div>

        {/* Theme Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          {/* Light Theme Button */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              border: themeSetting === 'light' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: themeSetting === 'light' ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
              color: themeSetting === 'light' ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: themeSetting === 'light' ? 'var(--primary)' : 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <Sun size={20} color={themeSetting === 'light' ? '#ffffff' : 'var(--text-muted)'} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Light Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Fresh high-contrast green</div>
            </div>
          </button>

          {/* Dark Theme Button */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              border: themeSetting === 'dark' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: themeSetting === 'dark' ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
              color: themeSetting === 'dark' ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: themeSetting === 'dark' ? 'var(--primary)' : 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <Moon size={20} color={themeSetting === 'dark' ? '#ffffff' : 'var(--text-muted)'} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Dark Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Deep forest night theme</div>
            </div>
          </button>

          {/* System Default Theme Button */}
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              border: themeSetting === 'system' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
              background: themeSetting === 'system' ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
              color: themeSetting === 'system' ? 'var(--primary)' : 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: themeSetting === 'system' ? 'var(--primary)' : 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-card)'
            }}>
              <Laptop size={20} color={themeSetting === 'system' ? '#ffffff' : 'var(--text-muted)'} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>System Auto</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Follow OS preference ({effectiveTheme})</div>
            </div>
          </button>

        </div>
      </div>

    </div>
  )
}
