import React, { useState } from 'react'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowUpRight, 
  QrCode, 
  Printer,
  Sparkles,
  Store,
  Layers,
  Clock
} from 'lucide-react'

export default function DashboardPreviewMockup() {
  const [activeTab, setActiveTab] = useState('stock') // 'stock' | 'sales' | 'dues'

  return (
    <div style={{
      width: '100%',
      maxWidth: '1000px',
      margin: '0 auto',
      borderRadius: '18px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-surface)',
      boxShadow: '0 25px 60px -15px rgba(22, 163, 74, 0.18), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
      textAlign: 'left'
    }}>
      {/* Mock Browser Header Bar */}
      <div style={{
        padding: '0.75rem 1.25rem',
        background: 'var(--bg-surface-hover)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#EF4444' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)', marginLeft: '0.6rem' }}>
            app.chemicalshop.in/app
          </span>
        </div>

        {/* Shop Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: '500'
          }}>
            <Store size={12} /> Dharani Agro Store (GSTIN: 33AAAAA0000A1Z5)
          </div>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}>
            Live Workspace
          </span>
        </div>
      </div>

      {/* Mock App Sub-Nav / Metric Ribbon */}
      <div style={{
        padding: '0.85rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        {/* Interactive Tab Switcher in Mockup */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-surface-hover)',
          padding: '0.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'stock' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'stock' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s'
            }}
          >
            <Package size={14} /> Stock Catalog
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'sales' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'sales' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s'
            }}
          >
            <ShoppingCart size={14} /> Sales & Billing
          </button>
          <button
            onClick={() => setActiveTab('dues')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'dues' ? 'var(--credit)' : 'transparent',
              color: activeTab === 'dues' ? '#FFFFFF' : 'var(--text-muted)',
              fontSize: '0.8rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s'
            }}
          >
            <AlertTriangle size={14} /> Credit Dues (Udhaar)
          </button>
        </div>

        {/* Fast Action Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Today's Revenue:
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)' }}>
            ₹38,450.00
          </span>
        </div>
      </div>

      {/* Main Mockup Body Area */}
      <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-primary)' }}>
        {/* KPI Mini-Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Inventory Value</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>₹4,82,500</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '500', background: 'var(--primary-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>6 Brands</span>
            </div>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Today's Bills Created</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>14 Sales</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '500', background: 'var(--primary-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>100% Synced</span>
            </div>
          </div>

          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Outstanding Farmer Udhaar</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--credit)' }}>₹64,200</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--credit)', fontWeight: '500', background: 'var(--credit-bg)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>12 Farmers</span>
            </div>
          </div>
        </div>

        {/* Tab 1 Content: Stock by Brand Showcase */}
        {activeTab === 'stock' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
            {/* Bayer Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                    Bayer CropScience
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>4 Active Formulations</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  ₹1,42,000 Val.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Regent SC (Fipronil 5%)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>32 in stock • ₹850</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Confidor (Imidacloprid)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>18 in stock • ₹420</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Nativo Fungicide</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>15 in stock • ₹1,250</span>
                </div>
              </div>
            </div>

            {/* Syngenta Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                    Syngenta India
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3 Active Formulations</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  ₹1,18,500 Val.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Amistar Top (Azoxystrobin)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>24 in stock • ₹1,680</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Karate Insecticide (Lambda)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>40 in stock • ₹390</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Score Fungicide</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>12 in stock • ₹920</span>
                </div>
              </div>
            </div>

            {/* UPL Card */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                    UPL Limited
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3 Active Formulations</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--primary)', background: 'var(--primary-light)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                  ₹96,000 Val.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Saaf Fungicide (Carbendazim)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>60 in stock • ₹450</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Ulala (Flonicamid)</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>20 in stock • ₹1,120</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-surface-hover)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Lancer Gold</span>
                  <span style={{ color: 'var(--primary)', fontWeight: '600' }}>28 in stock • ₹680</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Sales & Quick Billing Log */}
        {activeTab === 'sales' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  Latest Sales Invoices
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  Fast POS with thermal printing & QR payment
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '500' }}>
                ● Real-time stock deducted
              </span>
            </div>

            {/* Sale Row 1 */}
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>#INV-2026-084</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>• Ramesh Kumar (Vill: Kallakurichi)</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '500', color: 'var(--success)', background: 'var(--success-bg)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    Paid (Cash)
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Items: Bayer Regent SC (2x), UPL Saaf (1x) • Today 11:30 AM
                </span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--primary)' }}>
                ₹2,150.00
              </span>
            </div>

            {/* Sale Row 2 - Credit Sale */}
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.85rem' }}>#INV-2026-083</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>• Murugan S (Vill: Alanganallur)</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: '500', color: 'var(--credit)', background: 'var(--credit-bg)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    Credit Sale • Due ₹4,200.00
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Items: Syngenta Amistar Top (2x), FMC Coragen (1x) • Today 10:45 AM
                </span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
                ₹4,200.00
              </span>
            </div>
          </div>
        )}

        {/* Tab 3 Content: Credit Dues Ledger */}
        {activeTab === 'dues' && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  Farmer Udhaar (Credit) Directory
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  Track outstanding balances & record partial collections
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--credit)', fontWeight: '600', background: 'var(--credit-bg)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                ₹64,200 Total Outstanding
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Chinnasamy V.</strong>
                  <span style={{ color: 'var(--credit)', fontWeight: '700', fontSize: '0.88rem' }}>₹12,400 Due</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                  Ph: 98421-XXXXX • 3 Unpaid Invoices (Cotton season)
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Kaliappan G.</strong>
                  <span style={{ color: 'var(--credit)', fontWeight: '700', fontSize: '0.88rem' }}>₹8,750 Due</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                  Ph: 97860-XXXXX • 2 Unpaid Invoices (Paddy season)
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface-hover)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Senthil Nathan</strong>
                  <span style={{ color: 'var(--warning)', fontWeight: '700', fontSize: '0.88rem' }}>₹3,200 Due</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                  Ph: 94432-XXXXX • Partial paid ₹5,000 / ₹8,200 bill
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
