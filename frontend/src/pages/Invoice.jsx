"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { backEndURL } from "../Backendurl"
import Dotspinner from "../loaders/Loader"
import { useNavigate } from "react-router-dom"
// Enhanced Print Styles for both POS and A4 formats
const printStyles = `
@media print {
  html, body {
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    background: #FFFFFF !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-sizing: border-box;
    overflow: visible !important;
  }
  
  .pos-invoice {
    width: 80mm !important;
    max-width: 80mm !important;
    font-size: 11px !important;
    line-height: 1.3 !important;
    font-family: 'Courier New', monospace !important;
  }
  
  .a4-invoice {
    width: 210mm !important;
    height: 297mm !important;
    max-width: 210mm !important;
    font-size: 12px !important;
    font-family: Arial, sans-serif !important;
  }
  
  #printable-invoice {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    background: #FFFFFF !important;
    color: #2D2D2D !important;
    z-index: 9999 !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    padding: 0 !important;
    overflow: visible !important;
    page-break-inside: avoid !important;
  }
  
  #printable-invoice * {
    visibility: visible !important;
    color: #2D2D2D !important;
    box-shadow: none !important;
    background: transparent !important;
    page-break-inside: avoid !important;
  }
  
  .no-print {
    display: none !important;
  }
  
  .print-button {
    display: none !important;
  }
  
  .invoice-header-blue {
    background: #1e40af !important;
    color: white !important;
  }
  
  .invoice-accent {
    color: #1e40af !important;
  }
  
  .invoice-border {
    border: 1px solid #e5e7eb !important;
  }
  
  .thermal-receipt {
    text-align: center !important;
    border: none !important;
  }
  
  .thermal-line {
    border-bottom: 1px dashed #000 !important;
    margin: 5px 0 !important;
  }
  
  @page {
    margin: 10mm;
  }
}

/* Enhanced Theme Styles */
.fade-in {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in {
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.card-shadow {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
}

.card-shadow:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Tab styles */
.tab-active {
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.tab-inactive {
  background: #F8FAFC;
  color: #64748B;
  border: 1px solid #E2E8F0;
}

.tab-held {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  position: relative;
}

.tab-held::after {
  content: "🟡";
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 12px;
}

/* Button themes */
.btn-primary {
  background: linear-gradient(135deg, #3B82F6, #1E40AF);
  color: white;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #1E40AF, #1E3A8A);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  transition: all 0.2s ease;
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #DC2626, #B91C1C);
  transform: translateY(-1px);
}

.btn-success {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  transition: all 0.2s ease;
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

/* Focus indicators for keyboard navigation */
.keyboard-focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}

.product-selected {
  background: linear-gradient(135deg, #EBF8FF, #DBEAFE);
  border: 2px solid #3B82F6;
  transform: scale(1.02);
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.3);
}

.product-card {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: all 0.2s ease;
}

.product-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
}

.product-card-content {
  position: relative;
  z-index: 1;
}

/* Loading spinner */
.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Print options modal */
.print-option-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.print-option-card:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.2);
}

.print-option-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.print-preview {
  width: 100%;
  height: 120px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 48px;
}

/* Toast improvements */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
}

.toast {
  margin-bottom: 10px;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-weight: 500;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success { background: linear-gradient(135deg, #10b981, #059669); }
.toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); }
.toast-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.toast-info { background: linear-gradient(135deg, #3b82f6, #1e40af); }

/* Performance optimizations */
.virtual-scroll {
  height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.optimized-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  will-change: transform;
}

/* Fast transitions */
* {
  transition-duration: 0.15s !important;
}

.instant {
  transition: none !important;
}
`

// Add download functionality
const downloadInvoiceAsPDF = (invoice, format = "a4") => {
  if (!invoice) {
    console.error('Invoice data is missing')
    return
  }

  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  const invoiceHTML = generateInvoiceHTML(invoice, format)

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id || 'Unknown'}</title>
      <style>${printStyles}</style>
    </head>
    <body>
      ${invoiceHTML}
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => window.close(), 1000);
        }
      </script>
    </body>
    </html>
  `)
  printWindow.document.close()
}

const generateInvoiceHTML = (invoice, format) => {
  if (!invoice) {
    console.error('Invoice data is missing')
    return '<div>Error: Invoice data is missing</div>'
  }

  if (format === "pos") {
    return generateThermalReceiptHTML(invoice)
  } else {
    return generateA4InvoiceHTML(invoice)
  }
}

const generateA4InvoiceHTML = (invoice) => {
  if (!invoice) {
    console.error('Invoice data is missing')
    return '<div>Error: Invoice data is missing</div>'
  }

  // Ensure all required values have defaults
  const safeInvoice = {
    id: invoice.id || 'Unknown',
    date: invoice.date || new Date(),
    customer: invoice.customer || null,
    items: invoice.items || [],
    subtotal: invoice.subtotal || 0,
    discountAmount: invoice.discountAmount || 0,
    taxAmount: invoice.taxAmount || 0,
    total: invoice.total || 0,
    paymentMethod: invoice.paymentMethod || 'Cash',
    paymentStatus: invoice.paymentStatus || 'Paid'
  }

  return `
    <div class="a4-invoice professional-invoice">
      <!-- Header Section -->
      <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 50px; height: 50px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; color: #1e40af; font-weight: bold; font-size: 24px;">
                R
              </div>
              <div>
                <h1 style="margin: 0; font-size: 28px; font-weight: bold;">R-tech Solution</h1>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Point of Sale System</p>
              </div>
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
              <p style="margin: 2px 0;">📍 262 Peradeniya road, Kandy</p>
              <p style="margin: 2px 0;">📞 +94 11 123 4567</p>
              <p style="margin: 2px 0;">✉️ support@srilankapos.com</p>
            </div>
          </div>
          <div style="text-align: right; color: white;">
            <h2 style="margin: 0 0 10px 0; font-size: 32px; font-weight: bold;">INVOICE</h2>
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 6px;">
              <p style="margin: 2px 0;"><strong>Invoice #:</strong> ${safeInvoice.id}</p>
              <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(safeInvoice.date).toLocaleDateString()}</p>
              <p style="margin: 2px 0;"><strong>Time:</strong> ${new Date(safeInvoice.date).toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      ${safeInvoice.customer
      ? `
        <div style="padding: 15px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">👤 BILL TO</h3>
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #1e40af;">
            <p style="margin: 0; font-weight: 600; font-size: 14px;">${safeInvoice.customer.name || 'N/A'}</p>
            ${safeInvoice.customer.company ? `<p style="margin: 2px 0; font-size: 12px; color: #6b7280;">🏢 ${safeInvoice.customer.company}</p>` : ""}
            ${safeInvoice.customer.phone ? `<p style="margin: 2px 0; font-size: 12px; color: #6b7280;">📞 ${safeInvoice.customer.phone}</p>` : ""}
            ${safeInvoice.customer.email ? `<p style="margin: 2px 0; font-size: 12px; color: #6b7280;">✉️ ${safeInvoice.customer.email}</p>` : ""}
          </div>
        </div>
      `
      : ""
    }

      <!-- Items Table -->
      <div style="padding: 15px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 16px;">📋 ITEMS</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
          <thead>
            <tr style="background: #1e40af; color: white;">
              <th style="text-align: left; padding: 12px 8px;">DESCRIPTION</th>
              <th style="text-align: center; padding: 12px 8px; width: 80px;">QTY</th>
              <th style="text-align: right; padding: 12px 8px; width: 100px;">RATE</th>
              <th style="text-align: right; padding: 12px 8px; width: 100px;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${safeInvoice.items
      .map(
        (item, index) => `
              <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};">
                <td style="padding: 10px 8px;">
                  <div style="font-weight: 600; color: #1f2937;">${item.name || 'Unknown Item'}</div>
                  <div style="font-size: 11px; color: #6b7280;">🏷️ ${item.category || 'N/A'} • SKU: ${item.barcode || 'N/A'}</div>
                </td>
                <td style="text-align: center; padding: 10px 8px; font-weight: 500;">${item.quantity || 0}</td>
                <td style="text-align: right; padding: 10px 8px;">Rs ${(item.price || 0).toFixed(2)}</td>
                <td style="text-align: right; padding: 10px 8px; font-weight: 600;">Rs ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
              </tr>
            `,
      )
      .join("")}
          </tbody>
        </table>
      </div>

      <!-- Summary Section -->
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <div style="width: 300px; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Subtotal:</span>
            <span style="font-weight: 500;">Rs ${safeInvoice.subtotal.toFixed(2)}</span>
          </div>
          ${safeInvoice.discountAmount > 0
      ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc2626;">
              <span>Discount:</span>
              <span>-Rs ${safeInvoice.discountAmount.toFixed(2)}</span>
            </div>
          `
      : ""
    }
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6b7280;">Tax:</span>
            <span style="font-weight: 500;">Rs ${safeInvoice.taxAmount.toFixed(2)}</span>
          </div>
          <div style="border-top: 2px solid #1e40af; padding-top: 8px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #1e40af;">
              <span>TOTAL:</span>
              <span>Rs ${safeInvoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Information -->
      <div style="padding: 15px; border: 1px solid #e5e7eb; margin-top: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">💳 PAYMENT INFORMATION</h3>
        <div style="background: #f0fdf4; padding: 12px; border-radius: 6px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #166534;"><strong>Payment Method:</strong> ${safeInvoice.paymentMethod}</p>
          <p style="margin: 2px 0; color: #166534;"><strong>Payment Status:</strong> ${safeInvoice.paymentStatus}</p>
          <p style="margin: 2px 0; color: #166534;"><strong>Amount Paid:</strong> Rs ${safeInvoice.total.toFixed(2)}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p style="margin: 5px 0; font-weight: 600;">Thank you for your business! 🙏</p>
        <p style="margin: 5px 0;">This is a computer generated invoice and does not require signature.</p>
        <p style="margin: 5px 0;">Powered by R-tech Solution POS System</p>
      </div>
    </div>
  `
}

