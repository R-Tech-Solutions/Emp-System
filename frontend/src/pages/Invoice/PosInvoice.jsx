import React, { useState, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { backEndURL } from '../../Backendurl';

const ThermalReceipt = ({ invoice }) => {
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
          console.log('PosInvoice: Fetched full invoice:', data);
          setFullInvoice(data);
          setIsLoadingInvoice(false);
        })
        .catch(error => {
          console.error('PosInvoice: Error fetching invoice:', error);
          setIsLoadingInvoice(false);
        });
    } else {
      setFullInvoice(invoice);
    }
  }, [invoice]);

  // Fetch customer details if not present
  useEffect(() => {
    if (!fullInvoice) return;
    
    console.log('PosInvoice: Processing customer data for invoice:', {
      id: fullInvoice.id,
      customerId: fullInvoice.customerId,
      hasCustomerArray: Array.isArray(fullInvoice.customer),
      customerArrayLength: fullInvoice.customer?.length || 0
    });

    // Try to get customer from array first
    let customerData = null;
    if (Array.isArray(fullInvoice.customer) && fullInvoice.customer.length > 0) {
      customerData = fullInvoice.customer[0];
      console.log('PosInvoice: Found customer data in array:', customerData);
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
      console.log('PosInvoice: Fetching customer details from API for ID:', fullInvoice.customerId);
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
          console.log('PosInvoice: Fetched customer data from API:', data);
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
          console.error('PosInvoice: Error fetching customer details:', error);
          setCustomerError(error.message);
          setIsLoadingCustomer(false);
        });
    } else {
      console.log('PosInvoice: No customer ID found');
      setCustomerDetails(null);
      setIsLoadingCustomer(false);
      setCustomerError(null);
    }
  }, [fullInvoice]);

  if (!fullInvoice) return <div>Error: Invoice data is missing</div>;
  if (isLoadingInvoice) return <div>Loading invoice...</div>;

  console.log('PosInvoice received invoice:', {
    id: fullInvoice.id,
    customerId: fullInvoice.customerId,
    customer: fullInvoice.customer,
    customerName: fullInvoice.customerName,
    customerPhone: fullInvoice.customerPhone,
    customerEmail: fullInvoice.customerEmail,
    customerDetails: customerDetails,
    customerError: customerError
  });

  // Define safeInvoice with default values
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
    notes: fullInvoice.notes || 'Thank you for your purchase. Please keep this invoice for your records.',
    terms: fullInvoice.terms || 'Goods once sold will not be refunded. Please verify the items before leaving. For any issues, contact us within 3 days.'
  };

  console.log('PosInvoice safeInvoice:', {
    customerId: safeInvoice.customerId
  });

  // Generate barcode as data URL
  let barcodeDataUrl = '';
  if (fullInvoice.id) {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, fullInvoice.id || 'Unknown', {
      format: "CODE128",
      width: 1.5,
      height: 50,
      displayValue: true,
      fontSize: 10,
      margin: 5
    });
    barcodeDataUrl = canvas.toDataURL('image/png');
  }

  const discountPercentage = fullInvoice.subtotal > 0
    ? ((fullInvoice.discountAmount / fullInvoice.subtotal) * 100).toFixed(2)
    : 0;

  return (
    <div className="pos-invoice" style={{ fontFamily: "'Courier New', monospace", textAlign: 'center', lineHeight: 1.4 }}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>R-TECH SOLUTION</h2>
        <p style={{ margin: '2px 0', fontSize: 10 }}>Point of Sale System</p>
        <p style={{ margin: '1px 0', fontSize: 9 }}>262 Peradeniya road, Kandy</p>
        <p style={{ margin: '1px 0', fontSize: 9 }}>Tel: +94 11 123 4567</p>
      </div>

      <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />

      <div style={{ margin: '8px 0' }}>
        <p style={{ margin: '1px 0', fontSize: 10 }}><strong>RETAIL INVOICE</strong></p>
        <p style={{ margin: '1px 0', fontSize: 9 }}>Invoice: {fullInvoice.id}</p>
        <p style={{ margin: '1px 0', fontSize: 9 }}>Date: {new Date(fullInvoice.date).toLocaleDateString()}</p>
        <p style={{ margin: '1px 0', fontSize: 9 }}>Time: {new Date(fullInvoice.date).toLocaleTimeString()}</p>
      </div>

      {fullInvoice.customerId && (
        <>
          <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />
          <div style={{ textAlign: 'left', margin: '8px 0' }}>
            <p style={{ margin: '1px 0', fontSize: 9 }}><strong>Customer:</strong></p>
            {isLoadingCustomer ? (
              <p style={{ margin: '1px 0', fontSize: 9 }}>Loading customer details...</p>
            ) : customerError ? (
              <>
                <p style={{ margin: '1px 0', fontSize: 9 }}>👤 Customer ID: {fullInvoice.customerId}</p>
                <p style={{ margin: '1px 0', fontSize: 8, color: 'red' }}>Error: {customerError}</p>
              </>
            ) : customerDetails ? (
              <>
                <p style={{ margin: '1px 0', fontSize: 9 }}>👤 Name: {customerDetails.name}</p>
                {customerDetails.company && <p style={{ margin: '1px 0', fontSize: 9 }}>🏢 Company: {customerDetails.company}</p>}
                {customerDetails.email && <p style={{ margin: '1px 0', fontSize: 9 }}>✉️ Email: {customerDetails.email}</p>}
                {customerDetails.phone && <p style={{ margin: '1px 0', fontSize: 9 }}>📞 Phone: {customerDetails.phone}</p>}
              </>
            ) : (
              <p style={{ margin: '1px 0', fontSize: 9 }}>👤 Customer ID: {fullInvoice.customerId}</p>
            )}
          </div>
        </>
      )}
      
      {!fullInvoice.customerId && (
        <>
          <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />
          <div style={{ textAlign: 'left', margin: '8px 0' }}>
            <p style={{ margin: '1px 0', fontSize: 9 }}><strong>Customer:</strong></p>
            <p style={{ margin: '1px 0', fontSize: 9 }}>👤 No Customer Selected</p>
          </div>
        </>
      )}

      <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />

      <div style={{ textAlign: 'left', margin: '8px 0' }}>
        {fullInvoice.items.map((item, index) => {
          const hasDiscount = item.discountAmount > 0;
          const discountPercent = hasDiscount
            ? ((item.discountAmount / item.originalPrice) * 100).toFixed(2)
            : 0;
          return (
            <div key={index} style={{ marginBottom: 6 }}>
              <p style={{ margin: '1px 0', fontSize: 9, fontWeight: 'bold' }}>{item.name}</p>
              {item.identifier && (
                <p style={{ margin: '1px 0', fontSize: 8, color: '#666' }}>
                  {item.identifierType}: {item.identifierValue}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                <span>
                  {item.quantity} x{' '}
                  {hasDiscount ? (
                    <>
                      <span style={{ textDecoration: 'line-through' }}>
                        Rs {item.originalPrice.toFixed(2)}
                      </span>{' '}
                      <span style={{ color: '#dc2626' }}>
                        -{item.discountAmount.toFixed(2)} ({discountPercent}%)
                      </span>{' '}
                      Rs {item.discountedPrice.toFixed(2)}
                    </>
                  ) : (
                    `Rs ${item.discountedPrice.toFixed(2)}`
                  )}
                </span>
                <span>Rs {(item.discountedPrice * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />

      <div style={{ textAlign: 'right', fontSize: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Sub Total:</span>
          <span>Rs {fullInvoice.subtotal.toFixed(2)}</span>
        </div>
        {fullInvoice.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
            <span>Discount ({discountPercentage}%):</span>
            <span>-Rs {fullInvoice.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
          <span>Tax:</span>
          <span>Rs {fullInvoice.taxAmount.toFixed(2)}</span>
        </div>
        <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '2px 0',
          fontWeight: 'bold',
          fontSize: 10
        }}>
          <span>TOTAL:</span>
          <span>Rs {fullInvoice.total.toFixed(2)}</span>
        </div>
      </div>

      <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />

      <div style={{ textAlign: 'center', fontSize: 9, margin: '8px 0' }}>
        <p style={{ margin: '1px 0' }}>Payment: {fullInvoice.paymentMethod || 'Cash'}</p>
        <p style={{ margin: '1px 0' }}>Cash Tendered: Rs {(fullInvoice.amountPaid !== undefined ? fullInvoice.amountPaid : fullInvoice.total).toFixed(2)}</p>
        <p style={{ margin: '1px 0' }}>Change: Rs {(fullInvoice.changeDue !== undefined ? fullInvoice.changeDue : 0).toFixed(2)}</p>
      </div>

      
      <div className="section">
        <h3>Notes</h3>
        <p>{safeInvoice.notes}</p>
      </div>

      <div className="section">
        <h3>Terms & Conditions</h3>
        <p>{safeInvoice.terms}</p>
      </div>

      <hr style={{ borderStyle: 'dashed', borderColor: '#333' }} />

      <div style={{ textAlign: 'center', fontSize: 8, margin: '8px 0' }}>
        <p style={{ margin: '2px 0' }}>Thank you for your business!</p>
        <p style={{ margin: '2px 0' }}>Please come again</p>
        <p style={{ margin: '2px 0' }}>Powered by R-tech Solution</p>
        <div style={{ marginTop: 10 }}>
          {barcodeDataUrl && (
            <img src={barcodeDataUrl} alt={`Barcode for invoice ${fullInvoice.id}`} style={{ display: 'block', margin: '0 auto', height: 50 }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
