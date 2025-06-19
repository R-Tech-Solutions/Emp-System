import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { backEndURL } from "../Backendurl"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import DotSpinner from "../loaders/Loader"
import JsBarcode from "jsbarcode"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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
const printInvoice = (invoice, format = "a4") => {
  if (!invoice) {
    console.error('Invoice data is missing')
    return
  }

  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  // Generate and write the HTML content
  const htmlContent = generateInvoiceHTML(invoice, format);
  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.id || 'Unknown'}</title>
      <style>${printStyles}</style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);
  iframeDoc.close();

  // Print after a short delay to ensure content is loaded
  setTimeout(() => {
    iframe.contentWindow.print();
    // Remove the iframe after printing
    setTimeout(() => document.body.removeChild(iframe), 500);
  }, 250);
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

  // Create barcode SVG
  const barcodeContainer = document.createElement('div');
  const barcodeSvg = document.createElement('svg');
  barcodeContainer.appendChild(barcodeSvg);
  JsBarcode(barcodeSvg, invoice.id || 'Unknown', {
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 14,
    margin: 10
  });

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

  // Calculate discount percentage
  const discountPercentage = safeInvoice.subtotal > 0 
    ? ((safeInvoice.discountAmount / safeInvoice.subtotal) * 100).toFixed(2)
    : 0;

  return `
  <div class="a4-invoice professional-invoice" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.4; color: #1f2937; padding: 20px; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.05); max-width: 800px; margin: auto; border-radius: 10px;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; padding: 20px 30px; border-radius: 10px 10px 0 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
      <div>
        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
          <div style="width: 60px; height: 60px; background: white; color: #1e40af; font-size: 28px; font-weight: bold; display: flex; align-items: center; justify-content: center; border-radius: 10px;">R</div>
          <div>
            <h1 style="margin: 0; font-size: 26px;">R-tech Solution</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Point of Sale System</p>
          </div>
        </div>
        <div style="font-size: 12px; opacity: 0.9;">
          <p>📍 262 Peradeniya road, Kandy</p>
          <p>📞 +94 11 123 4567</p>
          <p>✉️ support@srilankapos.com</p>
        </div>
      </div>
      <div style="text-align: right; margin-top: 10px;">
        <h2 style="margin: 0; font-size: 32px;">INVOICE</h2>
        <div style="margin-top: 10px; background: rgba(255,255,255,0.2); padding: 12px; border-radius: 6px;">
          <p><strong>Invoice #:</strong> ${safeInvoice.id}</p>
          <p><strong>Date:</strong> ${new Date(safeInvoice.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(safeInvoice.date).toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Customer Info -->
  ${safeInvoice.customer ? `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 10px; color: #1e40af;">👤 BILL TO</h3>
      <div style="background: #f1f5f9; padding: 15px; border-left: 4px solid #1e40af; border-radius: 6px;">
        <p style="font-weight: 600; margin-bottom: 5px;">${safeInvoice.customer.name || 'N/A'}</p>
        ${safeInvoice.customer.company ? `<p>🏢 ${safeInvoice.customer.company}</p>` : ""}
        ${safeInvoice.customer.phone ? `<p>📞 ${safeInvoice.customer.phone}</p>` : ""}
        ${safeInvoice.customer.email ? `<p>✉️ ${safeInvoice.customer.email}</p>` : ""}
      </div>
    </div>` : ''}

  <!-- Items -->
  <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
    <h3 style="margin: 0 0 15px; color: #1e40af;">📋 ITEMS</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #1e40af; color: white;">
          <th style="text-align: left; padding: 12px;">DESCRIPTION</th>
          <th style="text-align: center; padding: 12px;">QTY</th>
          <th style="text-align: right; padding: 12px;">RATE</th>
          <th style="text-align: right; padding: 12px;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${safeInvoice.items.map((item, index) => `
          <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};">
            <td style="padding: 12px;">
              <div style="font-weight: 600;">${item.name || 'Unknown Item'}</div>
              <div style="font-size: 12px; color: #6b7280;">🏷️ ${item.category || 'N/A'} • SKU: ${item.barcode || 'N/A'}</div>
              ${item.identifier ? `<div style="font-size: 12px; color: #4b5563; margin-top: 5px;"><strong>${item.identifierType}:</strong> ${item.identifierValue}</div>` : ""}
            </td>
            <td style="text-align: center; font-weight: 500;">${item.quantity || 0}</td>
            <td style="text-align: right;">
              ${item.discountAmount > 0 ? `
                <div style="text-decoration: line-through; color: #9ca3af; font-size: 12px;">Rs ${(item.originalPrice || 0).toFixed(2)}</div>
                <div style="color: #dc2626; font-size: 12px;">-Rs ${(item.discountAmount || 0).toFixed(2)} (${((item.discountAmount / item.originalPrice) * 100).toFixed(2)}%)</div>
              ` : ""}
              <div>Rs ${(item.discountedPrice || 0).toFixed(2)}</div>
            </td>
            <td style="text-align: right; font-weight: 600;">Rs ${((item.discountedPrice || 0) * (item.quantity || 0)).toFixed(2)}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- Summary -->
  <div style="padding: 20px; display: flex; justify-content: flex-end;">
    <div style="width: 100%; max-width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #6b7280;">Subtotal:</span>
        <span>Rs ${safeInvoice.subtotal.toFixed(2)}</span>
      </div>
      ${safeInvoice.discountAmount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #dc2626;">
          <span>Discount (${discountPercentage}%):</span>
          <span>-Rs ${safeInvoice.discountAmount.toFixed(2)}</span>
        </div>` : ""}
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #6b7280;">Tax:</span>
        <span>Rs ${safeInvoice.taxAmount.toFixed(2)}</span>
      </div>
      <div style="border-top: 2px solid #1e40af; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 18px; color: #1e40af;">
        <div style="display: flex; justify-content: space-between;">
          <span>Total:</span>
          <span>Rs ${safeInvoice.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Info -->
  <div style="padding: 20px; border-top: 1px solid #e5e7eb;">
    <h3 style="color: #1e40af;">💳 PAYMENT INFORMATION</h3>
    <div style="background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; border-radius: 6px;">
      <p><strong>Payment Method:</strong> ${safeInvoice.paymentMethod}</p>
      <p><strong>Payment Status:</strong> ${safeInvoice.paymentStatus}</p>
      <p><strong>Amount Paid:</strong> Rs ${safeInvoice.total.toFixed(2)}</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 13px;">
    <p style="margin: 5px 0;"><strong>Thank you for your business! 🙏</strong></p>
    <p style="margin: 5px 0;">This is a computer-generated invoice and does not require a signature.</p>
    <p style="margin: 5px 0;">Powered by R-tech Solution POS System</p>
    <div style="margin-top: 15px;">${barcodeContainer.innerHTML}</div>
  </div>

</div>
  `
}




