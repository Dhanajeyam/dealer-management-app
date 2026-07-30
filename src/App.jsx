import React, { useState, useEffect } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Laptop, 
  Sparkles, 
  GitBranch, 
  Layers, 
  RefreshCw,
  Copy,
  Check,
  Table
} from 'lucide-react'

const REQUIRED_TABLES = [
  { name: 'profiles', desc: 'User profiles (dealers & admin) linked to auth.users' },
  { name: 'products', desc: 'Inventory items owned by dealers (brand, name, qty, price)' },
  { name: 'farmers', desc: 'Farmer customer records (name, phone, village)' },
  { name: 'sales', desc: 'Sale transaction headers (dealer_id, farmer_id, total)' },
  { name: 'sale_items', desc: 'Sale line items with snapshot fields for historical accuracy' }
]

export default function App() {
  const [configured, setConfigured] = useState(false)
  const [deviceType, setDeviceType] = useState('Desktop')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [tableStatus, setTableStatus] = useState({})
  const [checking, setChecking] = useState(false)
  const [copied, setCopied] = useState(false)

  const checkTables = async () => {
    if (!isSupabaseConfigured()) return
    setChecking(true)
    const results = {}

    for (const table of REQUIRED_TABLES) {
      try {
        // Query zero rows to check if table exists in Supabase
        const { error, status } = await supabase
          .from(table.name)
          .select('id', { count: 'exact', head: true })

        if (error) {
          // If table doesn't exist, Supabase returns 42P01 / PGRST204 relation missing error
          if (error.code === '42P01' || error.message?.includes('does not exist') || status === 404) {
            results[table.name] = { exists: false, message: 'Table missing in database' }
          } else {
            // Table exists (may have RLS enabled or permission restriction, but table is present)
            results[table.name] = { exists: true, message: `Table exists (${error.message || 'Ready'})` }
          }
        } else {
          results[table.name] = { exists: true, message: 'Table exists & accessible' }
        }
      } catch (err) {
        results[table.name] = { exists: false, message: err.message || 'Verification error' }
      }
    }

    setTableStatus(results)
    setChecking(false)
  }

  useEffect(() => {
    const isConf = isSupabaseConfigured()
    setConfigured(isConf)

    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      if (width < 640) setDeviceType('Mobile Phone')
      else if (width < 1024) setDeviceType('Tablet')
      else if (width < 1440) setDeviceType('Laptop')
      else setDeviceType('Desktop PC')
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    if (isConf) {
      checkTables()
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const copySqlLocation = () => {
    navigator.clipboard.writeText('supabase/migrations/001_initial_schema.sql')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const allTablesExist = REQUIRED_TABLES.every(t => tableStatus[t.name]?.exists)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Banner / Navbar */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 19, 32, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: 0 }}>
              Agri-Chemical Dealer Portal
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Phase 1 • Step 2: Database Schema
            </span>
          </div>
        </div>

        {/* Viewport indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.9rem',
          borderRadius: '20px',
          background: 'var(--bg-surface-hover)',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-main)'
        }}>
          {windowWidth < 640 && <Smartphone size={16} color="#10b981" />}
          {windowWidth >= 640 && windowWidth < 1024 && <Tablet size={16} color="#3b82f6" />}
          {windowWidth >= 1024 && windowWidth < 1440 && <Laptop size={16} color="#f59e0b" />}
          {windowWidth >= 1440 && <Monitor size={16} color="#a855f7" />}
          <span>{deviceType} ({windowWidth}px)</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            background: allTablesExist ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${allTablesExist ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
            color: allTablesExist ? '#10b981' : '#3b82f6',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            {allTablesExist ? <CheckCircle2 size={16} /> : <Database size={16} />}
            {allTablesExist ? 'Step 2 Schema Active' : 'Step 2 — Database Schema Verification'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>
            Supabase Relational Database Schema
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>
            Version-controlled SQL migration file generated under <code>supabase/migrations/001_initial_schema.sql</code>.
          </p>
        </div>

        {/* Database Tables Verification Dashboard */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Table size={24} color="#10b981" />
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff' }}>Database Tables Status</h3>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Real-time Supabase Table Check</span>
              </div>
            </div>

            <button 
              onClick={checkTables}
              disabled={checking || !configured}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                cursor: checking ? 'wait' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              <RefreshCw size={14} className={checking ? 'status-pulse' : ''} />
              {checking ? 'Checking...' : 'Re-check Tables'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {REQUIRED_TABLES.map(table => {
              const status = tableStatus[table.name]
              const exists = status?.exists

              return (
                <div key={table.name} style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: `1px solid ${exists ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ flex: '1 1 250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <code style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>public.{table.name}</code>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {table.desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {exists ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        <CheckCircle2 size={14} /> Created & Ready
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}>
                        <AlertTriangle size={14} /> Run SQL Migration
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Migration Run Guidance Box */}
        {!allTablesExist && (
          <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(19, 31, 51, 0.9) 0%, rgba(27, 42, 69, 0.7) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Database size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>Execute Migration in Supabase</h3>
              </div>

              <button
                onClick={copySqlLocation}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '8px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Path Copied!' : 'Copy Migration Path'}
              </button>
            </div>

            <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.7' }}>
              <li>Open your Supabase Dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>supabase.com/dashboard</a></li>
              <li>Select your project and click <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Click <strong>"New Query"</strong></li>
              <li>Paste the contents of <code>supabase/migrations/001_initial_schema.sql</code> and click <strong>Run</strong></li>
              <li>Return here and click <strong>"Re-check Tables"</strong> above!</li>
            </ol>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        Agri-Chemical Management App • Step 2 Schema Setup • Ready for Step 3 (RLS)
      </footer>
    </div>
  )
}
