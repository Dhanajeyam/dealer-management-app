import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Stock Module Components
import AddProductModal from '../stock/AddProductModal'
import EditProductModal from '../stock/EditProductModal'
import ProductCard from '../stock/ProductCard'

// Farmers Module Components
import AddFarmerModal from '../farmers/AddFarmerModal'
import EditFarmerModal from '../farmers/EditFarmerModal'
import FarmerDetailModal from '../farmers/FarmerDetailModal'
import FarmerCard from '../farmers/FarmerCard'

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
  UserPlus
} from 'lucide-react'

export default function DealerDashboard({ profile, user, onSignOut }) {
  // Navigation State ('stock' | 'farmers')
  const [activeTab, setActiveTab] = useState('stock')

  // Stock State
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('ALL')
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [deletingProductStatus, setDeletingProductStatus] = useState(false)

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navbar Header */}
      <header style={{
        padding: '1.25rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 19, 32, 0.8)',
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Store size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff', margin: 0 }}>
              {profile?.shop_name || 'Dealer Workspace'}
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Stock &amp; Farmer Management Workspace
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
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'stock' ? 'var(--bg-surface-hover)' : 'transparent',
              color: activeTab === 'stock' ? '#10b981' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Package size={16} /> Stock Inventory ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('farmers')}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: activeTab === 'farmers' ? 'var(--bg-surface-hover)' : 'transparent',
              color: activeTab === 'farmers' ? '#10b981' : 'var(--text-muted)',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Farmer Directory ({farmers.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: '600', color: '#fff' }}>{user?.email}</span>
            {profile?.phone && <span style={{ fontSize: '0.78rem' }}>{profile.phone}</span>}
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

      {/* Main Container */}
      <main className="container" style={{ flex: 1, padding: '2rem 1.5rem' }}>
        
        {/* ============================================================ */}
        {/* TAB 1: STOCK INVENTORY MODULE                                */}
        {/* ============================================================ */}
        {activeTab === 'stock' && (
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
                  <Package size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>{totalItems}</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Active Brands</span>
                  <Tag size={18} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>{totalBrandsCount}</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', borderColor: outOfStockCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Out of Stock</span>
                  <AlertTriangle size={18} color={outOfStockCount > 0 ? '#ef4444' : 'var(--text-muted)'} />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: outOfStockCount > 0 ? '#ef4444' : '#fff' }}>
                  {outOfStockCount}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Inventory Value</span>
                  <IndianRupee size={18} color="#f59e0b" />
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                  ₹{totalStockValue.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Controls Bar: Search, Brand Filter, Add Product Button */}
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
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search product name or brand..."
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

              {/* Add Product Button */}
              <button
                onClick={() => setIsAddProductOpen(true)}
                style={{
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                <Plus size={20} /> Add Stock Item
              </button>
            </div>

            {/* Brand Filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '2rem'
            }}>
              <button
                onClick={() => setSelectedBrandFilter('ALL')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedBrandFilter === 'ALL' ? '#10b981' : 'var(--border-color)',
                  background: selectedBrandFilter === 'ALL' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-hover)',
                  color: selectedBrandFilter === 'ALL' ? '#10b981' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                All Brands ({products.length})
              </button>

              {availableBrands.map(b => {
                const count = products.filter(p => p.brand === b).length
                const isSel = selectedBrandFilter.toLowerCase() === b.toLowerCase()
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBrandFilter(b)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: isSel ? '#10b981' : 'var(--border-color)',
                      background: isSel ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-surface-hover)',
                      color: isSel ? '#10b981' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {b} ({count})
                  </button>
                )
              })}
            </div>

            {/* Loading State */}
            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
                <p>Loading inventory items...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Package size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                  No Stock Items Found
                </h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
                  {productSearchQuery || selectedBrandFilter !== 'ALL' 
                    ? 'No products match your current search or brand filter.'
                    : 'Your inventory is currently empty. Click below to add your first product.'}
                </p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
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
                  <Plus size={18} /> Add Stock Item
                </button>
              </div>
            ) : (
              /* Grouped Product List View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {Object.keys(groupedProducts).map(brandName => (
                  <div key={brandName}>
                    {/* Brand Section Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                      <Layers size={20} color="#10b981" />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                        {brandName}
                      </h3>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-surface-hover)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '12px'
                      }}>
                        {groupedProducts[brandName].length} {groupedProducts[brandName].length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {/* Responsive Grid for Product Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '1.25rem'
                    }}>
                      {groupedProducts[brandName].map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onEdit={(p) => setEditingProduct(p)}
                          onDelete={(p) => setDeletingProduct(p)}
                          onQuantityChanged={fetchProducts}
                        />
                      ))}
                    </div>
                  </div>
                ))}
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
                  <Users size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>{farmers.length}</div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Villages Covered</span>
                  <MapPin size={18} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff' }}>{totalVillagesCount}</div>
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
                    color: '#fff',
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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

      </main>

      {/* Stock Modals */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onProductAdded={fetchProducts}
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

      {/* Footer */}
      <footer style={{
        padding: '1.25rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.8rem',
        color: 'var(--text-dim)'
      }}>
        Agri-Chemical Management App • Stock (Step 5) &amp; Farmers (Step 6) Modules Active
      </footer>
    </div>
  )
}
