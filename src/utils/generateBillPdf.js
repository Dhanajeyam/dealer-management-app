import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Robust helper for calling autoTable across different bundling formats
function renderAutoTable(doc, options) {
  if (typeof doc.autoTable === 'function') {
    doc.autoTable(options)
  } else if (typeof autoTable === 'function') {
    autoTable(doc, options)
  } else if (autoTable && typeof autoTable.default === 'function') {
    autoTable.default(doc, options)
  }
}

/**
 * Formats currency values as "Rs. X,XX,XXX.XX" or "Rs. XX.XX"
 */
export function formatCurrency(amount) {
  const num = Number(amount || 0)
  return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Generates a crisp, selectable vector-text jsPDF document for a sale bill
 * Dynamically switches between "TAX INVOICE" and "SALE BILL" based on GSTIN presence.
 *
 * @param {Object} saleData
 * @param {Object} shopProfile
 * @returns {jsPDF} doc
 */
export function generateBillPdfDoc(saleData, shopProfile) {
  if (!saleData) {
    throw new Error('Sale data is required to generate bill PDF')
  }

  const {
    id: saleId,
    created_at,
    date,
    total_amount,
    farmer,
    farmers,
    sale_items = [],
    payments = []
  } = saleData

  const activeFarmer = farmer || farmers || {}
  const hasGstin = Boolean(shopProfile?.gstin && shopProfile.gstin.trim())
  const invoiceType = hasGstin ? 'TAX INVOICE' : 'SALE BILL'
  const billNumber = `INV-${(saleId || '').substring(0, 8).toUpperCase()}`

  const grandTotal = Number(total_amount || 0)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  const balanceDue = Math.max(0, grandTotal - totalPaid)

  let paymentStatusLabel = 'FULL PAYMENT'
  let statusRgb = [4, 120, 87] // #047857
  let statusBgRgb = [236, 253, 245] // #ecfdf5

  if (balanceDue > 0.01 && totalPaid > 0) {
    paymentStatusLabel = 'PARTIAL PAYMENT'
    statusRgb = [180, 83, 9] // #b45309
    statusBgRgb = [255, 251, 235] // #fffbeb
  } else if (totalPaid <= 0.01 && grandTotal > 0) {
    paymentStatusLabel = 'CREDIT SALE'
    statusRgb = [185, 28, 28] // #b91c1c
    statusBgRgb = [254, 242, 242] // #fef2f2
  }

  const formattedDate = new Date(created_at || date || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })

  // Create A4 portrait document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pageWidth = 210
  const margin = 14
  const contentWidth = pageWidth - margin * 2
  let currentY = 14

  // --- 1. Top Header Banner & Document Type ---
  // Left: Shop Name & Details
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(21, 128, 61) // Emerald / Primary green #15803d
  const shopName = shopProfile?.shop_name || 'Agri-Chemical Distribution'
  doc.text(shopName, margin, currentY + 4)

  // Right: Document Type Badge (TAX INVOICE / SALE BILL)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  const badgeWidth = doc.getTextWidth(invoiceType) + 8
  const badgeHeight = 7
  const badgeX = pageWidth - margin - badgeWidth
  doc.setFillColor(241, 245, 249) // Slate 100
  doc.setDrawColor(203, 213, 225) // Slate 300
  doc.roundedRect(badgeX, currentY - 1, badgeWidth, badgeHeight, 1.5, 1.5, 'FD')
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text(invoiceType, badgeX + 4, currentY + 3.8)

  currentY += 8

  // Shop Address & Contact Info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(71, 85, 105) // Slate 600

  let shopDetailsLeft = []
  if (shopProfile?.address) {
    shopDetailsLeft.push(shopProfile.address)
  }
  if (shopProfile?.phone) {
    shopDetailsLeft.push(`Phone: ${shopProfile.phone}`)
  }

  // Draw shop address and contact on left
  shopDetailsLeft.forEach((line) => {
    doc.text(line, margin, currentY)
    currentY += 4
  })

  if (hasGstin) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(21, 128, 61) // #15803d
    doc.text(`GSTIN: ${shopProfile.gstin}`, margin, currentY)
    doc.setFont('helvetica', 'normal')
    currentY += 4.5
  } else {
    currentY += 1
  }

  // Right-aligned Invoice metadata (Date, Bill ID, Status)
  const metaRightX = pageWidth - margin
  let metaY = 22

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`Invoice ID: ${billNumber}`, metaRightX, metaY, { align: 'right' })
  metaY += 4

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Date: ${formattedDate}`, metaRightX, metaY, { align: 'right' })
  metaY += 4.5

  // Payment Status Tag
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  const statusWidth = doc.getTextWidth(paymentStatusLabel) + 6
  const statusX = metaRightX - statusWidth
  doc.setFillColor(statusBgRgb[0], statusBgRgb[1], statusBgRgb[2])
  doc.setDrawColor(statusRgb[0], statusRgb[1], statusRgb[2])
  doc.roundedRect(statusX, metaY - 3, statusWidth, 5, 1, 1, 'FD')
  doc.setTextColor(statusRgb[0], statusRgb[1], statusRgb[2])
  doc.text(paymentStatusLabel, statusX + 3, metaY + 0.6)

  currentY = Math.max(currentY, metaY + 5)

  // Header Divider
  doc.setDrawColor(21, 128, 61)
  doc.setLineWidth(0.6)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 4

  // --- 2. Farmer / Customer Details Box ---
  const farmerBoxY = currentY
  const farmerBoxHeight = 16

  doc.setFillColor(248, 250, 252) // Slate 50
  doc.setDrawColor(226, 232, 240) // Slate 200
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, farmerBoxY, contentWidth, farmerBoxHeight, 2, 2, 'FD')

  // Farmer Name
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(100, 116, 139)
  doc.text('FARMER / CUSTOMER:', margin + 4, farmerBoxY + 5)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  const farmerName = activeFarmer?.name || 'Walk-in Customer'
  doc.text(farmerName, margin + 4, farmerBoxY + 11)

  // Farmer Contact & Location (Right side of box)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 65, 85)

  let rightFarmerDetails = []
  if (activeFarmer?.phone) {
    rightFarmerDetails.push(`Phone: ${activeFarmer.phone}`)
  }
  if (activeFarmer?.village) {
    rightFarmerDetails.push(`Village: ${activeFarmer.village}`)
  }

  let farmerInfoRightY = farmerBoxY + 5.5
  rightFarmerDetails.forEach((info) => {
    doc.text(info, margin + contentWidth / 2 + 5, farmerInfoRightY)
    farmerInfoRightY += 4.5
  })

  currentY = farmerBoxY + farmerBoxHeight + 5

  // --- 3. Itemized Products Table ---
  const tableRows = sale_items.map((item, index) => {
    const qty = Number(item.qty || 0)
    const price = Number(item.price_at_sale || 0)
    const lineTotal = qty * price
    const brandInfo = item.product_brand ? `\nBrand: ${item.product_brand}` : ''

    return [
      String(index + 1),
      `${item.product_name || 'Product'}${brandInfo}`,
      `${qty} ${item.unit || ''}`.trim(),
      `Rs. ${price.toFixed(2)}`,
      `Rs. ${lineTotal.toFixed(2)}`
    ]
  })

  renderAutoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Product & Brand', 'Qty', 'Rate (Rs.)', 'Amount (Rs.)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.8,
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, textColor: [100, 116, 139] },
      1: { halign: 'left', cellWidth: 'auto', fontStyle: 'bold' },
      2: { halign: 'right', cellWidth: 24 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'right', cellWidth: 32, fontStyle: 'bold' }
    },
    didParseCell: (data) => {
      // Align header cells matching column alignment
      if (data.section === 'head') {
        if (data.column.index === 0) data.cell.styles.halign = 'center'
        if (data.column.index >= 2) data.cell.styles.halign = 'right'
      }
    }
  })

  currentY = doc.lastAutoTable.finalY + 5

  // --- 4. Payment & Totals Summary Box ---
  // Ensure enough space on current page, or start new page if close to bottom
  if (currentY > 230) {
    doc.addPage()
    currentY = 15
  }

  const summaryBoxY = currentY
  const summaryBoxHeight = payments.length > 0 ? 32 + payments.length * 4.2 : 28

  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, summaryBoxY, contentWidth, summaryBoxHeight, 2, 2, 'FD')

  // Left Side of Summary: Recorded Payments Breakdown (if any)
  if (payments.length > 0) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.text('PAYMENT ENTRIES RECORDED:', margin + 4, summaryBoxY + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(71, 85, 105)
    let pY = summaryBoxY + 10

    payments.forEach((p) => {
      const pDate = new Date(p.paid_at || Date.now()).toLocaleDateString('en-IN')
      const pMethod = (p.payment_method || 'CASH').toUpperCase()
      const pNotes = p.notes ? ` (${p.notes})` : ''
      const entryText = `• ${pDate} via ${pMethod}${pNotes}: Rs. ${Number(p.amount || 0).toFixed(2)}`
      doc.text(entryText, margin + 4, pY)
      pY += 4.2
    })
  }

  // Right Side of Summary: Grand Total, Paid, Balance Due
  const summaryValuesX = pageWidth - margin - 4
  const summaryLabelsX = summaryValuesX - 52
  let sY = summaryBoxY + 6

  // Total Bill Amount
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('Total Bill Amount:', summaryLabelsX, sY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, summaryValuesX, sY, { align: 'right' })

  sY += 5.5

  // Total Amount Paid
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(71, 85, 105)
  doc.text('Total Amount Paid:', summaryLabelsX, sY)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(4, 120, 87) // Green
  doc.text(`Rs. ${totalPaid.toFixed(2)}`, summaryValuesX, sY, { align: 'right' })

  sY += 5

  // Divider Line inside Summary Box
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.2)
  doc.line(summaryLabelsX, sY, summaryValuesX, sY)
  sY += 4.5

  // Balance Due
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Balance Due:', summaryLabelsX, sY)

  doc.setFontSize(10.5)
  if (balanceDue > 0) {
    doc.setTextColor(185, 28, 28) // Red #b91c1c
  } else {
    doc.setTextColor(4, 120, 87) // Green #047857
  }
  doc.text(`Rs. ${balanceDue.toFixed(2)}`, summaryValuesX, sY, { align: 'right' })

  currentY = summaryBoxY + summaryBoxHeight + 8

  // --- 5. Footer (Thank you note & Signature) ---
  if (currentY > 265) {
    doc.addPage()
    currentY = 20
  }

  doc.setDrawColor(15, 23, 42)
  doc.setLineWidth(0.4)
  doc.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 5

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text('Thank you for your business!', margin, currentY)

  doc.setFont('helvetica', 'italic')
  doc.text('Authorized Signature', pageWidth - margin, currentY, { align: 'right' })

  return doc
}

/**
 * Generates a binary PDF Blob and accompanying metadata (filename, formatted bill title)
 *
 * @param {Object} saleData
 * @param {Object} shopProfile
 * @returns {{ blob: Blob, filename: string, billNumber: string, title: string, grandTotal: number }}
 */
export function generateBillPdfBlob(saleData, shopProfile) {
  const doc = generateBillPdfDoc(saleData, shopProfile)
  const blob = doc.output('blob')

  const saleId = saleData?.id || ''
  const billNumber = `INV-${saleId.substring(0, 8).toUpperCase()}`
  const hasGstin = Boolean(shopProfile?.gstin && shopProfile.gstin.trim())
  const prefix = hasGstin ? 'TaxInvoice' : 'SaleBill'
  const filename = `${prefix}_${billNumber}.pdf`
  const title = `${hasGstin ? 'Tax Invoice' : 'Sale Bill'} - ${billNumber}`
  const grandTotal = Number(saleData?.total_amount || 0)

  return {
    blob,
    filename,
    billNumber,
    title,
    grandTotal
  }
}

/**
 * Triggers a direct browser download of the crisp vector-text PDF bill
 *
 * @param {Object} saleData
 * @param {Object} shopProfile
 */
export function downloadBillPdf(saleData, shopProfile) {
  const { blob, filename } = generateBillPdfBlob(saleData, shopProfile)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Checks if the Web Share API is available and can share file attachments
 *
 * @returns {boolean}
 */
export function canSharePdfFile() {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
    return false
  }

  try {
    const dummyFile = new File([''], 'test.pdf', { type: 'application/pdf' })
    return navigator.canShare({ files: [dummyFile] })
  } catch {
    return false
  }
}

/**
 * Attempts to share the PDF bill via the Web Share API (WhatsApp on mobile),
 * falling back to direct download if sharing is not supported or rejected.
 *
 * @param {Object} saleData
 * @param {Object} shopProfile
 * @returns {Promise<{ shared: boolean, downloaded: boolean }>}
 */
export async function shareOrDownloadBillPdf(saleData, shopProfile) {
  const { blob, filename, title, grandTotal } = generateBillPdfBlob(saleData, shopProfile)
  const farmerName = saleData?.farmer?.name || saleData?.farmers?.name || 'Customer'
  const shopName = shopProfile?.shop_name || 'Agri-Chemical Store'

  const shareText = `${title}\nCustomer: ${farmerName}\nTotal: Rs. ${grandTotal.toFixed(2)}\nIssued by: ${shopName}`

  if (canSharePdfFile()) {
    try {
      const pdfFile = new File([blob], filename, { type: 'application/pdf' })
      await navigator.share({
        title,
        text: shareText,
        files: [pdfFile]
      })
      return { shared: true, downloaded: false }
    } catch (err) {
      // User cancelled share or share failed
      if (err.name === 'AbortError') {
        return { shared: false, downloaded: false, cancelled: true }
      }
      console.warn('Web Share API failed, falling back to download:', err)
    }
  }

  // Fallback: Download file
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return { shared: false, downloaded: true }
}
