import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ProductCard from './ProductCard'
import { 
  ArrowLeft, 
  Layers, 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  IndianRupee, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  Trash2
} from 'lucide-react'

const PAGE_SIZE = 12

export default function BrandDetailView({
  brand,
  user,
  onBack,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onQuantityChanged,
  allProducts = []
}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  
  // Brand deletion state
  const [deletingBrand, setDeletingBrand] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const fetchBrandProducts = async () => {
    if (!user || !brand) return
    setLoading(true)
    try {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('dealer_id', user.id)
        .order('name', { ascending: true })
        .range(from, to)

      if (brand.id) {
        query = query.or(`brand_id.eq.${brand.id},brand.ilike.${brand.name}`)
      } else {
        query = query.ilike('brand', brand.name)
      }

      if (searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`)
      }

      const { data, count, error } = await query

      if (error) throw error

      setProducts(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Error fetching brand products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrandProducts()
  }, [brand, page, searchQuery, user, allProducts])

  // Calculate brand summary stats
  const totalItems = totalCount
  const outOfStockCount = products.filter(p => Number(p.quantity) <= 0).length
  const brandValuation = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1

  // Handle Delete Brand (Subject to ON DELETE RESTRICT)
  const handleDeleteBrand = async () => {
    if (!brand.id) return
    if (!window.confirm(`Are you sure you want to delete brand "${brand.name}"?`)) return
    
    setDeletingBrand(true)
    setDeleteError('')
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brand.id)

      if (error) {
        // Intercept ON DELETE RESTRICT error cleanly
        if (error.code === '23503' || error.message.includes('foreign key constraint')) {
          throw new Error(`Cannot delete brand "${brand.name}" because it still contains active products. Please delete or reassign its products first.`)
        }
        throw error
      }
      onBack()
    } catch (err) {
      console.error('Failed to delete brand:', err)
      setDeleteError(err.message || 'Failed to delete brand.')
    } finally {
      setDeletingBrand(false)
    }
  }

  return (
    <div>
      {/* Header Bar: Back Button, Brand Title, Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '12px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={16} /> Back to All Brands
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Layers size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              {brand.name}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {brand.id && (
            <button
              onClick={handleDeleteBrand}
              disabled={deletingBrand}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              title="Delete Brand (Protected by ON DELETE RESTRICT)"
            >
              <Trash2 size={15} /> Delete Brand
            </button>
          )}

          <button
            onClick={() => onAddProduct(brand.name)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              background: 'var(--primary)',
              border: 'none',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <Plus size={18} /> Add {brand.name} Product
          </button>
        </div>
      </div>

      {/* Delete Error Notification Banner */}
      {deleteError && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          color: 'var(--danger)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Brand Stat Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Total Brand Products
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {totalCount}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Current Page Value
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
            ₹{brandValuation.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem', borderColor: outOfStockCount > 0 ? 'var(--danger-border)' : 'var(--border-color)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Out of Stock on Page
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: outOfStockCount > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {outOfStockCount}
          </span>
        </div>
      </div>

      {/* Search Input for Products in this Brand */}
      <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
        <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(0)
          }}
          placeholder={`Search product names in ${brand.name}...`}
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

      {/* Products Grid & Loading / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
          <p>Loading products for {brand.name}...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Products Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            {searchQuery 
              ? `No products in ${brand.name} match "${searchQuery}".` 
              : `There are currently no stock products listed under ${brand.name}.`}
          </p>
          <button
            onClick={() => onAddProduct(brand.name)}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              background: 'var(--primary)',
              border: 'none',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      ) : (
        <>
          {/* Responsive Product Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem'
          }}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onQuantityChanged={() => {
                  fetchBrandProducts()
                  if (onQuantityChanged) onQuantityChanged()
                }}
              />
            ))}
          </div>

          {/* Database Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing page <strong style={{ color: 'var(--text-main)' }}>{page + 1}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages}</strong> ({totalCount} total items)
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    color: page === 0 ? 'var(--text-dim)' : '#fff',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: page === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    color: page >= totalPages - 1 ? 'var(--text-dim)' : '#fff',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
