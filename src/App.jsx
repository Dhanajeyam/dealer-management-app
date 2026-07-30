import React, { useState, useEffect } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import AuthCard from './components/auth/AuthCard'
import PendingGate from './components/gates/PendingGate'
import BlockedGate from './components/gates/BlockedGate'
import DealerDashboard from './components/dashboards/DealerDashboard'
import AdminPlaceholder from './components/dashboards/AdminPlaceholder'
import { Sparkles, Loader2 } from 'lucide-react'

export default function App() {
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
        color: '#fff',
        gap: '1rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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

  // 2. Unauthenticated State -> Render Auth Card (Login / Signup)
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

  // 3. Authenticated Admin -> Render Admin Workspace Placeholder
  if (profile?.role === 'admin') {
    return (
      <AdminPlaceholder
        profile={profile}
        user={user}
        onSignOut={handleSignOut}
      />
    )
  }

  // 4. Authenticated Dealer States
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