const generateThermalReceiptHTML = (invoice) => {
  if (!invoice) {
    console.error('Invoice data is missing')
    return '<div>Error: Invoice data is missing</div>'
  }

  // Create barcode SVG for thermal receipt
  const barcodeContainer = document.createElement('div');
  const barcodeSvg = document.createElement('svg');
  barcodeContainer.appendChild(barcodeSvg);
  JsBarcode(barcodeSvg, invoice.id || 'Unknown', {
    format: "CODE128",
    width: 1.5,
    height: 50,
    displayValue: true,
    fontSize: 10,
    margin: 5
  });

  // Calculate discount percentage
  const discountPercentage = invoice.subtotal > 0
    ? ((invoice.discountAmount / invoice.subtotal) * 100).toFixed(2)
    : 0;

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
            <p style="margin: 1px 0; font-size: 9px;">👤 ${invoice.customer.name}</p>
            ${invoice.customer.company ? `<p style="margin: 1px 0; font-size: 9px;">🏢 ${invoice.customer.company}</p>` : ''}
            ${invoice.customer.phone ? `<p style="margin: 1px 0; font-size: 9px;">📞 ${invoice.customer.phone}</p>` : ''}
            ${invoice.customer.email ? `<p style="margin: 1px 0; font-size: 9px;">✉️ ${invoice.customer.email}</p>` : ''}
          </div>
        `
      : ""
    }
      
      <div style="border-bottom: 1px dashed #333; margin: 8px 0;"></div>
      
      <div style="text-align: left; margin: 8px 0;">
        ${invoice.items
      .map(
        (item, index) => `
              <div style="margin-bottom: 6px;">
                <p style="margin: 1px 0; font-size: 9px; font-weight: bold;">${item.name}</p>
                ${item.identifier ? `
                  <p style="margin: 1px 0; font-size: 8px; color: #666;">
                    ${item.identifierType}: ${item.identifierValue}
                  </p>
                ` : ''}
                <div style="display: flex; justify-content: space-between; font-size: 9px;">
                  <span>${item.quantity} x 
                    ${item.discountAmount > 0 ? `
                      <span style="text-decoration: line-through;">Rs ${item.originalPrice.toFixed(2)}</span>
                      <span style="color: #dc2626;">-${item.discountAmount.toFixed(2)} (${((item.discountAmount / item.originalPrice) * 100).toFixed(2)}%)</span>
                      Rs ${item.discountedPrice.toFixed(2)}
                    ` : `Rs ${item.discountedPrice.toFixed(2)}`}
                  </span>
                  <span>Rs ${(item.discountedPrice * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            `
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
              <span>Discount (${discountPercentage}%):</span>
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
        <p style="margin: 2px 0;">Thank you for your businessNew!</p>
        <p style="margin: 2px 0;">Please come again</p>
        <p style="margin: 2px 0;">Powered by R-tech Solution</p>
        <!-- Barcode -->
        <div style="margin-top: 10px; text-align: center;">
          ${barcodeContainer.innerHTML}
        </div>
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
const FastTabComponent = ({ tabs, activeTab, onTabChange, onAddTab, heldBills, onHoldBill, onUnholdBill }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-gray-200">
        <div className="flex gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              title={`Switch to ${String(tab.number).padStart(2, "0")} (Ctrl+${tab.number})`}
            >
              {String(tab.number).padStart(2, "0")}
              {heldBills.includes(tab.id) && (
                <span className="ml-1 text-yellow-500">🔒</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

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

const EnhancedBillingPOSSystem = () => {
  const navigate = useNavigate()
  // State management with performance optimizations
  const [businessSettings, setBusinessSettings] = useState({ printingStyle: 'A4' }); // Default to A4
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch business settings
  useEffect(() => {
    const fetchBusinessSettings = async () => {
      try {
        const response = await fetch(`${backEndURL}/api/business-settings`);
        if (response.ok) {
          const { data } = await response.json();
          setBusinessSettings(data || { printingStyle: 'A4' });
        }
      } catch (error) {
        console.error('Error fetching business settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchBusinessSettings();
  }, []);

  const [barcodeInput, setBarcodeInput] = useState("")
  const [selectedPriceType, setSelectedPriceType] = useState("standard")
  const [selectedCategory, setSelectedCategory] = useState("All")
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
  const [showHoldBillModal, setShowHoldBillModal] = useState(false);

  // Enhanced state for better performance
  const [activeMainTab, setActiveMainTab] = useState("pos")
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("")
  const [invoiceDateRange, setInvoiceDateRange] = useState("all")
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [showCustomSearchModal, setShowCustomSearchModal] = useState(false)
  const [searchModalTerm, setSearchModalTerm] = useState("")
  const [searchModalSelectedIndex, setSearchModalSelectedIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for identifier selection
  const [showIdentifierModal, setShowIdentifierModal] = useState(false)
  const [selectedProductForIdentifier, setSelectedProductForIdentifier] = useState(null)
  const [availableIdentifiers, setAvailableIdentifiers] = useState([])
  const [isLoadingIdentifiers, setIsLoadingIdentifiers] = useState(false)
  const [selectedIdentifiers, setSelectedIdentifiers] = useState([])

  // Multi-tab functionality with optimizations
  const [tabs, setTabs] = useState([{ id: 1, number: 1 }])
  const [activeTab, setActiveTab] = useState(1)
  const [tabData, setTabData] = useState({
    1: {
      cart: [],
      selectedCustomer: null,
      discount: { type: "amount", value: 0 },
      taxRate: 0,
      showPayment: false,
      showCustomerModal: false,
      showProductsModal: false,
      showInvoice: false,
      showPrintSelection: false,
      showInvoiceDetails: false,
      showCustomSearchModal: false,
      showHoldBillModal: false,
    },
  })
  const [heldBills, setHeldBills] = useState([])
  const [pendingInvoice, setPendingInvoice] = useState(null)

  // Performance state
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [lastQuantityUpdate, setLastQuantityUpdate] = useState(Date.now())
  const searchInputRef = useRef(null)
  const productGridRef = useRef(null)

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

  // Get current tab data with memoization
  const currentTabData = useMemo(() => {
    return (
      tabData[activeTab] || {
        cart: [],
        selectedCustomer: null,
        discount: { type: "amount", value: 0 },
        taxRate: 0,
        showPayment: false,
        showCustomerModal: false,
        showProductsModal: false,
        showInvoice: false,
        showPrintSelection: false,
        showInvoiceDetails: false,
        showCustomSearchModal: false,
        showHoldBillModal: false,
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
        else if (currentTabData.showPayment) updateTabData(activeTab, { showPayment: false })
        else if (showInvoice) setShowInvoice(false)
        else if (showCustomerModal) setShowCustomerModal(false)
        else if (showProductsModal) setShowProductsModal(false)
        else if (currentTabData.showPrintSelection) updateTabData(activeTab, { showPrintSelection: false })
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
            if (cart.length > 0) updateTabData(activeTab, { showPayment: true })
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
          case "c":
            e.preventDefault();
            setShowCashOutModal(true);
            return false;
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress, true)

    return () => {
      window.removeEventListener("keydown", handleKeyPress, true)
      if (tabNumberTimeoutRef.current) {
        clearTimeout(tabNumberTimeoutRef.current)
      }
    }
  }, [
    showCustomSearchModal,
    showKeyboardShortcuts,
    currentTabData.showPayment,
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
  const heldBill = heldBills.find(h => h.tabId === activeTab);

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
        showPayment: false,
        showCustomerModal: false,
        showProductsModal: false,
        showInvoice: false,
        showPrintSelection: false,
        showInvoiceDetails: false,
        showCustomSearchModal: false,
        showHoldBillModal: false,
      },
    }))
    setActiveTab(newTabId)
    showToast(`New tab ${String(newTabNumber).padStart(2, "0")} created`, "success")
  }, [tabs])

  const handleTabChange = useCallback(
    (tabId) => {
      setTabData((prev) => ({
        ...prev,
        [tabId]: {
          ...prev[tabId],
          showPayment: false,
          showCustomerModal: false,
          showProductsModal: false,
          showInvoice: false,
          showPrintSelection: false,
          showInvoiceDetails: false,
          showCustomSearchModal: false,
          showHoldBillModal: false,
        },
      }));
      setActiveTab(tabId);
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        showToast(`Switched to tab ${String(tab.number).padStart(2, "0")}`, "info");
      }
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    },
    [tabs]
  );

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
            discount: heldBill.discount,
            taxRate: heldBill.taxRate,
            showPayment: currentData.showPayment,
            showCustomerModal: currentData.showCustomerModal,
            showProductsModal: currentData.showProductsModal,
            showInvoice: currentData.showInvoice,
            showPrintSelection: currentData.showPrintSelection,
            showInvoiceDetails: currentData.showInvoiceDetails,
            showCustomSearchModal: currentData.showCustomSearchModal,
            showHoldBillModal: currentData.showHoldBillModal,
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
            showPayment: heldBill.showPayment,
            showCustomerModal: heldBill.showCustomerModal,
            showProductsModal: heldBill.showProductsModal,
            showInvoice: heldBill.showInvoice,
            showPrintSelection: heldBill.showPrintSelection,
            showInvoiceDetails: heldBill.showInvoiceDetails,
            showCustomSearchModal: heldBill.showCustomSearchModal,
            showHoldBillModal: heldBill.showHoldBillModal,
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

  // Fast toast notification - moved here before addToCart
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, isVisible: true })
  }, [])

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }, [])

  // Enhanced addToCart function with identifier support
  const addToCart = useCallback(
    async (product) => {
      console.log('Product clicked:', product) // Debug log
      console.log('Product identifier type:', product.productIdentifierType) // Debug log

      // Check if product has identifier type
      if (product.productIdentifierType && product.productIdentifierType !== 'none') {
        console.log('Opening identifier modal for:', product.productIdentifierType) // Debug log
        // Show identifier selection modal
        setSelectedProductForIdentifier(product)
        setIsLoadingIdentifiers(true)

        try {
          // Fetch available identifiers
          const response = await fetch(`${backEndURL}/api/identifiers/${product.productIdentifierType}/${product.id}`)
          console.log('API Response status:', response.status) // Debug log

          if (response.ok) {
            const data = await response.json()
            console.log('API Response data:', data) // Debug log

            if (data && data.identifiers) {
              // Filter only available (not sold) identifiers
              const available = data.identifiers.filter(item => !item.sold)
              console.log('Available identifiers:', available) // Debug log
              setAvailableIdentifiers(available)
              setSelectedIdentifiers([])
              setShowIdentifierModal(true)
            } else {
              showToast(`No available ${product.productIdentifierType} numbers found for this product`, "warning")
            }
          } else {
            showToast(`No ${product.productIdentifierType} numbers found for this product`, "warning")
          }
        } catch (error) {
          console.error('Error fetching identifiers:', error)
          showToast(`Error fetching ${product.productIdentifierType} numbers`, "error")
        } finally {
          setIsLoadingIdentifiers(false)
        }
        return
      }

      // If no identifier type, add directly to cart
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
      // Always focus barcode input after adding
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);

    },
    [selectedPriceType, currentTabData.cart, activeTab, updateTabData, showToast],
  )

  // Function to handle identifier selection and add to cart
  const handleIdentifierSelection = useCallback((selectedIds) => {
    if (!selectedProductForIdentifier || selectedIds.length === 0) return

    const priceKey = `${selectedPriceType}Price`
    const price = selectedProductForIdentifier[priceKey]
    const currentCart = currentTabData.cart

    // Create cart items for each selected identifier
    selectedIds.forEach(identifierId => {
      const identifier = availableIdentifiers.find(item =>
        item[selectedProductForIdentifier.productIdentifierType] === identifierId
      )

      if (identifier) {
        const newItem = {
          id: `${selectedProductForIdentifier.id}-${identifierId}`,
          name: selectedProductForIdentifier.name,
          price: price,
          originalPrice: price,
          quantity: 1,
          barcode: selectedProductForIdentifier.barcode,
          category: selectedProductForIdentifier.category,
          stock: 1, // Individual item
          discountType: "none",
          discountValue: 0,
          discountedPrice: price,
          identifierType: selectedProductForIdentifier.productIdentifierType,
          identifierValue: identifierId,
          mainProductId: selectedProductForIdentifier.id,
          mainProductSku: selectedProductForIdentifier.sku || selectedProductForIdentifier.id
        }

        updateTabData(activeTab, { cart: [...currentCart, newItem] })
      }
    })

    showToast(`${selectedIds.length} ${selectedProductForIdentifier.productIdentifierType} item(s) added to cart`, "success")
    setShowIdentifierModal(false)
    setSelectedProductForIdentifier(null)
    setAvailableIdentifiers([])
    setSelectedIdentifiers([])
  }, [selectedProductForIdentifier, selectedPriceType, currentTabData.cart, activeTab, updateTabData, availableIdentifiers])

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
      showPayment: false,
      showCustomerModal: false,
      showProductsModal: false,
      showInvoice: false,
      showPrintSelection: false,
      showInvoiceDetails: false,
      showCustomSearchModal: false,
      showHoldBillModal: false,
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

  // New state for barcode search functionality
  const [barcodeSearchResults, setBarcodeSearchResults] = useState([])
  const [showBarcodeSearch, setShowBarcodeSearch] = useState(false)
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false)
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0)

  // Enhanced barcode scan with identifier support
  const handleBarcodeScan = useCallback(
    async (e) => {
      if (e.key === "Enter" && barcodeInput.trim()) {
        const product = products.find((p) => p.barcode === barcodeInput.trim())
        if (product) {
          // Check if product has identifier type
          if (product.productIdentifierType && product.productIdentifierType !== 'none') {
            console.log('Product has identifier type:', product.productIdentifierType)
            // Show identifier selection modal
            setSelectedProductForIdentifier(product)
            setIsLoadingIdentifiers(true)

            try {
              // Fetch available identifiers
              const response = await fetch(`${backEndURL}/api/identifiers/${product.productIdentifierType}/${product.id}`)
              console.log('API Response status:', response.status)

              if (response.ok) {
                const data = await response.json()
                console.log('API Response data:', data)

                if (data && data.identifiers) {
                  // Filter only available (not sold) identifiers
                  const available = data.identifiers.filter(item => !item.sold)
                  console.log('Available identifiers:', available)
                  setAvailableIdentifiers(available)
                  setSelectedIdentifiers([])
                  setShowIdentifierModal(true)
                } else {
                  showToast(`No available ${product.productIdentifierType} numbers found for this product`, "warning")
                }
              } else {
                showToast(`No ${product.productIdentifierType} numbers found for this product`, "warning")
              }
            } catch (error) {
              console.error('Error fetching identifiers:', error)
              showToast(`Error fetching ${product.productIdentifierType} numbers`, "error")
            } finally {
              setIsLoadingIdentifiers(false)
            }
          } else {
            // No identifier type, add directly to cart
            addToCart(product)
            showToast(`Product found: ${product.name}`, "success")
          }
          setBarcodeInput("")
          setBarcodeSearchResults([])
          setShowBarcodeSearch(false)
        } else {
          showToast("Product not found", "error")
          setBarcodeInput("")
          setBarcodeSearchResults([])
          setShowBarcodeSearch(false)
        }
      }
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
    },
    [barcodeInput, products, addToCart, showToast, backEndURL, selectedProductForIdentifier, setIsLoadingIdentifiers, setAvailableIdentifiers, setSelectedIdentifiers, setShowIdentifierModal, setBarcodeSearchResults, setShowBarcodeSearch],
  )

  // Real-time barcode search function
  const handleBarcodeSearch = useCallback(
    async (searchTerm) => {
      if (!searchTerm.trim()) {
        setBarcodeSearchResults([])
        setShowBarcodeSearch(false)
        return
      }

      setIsSearchingBarcode(true)
      try {
        // Search in products first
        const matchingProducts = products.filter(product =>
          product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        // Search in identifiers
        const identifierResults = []
        const soldIdentifiers = [] // Track sold identifiers to show messages

        for (const product of products) {
          if (product.productIdentifierType && product.productIdentifierType !== 'none') {
            try {
              const response = await fetch(`${backEndURL}/api/identifiers/${product.productIdentifierType}/${product.id}`)
              if (response.ok) {
                const data = await response.json()
                if (data && data.identifiers) {
                  const matchingIdentifiers = data.identifiers.filter(item => {
                    const identifierValue = item[product.productIdentifierType]
                    return identifierValue && identifierValue.toLowerCase().includes(searchTerm.toLowerCase())
                  })

                  matchingIdentifiers.forEach(identifier => {
                    if (identifier.sold) {
                      // Add to sold identifiers list
                      soldIdentifiers.push({
                        product: product,
                        identifier: identifier,
                        displayText: `${product.name} - ${product.productIdentifierType.toUpperCase()}: ${identifier[product.productIdentifierType]} (SOLD)`
                      })
                    } else {
                      // Add to available identifiers list
                      identifierResults.push({
                        type: 'identifier',
                        product: product,
                        identifier: identifier,
                        displayText: `${product.name} - ${product.productIdentifierType.toUpperCase()}: ${identifier[product.productIdentifierType]}`
                      })
                    }
                  })
                }
              }
            } catch (error) {
              console.error(`Error searching identifiers for product ${product.id}:`, error)
            }
          }
        }

        // Combine results
        const combinedResults = [
          ...matchingProducts.map(product => ({
            type: 'product',
            product: product,
            displayText: `${product.name} (${product.barcode})`
          })),
          ...identifierResults // Only include available (not sold) identifiers in results
        ]

        setBarcodeSearchResults(combinedResults)
        setShowBarcodeSearch(combinedResults.length > 0)
        setSelectedSearchIndex(0)

        // Show message for sold identifiers
        if (soldIdentifiers.length > 0) {
          const soldMessage = soldIdentifiers.map(item =>
            `${item.product.name} - ${item.product.productIdentifierType.toUpperCase()}: ${item.identifier[item.product.productIdentifierType]}`
          ).join(', ')
          showToast(`⚠️ Already sold: ${soldMessage}`, "warning")
        }
      } catch (error) {
        console.error('Error in barcode search:', error)
      } finally {
        setIsSearchingBarcode(false)
      }
    },
    [products, backEndURL, showToast]
  )

  // Handle barcode input change with automatic search and action
  const handleBarcodeInputChange = useCallback((e) => {
    const value = e.target.value
    setBarcodeInput(value)

    // Clear previous search results
    setBarcodeSearchResults([])
    setShowBarcodeSearch(false)

    if (!value.trim()) return

    // Check for exact barcode match immediately (no debounce for exact matches)
    const exactProductMatch = products.find(product => product.barcode === value.trim())

    if (exactProductMatch) {
      // Exact barcode match found - handle automatically
      if (exactProductMatch.productIdentifierType && exactProductMatch.productIdentifierType !== 'none') {
        // Product has identifiers - open popup
        console.log('Exact barcode match with identifiers:', exactProductMatch.productIdentifierType)
        setSelectedProductForIdentifier(exactProductMatch)
        setIsLoadingIdentifiers(true)

        fetch(`${backEndURL}/api/identifiers/${exactProductMatch.productIdentifierType}/${exactProductMatch.id}`)
          .then(response => response.json())
          .then(data => {
            if (data && data.identifiers) {
              const available = data.identifiers.filter(item => !item.sold)
              setAvailableIdentifiers(available)
              setSelectedIdentifiers([])
              setShowIdentifierModal(true)
            } else {
              showToast(`No available ${exactProductMatch.productIdentifierType} numbers found`, "warning")
            }
          })
          .catch(error => {
            console.error('Error fetching identifiers:', error)
            showToast(`Error fetching ${exactProductMatch.productIdentifierType} numbers`, "error")
          })
          .finally(() => {
            setIsLoadingIdentifiers(false)
          })
      } else {
        // No identifiers - add directly to cart
        addToCart(exactProductMatch)
        showToast(`Product added: ${exactProductMatch.name}`, "success")
      }

      // Clear input after action
      setBarcodeInput("")
      // After handling product add or identifier modal, always focus barcode input
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 100);
      return
    }

    // Debounce search for partial matches and identifier searches
    const timeoutId = setTimeout(async () => {
      // Check for exact identifier match
      let exactIdentifierMatch = null
      let soldIdentifierMatch = null // Track if we find a sold identifier

      for (const product of products) {
        if (product.productIdentifierType && product.productIdentifierType !== 'none') {
          try {
            const response = await fetch(`${backEndURL}/api/identifiers/${product.productIdentifierType}/${product.id}`)
            if (response.ok) {
              const data = await response.json()
              if (data && data.identifiers) {
                // First check for available (not sold) exact match
                const exactMatch = data.identifiers.find(item =>
                  item[product.productIdentifierType] === value.trim() && !item.sold
                )
                if (exactMatch) {
                  exactIdentifierMatch = { product, identifier: exactMatch }
                  break
                }

                // If no available match found, check if it's sold
                const soldMatch = data.identifiers.find(item =>
                  item[product.productIdentifierType] === value.trim() && item.sold
                )
                if (soldMatch) {
                  soldIdentifierMatch = { product, identifier: soldMatch }
                }
              }
            }
          } catch (error) {
            console.error(`Error checking identifiers for product ${product.id}:`, error)
          }
        }
      }

      // If we found a sold identifier, show warning message
      if (soldIdentifierMatch) {
        const { product, identifier } = soldIdentifierMatch
        const identifierValue = identifier[product.productIdentifierType]
        showToast(`⚠️ ${product.name} with ${product.productIdentifierType.toUpperCase()}: ${identifierValue} is already sold!`, "warning")
        setBarcodeInput("")
        return
      }

      if (exactIdentifierMatch) {
        // Exact identifier match found - add to cart automatically
        const { product, identifier } = exactIdentifierMatch
        const priceKey = `${selectedPriceType}Price`
        const price = product[priceKey]
        const currentCart = currentTabData.cart
        const identifierValue = identifier[product.productIdentifierType]

        const newItem = {
          id: `${product.id}-${identifierValue}`,
          name: product.name,
          price: price,
          originalPrice: price,
          quantity: 1,
          barcode: product.barcode,
          category: product.category,
          stock: 1,
          discountType: "none",
          discountValue: 0,
          discountedPrice: price,
          identifierType: product.productIdentifierType,
          identifierValue: identifierValue,
          mainProductId: product.id,
          mainProductSku: product.sku || product.id
        }

        updateTabData(activeTab, { cart: [...currentCart, newItem] })
        showToast(`${product.name} with ${product.productIdentifierType.toUpperCase()}: ${identifierValue} added to cart`, "success")
        setBarcodeInput("")
        return
      }

      // If no exact matches, show search results for partial matches
      handleBarcodeSearch(value)
    }, 300) // Reduced debounce for better responsiveness

    return () => clearTimeout(timeoutId)
  }, [products, addToCart, showToast, backEndURL, selectedPriceType, currentTabData.cart, activeTab, updateTabData, handleBarcodeSearch])

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result) => {
    if (result.type === 'product') {
      // Handle product selection
      if (result.product.productIdentifierType && result.product.productIdentifierType !== 'none') {
        // Open identifier modal
        setSelectedProductForIdentifier(result.product)
        setIsLoadingIdentifiers(true)

        fetch(`${backEndURL}/api/identifiers/${result.product.productIdentifierType}/${result.product.id}`)
          .then(response => response.json())
          .then(data => {
            if (data && data.identifiers) {
              const available = data.identifiers.filter(item => !item.sold)
              setAvailableIdentifiers(available)
              setSelectedIdentifiers([])
              setShowIdentifierModal(true)
            }
          })
          .catch(error => {
            console.error('Error fetching identifiers:', error)
            showToast(`Error fetching ${result.product.productIdentifierType} numbers`, "error")
          })
          .finally(() => {
            setIsLoadingIdentifiers(false)
          })
      } else {
        // Add directly to cart
        addToCart(result.product)
        showToast(`Product added: ${result.product.name}`, "success")
      }
    } else if (result.type === 'identifier') {
      // Check if identifier is sold
      if (result.identifier && result.identifier.sold) {
        const identifierValue = result.identifier[result.product.productIdentifierType]
        showToast(`⚠️ ${result.product.name} with ${result.product.productIdentifierType.toUpperCase()}: ${identifierValue} is already sold!`, "warning")
        return
      }

      // Handle identifier selection - add specific identifier to cart
      const priceKey = `${selectedPriceType}Price`
      const price = result.product[priceKey]
      const currentCart = currentTabData.cart
      const identifierValue = result.identifier[result.product.productIdentifierType]

      const newItem = {
        id: `${result.product.id}-${identifierValue}`,
        name: result.product.name,
        price: price,
        originalPrice: price,
        quantity: 1,
        barcode: result.product.barcode,
        category: result.product.category,
        stock: 1,
        discountType: "none",
        discountValue: 0,
        discountedPrice: price,
        identifierType: result.product.productIdentifierType,
        identifierValue: identifierValue,
        mainProductId: result.product.id,
        mainProductSku: result.product.sku || result.product.id
      }

      updateTabData(activeTab, { cart: [...currentCart, newItem] })
      showToast(`${result.product.name} with ${result.product.productIdentifierType.toUpperCase()}: ${identifierValue} added to cart`, "success")
    }

    setBarcodeInput("")
    setBarcodeSearchResults([])
    setShowBarcodeSearch(false)
  }, [selectedPriceType, currentTabData.cart, activeTab, updateTabData, addToCart, showToast, backEndURL])

  useEffect(() => {
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 200);
  }, [activeTab]);

  // Keyboard navigation for search results
  useEffect(() => {
    const handleSearchKeyDown = (e) => {
      if (!showBarcodeSearch || barcodeSearchResults.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSearchIndex(prev => {
            let nextIndex = prev < barcodeSearchResults.length - 1 ? prev + 1 : 0
            // Skip sold identifiers
            while (nextIndex !== prev) {
              const result = barcodeSearchResults[nextIndex]
              const isSoldIdentifier = result.type === 'identifier' && result.identifier && result.identifier.sold
              if (!isSoldIdentifier) break
              nextIndex = nextIndex < barcodeSearchResults.length - 1 ? nextIndex + 1 : 0
            }
            return nextIndex
          })
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSearchIndex(prev => {
            let nextIndex = prev > 0 ? prev - 1 : barcodeSearchResults.length - 1
            // Skip sold identifiers
            while (nextIndex !== prev) {
              const result = barcodeSearchResults[nextIndex]
              const isSoldIdentifier = result.type === 'identifier' && result.identifier && result.identifier.sold
              if (!isSoldIdentifier) break
              nextIndex = nextIndex > 0 ? nextIndex - 1 : barcodeSearchResults.length - 1
            }
            return nextIndex
          })
          break
        case 'Enter':
          e.preventDefault()
          if (selectedSearchIndex >= 0 && selectedSearchIndex < barcodeSearchResults.length) {
            const result = barcodeSearchResults[selectedSearchIndex]
            const isSoldIdentifier = result.type === 'identifier' && result.identifier && result.identifier.sold
            if (!isSoldIdentifier) {
              handleSearchResultSelect(result)
            } else {
              const identifierValue = result.identifier[result.product.productIdentifierType]
              showToast(`⚠️ ${result.product.name} with ${result.product.productIdentifierType.toUpperCase()}: ${identifierValue} is already sold!`, "warning")
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          setShowBarcodeSearch(false)
          setBarcodeSearchResults([])
          setBarcodeInput("")
          break
      }
    }

    const barcodeInput = barcodeRef.current
    if (barcodeInput) {
      barcodeInput.addEventListener('keydown', handleSearchKeyDown)
    }

    return () => {
      if (barcodeInput) {
        barcodeInput.removeEventListener('keydown', handleSearchKeyDown)
      }
    }
  }, [showBarcodeSearch, barcodeSearchResults, selectedSearchIndex, handleSearchResultSelect, showToast])

  const handleHoldBillWithName = useCallback(
    (tabId, billName) => {
      const currentData = tabData[tabId];
      if (currentData && currentData.cart.length > 0) {
        const holdData = {
          tabId,
          ...currentData,
          heldAt: new Date(),
          billName, // Save the name/note
        };

        setHeldBills((prev) => {
          const filtered = prev.filter((h) => h.tabId !== tabId);
          return [...filtered, holdData];
        });

        setTabData((prev) => ({
          ...prev,
          [tabId]: {
            cart: [],
            selectedCustomer: null,
            discount: { type: "amount", value: 0 },
            taxRate: 0,
            showPayment: currentData.showPayment,
            showCustomerModal: currentData.showCustomerModal,
            showProductsModal: currentData.showProductsModal,
            showInvoice: currentData.showInvoice,
            showPrintSelection: currentData.showPrintSelection,
            showInvoiceDetails: currentData.showInvoiceDetails,
            showCustomSearchModal: currentData.showCustomSearchModal,
            showHoldBillModal: currentData.showHoldBillModal,
          },
        }));

        const tab = tabs.find((t) => t.id === tabId);
        showToast(
          `Bill "${billName}" held for tab ${String(tab?.number || "").padStart(2, "0")}`,
          "success"
        );
      } else {
        showToast("No items to hold", "warning");
      }
    },
    [tabData, tabs]
  );
  // Enhanced completePayment function with async processing
  const completePayment = useCallback(
    async (paymentData) => {
      setIsProcessing(true)
      try {
        // Prepare invoice items with identifier information
        const invoiceItems = cart.map((item) => {
          const baseItem = {
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            discountedPrice: item.discountedPrice || item.price,
            originalPrice: item.price,
            discountAmount: item.price - (item.discountedPrice || item.price),
            category: item.category,
            barcode: item.barcode,
          }

          // Add identifier information if present
          if (item.identifierType && item.identifierValue) {
            baseItem.identifierType = item.identifierType
            baseItem.identifierValue = item.identifierValue
            baseItem.mainProductId = item.mainProductId
            baseItem.mainProductSku = item.mainProductSku
            baseItem.identifier = {
              type: item.identifierType,
              value: item.identifierValue
            }
          }

          return baseItem
        })

        // Create invoice object with enhanced data
        const invoice = {
          items: invoiceItems,
          customer: currentSelectedCustomer ? {
            id: currentSelectedCustomer.id,
            name: currentSelectedCustomer.name
          } : null,
          subtotal: calculatedSubtotal,
          discountAmount: discountAmount,
          taxAmount,
          total: grandTotal,
          paymentMethod: paymentData.method,
          paymentStatus: "Paid",
          date: new Date().toISOString(),
        }

        // Step 1: Create the invoice
        const response = await fetch(`${backEndURL}/api/invoices`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoice)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedInvoice = await response.json();

        // Update UI immediately for instant feedback
        setPendingInvoice({ ...invoice, id: savedInvoice.id });
        updateTabData(activeTab, { showPayment: false });
        handleClearCart();
        showToast("Payment completed successfully!", "success");

        // Automatically print based on business settings
        const format = businessSettings.printingStyle?.toLowerCase() === 'pos' ? 'pos' : 'a4';

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Get the invoice with identifiers and saved ID
        const invoiceWithIdentifiers = { ...invoice, id: savedInvoice.id };

        // Generate and write the HTML content
        const htmlContent = generateInvoiceHTML(invoiceWithIdentifiers, format);
        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(htmlContent);
        iframeDoc.close();

        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
          iframe.contentWindow.print();
          // Remove the iframe after printing
          setTimeout(() => document.body.removeChild(iframe), 500);
        }, 250);

        // Step 2 & 3: Process inventory and identifiers asynchronously (non-blocking)
        Promise.all([
          // Update inventory for all items
          ...cart.map(async (item) => {
            try {
              // For items with identifiers, use the main product ID
              const productId = item.mainProductId || item.id
              const quantity = item.quantity

              console.log(`Updating inventory for product ${productId}, quantity: ${quantity}`)

              const inventoryResponse = await fetch(`${backEndURL}/api/inventory/deduct`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  productId: productId,
                  quantity: quantity,
                  invoiceId: savedInvoice.id
                })
              });

              if (!inventoryResponse.ok) {
                const errorData = await inventoryResponse.json()
                console.error(`Failed to update inventory for product ${productId}:`, errorData)
              } else {
                console.log(`Successfully updated inventory for product ${productId}`)
              }
            } catch (error) {
              console.error(`Error updating inventory for product ${item.id}:`, error);
            }
          }),

          // Mark identifiers as sold
          ...cart.filter(item => item.identifierType && item.identifierValue).map(async (item) => {
            try {
              console.log(`Marking ${item.identifierType} ${item.identifierValue} as sold for invoice ${savedInvoice.id}`)

              const identifierResponse = await fetch(`${backEndURL}/api/identifiers/mark-sold`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  productId: item.mainProductId,
                  identifier: item.identifierValue,
                  type: item.identifierType,
                  invoiceId: savedInvoice.id
                })
              });

              if (!identifierResponse.ok) {
                const errorData = await identifierResponse.json()
                console.error(`Failed to mark identifier ${item.identifierValue} as sold:`, errorData)
              } else {
                console.log(`Successfully marked ${item.identifierType} ${item.identifierValue} as sold`)
              }
            } catch (error) {
              console.error(`Error marking identifier ${item.identifierValue} as sold:`, error);
            }
          })
        ]).then(() => {
          console.log('All background processing completed successfully')
        }).catch(error => {
          console.error('Background processing error:', error);
          // Don't show error to user since payment was successful
        });

        // Update local products state immediately for instant UI feedback
        setProducts(prevProducts =>
          prevProducts.map(product => {
            const cartItem = cart.find(item => {
              const productId = item.mainProductId || item.id
              return productId === product.id
            });
            if (cartItem) {
              return { ...product, stock: Math.max(0, product.stock - cartItem.quantity) };
            }
            return product;
          })
        );

      } catch (error) {
        console.error("Error completing payment:", error);
        showToast("Failed to complete payment", "error");
      } finally {
        setIsProcessing(false);
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
      setProducts,
      backEndURL,
      businessSettings,
      generateInvoiceHTML
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

  // Add new function for silent quantity updates
  const updateProductQuantities = useCallback(async () => {
    try {
      const inventoryResponse = await fetch(`${backEndURL}/api/inventory`);
      const inventoryData = await inventoryResponse.json();

      // Create a map for O(1) lookup
      const inventoryMap = new Map(inventoryData.map(inv => [inv.productId, inv]));

      // Update products with new quantities
      setProducts(prevProducts =>
        prevProducts.map(product => {
          const inventory = inventoryMap.get(product.id);
          return {
            ...product,
            stock: inventory ? inventory.totalQuantity : 0
          };
        })
      );

      setLastQuantityUpdate(Date.now());
    } catch (error) {
      console.error('Error updating quantities:', error);
    }
  }, []);

  // Add interval for silent updates
  useEffect(() => {
    const intervalId = setInterval(updateProductQuantities, 100);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [updateProductQuantities]);

  // Modify the existing fetchData function to use the new update mechanism
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check if we have cached data
      const cachedData = sessionStorage.getItem('invoiceData')
      const cacheTimestamp = sessionStorage.getItem('invoiceDataTimestamp')
      const now = Date.now()

      // Use cached data if it's less than 2 minutes old
      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 120000) {
        const { products: cachedProducts, customers: cachedCustomers, categories: cachedCategories } = JSON.parse(cachedData)
        setProducts(cachedProducts)
        setCustomers(cachedCustomers)
        setCategories(cachedCategories)
        setIsLoading(false)
        return
      }

      // Parallel fetch with timeout and retry logic
      const fetchWithRetry = async (url, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // Increased to 10 seconds

            const response = await fetch(url, {
              signal: controller.signal,
              headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            })
            clearTimeout(timeoutId)

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
            return await response.json()
          } catch (err) {
            if (i === retries - 1) throw err
            // Exponential backoff with jitter
            const delay = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 10000)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      // Parallel fetch for better performance
      const [productsData, inventoryData, contactsData] = await Promise.all([
        fetchWithRetry(`${backEndURL}/api/products`),
        fetchWithRetry(`${backEndURL}/api/inventory`),
        fetchWithRetry(`${backEndURL}/api/contacts`),
      ])

      // Combine products with inventory data using Map for O(1) lookup
      const inventoryMap = new Map(inventoryData.map(inv => [inv.productId, inv]))

      const combinedProducts = productsData.map((product) => {
        const inventory = inventoryMap.get(product.id)
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
          productIdentifierType: product.productIdentifierType || 'none', // Add this field
          sku: product.sku || product.id, // Add SKU field
        }
      })

      // Filter customers
      const customerContacts = contactsData.filter((c) => c.categoryType === "Customer")

      // Update state
      setProducts(combinedProducts)
      setCustomers(customerContacts)
      setCategories([...new Set(combinedProducts.map(p => p.category))])

      // Cache the results
      const dataToCache = {
        products: combinedProducts,
        customers: customerContacts,
        categories: [...new Set(combinedProducts.map(p => p.category))]
      }
      sessionStorage.setItem('invoiceData', JSON.stringify(dataToCache))
      sessionStorage.setItem('invoiceDataTimestamp', now.toString())

    } catch (error) {
      console.error('Error fetching data:', error)
      // Show error toast or notification
    } finally {
      setIsLoading(false)
    }
  }, [])

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

  // Remove the duplicate keyboard navigation effect
  useEffect(() => {
    const handleProductNavigation = (e) => {
      // Only handle navigation if search is active or products modal is open
      if (!isSearchActive && !showProductsModal) return

      const totalProducts = filteredProducts.length
      if (totalProducts === 0) return

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev < totalProducts - 1 ? prev + 1 : prev
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
            prev + 4 < totalProducts ? prev + 4 : prev
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedProductIndex((prev) =>
            prev >= 4 ? prev - 4 : prev
          )
          break
        case "Enter":
          e.preventDefault()
          if (selectedProductIndex >= 0 && selectedProductIndex < totalProducts) {
            addToCart(filteredProducts[selectedProductIndex])
            // Keep focus on search input after adding to cart
            searchInputRef.current?.focus()
          }
          break
        case "Escape":
          e.preventDefault()
          setIsSearchActive(false)
          setSelectedProductIndex(-1)
          break
      }
    }

    // Add event listener to the search input instead of window
    const searchInput = searchInputRef.current
    if (searchInput) {
      searchInput.addEventListener("keydown", handleProductNavigation)
    }

    return () => {
      if (searchInput) {
        searchInput.removeEventListener("keydown", handleProductNavigation)
      }
    }
  }, [isSearchActive, showProductsModal, filteredProducts, selectedProductIndex, addToCart])

  // Update the search input focus effect
  useEffect(() => {
    const handleSearchFocus = () => {
      setIsSearchActive(true)
      setSelectedProductIndex(0)
    }

    const handleSearchBlur = (e) => {
      // Only blur if we're not clicking on a product
      if (!e.relatedTarget?.closest('.product-grid')) {
        setIsSearchActive(false)
        setSelectedProductIndex(-1)
      }
    }

    const searchInput = searchInputRef.current
    if (searchInput) {
      searchInput.addEventListener('focus', handleSearchFocus)
      searchInput.addEventListener('blur', handleSearchBlur)
    }

    return () => {
      if (searchInput) {
        searchInput.removeEventListener('focus', handleSearchFocus)
        searchInput.removeEventListener('blur', handleSearchBlur)
      }
    }
  }, [])

  const [showCashOutModal, setShowCashOutModal] = useState(false);
  const [cashOutData, setCashOutData] = useState({
    title: '',
    amount: '',
    date: new Date().toLocaleDateString('en-US'),
    paidBy: sessionStorage.getItem('email') || '',
    to: '',
    paymentMethod: '',
    status: 'Approved',
    description: ''
  });

  const handleCashOutSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      const expenseData = {
        title: cashOutData.title,
        amount: Number(cashOutData.amount),
        date: cashOutData.date,
        paidBy: cashOutData.paidBy,
        to: cashOutData.to,
        paymentMethod: cashOutData.paymentMethod,
        status: cashOutData.status,
        description: cashOutData.description
      };

      const response = await axios.post(`${backEndURL}/api/finance/expense`, expenseData, {
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (response.data.success) {
        showToast('Cash out recorded successfully', 'success');
        setShowCashOutModal(false);
        setCashOutData({
          title: '',
          amount: '',
          date: new Date().toLocaleDateString('en-US'),
          paidBy: sessionStorage.getItem('email') || '',
          to: '',
          paymentMethod: '',
          status: 'Approved',
          description: ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to record cash out');
      }
    } catch (error) {
      console.error('Error recording cash out:', error);
      showToast(error.message || 'Failed to record cash out', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Focus barcode input on POS page mount or when switching to POS tab
  useEffect(() => {
    if (activeMainTab === 'pos' && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [activeMainTab]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <DotSpinner />
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

      <div className="fixed bottom-4 right-4 z-40 flex flex-col-reverse space-y-reverse space-y-3">

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={() => setShowKeyboardShortcuts(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105"
          title="Keyboard Shortcuts (Shift+Enter)"
        >
          ⌨️
        </button>
        <button
          onClick={() => setShowHoldBillModal(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105"
          title="Hold Current Bill (Shift+H)"
        >
          🧾
        </button>
        {showHoldBillModal && (
          <HoldBillModal
            onClose={() => setShowHoldBillModal(false)}
            onSave={(billName) => handleHoldBillWithName(activeTab, billName)}
          />
        )}
        {/* Unhold Bill */}
        <button
          onClick={() => handleUnholdBill(activeTab)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105"
          title="Unhold Current Bill (Shift+U)"
        >
          ✅
        </button>
        <button
          onClick={() => setShowCashOutModal(true)}
          className="bg-red-500 hover:bg-green-600 text-white rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105"
          title="Cash Out (Shift + Q)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>

        {/* POS System */}
        <button
          onClick={() => setActiveMainTab("pos")}
          className={`rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105 ${activeMainTab === "pos"
            ? "bg-blue-500 text-white shadow"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          title="POS System"
        >
          🛒
        </button>

        {/* Invoices */}
        <button
          onClick={() => setActiveMainTab("invoices")}
          className={`rounded-full p-3 card-shadow transition-all duration-150 hover:scale-105 ${activeMainTab === "invoices"
            ? "bg-blue-500 text-white shadow"
            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          title="Invoices"
        >
          📄
        </button>
      </div>

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
                  <div className="flex justify-between">
                    <span>Cash Out:</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded">Shift + C</kbd>
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

      <div className="container mx-auto px-4 h-screen overflow-hidden">
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

        {activeMainTab === "pos" ? (
          <div className="grid grid-cols-2 gap-3 h-[calc(100vh-2rem)] w-auto">
            {/* Products Section */}
            <div className="bg-white rounded-lg p-6 card-shadow flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Products</h2>
                <button
                  onClick={() => setShowProductsModal(true)}
                  className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  All Products
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Scanner</label>
                <div className="relative">
                  <input
                    ref={barcodeRef}
                    type="text"
                    value={barcodeInput}
                    onChange={handleBarcodeInputChange}
                    onKeyPress={handleBarcodeScan}
                    placeholder="Scan or enter barcode/product name/IMEI/Serial..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {isSearchingBarcode && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="spinner"></div>
                    </div>
                  )}

                  {/* Search Results Dropdown */}
                  {showBarcodeSearch && barcodeSearchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {barcodeSearchResults.map((result, index) => {
                        // Check if this is a sold identifier
                        const isSoldIdentifier = result.type === 'identifier' && result.identifier && result.identifier.sold;

                        return (
                          <div
                            key={index}
                            className={`px-4 py-3 transition-colors ${isSoldIdentifier
                              ? 'bg-gray-100 cursor-not-allowed opacity-60'
                              : `cursor-pointer hover:bg-blue-50 ${index === selectedSearchIndex ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                              }`
                              }`}
                            onClick={() => !isSoldIdentifier && handleSearchResultSelect(result)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className={`font-medium ${isSoldIdentifier ? 'text-gray-500' : 'text-gray-800'}`}>
                                  {result.displayText}
                                  {isSoldIdentifier && <span className="ml-2 text-red-500 font-semibold">(SOLD)</span>}
                                </div>
                                <div className={`text-sm ${isSoldIdentifier ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {result.type === 'product' ? (
                                    <>
                                      🏷️ {result.product.category} •
                                      💰 Rs {result.product[`${selectedPriceType}Price`].toFixed(2)} •
                                      📦 Stock: {result.product.stock}
                                      {result.product.productIdentifierType && result.product.productIdentifierType !== 'none' && (
                                        <span className="ml-2 text-blue-600 font-semibold">
                                          • {result.product.productIdentifierType.toUpperCase()}
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      🏷️ {result.product.category} •
                                      💰 Rs {result.product[`${selectedPriceType}Price`].toFixed(2)} •
                                      {isSoldIdentifier ? (
                                        <span className="text-red-500 font-semibold">❌ Already Sold</span>
                                      ) : (
                                        <span>📦 Available</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="ml-2 text-gray-400">
                                {result.type === 'product' ? '📦' : (isSoldIdentifier ? '❌' : '🔍')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  💡 Tip: Exact barcode matches auto-add to cart. Type IMEI/Serial numbers to find specific items. Use ↑↓ arrows to navigate search results.
                </div>
              </div>
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
                  onKeyDown={(e) => {
                    const totalProducts = filteredProducts.length
                    if (totalProducts === 0) return
                    let handled = false
                    if (e.key === "ArrowRight") {
                      setSelectedProductIndex((prev) => (prev < totalProducts - 1 ? prev + 1 : prev))
                      handled = true
                    } else if (e.key === "ArrowLeft") {
                      setSelectedProductIndex((prev) => (prev > 0 ? prev - 1 : prev))
                      handled = true
                    } else if (e.key === "ArrowDown") {
                      setSelectedProductIndex((prev) => (prev + 4 < totalProducts ? prev + 4 : prev))
                      handled = true
                    } else if (e.key === "ArrowUp") {
                      setSelectedProductIndex((prev) => (prev >= 4 ? prev - 4 : prev))
                      handled = true
                    } else if (e.key === "Enter") {
                      if (selectedProductIndex >= 0 && selectedProductIndex < totalProducts) {
                        addToCart(filteredProducts[selectedProductIndex])
                        handled = true
                      }
                    }
                    if (handled) {
                      e.preventDefault()
                      e.stopPropagation()
                    }
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
              <div
                ref={productGridRef}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 flex-1 overflow-y-auto"
                tabIndex={0}
              >
                {filteredProducts.map((product, index) => (
                  <EnhancedProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    selectedPriceType={selectedPriceType}
                    isSelected={index === selectedProductIndex}
                  />
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="bg-white rounded-lg p-6 card-shadow flex flex-col">
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

              {/* Cart Items with Scroll */}
              <div className="flex-1 overflow-y-auto space-y-2 virtual-scroll">
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

              {/* Cart Summary - Fixed at bottom */}
              <div className="pt-4 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>Rs {calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount:</span>
                    <span>- Rs {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({currentTaxRate}%):</span>
                    <span>Rs {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-800">
                    <span>Total:</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => updateTabData(activeTab, { showPayment: true })}
                  disabled={cart.length === 0}
                  className={`w-full mt-4 py-3 rounded-lg font-semibold text-white transition-colors ${cart.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  💰 Complete Payment
                </button>
              </div>
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
      </div>      {/* Custom Search Modal */}
      {currentTabData.showPayment && (
        <EnhancedPaymentModal
          grandTotal={grandTotal}
          subtotal={calculatedSubtotal}
          taxRate={currentTaxRate}
          discount={currentDiscount}
          onClose={() => updateTabData(activeTab, { showPayment: false })}
          onPaymentComplete={completePayment}
        />
      )}

      {/* Enhanced Print Selection Modal */}
      {currentTabData.showPrintSelection && pendingInvoice && (
        <EnhancedPrintSelectionModal
          onClose={() => updateTabData(activeTab, { showPrintSelection: false })}
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


      {/* Cash Out Modal */}
      {showCashOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleCashOutSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={cashOutData.title}
                  onChange={(e) => setCashOutData({ ...cashOutData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={cashOutData.amount}
                  onChange={(e) => setCashOutData({ ...cashOutData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={cashOutData.date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                <input
                  type="text"
                  value={cashOutData.paidBy}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="text"
                  value={cashOutData.Department}
                  onChange={(e) => setCashOutData({ ...cashOutData, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={cashOutData.paymentMethod}
                  onChange={(e) => setCashOutData({ ...cashOutData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <input
                  type="text"
                  value={cashOutData.status}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={cashOutData.description}
                  onChange={(e) => setCashOutData({ ...cashOutData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCashOutModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md flex items-center gap-2 ${isSubmitting
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <DotSpinner />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Identifier Selection Modal */}
      {showIdentifierModal && selectedProductForIdentifier && (
        <IdentifierSelectionModal
          selectedProduct={selectedProductForIdentifier}
          availableIdentifiers={availableIdentifiers}
          selectedIdentifiers={selectedIdentifiers}
          setSelectedIdentifiers={setSelectedIdentifiers}
          setShowIdentifierModal={setShowIdentifierModal}
          setSelectedProductForIdentifier={setSelectedProductForIdentifier}
          setAvailableIdentifiers={setAvailableIdentifiers}
          setSelectedIdentifiersOuter={setSelectedIdentifiers}
          isLoadingIdentifiers={isLoadingIdentifiers}
          handleIdentifierSelection={handleIdentifierSelection}
          selectedPriceType={selectedPriceType}
        />
      )}
    </div>
  )
}

// Enhanced Product Card Component
const EnhancedProductCard = ({ product, onAddToCart, selectedPriceType, isSelected }) => {
  const priceKey = `${selectedPriceType}Price`
  const currentPrice = product[priceKey] || 0
  const isLowStock = product.stock <= 5
  const cardRef = useRef(null)

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
        inline: "center"
      })
    }
  }, [isSelected])

  return (
    <div
      ref={cardRef}
      className={`product-card border rounded p-1.5 transition-all duration-150 hover:shadow-md cursor-pointer h-[85px] ${isSelected
        ? "ring-1 ring-blue-500 bg-blue-50 border-blue-300"
        : "border-gray-200 hover:border-blue-300"
        }`}
      onClick={() => onAddToCart(product)}
      tabIndex={0}
    >
      <div className="product-card-content h-full flex flex-col justify-between">
        <div className="flex justify-between items-start gap-1">
          <h3 className="font-medium text-gray-800 text-[11px] leading-tight line-clamp-1 flex-1">{product.name}</h3>
          <div className="flex flex-col items-end">
            <span className={`px-1 py-0.5 rounded-full text-[9px] font-medium ${isLowStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}>
              {product.stock}
            </span>
            {isLowStock && (
              <span className="px-1 py-0.5 bg-red-500 text-white text-[9px] rounded-full animate-pulse">⚠️</span>
            )}
          </div>
        </div>

        <div className="text-[9px] text-gray-500 truncate">
          {product.category}
          {product.productIdentifierType && product.productIdentifierType !== 'none' && (
            <span className="ml-1 text-blue-600 font-semibold">
              • {product.productIdentifierType.toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs font-bold text-blue-600">Rs {currentPrice.toFixed(2)}</div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
            disabled={product.stock === 0}
            className={`px-1 py-0.5 rounded text-[9px] font-medium transition-all ${product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "btn-primary hover:scale-105"
              }`}
          >
            {product.stock === 0 ? "❌" : "➕"}
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
              {item.identifierType && item.identifierValue && (
                <span className="ml-2 text-blue-600 font-semibold">
                  {item.identifierType.toUpperCase()}: {item.identifierValue}
                </span>
              )}
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
  const [paymentMethod, setPaymentMethod] = useState("cash") // "cash" or "card"
  const [cashAmount, setCashAmount] = useState("")
  const [cardAmount, setCardAmount] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCVV, setCardCVV] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "", isVisible: false })

  // Set card amount to grand total when payment method changes to card
  useEffect(() => {
    if (paymentMethod === "card") {
      setCardAmount(grandTotal.toFixed(2))
    }
  }, [paymentMethod, grandTotal])

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

  // Memoized showToast
  const showToast = useCallback((message, type) => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000)
  }, [])

  // Calculate amounts
  const currentAmount = paymentMethod === "cash" ? parseFloat(cashAmount) || 0 : parseFloat(cardAmount) || 0
  const balanceDue = grandTotal - currentAmount
  const changeDue = currentAmount > grandTotal ? currentAmount - grandTotal : 0

  const handleCompletePayment = useCallback(async () => {
    setIsProcessing(true)
    try {
      if (currentAmount < grandTotal) {
        showToast("Payment amount is less than the grand total", "error")
        return
      }

      const paymentDetails = {
        method: paymentMethod,
        amount: currentAmount,
        change: changeDue,
        ...(paymentMethod === "card" && {
          cardNumber: cardNumber.slice(-4),
          cardHolderName,
          cardExpiry,
        })
      }

      await onPaymentComplete(paymentDetails)
      onClose()
    } catch (error) {
      console.error("Payment processing failed:", error)
      showToast("Failed to complete payment", "error")
    } finally {
      setIsProcessing(false)
    }
  }, [
    currentAmount, grandTotal, paymentMethod, cardNumber, cardHolderName,
    cardExpiry, changeDue, onPaymentComplete, onClose, showToast
  ])

  const handleQuickCashAmount = useCallback((amount) => {
    setCashAmount(amount.toFixed(2))
    setPaymentMethod("cash")
  }, [])

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Payment Details
                </h3>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-4 rounded-lg border-2 transition-colors ${paymentMethod === "cash"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-300 hover:border-green-500"
                        }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">💵</span>
                        <span className="font-medium">Cash</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-lg border-2 transition-colors ${paymentMethod === "card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-500"
                        }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">💳</span>
                        <span className="font-medium">Card</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Cash Payment Section */}
                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cash Amount
                      </label>
                      <input
                        type="number"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {quickCashAmounts.map((amount, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickCashAmount(amount)}
                          className="p-2 text-sm border rounded hover:bg-gray-50 transition-colors"
                        >
                          Rs {amount.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Card Payment Section */}
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Amount
                      </label>
                      <input
                        type="number"
                        value={cardAmount}
                        onChange={(e) => setCardAmount(e.target.value)}
                        className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        last 4 digit Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3456"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Preference
                      </label>
                      <input
                        type="text"
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        className="w-full p-2 border rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Unique"
                      />
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-base font-semibold mb-2">
                    <span>Total Amount:</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold mb-2">
                    <span>Amount Paid:</span>
                    <span>Rs {currentAmount.toFixed(2)}</span>
                  </div>
                  {balanceDue > 0 ? (
                    <div className="flex justify-between text-lg font-bold text-red-600">
                      <span>Balance Due:</span>
                      <span>Rs {balanceDue.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-lg font-bold text-green-600">
                      <span>Change Due:</span>
                      <span>Rs {changeDue.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessing || currentAmount < grandTotal}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${isProcessing || currentAmount < grandTotal
                      ? "bg-gray-400 cursor-not-allowed"
                      : paymentMethod === "cash"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    {isProcessing ? (
                      <FastSpinner />
                    ) : (
                      <>
                        {paymentMethod === "cash" ? "💵 Complete Cash Payment" : "💳 Complete Card Payment"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
const EnhancedInvoiceModal = ({ invoice, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.altKey && e.key === 'p') {
        printInvoice(invoice, 'a4')
      } else if (e.altKey && e.key === 'r') {
        printInvoice(invoice, 'pos')
      } else if (e.altKey && e.key === 'd') {
        printInvoice(invoice, 'a4')
      } else if (e.altKey && e.key === 's') {
        printInvoice(invoice, 'pos')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, invoice])

  const handlePrint = (format) => {
    printInvoice(invoice, format)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Invoice #{invoice.id}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handlePrint('a4')}
              className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              🖨️ Print A4
              <span className="text-sm text-gray-500">(Alt + P)</span>
            </button>
            <button
              onClick={() => handlePrint('pos')}
              className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              🖨️ Print Receipt
              <span className="text-sm text-gray-500">(Alt + R)</span>
            </button>
            <button
              onClick={() => handlePrint('a4')}
              className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              📄 Download A4
              <span className="text-sm text-gray-500">(Alt + D)</span>
            </button>
            <button
              onClick={() => handlePrint('pos')}
              className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
            >
              🧾 Download Receipt
              <span className="text-sm text-gray-500">(Alt + S)</span>
            </button>
          </div>
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
const HoldBillModal = ({ onClose, onSave }) => {
  const [billName, setBillName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!billName.trim()) return;
    setIsSaving(true);
    onSave(billName.trim());
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md card-shadow fade-in">
        <h3 className="text-lg font-semibold mb-4">🧾 Hold Bill</h3>
        <input
          type="text"
          value={billName}
          onChange={(e) => setBillName(e.target.value)}
          placeholder="Enter a name or note for this bill"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !billName.trim()}
            className="flex-1 btn-primary px-4 py-2 rounded-lg font-medium"
          >
            {isSaving ? "Saving..." : "Save Hold Bill"}
          </button>
        </div>
      </div>
    </div>
  );
};
// Invoices Page Component
const InvoicesPage = ({ invoices, searchTerm, setSearchTerm, dateRange, setDateRange, onInvoiceSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInvoice, setModalInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceId = (invoice.id || '').toLowerCase();
      const customerName = (invoice.customer?.name || '').toLowerCase();
      const matchesSearch =
        invoiceId.includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase());

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

  useEffect(() => {
    // Focus the search input when the page loads
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setSelectedIndex(0); // Reset selection on filter change
  }, [searchTerm, dateRange, invoices]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
          setModalInvoice(null);
        }
        return;
      }
      if (document.activeElement === searchInputRef.current || document.activeElement.tagName === 'BODY') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, filteredInvoices.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filteredInvoices[selectedIndex]) {
            setModalInvoice(filteredInvoices[selectedIndex]);
            setIsModalOpen(true);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredInvoices, selectedIndex, isModalOpen]);

  const totalAmount = useMemo(
    () => filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0),
    [filteredInvoices],
  )
  const totalCount = filteredInvoices.length

  const handleDownloadInvoice = (invoice, format) => {
    printInvoice(invoice, format)
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
              ref={searchInputRef}
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
            filteredInvoices.map((invoice, idx) => (
              <div
                key={invoice.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${selectedIndex === idx ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setModalInvoice(invoice);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 cursor-pointer">
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
                      <button className="text-gray-400 hover:text-gray-600" onClick={() => { setModalInvoice(invoice); setIsModalOpen(true); }}>
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
      {/* Modal for invoice details */}
      {isModalOpen && modalInvoice && (
        <EnhancedInvoiceModal
          invoice={modalInvoice}
          onClose={() => {
            setIsModalOpen(false);
            setModalInvoice(null);
          }}
        />
      )}
    </div>
  )
}

// Place this component at the end of the file
const IdentifierSelectionModal = ({
  selectedProduct,
  availableIdentifiers,
  selectedIdentifiers,
  setSelectedIdentifiers,
  setShowIdentifierModal,
  setSelectedProductForIdentifier,
  setAvailableIdentifiers,
  setSelectedIdentifiersOuter,
  isLoadingIdentifiers,
  handleIdentifierSelection,
  selectedPriceType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Filter identifiers by search term
  const filteredIdentifiers = useMemo(() => {
    if (!searchTerm) return availableIdentifiers;
    return availableIdentifiers.filter((identifier) => {
      const value = identifier[selectedProduct.productIdentifierType] || "";
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, availableIdentifiers, selectedProduct.productIdentifierType]);

  // Handle single selection and add to cart
  const handleSingleSelection = useCallback((identifier) => {
    const identifierValue = identifier[selectedProduct.productIdentifierType];
    handleIdentifierSelection([identifierValue]); // Pass as array for compatibility
  }, [selectedProduct.productIdentifierType, handleIdentifierSelection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!filteredIdentifiers.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredIdentifiers.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredIdentifiers.length) % filteredIdentifiers.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredIdentifiers.length) % filteredIdentifiers.length);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredIdentifiers.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const identifier = filteredIdentifiers[highlightedIndex];
        if (identifier) {
          handleSingleSelection(identifier);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowIdentifierModal(false);
        setSelectedProductForIdentifier(null);
        setAvailableIdentifiers([]);
        setSelectedIdentifiersOuter([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredIdentifiers, highlightedIndex, handleSingleSelection, setShowIdentifierModal, setSelectedProductForIdentifier, setAvailableIdentifiers, setSelectedIdentifiersOuter]);

  // Reset highlight on search/filter change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm, filteredIdentifiers.length]);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto card-shadow fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            🔍 Select {selectedProduct.productIdentifierType.toUpperCase()} Number
          </h3>
          <button
            onClick={() => {
              setShowIdentifierModal(false);
              setSelectedProductForIdentifier(null);
              setAvailableIdentifiers([]);
              setSelectedIdentifiersOuter([]);
            }}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Product Details:</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Name:</strong> {selectedProduct.name}</p>
            <p><strong>SKU:</strong> {selectedProduct.sku || selectedProduct.id}</p>
            <p><strong>Barcode:</strong> {selectedProduct.barcode}</p>
            <p><strong>Category:</strong> {selectedProduct.category}</p>
            <p><strong>Price:</strong> Rs {selectedProduct[`${selectedPriceType}Price`].toFixed(2)}</p>
          </div>
        </div>
        <div className="mb-4">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${selectedProduct.productIdentifierType.toUpperCase()}...`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {isLoadingIdentifiers ? (
          <div className="flex justify-center py-8">
            <FastSpinner />
          </div>
        ) : (
          <>
            {filteredIdentifiers.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">
                    Available {selectedProduct.productIdentifierType.toUpperCase()} Numbers ({filteredIdentifiers.length})
                  </h4>
                  <div className="text-sm text-gray-600">
                    Click to select one item
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                  {filteredIdentifiers.map((identifier, index) => {
                    const identifierValue = identifier[selectedProduct.productIdentifierType];
                    const isHighlighted = index === highlightedIndex;
                    return (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 ${isHighlighted ? 'ring-2 ring-blue-400 bg-blue-50 border-blue-300' : 'border-gray-200'
                          }`}
                        onClick={() => handleSingleSelection(identifier)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{identifierValue}</div>
                          <div className="text-xs text-gray-500">
                            Added: {new Date(identifier.createdAt).toLocaleDateString()}
                          </div>
                          {identifier.purchaseId && (
                            <div className="text-xs text-gray-500">
                              Purchase: {identifier.purchaseId}
                            </div>
                          )}
                        </div>
                        {isHighlighted && <div className="ml-2 text-blue-400">⬅️</div>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowIdentifierModal(false);
                      setSelectedProductForIdentifier(null);
                      setAvailableIdentifiers([]);
                      setSelectedIdentifiersOuter([]);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <h4 className="text-lg font-medium text-gray-800 mb-2">No Available {selectedProduct.productIdentifierType.toUpperCase()} Numbers</h4>
                <p className="text-gray-600 mb-4">
                  All {selectedProduct.productIdentifierType} numbers for this product have been sold or are not available.
                </p>
                <button
                  onClick={() => {
                    setShowIdentifierModal(false);
                    setSelectedProductForIdentifier(null);
                    setAvailableIdentifiers([]);
                    setSelectedIdentifiersOuter([]);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const downloadInvoiceAsPDF = async (invoice, format = 'a4') => {
  if (!invoice) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: format === 'pos' ? [80, 297] : 'a4',
  });

  // Load logo image from public folder
  const logoUrl = "/images/logo.jpg";
  const logo = await new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });

  if (format === 'a4') {
    // --- Advanced A4 Layout ---
    let y = 15;
    // Header: Logo + Business Info (left), Invoice Info (right)
    if (logo) doc.addImage(logo, 'JPEG', 15, y, 25, 25);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('R-tech Solution', 45, y + 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Point of Sale System', 45, y + 16);
    doc.text('262 Peradeniya road, Kandy', 45, y + 21);
    doc.text('Phone: +94 11 123 4567', 45, y + 26);
    doc.text('Email: support@srilankapos.com', 45, y + 31);
    // Invoice Info (right)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 195, y + 10, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.id || 'Unknown'}`, 195, y + 16, { align: 'right' });
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 195, y + 21, { align: 'right' });
    doc.text(`Time: ${new Date(invoice.date).toLocaleTimeString()}`, 195, y + 26, { align: 'right' });
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(1);
    doc.line(15, y + 33, 195, y + 33);
    y += 38;

    // Customer Info
    if (invoice.customer) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 15, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.customer.name || '', 15, y);
      if (invoice.customer.company) { y += 5; doc.text(`🏢 ${invoice.customer.company}`, 15, y); }
      if (invoice.customer.phone) { y += 5; doc.text(`📞 ${invoice.customer.phone}`, 15, y); }
      if (invoice.customer.email) { y += 5; doc.text(`✉️ ${invoice.customer.email}`, 15, y); }
      y += 8;
    }

    // Items Table
    const tableColumn = ['Description', 'Qty', 'Rate', 'Amount'];
    const tableRows = invoice.items.map(item => [
      item.name + (item.identifierType && item.identifierValue ? `\n${item.identifierType}: ${item.identifierValue}` : ''),
      item.quantity.toString(),
      `Rs ${(item.discountedPrice || 0).toFixed(2)}`,
      `Rs ${((item.discountedPrice || 0) * (item.quantity || 0)).toFixed(2)}`
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto',
    });
    let finalY = doc.lastAutoTable.finalY || y + 20;

    // Summary Box
    const summaryX = 135;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.roundedRect(summaryX - 5, finalY + 2, 65, 28, 2, 2);
    doc.setFontSize(10);
    doc.text(`Subtotal: Rs ${(invoice.subtotal || 0).toFixed(2)}`, summaryX, finalY + 8);
    if (invoice.discountAmount > 0) {
      const discountPercentage = invoice.subtotal > 0 ? ((invoice.discountAmount / invoice.subtotal) * 100).toFixed(2) : 0;
      doc.text(`Discount (${discountPercentage}%): -Rs ${(invoice.discountAmount || 0).toFixed(2)}`, summaryX, finalY + 14);
      finalY += 6;
    }
    doc.text(`Tax: Rs ${(invoice.taxAmount || 0).toFixed(2)}`, summaryX, finalY + 14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: Rs ${(invoice.total || 0).toFixed(2)}`, summaryX, finalY + 22);
    doc.setFont('helvetica', 'normal');
    finalY += 30;

    // Payment Info
    doc.setFontSize(10);
    doc.text(`Payment Method: ${invoice.paymentMethod || 'Cash'}`, 15, finalY);
    doc.text(`Payment Status: ${invoice.paymentStatus || 'Paid'}`, 15, finalY + 5);
    doc.text(`Amount Paid: Rs ${(invoice.total || 0).toFixed(2)}`, 15, finalY + 10);
    finalY += 15;

    // Barcode
    try {
      const tempDiv = document.createElement('div');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      tempDiv.appendChild(svg);
      JsBarcode(svg, invoice.id || 'Unknown', {
        format: 'CODE128',
        width: 2,
        height: 30,
        displayValue: true,
        fontSize: 10,
      });
      const svgData = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(svgData)));
      const imageSrc = 'data:image/svg+xml;base64,' + svg64;
      doc.addImage(imageSrc, 'PNG', 70, finalY, 70, 20);
      finalY += 25;
    } catch (err) {
      doc.text(`Invoice ID: ${invoice.id || 'Unknown'}`, 15, finalY + 10);
      finalY += 10;
    }

    // Footer
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(15, finalY + 10, 195, finalY + 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', 105, finalY + 16, { align: 'center' });
    doc.text('Powered by R-tech Solution POS System', 105, finalY + 21, { align: 'center' });
    // Save
    doc.save(`invoice-${invoice.id || 'Unknown'}-a4.pdf`);
    return;
  }
  let y = 8;
  // Logo (small, centered)
  if (logo) doc.addImage(logo, 'JPEG', 25, y, 30, 12);
  y += 14;
  doc.setFontSize(11);
  doc.setFont('courier', 'bold');
  doc.text('R-TECH SOLUTION', 40, y, { align: 'center', maxWidth: 80 });
  y += 5;
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  doc.text('Point of Sale System', 40, y, { align: 'center', maxWidth: 80 });
  y += 4;
  doc.text('262 Peradeniya road, Kandy', 40, y, { align: 'center', maxWidth: 80 });
  y += 4;
  doc.text('Tel: +94 11 123 4567', 40, y, { align: 'center', maxWidth: 80 });
  y += 4;
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(5, y, 75, y);
  y += 3;
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text('RETAIL INVOICE', 40, y, { align: 'center', maxWidth: 80 });
  y += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(`Invoice: ${invoice.id}`, 8, y);
  y += 4;
  doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 8, y);
  y += 4;
  doc.text(`Time: ${new Date(invoice.date).toLocaleTimeString()}`, 8, y);
  y += 4;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(5, y, 75, y);
  y += 3;
  // Customer Info
  if (invoice.customer) {
    doc.setFont('courier', 'bold');
    doc.text('Customer:', 8, y);
    doc.setFont('courier', 'normal');
    y += 4;
    doc.text(`👤 ${invoice.customer.name}`, 8, y);
    if (invoice.customer.company) { y += 4; doc.text(`🏢 ${invoice.customer.company}`, 8, y); }
    if (invoice.customer.phone) { y += 4; doc.text(`📞 ${invoice.customer.phone}`, 8, y); }
    if (invoice.customer.email) { y += 4; doc.text(`✉️ ${invoice.customer.email}`, 8, y); }
    y += 2;
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(5, y, 75, y);
    y += 3;
  }
  // Items
  doc.setFont('courier', 'bold');
  doc.text('Item         Qty  Rate   Amt', 8, y);
  y += 4;
  doc.setFont('courier', 'normal');
  invoice.items.forEach(item => {
    let name = item.name.length > 12 ? item.name.slice(0, 12) + '.' : item.name;
    let qty = String(item.quantity).padStart(3, ' ');
    let rate = (item.discountedPrice || 0).toFixed(0).padStart(5, ' ');
    let amt = ((item.discountedPrice || 0) * (item.quantity || 0)).toFixed(0).padStart(6, ' ');
    doc.text(`${name.padEnd(12, ' ')} ${qty} ${rate} ${amt}`, 8, y);
    y += 4;
    if (item.identifierType && item.identifierValue) {
      doc.setFontSize(7);
      doc.text(`  ${item.identifierType}: ${item.identifierValue}`, 8, y);
      doc.setFontSize(8);
      y += 3;
    }
  });
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(5, y, 75, y);
  y += 3;
  // Summary
  doc.setFont('courier', 'bold');
  doc.text(`SubTotal: Rs ${(invoice.subtotal || 0).toFixed(2)}`, 8, y);
  y += 4;
  if (invoice.discountAmount > 0) {
    const discountPercentage = invoice.subtotal > 0 ? ((invoice.discountAmount / invoice.subtotal) * 100).toFixed(2) : 0;
    doc.text(`Discount (${discountPercentage}%): -Rs ${(invoice.discountAmount || 0).toFixed(2)}`, 8, y);
    y += 4;
  }
  doc.text(`Tax: Rs ${(invoice.taxAmount || 0).toFixed(2)}`, 8, y);
  y += 4;
  doc.text(`TOTAL: Rs ${(invoice.total || 0).toFixed(2)}`, 8, y);
  y += 5;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(5, y, 75, y);
  y += 3;
  // Payment Info
  doc.setFont('courier', 'normal');
  doc.text(`Payment: ${invoice.paymentMethod || 'Cash'}`, 8, y);
  y += 4;
  doc.text(`Paid: Rs ${(invoice.total || 0).toFixed(2)}`, 8, y);
  y += 4;
  doc.text(`Change: Rs 0.00`, 8, y);
  y += 4;
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(5, y, 75, y);
  y += 3;
  // Barcode
  try {
    const tempDiv = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tempDiv.appendChild(svg);
    JsBarcode(svg, invoice.id || 'Unknown', {
      format: 'CODE128',
      width: 1.5,
      height: 18,
      displayValue: true,
      fontSize: 8,
    });
    const svgData = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(svgData)));
    const imageSrc = 'data:image/svg+xml;base64,' + svg64;
    doc.addImage(imageSrc, 'PNG', 15, y, 50, 12);
    y += 14;
  } catch (err) {
    doc.text(`Invoice ID: ${invoice.id || 'Unknown'}`, 8, y);
    y += 4;
  }
  // Footer
  doc.setFont('courier', 'italic');
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 40, y, { align: 'center', maxWidth: 80 });
  y += 4;
  doc.text('Powered by R-tech Solution POS System', 40, y, { align: 'center', maxWidth: 80 });
  // Save
  doc.save(`invoice-${invoice.id || 'Unknown'}-pos.pdf`);
};


export default EnhancedBillingPOSSystem

