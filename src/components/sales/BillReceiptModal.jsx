import React, { useState, useEffect } from 'react'
import { X, Printer, CheckCircle2, Store, Calendar, User, Phone, MapPin, Tag, IndianRupee, Share2, Download, Loader2, Check } from 'lucide-react'
import { shareOrDownloadBillPdf, canSharePdfFile } from '../../utils/generateBillPdf'

export default function BillReceiptModal({ isOpen, onClose, saleData, shopProfile }) {
  const [canShare, setCanShare] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  useEffect(() => {
    setCanShare(canSharePdfFile())
  }, [])

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

  const hasGstin = Boolean(shopProfile?.gstin && shopProfile.gstin.trim())
  const documentTitle = hasGstin ? 'Tax Invoice' : 'Sale Bill'

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

  const handleShareOrDownload = async () => {
    setIsGenerating(true)
    setFeedbackMsg('')
    try {
      const result = await shareOrDownloadBillPdf(saleData, shopProfile)
      if (result.downloaded) {
        setFeedbackMsg('Downloaded!')
        setTimeout(() => setFeedbackMsg(''), 3000)
      } else if (result.shared) {
        setFeedbackMsg('Shared!')
        setTimeout(() => setFeedbackMsg(''), 3000)
      }
    } catch (err) {
      console.error('Failed to generate/share PDF:', err)
      setFeedbackMsg('Failed to share')
      setTimeout(() => setFeedbackMsg(''), 3000)
    } finally {
      setIsGenerating(false)
    }
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
            font-family: var(--font-family, 'Inter', sans-serif) !important;
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
        padding: '0.5rem',
        overflowY: 'auto'
      }}>
        <div className="modal-card-container" style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: 'min(94vh, 760px)',
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
            padding: '0.85rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            background: 'var(--bg-surface-hover)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <CheckCircle2 size={22} color="var(--success)" style={{ flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {documentTitle} &amp; Receipt
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Bill ID: {billNumber}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* WhatsApp Share / PDF Download Action */}
              <button
                onClick={handleShareOrDownload}
                disabled={isGenerating}
                className="no-print"
                title={canShare ? 'Share genuine PDF bill via WhatsApp' : 'Download clean text-based PDF bill'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '9px',
                  background: canShare ? '#16a34a' : 'var(--bg-card, #334155)',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  border: canShare ? '1px solid #22c55e' : '1px solid var(--border-color)',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  opacity: isGenerating ? 0.75 : 1,
                  boxShadow: canShare ? '0 2px 8px rgba(22, 163, 74, 0.35)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="spin-animation" />
                    <span>Creating PDF...</span>
                  </>
                ) : feedbackMsg ? (
                  <>
                    <Check size={14} />
                    <span>{feedbackMsg}</span>
                  </>
                ) : canShare ? (
                  <>
                    <Share2 size={14} />
                    <span>Share via WhatsApp</span>
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    <span>Download PDF</span>
                  </>
                )}
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="no-print"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '9px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Printer size={14} />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="no-print"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div className="modal-body-container" style={{ padding: '0.85rem', overflowY: 'auto' }}>
            <div id="printable-bill-area" style={{
              background: '#ffffff',
              color: 'var(--text-main)',
              padding: '1.25rem 1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontFamily: 'var(--font-family)'
            }}>
              {/* Receipt Header */}
              {(() => {
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
                      <div style={{ marginBottom: '0.25rem' }}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          letterSpacing: '0.04em',
                          color: hasGstin ? '#15803d' : '#475569',
                          background: hasGstin ? '#ecfdf5' : '#f1f5f9',
                          border: `1px solid ${hasGstin ? '#a7f3d0' : '#cbd5e1'}`,
                          padding: '0.12rem 0.45rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {hasGstin ? 'TAX INVOICE' : 'SALE BILL'}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--primary)', margin: 0, letterSpacing: '-0.01em' }}>
                        {shopProfile?.shop_name || 'Agri-Chemical Distribution'}
                      </h2>
                      {shopProfile?.address && (
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                          {shopProfile.address}
                        </div>
                      )}
                      {shopProfile?.phone && (
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.1rem' }}>
                          Phone: {shopProfile.phone}
                        </div>
                      )}
                      {hasGstin && (
                        <div style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: '600', marginTop: '0.15rem' }}>
                          GSTIN: {shopProfile.gstin}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        background: statusBg,
                        color: statusColor,
                        border: `1px solid ${statusBorder}`,
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {paymentStatusLabel}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem' }}>
                        Date: {formattedDate}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Farmer Info Box */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.75rem 0.85rem',
                marginBottom: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
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
                <div style={{ textAlign: 'left' }}>
                  {activeFarmer?.phone && (
                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Phone: </span>{activeFarmer.phone}
                    </div>
                  )}
                  {activeFarmer?.village && (
                    <div style={{ fontSize: '0.82rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Village: </span>{activeFarmer.village}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchased Items Table in Responsive Container */}
              <div className="responsive-table-container" style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  minWidth: '300px',
                  borderCollapse: 'collapse',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem'
                }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0.4rem', width: '5%', color: '#334155' }}>#</th>
                      <th style={{ padding: '0.5rem 0.4rem', color: '#334155' }}>Product &amp; Brand</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'right', color: '#334155' }}>Qty</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'right', color: '#334155' }}>Rate (₹)</th>
                      <th style={{ padding: '0.5rem 0.4rem', textAlign: 'right', color: '#334155' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale_items.map((item, index) => {
                      const qty = Number(item.qty || 0)
                      const price = Number(item.price_at_sale || 0)
                      const lineTotal = qty * price
                      return (
                        <tr key={item.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.5rem 0.4rem', color: '#64748b' }}>{index + 1}</td>
                          <td style={{ padding: '0.5rem 0.4rem' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{item.product_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.product_brand}</div>
                          </td>
                          <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontWeight: '600' }}>
                            {qty} {item.unit || ''}
                          </td>
                          <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right' }}>
                            ₹{price.toFixed(2)}
                          </td>
                          <td style={{ padding: '0.5rem 0.4rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>
                            ₹{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    )}
                  </tbody>
                </table>
              </div>

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
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Total Bill Amount:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>₹{grandTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Total Amount Paid:</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#047857' }}>₹{totalPaid.toFixed(2)}</span>
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
                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#0f172a' }}>Balance Due:</span>
                    <span style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '600',
                      background: statusBg,
                      color: statusColor,
                      border: `1px solid ${statusBorder}`
                    }}>
                      {paymentStatusLabel}
                    </span>
                  </div>
                  <span style={{ fontSize: '1.2rem', fontWeight: '700', color: balanceDue > 0 ? '#b91c1c' : '#047857' }}>
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
