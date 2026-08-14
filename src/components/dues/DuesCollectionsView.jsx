import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  AlertCircle, 
  Search, 
  Users, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  FileText,
  CreditCard
} from 'lucide-react'
import RecordPaymentModal from '../sales/RecordPaymentModal'

export default function DuesCollectionsView({ user, shopProfile, onReprintBill }) {

  const [sales, setSales] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePaymentSale, setActivePaymentSale] = useState(null)
  const [expandedFarmers, setExpandedFarmers] = useState({})

  const toggleExpandFarmer = (farmerId) => {
    setExpandedFarmers(prev => ({
      ...prev,
      [farmerId]: !prev[farmerId]
    }))
  }

  const fetchData = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // Fetch all sales with farmer info and payments
      const { data: salesData, error: salesErr } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          farmer_id,
          farmers (
            id,
            name,
            phone,
            village
          ),
          sale_items (*),
          payments (*)
        `)
        .eq('dealer_id', user.id)
        .order('created_at', { ascending: false })

      if (salesErr) throw salesErr

      // Fetch all farmers
      const { data: farmersData, error: farmersErr } = await supabase
        .from('farmers')
        .select('*')
        .eq('dealer_id', user.id)
        .order('name', { ascending: true })

      if (farmersErr) throw farmersErr

      setSales(salesData || [])
      setFarmers(farmersData || [])
    } catch (err) {
      console.error('Error fetching dues collections data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user?.id])

  // Group sales by farmer and calculate total outstanding balance per farmer
  const farmerDuesMap = {}

  sales.forEach(sale => {
    const farmerId = sale.farmer_id || 'walk-in'
    const farmerName = sale.farmers?.name || (farmerId === 'walk-in' ? 'Walk-in Customers' : 'Unknown Farmer')
    const farmerPhone = sale.farmers?.phone || ''
    const farmerVillage = sale.farmers?.village || ''
    
    const totalAmount = Number(sale.total_amount || 0)
    const totalPaid = (sale.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const balanceDue = Math.max(0, totalAmount - totalPaid)

    if (!farmerDuesMap[farmerId]) {
      farmerDuesMap[farmerId] = {
        id: farmerId,
        name: farmerName,
        phone: farmerPhone,
        village: farmerVillage,
        totalOutstanding: 0,
        totalPurchased: 0,
        pendingSales: [],
        allSales: []
      }
    }

    farmerDuesMap[farmerId].totalPurchased += totalAmount
    farmerDuesMap[farmerId].allSales.push({ ...sale, totalPaid, balanceDue })

    if (balanceDue > 0.01) {
      farmerDuesMap[farmerId].totalOutstanding += balanceDue
      farmerDuesMap[farmerId].pendingSales.push({ ...sale, totalPaid, balanceDue })
    }
  })

  // Convert to array of farmers with pending dues (outstanding > 0)
  let duesList = Object.values(farmerDuesMap).filter(f => f.totalOutstanding > 0.01)

  // Sort by highest amount owed first
  duesList.sort((a, b) => b.totalOutstanding - a.totalOutstanding)

  // Filter by Search Query (Farmer Name, Phone, Village)
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim()
    duesList = duesList.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.phone.toLowerCase().includes(q) ||
      f.village.toLowerCase().includes(q)
    )
  }

  // Summary KPI Calculations
  const totalDealerDues = Object.values(farmerDuesMap).reduce((sum, f) => sum + f.totalOutstanding, 0)
  const farmersWithDuesCount = Object.values(farmerDuesMap).filter(f => f.totalOutstanding > 0.01).length
  const totalPendingSalesCount = sales.filter(s => {
    const paid = (s.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return (Number(s.total_amount || 0) - paid) > 0.01
  }).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={26} color="var(--danger)" /> Dues &amp; Credit Collections
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Collections worklist sorted by highest outstanding balance owed by farmers
          </span>
        </div>

        <button
          onClick={fetchData}
          style={{
            padding: '0.55rem 0.9rem',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <RotateCcw size={14} /> Refresh Worklist
        </button>
      </div>

      {/* KPI Metrics Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Total Pending Credit</span>
            <IndianRupee size={18} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--danger)' }}>
            ₹{totalDealerDues.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Farmers with Dues</span>
            <Users size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {farmersWithDuesCount} {farmersWithDuesCount === 1 ? 'Farmer' : 'Farmers'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Unpaid / Partial Bills</span>
            <FileText size={18} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {totalPendingSalesCount} {totalPendingSalesCount === 1 ? 'Bill' : 'Bills'}
          </div>
        </div>
      </div>

      {/* Search Input Filter */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search farmer name, phone, or village in collections worklist..."
          style={{
            width: '100%',
            padding: '0.65rem 0.9rem 0.65rem 2.5rem',
            borderRadius: '12px',
            background: 'var(--bg-surface-hover)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            fontSize: '0.9rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Collections List */}
      {loading ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading collections worklist...
        </div>
      ) : duesList.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <CheckCircle2 size={42} color="var(--success)" style={{ marginBottom: '0.85rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            {searchQuery ? 'No Dues Match Your Search' : 'All Clear! No Pending Dues'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
            {searchQuery 
              ? 'No farmers with outstanding balances match your search query.' 
              : 'Great job! All farmer sales have been fully settled.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {duesList.map(farmer => {
            const isExpanded = expandedFarmers[farmer.id] ?? true // default expanded
            const pendingSalesCount = farmer.pendingSales.length

            return (
              <div
                key={farmer.id}
                className="glass-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--bg-surface)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid var(--border-color)'
                }}
              >
                {/* Farmer Row Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'var(--danger-bg)',
                      border: '1px solid var(--danger-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Users size={22} color="var(--danger)" />
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {farmer.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {farmer.village && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={13} color="var(--accent)" /> {farmer.village}
                          </span>
                        )}
                        {farmer.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={13} color="var(--primary)" /> {farmer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Outstanding Balance & Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600', display: 'block' }}>
                        Total Credit Due
                      </span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--danger)' }}>
                        ₹{farmer.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleExpandFarmer(farmer.id)}
                      style={{
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      <span>{pendingSalesCount} {pendingSalesCount === 1 ? 'Pending Bill' : 'Pending Bills'}</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Pending Bills List */}
                {isExpanded && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px dashed var(--border-color)'
                  }}>
                    {farmer.pendingSales.map(sale => {
                      const billId = `INV-${sale.id.substring(0, 8).toUpperCase()}`
                      const saleDate = new Date(sale.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })

                      return (
                        <div
                          key={sale.id}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: '12px',
                            background: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{
                                background: 'var(--info-bg)',
                                border: '1px solid var(--info-border)',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                color: 'var(--info)',
                                fontSize: '0.78rem',
                                fontWeight: '700'
                              }}>
                                {billId}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Date: {saleDate}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                              Total Bill: <strong style={{ color: 'var(--text-main)' }}>₹{sale.total_amount.toFixed(2)}</strong> • Paid: <span style={{ color: 'var(--success)', fontWeight: '700' }}>₹{sale.totalPaid.toFixed(2)}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Balance Due</span>
                              <span style={{ fontWeight: '800', color: 'var(--danger)', fontSize: '1.05rem' }}>
                                ₹{sale.balanceDue.toFixed(2)}
                              </span>
                            </div>

                            <button
                              onClick={() => setActivePaymentSale(sale)}
                              style={{
                                padding: '0.45rem 0.95rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                border: 'none',
                                color: '#fff',
                                fontWeight: '700',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                boxShadow: 'var(--shadow-glow)'
                              }}
                            >
                              <CreditCard size={14} /> Collect Payment
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        sale={activePaymentSale}
        isOpen={Boolean(activePaymentSale)}
        onClose={() => setActivePaymentSale(null)}
        shopProfile={shopProfile}
        onPaymentRecorded={() => {
          fetchData()
        }}
      />

    </div>
  )
}
