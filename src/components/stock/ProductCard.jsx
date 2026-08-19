import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Minus, Edit3, Trash2, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react'

export default function ProductCard({ product, onEdit, onDelete, onQuantityChanged }) {
  const [adjusting, setAdjusting] = useState(false)
  const isOutOfStock = Number(product.quantity) <= 0

  const handleAdjust = async (delta) => {
    if (adjusting) return
    setAdjusting(true)

    try {
      // 1. Try atomic RPC function
      const { data, error: rpcError } = await supabase.rpc('adjust_product_quantity', {
        p_product_id: product.id,
        p_delta: delta
      })

      if (rpcError) {
        // Fallback to direct table update if RPC not present in DB
        const newQty = Math.max(0, Number(product.quantity) + delta)
        const { error: updateErr } = await supabase
          .from('products')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', product.id)
        if (updateErr) throw updateErr
      }

      if (onQuantityChanged) onQuantityChanged()
    } catch (err) {
      console.error('Failed to adjust quantity:', err)
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <div className="glass-card" style={{
      padding: '1.25rem',
      borderRadius: '16px',
      background: isOutOfStock 
        ? 'var(--danger-bg)' 
        : 'var(--bg-surface)',
      borderColor: isOutOfStock ? 'var(--danger-border)' : 'var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative'
    }}>
      {/* Top Header: Brand Badge & Action Buttons */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            background: 'var(--highlight-bg)',
            color: 'var(--highlight-text)',
            border: '1px solid var(--highlight-border)'
          }}>
            {product.brand}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              onClick={() => onEdit(product)}
              title="Edit Product"
              style={{
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                borderRadius: '8px',
                padding: '0.45rem',
                minWidth: '34px',
                minHeight: '34px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(product)}
              title="Delete Product"
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                color: 'var(--danger)',
                borderRadius: '8px',
                padding: '0.45rem',
                minWidth: '34px',
                minHeight: '34px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h4 style={{
          fontSize: '1.05rem',
          fontWeight: '600',
          color: 'var(--text-main)',
          marginBottom: '0.65rem',
          lineHeight: '1.3'
        }}>
          {product.name}
        </h4>

        {/* Price Tag */}
        <div style={{
          fontSize: '1.2rem',
          fontWeight: '600',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.1rem',
          marginBottom: '1rem'
        }}>
          ₹{Number(product.price).toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-muted)' }}>/ {product.unit}</span>
        </div>
      </div>

      {/* Bottom Section: Stock Quantity & Quick Adjustment */}
      <div style={{
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Out of Stock vs In Stock Badge */}
        <div>
          {isOutOfStock ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.6rem',
              borderRadius: '8px',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-border)'
            }}>
              <AlertTriangle size={13} /> Out of Stock
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Stock: <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '600' }}>{Number(product.quantity)}</strong> {product.unit}
            </div>
          )}
        </div>

        {/* Atomic +/- Buttons with enlarged touch area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'var(--bg-surface-hover)',
          padding: '0.25rem 0.45rem',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => handleAdjust(-1)}
            disabled={adjusting || Number(product.quantity) <= 0}
            title="Decrement Stock (-1)"
            style={{
              background: 'transparent',
              border: 'none',
              color: (adjusting || Number(product.quantity) <= 0) ? 'var(--text-dim)' : 'var(--text-muted)',
              cursor: (adjusting || Number(product.quantity) <= 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px'
            }}
          >
            <Minus size={16} />
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', minWidth: '28px', textAlign: 'center' }}>
            {Number(product.quantity)}
          </span>

          <button
            onClick={() => handleAdjust(1)}
            disabled={adjusting}
            title="Nudge Stock Up (+1)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--primary)',
              border: 'none',
              color: '#fff',
              cursor: adjusting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
