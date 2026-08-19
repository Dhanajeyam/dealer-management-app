import React from 'react'
import { Link } from 'react-router-dom'
import {
  Store,
  Sparkles,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Printer,
  QrCode,
  Layers,
  Clock,
  ChevronRight,
  Award,
  Leaf,
  FileText,
  BadgePercent,
  Check,
  Wheat,
  Sprout,
  Sun,
  Mail,
  HelpCircle,
  Database,
  ArrowUpRight
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)', // #F5F8F6
      color: 'var(--text-main)', // #17201A
      fontFamily: 'var(--font-family)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (LIGHT THEME)                                               */}
      {/* ========================================================================= */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1rem'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem'
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0
            }}>
              <Store size={20} color="#FFFFFF" />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.015em', display: 'block', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ChemicalShop
              </span>
              <span className="desktop-only" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                Agri-Dealer Retail Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links with Hover State */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.88rem',
            fontWeight: '500'
          }} className="landing-desktop-nav">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#showcase" className="landing-nav-link">Core Highlights</a>
            <a href="#solutions" className="landing-nav-link">Solutions</a>
            <a href="#built-for-dealers" className="landing-nav-link">Why ChemicalShop</a>
            <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <Link
              to="/app"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: '500',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                whiteSpace: 'nowrap'
              }}
            >
              Sign In
            </Link>

            <Link
              to="/app?mode=signup"
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: 'var(--shadow-glow)',
                whiteSpace: 'nowrap'
              }}
            >
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION - LIGHT BACKGROUND WITH SPLIT AGRICULTURAL PHOTO CARD     */}
      {/* ========================================================================= */}
      <section style={{
        position: 'relative',
        padding: '3.5rem 1rem 4rem 1rem',
        background: 'var(--bg-primary)',
        overflow: 'hidden'
      }}>
        {/* Subtle radial emerald tint */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Column: Headline, Value Proposition & Actions */}
          <div style={{ textAlign: 'left' }}>
            {/* Sowing Season Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              background: 'var(--primary-light)',
              border: '1px solid rgba(22, 163, 74, 0.25)',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: '500',
              marginBottom: '1.25rem',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
            }}>
              <Sprout size={16} />
              <span>Built for Indian Agri-Input Retailers</span>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(1.9rem, 4.5vw, 3.2rem)',
              fontWeight: '700',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              marginBottom: '1.25rem'
            }}>
              Smart Stock, 15-Sec Billing &amp; Farmer Credit Tracking for Agri-Dealers
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: '0.98rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}>
              Designed specifically for agrochemical store owners. Group formulations by manufacturer brand (Bayer, Syngenta, UPL), generate GST-ready thermal bills in seconds, and eliminate untracked farmer credit.
            </p>

            {/* Primary Action Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              <Link
                to="/app?mode=signup"
                style={{
                  padding: '0.85rem 1.75rem',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                Register Dealer Shop <ArrowRight size={18} />
              </Link>

              <Link
                to="/app"
                style={{
                  padding: '0.85rem 1.5rem',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s'
                }}
              >
                <Store size={18} color="var(--primary)" /> Existing Dealer Login
              </Link>
            </div>

            {/* Trust & Key Features Checklist */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.65rem',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              fontWeight: '500',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={15} color="var(--primary)" /> No Credit Card Required
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={15} color="var(--primary)" /> 15-Sec Thermal Billing
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={15} color="var(--primary)" /> Dynamic Shop UPI QR
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={15} color="var(--primary)" /> Farmer Credit Ledger
              </span>
            </div>
          </div>

          {/* Right Column: Soft Elevated Agricultural Photo Frame */}
          <div style={{ position: 'relative' }}>
            <div className="landing-card" style={{
              overflow: 'hidden',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1000&q=80"
                alt="Agricultural crop field in morning sunlight"
                style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block' }}
              />

              {/* Floating Metric Overlay 1 (Top Left) */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.45rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 8px var(--primary)'
                }} />
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  Real-Time Cloud POS
                </span>
              </div>

              {/* Floating Metric Overlay 2 (Bottom Card Overlay) */}
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                left: '1rem',
                right: '1rem',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                boxShadow: 'var(--shadow-card)'
              }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500', display: 'block' }}>
                    Multi-Brand Inventory
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                    Bayer • Syngenta • UPL • Tata
                  </strong>
                </div>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid var(--primary-glow)',
                  flexShrink: 0
                }}>
                  15-Sec POS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SHOWCASE SECTION (PHOTO CARD WITH SOLID-COLOR EMERALD TEXT PANEL)       */}
      {/* ========================================================================= */}
      <section id="showcase" style={{
        padding: '4rem 1rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Core Dealership Pillars
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '700', letterSpacing: '-0.015em', color: 'var(--text-main)', marginTop: '0.4rem' }}>
              Engineered for Speed, Accuracy &amp; Zero Lost Revenue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
              Three high-impact capabilities that give agri-input dealers complete control over their daily retail counter.
            </p>
          </div>

          {/* 3 Showcase Cards with Solid-Color Emerald Text Overlay Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Showcase 1: Farmer Credit Ledger */}
            <div className="landing-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}>
              {/* Photo Area */}
              <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=700&q=80"
                  alt="Farmer inspecting crops"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }}>
                  CREDIT LEDGER
                </span>
              </div>

              {/* Solid-Color Emerald Bottom Text Panel */}
              <div style={{
                background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                color: '#FFFFFF',
                padding: '1.75rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '0.6rem' }}>
                    Farmer Accounts & Seasonal Credit
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#DCFCE7', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                    Maintain transparent, bill-by-bill ledgers for every farmer. Record partial payments during weeding, top-dressing, and harvest without missing a single rupee.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.85rem', fontSize: '0.8rem', color: '#DCFCE7', fontWeight: '500' }}>
                  ✓ Dedicated "Credit Sale" blue badges & audit trails
                </div>
              </div>
            </div>

            {/* Showcase 2: Fast POS Billing & Thermal WiFi Print */}
            <div className="landing-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}>
              {/* Photo Area */}
              <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=700&q=80"
                  alt="Agri store counter grain and inventory checkout"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }}>
                  HIGH-SPEED POS
                </span>
              </div>

              {/* Solid-Color Emerald Bottom Text Panel */}
              <div style={{
                background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                color: '#FFFFFF',
                padding: '1.75rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '0.6rem' }}>
                    15-Sec Billing & Dynamic Shop UPI QR
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#DCFCE7', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                    Speed through the morning sowing queue. Select customer, pick chemical formulations, and print a thermal receipt with an exact UPI payment QR code in 15 seconds.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.85rem', fontSize: '0.8rem', color: '#DCFCE7', fontWeight: '500' }}>
                  ✓ 58mm/80mm thermal print & invoice receipts
                </div>
              </div>
            </div>

            {/* Showcase 3: Brand-First Stock Inventory */}
            <div className="landing-card" style={{
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: 0
            }}>
              {/* Photo Area */}
              <div style={{ position: 'relative', height: '220px', width: '100%', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=700&q=80"
                  alt="Crop protection formulation"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '6px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)'
                }}>
                  STOCK HUB
                </span>
              </div>

              {/* Solid-Color Emerald Bottom Text Panel */}
              <div style={{
                background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                color: '#FFFFFF',
                padding: '1.75rem',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#FFFFFF', marginBottom: '0.6rem' }}>
                    Brand Catalogs & Real-Time Valuation
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#DCFCE7', lineHeight: '1.55', marginBottom: '1.25rem' }}>
                    Organize your store by Bayer, Syngenta, UPL, and Tata Rallis. Know exactly how many bottles are on shelves and your live inventory valuation in real time.
                  </p>
                </div>
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '0.85rem', fontSize: '0.8rem', color: '#DCFCE7', fontWeight: '500' }}>
                  ✓ Automatic valuation computed as SUM(Qty × Price)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURE GRID - CLEAN MINIMAL SAAS WITH HOVER BORDER HIGHLIGHT          */}
      {/* ========================================================================= */}
      <section id="features" style={{ padding: '4rem 1rem', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Complete Feature Suite
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '700', letterSpacing: '-0.015em', color: 'var(--text-main)', marginTop: '0.4rem' }}>
              Everything Required to Run a High-Volume Agri Store
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
              Clean, reliable tools tailored for the daily operational workflow of pesticide, fertilizer, and seed dealerships.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {/* Feature 1: Brand Stock */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Package size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Brand-Based Stock Management
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Categorize insecticides, fungicides, and fertilizers by manufacturer (Bayer, Syngenta, UPL, Tata). Automatic inventory valuation computed as <code style={{ color: 'var(--primary)', fontWeight: '600' }}>SUM(Qty × Price)</code>.
                </p>
              </div>
            </div>

            {/* Feature 2: Farmer Ledger */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--credit)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Farmer Purchase History &amp; Ledger
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Store farmer phone numbers, village names, and complete itemized historical purchase records. Search any customer in under 2 seconds.
                </p>
              </div>
            </div>

            {/* Feature 3: Fast POS & Thermal Printing */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Printer size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  15-Second Billing &amp; WiFi Print
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Lightning fast cart checkout with automatic line total calculations, real-time stock deduction, and instant 58mm/80mm thermal receipt printing.
                </p>
              </div>
            </div>

            {/* Feature 4: Partial Payment & Credit Tracking */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(217, 119, 6, 0.1)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Partial Payment &amp; Credit Tracking
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Split any sale between cash paid upfront and credit owed. Clear visual status tags: <span style={{ color: 'var(--credit)', fontWeight: '600' }}>Credit Sale</span>, <span style={{ color: 'var(--warning)', fontWeight: '600' }}>Partial Due</span>, and <span style={{ color: 'var(--success)', fontWeight: '600' }}>Paid</span>.
                </p>
              </div>
            </div>

            {/* Feature 5: Dynamic UPI QR */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Dynamic Shop UPI QR Payments
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Configurable shop UPI ID (Paytm, PhonePe, GPay, Bank VPA) automatically generates a dynamic payment QR code with the exact bill amount for fast customer scans.
                </p>
              </div>
            </div>

            {/* Feature 6: Revenue Analytics */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Revenue &amp; Sales Analytics
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                  Real-time sales insights for Today, This Week, and This Month. Discover your Top 5 best-selling chemicals and low-stock replenishment reorders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PROBLEM VS. SOLUTION STRIP WITH INCREASED VISUAL SEPARATION            */}
      {/* ========================================================================= */}
      <section id="solutions" style={{
        padding: '4rem 1rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Solving Everyday Dealer Bottlenecks
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '700', letterSpacing: '-0.015em', color: 'var(--text-main)', marginTop: '0.4rem' }}>
              Built to Eliminate Retail Friction &amp; Lost Revenue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
              Agri-input retail has unique business challenges. Here is how ChemicalShop systematically solves each:
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {/* Pair 1: Credit Tracking */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              {/* Problem Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem'
                }}>
                  <XCircle size={13} /> The Challenge
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Lost Farmer Credit &amp; Disputed Dues
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Handwritten ledger books get damaged or lost. Seasonal credit accumulates without itemized bill proof, leading to disputes at payment time.
                </p>
              </div>

              {/* Distinct Separator */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.15rem 0' }} />

              {/* Solution Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle2 size={13} /> ChemicalShop Solution
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.45' }}>
                  Transparent farmer ledgers with bill-by-bill purchase history and one-click partial payment recording.
                </p>
              </div>
            </div>

            {/* Pair 2: Blind Stock */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              {/* Problem Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem'
                }}>
                  <XCircle size={13} /> The Challenge
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Blind Stock Across 50+ Brands
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Dealers accidentally run out of critical pest-control sprays during peak infestation while overstocked chemicals sit on shelves.
                </p>
              </div>

              {/* Distinct Separator */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.15rem 0' }} />

              {/* Solution Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle2 size={13} /> ChemicalShop Solution
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.45' }}>
                  Real-time stock catalog organized by brand (Bayer, Syngenta, UPL) with automatic valuation and out-of-stock badges.
                </p>
              </div>
            </div>

            {/* Pair 3: Billing Queues */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              {/* Problem Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem'
                }}>
                  <XCircle size={13} /> The Challenge
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Slow Paper Bills &amp; Math Errors
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Writing bills by hand creates long queues in the morning rush, causes calculation errors, and delays customer service.
                </p>
              </div>

              {/* Distinct Separator */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.15rem 0' }} />

              {/* Solution Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle2 size={13} /> ChemicalShop Solution
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.45' }}>
                  15-second fast checkout with instant thermal receipt generation and automatic stock deduction.
                </p>
              </div>
            </div>

            {/* Pair 4: Cash vs UPI Reconciliation */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              {/* Problem Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.65rem'
                }}>
                  <XCircle size={13} /> The Challenge
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Messy Cash vs. UPI Reconciliation
                </h4>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Cash box totals never match end-of-day bills when some customers pay partial cash, some UPI, and others take credit.
                </p>
              </div>

              {/* Distinct Separator */}
              <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.15rem 0' }} />

              {/* Solution Block */}
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem'
                }}>
                  <CheckCircle2 size={13} /> ChemicalShop Solution
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.45' }}>
                  Live revenue analytics separating Cash, UPI, and Credit sales automatically with exact payment audit trails.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BUILT FOR AGRI-DEALERS SPECIFICALLY                                    */}
      {/* ========================================================================= */}
      <section id="built-for-dealers" style={{ padding: '4rem 1rem', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.78rem',
                fontWeight: '500',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)'
              }}>
                <Leaf size={14} /> Domain Specialized Software
              </div>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '700', letterSpacing: '-0.015em', color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
                Why Generic Supermarket Billing Software Fails Agri-Stores
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Agri-input retail is fundamentally different from retail grocery stores. Farmers buy specific technical chemical formulations on credit cycles and return later after harvesting their crop.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.15rem' }}>
                    <Check size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: '600', display: 'block' }}>Brand-First Inventory Architecture</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Group chemicals by Bayer, Syngenta, UPL, Dhanuka, and Tata Rallis with pack sizes and active ingredients.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.15rem' }}>
                    <Check size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: '600', display: 'block' }}>Harvest-Cycle Credit Management</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Designed around partial advances and crop cycles (Paddy, Cotton, Sugarcane, Chilli) so no balance is lost.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.15rem' }}>
                    <Check size={15} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: '600', display: 'block' }}>GST &amp; Invoice Compliance</strong>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Generate clean GSTIN-compliant thermal bills and PDF invoices with your shop details and contact numbers.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Matrix Visual Card with Elevated Depth */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', height: '130px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <img
                  src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80"
                  alt="Agricultural field crops and pesticide care"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)'
                }} />
                <span style={{
                  position: 'absolute',
                  bottom: '0.65rem',
                  left: '0.85rem',
                  color: '#FFFFFF',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <Layers size={15} color="var(--primary)" /> Top Supported Chemical Brands
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                {['Bayer CropScience', 'Syngenta India', 'UPL Limited', 'FMC Corporation', 'Tata Rallis India', 'Dhanuka Agritech', 'Coromandel Intl.', 'PI Industries'].map((brand, idx) => (
                  <div key={idx} style={{
                    padding: '0.6rem 0.75rem',
                    background: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{brand}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--primary-light)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '500', textAlign: 'center' }}>
                + Add custom local brands and fertilizer batches in 1-click
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. HOW IT WORKS (4-STEP FLOW)                                             */}
      {/* ========================================================================= */}
      <section id="how-it-works" style={{
        padding: '4rem 1rem',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', color: 'var(--primary)' }}>
              Simple 4-Step Workflow
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: '700', letterSpacing: '-0.015em', color: 'var(--text-main)', marginTop: '0.4rem' }}>
              How ChemicalShop Works in Your Store
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '580px', margin: '0.5rem auto 0 auto' }}>
              No complicated training required. Any store assistant can master the workflow in 5 minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {/* Step 1 */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem'
                }}>
                  Step 01
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Add Stock by Brand
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Enter product names, brand, available bottle/bag quantity, and selling prices.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--credit)',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem'
                }}>
                  Step 02
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Farmer Select &amp; Cart
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Select an existing farmer or add a new customer. Pick products directly from live stock.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(217, 119, 6, 0.1)',
                  color: 'var(--warning)',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem'
                }}>
                  Step 03
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Instant Bill &amp; QR Pay
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Generate GST bill in seconds. Customer pays via Cash, dynamic UPI QR code, or takes credit.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="landing-card" style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '600',
                  fontSize: '0.78rem',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  marginBottom: '0.75rem'
                }}>
                  Step 04
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  Track Dues &amp; Settle
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Review outstanding balances anytime in the Dues tab and record partial payment collections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. HIGH-CONTRAST EMERALD CTA SECTION                                      */}
      {/* ========================================================================= */}
      <section style={{ padding: '3.5rem 1rem 4.5rem 1rem', background: 'var(--bg-primary)' }}>
        <div style={{
          maxWidth: '1040px',
          margin: '0 auto',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          color: '#FFFFFF',
          boxShadow: '0 25px 60px -10px rgba(21, 128, 61, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.8rem)', fontWeight: '700', letterSpacing: '-0.015em', marginBottom: '0.85rem', color: '#FFFFFF' }}>
            Ready to Modernize Your Agri-Chemical Store?
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#DCFCE7', maxWidth: '650px', margin: '0 auto 2rem auto', lineHeight: '1.6', fontWeight: '400' }}>
            Join smart pesticide and fertilizer dealers simplifying their daily billing, brand stock tracking, and farmer credit collections.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              to="/app?mode=signup"
              style={{
                padding: '0.85rem 1.85rem',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#15803D',
                fontSize: '0.95rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                transition: 'transform 0.15s'
              }}
            >
              Register Dealer Shop <ArrowRight size={17} />
            </Link>

            <Link
              to="/app"
              style={{
                padding: '0.85rem 1.65rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                fontSize: '0.95rem',
                fontWeight: '500',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s'
              }}
            >
              Dealer Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. REDESIGNED CLEAN MULTI-COLUMN FOOTER (PRIVACY-COMPLIANT)               */}
      {/* ========================================================================= */}
      <footer style={{
        marginTop: 'auto',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '2.5rem 1rem 1.5rem 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Decorative Agricultural Motif in Corner */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          opacity: 0.04,
          pointerEvents: 'none',
          color: 'var(--primary)'
        }}>
          <Sprout size={240} />
        </div>

        <div style={{ maxWidth: '1140px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Row 1: Brand Logo + Generic Contact Link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)'
              }}>
                <Store size={20} color="#FFFFFF" />
              </div>
              <div>
                <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.015em', display: 'block', lineHeight: 1.1 }}>
                  ChemicalShop
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '400' }}>
                  Agri-Dealer Management System
                </span>
              </div>
            </div>

            {/* Generic Support Action (No exposed personal numbers) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <a
                href="mailto:support@chemicalshop.in"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s'
                }}
              >
                <Mail size={15} color="var(--primary)" /> support@chemicalshop.in
              </a>

              <Link
                to="/app?mode=signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--primary-light)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Open Account <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Row 2: Multi-Column Links & Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1.75rem',
            padding: '2rem 0',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {/* Col 1: Summary */}
            <div style={{ maxWidth: '280px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                About the Platform
              </span>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Dedicated stock catalog, rapid POS billing, and farmer credit ledger system built specifically for agricultural retailers across India.
              </p>
            </div>

            {/* Col 2: Retail Features */}
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                Retail Capabilities
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Brand-Based Stock Catalog</a>
                <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>15-Sec Thermal WiFi POS</a>
                <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dynamic Shop UPI QR Codes</a>
                <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Revenue & Sales Analytics</a>
              </div>
            </div>

            {/* Col 3: Farmer & Credit Solutions */}
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                Farmer & Credit Ledger
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                <a href="#solutions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Farmer Directory by Village</a>
                <a href="#solutions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Itemized Purchase History</a>
                <a href="#solutions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Partial Credit Collections</a>
                <a href="#solutions" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Harvest Settle Audit Trails</a>
              </div>
            </div>

            {/* Col 4: Platform Access */}
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', display: 'block', marginBottom: '0.75rem' }}>
                Dealer Portal Access
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem' }}>
                <Link to="/app" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Existing Dealer Login →</Link>
                <Link to="/app?mode=signup" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Register New Dealership</Link>
                <span style={{ color: 'var(--text-muted)' }}>GSTIN & Thermal Print Ready</span>
                <span style={{ color: 'var(--text-muted)' }}>Cloud Synced & Encrypted</span>
              </div>
            </div>
          </div>

          {/* Row 3: Bottom Copyright & Version */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '1.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <span>© {new Date().getFullYear()} ChemicalShop App. All rights reserved.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Leaf size={14} color="var(--primary)" /> Version 0.1.0 (Agri-Retail ERP)
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
