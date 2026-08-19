import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  ShoppingBag, 
  Clock, 
  Printer, 
  FileText, 
  IndianRupee, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Filter, 
  RotateCcw,
  Sparkles,
  CreditCard
} from 'lucide-react'
import RecordPaymentModal from '../sales/RecordPaymentModal'

export default function FarmerDetailModal({ farmer, isOpen, onClose, shopProfile, onReprintBill }) {
  const [sales, setSales] = useState([])
  const [loadingSales, setLoadingSales] = useState(false)
  const [expandedSales, setExpandedSales] = useState({})
  const [activePaymentSale, setActivePaymentSale] = useState(null)

  // Scoped Search & Date Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [datePreset, setDatePreset] = useState('ALL') // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'SPECIFIC' | 'RANGE'
  const [specificDate, setSpecificDate] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const toggleExpandSale = (saleId) => {
    setExpandedSales(prev => ({
      ...prev,
      [saleId]: !prev[saleId]
    }))
  }

  useEffect(() => {
    if (isOpen && farmer?.id) {
      setSearchQuery('')
      setDatePreset('ALL')
      setSpecificDate('')
      setFromDate('')
      setToDate('')
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
          sale_items (*),
          payments (*)
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

  // Filter Calculation Logic
  const getFilteredSales = () => {
    let result = [...sales]

    // 1. Scoped Search Filter (Product Name, Brand Name, or Invoice ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(s => {
        const billId = `inv-${s.id.substring(0, 8)}`.toLowerCase()
        const invoiceMatch = billId.includes(q)
        const itemMatch = (s.sale_items || []).some(item => 
          (item.product_name && item.product_name.toLowerCase().includes(q)) ||
          (item.product_brand && item.product_brand.toLowerCase().includes(q))
        )
        return invoiceMatch || itemMatch
      })
    }

    // 2. Date Filter
    const now = new Date()

    if (datePreset === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      result = result.filter(s => new Date(s.created_at).getTime() >= startOfDay)
    } else if (datePreset === 'WEEK') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - 7)
      startOfWeek.setHours(0, 0, 0, 0)
      result = result.filter(s => new Date(s.created_at).getTime() >= startOfWeek.getTime())
    } else if (datePreset === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
      result = result.filter(s => new Date(s.created_at).getTime() >= startOfMonth)
    } else if (datePreset === 'SPECIFIC') {
      if (specificDate) {
        const startOfDay = new Date(`${specificDate}T00:00:00`).getTime()
        const endOfDay = new Date(`${specificDate}T23:59:59`).getTime()
        result = result.filter(s => {
          const t = new Date(s.created_at).getTime()
          return t >= startOfDay && t <= endOfDay
        })
      }
    } else if (datePreset === 'RANGE') {
      if (fromDate) {
        const fromTime = new Date(`${fromDate}T00:00:00`).getTime()
        result = result.filter(s => new Date(s.created_at).getTime() >= fromTime)
      }
      if (toDate) {
        const toTime = new Date(`${toDate}T23:59:59`).getTime()
        result = result.filter(s => new Date(s.created_at).getTime() <= toTime)
      }
    }

    return result
  }

  const filteredSales = getFilteredSales()
  const isFilterActive = datePreset !== 'ALL' || Boolean(searchQuery.trim()) || Boolean(specificDate) || Boolean(fromDate) || Boolean(toDate)
  const totalPurchasedAmount = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const filteredTotalAmount = filteredSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)

  const totalOutstandingAmount = sales.reduce((sum, s) => {
    const paid = (s.payments || []).reduce((pSum, p) => pSum + Number(p.amount || 0), 0)
    return sum + Math.max(0, Number(s.total_amount || 0) - paid)
  }, 0)

  const getFilterLabel = () => {
    if (datePreset === 'TODAY') return 'Total for Today'
    if (datePreset === 'WEEK') return 'Total for This Week'
    if (datePreset === 'MONTH') return 'Total for This Month'
    if (datePreset === 'SPECIFIC') {
      if (!specificDate) return 'Total for Selected Date'
      const dt = new Date(`${specificDate}T00:00:00`)
      return `Total for ${dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    if (datePreset === 'RANGE') return 'Total for Date Range'
    if (searchQuery.trim()) return `Filtered Total (${filteredSales.length} of ${sales.length} purchases)`
    return 'Total Filtered Spend'
  }

  return (
    <div className="farmer-profile-modal-overlay">
      <div className="glass-card farmer-profile-modal-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <User size={26} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                {farmer.name}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Farmer Customer Profile
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Profile"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Body (2-Column Grid on Desktop / Stacked on Mobile) */}
        <div className="farmer-profile-modal-body">
          {/* Left Column / Sidebar: Contact Info & Spending Stats */}
          <div className="farmer-info-sidebar" style={{
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '0.9rem',
            height: 'fit-content'
          }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Customer Details
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
              <Phone size={17} color="var(--primary)" />
              <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
              <strong style={{ marginLeft: 'auto', color: 'var(--text-main)', fontWeight: '500' }}>{farmer.phone || 'Not provided'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
              <MapPin size={17} color="var(--accent)" />
              <span style={{ color: 'var(--text-muted)' }}>Village:</span>
              <strong style={{ marginLeft: 'auto', color: 'var(--text-main)', fontWeight: '500' }}>{farmer.village || 'Not specified'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
              <Calendar size={17} color="var(--warning)" />
              <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
              <strong style={{ marginLeft: 'auto', color: 'var(--text-main)', fontWeight: '500' }}>{formattedDate}</strong>
            </div>

            {/* Total Lifetime Spending Badge */}
            <div style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500' }}>
                All-Time Purchased Value
              </span>
              <span style={{ color: 'var(--primary)', fontSize: '1.35rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                ₹{totalPurchasedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Outstanding Credit Badge */}
            <div style={{
              background: totalOutstandingAmount > 0 ? 'var(--danger-bg)' : 'var(--primary-light)',
              border: `1px solid ${totalOutstandingAmount > 0 ? 'var(--danger-border)' : 'var(--border-color)'}`,
              borderRadius: '12px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '500' }}>
                Pending Credit Balance
              </span>
              <span style={{ color: totalOutstandingAmount > 0 ? 'var(--danger)' : 'var(--primary)', fontSize: '1.35rem', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
                ₹{totalOutstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Right Column / Main Area: Purchase History Feed */}
          <div className="farmer-history-main" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={19} color="var(--primary)" />
                <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                  Purchase History ({filteredSales.length})
                </h4>
              </div>
            </div>

            {/* Controls Bar: Scoped Product Search & Date Preset Pills */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1rem',
              flexShrink: 0
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.65rem'
              }}>
                {/* Search Input Box */}
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 0 }}>
                  <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product or brand in history..."
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.85rem 0.5rem 2.3rem',
                      borderRadius: '10px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Date Preset Pills */}
                <div className="farmer-filter-pills-row">
                  {[
                    { key: 'ALL', label: 'All Time' },
                    { key: 'TODAY', label: 'Today' },
                    { key: 'WEEK', label: 'This Week' },
                    { key: 'MONTH', label: 'This Month' },
                    { key: 'SPECIFIC', label: 'Specific Date' },
                    { key: 'RANGE', label: 'Date Range' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setDatePreset(p.key)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: datePreset === p.key ? 'var(--primary)' : 'var(--border-color)',
                        background: datePreset === p.key ? 'var(--primary-light)' : 'var(--bg-surface)',
                        color: datePreset === p.key ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Date Picker Input */}
              {datePreset === 'SPECIFIC' && (
                <div className="farmer-date-input-group" style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Select Date:</span>
                    <input
                      type="date"
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Custom Date Range Pickers (From / To) */}
              {datePreset === 'RANGE' && (
                <div className="farmer-date-input-group" style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>From:</span>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>To:</span>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Dynamic Filtered Total Banner */}
            {isFilterActive && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                marginBottom: '0.85rem',
                flexShrink: 0,
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500' }}>
                    {getFilterLabel()}:
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--primary)' }}>
                    ₹{filteredTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    ({filteredSales.length} {filteredSales.length === 1 ? 'entry' : 'entries'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDatePreset('ALL')
                    setSearchQuery('')
                    setSpecificDate('')
                    setFromDate('')
                    setToDate('')
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--danger)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <RotateCcw size={13} /> Clear Filter
                </button>
              </div>
            )}

            {loadingSales ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Loading purchase history...
              </div>
            ) : filteredSales.length === 0 ? (
              <div style={{
                padding: '3rem 1.5rem',
                borderRadius: '16px',
                background: 'var(--bg-surface-hover)',
                border: '1px dashed var(--border-color)',
                textAlign: 'center'
              }}>
                <Clock size={32} color="var(--text-dim)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  No Purchases Match Your Filter
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto 1rem auto' }}>
                  {isFilterActive 
                    ? 'No sales records match your selected product search or date filter.' 
                    : `Recorded sales and bill transaction history for ${farmer.name} will appear here.`}
                </div>
                {isFilterActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setDatePreset('ALL')
                      setSearchQuery('')
                      setSpecificDate('')
                      setFromDate('')
                      setToDate('')
                    }}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--primary)',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <RotateCcw size={14} /> Clear Active Filter
                  </button>
                )}
              </div>
            ) : (
              <div className="farmer-sales-list">
                {filteredSales.map(s => {
                  const saleDate = new Date(s.created_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                  const billId = `INV-${s.id.substring(0, 8).toUpperCase()}`
                  const items = s.sale_items || []
                  const isExpanded = Boolean(expandedSales[s.id])
                  const itemCountText = `${items.length} ${items.length === 1 ? 'item' : 'items'}`
                  const formattedTotal = Number(s.total_amount || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })

                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: '14px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'visible',
                        maxHeight: 'none'
                      }}
                    >
                      {/* Header Row: Bill ID · Item Count · Total Amount */}
                      <div 
                        className="farmer-purchase-header"
                        onClick={() => toggleExpandSale(s.id)}
                        title={isExpanded ? 'Click to hide items' : 'Click to view items'}
                      >
                        <div>
                          {(() => {
                            const totalBill = Number(s.total_amount || 0)
                            const payments = s.payments || []
                            const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
                            const balanceDue = Math.max(0, totalBill - totalPaid)
                            
                            let badgeLabel = 'Paid'
                            let badgeBg = 'var(--success-bg)'
                            let badgeColor = 'var(--success)'
                            let badgeBorder = 'var(--success-border)'

                            if (balanceDue > 0.01 && totalPaid > 0) {
                              badgeLabel = `Partial • Due ₹${balanceDue.toFixed(2)}`
                              badgeBg = 'var(--warning-bg)'
                              badgeColor = 'var(--warning)'
                              badgeBorder = 'var(--warning-border)'
                            } else if (totalPaid <= 0.01 && totalBill > 0) {
                              badgeLabel = `Credit Sale • Due ₹${balanceDue.toFixed(2)}`
                              badgeBg = 'var(--credit-bg)'
                              badgeColor = 'var(--credit)'
                              badgeBorder = 'var(--credit-border)'
                            }

                            return (
                              <div style={{
                                fontWeight: '600',
                                color: 'var(--text-main)',
                                fontSize: '0.98rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{
                                  background: 'var(--info-bg)',
                                  border: '1px solid var(--info-border)',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '6px',
                                  color: 'var(--info)',
                                  fontSize: '0.78rem',
                                  fontWeight: '500'
                                }}>
                                  {billId}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>•</span>
                                <span style={{ color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: '500' }}>
                                  {itemCountText}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>•</span>
                                <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.05rem' }}>
                                  ₹{formattedTotal}
                                </span>

                                <span style={{
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '16px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  background: badgeBg,
                                  color: badgeColor,
                                  border: `1px solid ${badgeBorder}`
                                }}>
                                  {badgeLabel}
                                </span>
                              </div>
                            )
                          })()}

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} color="var(--text-muted)" />
                            <span>{saleDate}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Record Payment, Reprint & Expand Toggle Button */}
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {(() => {
                            const totalBill = Number(s.total_amount || 0)
                            const payments = s.payments || []
                            const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
                            const balanceDue = Math.max(0, totalBill - totalPaid)
                            if (balanceDue > 0.01) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => setActivePaymentSale({ ...s, farmer })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    padding: '0.4rem 0.75rem',
                                    borderRadius: '8px',
                                    background: 'var(--primary)',
                                    border: 'none',
                                    color: '#fff',
                                    fontWeight: '500',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-glow)'
                                  }}
                                >
                                  <CreditCard size={13} /> Record Payment
                                </button>
                              )
                            }
                            return null
                          })()}

                          <button
                            type="button"
                            onClick={() => {
                              if (onReprintBill) {
                                onReprintBill({
                                  ...s,
                                  farmer: farmer,
                                  payments: s.payments || []
                                })
                              }
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '8px',
                              background: 'var(--primary-light)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--primary)',
                              fontWeight: '500',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            title="Reprint Bill Receipt"
                          >
                            <Printer size={14} /> Reprint
                          </button>

                          {/* Expand / Collapse Chevron Button */}
                          <button
                            type="button"
                            className="farmer-purchase-toggle-btn"
                            onClick={() => toggleExpandSale(s.id)}
                            aria-label={isExpanded ? 'Hide items' : 'View items'}
                            title={isExpanded ? 'Hide itemized breakdown' : 'View itemized breakdown'}
                          >
                            <span>{isExpanded ? 'Hide items' : 'View items'}</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>

                      {/* Itemized Line Items List */}
                      {items.length > 0 && (
                        <div className={`farmer-purchase-items ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
                          {items.map((item, idx) => {
                            const itemTotal = Number(item.qty || 0) * Number(item.price_at_sale || 0)
                            return (
                              <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.3rem' }}>
                                <span style={{ color: 'var(--text-muted)', flex: '1 1 220px', minWidth: 0, wordBreak: 'break-word' }}>
                                  • <strong style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.product_name}</strong> ({item.product_brand}) × {item.qty} {item.unit}
                                </span>
                                <span style={{ color: 'var(--primary)', fontWeight: '600', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                                  ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem' }}>(₹{Number(item.price_at_sale).toFixed(2)}/{item.unit})</span>
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
        </div>

        {/* Footer Close Button */}
        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', textAlign: 'right', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Close Profile
          </button>
        </div>
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        sale={activePaymentSale}
        isOpen={Boolean(activePaymentSale)}
        onClose={() => setActivePaymentSale(null)}
        shopProfile={shopProfile}
        onPaymentRecorded={() => {
          if (farmer?.id) fetchFarmerSales(farmer.id)
        }}
      />
    </div>
  )
}
