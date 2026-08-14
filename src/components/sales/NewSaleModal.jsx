import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Search, 
  UserCheck, 
  UserPlus, 
  Package, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  IndianRupee,
  ChevronRight,
  QrCode,
  Info
} from 'lucide-react'

export default function NewSaleModal({ isOpen, onClose, products = [], farmers = [], shopProfile, onSaleCompleted, onFarmerAdded }) {

  // Step 1: Farmer state
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [farmerSearch, setFarmerSearch] = useState('')
  const [showInlineFarmerForm, setShowInlineFarmerForm] = useState(false)
  const [inlineName, setInlineName] = useState('')
  const [inlinePhone, setInlinePhone] = useState('')
  const [inlineVillage, setInlineVillage] = useState('')
  const [addingFarmer, setAddingFarmer] = useState(false)

  // Step 2: Item Selection state
  const [selectedBrand, setSelectedBrand] = useState('ALL')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [itemQty, setItemQty] = useState('')
  
  // Step 3: Cart & Payment state
  const [cart, setCart] = useState([])
  const [paymentType, setPaymentType] = useState('full') // 'full' | 'partial' | 'credit'
  const [customPaidAmount, setCustomPaidAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedFarmer(null)
      setFarmerSearch('')
      setShowInlineFarmerForm(false)
      setSelectedBrand('ALL')
      setSelectedProductId('')
      setItemQty('')
      setCart([])
      setPaymentType('full')
      setCustomPaidAmount('')
      setPaymentMethod('cash')
      setPaymentNotes('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  // Filter in-stock products only (quantity > 0)
  const inStockProducts = products.filter(p => Number(p.quantity) > 0)
  
  // Available brands for in-stock products
  const availableBrands = Array.from(new Set(inStockProducts.map(p => p.brand))).sort()

  // Filter products by selected brand
  const filteredProducts = inStockProducts.filter(p => 
    selectedBrand === 'ALL' || p.brand.toLowerCase() === selectedBrand.toLowerCase()
  )

  // Currently selected product object
  const selectedProduct = products.find(p => p.id === selectedProductId)

  // Filter farmer list for selection dropdown
  const filteredFarmers = farmers.filter(f => {
    const q = farmerSearch.toLowerCase()
    return f.name.toLowerCase().includes(q) ||
           (f.phone && f.phone.includes(q)) ||
           (f.village && f.village.toLowerCase().includes(q))
  })

  // Handle Inline Farmer Creation
  const handleCreateInlineFarmer = async (e) => {
    e.preventDefault()
    if (!inlineName.trim()) {
      setError('Farmer name is required.')
      return
    }

    setAddingFarmer(true)
    setError('')
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertErr } = await supabase
        .from('farmers')
        .insert({
          dealer_id: user.id,
          name: inlineName.trim(),
          phone: inlinePhone.trim() || null,
          village: inlineVillage.trim() || null
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      setSelectedFarmer(data)
      setShowInlineFarmerForm(false)
      setInlineName('')
      setInlinePhone('')
      setInlineVillage('')
      if (onFarmerAdded) onFarmerAdded()
    } catch (err) {
      setError(err.message || 'Failed to add farmer inline.')
    } finally {
      setAddingFarmer(false)
    }
  }

  // Add Item to Cart
  const handleAddToCart = (e) => {
    e.preventDefault()
    setError('')

    if (!selectedProduct) {
      setError('Please select a valid product.')
      return
    }

    const qtyNum = parseFloat(itemQty)
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError('Please enter a valid quantity greater than zero.')
      return
    }

    // Check against cart + existing inventory quantity
    const existingCartItem = cart.find(item => item.product_id === selectedProduct.id)
    const currentCartQty = existingCartItem ? existingCartItem.qty : 0
    const totalProposedQty = currentCartQty + qtyNum

    if (totalProposedQty > Number(selectedProduct.quantity)) {
      setError(`Cannot add ${qtyNum} ${selectedProduct.unit}. Available stock is ${selectedProduct.quantity} ${selectedProduct.unit} (Cart already has ${currentCartQty}).`)
      return
    }

    if (existingCartItem) {
      setCart(cart.map(item => 
        item.product_id === selectedProduct.id 
          ? { ...item, qty: totalProposedQty }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_brand: selectedProduct.brand,
        unit: selectedProduct.unit,
        price_at_sale: Number(selectedProduct.price),
        qty: qtyNum
      }])
    }

    // Reset item picker
    setSelectedProductId('')
    setItemQty('')
  }

  // Remove Item from Cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  // Cart Total Calculation
  const grandTotal = cart.reduce((sum, item) => sum + (item.qty * item.price_at_sale), 0)

  // Confirm Sale via Atomic RPC call
  const handleConfirmSale = async () => {
    if (!cart.length) {
      setError('Your cart is empty. Add products before confirming.')
      return
    }

    // Calculate initial paid amount
    let initialPaid = 0
    if (paymentType === 'full') {
      initialPaid = grandTotal
    } else if (paymentType === 'credit') {
      initialPaid = 0
    } else if (paymentType === 'partial') {
      initialPaid = parseFloat(customPaidAmount)
      if (isNaN(initialPaid) || initialPaid < 0) {
        setError('Please enter a valid initial payment amount.')
        return
      }
      if (initialPaid > grandTotal) {
        setError(`Initial payment amount (₹${initialPaid.toFixed(2)}) cannot exceed total bill amount (₹${grandTotal.toFixed(2)}).`)
        return
      }
    }

    setSubmitting(true)
    setError('')

    try {
      let activeFarmerId = selectedFarmer ? selectedFarmer.id : null

      // If inline farmer form is currently active and name is filled, auto-save farmer record first
      if (showInlineFarmerForm && inlineName.trim()) {
        const user = (await supabase.auth.getUser()).data.user
        if (!user) throw new Error('Not authenticated')

        const { data: newFarmer, error: insertErr } = await supabase
          .from('farmers')
          .insert({
            dealer_id: user.id,
            name: inlineName.trim(),
            phone: inlinePhone.trim() || null,
            village: inlineVillage.trim() || null
          })
          .select()
          .single()

        if (insertErr) throw insertErr

        activeFarmerId = newFarmer.id
        setSelectedFarmer(newFarmer)
        setShowInlineFarmerForm(false)
        setInlineName('')
        setInlinePhone('')
        setInlineVillage('')
        if (onFarmerAdded) onFarmerAdded()
      }

      // Prepare payload for RPC confirm_sale
      const itemsPayload = cart.map(item => ({
        product_id: item.product_id,
        qty: item.qty,
        price_at_sale: item.price_at_sale
      }))

      const { data, error: rpcError } = await supabase.rpc('confirm_sale', {
        p_farmer_id: activeFarmerId,
        p_items: itemsPayload,
        p_initial_payment: initialPaid,
        p_payment_method: paymentMethod,
        p_notes: paymentNotes.trim() || null
      })

      if (rpcError) throw rpcError

      // Fetch full sale detail for receipt preview (including payments)
      const { data: fullSale, error: fetchErr } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total_amount,
          farmer:farmers (name, phone, village),
          sale_items (*),
          payments (*)
        `)
        .eq('id', data.sale_id)
        .single()

      if (fetchErr) throw fetchErr

      if (onSaleCompleted) onSaleCompleted(fullSale)
      onClose()
    } catch (err) {
      console.error('Sale confirmation error:', err)
      setError(err.message || 'Failed to complete transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1500,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface, #1e293b)',
        borderRadius: '16px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-hover)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingCart size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Create New Sale / Checkout
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            margin: '1rem 1.5rem 0 1.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body Grid (Left: Selection & Cart, Right: Summary & Confirm) */}
        <div style={{
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '1.5rem',
          overflowY: 'auto'
        }}>
          {/* LEFT COLUMN: Farmer & Item Picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Section 1: Farmer Selection */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>
                  1. Select Farmer / Customer
                </span>
                {!showInlineFarmerForm && (
                  <button
                    type="button"
                    onClick={() => setShowInlineFarmerForm(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#34d399',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <UserPlus size={14} /> + New Farmer
                  </button>
                )}
              </div>

              {showInlineFarmerForm ? (
                <form onSubmit={handleCreateInlineFarmer} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <input
                    type="text"
                    placeholder="Farmer Name (Required)"
                    value={inlineName}
                    onChange={(e) => setInlineName(e.target.value)}
                    required
                    style={{
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={inlinePhone}
                      onChange={(e) => setInlinePhone(e.target.value)}
                      style={{
                        padding: '0.55rem 0.8rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Village"
                      value={inlineVillage}
                      onChange={(e) => setInlineVillage(e.target.value)}
                      style={{
                        padding: '0.55rem 0.8rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <button
                      type="submit"
                      disabled={addingFarmer}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {addingFarmer ? 'Saving...' : 'Save & Select Farmer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInlineFarmerForm(false)}
                      style={{
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedFarmer ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--primary-light)',
                  border: '1px solid var(--border-color)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {selectedFarmer.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {selectedFarmer.village || 'No village'} • {selectedFarmer.phone || 'No phone'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFarmer(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search farmer name, phone, or village..."
                      value={farmerSearch}
                      onChange={(e) => setFarmerSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.8rem 0.55rem 2.4rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-hover)'
                  }}>
                    {filteredFarmers.length === 0 ? (
                      <div style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        No farmers found.
                      </div>
                    ) : (
                      filteredFarmers.map(f => (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFarmer(f)}
                          style={{
                            padding: '0.5rem 0.8rem',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem'
                          }}
                        >
                          <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{f.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {f.village ? f.village : f.phone || ''}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Add Product to Cart */}
            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                2. Select Product & Quantity
              </span>

              <form onSubmit={handleAddToCart} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Brand Filter Dropdown */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value)
                      setSelectedProductId('')
                    }}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="ALL">All Brands ({availableBrands.length})</option>
                    {availableBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Product Dropdown */}
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                    Product (In-Stock Only)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="">-- Choose Product --</option>
                    {filteredProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) — Stock: {p.quantity} {p.unit} @ ₹{p.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Product Specs & Qty Input */}
                {selectedProduct && (
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--primary-light)',
                    border: '1px solid var(--border-color)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Stock:</div>
                      <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
                        {selectedProduct.quantity} {selectedProduct.unit}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unit Price:</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        ₹{Number(selectedProduct.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedProduct ? selectedProduct.quantity : undefined}
                    placeholder="Quantity"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.55rem 0.8rem',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!selectedProduct || !itemQty}
                    style={{
                      padding: '0.55rem 1.2rem',
                      borderRadius: '8px',
                      background: selectedProduct && itemQty ? 'var(--primary)' : 'var(--bg-surface-hover)',
                      color: selectedProduct && itemQty ? '#fff' : 'var(--text-muted)',
                      border: selectedProduct && itemQty ? 'none' : '1px solid var(--border-color)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: selectedProduct && itemQty ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Plus size={16} /> Add to Cart
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Cart Summary & Atomic Confirmation */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-surface)',
            borderRadius: '12px',
            padding: '1.25rem',
            border: '1px solid var(--border-color)'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
              Cart Summary ({cart.length} items)
            </h4>

            {/* Cart Items List */}
            <div style={{
              flex: 1,
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}>
              {cart.length === 0 ? (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '10px'
                }}>
                  Cart is empty. Select products on the left to add items.
                </div>
              ) : (
                cart.map(item => {
                  const lineTotal = item.qty * item.price_at_sale
                  return (
                    <div
                      key={item.product_id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.5rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.product_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.qty} {item.unit} x ₹{item.price_at_sale.toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.9rem' }}>
                          ₹{lineTotal.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.product_id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Grand Total & Payment Section */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Total Bill Amount:
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>

              {/* Payment Type Pills */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Payment Mode at Checkout:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    style={{
                      padding: '0.45rem 0.2rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: paymentType === 'full' ? 'var(--primary)' : 'var(--border-color)',
                      background: paymentType === 'full' ? 'var(--primary-light)' : 'var(--bg-surface)',
                      color: paymentType === 'full' ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Full Payment
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('partial')}
                    style={{
                      padding: '0.45rem 0.2rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: paymentType === 'partial' ? 'var(--warning)' : 'var(--border-color)',
                      background: paymentType === 'partial' ? 'var(--warning-bg)' : 'var(--bg-surface)',
                      color: paymentType === 'partial' ? 'var(--warning)' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Partial Paid
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('credit')}
                    style={{
                      padding: '0.45rem 0.2rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: paymentType === 'credit' ? 'var(--credit)' : 'var(--border-color)',
                      background: paymentType === 'credit' ? 'var(--credit-bg)' : 'var(--bg-surface)',
                      color: paymentType === 'credit' ? 'var(--credit)' : 'var(--text-muted)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Full Credit
                  </button>
                </div>
              </div>

              {/* Partial Payment Input */}
              {paymentType === 'partial' && (
                <div style={{ background: 'var(--warning-bg)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--warning-border)' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'block', marginBottom: '0.3rem', fontWeight: '700' }}>
                    Initial Amount Paid Now (₹):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={grandTotal}
                    value={customPaidAmount}
                    onChange={(e) => setCustomPaidAmount(e.target.value)}
                    placeholder={`e.g. ₹500 (Max ₹${grandTotal.toFixed(2)})`}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {customPaidAmount && parseFloat(customPaidAmount) >= 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.3rem', fontWeight: '600' }}>
                      Remaining Balance Due: ₹{Math.max(0, grandTotal - (parseFloat(customPaidAmount) || 0)).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {paymentType === 'credit' && (
                <div style={{ fontSize: '0.78rem', color: 'var(--credit)', background: 'var(--credit-bg)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--credit-border)' }}>
                  Full bill amount of <strong>₹{grandTotal.toFixed(2)}</strong> will be added to {selectedFarmer ? selectedFarmer.name : 'the customer'}'s pending credit balance.
                </div>
              )}

              {/* Payment Method Selector & Notes (Shown if paymentType is full or partial) */}
              {paymentType !== 'credit' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / GPay / PhonePe</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                      Ref / Notes
                    </label>
                    <input
                      type="text"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Optional notes"
                      style={{
                        width: '100%',
                        padding: '0.45rem',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-hover)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Dynamic In-Browser UPI QR Code Box */}
              {paymentType !== 'credit' && paymentMethod === 'upi' && (() => {
                const payAmount = paymentType === 'full' ? grandTotal : (parseFloat(customPaidAmount) || 0)
                const dealerUpi = shopProfile?.upi_id?.trim() || ''
                const dealerName = shopProfile?.shop_name?.trim() || 'Agri Store'

                if (!dealerUpi) {
                  return (
                    <div style={{
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      color: 'var(--warning)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.65rem',
                      marginTop: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.2rem', color: 'var(--text-main)' }}>
                          UPI QR Payments Disabled
                        </strong>
                        Add your Store UPI ID in <strong>Settings &gt; Business Profile</strong> to generate scannable QR codes for customers.
                      </div>
                    </div>
                  )
                }

                const upiDeepLink = `upi://pay?pa=${dealerUpi}&pn=${encodeURIComponent(dealerName)}&am=${payAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Bill Payment')}`

                return (
                  <div style={{
                    background: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginTop: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <QrCode size={18} color="var(--primary)" /> Scan QR to Pay via UPI / GPay
                    </div>

                    <div style={{
                      background: '#ffffff',
                      padding: '12px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'inline-block'
                    }}>
                      <QRCodeSVG value={upiDeepLink} size={180} level="M" />
                    </div>

                    <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>
                      Amount: ₹{payAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Payee UPI ID: <strong style={{ color: 'var(--text-main)' }}>{dealerUpi}</strong>
                    </div>

                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--warning)',
                      background: 'var(--warning-bg)',
                      border: '1px solid var(--warning-border)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      textAlign: 'left'
                    }}>
                      <Info size={14} style={{ flexShrink: 0 }} />
                      <span>Convenience QR: Visually confirm payment receipt in your UPI app before completing sale.</span>
                    </div>
                  </div>
                )
              })()}


              <button
                type="button"
                onClick={handleConfirmSale}
                disabled={submitting || cart.length === 0}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: cart.length > 0 ? 'var(--primary)' : 'var(--bg-surface-hover)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: cart.length > 0 ? 'var(--shadow-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submitting ? 'Processing Transaction...' : 'Confirm Sale & Generate Bill'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
