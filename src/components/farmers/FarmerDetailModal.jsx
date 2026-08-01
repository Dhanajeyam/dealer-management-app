import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, User, Phone, MapPin, Calendar, ShoppingBag, Clock, Printer, FileText, IndianRupee, Tag } from 'lucide-react'

export default function FarmerDetailModal({ farmer, isOpen, onClose, onReprintBill }) {
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)

  useEffect(() => {
    if (isOpen && farmer?.id) {
      fetchFarmerSales(farmer.id)
    }
  }, [isOpen, farmer])

  const fetchFarmerSales = async (farmerId) => {
    setLoadingSales(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          sale_items (*)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (err) {
      console.error('Error fetching farmer sales:', err)
    } finally {
      setLoadingSales(false)
    }
  }

  if (!isOpen || !farmer) return null

  const formattedDate = farmer.created_at 
    ? new Date(farmer.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently added'

  const totalPurchasedAmount = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '580px',
        width: '100%',
        maxHeight: '90vh',
        padding: '2rem',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={24} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {farmer.name}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Farmer Customer Profile
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contact Info & Spending Box */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          fontSize: '0.88rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <Phone size={16} color="#10b981" />
            <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
            <strong style={{ marginLeft: 'auto' }}>{farmer.phone || 'Not provided'}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <MapPin size={16} color="#3b82f6" />
            <span style={{ color: 'var(--text-muted)' }}>Village:</span>
            <strong style={{ marginLeft: 'auto' }}>{farmer.village || 'Not specified'}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
            <Calendar size={16} color="#f59e0b" />
            <span style={{ color: 'var(--text-muted)' }}>Registered On:</span>
            <strong style={{ marginLeft: 'auto' }}>{formattedDate}</strong>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#fff',
            borderTop: '1px dashed rgba(255, 255, 255, 0.1)',
            paddingTop: '0.6rem',
            marginTop: '0.1rem'
          }}>
            <IndianRupee size={16} color="#10b981" />
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Total Purchased Amount:</span>
            <strong style={{ marginLeft: 'auto', color: '#10b981', fontSize: '1.05rem', fontWeight: '800' }}>
              ₹{totalPurchasedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </div>
        </div>

        {/* Purchase History Section */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="#10b981" />
              <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                Purchase History ({sales.length})
              </h4>
            </div>
          </div>

          {loadingSales ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading purchase history...
            </div>
          ) : sales.length === 0 ? (
            <div style={{
              padding: '2rem 1.25rem',
              borderRadius: '14px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px dashed var(--border-color)',
              textAlign: 'center'
            }}>
              <Clock size={28} color="var(--text-dim)" style={{ marginBottom: '0.6rem' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#fff', marginBottom: '0.3rem' }}>
                No Purchase History Yet
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px', margin: '0 auto' }}>
                Recorded sales and bill transaction history for {farmer.name} will appear here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {sales.map(s => {
                const saleDate = new Date(s.created_at).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })
                const billId = `INV-${s.id.substring(0, 8).toUpperCase()}`
                const items = s.sale_items || []

                // Primary product title
                const primaryProductText = items.length > 0
                  ? items.map(item => `${item.product_name} (${item.product_brand})`).join(', ')
                  : 'Purchased Products'

                return (
                  <div
                    key={s.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem'
                    }}
                  >
                    {/* Header Row: Product Names & Total Amount + Reprint */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                          {primaryProductText}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            color: '#38bdf8',
                            fontWeight: '600',
                            fontSize: '0.72rem'
                          }}>
                            {billId}
                          </span>
                          <span>• {saleDate}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <div style={{ fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>
                          ₹{Number(s.total_amount).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (onReprintBill) {
                              onReprintBill({
                                ...s,
                                farmer: farmer
                              })
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.4rem 0.7rem',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34d399',
                            fontWeight: '600',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Printer size={14} /> Reprint
                        </button>
                      </div>
                    </div>

                    {/* Itemized Line Items Detail List */}
                    {items.length > 0 && (
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.22)',
                        borderRadius: '8px',
                        padding: '0.6rem 0.8rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        border: '1px dashed rgba(255, 255, 255, 0.08)'
                      }}>
                        {items.map((item, idx) => {
                          const itemTotal = Number(item.qty || 0) * Number(item.price_at_sale || 0)
                          return (
                            <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                              <span style={{ color: '#e2e8f0' }}>
                                • <strong style={{ color: '#fff' }}>{item.product_name}</strong> ({item.product_brand}) × {item.qty} {item.unit}
                              </span>
                              <span style={{ color: '#a7f3d0', fontWeight: '600', marginLeft: '0.5rem' }}>
                                ₹{itemTotal.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem' }}>(₹{Number(item.price_at_sale).toFixed(2)}/{item.unit})</span>
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  )
}
