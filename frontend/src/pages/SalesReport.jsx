import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import { Line, Bar, Pie } from "react-chartjs-2";
import { backEndURL } from "../Backendurl";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DotSpinner from "../loaders/Loader.jsx";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const reportSections = [
  {
    icon: "🧾",
    title: "Sales Reports",
    reports: [
      "Daily/Weekly/Monthly Summary",
      "Top-Selling Products",
      "Sales by Customer / Employee / Payment Method",
    ],
    charts: [
      { type: "bar", label: "Sales per day/week/month" },
      { type: "pie", label: "Sales by category/payment method" },
      { type: "line", label: "Profit trends" },
    ],
  },
  {
    icon: "👥",
    title: "CRM / Customer Reports",
    reports: [
      "Customer History",
      "Frequent Customers",
      "Outstanding Payments",
      "Customer-wise Sales",
    ],
  },
  {
    icon: "📦",
    title: "Product Reports",
    reports: [
      "Product Performance",
      "Low Stock Alerts",
      "Stock Movement",
      "Slow/Dead Stock",
    ],
  },
  {
    icon: "📋",
    title: "Quotation Reports",
    reports: [
      "History",
      "Conversion Ratio",
      "Pending Quotations",
    ],
  },
  {
    icon: "🛒",
    title: "Purchase Reports",
    reports: [
      "Summary by Date/Vendor",
      "Top Purchased Products",
      "Pending Purchases",
      "Purchase Returns",
    ],
  },
  {
    icon: "🏪",
    title: "Inventory Reports",
    reports: [
      "Stock In/Out Summary",
      "Current Valuation",
      "Adjustment History",
    ],
  },
  {
    icon: "📦",
    title: "Supplier Reports",
    reports: [
      "Purchase Summary",
      "Outstanding Payments",
      "Returns by Supplier",
    ],
  },
  {
    icon: "💵",
    title: "Cashbook / Financial Reports",
    reports: [
      "Cash Register Summary",
      "Expense vs Income",
      "Profit & Loss",
      "Cash In/Out Details",
      "Bank Reconciliation",
    ],
  },
  {
    icon: "💰",
    title: "Income Reports",
    reports: [
      "Income by Category",
      "Recurring/One-Time",
      "Monthly Income vs Expense (comparison chart)",
    ],
  },
];

const filterOptions = [
  "Today",
  "This Week",
  "This Month",
  "Custom",
];

const FilterDropdown = ({ value, onChange, onCustomClick }) => (
  <div className="flex items-center gap-2">
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border border-border rounded px-2 py-1 text-sm bg-surface text-text-primary focus:outline-primary"
    >
      {filterOptions.map((opt) => (
        <option key={opt}>{opt}</option>
      ))}
    </select>
    {value === "Custom" && (
        <button onClick={onCustomClick} className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm">
            Select Dates
        </button>
    )}
  </div>
);

const CustomDateModal = ({ isOpen, onClose, customDateRange, onCustomDateChange }) => {
    const [localDateRange, setLocalDateRange] = useState(customDateRange);

    useEffect(() => {
        if (isOpen) {
            setLocalDateRange(customDateRange);
        }
    }, [isOpen, customDateRange]);

    if (!isOpen) return null;

    const handleApply = () => {
        onCustomDateChange(localDateRange);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-surface p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Select Custom Date Range</h3>
                <div className="flex gap-4">
                     <DatePicker
                        selected={localDateRange.startDate}
                        onChange={(date) => setLocalDateRange({ ...localDateRange, startDate: date })}
                        selectsStart
                        startDate={localDateRange.startDate}
                        endDate={localDateRange.endDate}
                        className="border border-border rounded px-2 py-1 text-sm"
                        placeholderText="Start Date"
                        inline 
                    />
                    <DatePicker
                        selected={localDateRange.endDate}
                        onChange={(date) => setLocalDateRange({ ...localDateRange, endDate: date })}
                        selectsEnd
                        startDate={localDateRange.startDate}
                        endDate={localDateRange.endDate}
                        minDate={localDateRange.startDate}
                        className="border border-border rounded px-2 py-1 text-sm"
                        placeholderText="End Date"
                        inline
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
                    <button onClick={handleApply} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">Apply</button>
                </div>
            </div>
        </div>
    );
};

