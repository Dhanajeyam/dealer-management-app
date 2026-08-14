import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import { 
  X, 
  IndianRupee, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard, 
  Calendar,
  FileText,
  QrCode,
  Info
} from 'lucide-react'

export default function RecordPaymentModal({ sale, isOpen, onClose, shopProfile, onPaymentRecorded }) {

  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Calculate current paid and balance due
  const totalAmount = Number(sale?.total_amount || 0)
  const paymentsList = sale?.payments || []
  const totalPaid = paymentsList.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const balanceDue = Math.max(0, totalAmount - totalPaid)

  useEffect(() => {
    if (isOpen && sale) {
      // Pre-fill with full remaining balance due
      setAmount(balanceDue > 0 ? balanceDue.toString() : '')
      setPaymentMethod('cash')
      setNotes('')
      setError('')
    }
  }, [isOpen, sale])

  if (!isOpen || !sale) return null

  const farmerName = sale.farmer?.name || sale.farmers?.name || 'Walk-in / Direct Customer'
  const billId = `INV-${sale.id.substring(0, 8).toUpperCase()}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const payAmountNum = parseFloat(amount)
    if (isNaN(payAmountNum) || payAmountNum <= 0) {
      setError('Please enter a valid payment amount greater than zero.')
      return
    }

    if (payAmountNum > balanceDue + 0.01) { // 0.01 tolerance for floating point
      setError(`Payment amount (₹${payAmountNum.toFixed(2)}) cannot exceed remaining balance due (₹${balanceDue.toFixed(2)}).`)
      return
    }

    setSubmitting(true)
    try {
      // Try atomic RPC record_payment first
      const { data, error: rpcError } = await supabase.rpc('record_payment', {
        p_sale_id: sale.id,
        p_amount: payAmountNum,
        p_payment_method: paymentMethod,
        p_notes: notes.trim() || null
      })

      if (rpcError) {
        // Fallback to direct table insertion if RPC is not deployed in database yet
        console.warn('RPC record_payment failed, falling back to direct table insert:', rpcError.message)
        const user = (await supabase.auth.getUser()).data.user
        if (!user) throw new Error('Not authenticated')

        const { error: insertErr } = await supabase
          .from('payments')
          .insert({
            sale_id: sale.id,
            dealer_id: user.id,
            amount: payAmountNum,
            paid_at: new Date().toISOString(),
            payment_method: paymentMethod,
            notes: notes.trim() || null
          })

        if (insertErr) throw insertErr
      }

      if (onPaymentRecorded) {
        onPaymentRecorded()
      }
      onClose()
    } catch (err) {
      console.error('Error recording payment:', err)
      setError(err.message || 'Failed to record payment entry.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1600,
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
        background: 'var(--bg-surface, #1e293b)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <IndianRupee size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Record Payment
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {billId} • {farmerName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Sale Financial Breakdown Card */}
        <div style={{
          background: 'var(--bg-surface-hover)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Total Bill
            </div>
            <div style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.05rem', marginTop: '0.2rem' }}>
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Paid So Far
            </div>
            <div style={{ fontWeight: '800', color: 'var(--success)', fontSize: '1.05rem', marginTop: '0.2rem' }}>
              ₹{totalPaid.toFixed(2)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
              Balance Due
            </div>
            <div style={{ fontWeight: '800', color: balanceDue > 0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.05rem', marginTop: '0.2rem' }}>
              ₹{balanceDue.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Payment Amount Input */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Payment Amount to Collect (₹) <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: '800' }}>₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={balanceDue}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max ₹${balanceDue.toFixed(2)}`}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.2rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '1rem',
                  fontWeight: '700',
                  outline: 'none'
                }}
              />
            </div>
            {amount && parseFloat(amount) > 0 && parseFloat(amount) <= balanceDue && (
              <span style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.3rem', display: 'block' }}>
                New Balance Due after this payment: <strong>₹{(balanceDue - parseFloat(amount)).toFixed(2)}</strong>
              </span>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              <option value="cash" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>Cash</option>
              <option value="upi" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>UPI / GPay / PhonePe</option>
            </select>
          </div>

          {/* Dynamic In-Browser UPI QR Code Box */}
          {paymentMethod === 'upi' && (() => {
            const payNum = parseFloat(amount) || 0
            const dealerUpi = shopProfile?.upi_id?.trim() || ''
            const dealerName = shopProfile?.shop_name?.trim() || 'Agri Store'

            if (!dealerUpi) {
              return (
                <div style={{
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  color: 'var(--warning)',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem'
                }}>
                  <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-main)' }}>
                      UPI QR Payments Disabled
                    </strong>
                    Add your Store UPI ID in <strong>Settings &gt; Business Profile</strong> to generate scannable QR codes for customers.
                  </div>
                </div>
              )
            }

            const upiDeepLink = `upi://pay?pa=${dealerUpi}&pn=${encodeURIComponent(dealerName)}&am=${payNum.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Due Collection')}`

            return (
              <div style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.1rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.65rem'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <QrCode size={18} color="var(--primary)" /> Scan QR to Pay via UPI / GPay
                </div>

                <div style={{
                  background: '#ffffff',
                  padding: '10px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'inline-block'
                }}>
                  <QRCodeSVG value={upiDeepLink} size={160} level="M" />
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--primary)' }}>
                  Amount to Collect: ₹{payNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Payee UPI ID: <strong style={{ color: 'var(--text-main)' }}>{dealerUpi}</strong>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--warning)',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textAlign: 'left'
                }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>Convenience QR: Visually confirm payment receipt in your UPI app before recording.</span>
                </div>
              </div>
            )
          })()}


          {/* Optional Notes */}
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.4rem' }}>
              Notes / Transaction Ref (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UPI Ref #12345 or Cheque #9876"
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
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
              disabled={submitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balanceDue + 0.01}
              style={{
                flex: 1.5,
                padding: '0.75rem',
                borderRadius: '10px',
                background: submitting ? 'var(--bg-surface-hover)' : 'var(--primary)',
                border: 'none',
                color: '#fff',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: submitting ? 'wait' : 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              {submitting ? 'Saving Payment...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
