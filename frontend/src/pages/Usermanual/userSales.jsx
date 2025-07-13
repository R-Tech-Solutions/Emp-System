import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Boxes,
  Users,
  FileText,
  ShoppingCart,
  Truck,
  BookOpen,
  DollarSign,
  BarChart2,
  Settings,
  Share2,
  CheckCircle,
  LifeBuoy,
  ClipboardList,
  Calendar,
  Activity,
} from 'lucide-react';

const sections = [
  { id: 'dashboardoverview', title: 'Dashboard Overview', icon: TrendingUp },
  { id: 'salesinventorymanagement', title: 'Sales & Inventory Management', icon: Boxes },
  { id: 'crmcustomerrelationshipmanagement', title: 'CRM (Customer Relationship Management)', icon: Users },
  { id: 'productsmanagement', title: 'Products Management', icon: Boxes },
  { id: 'quotationsystem', title: 'Quotation System', icon: FileText },
  { id: 'purchasemanagement', title: 'Purchase Management', icon: ShoppingCart },
  { id: 'inventorymanagement', title: 'Inventory Management', icon: Boxes },
  { id: 'suppliermanagement', title: 'Supplier Management', icon: Truck },
  { id: 'cashbooksystem', title: 'Cashbook System', icon: BookOpen },
  { id: 'incomeexpensemanagement', title: 'Income & Expense Management', icon: DollarSign },
  { id: 'invoicesystem', title: 'Invoice System', icon: FileText },
  { id: 'businesssettings', title: 'Business Settings', icon: Settings },
  { id: 'salesreports', title: 'Sales Reports', icon: BarChart2 },
  { id: 'systemintegration', title: 'System Integration', icon: Share2 },
  { id: 'bestpractices', title: 'Best Practices', icon: CheckCircle },
  { id: 'supportmaintenance', title: 'Support and Maintenance', icon: LifeBuoy },
];