const processInvoiceData = (invoices, filterType, customDateRange = null) => {
  const now = new Date();
  let filteredInvoices = [];

  switch (filterType) {
    case "Today":
      filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.timestamp);
        return invoiceDate.toDateString() === now.toDateString();
      });
      break;
    case "This Week":
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.timestamp);
        return invoiceDate >= weekStart;
      });
      break;
    case "This Month":
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.timestamp);
        return invoiceDate >= monthStart;
      });
      break;
    case "Custom":
      if (customDateRange?.startDate && customDateRange?.endDate) {
        filteredInvoices = invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.timestamp);
          return invoiceDate >= customDateRange.startDate && 
                 invoiceDate <= customDateRange.endDate;
        });
      }
      break;
    default:
      filteredInvoices = invoices;
  }

  // Process data for charts
  const salesByDay = {};
  const salesByPaymentMethod = {};
  const profitByDay = {};

  filteredInvoices.forEach(invoice => {
    const date = new Date(invoice.timestamp).toLocaleDateString();
    
    // Sales per day
    salesByDay[date] = (salesByDay[date] || 0) + invoice.total;
    
    // Sales by payment method
    const method = invoice.paymentMethod || "Cash";
    salesByPaymentMethod[method] = (salesByPaymentMethod[method] || 0) + invoice.total;
    
    // Profit trends (assuming 20% profit margin for demonstration)
    const profit = invoice.total * 0.2;
    profitByDay[date] = (profitByDay[date] || 0) + profit;
  });

  return {
    salesByDay,
    salesByPaymentMethod,
    profitByDay,
    totalSales: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
    invoiceCount: filteredInvoices.length,
  };
};

const SalesChart = ({ type, data, label }) => {
  switch (type) {
    case "bar":
      return (
        <Bar
          data={{
            labels: Object.keys(data.salesByDay),
            datasets: [{
              label: "Sales Amount",
              data: Object.values(data.salesByDay),
              backgroundColor: "#875A7B",
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: label },
            }
          }}
        />
      );
    case "pie":
      return (
        <Pie
          data={{
            labels: Object.keys(data.salesByPaymentMethod),
            datasets: [{
              data: Object.values(data.salesByPaymentMethod),
              backgroundColor: ["#875A7B", "#CBA8C6", "#D8BFD8", "#6C4462"],
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: label },
            }
          }}
        />
      );
    case "line":
      return (
        <Line
          data={{
            labels: Object.keys(data.profitByDay),
            datasets: [{
              label: "Profit",
              data: Object.values(data.profitByDay),
              borderColor: "#875A7B",
              tension: 0.1,
            }]
          }}
          options={{
            responsive: true,
            plugins: {
              title: { display: true, text: label },
            }
          }}
        />
      );
    default:
      return null;
  }
};

