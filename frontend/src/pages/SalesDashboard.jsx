import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  FileSignature,
  Truck,
  BookOpen,
} from "lucide-react";
import axios from "axios";
import { backEndURL } from "../Backendurl";
import { NavLink } from "react-router-dom";
import DotSpinner from "../loaders/Loader";

export default function SalesDashboard() {
  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // State for different data sources
  const [crmData, setCrmData] = useState([]);
  const [productData, setProductData] = useState({
    products: [],
    sales: [],
    inventory: [],
  });
  const [quotationData, setQuotationData] = useState({
    quotations: [],
    conversions: [],
    statusDistribution: []
  });
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    cashflow: [],
  });
  const [supplierData, setSupplierData] = useState({
    suppliers: [],
    purchases: [],
  });

  // Chart colors
  const COLORS = [
    "#0088FE", // New - Blue
    "#00C49F", // Qualified - Green
    "#FFBB28", // Proposal Sent - Yellow
    "#FF8042", // Negotiation - Orange
    "#8884D8", // Won - Purple
    "#FF0000"  // Lost - Red
  ];

  // Chart colors for quotation status
  const QUOTATION_COLORS = [
    "#0088FE", // New
    "#00C49F", // In Progress
    "#FFBB28", // Pending
    "#FF8042", // Negotiation
    "#8884D8", // Won
    "#FF0000"  // Lost
  ];

  // Fetch all required data
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch CRM data
        const crmResponse = await axios.get(`${backEndURL}/api/crm`);
        console.log('Raw CRM Response:', crmResponse.data);
        
        // Debug log to check the structure of CRM data
        if (Array.isArray(crmResponse.data)) {
          console.log('CRM Data Structure:', crmResponse.data.map(lead => ({
            id: lead.id,
            status: lead.Status,
            // Log other relevant fields
            name: lead.name || lead.companyName,
            stage: lead.stage
          })));
        }
        
        setCrmData(Array.isArray(crmResponse.data) ? crmResponse.data : []);

        // Fetch Invoice data for sales
        const invoiceResponse = await axios.get(`${backEndURL}/api/invoices`);
        const invoices = invoiceResponse.data || [];
        setProductData(prev => ({
          ...prev,
          sales: invoices.map(inv => ({
            date: inv.createdAt,
            amount: inv.total || 0
          }))
        }));

        // Fetch Inventory data
        const inventoryResponse = await axios.get(`${backEndURL}/api/inventory`);
        const inventory = inventoryResponse.data || [];
        setProductData(prev => ({
          ...prev,
          inventory: inventory.map(item => ({
            name: item.productId,
            quantity: item.totalQuantity || 0,
            minQuantity: 10 // You might want to adjust this based on your business logic
          }))
        }));

        // Fetch Quotation data
        const quotationResponse = await axios.get(`${backEndURL}/api/quotation`);
        const quotations = quotationResponse.data || [];
        
        // Calculate status distribution
        const statusCounts = quotations.reduce((acc, quote) => {
          const status = quote.Stage || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value
        }));

        setQuotationData({
          quotations: quotations,
          conversions: quotations.filter(q => q.Stage === 'Won'),
          statusDistribution: statusDistribution
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setCrmData([]);
        setProductData({ products: [], sales: [], inventory: [] });
        setQuotationData({ quotations: [], conversions: [], statusDistribution: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate key metrics with null checks
  const metrics = useMemo(() => {
    const totalSales = (productData?.sales || []).reduce((sum, sale) => sum + (sale?.amount || 0), 0);
    const totalLeads = crmData.length;
    const conversionRate = totalLeads > 0 ? (crmData.filter(lead => lead.Status === 'Won').length / totalLeads) * 100 : 0;
    const totalInventory = (productData?.inventory || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);
    const totalQuotations = (quotationData?.quotations || []).length;
    const quotationConversionRate = totalQuotations > 0 
      ? ((quotationData?.conversions || []).length / totalQuotations) * 100 
      : 0;

    return {
      totalSales,
      totalLeads,
      conversionRate,
      totalInventory,
      totalQuotations,
      quotationConversionRate,
    };
  }, [crmData, productData, quotationData]);

  // Prepare chart data with null checks
  const salesTrendData = useMemo(() => {
    return (productData?.sales || []).map(sale => ({
      date: new Date(sale?.date || new Date()).toLocaleDateString(),
      amount: sale?.amount || 0,
    }));
  }, [productData?.sales]);

  const leadConversionData = useMemo(() => {
    // Debug logs
    console.log('CRM Data in leadConversionData:', crmData);
    
    // Ensure we have valid data
    if (!Array.isArray(crmData) || crmData.length === 0) {
      console.log('No CRM data available');
      return [];
    }

    // Log all unique status values to debug
    const uniqueStatuses = [...new Set(crmData.map(lead => lead.Status))];
    console.log('Unique Status values in CRM data:', uniqueStatuses);

    // Count leads for each stage with case-insensitive comparison
    const newLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'new' || 
      lead.stage?.toLowerCase() === 'new'
    ).length;
    
    const qualifiedLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'qualified' || 
      lead.stage?.toLowerCase() === 'qualified'
    ).length;
    
    const proposalSentLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'proposal sent' || 
      lead.stage?.toLowerCase() === 'proposal sent'
    ).length;
    
    const negotiationLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'negotiation' || 
      lead.stage?.toLowerCase() === 'negotiation'
    ).length;
    
    const wonLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'won' || 
      lead.stage?.toLowerCase() === 'won'
    ).length;
    
    const lostLeads = crmData.filter(lead => 
      lead.Status?.toLowerCase() === 'lost' || 
      lead.stage?.toLowerCase() === 'lost'
    ).length;
    
    console.log('Lead counts:', {
      newLeads,
      qualifiedLeads,
      proposalSentLeads,
      negotiationLeads,
      wonLeads,
      lostLeads,
      totalLeads: crmData.length
    });

    // Only return data if we have at least one lead
    if (newLeads === 0 && qualifiedLeads === 0 && proposalSentLeads === 0 && 
        negotiationLeads === 0 && wonLeads === 0 && lostLeads === 0) {
      console.log('No leads found in any stage');
      return [];
    }

    const data = [
      { name: "New", value: newLeads },
      { name: "Qualified", value: qualifiedLeads },
      { name: "Proposal Sent", value: proposalSentLeads },
      { name: "Negotiation", value: negotiationLeads },
      { name: "Won", value: wonLeads },
      { name: "Lost", value: lostLeads }
    ].filter(item => item.value > 0); // Only include stages with leads
    
    console.log('Final leadConversionData:', data);
    return data;
  }, [crmData]);

  const inventoryStatusData = useMemo(() => {
    return (productData?.inventory || []).map(item => ({
      name: item?.name || 'Unknown',
      quantity: item?.quantity || 0,
      status: (item?.quantity || 0) < (item?.minQuantity || 0) ? "Low" : "Good",
    }));
  }, [productData?.inventory]);

  if (isLoading) {
    return (
      <div className="p-6 bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DotSpinner />
          <p className="text-text-secondary mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Sales Dashboard</h1>
        <p className="text-text-secondary">Comprehensive overview of sales performance and metrics</p>
      </div>

      {/* Shortcut Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <NavLink
          to="/crm"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <Users className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">CRM</span>
        </NavLink>
        <NavLink
          to="/products"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <Boxes className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Products</span>
        </NavLink>
        <NavLink
          to="/quatation"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <FileSignature className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Quotation</span>
        </NavLink>
        <NavLink
          to="/purchase"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <ShoppingCart className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Purchase</span>
        </NavLink>
        <NavLink
          to="/inventory"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <Boxes className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Inventory</span>
        </NavLink>
        <NavLink
          to="/supplier"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <Truck className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Supplier</span>
        </NavLink>
        <NavLink
          to="/cashbook"
          className="flex flex-col items-center justify-center p-4 bg-surface rounded-lg hover:bg-primary-light transition-colors border border-border"
        >
          <BookOpen className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-text-secondary">Cashbook</span>
        </NavLink>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString()}`}
        />
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={<Users className="h-6 w-6 text-primary" />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6 text-primary" />}
        />
        <MetricCard
          title="Total Inventory"
          value={metrics.totalInventory}
          icon={<Package className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS[0]} />
              <XAxis dataKey="date" stroke={COLORS[1]} />
              <YAxis stroke={COLORS[1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#D9C9D6",
                  color: "#2D2D2D"
                }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={COLORS[0]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Lead Conversion Funnel */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Lead Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={300}>
            {leadConversionData.length > 0 ? (
              <PieChart>
                <Pie
                  data={leadConversionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {leadConversionData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D9C9D6",
                    color: "#2D2D2D"
                  }}
                  formatter={(value, name) => [`${value} leads`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-text-secondary">{value}</span>}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">No lead data available</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Inventory Status */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Inventory Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS[0]} />
              <XAxis dataKey="name" stroke={COLORS[1]} />
              <YAxis stroke={COLORS[1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderColor: "#D9C9D6",
                  color: "#2D2D2D"
                }}
              />
              <Bar dataKey="quantity" fill={COLORS[0]}>
                {inventoryStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.status === "Low" ? "#EF4444" : COLORS[0]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quotation Status Distribution */}
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quotation Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            {quotationData.statusDistribution.length > 0 ? (
              <PieChart>
                <Pie
                  data={quotationData.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value, percent }) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {quotationData.statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={QUOTATION_COLORS[index % QUOTATION_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#D9C9D6",
                    color: "#2D2D2D"
                  }}
                  formatter={(value, name) => [`${value} quotations`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span className="text-text-secondary">{value}</span>}
                />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-text-muted">No quotation data available</p>
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary-light rounded-lg">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        {trendUp ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ml-1 ${trendUp ? "text-green-500" : "text-red-500"}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}
