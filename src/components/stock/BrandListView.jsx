import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  Layers, 
  Package, 
  Search, 
  Plus, 
  ChevronRight, 
  AlertTriangle, 
  IndianRupee, 
  RefreshCw,
  FolderOpen,
  ArrowRight
} from 'lucide-react'

export default function BrandListView({ 
  user, 
  onSelectBrand, 
  onAddStock,
  searchQuery,
  setSearchQuery,
  products = []
}) {
  const [brandsSummary, setBrandsSummary] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBrandsSummary = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      // 1. Fetch dealer's registered brands from brands table
      const { data: brandRows, error: brandErr } = await supabase
        .from('brands')
        .select('*')
        .eq('dealer_id', user.id)
        .order('name', { ascending: true })

      if (brandErr && brandErr.code !== 'PGRST116') {
        console.warn('Error fetching brands table:', brandErr)
      }

      // 2. Fetch dealer's products to calculate aggregations & handle unlinked brands
      const { data: allProducts, error: prodErr } = await supabase
        .from('products')
        .select('id, brand, brand_id, name, quantity, price')
        .eq('dealer_id', user.id)

      if (prodErr) throw prodErr

      const productsList = allProducts || [];
      const brandMap = new Map();
      const validBrandRows = brandRows || [];

      // 3. Process brands from brands table
      validBrandRows.forEach(b => {
        // Match products by brand_id OR by case-insensitive brand text name
        const matchedProducts = productsList.filter(p => 
          p.brand_id === b.id || 
          (p.brand && p.brand.trim().toLowerCase() === b.name.trim().toLowerCase())
        )

        const itemCount = matchedProducts.length
        const outOfStockCount = matchedProducts.filter(p => Number(p.quantity) <= 0).length
        const totalValue = matchedProducts.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)

        brandMap.set(b.id || b.name.toLowerCase(), {
          id: b.id,
          name: b.name,
          itemCount,
          outOfStockCount,
          totalValue,
          products: matchedProducts
        })
      })

      // 4. Handle any products with text brands not yet in brands table
      productsList.forEach(p => {
        if (p.brand && p.brand.trim()) {
          const brandNameLower = p.brand.trim().toLowerCase()
          const existsInMap = Array.from(brandMap.values()).some(b => b.name.toLowerCase() === brandNameLower)

          if (!existsInMap) {
            if (!brandMap.has(`text_${brandNameLower}`)) {
              brandMap.set(`text_${brandNameLower}`, {
                id: p.brand_id || null,
                name: p.brand.trim(),
                itemCount: 0,
                outOfStockCount: 0,
                totalValue: 0,
                products: []
              })
            }
            const item = brandMap.get(`text_${brandNameLower}`)
            item.itemCount += 1
            if (Number(p.quantity) <= 0) item.outOfStockCount += 1
            item.totalValue += Number(p.quantity) * Number(p.price)
            item.products.push(p)
          }
        }
      })

      let summaryArray = Array.from(brandMap.values())

      // 5. Apply Search filter across brand name or product name
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        summaryArray = summaryArray.filter(b => {
          const brandMatch = b.name.toLowerCase().includes(q)
          const productMatch = b.products.some(p => p.name.toLowerCase().includes(q))
          return brandMatch || productMatch
        })
      }

      setBrandsSummary(summaryArray)
    } catch (err) {
      console.error('Error fetching brands summary:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrandsSummary()
  }, [user?.id, searchQuery, products])

  return (
    <div>
      {/* Controls Bar: Search & Add Stock Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Search Input Box */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 320px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands or product names..."
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

        {/* Add Product Button */}
        <button
          onClick={onAddStock}
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
          <Plus size={20} /> Add Stock Item
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="status-pulse" style={{ marginBottom: '1rem' }} />
          <p>Loading brand directory...</p>
        </div>
      ) : brandsSummary.length === 0 ? (
        /* Empty State */
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <FolderOpen size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Brands Found
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            {searchQuery 
              ? 'No brands or products match your search query.'
              : 'Your brand catalog is currently empty. Add your first product to create a brand.'}
          </p>
          <button
            onClick={onAddStock}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'var(--primary)',
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
        /* Brands Grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.25rem'
        }}>
          {brandsSummary.map(brand => (
            <div
              key={brand.id || brand.name}
              className="glass-card"
              onClick={() => onSelectBrand(brand)}
              style={{
                padding: '1.35rem',
                borderRadius: '16px',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }}
            >
              <div>
                {/* Brand Title & Icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      border: '1px solid rgba(45, 90, 39, 0.2)'
                    }}>
                      <Layers size={18} />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                      {brand.name}
                    </h3>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(45, 90, 39, 0.2)'
                  }}>
                    {brand.itemCount} {brand.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Subtotal Valuation & Warnings */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Inventory Subtotal
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                      ₹{brand.totalValue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {brand.outOfStockCount > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--danger)',
                      background: 'var(--danger-bg)',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      border: '1px solid var(--danger-border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <AlertTriangle size={12} /> {brand.outOfStockCount} Out
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--primary)'
              }}>
                <span>View Products</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
