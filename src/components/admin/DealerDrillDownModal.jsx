import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getTrialInfo } from '../../lib/trial'
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
  Ban,
  Sparkles,
  Hourglass
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

      // 3. Counts (Products, Farmers, Sales)
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
  const trialInfo = getTrialInfo(dealer)

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
      padding: '0.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: 'min(94vh, 750px)',
        background: 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--info-bg)', border: '1px solid var(--info-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={20} color="var(--info)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                {dealer.shop_name || 'Dealer Details'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                {dealer.phone && <span>Ph: {dealer.phone}</span>}
                <span style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  background: statusBadge.bg,
                  color: statusBadge.color,
                  fontWeight: '500',
                  fontSize: '0.72rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <StatusIcon size={11} /> {statusBadge.text}
                </span>

                {dealer.status === 'approved' && (
                  dealer.is_trial ? (
                    <span style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      background: trialInfo.badgeBg,
                      color: trialInfo.badgeColor,
                      border: `1px solid ${trialInfo.badgeColor}40`,
                      fontWeight: '600',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {trialInfo.isExpired ? <Hourglass size={11} /> : <Clock size={11} />}
                      {trialInfo.badgeText}
                    </span>
                  ) : (
                    <span style={{
                      padding: '0.1rem 0.45rem',
                      borderRadius: '4px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(22, 163, 74, 0.25)',
                      fontWeight: '600',
                      fontSize: '0.72rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Sparkles size={11} /> Paid Account
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.65rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <Package size={16} color="var(--info)" style={{ marginBottom: '0.25rem' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{counts.products}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stock Items</div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <Users size={16} color="var(--primary)" style={{ marginBottom: '0.25rem' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{counts.farmers}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Farmers</div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--bg-surface-hover)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <TrendingUp size={16} color="var(--warning)" style={{ marginBottom: '0.25rem' }} />
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{counts.sales}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sales</div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <IndianRupee size={15} color="var(--primary)" /> Revenue Overview
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--primary-light)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '500', textTransform: 'uppercase' }}>Today</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  ₹{revenue.today.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--info)', fontWeight: '500', textTransform: 'uppercase' }}>This Week</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  ₹{revenue.this_week.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: '500', textTransform: 'uppercase' }}>This Month</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                  ₹{revenue.this_month.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} color="var(--warning)" /> Top 5 Selling Products
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="status-pulse" />
              </div>
            ) : topProducts.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-surface-hover)', borderRadius: '8px' }}>
                No product sale transactions recorded yet for this dealer.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {topProducts.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {p.product_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Brand: {p.product_brand || 'N/A'} • Sold: {p.total_qty_sold} units
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      ₹{Number(p.total_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-surface-hover)' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontWeight: '500',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
