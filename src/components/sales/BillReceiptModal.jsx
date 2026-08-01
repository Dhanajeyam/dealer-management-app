import React from 'react'
import { X, Printer, CheckCircle2, Store, Calendar, User, Phone, MapPin, Tag } from 'lucide-react'

export default function BillReceiptModal({ isOpen, onClose, saleData, shopProfile }) {
  if (!isOpen || !saleData) return null

  const {
    id: saleId,
    created_at,
    date,
    total_amount,
    farmer,
    sale_items = []
  } = saleData

  const formattedDate = new Date(created_at || date || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  const billNumber = `INV-${(saleId || '').substring(0, 8).toUpperCase()}`

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
          {/* Modal Header */}
          <div className="no-print" style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={24} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  Sale Invoice & Receipt
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
                  background: '#10b981',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
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
              color: '#1e293b',
              padding: '1.75rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
              {/* Receipt Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #10b981',
                paddingBottom: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#065f46', margin: 0, letterSpacing: '-0.02em' }}>
                    {shopProfile?.shop_name || 'Agri-Chemical Distribution'}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0.2rem 0 0 0' }}>
                    Authorized Dealer • Seeds, Fertilizers & Pesticides
                  </p>
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
                    background: '#ecfdf5',
                    color: '#047857',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    marginBottom: '0.3rem',
                    border: '1px solid #a7f3d0'
                  }}>
                    TAX INVOICE
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>
                    {billNumber}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.1rem' }}>
                    {formattedDate}
                  </div>
                </div>
              </div>

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
                    {farmer?.name || 'Walk-in Customer'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {farmer?.phone && (
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Phone: </span>{farmer.phone}
                    </div>
                  )}
                  {farmer?.village && (
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <span style={{ color: '#64748b' }}>Village: </span>{farmer.village}
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
                    <th style={{ padding: '0.6rem 0.5rem', color: '#334155' }}>Product & Brand</th>
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
                    )
                  })}
                </tbody>
              </table>

              {/* Total Summary */}
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
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginRight: '1rem' }}>
                    Grand Total:
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#047857' }}>
                    ₹{Number(total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
