import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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

const chartPlaceholder = (type) => {
  switch (type) {
    case "bar":
      return (
        <svg className="w-full h-32" viewBox="0 0 200 80" fill="none">
          <rect x="20" y="40" width="15" height="30" fill="#CBA8C6" />
          <rect x="45" y="20" width="15" height="50" fill="#875A7B" />
          <rect x="70" y="30" width="15" height="40" fill="#D8BFD8" />
          <rect x="95" y="10" width="15" height="60" fill="#6C4462" />
          <rect x="120" y="35" width="15" height="35" fill="#CBA8C6" />
          <rect x="145" y="25" width="15" height="45" fill="#875A7B" />
        </svg>
      );
    case "pie":
      return (
        <svg className="w-24 h-24 mx-auto" viewBox="0 0 80 80">
          <circle r="32" cx="40" cy="40" fill="#F5EDF2" />
          <path d="M40 40 L40 8 A32 32 0 0 1 72 40 Z" fill="#875A7B" />
          <path d="M40 40 L72 40 A32 32 0 0 1 40 72 Z" fill="#CBA8C6" />
          <path d="M40 40 L40 72 A32 32 0 0 1 8 40 Z" fill="#D8BFD8" />
        </svg>
      );
    case "line":
      return (
        <svg className="w-full h-32" viewBox="0 0 200 80">
          <polyline
            fill="none"
            stroke="#875A7B"
            strokeWidth="3"
            points="0,70 30,50 60,60 90,30 120,40 150,20 180,35 200,10"
          />
        </svg>
      );
    default:
      return <div className="w-full h-24 bg-surface rounded" />;
  }
};

const filterOptions = [
  "Today",
  "This Week",
  "This Month",
  "Custom",
];

const ExportButtons = ({ section }) => {
  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(section.title + " Report", 14, 18);
    doc.setFontSize(12);
    doc.text("Generated on: " + new Date().toLocaleString(), 14, 28);
    autoTable(doc, {
      startY: 38,
      head: [["Report Items"]],
      body: section.reports.map((r) => [r]),
      theme: 'grid',
      headStyles: { fillColor: [135, 90, 123], textColor: 255 },
      styles: { fontSize: 11 },
    });
    doc.save(`${section.title.replace(/\s+/g, '_')}_Report.pdf`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [section.title + " Report"],
      ["Report Items"],
      ...section.reports.map((r) => [r]),
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, section.title.replace(/\s+/g, '_'));
    XLSX.writeFile(wb, `${section.title.replace(/\s+/g, '_')}_Report.xlsx`);
  };

  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm"
        onClick={handleExportPDF}
      >
        PDF
      </button>
      <button
        className="px-3 py-1 bg-accent text-primary rounded hover:bg-secondary text-sm"
        onClick={handleExportExcel}
      >
        Excel
      </button>
    </div>
  );
};

const FilterDropdown = () => (
  <select className="border border-border rounded px-2 py-1 text-sm bg-surface text-text-primary focus:outline-primary">
    {filterOptions.map((opt) => (
      <option key={opt}>{opt}</option>
    ))}
  </select>
);

export default function SalesReport() {
  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POS Reports Dashboard</h1>
            <p className="text-text-secondary text-base mt-1">Comprehensive overview of sales, inventory, and financial performance</p>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <button className="px-4 py-2 bg-accent text-primary font-semibold rounded hover:bg-secondary transition">Export All</button>
            <button className="px-4 py-2 bg-surface text-primary font-semibold rounded border border-border hover:bg-primary-light transition">Settings</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportSections.map((section, idx) => (
          <section
            key={section.title}
            className="bg-surface rounded-xl shadow p-6 flex flex-col gap-4 border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
            </div>
            <div className="flex items-center justify-between mb-2">
              <FilterDropdown />
              <ExportButtons section={section} />
            </div>
            <ul className="list-disc pl-5 space-y-1 text-text-secondary text-sm">
              {section.reports.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            {/* Chart Placeholders for Sales Reports */}
            {section.charts && (
              <div className="flex flex-col gap-4 mt-2">
                {section.charts.map((chart) => (
                  <div key={chart.type} className="bg-background rounded-lg p-3 border border-border flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-text-muted">{chart.label}</span>
                    </div>
                    {chartPlaceholder(chart.type)}
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  );
}