// --- Update: SalesTable to accept filteredInvoices ---
const SalesTable = ({ invoices }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface mb-6">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-background">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Invoice No</th>
            <th className="px-4 py-2 text-left">Customer</th>
            <th className="px-4 py-2 text-left">Products</th>
            <th className="px-4 py-2 text-right">Amount</th>
            <th className="px-4 py-2 text-left">Payment</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">No sales found for this period.</td>
            </tr>
          ) : (
            invoices.map((inv) => {
              const cust = Array.isArray(inv.customer) && inv.customer.length > 0 ? inv.customer[0] : (inv.customer || {});
              return (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-4 py-2">{inv.invoiceNumber || inv.id}</td>
                  <td className="px-4 py-2">{cust.customerName || '-'}</td>
                  <td className="px-4 py-2">
                    {(inv.items || []).map((item, idx) => (
                      <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-0.5 mr-1 mb-1 text-xs">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-right">${inv.total?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-2">{inv.paymentMethod || '-'}</td>
                  <td className="px-4 py-2">{inv.paymentStatus || '-'}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// --- Update: Export functions to use filteredInvoices and export the table ---
const exportTableHeaders = [
  'Date', 'Invoice No', 'Customer', 'Products', 'Amount', 'Payment', 'Status'
];

const getTableRows = (invoices) =>
  invoices.map(inv => {
    const cust = Array.isArray(inv.customer) && inv.customer.length > 0 ? inv.customer[0] : (inv.customer || {});
    return [
      inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
      inv.invoiceNumber || inv.id,
      cust.customerName || '-',
      (inv.items || []).map(item => `${item.name} x${item.quantity}`).join(', '),
      inv.total?.toFixed(2) || '0.00',
      inv.paymentMethod || '-',
      inv.paymentStatus || '-'
    ];
  });

// Update handleExportPDF
const handleExportPDF = (section, sectionState, filteredInvoices) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} Report - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [exportTableHeaders],
    body: getTableRows(filteredInvoices),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Report.pdf`);
};

// Update handleExportExcel
const handleExportExcel = (section, sectionState, filteredInvoices) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} Report - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    exportTableHeaders,
    ...getTableRows(filteredInvoices)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Report.xlsx`);
};

// --- CRM Table Export Helpers ---
const crmTableHeaders = [
  'Opportunity Name',
  'Client Name',
  'Email',
  'Phone',
  'Expected Revenue',
  'Assigned To Name',
  'Assigned To Email',
  'Assigned To Department',
  'Company',
  'Website',
  'Lead Source',
  'Lead Score',
  'Is Existing Client',
  'Last Contact Date',
  'Next Follow Up',
  'Stage',
  'Deal Value',
  'Stage History',
  'Internal Notes',
  'Additional Notes',
  'Notes',
  'Created At',
  'Updated At'
];

const getCrmTableRows = (leads) =>
  leads.map(lead => [
    lead.opportunityName || '-',
    lead.clientName || '-',
    lead.email || '-',
    lead.phone || '-',
    lead.expectedRevenue ?? '-',
    lead.assignedTo || '-',
    lead.assignedToName || '-',
    lead.AssighnedToEmail || '-',
    lead.assignedToDepartment || '-',
    lead.company || '-',
    lead.website || '-',
    lead.leadSource || '-',
    lead.leadScore ?? '-',
    lead.isExistingClient ? 'Yes' : 'No',
    lead.lastContactDate || '-',
    lead.nextFollowUp || '-',
    lead.stage || '-',
    lead.dealValue ?? '-',
    Array.isArray(lead.stageHistory)
      ? lead.stageHistory.map(h => `${h.stage} (${h.date ? new Date(h.date).toLocaleDateString() : ''}): ${h.notes || ''} by ${h.changedBy || ''}`).join(' | ')
      : '-',
    lead.internalNotes || '-',
    Array.isArray(lead.additionalNotes) ? lead.additionalNotes.join('; ') : '-',
    Array.isArray(lead.notes) ? lead.notes.join('; ') : '-',
    lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '-',
    lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : '-'
  ]);

const handleExportCrmPDF = (section, sectionState, filteredLeads) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [crmTableHeaders],
    body: getCrmTableRows(filteredLeads),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_CRM_Report.pdf`);
};
const handleExportCrmExcel = (section, sectionState, filteredLeads) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    crmTableHeaders,
    ...getCrmTableRows(filteredLeads)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_CRM_Report.xlsx`);
};

// --- Product Table Export Helpers ---
const productTableHeaders = [
  'Product Name', 'SKU', 'Category', 'Stock', 'Created Date', 'Last Updated', 'IMEI Count', 'Serial Count'
];
const getProductTableRows = (products, inventoryMap, imeiMap, serialMap) =>
  products.map(product => [
    product.name || '-',
    product.sku || '-',
    product.category || '-',
    inventoryMap[product.sku]?.totalQuantity ?? '-',
    product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-',
    product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '-',
    imeiMap[product.sku]?.length ?? 0,
    serialMap[product.sku]?.length ?? 0
  ]);

const handleExportProductPDF = (section, sectionState, filteredProducts, inventoryMap, imeiMap, serialMap) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [productTableHeaders],
    body: getProductTableRows(filteredProducts, inventoryMap, imeiMap, serialMap),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Product_Report.pdf`);
};
const handleExportProductExcel = (section, sectionState, filteredProducts, inventoryMap, imeiMap, serialMap) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    productTableHeaders,
    ...getProductTableRows(filteredProducts, inventoryMap, imeiMap, serialMap)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Product_Report.xlsx`);
};

// --- Quotation Table Export Helpers ---
const quotationTableHeaders = [
  'Reference', 'Customer', 'Date', 'Products', 'Amount', 'Stage', 'Email'
];
const getQuotationTableRows = (quotations) =>
  quotations.map(q => [
    q.Reference || '-',
    q.Customer || '-',
    q.Date ? new Date(q.Date).toLocaleDateString() : '-',
    q.Products ?? '-',
    q.Amount !== undefined ? q.Amount.toFixed(2) : '-',
    q.Stage || '-',
    q.Email || '-'
  ]);

const handleExportQuotationPDF = (section, sectionState, filteredQuotations) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [quotationTableHeaders],
    body: getQuotationTableRows(filteredQuotations),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Quotation_Report.pdf`);
};
const handleExportQuotationExcel = (section, sectionState, filteredQuotations) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    quotationTableHeaders,
    ...getQuotationTableRows(filteredQuotations)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Quotation_Report.xlsx`);
};

// --- Purchase Table Export Helpers ---
const purchaseTableHeaders = [
  'Purchase ID', 'Customer Name', 'Customer Email', 'Date', 'Number of Products', 'Total', 'Payment Method', 'Payment Status'
];
const getPurchaseTableRows = (purchases) =>
  purchases.map(p => [
    p.purchaseId || p.id || '-',
    p.customerName || '-',
    p.customerEmail || '-',
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-',
    p.numberOfProducts ?? (p.items ? p.items.length : '-'),
    p.total !== undefined ? p.total.toFixed(2) : '-',
    p.paymentMethod || '-',
    p.paymentStatus || '-'
  ]);

