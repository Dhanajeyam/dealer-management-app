import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { X, Edit3, Save, AlertCircle } from 'lucide-react'

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

export default function EditProductModal({ product, isOpen, onClose, onProductUpdated }) {
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState('kg')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setBrand(product.brand || '')
      setName(product.name || '')
      setQuantity(product.quantity !== undefined ? product.quantity : '')
      setUnit(product.unit || 'kg')
      setPrice(product.price !== undefined ? product.price : '')
    }
  }, [product])

  if (!isOpen || !product) return null

  const handleUpdate = async (e) => {
    e.preventDefault()
    const numQty = parseFloat(quantity)
    const numPrice = parseFloat(price)

    if (!brand.trim() || !name.trim() || isNaN(numQty) || isNaN(numPrice)) {
      setError('Please provide valid values for all fields.')
      return
    }

    if (numQty < 0 || numPrice < 0) {
      setError('Quantity and price cannot be negative.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = (await supabase.auth.getUser()).data.user
      const cleanBrand = brand.trim()
      let brandId = product.brand_id

      if (user) {
        const { data: bRow } = await supabase
          .from('brands')
          .select('id')
          .eq('dealer_id', user.id)
          .ilike('name', cleanBrand)
          .maybeSingle()

        if (bRow) {
          brandId = bRow.id
        } else {
          const { data: newB } = await supabase
            .from('brands')
            .insert({ dealer_id: user.id, name: cleanBrand })
            .select('id')
            .single()
          brandId = newB?.id
        }
      }

      const { error: updateErr } = await supabase
        .from('products')
        .update({
          brand_id: brandId,
          brand: cleanBrand,
          name: name.trim(),
          quantity: numQty,
          unit: unit,
          price: numPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)

      if (updateErr) throw updateErr

      if (onProductUpdated) onProductUpdated()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update product.')
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
      padding: '0.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '1.25rem',
        background: 'var(--bg-surface)',
        maxHeight: 'min(94vh, 700px)',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Edit3 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>Edit Product Details</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
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

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Brand Name
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Stock Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
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
                  color: 'var(--text-main)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {UNITS.map(u => (
                  <option key={u} value={u} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Selling Price per Unit (₹)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

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
                background: 'var(--primary)',
                border: 'none',
                color: '#fff',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
