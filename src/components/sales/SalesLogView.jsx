import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Sparkles, 
  User, 
  Calendar, 
  IndianRupee,
  FileText,
  Plus,
  CreditCard,
  Trash2
} from 'lucide-react'
import RecordPaymentModal from './RecordPaymentModal'

export default function SalesLogView({ user, shopProfile, onReprintBill, onNewSale }) {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSales, setExpandedSales] = useState({})
  const [activePaymentSale, setActivePaymentSale] = useState(null)
  const [deletingPaymentId, setDeletingPaymentId] = useState(null)

  // Search & Filter States
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
    if (user?.id) {
      fetchSales()
    }
  }, [user?.id])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          farmer_id,
          farmers (
            id,
            name,
            phone,
            village
          ),
          sale_items (*),
          payments (*)
        `)
        .eq('dealer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (err) {
      console.error('Error fetching sales log:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This will adjust the remaining balance due.')) return
    setDeletingPaymentId(paymentId)
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)

      if (error) throw error
      fetchSales()
    } catch (err) {
      console.error('Failed to delete payment:', err)
      alert('Failed to delete payment entry: ' + err.message)
    } finally {
      setDeletingPaymentId(null)
    }
  }

  // Filter Logic
  const getFilteredSales = () => {
    let result = [...sales]

    // 1. Search Query (Farmer Name, Product Name, Brand Name, or Invoice ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(s => {
        const billId = `inv-${s.id.substring(0, 8)}`.toLowerCase()
        const farmerName = (s.farmers?.name || '').toLowerCase()
        const invoiceMatch = billId.includes(q)
        const farmerMatch = farmerName.includes(q)
        const itemMatch = (s.sale_items || []).some(item => 
          (item.product_name && item.product_name.toLowerCase().includes(q)) ||
          (item.product_brand && item.product_brand.toLowerCase().includes(q))
        )
        return invoiceMatch || farmerMatch || itemMatch
      })
    }

    // 2. Date Filtering
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
  const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)
  const filteredSalesAmount = filteredSales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0)

  const getFilterLabel = () => {
    if (datePreset === 'TODAY') return 'Total Sales for Today'
    if (datePreset === 'WEEK') return 'Total Sales for This Week'
    if (datePreset === 'MONTH') return 'Total Sales for This Month'
    if (datePreset === 'SPECIFIC') {
      if (!specificDate) return 'Total Sales for Selected Date'
      const dt = new Date(`${specificDate}T00:00:00`)
      return `Total Sales for ${dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    if (datePreset === 'RANGE') return 'Total Sales for Date Range'
    if (searchQuery.trim()) return `Filtered Total (${filteredSales.length} of ${sales.length} sales)`
    return 'Total Filtered Revenue'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} color="var(--primary)" /> Sales Transactions & History
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Complete transaction feed across all farmer customers ({sales.length} total bills)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchSales}
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            title="Refresh Sales"
          >
            <RotateCcw size={14} /> Refresh
          </button>

          {onNewSale && (
            <button
              onClick={onNewSale}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                background: 'var(--primary)',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Plus size={16} /> New Sale Bill
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar: Search & Date Filters */}
      <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 0 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmer name, product, brand, or invoice..."
              style={{
                width: '100%',
                padding: '0.6rem 0.9rem 0.6rem 2.5rem',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Date Filter Pills */}
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
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: datePreset === p.key ? 'var(--primary)' : 'var(--border-color)',
                  background: datePreset === p.key ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: datePreset === p.key ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
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

        {/* Date Inputs */}
        {datePreset === 'SPECIFIC' && (
          <div className="farmer-date-input-group" style={{
            padding: '0.65rem 0.9rem',
            borderRadius: '10px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Select Exact Date:</span>
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

        {datePreset === 'RANGE' && (
          <div className="farmer-date-input-group" style={{
            padding: '0.65rem 0.9rem',
            borderRadius: '10px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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

      {/* Dynamic Summary Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.25rem',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Sparkles size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
            {isFilterActive ? getFilterLabel() : 'All-Time Revenue Total'}:
          </span>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>
            ₹{filteredSalesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            ({filteredSales.length} {filteredSales.length === 1 ? 'sale transaction' : 'sale transactions'})
          </span>
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
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '0.82rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RotateCcw size={14} /> Clear Active Filter
          </button>
        )}
      </div>

      {/* Sales Feed List */}
      {loading ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Loading sales transaction log...
        </div>
      ) : filteredSales.length === 0 ? (
        <div className="glass-card" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'var(--bg-surface)'
        }}>
          <Clock size={36} color="var(--text-dim)" style={{ marginBottom: '0.85rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {isFilterActive ? 'No Sales Match Your Active Filter' : 'No Sales Recorded Yet'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            {isFilterActive 
              ? 'Try broadening your search query or adjusting your date filter.' 
              : 'Record your first sale bill to start tracking revenue and transaction history here.'}
          </p>
          {isFilterActive ? (
            <button
              onClick={() => {
                setDatePreset('ALL')
                setSearchQuery('')
                setSpecificDate('')
                setFromDate('')
                setToDate('')
              }}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Reset Filters
            </button>
          ) : (
            onNewSale && (
              <button
                onClick={onNewSale}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Plus size={16} /> Create First Sale
              </button>
            )
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredSales.map((s) => {
            const billId = `INV-${s.id.substring(0, 8).toUpperCase()}`
            const farmerName = s.farmers?.name || 'Walk-in / Cash Customer'
            const farmerVillage = s.farmers?.village ? `(${s.farmers.village})` : ''
            const totalAmount = Number(s.total_amount || 0)
            const formattedTotal = totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            
            // Calculate total payments & balance
            const payments = s.payments || []
            const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
            const balanceDue = Math.max(0, totalAmount - totalPaid)
            const formattedBalance = balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            
            // Determine badge colors & label
            let badgeBg = 'var(--success-bg)'
            let badgeColor = 'var(--success)'
            let badgeBorder = 'var(--success-border)'
            let badgeLabel = 'Paid Full'

            if (balanceDue > 0.01 && totalPaid > 0) {
              badgeBg = 'var(--warning-bg)'
              badgeColor = 'var(--warning)'
              badgeBorder = 'var(--warning-border)'
              badgeLabel = `Partial (Due: ₹${formattedBalance})`
            } else if (totalPaid <= 0.01 && totalAmount > 0) {
              badgeBg = 'var(--danger-bg)'
              badgeColor = 'var(--danger)'
              badgeBorder = 'var(--danger-border)'
              badgeLabel = 'Credit Due'
            }

            const saleDate = new Date(s.created_at || s.date || Date.now()).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })

            const items = s.sale_items || []
            const isExpanded = Boolean(expandedSales[s.id])
            const displayItems = isExpanded ? items : items.slice(0, 4)
            const hiddenCount = items.length - 4
            const itemCountText = `${items.length} ${items.length === 1 ? 'item' : 'items'}`

            return (
              <div
                key={s.id}
                className="glass-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  background: 'var(--bg-surface)',
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'visible',
                  maxHeight: 'none'
                }}
              >
                {/* Sale Card Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    {/* Bill ID, Farmer Name & Payment Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
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

                      <span style={{ color: 'var(--text-main)', fontWeight: '600', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={16} color="var(--primary)" /> {farmerName} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '400' }}>{farmerVillage}</span>
                      </span>

                      {/* Payment Status Badge */}
                      <span style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`
                      }}>
                        {badgeLabel}
                      </span>
                    </div>

                    {/* Date / Time & Item Count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} color="var(--text-muted)" /> {saleDate}
                      </span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{itemCountText}</span>
                    </div>
                  </div>

                  {/* Total Amount, Record Payment & Reprint Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginLeft: 'auto', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '500' }}>Total Bill</span>
                      <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.15rem' }}>
                        ₹{formattedTotal}
                      </span>
                    </div>

                    {balanceDue > 0.01 && (
                      <button
                        type="button"
                        onClick={() => setActivePaymentSale({ ...s, payments })}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--primary)',
                          border: 'none',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-glow)'
                        }}
                      >
                        <CreditCard size={14} /> Record Payment
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (onReprintBill) {
                          onReprintBill({
                            ...s,
                            farmer: s.farmers || { name: farmerName },
                            payments
                          })
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        background: 'var(--primary-light)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--primary)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Reprint Bill Receipt"
                    >
                      <Printer size={14} /> Reprint
                    </button>
                  </div>
                </div>

                {/* Line Items List */}
                {items.length > 0 && (
                  <div style={{
                    background: 'var(--bg-surface-hover)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    border: '1px dashed var(--border-color)',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'visible',
                    maxHeight: 'none'
                  }}>
                    {displayItems.map((item, idx) => {
                      const itemTotal = Number(item.qty || 0) * Number(item.price_at_sale || 0)
                      return (
                        <div key={item.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--text-muted)', flex: '1 1 240px', minWidth: 0, wordBreak: 'break-word' }}>
                            • <strong style={{ color: 'var(--text-main)' }}>{item.product_name}</strong> ({item.product_brand}) × {item.qty} {item.unit}
                          </span>
                          <span style={{ color: 'var(--primary)', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                            ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem' }}>(₹{Number(item.price_at_sale).toFixed(2)}/{item.unit})</span>
                          </span>
                        </div>
                      )
                    })}

                    {items.length > 4 && (
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                        <button
                          type="button"
                          onClick={() => toggleExpandSale(s.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0'
                          }}
                        >
                          {isExpanded ? (
                            <>Show fewer items <ChevronUp size={14} /></>
                          ) : (
                            <>+{hiddenCount} more items — tap to expand <ChevronDown size={14} /></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Recorded Payments Log in Expanded View */}
                {isExpanded && (
                  <div style={{
                    background: 'var(--primary-light)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Payment Transactions Log ({payments.length} entries)</span>
                      <span>Total Paid: ₹{totalPaid.toFixed(2)} / Balance Due: ₹{balanceDue.toFixed(2)}</span>
                    </div>

                    {payments.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        No payments recorded yet. Sale is currently on full credit.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        {payments.map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-main)', background: 'var(--bg-surface)', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                            <div>
                              <span style={{ color: 'var(--success)', fontWeight: '700' }}>+ ₹{Number(p.amount).toFixed(2)}</span> via <strong style={{ color: 'var(--text-main)' }}>{(p.payment_method || 'cash').toUpperCase()}</strong> on {new Date(p.paid_at || p.created_at).toLocaleDateString('en-IN')} {p.notes ? `(${p.notes})` : ''}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeletePayment(p.id)}
                              disabled={deletingPaymentId === p.id}
                              style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                              title="Delete payment entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        sale={activePaymentSale}
        isOpen={Boolean(activePaymentSale)}
        onClose={() => setActivePaymentSale(null)}
        shopProfile={shopProfile}
        onPaymentRecorded={() => {
          fetchSales()
        }}
      />
    </div>
  )
}
