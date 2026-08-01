import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import EditDealerModal from '../admin/EditDealerModal'
import DealerDrillDownModal from '../admin/DealerDrillDownModal'

import { 
  ShieldCheck, 
  LogOut, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Building2, 
  Edit3, 
  Eye, 
  Ban, 
  RefreshCw, 
  IndianRupee, 
  AlertCircle,
  Award
} from 'lucide-react'

export default function AdminDashboard({ profile, user, onSignOut }) {
  // Navigation State ('pending' | 'dealers' | 'leaderboard')
  const [activeTab, setActiveTab] = useState('pending')

  // Dealers State
  const [dealers, setDealers] = useState([])
  const [loadingDealers, setLoadingDealers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Leaderboard State
  const [leaderboard, setLeaderboard] = useState([])
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [leaderboardSort, setLeaderboardSort] = useState('month') // 'month' | 'alltime'

  // Selected Modal States
  const [editingDealer, setEditingDealer] = useState(null)
  const [drillDownDealer, setDrillDownDealer] = useState(null)
  const [actionStatus, setActionStatus] = useState({ id: null, type: null })

  // Fetch all dealer profiles
  const fetchDealers = async () => {
    setLoadingDealers(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'dealer')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDealers(data || [])
    } catch (err) {
      console.error('Error fetching dealer profiles for admin:', err)
    } finally {
      setLoadingDealers(false)
    }
  }

  // Fetch Platform Leaderboard
  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true)
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'

      try {
        const { data, error } = await supabase.rpc('get_admin_leaderboard', {
          p_timezone: userTz
        })
        if (error) throw error
        setLeaderboard(data || [])
      } catch (rpcErr) {
        console.warn('RPC get_admin_leaderboard unavailable, using direct SQL fallback:', rpcErr)
        // Fallback aggregation
        const { data: approvedDealers } = await supabase
          .from('profiles')
          .select('id, shop_name, phone, status')
          .eq('role', 'dealer')
          .eq('status', 'approved')

        const { data: allSales } = await supabase
          .from('sales')
          .select('id, dealer_id, date, total_amount')

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const map = {}
        if (approvedDealers) {
          approvedDealers.forEach(d => {
            map[d.id] = {
              dealer_id: d.id,
              shop_name: d.shop_name || 'Unnamed Shop',
              phone: d.phone || '',
              status: d.status,
              this_month_revenue: 0,
              all_time_revenue: 0,
              total_sales_count: 0
            }
          })
        }

        if (allSales) {
          allSales.forEach(s => {
            if (map[s.dealer_id]) {
              const amt = Number(s.total_amount || 0)
              map[s.dealer_id].all_time_revenue += amt
              map[s.dealer_id].total_sales_count += 1
              if (s.date >= startOfMonth) {
                map[s.dealer_id].this_month_revenue += amt
              }
            }
          })
        }

        setLeaderboard(Object.values(map))
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  useEffect(() => {
    fetchDealers()
    fetchLeaderboard()
  }, [])

  // Approve / Block Dealer Status Action
  const handleUpdateDealerStatus = async (dealerId, newStatus) => {
    setActionStatus({ id: dealerId, type: newStatus })
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', dealerId)

      if (error) throw error

      fetchDealers()
      fetchLeaderboard()
    } catch (err) {
      console.error(`Failed to update dealer status to ${newStatus}:`, err)
    } finally {
      setActionStatus({ id: null, type: null })
    }
  }

  // Pending dealers filter
  const pendingDealers = dealers.filter(d => d.status === 'pending')

  // Filtered dealers directory
  const filteredDealers = dealers.filter(d => {
    const q = searchQuery.toLowerCase()
    const shopMatch = (d.shop_name || '').toLowerCase().includes(q)
    const phoneMatch = (d.phone || '').toLowerCase().includes(q)
    const matchesSearch = shopMatch || phoneMatch
    const matchesStatus = statusFilter === 'ALL' || d.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  // Sorted Leaderboard
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (leaderboardSort === 'month') {
      return Number(b.this_month_revenue) - Number(a.this_month_revenue)
    } else {
      return Number(b.all_time_revenue) - Number(a.all_time_revenue)
    }
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 19, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.35)'
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              System Administration
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: '600' }}>
              Global Admin Dashboard &amp; Dealer Oversight
            </span>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'pending' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: activeTab === 'pending' ? '#f59e0b' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Clock size={16} /> Pending Signups ({pendingDealers.length})
          </button>

          <button
            onClick={() => setActiveTab('dealers')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'dealers' ? 'rgba(59, 130, 246, 0.18)' : 'transparent',
              color: activeTab === 'dealers' ? '#60a5fa' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Dealers Directory ({dealers.length})
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'leaderboard' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'leaderboard' ? '#34d399' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Trophy size={16} /> Leaderboard
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: '600', color: '#fff' }}>{user?.email}</span>
            <span style={{ fontSize: '0.78rem', color: '#60a5fa' }}>Role: Admin</span>
          </div>
          <button
            onClick={onSignOut}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Area */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem' }}>
        
        {/* ============================================================ */}
        {/* TAB 1: PENDING DEALER SIGNUPS                                */}
        {/* ============================================================ */}
        {activeTab === 'pending' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={22} color="#f59e0b" />
                  Pending Dealer Approvals ({pendingDealers.length})
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  New dealer signups awaiting platform admin approval to access stock and billing features.
                </p>
              </div>

              <button
                onClick={fetchDealers}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <RefreshCw size={15} /> Refresh List
              </button>
            </div>

            {loadingDealers ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
                <p>Checking pending dealer applications...</p>
              </div>
            ) : pendingDealers.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  All Clear! No Pending Approvals
                </h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
                  There are currently no new dealer signups waiting for approval.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {pendingDealers.map(d => {
                  const createdDate = d.created_at
                    ? new Date(d.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Recently requested'
                  const isProcessing = actionStatus.id === d.id

                  return (
                    <div
                      key={d.id}
                      className="glass-card"
                      style={{
                        padding: '1.5rem',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                          }}>
                            Pending Review
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {createdDate}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: '0 0 0.4rem 0' }}>
                          {d.shop_name || 'Unnamed Business'}
                        </h3>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.25rem' }}>
                          <div><strong>Phone:</strong> {d.phone || 'Not provided'}</div>
                          <div><strong>User ID:</strong> {d.id.substring(0, 13)}...</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUpdateDealerStatus(d.id, 'approved')}
                          style={{
                            flex: 1,
                            padding: '0.65rem',
                            borderRadius: '10px',
                            background: '#10b981',
                            border: 'none',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <CheckCircle2 size={16} /> Approve Access
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUpdateDealerStatus(d.id, 'blocked')}
                          style={{
                            padding: '0.65rem 0.9rem',
                            borderRadius: '10px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#f87171',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: isProcessing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Ban size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ALL DEALERS DIRECTORY                                 */}
        {/* ============================================================ */}
        {activeTab === 'dealers' && (
          <div>
            {/* Filter Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.75rem'
            }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 300px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shop name or phone..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                    borderRadius: '12px',
                    background: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
                {['ALL', 'approved', 'pending', 'blocked'].map(statusKey => {
                  const isSel = statusFilter.toLowerCase() === statusKey.toLowerCase()
                  const count = statusKey === 'ALL' 
                    ? dealers.length 
                    : dealers.filter(d => d.status === statusKey).length

                  return (
                    <button
                      key={statusKey}
                      onClick={() => setStatusFilter(statusKey)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: isSel ? '#3b82f6' : 'var(--border-color)',
                        background: isSel ? 'rgba(59, 130, 246, 0.18)' : 'var(--bg-surface-hover)',
                        color: isSel ? '#60a5fa' : 'var(--text-muted)',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        textTransform: 'capitalize'
                      }}
                    >
                      {statusKey} ({count})
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dealers Directory List / Cards */}
            {loadingDealers ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
                <p>Loading dealer directory...</p>
              </div>
            ) : filteredDealers.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Building2 size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  No Dealers Found
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No dealer records match your current filter and search terms.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredDealers.map(d => {
                  const statusBadge = d.status === 'approved' 
                    ? { text: 'Approved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
                    : d.status === 'blocked'
                    ? { text: 'Blocked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
                    : { text: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }

                  return (
                    <div
                      key={d.id}
                      className="glass-card"
                      style={{
                        padding: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            {statusBadge.text}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {d.id.substring(0, 8)}...
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', margin: '0 0 0.4rem 0' }}>
                          {d.shop_name || 'Unnamed Business'}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Ph: {d.phone || 'Not specified'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setDrillDownDealer(d)}
                          style={{
                            flex: '1 1 auto',
                            padding: '0.55rem 0.85rem',
                            borderRadius: '8px',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Eye size={14} /> View Sales &amp; Metrics
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingDealer(d)}
                          style={{
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            background: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: PLATFORM LEADERBOARD                                  */}
        {/* ============================================================ */}
        {activeTab === 'leaderboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Trophy size={24} color="#f59e0b" />
                  Dealer Revenue Leaderboard
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Platform-wide ranking of approved dealers ordered by total sales revenue generated.
                </p>
              </div>

              {/* Sort Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setLeaderboardSort('month')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: leaderboardSort === 'month' ? '#10b981' : 'transparent',
                    color: leaderboardSort === 'month' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardSort('alltime')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: leaderboardSort === 'alltime' ? '#10b981' : 'transparent',
                    color: leaderboardSort === 'alltime' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  All-Time
                </button>
              </div>
            </div>

            {loadingLeaderboard ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
                <p>Calculating dealer leaderboard rankings...</p>
              </div>
            ) : sortedLeaderboard.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Award size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  No Leaderboard Data Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Approved dealers will appear ranked here once sales transactions are recorded.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {sortedLeaderboard.map((lb, idx) => {
                  const rank = idx + 1
                  const badgeColor = rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#b45309' : '#10b981'

                  return (
                    <div
                      key={lb.dealer_id}
                      className="glass-card"
                      style={{
                        padding: '1.1rem 1.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: rank === 1 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                        background: rank === 1 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)' : 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: `${badgeColor}25`,
                          color: badgeColor,
                          fontWeight: '800',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${badgeColor}50`
                        }}>
                          #{rank}
                        </div>

                        <div>
                          <div style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem' }}>
                            {lb.shop_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {lb.phone ? `Ph: ${lb.phone} • ` : ''}{lb.total_sales_count} sales completed
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This Month</div>
                          <div style={{ fontWeight: '800', color: '#10b981', fontSize: '1.1rem' }}>
                            ₹{Number(lb.this_month_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All-Time</div>
                          <div style={{ fontWeight: '700', color: '#38bdf8', fontSize: '1rem' }}>
                            ₹{Number(lb.all_time_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Admin Modals */}
      <EditDealerModal
        dealer={editingDealer}
        isOpen={Boolean(editingDealer)}
        onClose={() => setEditingDealer(null)}
        onDealerUpdated={() => {
          fetchDealers()
          fetchLeaderboard()
        }}
      />

      <DealerDrillDownModal
        dealer={drillDownDealer}
        isOpen={Boolean(drillDownDealer)}
        onClose={() => setDrillDownDealer(null)}
      />
    </div>
  )
}
