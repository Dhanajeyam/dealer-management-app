import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Package, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'

const PRESET_BRANDS = [
  'Bayer',
  'Syngenta',
  'UPL',
  'Crystal',
  'Dhanuka',
  'Rallis',
  'PI Industries'
]

const UNITS = ['kg', 'litre', 'ml', 'packet', 'bag', 'units']

export default function AddProductModal({ isOpen, onClose, onProductAdded, existingProducts = [] }) {
  const [selectedBrand, setSelectedBrand] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [isCustomBrand, setIsCustomBrand] = useState(false)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Dynamically combine preset brands with distinct custom brands from existing products
  const availableBrands = Array.from(
    new Set([
      ...PRESET_BRANDS,
      ...existingProducts.map(p => p.brand).filter(Boolean)
    ])
  ).sort()

  // Reset all state when modal opens or closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedBrand('')
      setCustomBrand('')
      setIsCustomBrand(false)
      setName('')
      setQuantity('')
      setUnit('kg')
      setPrice('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBrandChange = (e) => {
    const val = e.target.value
    if (val === 'CUSTOM') {
      setIsCustomBrand(true)
      setSelectedBrand('')
      setCustomBrand('') // Clear custom brand input when switching to custom entry
    } else {
      setIsCustomBrand(false)
      setSelectedBrand(val)
      setCustomBrand('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const finalBrand = isCustomBrand ? customBrand.trim() : selectedBrand
    const finalName = name.trim()
    const numQty = parseFloat(quantity)
    const numPrice = parseFloat(price)

    if (!finalBrand) {
      setError('Please select a brand or enter a custom brand name.')
      return
    }

    if (!finalName || isNaN(numQty) || isNaN(numPrice)) {
      setError('Please fill in all required fields with valid numbers.')
      return
    }

    if (numQty < 0 || numPrice < 0) {
      setError('Quantity and price cannot be negative.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Try calling atomic RPC function smart_add_product
      const { data, error: rpcError } = await supabase.rpc('smart_add_product', {
        p_brand: finalBrand,
        p_name: finalName,
        p_quantity: numQty,
        p_unit: unit,
        p_price: numPrice
      })

      if (rpcError) {
        // Fallback to client-side smart add if RPC function not created in DB yet
        console.warn('RPC smart_add_product error, falling back to direct table query:', rpcError)
        const user = (await supabase.auth.getUser()).data.user
        if (!user) throw new Error('Not authenticated')

        // Search existing
        const { data: existing } = await supabase
          .from('products')
          .select('*')
          .eq('dealer_id', user.id)
          .ilike('brand', finalBrand)
          .ilike('name', finalName)
          .maybeSingle()

        if (existing) {
          // Merge
          const { error: updateErr } = await supabase
            .from('products')
            .update({
              quantity: parseFloat(existing.quantity) + numQty,
              price: numPrice > 0 ? numPrice : existing.price,
              unit: unit,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
          if (updateErr) throw updateErr
        } else {
          // Insert
          const { error: insertErr } = await supabase
            .from('products')
            .insert({
              dealer_id: user.id,
              brand: finalBrand,
              name: finalName,
              quantity: numQty,
              unit: unit,
              price: numPrice
            })
          if (insertErr) throw insertErr
        }
      }

      // Reset Form & Close
      setName('')
      setQuantity('')
      setPrice('')
      setCustomBrand('')
      setIsCustomBrand(false)
      setSelectedBrand('')
      if (onProductAdded) onProductAdded()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add product stock.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2rem',
        background: 'var(--bg-surface)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={22} color="#10b981" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: 0 }}>Add Product Stock</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Brand Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Brand Name
            </label>
            <select
              value={isCustomBrand ? 'CUSTOM' : selectedBrand}
              onChange={handleBrandChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: selectedBrand || isCustomBrand ? '#fff' : 'var(--text-muted)',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled style={{ background: '#131f33', color: '#94a3b8' }}>
                -- Select Brand --
              </option>
              {availableBrands.map(b => (
                <option key={b} value={b} style={{ background: '#131f33', color: '#fff' }}>{b}</option>
              ))}
              <option value="CUSTOM" style={{ background: '#131f33', color: '#10b981' }}>+ Add Custom Brand</option>
            </select>

            {isCustomBrand && (
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Type custom brand name..."
                required
                style={{
                  width: '100%',
                  marginTop: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid #10b981',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            )}
          </div>

          {/* Product Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Coragen Insecticide"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Quantity & Unit Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Stock Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {UNITS.map(u => (
                  <option key={u} value={u} style={{ background: '#131f33', color: '#fff' }}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price per Unit */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              Selling Price per Unit (₹)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 850"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Info note */}
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            lineHeight: '1.4'
          }}>
            ⚡ <strong>Smart Add:</strong> Adding an existing product brand + name will automatically merge its stock and update the selling price.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '10px',
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2,
                padding: '0.8rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <Plus size={18} />
              {loading ? 'Adding Stock...' : 'Save Product Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