const handleExportPurchasePDF = (section, sectionState, filteredPurchases) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [purchaseTableHeaders],
    body: getPurchaseTableRows(filteredPurchases),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Purchase_Report.pdf`);
};

const handleExportPurchaseExcel = (section, sectionState, filteredPurchases) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    purchaseTableHeaders,
    ...getPurchaseTableRows(filteredPurchases)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Purchase_Report.xlsx`);
};

// --- Supplier Table Export Helpers ---
const supplierTableHeaders = [
  'Supplier ID', 'Contact ID', 'Purchase ID', 'Total Amount', 'Paid Amount', 'Pending Amount', 'Status', 'Created At', 'Updated At'
];
const getSupplierTableRows = (suppliers) =>
  suppliers.map(s => [
    s.id || '-',
    s.contactId || '-',
    s.purchaseId || '-',
    s.totalAmount !== undefined ? s.totalAmount.toFixed(2) : '-',
    s.paidAmountTotal !== undefined ? s.paidAmountTotal.toFixed(2) : '-',
    s.pendingAmount !== undefined ? s.pendingAmount.toFixed(2) : '-',
    s.status || '-',
    s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-',
    s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-'
  ]);

const handleExportSupplierPDF = (section, sectionState, filteredSuppliers) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [supplierTableHeaders],
    body: getSupplierTableRows(filteredSuppliers),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Supplier_Report.pdf`);
};

const handleExportSupplierExcel = (section, sectionState, filteredSuppliers) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    supplierTableHeaders,
    ...getSupplierTableRows(filteredSuppliers)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Supplier_Report.xlsx`);
};

// --- Income/Expense Table Export Helpers ---
const financeTableHeaders = [
  'Date', 'Type', 'Amount', 'Note', 'Employee Name', 'Employee Email'
];
const getFinanceTableRows = (entries) =>
  entries.map(e => [
    e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '-',
    e.type || '-',
    e.amount !== undefined ? e.amount.toFixed(2) : '-',
    e.note || '-',
    e.employeeName || '-',
    e.employeeEmail || '-'
  ]);

const handleExportFinancePDF = (section, sectionState, filteredEntries) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(`${section.title} - ${sectionState.selectedFilter}`, 14, 18);
  doc.setFontSize(12);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    startY: 38,
    head: [financeTableHeaders],
    body: getFinanceTableRows(filteredEntries),
    theme: 'grid',
    headStyles: { fillColor: [135, 90, 123], textColor: 255 },
    styles: { fontSize: 11 },
  });
  doc.save(`${section.title}_${sectionState.selectedFilter}_Finance_Report.pdf`);
};