// Manual content mapping (extracted and structured from howsaleswork.md)
const manualContent = {
  dashboardoverview: {
    heading: 'Dashboard Overview',
    features: [
      'Employee Statistics: Total employees, working today, on leave, attendance trends',
      'Task Management: Not started, started, completed, and overtime tasks',
      'Performance Metrics: Departmentwise employee distribution, position statistics',
      'Quick Actions: Add employees, create tasks, send announcements',
      'Recent Activities: Latest system activities and updates',
      'Widget Management: Customizable dashboard widgets for different metrics',
    ],
    usage: [
      {
        title: 'How to Use',
        steps: [
          'View Statistics: Dashboard automatically displays current employee and task statistics',
          'Filter Data: Use advanced filters to view specific departments, positions, or statuses',
          'Toggle Widgets: Click on widget headers to show/hide specific sections',
          'Quick Navigation: Use the sidebar to access different modules',
        ],
      },
    ],
  },
  salesinventorymanagement: {
    heading: 'Sales & Inventory Management',
    features: [
      'Realtime Inventory Tracking: Monitor stock levels across all products',
      'Sales Integration: Automatic inventory updates when sales are made',
      'Low Stock Alerts: Get notified when products are running low',
      'Stock Valuation: Calculate total inventory value',
      'Movement History: Track all inventory movements',
    ],
    usage: [
      {
        title: 'How to Use',
        steps: [
          'View Inventory: Check current stock levels and values',
          'Monitor Alerts: Pay attention to low stock and outofstock notifications',
          'Track Movements: View detailed history of stock in/out transactions',
          'Generate Reports: Export inventory reports for analysis',
        ],
      },
    ],
  },
  crmcustomerrelationshipmanagement: {
    heading: 'CRM (Customer Relationship Management)',
    features: [
      'Lead Management: Track potential customers through sales pipeline',
      'Contact Management: Store and manage customer information',
      'Pipeline Stages: Visualize leads through different stages (New, Contacted, Qualified, Proposal, Negotiation, Won/Lost)',
      'Activity Tracking: Log calls, emails, meetings, and notes',
      'Conversion Analytics: Track lead conversion rates',
    ],
    usage: [
      {
        title: 'Pipeline Stages',
        steps: [
          'New Lead: Initial contact or inquiry',
          'Contacted: First communication established',
          'Qualified: Lead meets criteria and shows interest',
          'Proposal: Formal proposal sent',
          'Negotiation: Price and terms discussion',
          'Won/Lost: Final outcome',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Add New Lead: Click "Add Lead" to create new prospect entry',
          'Manage Contacts: Store customer details, preferences, and communication history',
          'Move Through Pipeline: Drag and drop leads between stages',
          'Add Activities: Log all customer interactions and followups',
          'Track Progress: Monitor conversion rates and sales performance',
        ],
      },
    ],
  },
  productsmanagement: {
    heading: 'Products Management',
    features: [
      'Product Catalog: Comprehensive product database',
      'Multiple Pricing: Standard, wholesale, and retail pricing',
      'Category Management: Organize products by categories',
      'Barcode Support: Generate and manage product barcodes',
      'Image Management: Upload and manage product images',
      'Import/Export: Bulk import/export product data',
    ],
    usage: [
      {
        title: 'Product Types',
        steps: [
          'Goods: Physical products with inventory tracking',
          'Services: Nonphysical offerings',
        ],
      },
      {
        title: 'Pricing Structure',
        steps: [
          'Cost Price: Purchase cost from supplier',
          'Sales Price: Standard selling price',
          'Margin Price: Wholesale pricing',
          'Retail Price: Retail pricing',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Add Product: Fill in product details, pricing, and category',
          'Set Pricing: Configure different price levels for various customer types',
          'Manage Inventory: Set initial stock levels and track movements',
          'Upload Images: Add product photos for better presentation',
          'Generate Barcodes: Create barcodes for inventory management',
          'Bulk Operations: Import/export products using Excel files',
        ],
      },
    ],
  },
  quotationsystem: {
    heading: 'Quotation System',
    features: [
      'Professional Templates: A4 and thermal receipt formats',
      'Multiple Price Lists: Standard, wholesale, retail pricing',
      'Customer Integration: Link to CRM contacts and leads',
      'Expiration Dates: Set quote validity periods',
      'Terms & Conditions: Customizable terms',
      'Email Integration: Send quotes directly to customers',
    ],
    usage: [
      {
        title: 'How to Use',
        steps: [
          'Create Quote: Select customer from contacts or CRM leads',
          'Add Products: Choose products and quantities',
          'Set Pricing: Apply appropriate price list',
          'Customize Terms: Add specific terms and conditions',
          'Set Expiration: Define quote validity period',
          'Send Quote: Email quote to customer',
          'Track Status: Monitor quote acceptance and conversion',
        ],
      },
      {
        title: 'Quote Workflow',
        steps: [
          'Draft: Initial quote creation',
          'Sent: Quote emailed to customer',
          'Viewed: Customer has viewed the quote',
          'Accepted: Customer accepts the quote',
          'Converted: Quote converted to invoice/order',
        ],
      },
    ],
  },
  purchasemanagement: {
    heading: 'Purchase Management',
    features: [
      'Supplier Management: Create and manage supplier profiles',
      'Purchase Orders: Generate detailed purchase orders',
      'Payment Tracking: Monitor payment status and history',
      'Product Identifiers: Track IMEI, serial numbers for specific products',
      'Price Management: Negotiate and record supplier pricing',
      'Order History: Complete purchase order history',
    ],
    usage: [
      {
        title: 'How to Use',
        steps: [
          'Select Supplier: Choose existing supplier or create new one',
          'Add Products: Select products to purchase with quantities',
          'Set Pricing: Record negotiated prices with suppliers',
          'Manage Identifiers: Track specific product identifiers if required',
          'Process Payment: Record payments and track outstanding amounts',
          'Generate Reports: Export purchase reports for analysis',
        ],
      },
      {
        title: 'Purchase Status',
        steps: [
          'Draft: Initial order creation',
          'Sent: Order sent to supplier',
          'Confirmed: Supplier confirms order',
          'Received: Goods received',
          'Paid: Payment completed',
        ],
      },
    ],
  },
  inventorymanagement: {
    heading: 'Inventory Management',
    features: [
      'Stock Levels: Realtime inventory tracking',
      'Stock Status: In Stock, Low Stock, Out of Stock indicators',
      'Valuation: Calculate total inventory value',
      'Movement History: Track all stock movements',
      'Supplier History: Link inventory to suppliers',
      'Transaction History: Detailed transaction logs',
    ],
    usage: [
      {
        title: 'Stock Status Indicators',
        steps: [
          'In Stock: Sufficient inventory (green)',
          'Low Stock: Below minimum threshold (yellow)',
          'Out of Stock: No inventory available (red)',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'View Inventory: Check current stock levels and status',
          'Monitor Alerts: Pay attention to low stock warnings',
          'Track Movements: View detailed stock in/out history',
          'Calculate Valuation: Generate inventory value reports',
          'Export Data: Download inventory reports in Excel/PDF',
        ],
      },
    ],
  },
  suppliermanagement: {
    heading: 'Supplier Management',
    features: [
      'Supplier Profiles: Complete supplier information management',
      'Payment Tracking: Monitor outstanding payments and payment history',
      'Purchase History: Track all purchases from each supplier',
      'Payment Processing: Record and manage supplier payments',
      'Financial Reports: Supplierwise financial summaries',
    ],
    usage: [
      {
        title: 'How to Use',
        steps: [
          'Add Supplier: Create new supplier profiles with contact details',
          'Track Purchases: Monitor all purchases from each supplier',
          'Manage Payments: Record payments and track outstanding amounts',
          'View History: Access complete payment and purchase history',
          'Generate Reports: Export supplier financial reports',
        ],
      },
      {
        title: 'Payment Status',
        steps: [
          'Pending: Payment not yet made',
          'Partial: Partial payment made',
          'Paid: Full payment completed',
        ],
      },
    ],
  },
  cashbooksystem: {
    heading: 'Cashbook System',
    features: [
      'Transaction Recording: Record all cash in/out transactions',
      'Balance Tracking: Maintain running balance',
      'Category Management: Categorize transactions',
      'Payment Methods: Track different payment methods',
      'Opening Balance: Set and manage opening balance',
      'Financial Reports: Generate cash flow reports',
    ],
    usage: [
      {
        title: 'Transaction Types',
        steps: [
          'Cash In: Income, sales, payments received',
          'Cash Out: Expenses, purchases, payments made',
        ],
      },
      {
        title: 'Categories',
        steps: [
          'Sales: Revenue from sales',
          'Purchase: Cost of goods purchased',
          'Expense: Operating expenses',
          'Investment: Investment income/expenses',
          'Opening: Opening balance adjustments',
          'Other: Miscellaneous transactions',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Set Opening Balance: Establish initial cash balance',
          'Record Transactions: Add all cash in/out transactions',
          'Categorize: Assign appropriate categories to transactions',
          'Track Balance: Monitor running balance',
          'Generate Reports: Export cash flow reports',
        ],
      },
    ],
  },
  incomeexpensemanagement: {
    heading: 'Income & Expense Management',
    features: [
      'Income Tracking: Record all income sources',
      'Expense Management: Track all business expenses',
      'Category Management: Organize transactions by categories',
      'Recurring Transactions: Set up recurring income/expenses',
      'Project Tracking: Link transactions to specific projects',
      'Financial Reports: Comprehensive financial analysis',
    ],
    usage: [
      {
        title: 'Income Categories',
        steps: [
          'Sales: Revenue from product sales',
          'Services: Servicebased income',
          'Commissions: Commission income',
          'Investments: Investment returns',
          'Donations: Donation income',
          'Royalties: Royalty income',
          'Freelance: Freelance work income',
          'Consulting: Consulting fees',
        ],
      },
      {
        title: 'Expense Categories',
        steps: [
          'Travel: Travelrelated expenses',
          'Office: Office supplies and expenses',
          'Meals: Food and entertainment',
          'Software: Software licenses and tools',
          'Utilities: Utility bills',
          'Marketing: Marketing and advertising',
          'Training: Training and development',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Add Income: Record all income sources with details',
          'Record Expenses: Track all business expenses',
          'Categorize: Assign appropriate categories',
          'Set Recurring: Configure recurring transactions',
          'Link Projects: Associate transactions with projects',
          'Generate Reports: Export financial reports',
        ],
      },
    ],
  },
  invoicesystem: {
    heading: 'Invoice System',
    features: [
      'Multiple Formats: A4 and thermal receipt formats',
      'POS System: Point of sale functionality',
      'Payment Integration: Track payments and outstanding amounts',
      'Customer Management: Link invoices to customers',
      'Product Management: Add products with pricing',
      'Discount Management: Apply discounts and promotions',
      'Tax Calculation: Automatic tax calculations',
      'Print/Email: Print invoices or email to customers',
    ],
    usage: [
      {
        title: 'Invoice Types',
        steps: [
          'Regular Invoice: Standard business invoice',
          'POS Invoice: Point of sale receipt',
          'Advance Invoice: Partial payment invoices',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Create Invoice: Select customer and add products',
          'Set Pricing: Apply appropriate pricing and discounts',
          'Calculate Totals: System automatically calculates taxes and totals',
          'Process Payment: Record payment method and amount',
          'Print/Email: Generate invoice in desired format',
          'Track Status: Monitor payment status',
        ],
      },
      {
        title: 'Payment Methods',
        steps: [
          'Cash: Cash payments',
          'Card: Credit/debit card payments',
          'UPI: Digital payments',
          'Cheque: Check payments',
          'Bank Transfer: Bank transfers',
        ],
      },
    ],
  },
  businesssettings: {
    heading: 'Business Settings',
    features: [
      'Company Information: Business name, address, contact details',
      'Tax Settings: GST number, tax rates',
      'Currency Settings: Local currency configuration',
      'Print Settings: Invoice and receipt formatting',
      'Logo Management: Upload and manage company logo',
      'Terms & Conditions: Customize terms for quotes and invoices',
      'System Preferences: Language, date format, etc.',
    ],
    usage: [
      {
        title: 'Configuration Options',
        steps: [
          'Business Details: Name, address, contact information',
          'Tax Configuration: GST number, tax rates',
          'Printing Style: A4 or thermal receipt format',
          'Currency: Local currency settings',
          'Logo: Company logo upload',
          'Terms: Custom terms and conditions',
          'Notes: Default notes for documents',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Configure Business: Set up company information',
          'Upload Logo: Add company logo for documents',
          'Set Tax Rates: Configure applicable tax rates',
          'Customize Terms: Set default terms and conditions',
          'Choose Format: Select invoice and receipt formats',
          'Save Settings: Apply all configuration changes',
        ],
      },
    ],
  },
  salesreports: {
    heading: 'Sales Reports',
    features: [
      'Sales Analytics: Detailed sales performance analysis',
      'Customer Reports: Customer behavior and history',
      'Product Reports: Product performance and inventory',
      'Financial Reports: Profit and loss analysis',
      'Export Options: PDF and Excel export capabilities',
      'Date Filtering: Custom date range selection',
      'Visual Charts: Graphs and charts for data visualization',
    ],
    usage: [
      {
        title: 'Report Types',
        steps: [
          'Sales Reports: Daily/weekly/monthly summaries, topselling products',
          'CRM Reports: Customer history, conversion rates',
          'Product Reports: Performance, stock levels, movement',
          'Quotation Reports: History, conversion ratios',
          'Purchase Reports: Supplierwise, productwise analysis',
          'Inventory Reports: Stock valuation, movement history',
          'Financial Reports: Cash flow, profit and loss',
          'Income Reports: Income analysis by category',
        ],
      },
      {
        title: 'How to Use',
        steps: [
          'Select Report Type: Choose the type of report needed',
          'Set Date Range: Filter data by specific time periods',
          'Apply Filters: Use additional filters for detailed analysis',
          'View Charts: Analyze data through visual representations',
          'Export Data: Download reports in PDF or Excel format',
          'Compare Periods: Compare performance across different time periods',
        ],
      },
      {
        title: 'Filter Options',
        steps: [
          "Today: Current day's data",
          "This Week: Current week's data",
          "This Month: Current month's data",
          "Custom: Userdefined date range",
        ],
      },
    ],
  },
  systemintegration: {
    heading: 'System Integration',
    features: [
      'CRM → Quotations: Convert leads to quotes',
      'Quotations → Invoices: Convert quotes to invoices',
      'Invoices → Cashbook: Automatic cash flow recording',
      'Products → Inventory: Realtime stock updates',
      'Purchases → Inventory: Stock level updates',
      'Suppliers → Purchases: Supplier payment tracking',
    ],
    usage: [],
  },
  bestpractices: {
    heading: 'Best Practices',
    features: [
      'Regular Data Entry: Enter transactions promptly for accurate reporting',
      'Consistent Categorization: Use consistent categories for better analysis',
      'Regular Backups: Ensure data is regularly backed up',
      'User Training: Train all users on system features',
      'Regular Reviews: Review reports regularly for business insights',
      'Data Validation: Verify data accuracy before finalizing transactions',
    ],
    usage: [],
  },
  supportmaintenance: {
    heading: 'Support and Maintenance',
    features: [
      'User Permissions: Configure appropriate access levels',
      'Data Backup: Regular backup procedures',
      'System Updates: Keep system updated for latest features',
      'Training: Regular user training sessions',
      'Documentation: Maintain updated user documentation',
    ],
    usage: [],
  },
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function UserSalesManual() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let current = sections[0].id;
      for (const section of sections) {
        const ref = sectionRefs.current[section.id];
        if (ref && ref.offsetTop <= scrollPosition) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const ref = sectionRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Adjust for fixed header (if any)
      setTimeout(() => {
        window.scrollBy({ top: -80, left: 0, behavior: 'instant' });
      }, 300); // Wait for scrollIntoView to finish
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-64 w-full md:sticky md:top-0 bg-primary-light border-r border-border z-10">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> Sales User Manual
          </h2>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={classNames(
                    'flex items-center gap-2 w-full text-left px-3 py-2 rounded transition',
                    activeSection === section.id
                      ? 'bg-primary text-white font-semibold shadow'
                      : 'text-text-primary hover:bg-accent hover:text-primary'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {section.title}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-4xl mx-auto">
        {sections.map((section) => {
          const content = manualContent[section.id];
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => (sectionRefs.current[section.id] = el)}
              className="mb-12"
            >
              <div className="bg-white rounded-lg shadow p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                  <h3 className="text-2xl font-bold text-primary">{content.heading}</h3>
                </div>
                {content.features && (
                  <>
                    <h4 className="text-lg font-semibold text-text-primary mb-2">Key Features:</h4>
                    <ul className="list-disc pl-6 mb-4 text-text-secondary">
                      {content.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
                {content.usage && content.usage.length > 0 && (
                  <>
                    <h4 className="text-lg font-semibold text-text-primary mb-2">How to Use:</h4>
                    <div className="space-y-4">
                      {content.usage.map((usage, idx) => (
                        <div key={idx}>
                          <h5 className="font-semibold text-primary mb-1">{usage.title}</h5>
                          <ol className="list-decimal pl-6 text-text-secondary">
                            {usage.steps.map((step, sidx) => (
                              <li key={sidx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
