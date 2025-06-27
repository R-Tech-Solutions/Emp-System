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
  XLSX.utils.book_append_sheet(wb, ws, section.title.replace(/\s+/g, '_'));
  XLSX.writeFile(wb, `${section.title}_${sectionState.selectedFilter}_Report.xlsx`);
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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/invoices`);
        setInvoices(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch invoice data");
        setLoading(false);
      }
    };
    fetchInvoices();
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
