import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  X, 
  Building2, 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  IndianRupee, 
  Award, 
  Package, 
  Users, 
  RefreshCw,
  Phone,
  CheckCircle2,
  Clock,
  Ban
} from 'lucide-react'

export default function DealerDrillDownModal({ dealer, isOpen, onClose }) {
  const [loading, setLoading] = useState(true)
  const [revenue, setRevenue] = useState({ today: 0, this_week: 0, this_month: 0 })
  const [topProducts, setTopProducts] = useState([])
  const [counts, setCounts] = useState({ products: 0, farmers: 0, sales: 0 })

  const fetchDealerMetrics = async (dealerId) => {
    setLoading(true)
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'

      // 1. Revenue Summary via Admin RPC (or fallback)
      try {
        const { data: revData, error: revErr } = await supabase.rpc('get_admin_dealer_revenue_summary', {
          p_dealer_id: dealerId,
          p_timezone: userTz
        })
        if (revErr) throw revErr
        if (revData) {
          setRevenue({
            today: Number(revData.today || 0),
            this_week: Number(revData.this_week || 0),
            this_month: Number(revData.this_month || 0)
          })
        }
      } catch (err) {
        console.warn('Admin revenue RPC error, using direct query fallback:', err)
        const { data: salesData } = await supabase
          .from('sales')
          .select('date, total_amount')
          .eq('dealer_id', dealerId)

        let todaySum = 0, weekSum = 0, monthSum = 0
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        if (salesData) {
          salesData.forEach(s => {
            const amt = Number(s.total_amount || 0)
            if (s.date >= startOfDay) todaySum += amt
            if (s.date >= startOfMonth) monthSum += amt
          })
        }
        setRevenue({ today: todaySum, this_week: weekSum, this_month: monthSum })
      }

      // 2. Top Products via Admin RPC (with direct table query fallback)
      try {
        const { data: topData, error: topErr } = await supabase.rpc('get_admin_dealer_top_products', {
          p_dealer_id: dealerId,
          p_limit: 5
        })
        if (topErr) throw topErr
        setTopProducts(topData || [])
      } catch (err) {
        console.warn('Admin top products RPC error, running direct table query fallback:', err)
        const { data: dealerSales } = await supabase
          .from('sales')
          .select('id')
          .eq('dealer_id', dealerId)

        if (dealerSales && dealerSales.length > 0) {
          const saleIds = dealerSales.map(s => s.id)
          const { data: saleItems } = await supabase
            .from('sale_items')
            .select('product_name, product_brand, qty, price_at_sale')
            .in('sale_id', saleIds)

          if (saleItems && saleItems.length > 0) {
            const map = {}
            saleItems.forEach(item => {
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
          } else {
            setTopProducts([])
          }
        } else {
          setTopProducts([])
        }
      }

      // 3. Counts (Products & Farmers)
      const [{ count: pCount }, { count: fCount }, { count: sCount }] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerId),
        supabase.from('farmers').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerId),
        supabase.from('sales').select('id', { count: 'exact', head: true }).eq('dealer_id', dealerId)
      ])

      setCounts({
        products: pCount || 0,
        farmers: fCount || 0,
        sales: sCount || 0
      })
    } catch (err) {
      console.error('Failed to load dealer drill-down details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && dealer?.id) {
      fetchDealerMetrics(dealer.id)
    }
  }, [isOpen, dealer])

  if (!isOpen || !dealer) return null

  const statusBadge = dealer.status === 'approved' 
    ? { text: 'Approved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle2 }
    : dealer.status === 'blocked'
    ? { text: 'Blocked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: Ban }
    : { text: 'Pending Approval', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: Clock }

  const StatusIcon = statusBadge.icon

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1500,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '90vh',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={22} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                {dealer.shop_name || 'Dealer Details'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {dealer.phone && <span>Ph: {dealer.phone}</span>}
                <span style={{
                  padding: '0.1rem 0.5rem',
                  borderRadius: '4px',
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <StatusIcon size={12} /> {statusBadge.text}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <Package size={18} color="#3b82f6" style={{ marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>{counts.products}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock Items</div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <Users size={18} color="#10b981" style={{ marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>{counts.farmers}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Farmers Registered</div>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <TrendingUp size={18} color="#f59e0b" style={{ marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>{counts.sales}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Sales Made</div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IndianRupee size={16} color="#10b981" /> Revenue Overview
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase' }}>Today</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>
                  ₹{revenue.today.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase' }}>This Week</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>
                  ₹{revenue.this_week.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '700', textTransform: 'uppercase' }}>This Month</span>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff', marginTop: '0.2rem' }}>
                  ₹{revenue.this_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products List */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="#f59e0b" /> Top Selling Products for this Dealer
            </h4>

            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading top products...
              </div>
            ) : topProducts.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
                No sales yet recorded for this dealer. Top-selling products will appear here once sales transactions are created.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {topProducts.map((p, idx) => (
                  <div
                    key={`${p.product_name}_${idx}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: '800', color: '#f59e0b', fontSize: '0.8rem' }}>#{idx + 1}</span>
                      <div>
                        <span style={{ fontWeight: '700', color: '#fff' }}>{p.product_name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>({p.product_brand})</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{Number(p.total_qty_sold)} units sold</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>₹{Number(p.total_revenue).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  )
}
