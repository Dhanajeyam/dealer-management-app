import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import EditDealerModal from '../admin/EditDealerModal'
import DealerDrillDownModal from '../admin/DealerDrillDownModal'
import DashboardLayout from '../common/DashboardLayout'
import SettingsView from '../settings/SettingsView'
import { getTrialInfo } from '../../lib/trial'

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
  Award,
  Settings,
  Sparkles,
  Hourglass,
  CalendarPlus,
  X,
  Loader2
} from 'lucide-react'

export default function AdminDashboard({ profile, user, onSignOut }) {
  // Navigation State ('pending' | 'dealers' | 'leaderboard' | 'settings')
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
  const [notice, setNotice] = useState(null)

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

  // Approve / Block Dealer Status Action with Defensive Schema Fallback
  const handleUpdateDealerStatus = async (dealerId, newStatus) => {
    setActionStatus({ id: dealerId, type: newStatus })
    setNotice(null)
    try {
      const updatePayload = { status: newStatus }
      if (newStatus === 'approved') {
        updatePayload.is_trial = true
        updatePayload.trial_ends_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      let { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', dealerId)

      // Fallback if is_trial or trial_ends_at column is not yet present in remote Supabase schema
      if (error) {
        console.warn('Full update failed (schema might lack trial columns), trying basic status update:', error)
        const fallbackRes = await supabase
          .from('profiles')
          .update({ status: newStatus })
          .eq('id', dealerId)
        error = fallbackRes.error
      }

      if (error) throw error

      // Optimistic local state update
      setDealers(prev => prev.map(d => d.id === dealerId ? { ...d, status: newStatus } : d))
      setNotice({
        type: 'success',
        message: `Dealer has been successfully ${newStatus === 'approved' ? 'approved' : newStatus === 'blocked' ? 'blocked' : 'updated'}.`
      })

      fetchDealers()
      fetchLeaderboard()
    } catch (err) {
      console.error(`Failed to update dealer status to ${newStatus}:`, err)
      setNotice({
        type: 'error',
        message: `Failed to update dealer: ${err.message || 'Database update error'}`
      })
    } finally {
      setActionStatus({ id: null, type: null })
    }
  }

  // Convert Dealer to Paid Account (Removes trial restrictions)
  const handleConvertToPaid = async (dealerId) => {
    setActionStatus({ id: dealerId, type: 'convert_paid' })
    setNotice(null)
    try {
      let { error } = await supabase
        .from('profiles')
        .update({
          is_trial: false,
          trial_ends_at: null
        })
        .eq('id', dealerId)

      if (error) throw error

      setDealers(prev => prev.map(d => d.id === dealerId ? { ...d, is_trial: false, trial_ends_at: null } : d))
      setNotice({ type: 'success', message: 'Dealer converted to permanent Paid account successfully.' })

      fetchDealers()
      fetchLeaderboard()
    } catch (err) {
      console.error('Failed to convert dealer to paid:', err)
      setNotice({ type: 'error', message: `Failed to convert dealer: ${err.message || 'Database error'}` })
    } finally {
      setActionStatus({ id: null, type: null })
    }
  }

  // Extend Dealer Trial by specified days
  const handleExtendTrial = async (dealer, additionalDays = 7) => {
    setActionStatus({ id: dealer.id, type: 'extend_trial' })
    setNotice(null)
    try {
      let baseTime = Date.now()
      if (dealer.trial_ends_at) {
        const currentEnd = new Date(dealer.trial_ends_at).getTime()
        if (currentEnd > baseTime) {
          baseTime = currentEnd
        }
      }
      const newTrialEndsAt = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('profiles')
        .update({
          is_trial: true,
          trial_ends_at: newTrialEndsAt
        })
        .eq('id', dealer.id)

      if (error) throw error

      setDealers(prev => prev.map(d => d.id === dealer.id ? { ...d, is_trial: true, trial_ends_at: newTrialEndsAt } : d))
      setNotice({ type: 'success', message: `Extended trial by +${additionalDays} days successfully.` })

      fetchDealers()
      fetchLeaderboard()
    } catch (err) {
      console.error('Failed to extend trial:', err)
      setNotice({ type: 'error', message: `Failed to extend trial: ${err.message || 'Database error'}` })
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

  const navItems = [
    { id: 'pending', label: 'Pending Signups', shortLabel: 'Pending', icon: Clock, color: activeTab === 'pending' ? 'var(--warning)' : undefined, primary: true },
    { id: 'dealers', label: 'Dealer Directory', shortLabel: 'Dealers', icon: Building2, primary: true },
    { id: 'leaderboard', label: 'Leaderboard', shortLabel: 'Leaderboard', icon: Trophy, primary: true },
    { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings, primary: true }
  ]

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'pending': return 'Pending Dealer Approvals'
      case 'dealers': return 'Dealer Management Directory'
      case 'leaderboard': return 'Platform Performance Leaderboard'
      case 'settings': return 'System & Account Settings'
      default: return 'System Administration'
    }
  }

  const headerActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user?.email}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>Role: Admin</span>
      </div>
      <button
        onClick={onSignOut}
        className="btn-signout"
        title="Sign Out"
      >
        <LogOut size={15} /> Sign Out
      </button>
    </div>
  )

  return (
    <DashboardLayout
      brandTitle="System Administration"
      brandSubtitle="Global Admin Dashboard & Dealer Oversight"
      brandIcon={<ShieldCheck size={24} color="#ffffff" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerTitle={getHeaderTitle()}
      headerActions={headerActions}
    >
      {/* Toast Notification Banner */}
      {notice && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '0.85rem 1.25rem',
          borderRadius: '12px',
          background: notice.type === 'success' ? 'var(--primary-light)' : 'var(--danger-bg)',
          border: `1px solid ${notice.type === 'success' ? 'rgba(22, 163, 74, 0.3)' : 'var(--danger-border)'}`,
          color: notice.type === 'success' ? 'var(--primary)' : 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 1: PENDING DEALER SIGNUPS                                */}
      {/* ============================================================ */}
      {activeTab === 'pending' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontWeight: '500',
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
              <CheckCircle2 size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                All Clear! No Pending Approvals
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.9rem' }}>
                There are currently no new dealer signups waiting for approval.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
                      padding: '1.25rem',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      background: 'var(--bg-surface)',
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
                          background: 'var(--warning-bg)',
                          color: 'var(--warning)',
                          border: '1px solid var(--warning-border)',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}>
                          Pending Review
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {createdDate}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                        {d.shop_name || 'Unnamed Business'}
                      </h3>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1.25rem' }}>
                        <div><strong>Phone:</strong> {d.phone || 'Not provided'}</div>
                        <div><strong>User ID:</strong> {d.id.substring(0, 13)}...</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateDealerStatus(d.id, 'approved')}
                        style={{
                          flex: 1,
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--primary)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          cursor: isProcessing ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          boxShadow: 'var(--shadow-glow)'
                        }}
                        title="Approve access and grant 7-day trial"
                      >
                        {isProcessing && actionStatus.type === 'approved' ? (
                          <>
                            <Loader2 size={15} className="status-pulse" /> Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} /> Approve Access
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleUpdateDealerStatus(d.id, 'blocked')}
                        style={{
                          padding: '0.55rem 0.85rem',
                          borderRadius: '8px',
                          background: 'var(--danger-bg)',
                          border: '1px solid var(--danger-border)',
                          color: 'var(--danger)',
                          fontWeight: '500',
                          fontSize: '0.85rem',
                          cursor: isProcessing ? 'wait' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                        title="Reject signup and block access"
                      >
                        {isProcessing && actionStatus.type === 'blocked' ? (
                          <>
                            <Loader2 size={15} className="status-pulse" /> Blocking...
                          </>
                        ) : (
                          <>
                            <Ban size={15} /> Block / Reject
                          </>
                        )}
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
                    color: 'var(--text-main)',
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
                        fontWeight: '500',
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {filteredDealers.map(d => {
                  const statusBadge = d.status === 'approved' 
                    ? { text: 'Approved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' }
                    : d.status === 'blocked'
                    ? { text: 'Blocked', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' }
                    : { text: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' }

                  const trialInfo = getTrialInfo(d)
                  const isApproved = d.status === 'approved'
                  const isActionLoading = actionStatus.id === d.id

                  return (
                    <div
                      key={d.id}
                      className="glass-card"
                      style={{
                        padding: '1.15rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '0.85rem',
                        border: isApproved && d.is_trial && trialInfo.isExpired ? '1px solid var(--danger-border)' : '1px solid var(--border-color)'
                      }}
                    >
                      <div>
                        {/* Status Badges Row */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              background: statusBadge.bg,
                              color: statusBadge.color,
                              fontSize: '0.75rem',
                              fontWeight: '500'
                            }}>
                              {statusBadge.text}
                            </span>

                            {isApproved && (
                              d.is_trial ? (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '6px',
                                  background: trialInfo.badgeBg,
                                  color: trialInfo.badgeColor,
                                  border: `1px solid ${trialInfo.badgeColor}40`,
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}>
                                  {trialInfo.isExpired ? <Hourglass size={12} /> : <Clock size={12} />}
                                  {trialInfo.badgeText}
                                </span>
                              ) : (
                                <span style={{
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '6px',
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  border: '1px solid rgba(22, 163, 74, 0.25)',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}>
                                  <Sparkles size={12} /> Paid Account
                                </span>
                              )
                            )}
                          </div>

                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {d.id.substring(0, 8)}...
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                          {d.shop_name || 'Unnamed Business'}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Ph: {d.phone || 'Not specified'}
                        </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setDrillDownDealer(d)}
                            style={{
                              flex: 1,
                              padding: '0.55rem 0.85rem',
                              borderRadius: '8px',
                              background: 'var(--info-bg)',
                              border: '1px solid var(--info-border)',
                              color: 'var(--info)',
                              fontWeight: '500',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <Eye size={14} /> View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingDealer(d)}
                            style={{
                              padding: '0.55rem 0.75rem',
                              borderRadius: '8px',
                              background: 'var(--bg-surface-hover)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-main)',
                              fontWeight: '500',
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

                        {/* Actions for Approved Dealers */}
                        {isApproved && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                            {d.is_trial ? (
                              <div style={{ display: 'flex', gap: '0.45rem' }}>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleConvertToPaid(d.id)}
                                  style={{
                                    flex: 1,
                                    padding: '0.48rem 0.65rem',
                                    borderRadius: '8px',
                                    background: 'var(--primary)',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.78rem',
                                    cursor: isActionLoading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.35rem',
                                    boxShadow: 'var(--shadow-glow)'
                                  }}
                                  title="Activate permanent subscription"
                                >
                                  <Sparkles size={13} /> Convert to Paid
                                </button>

                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleExtendTrial(d, 7)}
                                  style={{
                                    padding: '0.48rem 0.65rem',
                                    borderRadius: '8px',
                                    background: 'var(--warning-bg)',
                                    border: '1px solid var(--warning-border)',
                                    color: 'var(--warning)',
                                    fontWeight: '500',
                                    fontSize: '0.78rem',
                                    cursor: isActionLoading ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem'
                                  }}
                                  title="Extend trial by +7 days"
                                >
                                  <CalendarPlus size={13} /> +7 Days
                                </button>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.76rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <CheckCircle2 size={13} /> Permanent Access (No Expiry)
                              </div>
                            )}

                            {/* Block Access Button */}
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to BLOCK ${d.shop_name || 'this dealer'}? They will be immediately locked out.`)) {
                                  handleUpdateDealerStatus(d.id, 'blocked')
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '0.45rem 0.65rem',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: '1px solid var(--danger-border)',
                                color: 'var(--danger)',
                                fontWeight: '500',
                                fontSize: '0.78rem',
                                cursor: isActionLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem'
                              }}
                              title="Revoke access and block dealer"
                            >
                              <Ban size={13} /> Block Dealer Access
                            </button>
                          </div>
                        )}

                        {/* Actions for Blocked Dealers */}
                        {d.status === 'blocked' && (
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleUpdateDealerStatus(d.id, 'approved')}
                              style={{
                                width: '100%',
                                padding: '0.55rem 0.85rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.82rem',
                                cursor: isActionLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                boxShadow: 'var(--shadow-glow)'
                              }}
                              title="Unblock dealer and restore account access"
                            >
                              <CheckCircle2 size={15} /> Unblock Dealer (Restore Access)
                            </button>
                          </div>
                        )}

                        {/* Actions for Pending Dealers in Directory */}
                        {d.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleUpdateDealerStatus(d.id, 'approved')}
                              style={{
                                flex: 1,
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                color: '#FFFFFF',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                cursor: isActionLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.35rem',
                                boxShadow: 'var(--shadow-glow)'
                              }}
                            >
                              <CheckCircle2 size={14} /> Approve Access
                            </button>

                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleUpdateDealerStatus(d.id, 'blocked')}
                              style={{
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                background: 'var(--danger-bg)',
                                border: '1px solid var(--danger-border)',
                                color: 'var(--danger)',
                                fontWeight: '500',
                                fontSize: '0.8rem',
                                cursor: isActionLoading ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <Ban size={14} /> Block / Reject
                            </button>
                          </div>
                        )}
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
                <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Trophy size={24} color="var(--warning)" />
                  Dealer Revenue Leaderboard
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                  Platform-wide ranking of approved dealers ordered by total sales revenue generated.
                </p>
              </div>

              {/* Sort Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface-hover)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setLeaderboardSort('month')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: leaderboardSort === 'month' ? 'var(--primary)' : 'transparent',
                    color: leaderboardSort === 'month' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '500',
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
                    background: leaderboardSort === 'alltime' ? 'var(--primary)' : 'transparent',
                    color: leaderboardSort === 'alltime' ? '#fff' : 'var(--text-muted)',
                    fontWeight: '500',
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
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
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        border: rank === 1 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
                        background: rank === 1 ? 'var(--warning-bg)' : 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: `${badgeColor}25`,
                          color: badgeColor,
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${badgeColor}50`,
                          flexShrink: 0
                        }}>
                          #{rank}
                        </div>

                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1rem' }}>
                            {lb.shop_name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {lb.phone ? `Ph: ${lb.phone} • ` : ''}{lb.total_sales_count} sales
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This Month</div>
                          <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.05rem' }}>
                            ₹{Number(lb.this_month_revenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '0.85rem' }}>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>All-Time</div>
                          <div style={{ fontWeight: '600', color: 'var(--info)', fontSize: '0.95rem' }}>
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

        {/* ============================================================ */}
        {/* TAB 4: SETTINGS MODULE                                      */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            user={user}
            onProfileUpdated={() => {
              fetchDealers()
              fetchLeaderboard()
            }}
          />
        )}


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
    </DashboardLayout>
  )
}



