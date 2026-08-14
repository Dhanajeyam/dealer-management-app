import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { initThemeListener } from './lib/theme'
import { isTrialExpired } from './lib/trial'
import AuthCard from './components/auth/AuthCard'
import PendingGate from './components/gates/PendingGate'
import BlockedGate from './components/gates/BlockedGate'
import TrialExpiredGate from './components/gates/TrialExpiredGate'
import DealerDashboard from './components/dashboards/DealerDashboard'
import AdminDashboard from './components/dashboards/AdminDashboard'
import LandingPage from './components/landing/LandingPage'
import { Sparkles, Loader2 } from 'lucide-react'

// Internal Core Application (runs under /app)
function AppMain() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
      }
      setProfile(data)
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Check existing active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  const handleRefreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  // 1. Initial Loading Screen
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={26} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          <Loader2 size={18} className="status-pulse" />
          <span>Loading session...</span>
        </div>
      </div>
    )
  }

  // 2. Dev Preview / Visual Testing Support
  const urlParams = new URLSearchParams(window.location.search)
  const isDealerPreview = urlParams.get('preview') === 'dealer'
  const isDealerTrialPreview = urlParams.get('preview') === 'dealer_trial'
  const isDealerExpiredTrialPreview = urlParams.get('preview') === 'dealer_expired_trial'
  const isDealerNoUpiPreview = urlParams.get('preview') === 'dealer_no_upi'
  const isAdminPreview = urlParams.get('preview') === 'admin'

  if (isDealerExpiredTrialPreview && !session) {
    return (
      <TrialExpiredGate
        profile={{
          shop_name: 'Dharani Agro Store',
          phone: '9360530134',
          status: 'approved',
          role: 'dealer',
          is_trial: true,
          trial_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }}
        user={{ email: 'dharanidharan48@gmail.com' }}
        onRefresh={() => {}}
        onSignOut={() => { window.location.href = '/' }}
      />
    )
  }

  if (isDealerTrialPreview && !session) {
    return (
      <DealerDashboard
        profile={{
          shop_name: 'Dharani Agro Store',
          phone: '9360530134',
          status: 'approved',
          role: 'dealer',
          is_trial: true,
          trial_ends_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          gstin: '33AAAAA0000A1Z5',
          upi_id: 'dharaniagro@okicici'
        }}
        user={{ email: 'dharanidharan48@gmail.com' }}
        onSignOut={() => { window.location.href = '/' }}
      />
    )
  }

  if (isDealerPreview && !session) {
    return (
      <DealerDashboard
        profile={{
          shop_name: 'Dharani Agro Store',
          phone: '9360530134',
          status: 'approved',
          role: 'dealer',
          is_trial: false,
          gstin: '33AAAAA0000A1Z5',
          upi_id: 'dharaniagro@okicici'
        }}
        user={{ email: 'dharanidharan48@gmail.com' }}
        onSignOut={() => { window.location.href = '/' }}
      />
    )
  }

  if (isDealerNoUpiPreview && !session) {
    return (
      <DealerDashboard
        profile={{
          shop_name: 'Dharani Agro Store',
          phone: '9360530134',
          status: 'approved',
          role: 'dealer',
          is_trial: false,
          gstin: '33AAAAA0000A1Z5',
          upi_id: ''
        }}
        user={{ email: 'dharanidharan48@gmail.com' }}
        onSignOut={() => { window.location.href = '/' }}
      />
    )
  }

  if (isAdminPreview && !session) {
    return (
      <AdminDashboard
        profile={{ shop_name: 'System Administration', role: 'admin' }}
        user={{ email: 'admin@chemicalshop.com' }}
        onSignOut={() => { window.location.href = '/' }}
      />
    )
  }

  // 3. Unauthenticated State -> Render Auth Card (Login / Signup)
  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--bg-primary)'
      }}>
        <AuthCard onAuthSuccess={() => {}} />
      </div>
    )
  }

  // 4. Authenticated Admin -> Render Admin Workspace Dashboard
  if (profile?.role === 'admin') {
    return (
      <AdminDashboard
        profile={profile}
        user={user}
        onSignOut={handleSignOut}
      />
    )
  }

  // 5. Authenticated Dealer States
  if (profile?.role === 'dealer' || !profile) {
    const status = profile?.status || 'pending'

    if (status === 'pending') {
      return (
        <PendingGate
          profile={profile}
          user={user}
          onRefresh={handleRefreshProfile}
          onSignOut={handleSignOut}
        />
      )
    }

    if (status === 'blocked') {
      return (
        <BlockedGate
          user={user}
          onSignOut={handleSignOut}
        />
      )
    }

    if (status === 'approved') {
      // Strict Gate Enforcement: Check if 7-day free trial has expired
      if (isTrialExpired(profile)) {
        return (
          <TrialExpiredGate
            profile={profile}
            user={user}
            onRefresh={handleRefreshProfile}
            onSignOut={handleSignOut}
          />
        )
      }

      return (
        <DealerDashboard
          profile={profile}
          user={user}
          onSignOut={handleSignOut}
        />
      )
    }
  }

  // Fallback default placeholder
  return (
    <PendingGate
      profile={profile}
      user={user}
      onRefresh={handleRefreshProfile}
      onSignOut={handleSignOut}
    />
  )
}

// Top-Level Router Application
export default function App() {
  // Initialize theme listener and clean up on unmount
  useEffect(() => {
    const cleanupTheme = initThemeListener()
    return () => cleanupTheme()
  }, [])

  return (
    <Routes>
      {/* Public Marketing Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Main Dealer / Admin Application */}
      <Route path="/app/*" element={<AppMain />} />

      {/* Aliases for direct authentication deep-links */}
      <Route path="/login" element={<Navigate to="/app" replace />} />
      <Route path="/signup" element={<Navigate to="/app?mode=signup" replace />} />

      {/* Catch-all route -> redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
