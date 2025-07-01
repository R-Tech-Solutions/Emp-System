import React, { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";
import { backEndURL } from "../../Backendurl";
import '../../styles/print.css'; // Adjust path as needed
import { QRCodeCanvas } from 'qrcode.react';


const COMPANY = {
  name: "RTechSolution",
  email: "support@rtechsolution.com",
  phone: "+94 76 000 0000"
};

const fetchInvoice = async (invoiceDocumentId) => {
  if (!invoiceDocumentId) return null;
  try {
    const res = await fetch(`${backEndURL}/api/invoices/${invoiceDocumentId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const AdvanceThermalInvoice = ({ invoice: invoiceProp, invoiceDocumentId }) => {
  const [invoice, setInvoice] = useState(invoiceProp);
  const printRef = useRef();

  useEffect(() => {
    if (!invoiceProp && invoiceDocumentId) {
      fetchInvoice(invoiceDocumentId).then(invoiceData => {
        setInvoice(invoiceData);
      });
    }
  }, [invoiceDocumentId, invoiceProp]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'height=800,width=400');
      win.document.write('<html><head><title>Receipt</title>');
      win.document.write('<style>');
      win.document.write(`
        body, html {
  width: 80mm;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        ul { margin: 4px 0; padding-left: 16px; }
      `);
      win.document.write('</style></head><body>');
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  // Helper for receipt code
  const getReceiptCode = () => {
    const id = invoice.invoiceNumber || invoice.id || '';
    return id ? String(id).slice(-6).toUpperCase() : '';
  };
  // Helper for paid/unpaid
  const isPaid = Number(invoice.total) <= Number(invoice.amountPaid);
  // Timestamp
  const printedOn = new Date().toLocaleString();

  const invoiceId = invoice ? (invoice.invoiceNumber || invoice.id || '') : '';
  let barcodeDataUrl = '';
  if (invoiceId) {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, invoiceId, {
        format: "CODE128",
        width: 1.5,
        height: 50,
        displayValue: false,
        margin: 5
      });
      barcodeDataUrl = canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Barcode error:', e);
      barcodeDataUrl = '';
    }
  }

  if (!invoice) return <div>Loading receipt...</div>;
  const cust = (Array.isArray(invoice.customer) && invoice.customer.length > 0) ? invoice.customer[0] : (invoice.customer || {});

  // Debug logs for diagnosis
  console.log('Invoice:', invoice);
  console.log('InvoiceId:', invoiceId);
  console.log('BarcodeDataUrl:', barcodeDataUrl);

  return (
    <div>
      {/* FRONT PAGE: Invoice */}
      <div
        ref={printRef}
        className="thermal-receipt"
        style={{
          width: '80mm',
          margin: '0 auto',
          padding: '0',
          fontFamily: 'monospace',
          fontSize: '11.5px',
          background: '#fff',
          color: '#111',
          border: 'none',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '22px', marginBottom: '4px', letterSpacing: '1.5px', color: '#000' }}>
          {COMPANY.name.toUpperCase()}
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '3px', color: '#222', fontWeight: 600 }}>
          {COMPANY.phone}
        </div>
        <div style={{ textAlign: 'center', fontSize: '14px', marginBottom: '6px', color: '#222', fontWeight: 600 }}>
          {COMPANY.email}
        </div>

        <div style={{ borderBottom: '1px dashed #bbb', margin: '6px 0' }} />
        {/* PAID/UNPAID Stamp */}
        <div style={{ textAlign: 'center', margin: '4px 0' }}>
          <span style={{ display: 'inline-block', border: '2px solid #111', borderRadius: '3px', padding: '1px 8px', fontWeight: 900, fontSize: '12px', letterSpacing: '2px', color: isPaid ? '#111' : '#fff', background: isPaid ? '#fff' : '#111' }}>{isPaid ? 'PAID' : 'UNPAID'}</span>
        </div>
        {/* Section: Customer Info */}
        <div style={{ fontWeight: 700, fontSize: '11px', margin: '4px 0 1px 0', color: '#111', letterSpacing: '1px' }}>CUSTOMER INFO</div>
        <div style={{ color: '#222' }}><b>Name:</b> {cust.customerName || ''}</div>
        {cust.customerPhone && <div style={{ color: '#222' }}><b>Phone:</b> {cust.customerPhone}</div>}
        <div style={{ color: '#222' }}><b>Invoice No:</b> {invoice.invoiceNumber || invoice.id || ''}</div>
        <div style={{ color: '#222' }}><b>Date:</b> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : ''}</div>
        <div style={{ borderBottom: '1px dashed #bbb', margin: '6px 0' }} />
        {/* Section: Items */}
        <div style={{ fontWeight: 700, fontSize: '11px', margin: '4px 0 1px 0', color: '#111', letterSpacing: '1px' }}>ITEMS</div>
        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: 0 }}>
          <thead>
            <tr style={{ color: '#111', fontWeight: 700, borderBottom: '1px solid #bbb', background: '#fff' }}>
              <td style={{ borderBottom: '1px solid #bbb' }}>Item</td>
              <td style={{ textAlign: 'right', borderBottom: '1px solid #bbb' }}>Qty</td>
              <td style={{ textAlign: 'right', borderBottom: '1px solid #bbb' }}>Price</td>
              <td style={{ textAlign: 'right', borderBottom: '1px solid #bbb' }}>Total</td>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => {
              const discounted = item.discountAmount && item.discountAmount > 0;
              const origTotal = (item.price || 0) * (item.quantity || 0);
              const discTotal = ((item.discountedPrice || item.price) * item.quantity);
              return (
                <React.Fragment key={idx}>
                  <tr style={{ background: '#fff' }}>
                    <td style={{ width: '44%', textAlign: 'left', paddingLeft: 0 }}>{item.name || ''}</td>
                    <td style={{ width: '14%', textAlign: 'right', paddingRight: 0 }}>{item.quantity || 0}</td>
                    <td style={{ width: '21%', textAlign: 'right', paddingRight: 0 }}>
                      {discounted ? (
                        <span>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 1 }}>{(item.price || 0).toFixed(2)}</span>
                          <span style={{ color: '#111', fontWeight: 700 }}>{((item.price - item.discountAmount) || 0).toFixed(2)}</span>
                        </span>
                      ) : (
                        <span>{(item.price || 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td style={{ width: '21%', textAlign: 'right', fontWeight: 500, paddingRight: 0 }}>
                      {discounted ? (
                        <span>
                          <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 1 }}>{origTotal.toFixed(2)}</span>
                          <span style={{ color: '#111', fontWeight: 700 }}>{discTotal.toFixed(2)}</span>
                        </span>
                      ) : (
                        <span>{origTotal.toFixed(2)}</span>
                      )}
                    </td>
                  </tr>
                  {item.identifierType && item.identifierValue && (
                    <tr>
                      <td colSpan={4} style={{ fontSize: '9px', color: '#555', paddingLeft: 0 }}>
                        {item.identifierType.toUpperCase()} - {item.identifierValue}
                      </td>
                    </tr>
                  )}
                  {discounted ? (
                    <tr>
                      <td></td>
                      <td colSpan={2} style={{ color: '#111', fontSize: '9px', textAlign: 'right', fontWeight: 700 }}>Discount:</td>
                      <td style={{ textAlign: 'right', color: '#111', fontSize: '9px', fontWeight: 700 }}>- {(item.discountAmount).toFixed(2)}</td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        <div style={{ borderBottom: '1px dashed #bbb', margin: '6px 0' }} />
        {/* Section: Summary */}
        <div style={{ fontWeight: 700, fontSize: '11px', margin: '4px 0 1px 0', color: '#111', letterSpacing: '1px' }}>SUMMARY</div>
        <div style={{ border: '1px solid #bbb', borderRadius: '3px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span style={{ textAlign: 'right', minWidth: 40 }}>{(invoice.subtotal || 0).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span style={{ textAlign: 'right', minWidth: 40 }}>{(invoice.taxAmount || 0).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Discount</span><span style={{ textAlign: 'right', minWidth: 40 }}>-{(invoice.discountAmount || 0).toFixed(2)}</span></div>
          <div style={{ borderBottom: '1px dashed #bbb', margin: '2px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '12px', background: '#fff', color: '#111' }}><span>Total</span><span style={{ textAlign: 'right', minWidth: 40 }}>{(invoice.total || 0).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Paid</span><span style={{ textAlign: 'right', minWidth: 40 }}>{(invoice.amountPaid || 0).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Change</span><span style={{ textAlign: 'right', minWidth: 40 }}>{(invoice.changeDue || 0).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Payment</span><span style={{ textAlign: 'right', minWidth: 40 }}>{invoice.paymentMethod || ''}</span></div>
        </div>
        <div style={{ borderBottom: '1px dashed #bbb', margin: '6px 0' }} />
        {/* Notes */}
        <div style={{ fontSize: '10px', color: '#444' }}>
          <div><b>NOTES:</b> This is a computer-generated receipt.</div>
          <div><b>TERMS & CONDITIONS:</b></div>
          <ul style={{ margin: 0, paddingLeft: 12 }}>
            <li>Items once sold are not returnable.</li>
            <li>Warranty as per manufacturer policy.</li>
          </ul>
        </div>
        <div style={{ borderBottom: '1px dashed #bbb', margin: '6px 0' }} />
        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 900, margin: '6px 0', color: '#111', letterSpacing: '1px' }}>THANK YOU FOR YOUR PURCHASE!</div>
        <div style={{ textAlign: 'center', fontSize: '11px', color: '#222' }}>Visit again.</div>
        <div style={{ textAlign: 'center', fontSize: '10px', color: '#444' }}>Powered by RTechSolution</div>
        {/* Barcode Section (dynamic) */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          {barcodeDataUrl && (
            <img src={barcodeDataUrl} alt={`Barcode for invoice ${invoice.invoiceNumber}`} style={{ display: 'block', margin: '0 auto', height: 40 }} />
          )}
          <div style={{ fontSize: '9px', color: '#111', marginTop: '1px', letterSpacing: '1px' }}>{invoice.invoiceNumber}</div>
          <div style={{ fontSize: '9px', color: '#888', marginTop: '1px' }}>Scan to verify</div>
        </div>
        {/* Receipt code and printed timestamp */}
        <div style={{ borderTop: '1px dashed #bbb', margin: '6px 0 0 0', paddingTop: '3px', fontSize: '9px', color: '#888', textAlign: 'center' }}>
          Receipt Code: <b>{getReceiptCode()}</b> <br />
          Printed on: {printedOn}
        </div>
      </div>
    </div>
  );
};

export default AdvanceThermalInvoice;