const handleExportFinanceExcel = (section, sectionState, filteredEntries) => {
  const wb = XLSX.utils.book_new();
  const wsData = [
    [`${section.title} - ${sectionState.selectedFilter}`],
    [`Generated on: ${new Date().toLocaleString()}`],
    [],
    financeTableHeaders,
    ...getFinanceTableRows(filteredEntries)
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const safeSheetName = section.title.replace(/[:\\/?*\[\]]/g, '').replace(/\s+/g, '_').slice(0, 31);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Finance_Report.xlsx`);
};

export default function SalesReport() {
  const [invoices, setInvoices] = useState([]);
  const [reportStates, setReportStates] = useState(
    reportSections.map(() => ({
      selectedFilter: "Today",
      customDateRange: { startDate: null, endDate: null },
    }))
  );
  const [modalForIndex, setModalForIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [crmLeads, setCrmLeads] = useState([]);
  const [crmLoading, setCrmLoading] = useState(true);
  const [crmError, setCrmError] = useState(null);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [imeiData, setImeiData] = useState({});
  const [serialData, setSerialData] = useState({});
  const [productLoading, setProductLoading] = useState(true);
  const [productError, setProductError] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [quotationLoading, setQuotationLoading] = useState(true);
  const [quotationError, setQuotationError] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [purchaseLoading, setPurchaseLoading] = useState(true);
  const [purchaseError, setPurchaseError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(true);
  const [supplierError, setSupplierError] = useState(null);
  const [financeEntries, setFinanceEntries] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState(null);
  const [financeTab, setFinanceTab] = useState('income');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        console.log('Fetching invoices from:', `${backEndURL}/api/invoices`);
        const response = await axios.get(`${backEndURL}/api/invoices`);
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch invoices:', err.response?.status, err.response?.statusText);
        setError(`Failed to fetch invoice data: ${err.response?.status} ${err.response?.statusText}`);
        setLoading(false);
      }
    };
    fetchInvoices();

    // Fetch CRM leads
    const fetchCrmLeads = async () => {
      try {
        console.log('Fetching CRM leads from:', `${backEndURL}/api/crm`);
        const response = await axios.get(`${backEndURL}/api/crm`);
        setCrmLeads(response.data);
        setCrmLoading(false);
      } catch (err) {
        console.error('Failed to fetch CRM leads:', err.response?.status, err.response?.statusText);
        setCrmError(`Failed to fetch CRM leads: ${err.response?.status} ${err.response?.statusText}`);
        setCrmLoading(false);
      }
    };
    fetchCrmLeads();

    // Fetch products, inventory, identifiers
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from:', `${backEndURL}/api/products`);
        const [prodRes, invRes] = await Promise.all([
          axios.get(`${backEndURL}/api/products`),
          axios.get(`${backEndURL}/api/inventory`)
        ]);
        setProducts(prodRes.data);
        setInventory(invRes.data);
        // Fetch identifiers for all products (IMEI/Serial)
        const imeiMap = {};
        const serialMap = {};
        await Promise.all(prodRes.data.map(async (prod) => {
          try {
            const [imeiRes, serialRes] = await Promise.all([
              axios.get(`${backEndURL}/api/identifiers/imei/${prod.sku}`),
              axios.get(`${backEndURL}/api/identifiers/serial/${prod.sku}`)
            ]);
            imeiMap[prod.sku] = imeiRes.data?.identifiers || [];
            serialMap[prod.sku] = serialRes.data?.identifiers || [];
          } catch {
            imeiMap[prod.sku] = [];
            serialMap[prod.sku] = [];
          }
        }));
        setImeiData(imeiMap);
        setSerialData(serialMap);
        setProductLoading(false);
      } catch (err) {
        console.error('Failed to fetch products/inventory:', err.response?.status, err.response?.statusText);
        setProductError(`Failed to fetch product data: ${err.response?.status} ${err.response?.statusText}`);
        setProductLoading(false);
      }
    };
    fetchProducts();

    // Fetch quotations
    const fetchQuotations = async () => {
      try {
        console.log('Fetching quotations from:', `${backEndURL}/api/quotation`);
        const response = await axios.get(`${backEndURL}/api/quotation`);
        setQuotations(response.data);
        setQuotationLoading(false);
      } catch (err) {
        console.error('Failed to fetch quotations:', err.response?.status, err.response?.statusText);
        setQuotationError(`Failed to fetch quotations: ${err.response?.status} ${err.response?.statusText}`);
        setQuotationLoading(false);
      }
    };
    fetchQuotations();

    // Fetch purchases
    const fetchPurchases = async () => {
      try {
        console.log('Fetching purchases from:', `${backEndURL}/api/purchase`);
        const response = await axios.get(`${backEndURL}/api/purchase`);
        setPurchases(response.data);
        setPurchaseLoading(false);
      } catch (err) {
        console.error('Failed to fetch purchases:', err.response?.status, err.response?.statusText);
        setPurchaseError(`Failed to fetch purchases: ${err.response?.status} ${err.response?.statusText}`);
        setPurchaseLoading(false);
      }
    };
    fetchPurchases();

    // Fetch suppliers
    const fetchSuppliers = async () => {
      try {
        console.log('Fetching suppliers from:', `${backEndURL}/api/suppliers`);
        const response = await axios.get(`${backEndURL}/api/suppliers`);
        setSuppliers(response.data);
        setSupplierLoading(false);
      } catch (err) {
        console.error('Failed to fetch suppliers:', err.response?.status, err.response?.statusText);
        setSupplierError(`Failed to fetch suppliers: ${err.response?.status} ${err.response?.statusText}`);
        setSupplierLoading(false);
      }
    };
    fetchSuppliers();

    // Fetch finance
    const fetchFinance = async () => {
      try {
        console.log('Fetching finance from:', `${backEndURL}/api/finance`);
        const response = await axios.get(`${backEndURL}/api/finance`);
        setFinanceEntries(response.data);
        setFinanceLoading(false);
      } catch (err) {
        console.error('Failed to fetch finance:', err.response?.status, err.response?.statusText);
        setFinanceError(`Failed to fetch finance entries: ${err.response?.status} ${err.response?.statusText}`);
        setFinanceLoading(false);
      }
    };
    fetchFinance();
  }, []);

  const handleFilterChange = (index, filter) => {
    const newStates = [...reportStates];
    newStates[index].selectedFilter = filter;
    setReportStates(newStates);
  };

  const handleCustomDateChange = (index, dateRange) => {
    const newStates = [...reportStates];
    newStates[index].customDateRange = dateRange;
    setReportStates(newStates);
  };

  const salesReportIndex = reportSections.findIndex(s => s.title === "Sales Reports");
  const salesReportState = reportStates[salesReportIndex];
  const processedData = processInvoiceData(invoices, salesReportState?.selectedFilter, salesReportState?.customDateRange);

  // Only for Sales Reports section:
  const filteredInvoices = (() => {
    switch (salesReportState?.selectedFilter) {
      case "Today":
        return invoices.filter(inv => new Date(inv.timestamp).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return invoices.filter(inv => new Date(inv.timestamp) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return invoices.filter(inv => new Date(inv.timestamp) >= monthStart);
      }
      case "Custom":
        if (salesReportState?.customDateRange?.startDate && salesReportState?.customDateRange?.endDate) {
          return invoices.filter(inv => {
            const d = new Date(inv.timestamp);
            return d >= salesReportState.customDateRange.startDate && d <= salesReportState.customDateRange.endDate;
          });
        }
        return invoices;
      default:
        return invoices;
    }
  })();

  // CRM filter logic
  const crmReportIndex = reportSections.findIndex(s => s.title === "CRM / Customer Reports");
  const crmReportState = reportStates[crmReportIndex];
  const filteredLeads = (() => {
    if (!crmReportState) return crmLeads;
    switch (crmReportState.selectedFilter) {
      case "Today":
        return crmLeads.filter(lead => new Date(lead.createdAt).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return crmLeads.filter(lead => new Date(lead.createdAt) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return crmLeads.filter(lead => new Date(lead.createdAt) >= monthStart);
      }
      case "Custom":
        if (crmReportState.customDateRange?.startDate && crmReportState.customDateRange?.endDate) {
          return crmLeads.filter(lead => {
            const d = new Date(lead.createdAt);
            return d >= crmReportState.customDateRange.startDate && d <= crmReportState.customDateRange.endDate;
          });
        }
        return crmLeads;
      default:
        return crmLeads;
    }
  })();

  // Product filter logic
  const productReportIndex = reportSections.findIndex(s => s.title === "Product Reports");
  const productReportState = reportStates[productReportIndex];
  const inventoryMap = Object.fromEntries(inventory.map(inv => [inv.productId, inv]));
  const filteredProducts = (() => {
    if (!productReportState) return products;
    switch (productReportState.selectedFilter) {
      case "Today":
        return products.filter(prod => new Date(prod.createdAt).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return products.filter(prod => new Date(prod.createdAt) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return products.filter(prod => new Date(prod.createdAt) >= monthStart);
      }
      case "Custom":
        if (productReportState.customDateRange?.startDate && productReportState.customDateRange?.endDate) {
          return products.filter(prod => {
            const d = new Date(prod.createdAt);
            return d >= productReportState.customDateRange.startDate && d <= productReportState.customDateRange.endDate;
          });
        }
        return products;
      default:
        return products;
    }
  })();

  // Product summary
  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, prod) => sum + (inventoryMap[prod.sku]?.totalQuantity || 0), 0);
  const lowStockCount = filteredProducts.filter(prod => (inventoryMap[prod.sku]?.totalQuantity || 0) < 5).length;

  // Quotation filter logic
  const quotationReportIndex = reportSections.findIndex(s => s.title === "Quotation Reports");
  const quotationReportState = reportStates[quotationReportIndex];
  const filteredQuotations = (() => {
    if (!quotationReportState) return quotations;
    switch (quotationReportState.selectedFilter) {
      case "Today":
        return quotations.filter(q => new Date(q.Date).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return quotations.filter(q => new Date(q.Date) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return quotations.filter(q => new Date(q.Date) >= monthStart);
      }
      case "Custom":
        if (quotationReportState.customDateRange?.startDate && quotationReportState.customDateRange?.endDate) {
          return quotations.filter(q => {
            const d = new Date(q.Date);
            return d >= quotationReportState.customDateRange.startDate && d <= quotationReportState.customDateRange.endDate;
          });
        }
        return quotations;
      default:
        return quotations;
    }
  })();

  // Quotation summary
  const totalQuotations = filteredQuotations.length;
  const totalQuotationValue = filteredQuotations.reduce((sum, q) => sum + (q.Amount || 0), 0);
  const pendingQuotations = filteredQuotations.filter(q => (q.Stage || '').toLowerCase() === 'pending').length;
  const convertedQuotations = filteredQuotations.filter(q => (q.Stage || '').toLowerCase() === 'converted').length;

  // Purchase filter logic
  const purchaseReportIndex = reportSections.findIndex(s => s.title === "Purchase Reports");
  const purchaseReportState = reportStates[purchaseReportIndex];
  const filteredPurchases = (() => {
    if (!purchaseReportState) return purchases;
    switch (purchaseReportState.selectedFilter) {
      case "Today":
        return purchases.filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return purchases.filter(p => new Date(p.createdAt) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return purchases.filter(p => new Date(p.createdAt) >= monthStart);
      }
      case "Custom":
        if (purchaseReportState.customDateRange?.startDate && purchaseReportState.customDateRange?.endDate) {
          return purchases.filter(p => {
            const d = new Date(p.createdAt);
            return d >= purchaseReportState.customDateRange.startDate && d <= purchaseReportState.customDateRange.endDate;
          });
        }
        return purchases;
      default:
        return purchases;
    }
  })();
  const totalPurchases = filteredPurchases.length;
  const totalPurchaseValue = filteredPurchases.reduce((sum, p) => sum + (p.total || 0), 0);
  const paidPurchases = filteredPurchases.filter(p => (p.paymentStatus || '').toLowerCase().includes('paid')).length;
  const pendingPurchases = filteredPurchases.filter(p => (p.paymentStatus || '').toLowerCase().includes('pending')).length;

  // Supplier filter logic
  const supplierReportIndex = reportSections.findIndex(s => s.title === "Supplier Reports");
  const supplierReportState = reportStates[supplierReportIndex];
  const filteredSuppliers = (() => {
    if (!supplierReportState) return suppliers;
    switch (supplierReportState.selectedFilter) {
      case "Today":
        return suppliers.filter(s => new Date(s.createdAt).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return suppliers.filter(s => new Date(s.createdAt) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return suppliers.filter(s => new Date(s.createdAt) >= monthStart);
      }
      case "Custom":
        if (supplierReportState.customDateRange?.startDate && supplierReportState.customDateRange?.endDate) {
          return suppliers.filter(s => {
            const d = new Date(s.createdAt);
            return d >= supplierReportState.customDateRange.startDate && d <= supplierReportState.customDateRange.endDate;
          });
        }
        return suppliers;
      default:
        return suppliers;
    }
  })();
  const totalSuppliers = filteredSuppliers.length;
  const totalSupplierPending = filteredSuppliers.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);
  const totalSupplierPaid = filteredSuppliers.reduce((sum, s) => sum + (s.paidAmountTotal || 0), 0);

  // Finance filter logic
  const financeReportIndex = reportSections.findIndex(s => s.title === "Income Reports");
  const financeReportState = reportStates[financeReportIndex];
  const filteredFinance = (() => {
    if (!financeReportState) return financeEntries;
    switch (financeReportState.selectedFilter) {
      case "Today":
        return financeEntries.filter(e => new Date(e.createdAt).toDateString() === new Date().toDateString());
      case "This Week": {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return financeEntries.filter(e => new Date(e.createdAt) >= weekStart);
      }
      case "This Month": {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return financeEntries.filter(e => new Date(e.createdAt) >= monthStart);
      }
      case "Custom":
        if (financeReportState.customDateRange?.startDate && financeReportState.customDateRange?.endDate) {
          return financeEntries.filter(e => {
            const d = new Date(e.createdAt);
            return d >= financeReportState.customDateRange.startDate && d <= financeReportState.customDateRange.endDate;
          });
        }
        return financeEntries;
      default:
        return financeEntries;
    }
  })();
  const filteredIncome = filteredFinance.filter(e => e.type === 'income');
  const filteredExpense = filteredFinance.filter(e => e.type === 'expense');
  const totalIncome = filteredIncome.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpense = filteredExpense.reduce((sum, e) => sum + (e.amount || 0), 0);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotSpinner />
      </div>
    );
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reportSections.map((section, idx) => (
            <section
              key={section.title}
              className="bg-surface rounded-xl shadow p-6 flex flex-col gap-4 border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
              </div>
              {section.title === "Sales Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={salesReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(salesReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(salesReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportPDF(section, salesReportState, filteredInvoices)}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportExcel(section, salesReportState, filteredInvoices)}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  {/* Total Sales summary */}
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Sales: ${processedData.totalSales.toFixed(2)}
                  </div>
                </div>
              )}
              {section.title === "CRM / Customer Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={crmReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(crmReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(crmReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportCrmExcel(section, crmReportState, filteredLeads)}
                        disabled={crmLoading || filteredLeads.length === 0}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  {/* Total Leads summary */}
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Leads: {filteredLeads.length}
                  </div>
                  {crmLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {crmError && <div className="text-sm text-red-500">{crmError}</div>}
                </div>
              )}
              {section.title === "Product Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={productReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(productReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(productReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportProductPDF(section, productReportState, filteredProducts, inventoryMap, imeiData, serialData)}
                        disabled={productLoading || filteredProducts.length === 0}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportProductExcel(section, productReportState, filteredProducts, inventoryMap, imeiData, serialData)}
                        disabled={productLoading || filteredProducts.length === 0}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  {/* Product summary */}
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Products: {totalProducts} | Total Stock: {totalStock} | Low Stock: {lowStockCount}
                  </div>
                  {productLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {productError && <div className="text-sm text-red-500">{productError}</div>}
                </div>
              )}
              {section.title === "Quotation Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={quotationReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(quotationReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(quotationReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportQuotationPDF(section, quotationReportState, filteredQuotations)}
                        disabled={quotationLoading || filteredQuotations.length === 0}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportQuotationExcel(section, quotationReportState, filteredQuotations)}
                        disabled={quotationLoading || filteredQuotations.length === 0}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  {/* Quotation summary */}
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Quotations: {totalQuotations} | Total Value: {totalQuotationValue.toFixed(2)} | Pending: {pendingQuotations} | Converted: {convertedQuotations}
                  </div>
                  {quotationLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {quotationError && <div className="text-sm text-red-500">{quotationError}</div>}
                </div>
              )}
              {section.title === "Purchase Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={purchaseReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(purchaseReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(purchaseReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportPurchasePDF(section, purchaseReportState, filteredPurchases)}
                        disabled={purchaseLoading || filteredPurchases.length === 0}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportPurchaseExcel(section, purchaseReportState, filteredPurchases)}
                        disabled={purchaseLoading || filteredPurchases.length === 0}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Purchases: {totalPurchases} | Total Value: {totalPurchaseValue.toFixed(2)} | Paid: {paidPurchases} | Pending: {pendingPurchases}
                  </div>
                  {purchaseLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {purchaseError && <div className="text-sm text-red-500">{purchaseError}</div>}
                </div>
              )}
              {section.title === "Supplier Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={supplierReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(supplierReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(supplierReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportSupplierPDF(section, supplierReportState, filteredSuppliers)}
                        disabled={supplierLoading || filteredSuppliers.length === 0}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportSupplierExcel(section, supplierReportState, filteredSuppliers)}
                        disabled={supplierLoading || filteredSuppliers.length === 0}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary mt-2">
                    Total Suppliers: {totalSuppliers} | Total Pending: {totalSupplierPending.toFixed(2)} | Total Paid: {totalSupplierPaid.toFixed(2)}
                  </div>
                  {supplierLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {supplierError && <div className="text-sm text-red-500">{supplierError}</div>}
                </div>
              )}
              {section.title === "Income Reports" && (
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <FilterDropdown 
                      value={financeReportState.selectedFilter}
                      onChange={(filter) => handleFilterChange(financeReportIndex, filter)}
                      onCustomClick={() => setModalForIndex(financeReportIndex)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
                        onClick={() => handleExportFinancePDF(section, financeReportState, financeTab === 'income' ? filteredIncome : filteredExpense)}
                        disabled={financeLoading || (financeTab === 'income' ? filteredIncome.length === 0 : filteredExpense.length === 0)}
                      >
                        PDF
                      </button>
                      <button
                        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
                        onClick={() => handleExportFinanceExcel(section, financeReportState, financeTab === 'income' ? filteredIncome : filteredExpense)}
                        disabled={financeLoading || (financeTab === 'income' ? filteredIncome.length === 0 : filteredExpense.length === 0)}
                      >
                        Excel
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      className={`px-4 py-2 rounded ${financeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
                      onClick={() => setFinanceTab('income')}
                    >
                      Income
                    </button>
                    <button
                      className={`px-4 py-2 rounded ${financeTab === 'expense' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}
                      onClick={() => setFinanceTab('expense')}
                    >
                      Expense
                    </button>
                  </div>
                  <div className="text-lg font-semibold text-primary mt-2">
                    {financeTab === 'income' ? `Total Income: ${totalIncome.toFixed(2)}` : `Total Expense: ${totalExpense.toFixed(2)}`}
                  </div>
                  {financeLoading && <div className="text-sm text-gray-500">Loading...</div>}
                  {financeError && <div className="text-sm text-red-500">{financeError}</div>}
                </div>
              )}
              <ul className="list-disc pl-5 space-y-1 text-text-secondary text-sm">
                {section.reports.map((r, index) => (
                  <li key={`${r}-${index}`}>{r}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <CustomDateModal
        isOpen={modalForIndex !== null}
        onClose={() => setModalForIndex(null)}
        customDateRange={modalForIndex !== null ? reportStates[modalForIndex].customDateRange : { startDate: null, endDate: null }}
        onCustomDateChange={(dateRange) => {
          if (modalForIndex !== null) {
            handleCustomDateChange(modalForIndex, dateRange);
          }
        }}
      />
    </div>
  );
}