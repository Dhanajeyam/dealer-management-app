import React, { useState, useEffect } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Laptop, 
  Sparkles, 
  GitBranch, 
  Layers, 
  ArrowRight 
} from 'lucide-react'

export default function App() {
  const [configured, setConfigured] = useState(false)
  const [deviceType, setDeviceType] = useState('Desktop')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    setConfigured(isSupabaseConfigured())

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
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
              Phase 1 • Step 1 Scaffolding Complete
            </span>
          </div>
        </div>

        {/* Device Viewport Pill */}
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

      {/* Main Responsive Body */}
      <main className="container" style={{ flex: 1, padding: '2.5rem 1.5rem' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '50px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={16} /> Step 1 Complete
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: '800', color: '#fff', marginBottom: '0.75rem' }}>
            Project Scaffolded & Ready
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            React web application is initialized with Vite, styled with a fully responsive layout system, and prepared for Supabase backend connection.
          </p>
        </div>

        {/* Status Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          
          {/* Supabase Status Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Database size={22} color={configured ? '#10b981' : '#f59e0b'} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Supabase Connection</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Backend Provider</span>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.65rem',
                borderRadius: '12px',
                background: configured ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: configured ? '#10b981' : '#f59e0b'
              }}>
                <span className="status-pulse" style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: configured ? '#10b981' : '#f59e0b'
                }} />
                {configured ? 'Connected' : 'Pending Credentials'}
              </div>
            </div>

            {configured ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Supabase client initialized with environment variables. Ready for database schema & auth integration in upcoming steps.
              </p>
            ) : (
              <div>
                <p style={{ fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  <AlertTriangle size={16} /> Environment variables needed in <code>.env</code>
                </p>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-muted)'
                }}>
                  VITE_SUPABASE_URL=<br/>
                  VITE_SUPABASE_ANON_KEY=
                </div>
              </div>
            )}
          </div>

          {/* Git & Responsive Framework Card */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GitBranch size={22} color="#3b82f6" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Git & Architecture</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Version Control & Stack</span>
              </div>
            </div>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Git repository initialized
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Responsive breakpoints configured
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#10b981" /> Lucide UI icons integrated
              </li>
            </ul>
          </div>
        </div>

        {/* Workflow Roadmap Banner */}
        <div className="glass-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(19, 31, 51, 0.9) 0%, rgba(27, 42, 69, 0.6) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Layers size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Build Workflow Roadmap</h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '0.2rem' }}>Step 1 — Setup (Active)</div>
              <div style={{ color: 'var(--text-muted)' }}>Vite + React, Git, Supabase setup</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Step 2 — Schema</div>
              <div style={{ color: 'var(--text-muted)' }}>Tables: users, products, farmers, sales</div>
            </div>
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>Step 3 — Security</div>
              <div style={{ color: 'var(--text-muted)' }}>Row-Level Security (RLS) policies</div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        Agri-Chemical Dealer Management App • Step 1 Complete • Ready for Step 2
      </footer>
    </div>
  )
}
