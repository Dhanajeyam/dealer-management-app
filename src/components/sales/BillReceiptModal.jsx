import React from 'react'
import { X, Printer, CheckCircle2, Store, Calendar, User, Phone, MapPin, Tag, IndianRupee } from 'lucide-react'

export default function BillReceiptModal({ isOpen, onClose, saleData, shopProfile }) {
  if (!isOpen || !saleData) return null

  const {
    id: saleId,
    created_at,
    date,
    total_amount,
    farmer,
    farmers,
    sale_items = [],
    payments = []
  } = saleData

  const activeFarmer = farmer || farmers

  const formattedDate = new Date(created_at || date || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  const billNumber = `INV-${(saleId || '').substring(0, 8).toUpperCase()}`

  const grandTotal = Number(total_amount || 0)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const balanceDue = Math.max(0, grandTotal - totalPaid)

  let paymentStatusLabel = 'FULL PAYMENT'
  let statusBg = '#ecfdf5'
  let statusColor = '#047857'
  let statusBorder = '#a7f3d0'

  if (balanceDue > 0.01 && totalPaid > 0) {
    paymentStatusLabel = 'PARTIAL PAYMENT'
    statusBg = '#fffbeb'
    statusColor = '#b45309'
    statusBorder = '#fde68a'
  } else if (totalPaid <= 0.01 && grandTotal > 0) {
    paymentStatusLabel = 'CREDIT SALE'
    statusBg = '#fef2f2'
    statusColor = '#b91c1c'
    statusBorder = '#fecaca'
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Print CSS specific styles */}
      <style>{`
        @media print {
          /* Hide all elements on page by default */
          body * {
            visibility: hidden !important;
          }
          
          /* Reset modal wrapper containers during print so display:none is avoided */
          .modal-overlay-backdrop, 
          .modal-card-container, 
          .modal-body-container {
            position: static !important;
            display: block !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            backdrop-filter: none !important;
          }

          /* Make printable bill area and all its children visible */
          #printable-bill-area, 
          #printable-bill-area * {
            visibility: visible !important;
          }

          /* Position printable area at top left of page */
          #printable-bill-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
          }

          /* Hide explicit non-printable elements */
          .no-print {
            display: none !important;
          }

          .print-border {
            border: 1px solid #000 !important;
          }
          .print-text-dark {
            color: #000000 !important;
          }
          .print-bg-light {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>

      <div className="modal-overlay-backdrop" style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}>
        <div className="modal-card-container" style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface, #1e293b)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden'
        }}>
          {/* Modal Title & Actions */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-hover)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={24} color="var(--success)" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                  Sale Invoice &amp; Receipt
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Bill ID: {billNumber}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={handlePrint}
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.1rem',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Printer size={18} />
                Print Bill
              </button>
              <button
                onClick={onClose}
                className="no-print"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div className="modal-body-container" style={{ padding: '1.5rem', overflowY: 'auto' }}>
            <div id="printable-bill-area" style={{
              background: '#ffffff',
              color: 'var(--text-main)',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {/* Receipt Header */}
              {(() => {
                const hasGstin = Boolean(shopProfile?.gstin && shopProfile.gstin.trim())
                return (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '2px solid var(--primary)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                        {shopProfile?.shop_name || 'Agri-Chemical Distribution'}
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                        Authorized Dealer • Seeds, Fertilizers &amp; Pesticides
                      </p>
                      {shopProfile?.address && (
                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                          Address: {shopProfile.address}
                        </p>
                      )}
                      {shopProfile?.phone && (
                        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.1rem 0 0 0' }}>
                          Ph: {shopProfile.phone}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: hasGstin ? '#ecfdf5' : '#f1f5f9',
                        color: hasGstin ? '#047857' : '#334155',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        marginBottom: '0.3rem',
                        border: `1px solid ${hasGstin ? '#a7f3d0' : '#cbd5e1'}`
                      }}>
                        {hasGstin ? 'TAX INVOICE' : 'SALE BILL'}
                      </div>
                      {hasGstin && (
                        <div style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '700', marginBottom: '0.15rem' }}>
                          GSTIN: {shopProfile.gstin.trim().toUpperCase()}
                        </div>
                      )}
                      <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                        {billNumber}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {formattedDate}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Customer Details Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
                    Farmer / Customer:
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                    {activeFarmer?.name || 'Walk-in Customer'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {activeFarmer?.phone && (
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Phone: </span>{activeFarmer.phone}
                    </div>
                  )}
                  {activeFarmer?.village && (
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Village: </span>{activeFarmer.village}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchased Items Table */}
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '1.25rem',
                fontSize: '0.88rem'
              }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem 0.5rem', width: '5%', color: '#334155' }}>#</th>
                    <th style={{ padding: '0.6rem 0.5rem', color: '#334155' }}>Product &amp; Brand</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#334155' }}>Qty</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#334155' }}>Rate (₹)</th>
                    <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#334155' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {sale_items.map((item, index) => {
                    const qty = Number(item.qty || 0)
                    const price = Number(item.price_at_sale || 0)
                    const lineTotal = qty * price
                    return (
                      <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.6rem 0.5rem', color: '#64748b' }}>{index + 1}</td>
                        <td style={{ padding: '0.6rem 0.5rem' }}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.product_brand}</div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: '600' }}>
                          {qty} {item.unit || ''}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>
                          ₹{price.toFixed(2)}
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                          ₹{lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    )}
                  )}
                </tbody>
              </table>

              {/* Payment Summary Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Total Bill Amount:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>₹{grandTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Total Amount Paid:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#047857' }}>₹{totalPaid.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #cbd5e1',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>Balance Due:</span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      background: statusBg,
                      color: statusColor,
                      border: `1px solid ${statusBorder}`
                    }}>
                      {paymentStatusLabel}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: balanceDue > 0 ? '#b91c1c' : '#047857' }}>
                    ₹{balanceDue.toFixed(2)}
                  </span>
                </div>

                {payments.length > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #e2e8f0', fontSize: '0.78rem', color: '#64748b' }}>
                    <strong>Payment Entries Recorded:</strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.3rem' }}>
                      {payments.map((p, i) => (
                        <div key={p.id || i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>• {new Date(p.paid_at || Date.now()).toLocaleDateString('en-IN')} via {(p.payment_method || 'cash').toUpperCase()} {p.notes ? `(${p.notes})` : ''}</span>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>₹{Number(p.amount).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Receipt Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '2px solid #0f172a',
                paddingTop: '0.75rem',
                marginTop: '1rem'
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Thank you for your business!
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                  Authorized Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