const generateThermalReceiptHTML = (invoice) => {
  return `
    <div class="pos-invoice" style="font-family: 'Courier New', monospace; text-align: center; line-height: 1.4;">
      <div style="text-align: center; margin-bottom: 10px;">
        <h2 style="margin: 0; font-size: 16px; font-weight: bold;">R-TECH SOLUTION</h2>
        <p style="margin: 2px 0; font-size: 10px;">Point of Sale System</p>
        <p style="margin: 1px 0; font-size: 9px;">262 Peradeniya road, Kandy</p>
        <p style="margin: 1px 0; font-size: 9px;">Tel: +94 11 123 4567</p>
      </div>
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: center; margin: 8px 0;">
        <p style="margin: 1px 0; font-size: 10px;"><strong>RETAIL INVOICE</strong></p>
        <p style="margin: 1px 0; font-size: 9px;">Invoice: ${invoice.id}</p>
        <p style="margin: 1px 0; font-size: 9px;">Date: ${new Date(invoice.date).toLocaleDateString()}</p>
        <p style="margin: 1px 0; font-size: 9px;">Time: ${new Date(invoice.date).toLocaleTimeString()}</p>
      </div>
      
      ${invoice.customer
      ? `
        <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
        <div style="text-align: left; margin: 8px 0;">
          <p style="margin: 1px 0; font-size: 9px;"><strong>Customer:</strong></p>
          <p style="margin: 1px 0; font-size: 9px;">${invoice.customer.name}</p>
        </div>
      `
      : ""
    }
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: left; margin: 8px 0;">
        ${invoice.items
      .map(
        (item) => `
          <div style="margin-bottom: 6px;">
            <p style="margin: 1px 0; font-size: 9px; font-weight: bold;">${item.name}</p>
            <div style="display: flex; justify-content: space-between; font-size: 9px;">
              <span>${item.quantity} x Rs ${item.price.toFixed(2)}</span>
              <span>Rs ${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        `,
      )
      .join("")}
      </div>
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: right; margin: 8px 0; font-size: 9px;">
        <div style="display: flex; justify-content: space-between; margin: 2px 0;">
          <span>Sub Total:</span>
          <span>Rs ${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${invoice.discountAmount > 0
      ? `
          <div style="display: flex; justify-content: space-between; margin: 2px 0;">
            <span>Discount:</span>
            <span>-Rs ${invoice.discountAmount.toFixed(2)}</span>
          </div>
        `
      : ""
    }
        <div style="display: flex; justify-content: space-between; margin: 2px 0;">
          <span>Tax:</span>
          <span>Rs ${invoice.taxAmount.toFixed(2)}</span>
        </div>
        <div style="border-bottom: 1px dashed #333; margin: 4px 0;"></div>
        <div style="display: flex; justify-content: space-between; margin: 2px 0; font-weight: bold; font-size: 10px;">
          <span>TOTAL:</span>
          <span>Rs ${invoice.total.toFixed(2)}</span>
        </div>
      </div>
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: center; margin: 8px 0; font-size: 9px;">
        <p style="margin: 1px 0;">Payment: ${invoice.paymentMethod || "Cash"}</p>
        <p style="margin: 1px 0;">Cash Tendered: Rs ${invoice.total.toFixed(2)}</p>
        <p style="margin: 1px 0;">Change: Rs 0.00</p>
      </div>
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: center; margin: 8px 0; font-size: 8px;">
        <p style="margin: 2px 0;">Thank you for your business!</p>
        <p style="margin: 2px 0;">Please come again</p>
        <p style="margin: 2px 0;">Powered by R-tech Solution</p>
      </div>
    </div>
  `
}

// Fast Loading Spinner Component
const FastSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="spinner"></div>
    <span className="ml-2 text-sm text-gray-600">Loading...</span>
  </div>
)

// Optimized Toast Component
const OptimizedToast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 2000) // Reduced from 3000ms
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{getIcon()}</span>
            <span>{message}</span>
          </div>
          <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 text-xl">
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Tab Component with faster switching
const FastTabComponent = ({ tabs, activeTab, onTabChange, onAddTab, heldBills, onHoldBill, onUnholdBill }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-4">
        {/* POS System Box and Hold/Unhold Buttons */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">POS System</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => onHoldBill(activeTab)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Hold Current Bill (Shift+H)"
              >
                Hold Bill
              </button>
              <button
                onClick={() => onUnholdBill(activeTab)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Unhold Current Bill (Shift+U)"
              >
                Unhold Bill
              </button>
            </div>
          </div>
          <button
            onClick={onAddTab}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            title="Add New Tab (Shift+N)"
          >
            New Tab
          </button>
        </div>

        {/* Tabs Container with Wrapping */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={`Switch to Tab ${String(tab.number).padStart(2, "0")} (Ctrl+${tab.number})`}
              >
                Tab {String(tab.number).padStart(2, "0")}
                {heldBills.includes(tab.id) && (
                  <span className="ml-2 text-yellow-500">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Print Selection Modal with better UI
const EnhancedPrintSelectionModal = ({ onClose, onPrintSelection, invoice }) => {
  const [selectedFormat, setSelectedFormat] = useState("a4")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePrint = async () => {
    setIsProcessing(true)
    try {
      await onPrintSelection(selectedFormat, invoice)
      onClose()
    } catch (error) {
      console.error("Print error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (format) => {
    setIsProcessing(true)
    try {
      downloadInvoiceAsPDF(invoice, format)
    } catch (error) {
      console.error("Download error:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl card-shadow fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">🖨️ Print & Download Options</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* A4 Invoice Option */}
          <div
            className={`print-option-card ${selectedFormat === "a4" ? "selected" : ""}`}
            onClick={() => setSelectedFormat("a4")}
          >
            <div className="print-preview">📄</div>
            <h4 className="font-semibold text-lg mb-2">A4 Invoice</h4>
            <p className="text-gray-600 text-sm mb-4">Professional A4 format with company branding</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrint()
                }}
                disabled={isProcessing}
                className="flex-1 btn-primary px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                {isProcessing ? <FastSpinner /> : "🖨️ Print"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload("a4")
                }}
                disabled={isProcessing}
                className="flex-1 btn-success px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                📥 Download
              </button>
            </div>
          </div>

          {/* POS Receipt Option */}
          <div
            className={`print-option-card ${selectedFormat === "pos" ? "selected" : ""}`}
            onClick={() => setSelectedFormat("pos")}
          >
            <div className="print-preview">🧾</div>
            <h4 className="font-semibold text-lg mb-2">POS Receipt</h4>
            <p className="text-gray-600 text-sm mb-4">Thermal printer format (80mm)</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrint()
                }}
                disabled={isProcessing}
                className="flex-1 btn-primary px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                {isProcessing ? <FastSpinner /> : "🖨️ Print"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload("pos")
                }}
                disabled={isProcessing}
                className="flex-1 btn-success px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
              >
                📥 Download
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 btn-primary rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isProcessing ? <FastSpinner /> : `🖨️ Print ${selectedFormat === "a4" ? "A4" : "Receipt"}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom Search Modal Component
const CustomSearchModal = ({
  isOpen,
  onClose,
  products,
  searchTerm,
  setSearchTerm,
  selectedIndex,
  setSelectedIndex,
  onProductSelect,
  onQuantityAdd,
}) => {
  const searchInputRef = useRef(null)

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [products, searchTerm])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      setSelectedIndex(0)
    }
  }, [isOpen, setSelectedIndex])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (filteredProducts[selectedIndex]) {
            const product = filteredProducts[selectedIndex]
            onProductSelect(product)
            onQuantityAdd(product.id)
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, selectedIndex, filteredProducts, onProductSelect, onQuantityAdd, onClose, setSelectedIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-96 card-shadow fade-in">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">🔍 Search Products</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              ×
            </button>
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type to search products..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="max-h-64 overflow-y-auto virtual-scroll">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <p>No products found</p>
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className={`px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex ? "bg-blue-50 border-l-4 border-blue-500" : "hover:bg-gray-50"
                  }`}
                onClick={() => {
                  onProductSelect(product)
                  onQuantityAdd(product.id)
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0"
                      style={{
                        backgroundImage: product.image ? `url(${product.image})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!product.image && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        🏷️ {product.category} • 📊 {product.barcode} • 📦 {product.stock} in stock
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-blue-600">Rs {product.standardPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Standard Price</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Use ↑↓ arrow keys to navigate, Enter to select (multiple Enter adds quantity), Esc to close
        </div>
      </div>
    </div>
  )
}

