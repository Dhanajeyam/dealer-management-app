import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  Award, 
  AlertTriangle, 
  RefreshCw, 
  IndianRupee, 
  Package, 
  ArrowUpRight,
  Filter,
  CheckCircle2
} from 'lucide-react'

export default function AnalyticsView({ onNavigateToStock }) {
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState({
    today_billed: 0,
    today_collected: 0,
    this_week_billed: 0,
    this_week_collected: 0,
    this_month_billed: 0,
    this_month_collected: 0,
    total_dues: 0
  })
  const [topProducts, setTopProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [lowStockThreshold, setLowStockThreshold] = useState(10)
  const [lastRefreshed, setLastRefreshed] = useState(null)

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // 1. Fetch Revenue Summary (Direct SQL RPC call with timezone parameter)
      try {
        const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'
        const { data: revData, error: revErr } = await supabase.rpc('get_dealer_revenue_summary', {
          p_timezone: userTz
        })
        if (revErr) throw revErr
        if (revData) {
          setRevenue(prev => ({
            ...prev,
            today_billed: Number(revData.today || 0),
            today_collected: Number(revData.today_collected || 0),
            this_week_billed: Number(revData.this_week || 0),
            this_week_collected: Number(revData.this_week_collected || 0),
            this_month_billed: Number(revData.this_month || 0),
            this_month_collected: Number(revData.this_month_collected || 0)
          }))
        }
      } catch (rpcErr) {
        console.warn('RPC get_dealer_revenue_summary unavailable, using direct SQL fallback:', rpcErr)
        // Fallback SQL query via Supabase SDK
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        
        const dayOfWeek = now.getDay()
        const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday)
        startOfWeek.setHours(0,0,0,0)
        const startOfWeekISO = startOfWeek.toISOString()
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()


        const { data: salesData } = await supabase
          .from('sales')
          .select('date, total_amount')

        let todaySum = 0, weekSum = 0, monthSum = 0
        if (salesData) {
          salesData.forEach(s => {
            const amt = Number(s.total_amount || 0)
            const sDate = s.date
            if (sDate >= startOfDay) todaySum += amt
            if (sDate >= startOfWeekISO) weekSum += amt
            if (sDate >= startOfMonth) monthSum += amt
          })
        }

        const { data: paymentsData } = await supabase
          .from('payments')
          .select('paid_at, amount')

        let todayPaid = 0, weekPaid = 0, monthPaid = 0
        if (paymentsData) {
          paymentsData.forEach(p => {
            const amt = Number(p.amount || 0)
            const pDate = p.paid_at
            if (pDate >= startOfDay) todayPaid += amt
            if (pDate >= startOfWeekISO) weekPaid += amt
            if (pDate >= startOfMonth) monthPaid += amt
          })
        }

        setRevenue(prev => ({
          ...prev,
          today_billed: todaySum,
          today_collected: todayPaid,
          this_week_billed: weekSum,
          this_week_collected: weekPaid,
          this_month_billed: monthSum,
          this_month_collected: monthPaid
        }))
      }

      // 2. Fetch Top 5 Products (Direct SQL RPC call with fallback query)
      try {
        const { data: topData, error: topErr } = await supabase.rpc('get_dealer_top_products', { p_limit: 5 })
        if (topErr) throw topErr
        setTopProducts(topData || [])
      } catch (rpcErr) {
        console.warn('RPC get_dealer_top_products unavailable, using direct SQL fallback:', rpcErr)
        const { data: itemsData } = await supabase
          .from('sale_items')
          .select('product_name, product_brand, qty, price_at_sale')

        if (itemsData) {
          const map = {}
          itemsData.forEach(item => {
            const key = `${item.product_name}___${item.product_brand}`
            if (!map[key]) {
              map[key] = {
                product_name: item.product_name,
                product_brand: item.product_brand,
                total_qty_sold: 0,
                total_revenue: 0
              }
            }
            const q = Number(item.qty || 0)
            const p = Number(item.price_at_sale || 0)
            map[key].total_qty_sold += q
            map[key].total_revenue += (q * p)
          })

          const sorted = Object.values(map)
            .sort((a, b) => b.total_qty_sold - a.total_qty_sold)
            .slice(0, 5)
          setTopProducts(sorted)
        }
      }

      // 3. Fetch Low-Stock List
      const { data: stockData, error: stockErr } = await supabase
        .from('products')
        .select('*')
        .lt('quantity', lowStockThreshold)
        .order('quantity', { ascending: true })

      if (stockErr) throw stockErr
      setLowStockProducts(stockData || [])
      setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.error('Failed to load dealer analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [lowStockThreshold])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <TrendingUp size={24} color="var(--primary)" />
            Dealer Performance &amp; Analytics
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Real-time revenue metrics, best-selling products, and inventory reorder alerts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {lastRefreshed && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Updated at {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: '500',
              fontSize: '0.85rem',
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'status-pulse' : ''} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* SECTION 1: REVENUE SUMMARY CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Today's Revenue */}
        <div className="glass-card" style={{
          padding: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderTop: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>
              Today's Revenue
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} color="var(--primary)" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              ₹{revenue.today_billed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500', marginTop: '0.3rem' }}>
              Cash Collected: ₹{revenue.today_collected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Billed vs actual payments today
            </div>
          </div>
        </div>

        {/* This Week's Revenue */}
        <div className="glass-card" style={{
          padding: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderTop: '4px solid var(--accent)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--accent)', textTransform: 'uppercase' }}>
              This Week's Revenue
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="var(--accent)" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              ₹{revenue.this_week_billed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '500', marginTop: '0.3rem' }}>
              Cash Collected: ₹{revenue.this_week_collected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Billed vs actual payments this week
            </div>
          </div>
        </div>

        {/* This Month's Revenue */}
        <div className="glass-card" style={{
          padding: '1.5rem',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderTop: '4px solid var(--primary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase' }}>
              This Month's Revenue
            </span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IndianRupee size={20} color="var(--primary)" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              ₹{revenue.this_month_billed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500', marginTop: '0.3rem' }}>
              Cash Collected: ₹{revenue.this_month_collected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Billed vs actual payments this month
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3 GRID: TOP 5 PRODUCTS & LOW STOCK REORDER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* SECTION 2: TOP 5 PRODUCTS BY QUANTITY SOLD */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Award size={22} color="var(--warning)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                Top 5 Best-Selling Products
              </h3>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-surface-hover)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
              By Qty Sold
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading top product rankings...
            </div>
          ) : topProducts.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              border: '1px dashed var(--border-color)',
              borderRadius: '12px'
            }}>
              No sales recorded yet to generate top product rankings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topProducts.map((p, idx) => {
                const badgeColor = idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#10b981'
                return (
                  <div
                    key={`${p.product_name}_${p.product_brand}_${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: `${badgeColor}20`,
                        color: badgeColor,
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${badgeColor}40`
                      }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {p.product_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Brand: {p.product_brand}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.92rem' }}>
                        {Number(p.total_qty_sold).toLocaleString('en-IN')} units
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Revenue: ₹{Number(p.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: LOW STOCK REORDER LIST */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={22} color="var(--danger)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                Low-Stock Reorder List
              </h3>
            </div>

            {/* Threshold Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Threshold:</span>
              <select
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontWeight: '500'
                }}
              >
                <option value={5}>&lt; 5 units</option>
                <option value={10}>&lt; 10 units</option>
                <option value={20}>&lt; 20 units</option>
                <option value={50}>&lt; 50 units</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Checking inventory stock levels...
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--success)',
              fontSize: '0.88rem',
              border: '1px dashed var(--success-border)',
              borderRadius: '12px',
              background: 'var(--success-bg)'
            }}>
              <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                All Stock Levels Healthy
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No products found with quantity below {lowStockThreshold} units.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {lowStockProducts.map(prod => {
                const qty = Number(prod.quantity)
                const isOutOfStock = qty <= 0

                return (
                  <div
                    key={prod.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 1rem',
                      borderRadius: '10px',
                      background: isOutOfStock ? 'var(--danger-bg)' : 'var(--warning-bg)',
                      border: `1px solid ${isOutOfStock ? 'var(--danger-border)' : 'var(--warning-border)'}`
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {prod.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Brand: {prod.brand} • Unit Price: ₹{Number(prod.price).toFixed(2)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '500',
                          background: isOutOfStock ? 'var(--danger)' : 'var(--warning)',
                          color: '#fff',
                          marginBottom: '0.2rem'
                        }}>
                          {isOutOfStock ? 'OUT OF STOCK' : `LOW: ${qty} ${prod.unit}`}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Available: {qty} {prod.unit}
                        </div>
                      </div>

                      {onNavigateToStock && (
                        <button
                          type="button"
                          onClick={onNavigateToStock}
                          title="Go to Stock tab to edit inventory"
                          style={{
                            background: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            padding: '0.4rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
