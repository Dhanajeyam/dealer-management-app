import React, { useState } from 'react'
import ProductCard from './ProductCard'
import { ChevronRight, ChevronDown, Layers, AlertTriangle, Grid } from 'lucide-react'

const INITIAL_CAP = 12

export default function BrandStockSection({
  brandName,
  products = [],
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
  onQuantityChanged,
  searchActive = false
}) {
  const [showAll, setShowAll] = useState(false)

  // Subtotal & metrics calculation for this brand
  const totalItems = products.length
  const outOfStockCount = products.filter(p => Number(p.quantity) <= 0).length
  const brandStockValue = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.price)), 0)

  // Visible products: Cap at INITIAL_CAP unless showAll is true or search is actively filtering
  const visibleProducts = (showAll || searchActive) 
    ? products 
    : products.slice(0, INITIAL_CAP)

  const hasMoreThanCap = products.length > INITIAL_CAP

  return (
    <div className="glass-card" style={{
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border-color)',
      background: 'var(--bg-glass)',
      transition: 'all 0.2s ease-in-out'
    }}>
      {/* Brand Header Bar (Clickable to Collapse / Expand) */}
      <button
        type="button"
        onClick={onToggleExpand}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.1rem 1.35rem',
          background: isExpanded ? 'var(--primary-light)' : 'transparent',
          border: 'none',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease'
        }}
      >
        {/* Left Side: Chevron, Brand Icon, Name, Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: isExpanded ? 'var(--primary-light)' : 'var(--bg-surface-hover)',
            color: isExpanded ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              {brandName}
            </h3>
          </div>

          <span style={{
            fontSize: '0.78rem',
            fontWeight: '500',
            color: 'var(--text-muted)',
            background: 'var(--bg-surface-hover)',
            padding: '0.2rem 0.65rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>

          {outOfStockCount > 0 && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              color: 'var(--danger)',
              background: 'var(--danger-bg)',
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              border: '1px solid var(--danger-border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}>
              <AlertTriangle size={12} /> {outOfStockCount} Out of stock
            </span>
          )}
        </div>

        {/* Right Side: Total Valuation Subtotal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Subtotal Value
            </span>
            <span style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
              ₹{brandStockValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded Section Content */}
      {isExpanded && (
        <div style={{ padding: '1.25rem' }}>
          {/* Responsive Grid for Products */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {visibleProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuantityChanged={onQuantityChanged}
              />
            ))}
          </div>

          {/* Show All / Show Less Button for large brands (> 12 items) */}
          {hasMoreThanCap && !searchActive && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px dashed var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '12px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--primary)',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Grid size={15} />
                {showAll 
                  ? `Show initial ${INITIAL_CAP} products` 
                  : `Show all ${products.length} products (${products.length - INITIAL_CAP} more)`}
                {showAll ? <ChevronDown size={16} style={{ transform: 'rotate(180deg)' }} /> : <ChevronDown size={16} />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