// Main Enhanced POS Component with Performance Optimizations
const EnhancedBillingPOSSystem = () => {
  const navigate = useNavigate()
  // State management with performance optimizations
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [selectedPriceType, setSelectedPriceType] = useState("standard")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showPayment, setShowPayment] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState(["All"])
  const [invoices, setInvoices] = useState([])
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [tabNumberBuffer, setTabNumberBuffer] = useState("")
  const tabNumberTimeoutRef = useRef(null)
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [focusedElement, setFocusedElement] = useState(null)
  const focusableElementsRef = useRef([])

  // Enhanced state for better performance
  const [activeMainTab, setActiveMainTab] = useState("pos")
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("")
  const [invoiceDateRange, setInvoiceDateRange] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [showCustomSearchModal, setShowCustomSearchModal] = useState(false)
  const [searchModalTerm, setSearchModalTerm] = useState("")
  const [searchModalSelectedIndex, setSearchModalSelectedIndex] = useState(0)

  // Multi-tab functionality with optimizations
  const [tabs, setTabs] = useState([{ id: 1, number: 1 }])
  const [activeTab, setActiveTab] = useState(1)
  const [tabData, setTabData] = useState({
    1: {
      cart: [],
      selectedCustomer: null,
      discount: { type: "amount", value: 0 },
      taxRate: 0,
    },
  })
  const [heldBills, setHeldBills] = useState([])
  const [showPrintSelection, setShowPrintSelection] = useState(false)
  const [pendingInvoice, setPendingInvoice] = useState(null)

  // Performance state
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "",
    isVisible: false,
  })

  // Keyboard shortcuts state
  const [ctrlFPressCount, setCtrlFPressCount] = useState(0)
  const ctrlFTimeoutRef = useRef(null)

  const barcodeRef = useRef(null)
  const searchInputRef = useRef(null)

  // Get current tab data with memoization
  const currentTabData = useMemo(() => {
    return (
      tabData[activeTab] || {
        cart: [],
        selectedCustomer: null,
        discount: { type: "amount", value: 0 },
        taxRate: 0,
      }
    )
  }, [tabData, activeTab])

  const cart = currentTabData.cart
  const currentSelectedCustomer = currentTabData.selectedCustomer
  const currentDiscount = currentTabData.discount
  const currentTaxRate = currentTabData.taxRate

  // Function to handle tab number input with improved timing
  const handleTabNumberInput = (number, isAlt = false) => {
    const now = Date.now()
    const timeSinceLastPress = now - lastKeyPressTime
    setLastKeyPressTime(now)

    setTabNumberBuffer(prev => {
      // Clear buffer if more than 500ms since last press
      if (timeSinceLastPress > 500) {
        return number
      }

      const newBuffer = prev + number
      const tabNum = parseInt(newBuffer)
      
      // Calculate target tab number based on Alt key
      let targetTabNum
      if (isAlt) {
        // For Alt combinations, multiply first digit by 10 and add second digit
        if (newBuffer.length === 1) {
          targetTabNum = parseInt(newBuffer) * 10
        } else {
          targetTabNum = parseInt(newBuffer[0]) * 10 + parseInt(newBuffer[1])
        }
      } else {
        targetTabNum = tabNum
      }

      // Find matching tab
      const matchingTab = tabs.find(t => t.number === targetTabNum)
      
      if (matchingTab) {
        setActiveTab(matchingTab.id)
        showToast(`Switched to tab ${String(targetTabNum).padStart(2, "0")}`, "info")
        return "" // Clear buffer after successful switch
      }
      
      return newBuffer
    })
  }

  // Function to handle element focus navigation
  const handleElementFocus = (direction) => {
    if (!focusableElementsRef.current.length) return

    const currentIndex = focusableElementsRef.current.indexOf(focusedElement)
    let newIndex

    switch (direction) {
      case 'up':
        newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElementsRef.current.length - 1
        break
      case 'down':
        newIndex = currentIndex < focusableElementsRef.current.length - 1 ? currentIndex + 1 : 0
        break
      case 'left':
        newIndex = currentIndex > 0 ? currentIndex - 1 : focusableElementsRef.current.length - 1
        break
      case 'right':
        newIndex = currentIndex < focusableElementsRef.current.length - 1 ? currentIndex + 1 : 0
        break
      default:
        return
    }

    const newElement = focusableElementsRef.current[newIndex]
    if (newElement) {
      newElement.focus()
      setFocusedElement(newElement)
    }
  }

  // Update focusable elements when tab changes
  useEffect(() => {
    const updateFocusableElements = () => {
      const currentTab = document.querySelector('.tab.active')
      if (currentTab) {
        focusableElementsRef.current = Array.from(
          currentTab.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
        )
      }
    }

    updateFocusableElements()
  }, [activeTab])

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Handle Escape key for all modals
      if (e.key === "Escape") {
        e.preventDefault()
        if (showCustomSearchModal) setShowCustomSearchModal(false)
        else if (showKeyboardShortcuts) setShowKeyboardShortcuts(false)
        else if (showPayment) setShowPayment(false)
        else if (showInvoice) setShowInvoice(false)
        else if (showCustomerModal) setShowCustomerModal(false)
        else if (showProductsModal) setShowProductsModal(false)
        else if (showPrintSelection) setShowPrintSelection(false)
        else if (showInvoiceDetails) setShowInvoiceDetails(false)
        else if (cart.length > 0) handleClearCart()
        return false
      }

      // Handle Alt key state
      if (e.key === "Alt") {
        setIsAltPressed(e.type === "keydown")
        return
      }

      // Handle Ctrl+Number for tab switching
      if (e.ctrlKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault()
        handleTabNumberInput(e.key, isAltPressed)
        return false
      }

      // Handle Shift+Arrow for tab navigation
      if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault()
        const currentTabIndex = tabs.findIndex(t => t.id === activeTab)
        let newTabIndex

        if (e.key === "ArrowLeft") {
          newTabIndex = currentTabIndex > 0 ? currentTabIndex - 1 : tabs.length - 1
        } else {
          newTabIndex = currentTabIndex < tabs.length - 1 ? currentTabIndex + 1 : 0
        }

        const newTab = tabs[newTabIndex]
        setActiveTab(newTab.id)
        showToast(`Switched to tab ${String(newTab.number).padStart(2, "0")}`, "info")
        return false
      }

      // Handle Arrow keys for element focus
      if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight":
            e.preventDefault()
            handleElementFocus(e.key.replace("Arrow", "").toLowerCase())
            return false
        }
      }

      // Handle other Shift-based shortcuts
      if (e.shiftKey) {
        const key = e.key.toLowerCase()
        
        switch (key) {
          case "enter":
            e.preventDefault()
            setShowKeyboardShortcuts(true)
            return false
          case "n":
            e.preventDefault()
            handleAddTab()
            return false
          case "h":
            e.preventDefault()
            if (showKeyboardShortcuts) {
              setShowKeyboardShortcuts(false)
            } else {
              handleHoldBill(activeTab)
            }
            return false
          case "u":
            e.preventDefault()
            handleUnholdBill(activeTab)
            return false
          case "f":
            e.preventDefault()
            e.stopPropagation()
            setCtrlFPressCount((prev) => prev + 1)

            if (ctrlFTimeoutRef.current) {
              clearTimeout(ctrlFTimeoutRef.current)
            }

            ctrlFTimeoutRef.current = setTimeout(() => {
              if (ctrlFPressCount >= 1) {
                setShowProductsModal(true)
                setCtrlFPressCount(0)
              } else {
                setShowCustomSearchModal(true)
                setSearchModalTerm("")
                setSearchModalSelectedIndex(0)
                setTimeout(() => {
                  searchInputRef.current?.focus()
                }, 100)
              }
              setCtrlFPressCount(0)
            }, 300)

            return false
          case "k":
            e.preventDefault()
            e.stopPropagation()
            setShowCustomerModal(true)
            return false
          case "b":
            e.preventDefault()
            e.stopPropagation()
            barcodeRef.current?.focus()
            return false
          case "m":
            e.preventDefault()
            e.stopPropagation()
            if (cart.length > 0) setShowPayment(true)
            return false
          case "c":
            e.preventDefault()
            e.stopPropagation()
            handleClearCart()
            return false
          case "p":
            e.preventDefault()
            e.stopPropagation()
            setShowProductsModal(true)
            return false
          case "d":
            e.preventDefault()
            e.stopPropagation()
            setSelectedPriceType((prev) =>
              prev === "standard" ? "wholesale" : prev === "wholesale" ? "retail" : "standard",
            )
            return false
          case "i":
            e.preventDefault()
            e.stopPropagation()
            setActiveMainTab("invoices")
            return false
          case "j":
            e.preventDefault()
            e.stopPropagation()
            setActiveMainTab("pos")
            return false
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress, true)
    window.addEventListener("keyup", handleKeyPress, true)
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress, true)
      window.removeEventListener("keyup", handleKeyPress, true)
      if (tabNumberTimeoutRef.current) {
        clearTimeout(tabNumberTimeoutRef.current)
      }
    }
  }, [
    showCustomSearchModal,
    showKeyboardShortcuts,
    showPayment,
    showInvoice,
    showProductsModal,
    showCustomerModal,
    cart.length,
    activeTab,
    selectedProductIndex,
    ctrlFPressCount,
    tabs,
    isAltPressed,
  ])

  // Fast tab management functions
  const handleAddTab = useCallback(() => {
    const newTabNumber = Math.max(...tabs.map((t) => t.number)) + 1
    const newTabId = Date.now()
    setTabs((prev) => [...prev, { id: newTabId, number: newTabNumber }])
    setTabData((prev) => ({
      ...prev,
      [newTabId]: {
        cart: [],
        selectedCustomer: null,
        discount: { type: "amount", value: 0 },
        taxRate: 0,
      },
    }))
    setActiveTab(newTabId)
    showToast(`New tab ${String(newTabNumber).padStart(2, "0")} created`, "success")
  }, [tabs])

  const handleTabChange = useCallback(
    (tabId) => {
      setActiveTab(tabId)
      const tab = tabs.find((t) => t.id === tabId)
      if (tab) {
        showToast(`Switched to tab ${String(tab.number).padStart(2, "0")}`, "info")
      }
    },
    [tabs],
  )

  const handleHoldBill = useCallback(
    (tabId) => {
      const currentData = tabData[tabId]
      if (currentData && currentData.cart.length > 0) {
        const holdData = {
          tabId,
          ...currentData,
          heldAt: new Date(),
        }

        setHeldBills((prev) => {
          const filtered = prev.filter((h) => h.tabId !== tabId)
          return [...filtered, holdData]
        })

        setTabData((prev) => ({
          ...prev,
          [tabId]: {
            cart: [],
            selectedCustomer: null,
            discount: { type: "amount", value: 0 },
            taxRate: 0,
          },
        }))

        const tab = tabs.find((t) => t.id === tabId)
        showToast(`Bill held for tab ${String(tab?.number || "").padStart(2, "0")}`, "success")
      } else {
        showToast("No items to hold", "warning")
      }
    },
    [tabData, tabs],
  )

  const handleUnholdBill = useCallback(
    (tabId) => {
      const heldBill = heldBills.find((h) => h.tabId === tabId)
      if (heldBill) {
        setTabData((prev) => ({
          ...prev,
          [tabId]: {
            cart: heldBill.cart,
            selectedCustomer: heldBill.selectedCustomer,
            discount: heldBill.discount,
            taxRate: heldBill.taxRate,
          },
        }))

        setHeldBills((prev) => prev.filter((h) => h.tabId !== tabId))

        const tab = tabs.find((t) => t.id === tabId)
        showToast(`Bill restored for tab ${String(tab?.number || "").padStart(2, "0")}`, "success")
      } else {
        showToast("No held bill found for this tab", "warning")
      }
    },
    [heldBills, tabs],
  )

  // Fast update tab data function
  const updateTabData = useCallback((tabId, updates) => {
    setTabData((prev) => ({
      ...prev,
      [tabId]: {
        ...prev[tabId],
        ...updates,
      },
    }))
  }, [])

  // Optimized cart management
  const addToCart = useCallback(
    (product) => {
      const priceKey = `${selectedPriceType}Price`
      const price = product[priceKey]
      const currentCart = currentTabData.cart

      const existingItem = currentCart.find((item) => item.id === product.id)

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showToast(`Cannot add more than available stock (${product.stock})`, "error")
          return
        }
        const updatedCart = currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
        updateTabData(activeTab, { cart: updatedCart })
      } else {
        if (product.stock <= 0) {
          showToast("Product is out of stock", "error")
          return
        }
        const newItem = {
          id: product.id,
          name: product.name,
          price: price,
          originalPrice: price,
          quantity: 1,
          barcode: product.barcode,
          category: product.category,
          stock: product.stock,
          discountType: "none",
          discountValue: 0,
          discountedPrice: price,
        }
        updateTabData(activeTab, { cart: [...currentCart, newItem] })
      }
      showToast(`${product.name} added to cart`, "success")
    },
    [selectedPriceType, currentTabData.cart, activeTab, updateTabData],
  )

  const handleQuantityAdd = useCallback(
    (productId) => {
      const currentCart = currentTabData.cart
      const existingItem = currentCart.find((item) => item.id === productId)

      if (existingItem) {
        if (existingItem.quantity >= existingItem.stock) {
          showToast(`Cannot add more than available stock (${existingItem.stock})`, "error")
          return
        }
        const updatedCart = currentCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
        updateTabData(activeTab, { cart: updatedCart })
        showToast(`Quantity increased for ${existingItem.name}`, "success")
      }
    },
    [currentTabData.cart, activeTab, updateTabData],
  )

  const updateQuantity = useCallback(
    (id, newQuantity) => {
      const currentCart = currentTabData.cart
      const cartItem = currentCart.find((item) => item.id === id)
      if (!cartItem) return

      if (newQuantity > cartItem.stock) {
        showToast(`Cannot set quantity more than available stock (${cartItem.stock})`, "error")
        return
      }

      if (newQuantity <= 0) {
        removeFromCart(id)
      } else {
        const updatedCart = currentCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
        updateTabData(activeTab, { cart: updatedCart })
      }
    },
    [currentTabData.cart, activeTab, updateTabData],
  )

  const removeFromCart = useCallback(
    (id) => {
      const currentCart = currentTabData.cart
      const updatedCart = currentCart.filter((item) => item.id !== id)
      updateTabData(activeTab, { cart: updatedCart })
      showToast("Item removed from cart", "info")
    },
    [currentTabData.cart, activeTab, updateTabData],
  )

  const handleClearCart = useCallback(() => {
    updateTabData(activeTab, {
      cart: [],
      selectedCustomer: null,
      discount: { type: "amount", value: 0 },
      taxRate: 0,
    })
    showToast("Cart cleared", "info")
  }, [activeTab, updateTabData])

  const updateItemDiscount = useCallback(
    (itemId, discountType, discountValue, discountedPrice) => {
      const currentCart = currentTabData.cart
      const updatedCart = currentCart.map((item) =>
        item.id === itemId
          ? {
            ...item,
            discountType,
            discountValue,
            discountedPrice,
          }
          : item,
      )
      updateTabData(activeTab, { cart: updatedCart })
      showToast("Discount applied successfully", "success")
    },
    [currentTabData.cart, activeTab, updateTabData],
  )

  // Enhanced print functionality
  const handlePrintSelection = useCallback((format, invoice) => {
    const printClass = format === "pos" ? "pos-invoice" : "a4-invoice"
    const printContent = document.getElementById("printable-invoice")

    if (printContent) {
      printContent.className = printClass
      setTimeout(() => {
        window.print()
      }, 100)
    }
  }, [])

  // Optimized filtered products with memoization
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  // Optimized calculations with memoization
  const calculatedSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const finalPrice = item.discountedPrice || item.price
        return sum + finalPrice * item.quantity
      }, 0),
    [cart],
  )

  const discountAmount = useMemo(() => {
    return currentDiscount.type === "percentage"
      ? (calculatedSubtotal * currentDiscount.value) / 100
      : currentDiscount.value
  }, [currentDiscount, calculatedSubtotal])

  const taxableAmount = useMemo(() => calculatedSubtotal - discountAmount, [calculatedSubtotal, discountAmount])
  const taxAmount = useMemo(() => taxableAmount * (currentTaxRate / 100), [taxableAmount, currentTaxRate])
  const grandTotal = useMemo(() => taxableAmount + taxAmount, [taxableAmount, taxAmount])

  // Fast toast notification
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, isVisible: true })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }, [])

  // Fast barcode scan
  const handleBarcodeScan = useCallback(
    (e) => {
      if (e.key === "Enter" && barcodeInput.trim()) {
        const product = products.find((p) => p.barcode === barcodeInput.trim())
        if (product) {
          addToCart(product)
          showToast(`Product found: ${product.name}`, "success")
          setBarcodeInput("")
        } else {
          showToast("Product not found", "error")
          setBarcodeInput("")
        }
      }
    },
    [barcodeInput, products, addToCart, showToast],
  )

  // Enhanced completePayment function
  const completePayment = useCallback(
    async (paymentData) => {
      setIsProcessing(true)
      try {
        const invoice = {
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.discountedPrice || item.price,
            originalPrice: item.price,
            discountedPrice: item.discountedPrice || item.price,
            category: item.category,
            barcode: item.barcode,
          })),
          customer: currentSelectedCustomer
            ? { id: currentSelectedCustomer.id, name: currentSelectedCustomer.name }
            : null,
          subtotal: calculatedSubtotal,
          discountAmount: discountAmount,
          taxAmount,
          total: grandTotal,
          paymentMethod: paymentData.method,
          paymentStatus: "Paid",
          date: new Date(),
          createdAt: new Date().toISOString(),
          payments: paymentData.payments || [],
        }

        // Save to backend if needed
        try {
          const response = await fetch(`${backEndURL}/api/invoices`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoice),
          })

          if (response.ok) {
            const savedInvoice = await response.json()
            invoice.id = savedInvoice.id
          }
        } catch (error) {
          console.error("Error saving invoice:", error)
          invoice.id = `INV-${Date.now()}`
        }

        setPendingInvoice(invoice)
        setShowPrintSelection(true)
        setShowPayment(false)
        handleClearCart()
        showToast("Payment completed successfully!", "success")
      } catch (error) {
        console.error("Error completing payment:", error)
        showToast("Failed to complete payment", "error")
      } finally {
        setIsProcessing(false)
      }
    },
    [
      cart,
      currentSelectedCustomer,
      calculatedSubtotal,
      discountAmount,
      taxAmount,
      grandTotal,
      handleClearCart,
      showToast,
    ],
  )

  // Fast fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch(`${backEndURL}/api/invoices`)
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      showToast("Failed to load invoices", "error")
    }
  }, [showToast])

  // Fast invoice fetch on tab switch
  useEffect(() => {
    if (activeMainTab === "invoices") {
      fetchInvoices()
    }
  }, [activeMainTab, fetchInvoices])

  // Optimized data fetching with caching
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check if we have cached data
      const cachedData = sessionStorage.getItem('invoiceData')
      const cacheTimestamp = sessionStorage.getItem('invoiceDataTimestamp')
      const now = Date.now()
      
      // Use cached data if it's less than 5 minutes old
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
        const { products: cachedProducts, customers: cachedCustomers, categories: cachedCategories } = JSON.parse(cachedData)
        setProducts(cachedProducts)
        setCustomers(cachedCustomers)
        setCategories(cachedCategories)
        setIsLoading(false)
        return
      }

      // Parallel fetch for better performance
      const [productsResponse, inventoryResponse, customersResponse] = await Promise.all([
        fetch(`${backEndURL}/api/products`),
        fetch(`${backEndURL}/api/inventory`),
        fetch(`${backEndURL}/api/contacts`),
      ])

      const [productsData, inventoryData, contactsData] = await Promise.all([
        productsResponse.json(),
        inventoryResponse.json(),
        customersResponse.json(),
      ])

      // Combine products with inventory data
      const combinedProducts = productsData.map((product) => {
        const inventory = inventoryData.find((inv) => inv.productId === product.id)
        return {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          stock: inventory ? inventory.totalQuantity : 0,
          standardPrice: product.salesPrice,
          wholesalePrice: product.marginPrice,
          retailPrice: product.retailPrice,
          cost: product.costPrice,
          description: product.description,
          image: product.imageUrl,
        }
      })

      // Filter customers
      const customerContacts = contactsData.filter((c) => c.categoryType === "Customer")
      
      // Set categories
      const uniqueCategories = Array.from(new Set(productsData.map((p) => p.category).filter(Boolean)))
      const categories = ["All", ...uniqueCategories]

      // Cache the data
      const dataToCache = {
        products: combinedProducts,
        customers: customerContacts,
        categories: categories
      }
      sessionStorage.setItem('invoiceData', JSON.stringify(dataToCache))
      sessionStorage.setItem('invoiceDataTimestamp', now.toString())

      setProducts(combinedProducts)
      setCustomers(customerContacts)
      setCategories(categories)
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Failed to load data", "error")
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Inject enhanced styles
  useEffect(() => {
    let styleTag = document.getElementById("enhanced-pos-styles")
    if (!styleTag) {
      styleTag = document.createElement("style")
      styleTag.id = "enhanced-pos-styles"
      styleTag.innerHTML = printStyles
      document.head.appendChild(styleTag)
    }
  }, [])

  // Add keyboard navigation effect
  useEffect(() => {
    const handleProductNavigation = (e) => {
      if (showCustomSearchModal || showProductsModal) return

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev < filteredProducts.length - 1 ? prev + 1 : prev
          )
          break
        case "ArrowLeft":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev > 0 ? prev - 1 : prev
          )
          break
        case "ArrowDown":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev < filteredProducts.length - 2 ? prev + 2 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev > 1 ? prev - 2 : prev
          )
          break
        case "Enter":
          e.preventDefault()
          if (filteredProducts[selectedProductIndex]) {
            addToCart(filteredProducts[selectedProductIndex])
          }
          break
      }
    }

    window.addEventListener("keydown", handleProductNavigation)
    return () => window.removeEventListener("keydown", handleProductNavigation)
  }, [filteredProducts, selectedProductIndex, showCustomSearchModal, showProductsModal, addToCart])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <Dotspinner />
          <p className="mt-4 text-white text-lg">Loading Invoice System...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Close button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors duration-200"
          title="Close and return to dashboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      {/* Optimized Toast Notification */}
      <OptimizedToast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />

      {/* Keyboard Shortcuts Help */}
      <button
        onClick={() => setShowKeyboardShortcuts(true)}
        className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105"
        title="Keyboard Shortcuts (Shift+Enter)"
      >
        ⌨️
      </button>

      {/* Enhanced Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Tab Management</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Switch to Tab 1-9:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + 1-9</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Switch to Tab 10-19:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + Alt + 1-9</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Switch to Tab 20:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl + Alt + 0</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Tab:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + →</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Tab:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + ←</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>New Tab:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Hold Bill:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + H</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Unhold Bill:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + U</kbd>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Navigation & Actions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Search Products:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Show All Products:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + F + F</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Select Customer:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + K</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Checkout:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + M</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Clear Cart:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + C</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Switch Price Type:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Show Products:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + P</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Close Modal/Clear Cart:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {activeMainTab === "pos" && (
          <FastTabComponent
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddTab={handleAddTab}
            heldBills={heldBills}
            onHoldBill={handleHoldBill}
            onUnholdBill={handleUnholdBill}
          />
        )}

        {/* Main Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveMainTab("pos")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-150 ${activeMainTab === "pos"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
          >
            🏪 POS System
          </button>
          <button
            onClick={() => setActiveMainTab("invoices")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-150 ${activeMainTab === "invoices"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
          >
            📄 Invoices
          </button>
        </div>

        {activeMainTab === "pos" ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Left: Products Section */}
            <div className="flex-1 bg-white rounded-lg p-6 card-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">🛍️ Products</h2>
                <button
                  onClick={() => setShowProductsModal(true)}
                  className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  📦 All Products
                </button>
              </div>

              {/* Enhanced Barcode Scanner */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">📱 Barcode Scanner</label>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeScan}
                  placeholder="Scan or enter barcode..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Enhanced Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={() => {
                    setShowCustomSearchModal(true)
                    setSearchModalTerm(searchTerm)
                    setSearchModalSelectedIndex(0)
                  }}
                  placeholder="🔍 Search products... (Ctrl+F, Ctrl+F+F for all products)"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriceType}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">💰 Standard</option>
                  <option value="wholesale">📦 Wholesale</option>
                  <option value="retail">🏪 Retail</option>
                </select>
              </div>

              {/* Enhanced Product Grid */}
              <div className="optimized-grid virtual-scroll">
                {filteredProducts.map((product) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    selectedPriceType={selectedPriceType}
                  />
                ))}
              </div>
            </div>

            {/* Enhanced Right: Shopping Cart Section */}
            <div className="flex-1 bg-white rounded-lg p-6 card-shadow flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">🛒 Cart ({cart.length} items)</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomerModal(true)}
                    className="btn-primary px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    👤 {currentSelectedCustomer ? "Change" : "Select"} Customer
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="btn-danger px-3 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>

              {/* Customer Display */}
              {currentSelectedCustomer && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900">👤 {currentSelectedCustomer.name}</div>
                  {currentSelectedCustomer.company && (
                    <div className="text-sm text-blue-700">🏢 {currentSelectedCustomer.company}</div>
                  )}
                  <div className="text-sm text-blue-600">
                    {currentSelectedCustomer.phone && `📞 ${currentSelectedCustomer.phone}`}
                    {currentSelectedCustomer.email && ` ✉️ ${currentSelectedCustomer.email}`}
                  </div>
                </div>
              )}

              {/* Enhanced Cart Items */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-2 virtual-scroll">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>Your cart is empty</div>
                    <div className="text-sm">Add products to get started</div>
                  </div>
                ) : (
                  cart.map((item) => (
                    <EnhancedCartItemWithDiscount
                      key={item.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                      updateItemDiscount={updateItemDiscount}
                    />
                  ))
                )}
              </div>

              {/* Enhanced Cart Summary */}
              {cart.length > 0 && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  {/* Tax and Discount Controls */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">💰 Tax & Discount</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tax Rate (%)</label>
                        <input
                          type="number"
                          value={currentTaxRate}
                          onChange={(e) => updateTabData(activeTab, { taxRate: Number(e.target.value) })}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Discount</label>
                        <div className="flex gap-1">
                          <select
                            value={currentDiscount.type}
                            onChange={(e) =>
                              updateTabData(activeTab, {
                                discount: { ...currentDiscount, type: e.target.value },
                              })
                            }
                            className="w-1/3 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="amount">$</option>
                            <option value="percentage">%</option>
                          </select>
                          <input
                            type="number"
                            value={currentDiscount.value}
                            onChange={(e) =>
                              updateTabData(activeTab, {
                                discount: { ...currentDiscount, value: Number(e.target.value) },
                              })
                            }
                            min="0"
                            step="0.01"
                            className="w-2/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span className="font-medium">Rs {calculatedSubtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Discount:</span>
                        <span>-Rs {discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>Tax ({currentTaxRate}%):</span>
                      <span className="font-medium">Rs {taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg text-blue-600 border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>Rs {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => setShowPayment(true)}
                    disabled={isProcessing}
                    className="w-full btn-success py-4 px-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {isProcessing ? <FastSpinner /> : `💳 Complete Payment - Rs ${grandTotal.toFixed(2)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <InvoicesPage
            invoices={invoices}
            searchTerm={invoiceSearchTerm}
            setSearchTerm={setInvoiceSearchTerm}
            dateRange={invoiceDateRange}
            setDateRange={setInvoiceDateRange}
            onInvoiceSelect={(invoice) => {
              setSelectedInvoice(invoice)
              setShowInvoiceDetails(true)
            }}
          />
        )}
      </div>

      {/* Custom Search Modal */}
      <CustomSearchModal
        isOpen={showCustomSearchModal}
        onClose={() => setShowCustomSearchModal(false)}
        products={products}
        searchTerm={searchModalTerm}
        setSearchTerm={setSearchModalTerm}
        selectedIndex={searchModalSelectedIndex}
        setSelectedIndex={setSearchModalSelectedIndex}
        onProductSelect={addToCart}
        onQuantityAdd={handleQuantityAdd}
      />

      {/* Enhanced Payment Modal */}
      {showPayment && (
        <EnhancedPaymentModal
          grandTotal={grandTotal}
          subtotal={calculatedSubtotal}
          taxRate={currentTaxRate}
          discount={currentDiscount}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={completePayment}
        />
      )}

      {/* Enhanced Print Selection Modal */}
      {showPrintSelection && pendingInvoice && (
        <EnhancedPrintSelectionModal
          onClose={() => setShowPrintSelection(false)}
          onPrintSelection={handlePrintSelection}
          invoice={pendingInvoice}
        />
      )}

      {/* Enhanced Invoice Modal */}
      {showInvoice && currentInvoice && (
        <EnhancedInvoiceModal
          invoice={currentInvoice}
          onClose={() => {
            setShowInvoice(false)
            setCurrentInvoice(null)
          }}
          onPrintSelection={handlePrintSelection}
        />
      )}

      {/* Enhanced Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <EnhancedInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceDetails(false)
            setSelectedInvoice(null)
          }}
          onPrintSelection={handlePrintSelection}
        />
      )}

      {/* Enhanced Products Modal */}
      {showProductsModal && (
        <EnhancedProductsModal
          products={products}
          categories={categories}
          selectedPriceType={selectedPriceType}
          onAddToCart={addToCart}
          onClose={() => setShowProductsModal(false)}
        />
      )}

      {/* Enhanced Customer Modal */}
      {showCustomerModal && (
        <EnhancedCustomerModal
          customers={customers}
          selectedCustomer={currentSelectedCustomer}
          setSelectedCustomer={(customer) => updateTabData(activeTab, { selectedCustomer: customer })}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </div>
  )
}

// Enhanced Product Card Component
const EnhancedProductCard = ({ product, onAddToCart, selectedPriceType }) => {
  const priceKey = `${selectedPriceType}Price`
  const currentPrice = product[priceKey] || 0
  const isLowStock = product.stock <= 5

  return (
    <div
      className={`product-card border rounded-lg p-4 transition-all duration-150 hover:shadow-md cursor-pointer ${isLowStock ? "product-selected" : "border-gray-200 hover:border-blue-300"}`}
      style={{
        backgroundImage: product.image ? `url(${product.image})` : "none",
      }}
      onClick={() => onAddToCart(product)}
    >
      <div className="product-card-content space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 text-sm leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              📦 {product.stock}
            </span>
            {isLowStock && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">⚠️ Low</span>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <div>🏷️ {product.category}</div>
          <div>📊 SKU: {product.barcode}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-blue-600">Rs {currentPrice.toFixed(2)}</div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            disabled={product.stock === 0}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${product.stock === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "btn-primary hover:scale-105"}`}
          >
            {product.stock === 0 ? "❌ Out of Stock" : "➕ Add"}
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Cart Item Component with Discount
const EnhancedCartItemWithDiscount = ({ item, updateQuantity, removeFromCart, updateItemDiscount }) => {
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [discountType, setDiscountType] = useState(item.discountType || "none")
  const [discountValue, setDiscountValue] = useState(item.discountValue || 0)

  const calculateDiscountedPrice = useCallback(() => {
    if (discountType === "percentage") {
      return item.originalPrice * (1 - discountValue / 100)
    } else if (discountType === "amount") {
      return Math.max(0, item.originalPrice - discountValue)
    }
    return item.originalPrice
  }, [discountType, discountValue, item.originalPrice])

  const discountedPrice = calculateDiscountedPrice()
  const totalSavings = (item.originalPrice - discountedPrice) * item.quantity

  const handleApplyDiscount = useCallback(() => {
    updateItemDiscount(item.id, discountType, discountValue, discountedPrice)
    setShowDiscountModal(false)
  }, [item.id, discountType, discountValue, discountedPrice, updateItemDiscount])

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
            <div className="text-xs text-gray-500">
              🏷️ {item.category} • 📊 {item.barcode}
            </div>
            {item.discountType !== "none" && totalSavings > 0 && (
              <div className="text-xs text-green-600 font-medium mt-1">💰 Saved: Rs {totalSavings.toFixed(2)}</div>
            )}
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded"
            title="Remove item"
          >
            🗑️
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium"
            >
              ➖
            </button>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
              className="w-16 text-center text-sm border border-gray-300 rounded-lg py-1"
              min="0"
              max={item.stock}
            />
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-8 h-8 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-full flex items-center justify-center text-sm font-medium"
            >
              ➕
            </button>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2">
              {item.discountType !== "none" && (
                <div className="text-xs text-gray-400 line-through">
                  Rs {(item.originalPrice * item.quantity).toFixed(2)}
                </div>
              )}
              <div className="font-medium text-gray-800">Rs {(discountedPrice * item.quantity).toFixed(2)}</div>
            </div>
            <div className="text-xs text-gray-500">
              {item.quantity} × Rs {discountedPrice.toFixed(2)}
              {item.discountType !== "none" && (
                <span className="text-green-600 ml-1">(was Rs {item.originalPrice.toFixed(2)})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowDiscountModal(true)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${item.discountType !== "none"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {item.discountType !== "none" ? "🏷️ Edit Discount" : "➕ Add Discount"}
          </button>
          {item.discountType !== "none" && (
            <div className="text-xs text-green-600 font-medium">
              {discountType === "percentage" ? `${discountValue}% OFF` : `Rs ${discountValue} OFF`}
            </div>
          )}
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md card-shadow fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">🏷️ Apply Discount</h3>
              <button onClick={() => setShowDiscountModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">Original Price: Rs {item.originalPrice.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value)
                    setDiscountValue(0)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">No Discount</option>
                  <option value="percentage">Percentage Discount</option>
                  <option value="amount">Fixed Amount Discount</option>
                </select>
              </div>

              {discountType !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value {discountType === "percentage" ? "(%)" : "(Rs)"}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    min="0"
                    max={discountType === "percentage" ? "100" : item.originalPrice}
                    step={discountType === "percentage" ? "1" : "0.01"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={discountType === "percentage" ? "Enter percentage" : "Enter amount"}
                  />
                </div>
              )}

              {discountType !== "none" && discountValue > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Original Price:</span>
                      <span>Rs {item.originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-Rs {(item.originalPrice - calculateDiscountedPrice()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-blue-600 border-t border-blue-200 pt-1 mt-1">
                      <span>Final Price:</span>
                      <span>Rs {calculateDiscountedPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleApplyDiscount} className="flex-1 btn-success px-4 py-2 rounded-lg font-medium">
                Apply Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Enhanced Payment Modal Component
const EnhancedPaymentModal = ({ grandTotal, subtotal, taxRate, discount, onClose, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [cashAmount, setCashAmount] = useState("")
  const [cardAmount, setCardAmount] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardPreference, setCardPreference] = useState("")
  const [selectedInput, setSelectedInput] = useState("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "", isVisible: false })
  const [lastKeyPressTime, setLastKeyPressTime] = useState(0)

  // Convert discount to number and handle null/undefined
  const discountAmount = Number(discount || 0)

  // Quick cash amounts based on total
  const quickCashAmounts = useMemo(() => {
    const total = Number(grandTotal)
    return [
      Math.ceil(total / 100) * 100, // Round up to nearest 100
      Math.ceil(total / 500) * 500, // Round up to nearest 500
      Math.ceil(total / 1000) * 1000, // Round up to nearest 1000
      Math.ceil(total / 2000) * 2000 // Round up to nearest 2000
    ]
  }, [grandTotal])

  // Set card amount to total when card is selected
  useEffect(() => {
    if (paymentMethod === "card") {
      setCardAmount(grandTotal.toString())
    }
  }, [paymentMethod, grandTotal])

  const showToast = (message, type) => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000)
  }

  // Handle arrow key navigation with debounce
  const handleKeyDown = (e) => {
    const now = Date.now()
    if (now - lastKeyPressTime < 300) return // Debounce key presses
    setLastKeyPressTime(now)

    if (e.key === "ArrowLeft") {
      e.preventDefault()
      setPaymentMethod("cash")
      setSelectedInput("cash")
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      setPaymentMethod("card")
      setSelectedInput("card")
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (paymentMethod === "cash") {
        setSelectedInput("cashAmount")
      } else if (paymentMethod === "card") {
        setSelectedInput("cardAmount")
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (selectedInput === "cashAmount" || selectedInput === "cardAmount") {
        setSelectedInput(paymentMethod)
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      handleCompletePayment()
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [paymentMethod, selectedInput, lastKeyPressTime])

  const handleQuickCashAmount = (amount) => {
    setCashAmount(amount.toString())
    setSelectedInput("cashAmount")
  }

  const handleCompletePayment = async () => {
    try {
      setIsProcessing(true)
      const totalAmount = parseFloat(cashAmount || 0) + parseFloat(cardAmount || 0)
      
      if (totalAmount < grandTotal) {
        showToast("Total payment amount is less than the grand total", "error")
        return
      }

      const paymentDetails = {
        method: paymentMethod,
        cashAmount: parseFloat(cashAmount || 0),
        cardAmount: parseFloat(cardAmount || 0),
        cardNumber: cardNumber.slice(-4),
        cardPreference,
        totalAmount,
        change: totalAmount - grandTotal
      }

      await onPaymentComplete(paymentDetails)
      onClose()
    } catch (error) {
      showToast("Payment processing failed", "error")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Processing</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <button
              className={`flex-1 p-3 rounded-lg border ${
                paymentMethod === "cash"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => {
                setPaymentMethod("cash")
                setSelectedInput("cash")
              }}
            >
              Cash
            </button>
            <button
              className={`flex-1 p-3 rounded-lg border ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300"
              }`}
              onClick={() => {
                setPaymentMethod("card")
                setSelectedInput("card")
              }}
            >
              Card
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>Rs {Number(subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%):</span>
              <span>Rs {(Number(subtotal) * (Number(taxRate) / 100)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span>Rs {discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>Rs {Number(grandTotal).toFixed(2)}</span>
            </div>
          </div>

          {paymentMethod === "cash" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cash Amount
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className={`w-full p-2 border rounded ${
                    selectedInput === "cashAmount" ? "border-blue-500" : "border-gray-300"
                  }`}
                  placeholder="Enter cash amount"
                  onFocus={() => setSelectedInput("cashAmount")}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickCashAmounts.map((amount, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickCashAmount(amount)}
                    className="p-2 text-sm border rounded hover:bg-gray-50"
                  >
                    Rs {amount.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number (Last 4 digits)
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full p-2 border rounded"
                  placeholder="Enter last 4 digits"
                  maxLength={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Amount
                </label>
                <input
                  type="number"
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                  className={`w-full p-2 border rounded ${
                    selectedInput === "cardAmount" ? "border-blue-500" : "border-gray-300"
                  }`}
                  placeholder="Enter card amount"
                  onFocus={() => setSelectedInput("cardAmount")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Preference
                </label>
                <input
                  type="text"
                  value={cardPreference}
                  onChange={(e) => setCardPreference(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter card preference"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCompletePayment}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Complete Payment"}
            </button>
          </div>
        </div>
      </div>
      <OptimizedToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}

// Enhanced Invoice Modal Component with Download Options
const EnhancedInvoiceModal = ({ invoice, onClose, onPrintSelection }) => {
  const [showPrintOptions, setShowPrintOptions] = useState(false)
  const [focusedButton, setFocusedButton] = useState('print')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.altKey && e.key === 'p') {
        handlePrintFormat('a4')
      } else if (e.altKey && e.key === 'r') {
        handlePrintFormat('pos')
      } else if (e.altKey && e.key === 'd') {
        handleDownload('a4')
      } else if (e.altKey && e.key === 's') {
        handleDownload('pos')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handlePrintClick = () => {
    setShowPrintOptions(true)
  }

  const handlePrintFormat = (format) => {
    onPrintSelection(format, invoice)
    setShowPrintOptions(false)
  }

  const handleDownload = (format) => {
    downloadInvoiceAsPDF(invoice, format)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto card-shadow fade-in">
        <div className="flex justify-between items-center mb-6 no-print">
          <h2 className="text-2xl font-bold text-gray-800">🧾 Invoice Details</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 rounded group relative"
          >
            ×
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Press Esc to close
            </span>
          </button>
        </div>

        {/* Print and Download Options */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg no-print">
          <h3 className="font-medium text-blue-800 mb-3">📄 Print & Download Options:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePrintFormat("a4")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 group relative"
            >
              🖨️ Print A4
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Press Alt + P
              </span>
            </button>
            <button
              onClick={() => handlePrintFormat("pos")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 group relative"
            >
              🖨️ Print Receipt
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Press Alt + R
              </span>
            </button>
            <button
              onClick={() => handleDownload("a4")}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 group relative"
            >
              📄 Download A4
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Press Alt + D
              </span>
            </button>
            <button
              onClick={() => handleDownload("pos")}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 group relative"
            >
              🧾 Download Receipt
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Press Alt + S
              </span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="printable-invoice" className="bg-white p-8 rounded-lg border border-gray-200">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-3">
                  R
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">R-tech Solution</h1>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>📍 262 Peradeniya road, Kandy</p>
                <p>📞 +94 11 123 4567</p>
                <p>✉️ support@srilankapos.com</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">INVOICE</h2>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Invoice #:</strong> {invoice.id}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {new Date(invoice.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {invoice.customer && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">👤 Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{invoice.customer.name}</p>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left py-3 px-4 font-semibold text-gray-800">Item</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-800">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">{item.quantity}</td>
                    <td className="text-right py-3 px-4 text-gray-700">Rs {item.price.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-medium text-gray-800">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-80 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs {invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-Rs {invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">Rs {invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 text-blue-600">
                  <span>Total:</span>
                  <span>Rs {invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
            <p>Thank you for your business! 🙏</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 no-print">
          <button
            onClick={handlePrintClick}
            className="flex-1 btn-primary px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onFocus={() => setFocusedButton('print')}
          >
            🖨️ Print Invoice
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            onFocus={() => setFocusedButton('close')}
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Products Modal Component
const EnhancedProductsModal = ({ products, categories, selectedPriceType, onAddToCart, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto card-shadow fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">📦 All Products</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search products..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="optimized-grid virtual-scroll">
          {filteredProducts.map((product) => (
            <EnhancedProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              selectedPriceType={selectedPriceType}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📦</div>
            <div>No products found</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Enhanced Customer Modal Component
const EnhancedCustomerModal = ({ customers, selectedCustomer, setSelectedCustomer, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm)),
    )
  }, [customers, searchTerm])

  const handleAddCustomer = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const response = await fetch(`${backEndURL}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, categoryType: "Customer" }),
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setSelectedCustomer(newCustomer)
        onClose()
      }
    } catch (error) {
      console.error("Error adding customer:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto card-shadow fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {showAddForm ? "➕ Add New Customer" : "👤 Select Customer"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {showAddForm ? (
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Customer Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company (Optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 btn-success px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? <FastSpinner /> : "✅ Add Customer"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search customers..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto virtual-scroll">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👤</div>
                  <div>No customers found</div>
                </div>
              ) : (
                filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-4 rounded-lg cursor-pointer border transition-all ${selectedCustomer && selectedCustomer.id === customer.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                      }`}
                    onClick={() => {
                      setSelectedCustomer(customer)
                      onClose()
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.email && `✉️ ${customer.email}`}
                          {customer.phone && ` 📞 ${customer.phone}`}
                        </div>
                        {customer.company && <div className="text-sm text-gray-500">🏢 {customer.company}</div>}
                      </div>
                      {selectedCustomer && selectedCustomer.id === customer.id && (
                        <span className="text-blue-500 font-bold text-xl">✓</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="w-full btn-primary px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              ➕ Add New Customer
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// Invoices Page Component
const InvoicesPage = ({ invoices, searchTerm, setSearchTerm, dateRange, setDateRange, onInvoiceSelect }) => {
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.customer && invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const invoiceDate = new Date(invoice.createdAt)
      const now = new Date()

      switch (dateRange) {
        case "today":
          return matchesSearch && invoiceDate.toDateString() === now.toDateString()
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          return matchesSearch && invoiceDate >= weekAgo
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          return matchesSearch && invoiceDate >= monthAgo
        default:
          return matchesSearch
      }
    })
  }, [invoices, searchTerm, dateRange])

  const totalAmount = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
    [filteredInvoices],
  )
  const totalCount = filteredInvoices.length

  const handleDownloadInvoice = (invoice, format) => {
    downloadInvoiceAsPDF(invoice, format)
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">Rs {totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 card-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Invoice</p>
              <p className="text-2xl font-bold text-gray-900">
                Rs {totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg p-6 card-shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔍 Search Invoices</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice number or customer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📅 Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List with Download Options */}
      <div className="bg-white rounded-lg card-shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📋 Invoice List</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => onInvoiceSelect(invoice)}>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">#{invoice.id.slice(-3)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">Invoice #{invoice.id}</p>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Paid
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">📅 {new Date(invoice.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">🕒 {new Date(invoice.createdAt).toLocaleTimeString()}</p>
                          {invoice.customer && <p className="text-sm text-gray-500">👤 {invoice.customer.name}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Rs {invoice.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{invoice.items.length} items</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadInvoice(invoice, "a4")
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1 text-sm"
                        title="Download A4 Invoice"
                      >
                        📄 A4
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadInvoice(invoice, "pos")
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1 text-sm"
                        title="Download Receipt"
                      >
                        🧾 Receipt
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => onInvoiceSelect(invoice)}>
                        <span className="text-xl">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default EnhancedBillingPOSSystem

