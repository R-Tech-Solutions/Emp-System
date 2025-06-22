import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import logoImage from './Assets/logo.jpg';
import pageImage from './Assets/page.png';
import { backEndURL } from '../../Backendurl';

const InvoiceA4 = ({ invoice }) => {
  const [fullInvoice, setFullInvoice] = useState(invoice);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [customerError, setCustomerError] = useState(null);

  // Fetch full invoice if only id/customerId is provided
  useEffect(() => {
    if (!invoice.items) {
      // Only id and customerId provided, fetch full invoice
      setIsLoadingInvoice(true);
      fetch(`${backEndURL}/api/invoices/${invoice.id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch invoice: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('A4Invoice: Fetched full invoice:', data);
          setFullInvoice(data);
          setIsLoadingInvoice(false);
        })
        .catch(error => {
          console.error('A4Invoice: Error fetching invoice:', error);
          setIsLoadingInvoice(false);
        });
    } else {
      setFullInvoice(invoice);
    }
  }, [invoice]);

  // Fetch customer details if not present
  useEffect(() => {
    if (!fullInvoice) return;
    
    console.log('A4Invoice: Processing customer data for invoice:', {
      id: fullInvoice.id,
      customerId: fullInvoice.customerId,
      hasCustomerArray: Array.isArray(fullInvoice.customer),
      customerArrayLength: fullInvoice.customer?.length || 0
    });

    // Try to get customer from array first
    let customerData = null;
    if (Array.isArray(fullInvoice.customer) && fullInvoice.customer.length > 0) {
      customerData = fullInvoice.customer[0];
      console.log('A4Invoice: Found customer data in array:', customerData);
    }
    
    if (customerData) {
      setCustomerDetails({
        name: customerData.customerName,
        phone: customerData.customerPhone,
        email: customerData.customerEmail,
        company: customerData.customerCompany
      });
      setIsLoadingCustomer(false);
      setCustomerError(null);
    } else if (fullInvoice.customerId) {
      // Fetch customer details from API
      console.log('A4Invoice: Fetching customer details from API for ID:', fullInvoice.customerId);
      setIsLoadingCustomer(true);
      setCustomerError(null);
      
      fetch(`${backEndURL}/api/contacts/${fullInvoice.customerId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Failed to fetch customer: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('A4Invoice: Fetched customer data from API:', data);
          setCustomerDetails({
            name: data.name,
            phone: data.phone,
            email: data.email,
            company: data.company
          });
          setIsLoadingCustomer(false);
          setCustomerError(null);
        })
        .catch(error => {
          console.error('A4Invoice: Error fetching customer details:', error);
          setCustomerError(error.message);
          setIsLoadingCustomer(false);
        });
    } else {
      console.log('A4Invoice: No customer ID found');
      setCustomerDetails(null);
      setIsLoadingCustomer(false);
      setCustomerError(null);
    }
  }, [fullInvoice]);

  if (!fullInvoice) return <div>Error: Invoice data is missing</div>;
  if (isLoadingInvoice) return <div>Loading invoice...</div>;

  console.log('A4Invoice received invoice:', {
    id: fullInvoice.id,
    customerId: fullInvoice.customerId,
    customer: fullInvoice.customer,
    customerName: fullInvoice.customerName,
    customerPhone: fullInvoice.customerPhone,
    customerEmail: fullInvoice.customerEmail,
    customerDetails: customerDetails,
    customerError: customerError
  });

  let barcodeDataUrl = '';

  const safeInvoice = {
    id: fullInvoice.id || 'Unknown',
    date: fullInvoice.date || new Date(),
    customerId: fullInvoice.customerId || null,
    items: fullInvoice.items || [],
    subtotal: fullInvoice.subtotal || 0,
    discountAmount: fullInvoice.discountAmount || 0,
    taxAmount: fullInvoice.taxAmount || 0,
    total: fullInvoice.total || 0,
    paymentMethod: fullInvoice.paymentMethod || 'Cash',
    paymentStatus: fullInvoice.paymentStatus || 'Paid',
    notes: fullInvoice.notes || 'Thank you for your purchase.',
    terms: Array.isArray(fullInvoice.terms) ? fullInvoice.terms : [fullInvoice.terms || 'Goods once sold will not be refunded.'],
    amountPaid: fullInvoice.amountPaid !== undefined ? fullInvoice.amountPaid : fullInvoice.total,
    changeDue: fullInvoice.changeDue !== undefined ? fullInvoice.changeDue : 0
  };

  console.log('A4invoice safeInvoice:', {
    customerId: safeInvoice.customerId
  });

  if (safeInvoice.id) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, safeInvoice.id, {
      format: "CODE128",
      width: 1.4,
      height: 40,
      displayValue: true,
      fontSize: 12,
      margin: 0
    });
    barcodeDataUrl = canvas.toDataURL('image/png');
  }

  const discountPercentage = safeInvoice.subtotal > 0
    ? ((safeInvoice.discountAmount / safeInvoice.subtotal) * 100).toFixed(2)
    : 0;

  const customerId = safeInvoice.customerId;
  
  console.log('A4invoice final customerId:', customerId);

  return (
    <div style={{
      position: 'relative',
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '20mm',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#1f2937',
      fontSize: '13px',
    }}>
      {/* Background image container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${pageImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        opacity: 0.2,
        zIndex: -1,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}></div>

      {/* Print-specific styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        @media print {
          body, html, #root {
            height: 100%;
            width: 100%;
          }
          .invoice-background {
            display: block !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #3b82f6',
        paddingBottom: '12px',
        marginBottom: '18px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src={logoImage}
            alt="Logo" 
            style={{ 
              height: '60px', 
              marginRight: '12px',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact'
            }} 
          />
          <div>
            <h1 style={{ margin: 0, color: '#1d4ed8', fontSize: '20px' }}>Business Name</h1>
            <p>123 Main Street, City</p>
            <p>contact@example.com | www.example.com</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0 }}>INVOICE</h2>
          <p>Invoice #: {safeInvoice.id}</p>
          <p>{new Date(safeInvoice.date).toLocaleString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
      }}>
        <h3>Bill To</h3>
        {isLoadingCustomer ? (
          <p>Loading customer details...</p>
        ) : customerError ? (
          <div>
            <p><strong>Customer ID: {customerId}</strong></p>
            <p style={{ color: 'red', fontSize: '12px' }}>Error loading customer details: {customerError}</p>
          </div>
        ) : customerDetails ? (
          <div>
            <p><strong>Name: {customerDetails.name}</strong></p>
            {customerDetails.company && <p><strong>Company: {customerDetails.company}</strong></p>}
            {customerDetails.email && <p><strong>Email: {customerDetails.email}</strong></p>}
            {customerDetails.phone && <p><strong>Phone: {customerDetails.phone}</strong></p>}
          </div>
        ) : customerId ? (
          <p><strong>Customer ID: {customerId}</strong></p>
        ) : (
          <p><strong>No Customer Selected</strong></p>
        )}
      </div>

      {/* Items */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
      }}>
        <h3>Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', textAlign: 'left' }}>Description</th>
              <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', textAlign: 'left' }}>Qty</th>
              <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', textAlign: 'left' }}>Rate</th>
              <th style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px', textAlign: 'left' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {safeInvoice.items.map((item, idx) => {
              const hasDiscount = item.discountAmount > 0;
              const discountPercent = hasDiscount ? ((item.discountAmount / item.originalPrice) * 100).toFixed(2) : 0;
              return (
                <tr key={idx}>
                  <td style={{ borderTop: '1px solid #e5e7eb', padding: '8px' }}>{item.name || 'Item'}</td>
                  <td style={{ borderTop: '1px solid #e5e7eb', padding: '8px' }}>{item.quantity}</td>
                  <td style={{ borderTop: '1px solid #e5e7eb', padding: '8px' }}>
                    {hasDiscount ? (
                      <>
                        <div style={{ textDecoration: 'line-through' }}>Rs {item.originalPrice?.toFixed(2)}</div>
                        <div style={{ color: 'red' }}>Rs {item.discountedPrice?.toFixed(2)} ({discountPercent}%)</div>
                      </>
                    ) : (
                      `Rs ${item.discountedPrice?.toFixed(2)}`
                    )}
                  </td>
                  <td style={{ borderTop: '1px solid #e5e7eb', padding: '8px' }}>Rs {(item.discountedPrice * item.quantity).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals + Payment */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h3>Payment Info</h3>
          <p>Method: {safeInvoice.paymentMethod}</p>
          <p>Status: {safeInvoice.paymentStatus}</p>
          <p>Paid: Rs {safeInvoice.amountPaid.toFixed(2)}</p>
          <p>Change: Rs {safeInvoice.changeDue.toFixed(2)}</p>
        </div>

        <div style={{ flex: 1, minWidth: '260px', textAlign: 'right' }}>
          <p>Subtotal: Rs {safeInvoice.subtotal.toFixed(2)}</p>
          {safeInvoice.discountAmount > 0 && (
            <p style={{ color: 'red' }}>
              Discount: Rs -{safeInvoice.discountAmount.toFixed(2)} ({discountPercentage}%)
            </p>
          )}
          <p>Tax: Rs {safeInvoice.taxAmount.toFixed(2)}</p>
          <h3>Total: Rs {safeInvoice.total.toFixed(2)}</h3>
        </div>
      </div>

      {/* Notes + Terms */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dbeafe',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h3>Notes</h3>
          <p>{safeInvoice.notes}</p>
        </div>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <h3>Terms & Conditions</h3>
          <ul>
            {safeInvoice.terms.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barcode */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {barcodeDataUrl && <img src={barcodeDataUrl} alt="Barcode" />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#6b7280', marginTop: '20px' }}>
        <p>Thank you for your business!</p>
        <p>This invoice is system-generated and does not require a signature.</p>
      </div>
    </div>
  );
};

export default InvoiceA4;