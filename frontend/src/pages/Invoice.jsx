"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backEndURL } from "../Backendurl";
import DotSpinner from "../loaders/Loader";

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`px-6 py-4 rounded-lg shadow-lg border-l-4 ${
          type === "success"
            ? "bg-green-800 border-green-500 text-green-100"
            : type === "error"
            ? "bg-red-800 border-red-500 text-red-100"
            : "bg-blue-800 border-blue-500 text-blue-100"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-4 text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Billing POS Component
const BillingPOSSystem = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedPriceType, setSelectedPriceType] = useState("standard");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState({ type: "amount", value: 0 });
  const [taxRate, setTaxRate] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(["All"]);

  // Toast state
  const [toast, setToast] = useState({
    message: "",
    type: "",
    isVisible: false,
  });

  const barcodeRef = useRef(null);

  // Add new state variables
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [dailySales, setDailySales] = useState({ total: 0, count: 0 });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: "cash", name: "Cash", icon: "💵" },
    { id: "card", name: "Card", icon: "💳" },
    { id: "mobile", name: "Mobile Pay", icon: "📱" },
    { id: "credit", name: "Credit", icon: "📝" },
  ]);
  const [selectedDateRange, setSelectedDateRange] = useState("today");

  const [heldBills, setHeldBills] = useState([]);
  const [splitBills, setSplitBills] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Add new state for active tab
  const [activeTab, setActiveTab] = useState("pos"); 

  // Add new state for invoice list
  const [invoices, setInvoices] = useState([]);
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState("");
  const [invoiceDateRange, setInvoiceDateRange] = useState("all");
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Define refreshProductData before any useEffect hooks
  const refreshProductData = async () => {
    try {
      // Fetch products
      const productsResponse = await fetch(`${backEndURL}/api/products`);
      const productsData = await productsResponse.json();

      // Fetch inventory
      const inventoryResponse = await fetch(`${backEndURL}/api/inventory`);
      const inventoryData = await inventoryResponse.json();

      // Combine products with inventory data
      const combinedProducts = productsData.map((product) => {
        // Find matching inventory record
        const inventory = inventoryData.find(
          (inv) => inv.productId === product.id
        );

        return {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          category: product.category,
          stock: inventory ? inventory.totalQuantity : 0,
          standardPrice: product.salesPrice,
          wholesalePrice: product.marginPrice,
          retailPrice: product.retailPrice,
          cost: product.costPrice,
          description: product.description,
          image: product.imageUrl,
        };
      });

      setProducts(combinedProducts);
    } catch (error) {
      console.error("Error refreshing product data:", error);
      showToast("Failed to refresh product data", "error");
    }
  };

  // Fetch products and inventory data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await refreshProductData();

        // Fetch customers from /api/contacts (only those with categoryType === "Customer")
        const customersResponse = await fetch(`${backEndURL}/api/contacts`);
        const contactsData = await customersResponse.json();
        const customerContacts = contactsData.filter(
          (c) => c.categoryType === "Customer"
        );
        setCustomers(customerContacts);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        showToast("Failed to load products", "error");
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch categories from products API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${backEndURL}/api/products`);
        const products = await response.json();
        const uniqueCategories = Array.from(
          new Set(products.map((p) => p.category).filter(Boolean))
        );
        setCategories(["All", ...uniqueCategories]);
      } catch (error) {
        setCategories(["All"]);
      }
    };
    fetchCategories();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            barcodeRef.current?.focus();
            break;
          case "v":
            e.preventDefault();
            if (cart.length > 0) setShowPayment(true);
            break;
          case "d":
            e.preventDefault();
            setSelectedPriceType((prev) =>
              prev === "standard"
                ? "wholesale"
                : prev === "wholesale"
                ? "retail"
                : "standard"
            );
            break;
          case "c":
            e.preventDefault(); // Prevent browser tab open
            clearCart();
            break;
          case "f":
            e.preventDefault();
            setShowProductsModal(true);
            break;
        }
      }
      // ESC key closes overlays or clears cart if no overlay
      if (e.key === "Escape") {
        if (showPayment) setShowPayment(false);
        else if (showInvoice) setShowInvoice(false);
        else if (showProductsModal) setShowProductsModal(false);
        else if (showCustomerModal) setShowCustomerModal(false);
        else if (showInvoiceDetails) setShowInvoiceDetails(false);
        else if (cart.length > 0) clearCart();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    cart.length,
    showPayment,
    showInvoice,
    showProductsModal,
    showCustomerModal,
    showInvoiceDetails,
  ]);

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, isVisible: false });
  };

  // Effect to update cart prices when price type changes
  useEffect(() => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (product) {
          const priceKey = `${selectedPriceType}Price`;
          return {
            ...item,
            price: product[priceKey],
          };
        }
        return item;
      })
    );
  }, [selectedPriceType, products]);

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount =
    discount.type === "percentage"
      ? (subtotal * discount.value) / 100
      : discount.value;
  const totalDiscount = discountAmount;
  const taxableAmount = subtotal - totalDiscount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const grandTotal = taxableAmount + taxAmount;

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product) => {
    const priceKey = `${selectedPriceType}Price`;
    const price = product[priceKey];

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showToast(
          `Cannot add more than available stock (${product.stock})`,
          "error"
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (product.stock <= 0) {
        showToast("Product is out of stock", "error");
        return;
      }
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: price,
          quantity: 1,
          barcode: product.barcode,
          category: product.category,
        },
      ]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (newQuantity > product.stock) {
      showToast(
        `Cannot set quantity more than available stock (${product.stock})`,
        "error"
      );
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setDiscount({ type: "amount", value: 0 });
    setSelectedCustomer(null);
    showToast("Cart cleared", "info");
  };

  // Handle barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim());
      if (product) {
        addToCart(product);
        showToast(`Product found: ${product.name}`, "success");
        setBarcodeInput("");
      } else {
        showToast("Product not found", "error");
        setBarcodeInput("");
      }
    }
  };

  // Add new functions for advanced features
  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch(`${backEndURL}/api/purchases`);
      const data = await response.json();
      setPurchaseHistory(data);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
    }
  };

  const checkLowStock = () => {
    const alerts = products.filter((product) => product.stock <= 5);
    setLowStockAlerts(alerts);
  };

  const calculateDailySales = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaySales = purchaseHistory.filter(
      (purchase) => purchase.createdAt.split("T")[0] === today
    );

    const total = todaySales.reduce((sum, purchase) => sum + purchase.total, 0);
    setDailySales({ total, count: todaySales.length });
  };

  // Enhanced completePayment function
  const completePayment = async (paymentData) => {
    try {
      // Prepare invoice items with only product id, quantity, price, and name
      const invoiceItems = cart.map((item) => ({
        id: item.id, // product id
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        category: item.category,
        barcode: item.barcode,
      }));

      const invoice = {
        date: new Date(),
        items: invoiceItems,
        customer: selectedCustomer ? { id: selectedCustomer.id } : null,
        subtotal,
        discountAmount: totalDiscount,
        taxAmount,
        total: grandTotal,
        payments: paymentData.payments,
        change: paymentData.change,
      };

      // Save to backend (POST to /api/invoices)
      const response = await fetch(`${backEndURL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice");
      }

      const savedInvoice = await response.json();

      setCurrentInvoice({
        ...invoice,
        id: savedInvoice.id,
        date: new Date(savedInvoice.createdAt || invoice.date),
        createdAt: savedInvoice.createdAt || new Date().toISOString(),
      });

      // Refresh product data after successful sale
      await refreshProductData();

      setShowInvoice(true);
      setShowPayment(false);
      clearCart();
      showToast("Payment completed successfully", "success");

      // Refresh data
      fetchInvoices();
      checkLowStock();
      calculateDailySales();
    } catch (error) {
      console.error("Error completing payment:", error);
      showToast("Failed to complete payment", "error");
    }
  };

  // Add function to fetch invoices
  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${backEndURL}/api/invoices`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast("Failed to load invoices", "error");
    }
  };

  // Add useEffect to fetch invoices
  useEffect(() => {
    if (activeTab === "invoices") {
      fetchInvoices();
    }
  }, [activeTab]);

  // Add new InvoicesList component
  const InvoicesList = () => {
    const filteredInvoices = invoices.filter((invoice) => {
      const matchesSearch =
        invoice.id.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        (invoice.customer &&
          invoice.customer.name
            .toLowerCase()
            .includes(invoiceSearchTerm.toLowerCase()));

      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();

      switch (invoiceDateRange) {
        case "today":
          return (
            matchesSearch && invoiceDate.toDateString() === now.toDateString()
          );
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return matchesSearch && invoiceDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return matchesSearch && invoiceDate >= monthAgo;
        default:
          return matchesSearch;
      }
    });

    return (
      <div className="space-y-6">
        {/* Search and Filter Controls */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={invoiceSearchTerm}
                onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                placeholder="Search by invoice number or customer..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={invoiceDateRange}
                onChange={(e) => setInvoiceDateRange(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedInvoice(invoice);
                  setShowInvoiceDetails(true);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">
                      Invoice #{invoice.id}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(invoice.createdAt).toLocaleString()}
                    </div>
                    {invoice.customer && (
                      <div className="text-sm text-gray-400 mt-1">
                        Customer: {invoice.customer.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">
                      Rs {invoice.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {invoice.items.length} items
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No invoices found
            </div>
          )}
        </div>
      </div>
    );
  };

  // Print-specific CSS to hide modal overlay and buttons during print
  const printStyles = `
  @media print {
    html, body {
      height: 100%;
      margin: 0 !important;
      padding: 0 !important;
      width: 100vw !important;
      background: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box;
      overflow: visible !important;
    }
    #printable-invoice {
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      min-width: 210mm !important;
      max-width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      background: white !important;
      color: black !important;
      z-index: 9999 !important;
      box-shadow: none !important;
      margin: 0 auto !important;
      padding: 0 !important;
      overflow: visible !important;
      page-break-inside: avoid !important;
    }
    #printable-invoice * {
      visibility: visible !important;
      color: black !important;
      box-shadow: none !important;
      background: transparent !important;
      page-break-inside: avoid !important;
    }
    .no-print {
      display: none !important;
    }
    .bg-white, .text-black, .rounded-lg, .mb-6, .p-8 {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
    table, th, td {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
  }
  `;

  // Notes and Terms
  const [notesTerms, setNotesTerms] = useState({ notes: "", terms: [] });
  useEffect(() => {
    axios
      .get(`${backEndURL}/api/additional/notes-terms`)
      .then((res) => {
        if (res.data) {
          setNotesTerms({
            notes: res.data.notes || "",
            terms: Array.isArray(res.data.terms) ? res.data.terms : [],
          });
        }
      })
      .catch(() => setNotesTerms({ notes: "", terms: [] }));
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <DotSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Status Bar */}

      {/* Shortcuts Info Box */}
      {activeTab === "pos" && (
        <div className="container mx-auto px-4 mt-4 mb-2">
          <div className="bg-blue-900/80 border border-blue-700 rounded-lg p-4 flex flex-wrap gap-4 items-center shadow">
            <div className="font-semibold text-blue-200 mr-4">Shortcuts:</div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Ctrl+B
              </span>{" "}
              <span className="text-blue-200">Focus Barcode</span>
              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Ctrl+V
              </span>{" "}
              <span className="text-blue-200">Checkout</span>
              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Ctrl+D
              </span>{" "}
              <span className="text-blue-200">Switch Price Type</span>
              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Ctrl+C
              </span>
              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Esc
              </span>{" "}
              <span className="text-blue-200">Clear Cart</span>

              <span className="bg-blue-700 text-white px-2 py-1 rounded">
                Ctrl+F
              </span>{" "}
              <span className="text-blue-200">Show Products</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <DotSpinner />
            <div className="text-white text-lg mt-4">Loading products...</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "pos"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            POS System
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "invoices"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Invoices
          </button>
        </div>

        {activeTab === "pos" ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Products Section */}
            <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6 relative">
              {/* Floating Show Products Button */}
              <button
                onClick={() => setShowProductsModal(true)}
                className="absolute top-8 right-6 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                title="Show All Products"
              >
                <span
                  className="material-icons align-middle"
                  style={{ fontSize: 24 }}
                >
                  Products
                </span>
              </button>

              {/* Barcode Scanner */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Barcode Scanner
                </label>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeScan}
                  placeholder="Scan or enter barcode..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search and Category Filter */}
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-48 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriceType}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                  className="w-40 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                </select>
              </div>

              {/* Product Grid Section */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  Available Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center text-gray-400 py-8">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          product={product}
                          onAddToCart={addToCart}
                          selectedPriceType={selectedPriceType}
                        />
                        {/* Low Stock Badge */}
                        {product.stock <= 5 && (
                          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                            Low
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right: Shopping Cart Section */}
            <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Shopping Cart
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomerSearch(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selectedCustomer ? "Change Customer" : "Select Customer"}
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Show selected customer details if any */}
              {selectedCustomer && (
                <div className="mb-4 p-3 rounded bg-gray-700 border border-gray-600 text-white">
                  <div className="font-semibold">Customer:</div>
                  <div>{selectedCustomer.name}</div>
                  {selectedCustomer.phone && (
                    <div>📞 {selectedCustomer.phone}</div>
                  )}
                  {selectedCustomer.email && (
                    <div>✉️ {selectedCustomer.email}</div>
                  )}
                  {selectedCustomer.company && (
                    <div>🏢 {selectedCustomer.company}</div>
                  )}
                </div>
              )}

              {/* Cart Items with Enhanced Features */}
              <div className="flex-1 min-h-0 overflow-y-auto mb-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    Cart is empty
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="relative group">
                      <CartItem
                        item={item}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        onSelect={() => {
                          if (selectedItems.includes(item.id)) {
                            setSelectedItems(
                              selectedItems.filter((id) => id !== item.id)
                            );
                          } else {
                            setSelectedItems([...selectedItems, item.id]);
                          }
                        }}
                        isSelected={selectedItems.includes(item.id)}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Batch Actions */}
              {selectedItems.length > 0 && (
                <div className="bg-gray-700 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">
                      {selectedItems.length} items selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          selectedItems.forEach((id) => removeFromCart(id));
                          setSelectedItems([]);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove Selected
                      </button>
                      {/* <button
                        onClick={() => {
                          const selectedCartItems = cart.filter(item => selectedItems.includes(item.id))
                          handleBatchPayment(selectedCartItems)
                          setSelectedItems([])
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pay Selected
                      </button> */}
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Summary (Always visible at the bottom) */}
              {cart.length > 0 && (
                <div className="space-y-2 text-sm border-t border-gray-600 pt-4 bg-gray-800 z-10">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  {discount.value > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Manual Discount:</span>
                      <span>
                        -Rs{" "}
                        {(discount.type === "percentage"
                          ? (subtotal * discount.value) / 100
                          : discount.value
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Tax ({taxRate}%):</span>
                    <span>Rs {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-white border-t border-gray-600 pt-2">
                    <span>Total:</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold transition-colors mt-2"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={clearCart}
                     className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold transition-colors mt-2"
                    title="Clear Cart (ESC)"
                  >
                    Clear Cart
                  </button>
                  {/* Tax and Discount Table */}
                  <div className="mt-4 bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">
                      Tax & Discount Details
                    </h3>
                    <div className="space-y-3">
                      {/* Tax Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Tax Rate (%)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => setTaxRate(0)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Discount Table */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Discount
                        </label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <select
                              value={discount.type}
                              onChange={(e) =>
                                setDiscount({
                                  ...discount,
                                  type: e.target.value,
                                })
                              }
                              className="w-1/3 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="amount">Amount</option>
                              <option value="percentage">Percentage</option>
                            </select>
                            <input
                              type="number"
                              value={discount.value}
                              onChange={(e) =>
                                setDiscount({
                                  ...discount,
                                  value: Number(e.target.value),
                                })
                              }
                              min="0"
                              step="0.01"
                              placeholder={
                                discount.type === "percentage"
                                  ? "Enter percentage"
                                  : "Enter amount"
                              }
                              className="w-2/3 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            onClick={() =>
                              setDiscount({ type: "amount", value: 0 })
                            }
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                          >
                            Clear Discount
                          </button>
                        </div>
                      </div>

                      {/* Quick Discount Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Quick Discounts
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[5, 10, 15, 20].map((percent) => (
                            <button
                              key={percent}
                              onClick={() =>
                                setDiscount({
                                  type: "percentage",
                                  value: percent,
                                })
                              }
                              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                            >
                              {percent}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <InvoicesList />
        )}
      </div>

      {/* Modals */}
      {showPayment && (
        <PaymentModal
          grandTotal={grandTotal}
          subtotal={subtotal}
          taxRate={taxRate}
          discount={discount}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={completePayment}
        />
      )}

      {showInvoice && currentInvoice && (
        <InvoiceModal
          invoice={currentInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {showProductsModal && (
        <ProductsModal
          products={products}
          categories={categories}
          selectedPriceType={selectedPriceType}
          onAddToCart={addToCart}
          onClose={() => setShowProductsModal(false)}
        />
      )}


      <LowStockAlerts
        alerts={lowStockAlerts}
        onClose={() => setLowStockAlerts([])}
      />

      {/* Add Invoice Details Modal */}
      {showInvoiceDetails && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceDetails(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {showCustomerSearch && (
        <CustomerModal
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          onClose={() => setShowCustomerSearch(false)}
        />
      )}
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, selectedPriceType }) => {
  const priceKey = `${selectedPriceType}Price`;
  const currentPrice = product[priceKey] || 0;
  const isLowStock = product.stock <= product.minStock;

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-all duration-200">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-white text-sm leading-tight">
            {product.name}
          </h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              isLowStock
                ? "bg-red-900 text-red-200"
                : "bg-green-900 text-green-200"
            }`}
          >
            {product.stock}
          </span>
        </div>

        <div className="text-xs text-gray-400">
          <div>SKU: {product.barcode}</div>
          <div>Category: {product.category}</div>
        </div>

        <div className="text-lg font-bold text-blue-400">
          Rs {currentPrice.toFixed(2)}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
            product.stock === 0
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

// Cart Item Component
const CartItem = ({
  item,
  updateQuantity,
  removeFromCart,
  onSelect,
  isSelected,
}) => {
  return (
    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">
            {item.name}
          </h4>
          <div className="text-xs text-gray-400">
            Rs {item.price.toFixed(2)} each • {item.category}
          </div>
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-400 hover:text-red-300 ml-2 p-1"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 bg-gray-600 rounded text-white hover:bg-gray-500 flex items-center justify-center"
          >
            -
          </button>

          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.id, Number.parseInt(e.target.value) || 0)
            }
            className="w-16 text-center text-sm bg-gray-600 border border-gray-500 rounded text-white"
            min="0"
          />

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 bg-gray-600 rounded text-white hover:bg-gray-500 flex items-center justify-center"
          >
            +
          </button>
        </div>

        <div className="text-right">
          <div className="font-medium text-white">
            Rs {(item.price * item.quantity).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">
            {item.quantity} × Rs {item.price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal = ({
  grandTotal,
  subtotal,
  taxRate,
  discount,
  onClose,
  onPaymentComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  const quickAmounts = [1000, 2000, 5000, 10000];
  const changeAmount = Number.parseFloat(amountReceived) - grandTotal;

  const handleQuickAmount = (amount) => {
    setAmountReceived(amount.toString());
  };

  const handleCardInput = (field, value) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    }
    // Format expiry date
    else if (field === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .substr(0, 5);
    }
    // Format CVV
    else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substr(0, 3);
    }

    setCardDetails((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const completePayment = () => {
    if (paymentMethod === "cash") {
      const finalAmount = Number.parseFloat(amountReceived) || 0;
      if (finalAmount >= grandTotal) {
        onPaymentComplete({
          payments: [
            {
              method: paymentMethod,
              amount: finalAmount,
              timestamp: new Date(),
            },
          ],
          change: changeAmount > 0 ? changeAmount : 0,
        });
      }
    } else {
      // Validate card details
      if (
        cardDetails.number.replace(/\s/g, "").length === 16 &&
        cardDetails.expiry.length === 5 &&
        cardDetails.cvv.length === 3
      ) {
        onPaymentComplete({
          payments: [
            {
              method: paymentMethod,
              amount: grandTotal,
              timestamp: new Date(),
              cardDetails: {
                last4: cardDetails.number.slice(-4),
                expiry: cardDetails.expiry,
              },
            },
          ],
          change: 0,
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Payment Processing
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Summary Section - More Compact */}
        <div className="space-y-1 mb-4 p-3 bg-gray-700 rounded-lg text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal:</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          {discount.value > 0 && (
            <div className="flex justify-between text-red-400">
              <span>Discount:</span>
              <span>
                -Rs{" "}
                {discount.type === "percentage"
                  ? (subtotal * discount.value) / 100
                  : discount.value}
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-300">
            <span>Tax ({taxRate}%):</span>
            <span>Rs {(subtotal * (taxRate / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-white border-t border-gray-600 pt-1 mt-1">
            <span>Total:</span>
            <span>Rs {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`p-3 rounded-lg border-2 ${
                paymentMethod === "cash"
                  ? "border-blue-500 bg-blue-900 text-white"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`p-3 rounded-lg border-2 ${
                paymentMethod === "card"
                  ? "border-blue-500 bg-blue-900 text-white"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              Card
            </button>
          </div>
        </div>

        {paymentMethod === "card" ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => handleCardInput("number", e.target.value)}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                maxLength="19"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInput("expiry", e.target.value)}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInput("cvv", e.target.value)}
                  placeholder="123"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Quick Amounts */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quick Amounts
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Rs {amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount Received
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder={`Rs ${grandTotal.toFixed(2)}`}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-lg focus:ring-2 focus:ring-blue-500"
                step="0.01"
              />
            </div>

            {/* Change Amount Display */}
            {Number.parseFloat(amountReceived) > grandTotal && (
              <div className="mb-6 p-4 bg-green-900 border border-green-700 rounded-lg">
                <div className="flex justify-between font-bold text-green-200 text-lg">
                  <span>Change Due:</span>
                  <span>Rs {changeAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={completePayment}
            disabled={
              paymentMethod === "cash"
                ? Number.parseFloat(amountReceived) < grandTotal
                : !(
                    cardDetails.number.replace(/\s/g, "").length === 16 &&
                    cardDetails.expiry.length === 5 &&
                    cardDetails.cvv.length === 3
                  )
            }
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// Invoice Modal Component
const InvoiceModal = ({ invoice, onClose }) => {
  const [customerDetails, setCustomerDetails] = useState(null);
  const printableRef = useRef();

  useEffect(() => {
    // Inject print styles on mount
    let styleTag = document.getElementById("invoice-print-style");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "invoice-print-style";
      // styleTag.innerHTML = printStyles;
      document.head.appendChild(styleTag);
    }
    return () => {
      // Optionally remove style on unmount
      // if (styleTag) styleTag.remove();
    };
  }, []);

  useEffect(() => {
    // Fetch customer details if invoice.customer?.id exists
    const fetchCustomer = async () => {
      if (invoice.customer && invoice.customer.id) {
        try {
          const res = await fetch(
            `${backEndURL}/api/contacts/${invoice.customer.id}`
          );
          if (res.ok) {
            const data = await res.json();
            setCustomerDetails(data);
          }
        } catch (e) {
          setCustomerDetails(null);
        }
      } else {
        setCustomerDetails(null);
      }
    };
    fetchCustomer();
  }, [invoice.customer]);

  const printInvoice = () => {
    // Scroll to invoice, then print
    setTimeout(() => {
      if (printableRef.current) {
        printableRef.current.scrollIntoView({ behavior: "instant" });
      }
      window.print();
    }, 100);
  };

  // Fix: Ensure invoice.date is a Date object
  let invoiceDateObj;
  if (invoice.date instanceof Date) {
    invoiceDateObj = invoice.date;
  } else if (
    typeof invoice.date === "string" ||
    typeof invoice.date === "number"
  ) {
    invoiceDateObj = new Date(invoice.date);
  } else if (invoice.createdAt) {
    invoiceDateObj = new Date(invoice.createdAt);
  } else {
    invoiceDateObj = new Date();
  }

  // Notes and Terms
  const [notesTerms, setNotesTerms] = useState({ notes: "", terms: [] });
  useEffect(() => {
    axios
      .get(`${backEndURL}/api/additional/notes-terms`)
      .then((res) => {
        if (res.data) {
          setNotesTerms({
            notes: res.data.notes || "",
            terms: Array.isArray(res.data.terms) ? res.data.terms : [],
          });
        }
      })
      .catch(() => setNotesTerms({ notes: "", terms: [] }));
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 no-print">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Invoice</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Printable Invoice Content */}
        <div
          id="printable-invoice"
          ref={printableRef}
          className="bg-white text-black p-8 rounded-lg mb-6"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              {/* Logo and Company Info */}
              <div className="flex items-center mb-2">
                <img
                  src="images/logo.jpg"
                  alt="R-tech Solution Logo"
                  className="h-12 w-12 mr-3"
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <h1 className="text-3xl font-bold text-blue-600">
                  R-tech Solution
                </h1>
              </div>
              <div className="text-gray-600 text-sm">
                <p>262 Peradeniya road, Kandy</p>
                <p>Phone: +94 11 123 4567</p>
                <p>Email: support@srilankapos.com</p>
              </div>
              {/* Bill To Section */}
              {(customerDetails ||
                (invoice.customer && invoice.customer.id)) && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="font-semibold text-blue-800 mb-1">
                    Bill To:
                  </div>
                  <div className="text-gray-800">
                    {customerDetails?.name || ""}
                  </div>
                  {customerDetails?.company && (
                    <div className="text-gray-600">
                      {customerDetails.company}
                    </div>
                  )}
                  {customerDetails?.phone && (
                    <div className="text-gray-600">
                      📞 {customerDetails.phone}
                    </div>
                  )}
                  {customerDetails?.email && (
                    <div className="text-gray-600">
                      ✉️ {customerDetails.email}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
              <div className="text-gray-600 text-sm">
                <p>
                  <strong>Invoice #:</strong> {invoice.id}
                </p>
                <p>
                  <strong>Date:</strong> {invoiceDateObj.toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {invoiceDateObj.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-800">
                    Item
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800">
                    Qty
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-800">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-800">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                        {item.barcode && (
                          <div className="text-xs text-gray-400">
                            SKU: {item.barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">
                      Rs {item.price.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Summary Section */}
          <div className="flex flex-col md:flex-row justify-end mb-8 gap-6">
            <div className="w-full md:w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    Rs {invoice.subtotal.toFixed(2)}
                  </span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-red-600">
                    <span>Discount:</span>
                    <span>-Rs {invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">
                    Rs {invoice.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-gray-300">
                  <span>Total:</span>
                  <span>Rs {invoice.total.toFixed(2)}</span>
                </div>
                {/* Payment Method(s) */}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="pt-2">
                    <div className="font-semibold text-gray-700 mb-1">
                      Payment:
                    </div>
                    {invoice.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize">{p.method}</span>
                        <span>Rs {p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {invoice.change > 0 && (
                      <div className="flex justify-between text-green-700 text-sm">
                        <span>Change</span>
                        <span>Rs {invoice.change.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Notes and Terms */}
          <div className="mt-8">
            <div className="mb-4">
              <div className="font-semibold text-gray-700 mb-1">Notes:</div>
              <div className="text-gray-600 text-sm">
                {notesTerms.notes || "—"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-1">
                Terms &amp; Conditions:
              </div>
              <ul className="list-disc pl-5 text-gray-500 text-xs space-y-1">
                {notesTerms.terms && notesTerms.terms.length > 0 ? (
                  notesTerms.terms.map((term, idx) => <li key={idx}>{term}</li>)
                ) : (
                  <li>No terms &amp; conditions set.</li>
                )}
              </ul>
            </div>
          </div>
          {/* Footer */}
          <div className="text-center text-gray-400 text-xs border-t pt-4 mt-8">
            <p>Thank you for your business!</p>
            <p>Powered by R-tech Solution POS</p>
          </div>
        </div>

        <div className="flex gap-3 no-print">
          <button
            onClick={printInvoice}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Customer Modal Component
const CustomerModal = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  onClose,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${backEndURL}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, categoryType: "Customer" }),
      });
      if (!res.ok) throw new Error("Failed to add customer");
      const newCustomer = await res.json();
      setSelectedCustomer(newCustomer);
      setShowAddForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        notes: "",
      });
      // Optionally, update customers list in parent if needed
    } catch (err) {
      setError(err.message || "Error adding customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-white mb-4">
          {showAddForm ? "Add New Customer" : "Select Customer"}
        </h2>
        {showAddForm ? (
          <form onSubmit={handleAddCustomer} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Name"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              type="text"
              placeholder="Website"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600 text-white"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Customer"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {customers.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No customers found
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 rounded-lg cursor-pointer border border-gray-700 hover:bg-blue-800 transition-colors flex justify-between items-center ${
                      selectedCustomer && selectedCustomer.id === customer.id
                        ? "bg-blue-900"
                        : "bg-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="font-medium text-white">
                        {customer.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {customer.email} | {customer.phone}
                      </div>
                    </div>
                    {selectedCustomer &&
                      selectedCustomer.id === customer.id && (
                        <span className="text-green-400 font-bold">✓</span>
                      )}
                  </div>
                ))
              )}
            </div>

            <button
              className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowAddForm(true)}
            >
              + Add New Customer
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ProductsModal = ({
  products,
  categories,
  selectedPriceType,
  onAddToCart,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              selectedPriceType={selectedPriceType}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No products found
          </div>
        )}
      </div>
    </div>
  );
};


// Low Stock Alerts Component
const LowStockAlerts = ({ alerts, onClose }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-medium">Low Stock Alerts</h3>
          <button onClick={onClose} className="text-red-300 hover:text-white">
            ×
          </button>
        </div>
        <div className="space-y-2">
          {alerts.map((product) => (
            <div key={product.id} className="text-red-200 text-sm">
              {product.name}: {product.stock} units remaining
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPOSSystem;
