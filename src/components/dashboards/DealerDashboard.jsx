import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Stock Module Components
import AddProductModal from '../stock/AddProductModal'
import EditProductModal from '../stock/EditProductModal'
import ProductCard from '../stock/ProductCard'
import BrandStockSection from '../stock/BrandStockSection'
import BrandListView from '../stock/BrandListView'
import BrandDetailView from '../stock/BrandDetailView'

// Farmers Module Components
import AddFarmerModal from '../farmers/AddFarmerModal'
import EditFarmerModal from '../farmers/EditFarmerModal'
import FarmerDetailModal from '../farmers/FarmerDetailModal'
import FarmerCard from '../farmers/FarmerCard'

// Sales Module Components
import NewSaleModal from '../sales/NewSaleModal'
import BillReceiptModal from '../sales/BillReceiptModal'
import SalesLogView from '../sales/SalesLogView'

import AnalyticsView from '../analytics/AnalyticsView'
import DuesCollectionsView from '../dues/DuesCollectionsView'
import DashboardLayout from '../common/DashboardLayout'
import SettingsView from '../settings/SettingsView'
import { getTrialInfo } from '../../lib/trial'

import { 
  Store, 
  LogOut, 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Tag, 
  IndianRupee, 
  Filter, 
  RefreshCw, 
  Trash2, 
  Layers,
  Users,
  MapPin,
  UserPlus,
  ShoppingCart,
  TrendingUp,
  Settings,
  FileText,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles
} from 'lucide-react'

