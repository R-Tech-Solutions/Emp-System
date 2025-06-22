import React, { useEffect, useState, useRef } from "react";
import JsBarcode from "jsbarcode";

const COMPANY = {
  name: "RTechSolution",
  email: "support@rtechsolution.com",
  phone: "+94 76 000 0000"
};

const fetchInvoice = async (invoiceDocumentId) => {
  if (!invoiceDocumentId) return null;
  try {
    const res = await fetch(`http://localhost:3001/api/invoices/${invoiceDocumentId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const AdvanceThermalInvoice = ({ invoice: invoiceProp, invoiceDocumentId }) => {
  const [invoice, setInvoice] = useState(invoiceProp);
  const printRef = useRef();
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (invoice && barcodeRef.current) {
      const invoiceId = invoice.invoiceNumber || invoice.id || '';
      if (invoiceId) {
        requestAnimationFrame(() => {
          JsBarcode(barcodeRef.current, invoiceId, {
            format: "CODE128",
            width: 1.2,
            height: 40,
            displayValue: false,
            margin: 0
          });
        });
      }
    }
  }, [invoice]);

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
        body { font-family: monospace; font-size: 11px; padding: 0; margin: 0; width: 80mm; }
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

  if (!invoice) return <div>Loading receipt...</div>;
  const cust = (Array.isArray(invoice.customer) && invoice.customer.length > 0) ? invoice.customer[0] : (invoice.customer || {});

  return (
    <div ref={printRef} style={{ width: '80mm', margin: '0 auto', background: '#fff', padding: '14px 10px', color: '#111', fontFamily: 'monospace', fontSize: '11.5px', borderRadius: '6px', boxShadow: 'none', border: '1px solid #eee' }}>
      {/* Logo (centered, grayscale) */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <img src="/images/logo1.jpg" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', filter: 'grayscale(100%) contrast(120%)', margin: '0 auto' }} />
      </div>
      {/* Store Name */}
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '16px', marginBottom: '2px', letterSpacing: '1.2px', color: '#111' }}>{COMPANY.name.toUpperCase()}</div>
      <div style={{ textAlign: 'center', fontSize: '10.5px', marginBottom: '2px', color: '#444' }}>{COMPANY.phone}</div>
      <div style={{ textAlign: 'center', fontSize: '10.5px', marginBottom: '2px', color: '#444' }}>{COMPANY.email}</div>
      <div style={{ borderBottom: '1px dashed #bbb', margin: '10px 0' }} />

      {/* PAID/UNPAID Stamp */}
      <div style={{ textAlign: 'center', margin: '6px 0' }}>
        <span style={{ display: 'inline-block', border: '2px solid #111', borderRadius: '3px', padding: '2px 12px', fontWeight: 900, fontSize: '13px', letterSpacing: '2px', color: isPaid ? '#111' : '#fff', background: isPaid ? '#fff' : '#111' }}>{isPaid ? 'PAID' : 'UNPAID'}</span>
      </div>

      {/* Section: Customer Info */}
      <div style={{ fontWeight: 700, fontSize: '11.5px', margin: '8px 0 2px 0', color: '#111', letterSpacing: '1px' }}>CUSTOMER INFO</div>
      <div style={{ marginBottom: '2px', color: '#222' }}><b>Name:</b> {cust.customerName || ''}</div>
      {cust.customerPhone && <div style={{ marginBottom: '2px', color: '#222' }}><b>Phone:</b> {cust.customerPhone}</div>}
      <div style={{ marginBottom: '2px', color: '#222' }}><b>Invoice No:</b> {invoice.invoiceNumber || invoice.id || ''}</div>
      <div style={{ marginBottom: '2px', color: '#222' }}><b>Date:</b> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : ''}</div>
      <div style={{ borderBottom: '1px dashed #bbb', margin: '10px 0' }} />

      {/* Section: Items */}
      <div style={{ fontWeight: 700, fontSize: '11.5px', margin: '8px 0 2px 0', color: '#111', letterSpacing: '1px' }}>ITEMS</div>
      <table style={{ width: '100%', fontSize: '11.5px', borderCollapse: 'collapse', marginBottom: 2 }}>
        <thead>
          <tr style={{ color: '#111', fontWeight: 700, borderBottom: '1px solid #bbb', background: '#fff' }}>
            <td style={{ padding: '2px 0', borderBottom: '1px solid #bbb' }}>Item</td>
            <td style={{ textAlign: 'right', padding: '2px 0', borderBottom: '1px solid #bbb' }}>Qty</td>
            <td style={{ textAlign: 'right', padding: '2px 0', borderBottom: '1px solid #bbb' }}>Price</td>
            <td style={{ textAlign: 'right', padding: '2px 0', borderBottom: '1px solid #bbb' }}>Total</td>
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
                  <td style={{ width: '44%' }}>{item.name || ''}</td>
                  <td style={{ width: '14%', textAlign: 'right' }}>{item.quantity || 0}</td>
                  <td style={{ width: '21%', textAlign: 'right' }}>
                    {discounted ? (
                      <span>
                        <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 2 }}>{(item.price || 0).toFixed(2)}</span>
                        <span style={{ color: '#111', fontWeight: 700 }}>{((item.price - item.discountAmount) || 0).toFixed(2)}</span>
                      </span>
                    ) : (
                      <span>{(item.price || 0).toFixed(2)}</span>
                    )}
                  </td>
                  <td style={{ width: '21%', textAlign: 'right', fontWeight: 500 }}>
                    {discounted ? (
                      <span>
                        <span style={{ textDecoration: 'line-through', color: '#888', marginRight: 2 }}>{origTotal.toFixed(2)}</span>
                        <span style={{ color: '#111', fontWeight: 700 }}>{discTotal.toFixed(2)}</span>
                      </span>
                    ) : (
                      <span>{origTotal.toFixed(2)}</span>
                    )}
                  </td>
                </tr>
                {item.identifierType && item.identifierValue && (
                  <tr>
                    <td colSpan={4} style={{ fontSize: '10px', color: '#555', paddingLeft: '8px', paddingBottom: 2 }}>
                      {item.identifierType.toUpperCase()} - {item.identifierValue}
                    </td>
                  </tr>
                )}
                {discounted ? (
                  <tr>
                    <td></td>
                    <td colSpan={2} style={{ color: '#111', fontSize: '10px', textAlign: 'right', fontWeight: 700 }}>Discount:</td>
                    <td style={{ textAlign: 'right', color: '#111', fontSize: '10px', fontWeight: 700 }}>- {(item.discountAmount).toFixed(2)}</td>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <div style={{ borderBottom: '1px dashed #bbb', margin: '10px 0' }} />

      {/* Section: Summary */}
      <div style={{ fontWeight: 700, fontSize: '11.5px', margin: '8px 0 2px 0', color: '#111', letterSpacing: '1px' }}>SUMMARY</div>
      <div style={{ margin: '10px 0', padding: '7px 10px', border: '1px solid #bbb', borderRadius: '4px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Subtotal</span><span style={{ textAlign: 'right', minWidth: 50 }}>{(invoice.subtotal || 0).toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Tax</span><span style={{ textAlign: 'right', minWidth: 50 }}>{(invoice.taxAmount || 0).toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span>Discount</span><span style={{ textAlign: 'right', minWidth: 50 }}>-{(invoice.discountAmount || 0).toFixed(2)}</span></div>
        <div style={{ borderBottom: '1px dashed #bbb', margin: '4px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '13px', background: '#fff', padding: '2px 0', borderRadius: '2px', color: '#111' }}><span>Total</span><span style={{ textAlign: 'right', minWidth: 50 }}>{(invoice.total || 0).toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}><span>Paid</span><span style={{ textAlign: 'right', minWidth: 50 }}>{(invoice.amountPaid || 0).toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}><span>Change</span><span style={{ textAlign: 'right', minWidth: 50 }}>{(invoice.changeDue || 0).toFixed(2)}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}><span>Payment</span><span style={{ textAlign: 'right', minWidth: 50 }}>{invoice.paymentMethod || ''}</span></div>
      </div>
      <div style={{ borderBottom: '1px dashed #bbb', margin: '10px 0' }} />

      {/* Notes */}
      <div style={{ fontSize: '10.5px', marginBottom: '4px', color: '#444' }}>
        <div><b>NOTES:</b> This is a computer-generated receipt.</div>
        <div style={{ marginTop: 4 }}><b>TERMS & CONDITIONS:</b></div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>Items once sold are not returnable.</li>
          <li>Warranty as per manufacturer policy.</li>
        </ul>
      </div>
      <div style={{ borderBottom: '1px dashed #bbb', margin: '10px 0' }} />

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 900, margin: '10px 0', color: '#111', letterSpacing: '1px' }}>THANK YOU FOR YOUR PURCHASE!</div>
      <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#222' }}>Visit again.</div>
      <div style={{ textAlign: 'center', fontSize: '10.5px', marginTop: 4, color: '#444' }}>Powered by RTechSolution</div>

      {/* Barcode Section (dynamic) */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <canvas ref={barcodeRef}></canvas>
        <div style={{ fontSize: '10px', color: '#111', marginTop: '2px', letterSpacing: '1px' }}>{invoice.invoiceNumber || invoice.id || ''}</div>
        <div style={{ fontSize: '9.5px', color: '#444', marginTop: '2px' }}>Scan for Invoice ID</div>
      </div>

      {/* Receipt code and printed timestamp */}
      <div style={{ borderTop: '1px dashed #bbb', margin: '10px 0 0 0', paddingTop: '6px', fontSize: '10px', color: '#888', textAlign: 'center' }}>
        Receipt Code: <b>{getReceiptCode()}</b> <br />
        Printed on: {printedOn}
      </div>
    </div>
  );
};

export default AdvanceThermalInvoice;
