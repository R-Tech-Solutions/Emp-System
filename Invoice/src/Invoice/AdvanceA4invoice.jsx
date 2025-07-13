import React, { useEffect, useState, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { backEndURL } from "../Backendurl";
import { PDFDocument } from 'pdf-lib';

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

const AdvanceA4Invoice = ({ invoice: invoiceProp, invoiceDocumentId, additionalData: additionalDataProp, businessSettings: businessSettingsProp }) => {
  const [invoice, setInvoice] = useState(invoiceProp);
  const [businessSettings, setBusinessSettings] = useState(businessSettingsProp || {});
  const [additionalData, setAdditionalData] = useState(additionalDataProp || { notes: '', terms: [] });
  const [templateImage, setTemplateImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef();
  // Remove barcodeDataUrl state and useEffect

  useEffect(() => {
    if (!invoiceProp && invoiceDocumentId) {
      fetchInvoice(invoiceDocumentId).then(invoiceData => {
        setInvoice(invoiceData);
      });
    } else if (invoiceProp) {
      setInvoice(invoiceProp);
    }
  }, [invoiceDocumentId, invoiceProp]);

  // Fetch additional notes and terms from backend only if not provided as prop
  useEffect(() => {
    if (!additionalDataProp) {
      const fetchAdditionalData = async () => {
        try {
          const response = await fetch(`${backEndURL}/api/additional/notes-terms`);
          if (!response.ok) throw new Error('Failed to fetch additional notes/terms');
          const data = await response.json();
          setAdditionalData({
            notes: data.notes || '',
            terms: data.terms || []
          });
        } catch (error) {
          setAdditionalData({ notes: '', terms: [] });
          console.error('Error fetching additional notes/terms:', error);
        }
      };
      fetchAdditionalData();
    }
  }, [additionalDataProp]);

  // Fetch business settings from backend only if not provided as prop
  useEffect(() => {
    if (!businessSettingsProp) {
      const fetchBusinessSettings = async () => {
        try {
          const response = await fetch(`${backEndURL}/api/business-settings`);
          if (!response.ok) throw new Error('Failed to fetch business settings');
          const result = await response.json();
          const data = result.data || result;
          setBusinessSettings({
            logo: data.logo,
            businessName: data.businessName,
            email: data.contact,
            address: data.address,
            registrationNumber: data.registrationNumber,
            website: data.website,
            taxRate: Number(data.taxRate) || 0,
            templateUrl: data.templateUrl
          });
        } catch (error) {
          setBusinessSettings({});
          console.error('Error fetching business settings:', error);
        }
      };
      fetchBusinessSettings();
    }
  }, [businessSettingsProp, invoiceDocumentId]);

  // Remove barcodeDataUrl state and useEffect

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open('', '', 'height=900,width=800');
      win.document.write('<html><head><title>Invoice</title>');
      win.document.write('<style>body{font-family:sans-serif;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f3f3f3;}</style>');
      win.document.write('</head><body>');
      win.document.write(printContents);
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    }
  };

  const handleDownloadPDF = async () => {
    const input = printRef.current;
    if (!input) return;

    // Render invoice as image
    const canvas = await html2canvas(input, { scale: 2, useCORS: true, backgroundColor: 'white' });
    const imgData = canvas.toDataURL('image/png');

    let pdfDoc;
    let page;

    if (businessSettings.templateUrl) {
      // Load template PDF
      const templatePdfBytes = await fetch(businessSettings.templateUrl).then(res => res.arrayBuffer());
      const templatePdfDoc = await PDFDocument.load(templatePdfBytes);

      // Create a new PDF and copy the first template page
      pdfDoc = await PDFDocument.create();
      const [templatePage] = await pdfDoc.copyPages(templatePdfDoc, [0]);
      page = pdfDoc.addPage(templatePage);

      // Draw invoice image on top of the template page
      const pngImage = await pdfDoc.embedPng(imgData);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });

      // (Optional) Append any additional template pages
      if (templatePdfDoc.getPageCount() > 1) {
        const otherPages = await pdfDoc.copyPages(
          templatePdfDoc,
          Array.from({ length: templatePdfDoc.getPageCount() - 1 }, (_, i) => i + 1)
        );
        otherPages.forEach((p) => pdfDoc.addPage(p));
      }
    } else {
      // Fallback: just invoice as image
      pdfDoc = await PDFDocument.create();
      const pngImage = await pdfDoc.embedPng(imgData);
      page = pdfDoc.addPage([pngImage.width, pngImage.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: pngImage.width,
        height: pngImage.height,
      });
    }

    // Download
    const mergedPdfBytes = await pdfDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_${invoice.invoiceNumber || invoice.id || ''}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!invoice) return null;

  // Barcode generation (synchronous, like Advancethermalinvoice.jsx)
  let barcodeDataUrl = '';
  const barcodeValue = invoice?.invoiceNumber || invoice?.id || '';
  if (barcodeValue) {
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, barcodeValue, {
        format: "CODE128",
        width: 1.4,
        height: 40,
        displayValue: false,
        margin: 0,
        lineColor: "#000"
      });
      barcodeDataUrl = canvas.toDataURL('image/png');
    } catch (error) {
      barcodeDataUrl = '';
    }
  }

  const cust = (Array.isArray(invoice.customer) && invoice.customer.length > 0)
    ? invoice.customer[0]
    : (invoice.customer || {});

  return (
    <div
      className="a4-invoice"
      ref={printRef}
      style={{
        position: 'relative',
        background: '#fff',
        color: '#333',
        padding: 40,
        maxWidth: 900,
        margin: '2rem auto',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        fontFamily: "Arial, sans-serif",
        overflow: 'hidden',
        backgroundImage: templateImage ? `url(${templateImage.src})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Semi-transparent overlay to ensure content is readable over template */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header - Updated to match old style */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          paddingBottom: 20,
          borderBottom: '4px solid #1e40af',
          marginBottom: 0
        }}>
          {/* Left: Logo + Company Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {businessSettings.logo && (
                <img
                  src={businessSettings.logo}
                  alt="Logo"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: 'contain',
                    marginRight: 16,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #eee'
                  }}
                />
              )}
              <div>
                <div style={{ fontSize: 26, fontWeight: 'bold', color: '#1e40af', marginBottom: 2 }}>
                  {businessSettings.businessName || 'Company Name'}
                </div>
                {businessSettings.email && (
                  <div style={{ fontSize: 14, color: '#222' }}>{businessSettings.email}</div>
                )}
                {businessSettings.address && (
                  <div style={{ fontSize: 14, color: '#222' }}>{businessSettings.address}</div>
                )}
                {businessSettings.registrationNumber && (
                  <div style={{ fontSize: 14, color: '#222', fontWeight: 'bold' }}>
                    Reg No: <span style={{ fontWeight: 'bold' }}>{businessSettings.registrationNumber}</span>
                  </div>
                )}
                {businessSettings.website && (
                  <div style={{ fontSize: 14, color: '#222' }}>
                    Website: {businessSettings.website}
                  </div>
                )}  
              </div>
            </div>
          </div>
          {/* Right: Invoice Info */}
          <div style={{ flex: 1, textAlign: 'right', alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 40, fontWeight: 'bold', color: '#333', marginBottom: 10 }}>
              INVOICE
            </div>
            <div style={{ fontSize: 15, color: '#222', marginBottom: 2 }}>
              <b>Invoice Number:</b> {invoice.invoiceNumber || invoice.id || ''}
            </div>
            <div style={{ fontSize: 15, color: '#222' }}>
              <b>Date:</b> {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : ''}
            </div>
          </div>
        </div>

        {/* Rest of your invoice content remains the same */}
        {/* Customer Info */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1e40af', marginBottom: 8 }}>Bill To:</div>
          <div style={{ fontSize: 15, fontWeight: 'bold' }}>{cust.customerName || ''}</div>
          {cust.customerCompany && <div style={{ fontSize: 14, color: '#555' }}>{cust.customerCompany}</div>}
          {cust.customerPhone && <div style={{ fontSize: 14, color: '#555' }}>Phone: {cust.customerPhone}</div>}
          {cust.customerEmail && <div style={{ fontSize: 14, color: '#555' }}>Email: {cust.customerEmail}</div>}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 30 }}>
          <thead>
            <tr style={{ background: '#1e40af', color: '#fff' }}>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>SKU / Barcode</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Quantity</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Discount</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 15px' }}>{idx + 1}</td>
                <td style={{ padding: '12px 15px' }}>
                  {item.name || ''}
                  {item.identifierType && item.identifierValue && (
                    <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 'bold' }}>
                      {item.identifierType.toUpperCase()} - {item.identifierValue}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 15px' }}>{item.barcode || item.sku || ''}</td>
                <td style={{ padding: '12px 15px', textAlign: 'right' }}>{item.quantity || 0}</td>
                <td style={{ padding: '12px 15px', textAlign: 'right' }}>{item.price?.toFixed(2) || ''}</td>
                <td style={{ padding: '12px 15px', textAlign: 'right' }}>{item.discountAmount ? `-${item.discountAmount.toFixed(2)}` : ''}</td>
                <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                  {((item.discountedPrice || item.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
          <div style={{ width: 350 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0' }}>
              <span>Subtotal:</span>
              <span>Rs {(invoice.subtotal || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0' }}>
              <span>Discount:</span>
              <span>- Rs {(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0' }}>
              <span>Tax ({businessSettings.taxRate || 0}%):</span>
              <span>Rs {(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 18, borderTop: '2px solid #333', marginTop: 10, paddingTop: 10, color: '#1e40af' }}>
              <span>Total:</span>
              <span>Rs {(invoice.total || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0', borderTop: '1px solid #eee', marginTop: 10 }}>
              <span>Amount Paid:</span>
              <span>Rs {(invoice.amountPaid || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0' }}>
              <span>Change Due:</span>
              <span>Rs {(invoice.changeDue || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '8px 0', borderTop: '1px solid #eee', marginTop: 5, paddingTop: 5, fontWeight: 'bold' }}>
              <span>Payment Method:</span>
              <span>{invoice.paymentMethod || ''}</span>
            </div>
          </div>
        </div>

        {/* Terms and Notes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginTop: '2rem', fontSize: '12px', borderTop: '1px solid #eee', paddingTop: '1rem', color: '#555' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Notes:</h4>
            {additionalData.notes && <p>{additionalData.notes}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.5rem' }}>Terms & Conditions:</h4>
            <ul style={{ paddingLeft: '1rem', margin: 0 }}>
              {additionalData.terms && additionalData.terms.length > 0 && (
                <>
                  {additionalData.terms.map((term, idx) => (
                    <li key={idx}>{term}</li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '4px solid #1e40af', paddingTop: 20, marginTop: 40, textAlign: 'center', color: '#1e40af' }}>
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {barcodeDataUrl && (
              <img
                src={barcodeDataUrl}
                alt={`Barcode for invoice ${invoice.invoiceNumber || invoice.id || ''}`}
                style={{ display: 'block', margin: '0 auto', background: '#fff', height: 40 }}
              />
            )}
            <div style={{ fontSize: 14, color: '#1e40af', marginTop: 4 }}>
              {invoice?.invoiceNumber || invoice?.id || ''}
            </div>
          </div>
          
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>Thank you for your business!</div>
          <div style={{ fontSize: 13, margin: '8px 0', color: '#555' }}>Terms & conditions apply.</div>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>Powered by RTechSolution</div>
        </div>
      </div>
    </div>
  );
};

export default AdvanceA4Invoice;