export default function DealerDashboard({ profile, user, onSignOut }) {
  // Navigation State ('stock' | 'farmers' | 'analytics' | 'settings')
  const [activeTab, setActiveTab] = useState('stock')

  // Profile State
  const [currentProfile, setCurrentProfile] = useState(profile)



  useEffect(() => {
    setCurrentProfile(profile)
  }, [profile])

  const fetchProfileData = async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (data) setCurrentProfile(data)
    } catch (err) {
      console.error('Error refreshing profile data:', err)
    }
  }

  // Sales & Receipts State
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false)
  const [activeReceiptData, setActiveReceiptData] = useState(null)

  // Stock State
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL')
  const [selectedBrandDetail, setSelectedBrandDetail] = useState(null)
  const [presetAddBrand, setPresetAddBrand] = useState('')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deletingProductStatus, setDeletingProductStatus] = useState(false)

  // Collapsible Brand Section State
  const [expandedBrands, setExpandedBrands] = useState({})

  const toggleBrandExpand = (brandName) => {
    setExpandedBrands(prev => ({
      ...prev,
      [brandName]: !prev[brandName]
    }))
  }

  const expandAllBrands = (brandKeys) => {
    const next = {}
    brandKeys.forEach(b => { next[b] = true })
    setExpandedBrands(next)
  }

  const collapseAllBrands = () => {
    setExpandedBrands({})
  }

  // Farmers State
  const [farmers, setFarmers] = useState([])
  const [loadingFarmers, setLoadingFarmers] = useState(true)
  const [farmerSearchQuery, setFarmerSearchQuery] = useState('')
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false)
  const [editingFarmer, setEditingFarmer] = useState(null)
  const [viewingFarmer, setViewingFarmer] = useState(null)
  const [deletingFarmer, setDeletingFarmer] = useState(null)
  const [deletingFarmerStatus, setDeletingFarmerStatus] = useState(false)

  // Fetch Stock Products
  const fetchProducts = async () => {
    if (!user) return
    setLoadingProducts(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('brand', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoadingProducts(false)
    }
  }

  // Fetch Farmers
  const fetchFarmers = async () => {
    if (!user) return
    setLoadingFarmers(true)
    try {
      const { data, error } = await supabase
        .from('farmers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setFarmers(data || [])
    } catch (err) {
      console.error('Error fetching farmers:', err)
    } finally {
      setLoadingFarmers(false)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchFarmers()
  }, [user])

  // Delete Handlers
  const handleDeleteProductConfirm = async () => {
    if (!deletingProduct) return
    setDeletingProductStatus(true)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id)

      if (error) throw error
      setDeletingProduct(null)
      fetchProducts()
    } catch (err) {
      console.error('Failed to delete product:', err)
    } finally {
      setDeletingProductStatus(false)
    }
  }

  const handleDeleteFarmerConfirm = async () => {
    if (!deletingFarmer) return
    setDeletingFarmerStatus(true)
    try {
      const { error } = await supabase
        .from('farmers')
        .delete()
        .eq('id', deletingFarmer.id)

      if (error) throw error
      setDeletingFarmer(null)
      fetchFarmers()
    } catch (err) {
      console.error('Failed to delete farmer:', err)
    } finally {
      setDeletingFarmerStatus(false)
    }
  }

  // Stock Filtering & Grouping
  const availableBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean))).sort()
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(productSearchQuery.toLowerCase())
    const matchesBrand = selectedBrandFilter === 'ALL' || p.brand.toLowerCase() === selectedBrandFilter.toLowerCase()
    return matchesSearch && matchesBrand
  })

  const groupedProducts = filteredProducts.reduce((acc, p) => {
    const brand = p.brand || 'Other'
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(p)
    return acc
  }, {})

  const totalItems = products.length
  const totalBrandsCount = availableBrands.length
  const outOfStockCount = products.filter(p => Number(p.quantity) <= 0).length
  const totalStockValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)

  // Farmer Filtering
  const filteredFarmers = farmers.filter(f => {
    const q = farmerSearchQuery.toLowerCase()
    const nameMatch = f.name.toLowerCase().includes(q)
    const phoneMatch = f.phone ? f.phone.toLowerCase().includes(q) : false
    const villageMatch = f.village ? f.village.toLowerCase().includes(q) : false
    return nameMatch || phoneMatch || villageMatch
  })

  const totalVillagesCount = Array.from(new Set(farmers.map(f => f.village).filter(Boolean))).length

  const effectiveProfile = {
    ...currentProfile,
    address: currentProfile?.address || user?.user_metadata?.address || '',
    gstin: currentProfile?.gstin || user?.user_metadata?.gstin || ''
  }

  const trialInfo = getTrialInfo(effectiveProfile)

  const navItems = [
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'sales', label: 'Sales', icon: FileText },
    { id: 'farmers', label: 'Farmers', icon: Users },
    { id: 'dues', label: 'Credit Dues', icon: AlertTriangle, color: activeTab === 'dues' ? 'var(--danger)' : undefined },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'stock': return 'Stock Inventory'
      case 'sales': return 'Sales Log'
      case 'farmers': return 'Farmer Directory'
      case 'dues': return 'Credit Dues & Collections'
      case 'analytics': return 'Analytics & Insights'
      case 'settings': return 'System & Account Settings'
      default: return 'Dealer Dashboard'
    }
  }

  const headerActions = (
    <>
      {trialInfo.isTrial && !trialInfo.isExpired && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '8px',
          background: 'var(--warning-bg)',
          color: 'var(--warning)',
          border: '1px solid var(--warning-border)',
          fontSize: '0.78rem',
          fontWeight: '800'
        }}>
          <Clock size={13} /> {trialInfo.text}
        </div>
      )}

      <button
        onClick={() => setIsNewSaleOpen(true)}
        className="btn-new-sale"
      >
        <ShoppingCart size={17} /> + New Sale / Cart
      </button>

      <button
        onClick={onSignOut}
        className="btn-signout"
        title={user?.email ? `Signed in as ${user.email}` : 'Sign Out'}
      >
        <LogOut size={15} /> Sign Out
      </button>
    </>
  )

  return (
    <DashboardLayout
      brandTitle={effectiveProfile?.shop_name || 'Dealer Workspace'}
      brandSubtitle={effectiveProfile?.gstin ? `GSTIN: ${effectiveProfile.gstin}` : 'Stock & Farmer Workspace'}
      brandIcon={<Store size={22} color="#ffffff" />}
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerTitle={getHeaderTitle()}
      headerActions={headerActions}
    >


        {/* ============================================================ */}
        {/* TAB 1: STOCK INVENTORY MODULE (LIST -> DETAIL SCALABLE VIEW) */}
        {/* ============================================================ */}
        {activeTab === 'stock' && (
          <div>
            {selectedBrandDetail ? (

              <BrandDetailView
                brand={selectedBrandDetail}
                user={user}
                onBack={() => setSelectedBrandDetail(null)}
                onEditProduct={(p) => setEditingProduct(p)}
                onDeleteProduct={(p) => setDeletingProduct(p)}
                onAddProduct={(brandName) => {
                  setPresetAddBrand(brandName)
                  setIsAddProductOpen(true)
                }}
                onQuantityChanged={fetchProducts}
                allProducts={products}
              />
            ) : (
              <div>
                {/* Summary Metrics Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Total Products</span>
                      <Package size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalItems}</div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Active Brands</span>
                      <Tag size={18} color="var(--accent)" />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalBrandsCount}</div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem', borderColor: outOfStockCount > 0 ? 'var(--danger-border)' : 'var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Out of Stock</span>
                      <AlertTriangle size={18} color={outOfStockCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: outOfStockCount > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
                      {outOfStockCount}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Inventory Value</span>
                      <IndianRupee size={18} color="var(--primary)" />
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{totalStockValue.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Brand List Screen */}
                <BrandListView
                  user={user}
                  searchQuery={productSearchQuery}
                  setSearchQuery={setProductSearchQuery}
                  onSelectBrand={(b) => setSelectedBrandDetail(b)}
                  onAddStock={() => {
                    setPresetAddBrand('')
                    setIsAddProductOpen(true)
                  }}
                  products={products}
                />
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: FARMERS MODULE                                       */}
        {/* ============================================================ */}
        {activeTab === 'farmers' && (
          <div>
            {/* Farmers Metrics Bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Registered Farmers</span>
                  <Users size={18} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{farmers.length}</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Villages Covered</span>
                  <MapPin size={18} color="var(--accent)" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalVillagesCount}</div>
              </div>
            </div>

            {/* Controls Bar: Search & Add Farmer Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 300px' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={farmerSearchQuery}
                  onChange={(e) => setFarmerSearchQuery(e.target.value)}
                  placeholder="Search farmer name, phone, or village..."
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

              {/* Add Farmer Button */}
              <button
                onClick={() => setIsAddFarmerOpen(true)}
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <UserPlus size={20} /> Add New Farmer
              </button>
            </div>

            {/* Loading State */}
            {loadingFarmers ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
                <p>Loading farmer records...</p>
              </div>
            ) : filteredFarmers.length === 0 ? (
              /* Empty State */
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Users size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  No Farmers Found
                </h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  {farmerSearchQuery 
                    ? 'No farmers match your current search criteria.'
                    : 'Your farmer directory is currently empty. Click below to add your first farmer.'}
                </p>
                <button
                  onClick={() => setIsAddFarmerOpen(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <UserPlus size={18} /> Add New Farmer
                </button>
              </div>
            ) : (
              /* Farmers Grid View */
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.25rem'
              }}>
                {filteredFarmers.map(farmer => (
                  <FarmerCard
                    key={farmer.id}
                    farmer={farmer}
                    onView={(f) => setViewingFarmer(f)}
                    onEdit={(f) => setEditingFarmer(f)}
                    onDelete={(f) => setDeletingFarmer(f)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SALES TRANSACTIONS & LOG FEED                         */}
        {/* ============================================================ */}
        {activeTab === 'sales' && (
          <SalesLogView
            user={user}
            onReprintBill={(billData) => setActiveReceiptData(billData)}
            onNewSale={() => setIsNewSaleOpen(true)}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 4: DUES & CREDIT COLLECTIONS WORKLIST                    */}
        {/* ============================================================ */}
        {activeTab === 'dues' && (
          <DuesCollectionsView
            user={user}
            shopProfile={effectiveProfile}
            onReprintBill={(billData) => setActiveReceiptData(billData)}
          />
        )}

        {/* ============================================================ */}
        {/* TAB 5: ANALYTICS & INSIGHTS                                 */}
        {/* ============================================================ */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            onNavigateToStock={() => setActiveTab('stock')}
          />
        )}


        {/* ============================================================ */}
        {/* TAB 6: SETTINGS MODULE                                      */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <SettingsView
            profile={effectiveProfile}
            user={user}
            onProfileUpdated={fetchProfileData}
          />
        )}


      {/* Stock Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={fetchProducts}
        existingProducts={products}
      />
      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        onProductUpdated={fetchProducts}
      />
      {deletingProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={36} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
              Delete Product?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{deletingProduct.brand} - {deletingProduct.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingProduct(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProductConfirm}
                disabled={deletingProductStatus}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: '#ef4444', border: 'none', color: '#fff', fontWeight: '600', cursor: deletingProductStatus ? 'wait' : 'pointer' }}
              >
                {deletingProductStatus ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Modals */}
      <AddFarmerModal
        isOpen={isAddFarmerOpen}
        onClose={() => setIsAddFarmerOpen(false)}
        onFarmerAdded={fetchFarmers}
      />
      <EditFarmerModal
        farmer={editingFarmer}
        isOpen={Boolean(editingFarmer)}
        onClose={() => setEditingFarmer(null)}
        onFarmerUpdated={fetchFarmers}
      />
      <FarmerDetailModal
        farmer={viewingFarmer}
        isOpen={Boolean(viewingFarmer)}
        onClose={() => setViewingFarmer(null)}
        onReprintBill={(saleData) => setActiveReceiptData(saleData)}
      />

      {/* Sales & Bill Modals */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => setIsNewSaleOpen(false)}
        products={products}
        farmers={farmers}
        shopProfile={effectiveProfile}
        onFarmerAdded={() => fetchFarmers()}
        onSaleCompleted={(completedSaleData) => {
          fetchProducts()
          fetchFarmers()
          setActiveReceiptData(completedSaleData)
        }}
      />


      <BillReceiptModal
        isOpen={Boolean(activeReceiptData)}
        onClose={() => setActiveReceiptData(null)}
        saleData={activeReceiptData}
        shopProfile={effectiveProfile}
      />

      {deletingFarmer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '420px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <Trash2 size={36} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
              Delete Farmer Record?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Are you sure you want to delete farmer record for <strong>{deletingFarmer.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setDeletingFarmer(null)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFarmerConfirm}
                disabled={deletingFarmerStatus}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: '#ef4444', border: 'none', color: '#fff', fontWeight: '600', cursor: deletingFarmerStatus ? 'wait' : 'pointer' }}
              >
                {deletingFarmerStatus ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}



