"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { backEndURL } from "../Backendurl";
import DotSpinner from "../loaders/Loader";

// Print-specific CSS to hide modal overlay and buttons during print
const printStyles = `
@media print {
  html, body {
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    width: 100vw !important;
    background: #FFFFFF !important; /* background */
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
    background: #FFFFFF !important; /* background */
    color: #2D2D2D !important; /* text-primary */
    z-index: 9999 !important;
    box-shadow: none !important;
    margin: 0 auto !important;
    padding: 0 !important;
    overflow: visible !important;
    page-break-inside: avoid !important;
  }
  #printable-invoice * {
    visibility: visible !important;
    color: #2D2D2D !important; /* text-primary */
    box-shadow: none !important;
    background: transparent !important;
    page-break-inside: avoid !important;
  }
  .no-print {
    display: none !important;
  }
  .bg-white, .text-black, .rounded-lg, .mb-6, .p-8 {
    background: #FFFFFF !important; /* background */
    color: #2D2D2D !important; /* text-primary */
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
            ? "bg-primary border-primary-dark text-white"
            : type === "error"
            ? "bg-primary-dark border-primary text-white"
            : "bg-secondary border-border text-text-primary"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{message}</span>
          <button
            onClick={onClose}
            className="ml-4 text-text-secondary hover:text-primary"
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

  // Add new state for search navigation
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Add new state for product grid navigation
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);
  const [isProductGridFocused, setIsProductGridFocused] = useState(false);

  // Add new state for keyboard shortcuts
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Use useMemo to memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

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

  // Modify the keyboard shortcuts effect
  useEffect(() => {
    let lastKeyPress = 0;
    const DOUBLE_PRESS_DELAY = 300; // milliseconds

    const handleKeyPress = (e) => {
      // Check if Ctrl key is pressed
      if (e.ctrlKey) {
        // Prevent default browser behavior for all Ctrl combinations
        e.preventDefault();
        
        // Handle specific Ctrl combinations
        switch (e.key.toLowerCase()) {
          case "l":
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
          case "b":
            e.preventDefault();
            barcodeRef.current?.focus();
            break;
          case "m":
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
          case "k":
            e.preventDefault();
            setShowCustomerSearch(true);
            break;
          case "j":
            e.preventDefault();
            setActiveTab("pos");
            break;
          case "i":
            e.preventDefault();
            setActiveTab("invoices");
            break;
          case "r":
            e.preventDefault();
            window.location.reload();
            break;
          case "f":
            e.preventDefault();
            const currentTime = new Date().getTime();
            if (currentTime - lastKeyPress < DOUBLE_PRESS_DELAY) {
              setShowProductsModal(true);
            } else {
              // Single press - focus search
              const searchInput = document.querySelector('input[placeholder="Search products..."]');
              if (searchInput) {
                searchInput.focus();
                setIsProductGridFocused(true);
                setSelectedProductIndex(0); // Select first product when focusing
              }
            }
            lastKeyPress = currentTime;
            break;
        }
        return; // Exit early after handling Ctrl combinations
      }

      // Handle ESC key separately
      if (e.key === "Escape") {
        e.preventDefault();
        // Close any open modal/popup in order of priority
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
        else if (showPayment) setShowPayment(false);
        else if (showInvoice) setShowInvoice(false);
        else if (showProductsModal) setShowProductsModal(false);
        else if (showCustomerSearch) setShowCustomerSearch(false);
        else if (showInvoiceDetails) setShowInvoiceDetails(false);
        else if (cart.length > 0) clearCart();
      }

      // Handle arrow keys and enter for product grid navigation
      if (isProductGridFocused) {
        const productsPerRow = 2; // Number of products per row in the grid
        const totalRows = Math.ceil(filteredProducts.length / productsPerRow);

        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            setSelectedProductIndex((prev) => {
              if (prev === -1) return 0;
              const currentRow = Math.floor(prev / productsPerRow);
              const nextIndex = prev + 1;
              if (nextIndex < filteredProducts.length && Math.floor(nextIndex / productsPerRow) === currentRow) {
                return nextIndex;
              }
              return prev;
            });
            break;
          case "ArrowLeft":
            e.preventDefault();
            setSelectedProductIndex((prev) => {
              if (prev === -1) return 0;
              const currentRow = Math.floor(prev / productsPerRow);
              const nextIndex = prev - 1;
              if (nextIndex >= 0 && Math.floor(nextIndex / productsPerRow) === currentRow) {
                return nextIndex;
              }
              return prev;
            });
            break;
          case "ArrowDown":
            e.preventDefault();
            setSelectedProductIndex((prev) => {
              if (prev === -1) return 0;
              const currentRow = Math.floor(prev / productsPerRow);
              const nextIndex = prev + productsPerRow;
              if (nextIndex < filteredProducts.length) {
                return nextIndex;
              }
              // If we're at the last row, move to the cart
              if (Math.floor(prev / productsPerRow) === totalRows - 1) {
                const cartItem = cart[0];
                if (cartItem) {
                  const cartItemElement = document.querySelector(`[data-cart-item-id="${cartItem.id}"]`);
                  if (cartItemElement) {
                    cartItemElement.focus();
                  }
                }
              }
              return prev;
            });
            break;
          case "ArrowUp":
            e.preventDefault();
            setSelectedProductIndex((prev) => {
              if (prev === -1) return 0;
              const nextIndex = prev - productsPerRow;
              if (nextIndex >= 0) {
                return nextIndex;
              }
              return prev;
            });
            break;
          case "Enter":
            e.preventDefault();
            if (selectedProductIndex > -1 && filteredProducts[selectedProductIndex]) {
              addToCart(filteredProducts[selectedProductIndex]);
            }
            break;
          case "Escape":
            e.preventDefault();
            setSelectedProductIndex(-1);
            setIsProductGridFocused(false);
            break;
        }
      }

      // Handle arrow keys for cart items
      const activeElement = document.activeElement;
      if (activeElement && activeElement.hasAttribute('data-cart-item-id')) {
        const currentItemId = activeElement.getAttribute('data-cart-item-id');
        const currentItemIndex = cart.findIndex(item => item.id === currentItemId);
        const productsPerRow = 2; // Define productsPerRow here for cart navigation
        
        if (currentItemIndex !== -1) {
          switch (e.key) {
            case "ArrowUp":
              e.preventDefault();
              if (currentItemIndex > 0) {
                const prevItem = cart[currentItemIndex - 1];
                const prevItemElement = document.querySelector(`[data-cart-item-id="${prevItem.id}"]`);
                if (prevItemElement) {
                  prevItemElement.focus();
                }
              } else {
                // If we're at the first cart item, move to the last product row
                const lastRowStart = Math.floor((filteredProducts.length - 1) / productsPerRow) * productsPerRow;
                setSelectedProductIndex(lastRowStart);
                setIsProductGridFocused(true);
              }
              break;
            case "ArrowDown":
              e.preventDefault();
              if (currentItemIndex < cart.length - 1) {
                const nextItem = cart[currentItemIndex + 1];
                const nextItemElement = document.querySelector(`[data-cart-item-id="${nextItem.id}"]`);
                if (nextItemElement) {
                  nextItemElement.focus();
                }
              }
              break;
            case "ArrowLeft":
              e.preventDefault();
              const quantityInput = activeElement.querySelector('input[type="number"]');
              if (quantityInput) {
                const currentValue = parseInt(quantityInput.value) || 0;
                if (currentValue > 1) {
                  updateQuantity(currentItemId, currentValue - 1);
                }
              }
              break;
            case "ArrowRight":
              e.preventDefault();
              const quantityInputRight = activeElement.querySelector('input[type="number"]');
              if (quantityInputRight) {
                const currentValue = parseInt(quantityInputRight.value) || 0;
                const product = products.find(p => p.id === currentItemId);
                if (product && currentValue < product.stock) {
                  updateQuantity(currentItemId, currentValue + 1);
                }
              }
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showKeyboardShortcuts, showPayment, showInvoice, showProductsModal, showCustomerSearch, showInvoiceDetails, cart.length]);

  // Add effect to handle search input focus/blur
  useEffect(() => {
    const searchInput = document.querySelector('input[placeholder="Search products..."]');
    if (searchInput) {
      const handleFocus = () => {
        setIsProductGridFocused(true);
        setSelectedProductIndex(0); // Select first product when focusing
      };
      const handleBlur = () => {
        // Don't reset focus state on blur to maintain keyboard navigation
      };

      searchInput.addEventListener('focus', handleFocus);
      searchInput.addEventListener('blur', handleBlur);

      return () => {
        searchInput.removeEventListener('focus', handleFocus);
        searchInput.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // Add effect to update selected index when filtered products change
  useEffect(() => {
    if (isProductGridFocused && selectedProductIndex >= filteredProducts.length) {
      setSelectedProductIndex(Math.max(0, filteredProducts.length - 1));
    }
  }, [filteredProducts, isProductGridFocused, selectedProductIndex]);

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

  // New function to update individual cart item discounts
  const updateCartItemDiscount = useCallback((itemId, method, value) => {
    setCart(prevCart => 
      prevCart.map((item) =>
        item.id === itemId
          ? {
              ...item,
              discountMethod: method,
              discountValue: value
            }
          : item
      )
    );
  }, []); // Empty dependency array since it only uses setCart which is stable

  // Calculations
  // Helper to calculate the final price of an item after its individual discount
  const getCalculatedItemPrice = useCallback((item) => {
    let finalPrice = item.price;

    if (item.discountMethod === "price") {
      finalPrice = Math.max(0, item.price - item.discountValue);
    } else if (item.discountMethod === "percentage") {
      finalPrice = item.price * (1 - item.discountValue / 100);
    }

    return finalPrice;
  }, []); // Empty dependency array since it only uses item properties

  // Calculate subtotal using discounted prices
  const calculatedSubtotal = useMemo(() => 
    cart.reduce(
      (sum, item) => {
        const discountedPrice = getCalculatedItemPrice(item);
        return sum + (discountedPrice * item.quantity);
      },
      0
    ),
    [cart, getCalculatedItemPrice]
  );

  // Calculate total discount amount
  const discountAmount =
    discount.type === "percentage"
      ? (calculatedSubtotal * discount.value) / 100
      : discount.value;
  const totalDiscount = discountAmount;
  const taxableAmount = calculatedSubtotal - totalDiscount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const grandTotal = taxableAmount + taxAmount;

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
          discountMethod: "none",
          discountValue: 0,
          stock: product.stock
        },
      ]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    const cartItem = cart.find(item => item.id === id);
    if (!cartItem) return;

    if (newQuantity > cartItem.stock) {
      showToast(
        `Cannot set quantity more than available stock (${cartItem.stock})`,
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
      // Prepare invoice items with both original and discounted prices
      const invoiceItems = cart.map((item) => {
        const originalPrice = item.price;
        let discountedPrice = originalPrice;

        if (item.discountMethod === "price") {
          discountedPrice = Math.max(0, originalPrice - item.discountValue);
        } else if (item.discountMethod === "percentage") {
          discountedPrice = originalPrice * (1 - item.discountValue / 100);
        }

        return {
          id: item.id, // product id
          quantity: item.quantity,
          originalPrice: originalPrice,
          discountedPrice: discountedPrice,
          discountMethod: item.discountMethod,
          discountValue: item.discountValue
        };
      });

      const invoice = {
        items: invoiceItems,
        customer: selectedCustomer ? { id: selectedCustomer.id } : null,
        subtotal: calculatedSubtotal,
        discountAmount: totalDiscount,
        taxAmount,
        total: grandTotal,
        paymentMethod: paymentData.method,
        paymentStatus: "Paid",
        cardDetails: paymentData.method === "card" ? {
          cardNumber: paymentData.cardNumber,
          cardType: paymentData.cardType,
          transactionId: paymentData.transactionId
        } : null
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
        <div className="bg-surface rounded-lg border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={invoiceSearchTerm}
                onChange={(e) => setInvoiceSearchTerm(e.target.value)}
                placeholder="Search by invoice number or customer..."
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <select
                value={invoiceDateRange}
                onChange={(e) => setInvoiceDateRange(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
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
        <div className="bg-surface rounded-lg border border-border p-6">
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-background rounded-lg p-4 hover:bg-primary-light/50 cursor-pointer transition-colors border border-border"
                onClick={() => {
                  setSelectedInvoice(invoice);
                  setShowInvoiceDetails(true);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-text-primary">
                      Invoice #{invoice.id}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {new Date(invoice.createdAt).toLocaleString()}
                    </div>
                    {invoice.customer && (
                      <div className="text-sm text-text-secondary mt-1">
                        Customer: {invoice.customer.name}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">
                      Rs {invoice.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-text-secondary">
                      {invoice.items.length} items
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              No invoices found
            </div>
          )}
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen bg-background text-text-primary">
      {/* Floating Keyboard Shortcuts Button */}
      {activeTab === "pos" && (
        <button
          onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
          className="fixed bottom-4 right-4 z-50 bg-primary hover:bg-primary-dark text-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-105"
          title="Keyboard Shortcuts"
        >
          <span className="material-icons">X</span>
        </button>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Keyboard Shortcuts</h2>
              <button 
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-text-secondary hover:text-primary text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+B:</span>
                <span className="text-gray-600">Focus Barcode</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+M:</span>
                <span className="text-gray-600">Checkout</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+D:</span>
                <span className="text-gray-600">Switch Price Type</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+K:</span>
                <span className="text-gray-600">Select Customer</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+J:</span>
                <span className="text-gray-600">POS System</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+I:</span>
                <span className="text-gray-600">Invoices</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-gray-700">Ctrl+R:</span>
                <span className="text-gray-600">Refresh Page</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-700">Esc:</span>
                <span className="text-gray-600">Close/Clear</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-700">Ctrl+F:</span>
                <span className="text-gray-600">Search Products</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-700">Ctrl+F+F:</span>
                <span className="text-gray-600">Show Products</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}

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
          <div className="bg-background p-6 rounded-lg">
            <DotSpinner />
            <div className="text-text-primary text-lg mt-4">Loading products...</div>
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
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-primary-light"
            }`}
          >
            POS System
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === "invoices"
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-primary-light"
            }`}
          >
            Invoices
          </button>
        </div>

        {activeTab === "pos" ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Products Section */}
            <div className="flex-1 bg-surface rounded-lg border border-border p-6 relative">
              {/* Floating Show Products Button */}
              <button
                onClick={() => setShowProductsModal(true)}
                className="top-0 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-light"
                title="Show All Products"
              >
                <span
                  className="material-icons align-middle"
                  style={{ fontSize: 24 }}
                >
                  Products
                </span>
              </button>
              <br/> 
              {/* Barcode Scanner */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Barcode Scanner
                </label>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeScan}
                  placeholder="Scan or enter barcode..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Search and Category Filter */}
              <div className="flex flex-col md:flex-row gap-2 mb-4">
                <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedSearchIndex(-1);
                    }}
                  placeholder="Search products..."
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary"
                  />
                  {isSearchFocused && searchTerm && (
                    <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className={`p-2 cursor-pointer ${
                            index === selectedSearchIndex
                              ? "bg-primary text-white"
                              : "hover:bg-primary-light"
                          }`}
                          onClick={() => {
                            addToCart(product);
                            setSearchTerm("");
                            setSelectedSearchIndex(-1);
                            setIsSearchFocused(false);
                          }}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm">
                            {product.category} • Rs {product[`${selectedPriceType}Price`].toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {filteredProducts.length === 0 && (
                        <div className="p-2 text-text-muted">No products found</div>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-48 px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
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
                  className="w-40 px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="standard">Standard</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                </select>
              </div>

              {/* Product Grid Section */}
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Available Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full text-center text-text-muted py-8">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <div key={product.id} className="relative group">
                        <ProductCard
                          product={product}
                          onAddToCart={addToCart}
                          selectedPriceType={selectedPriceType}
                          isSelected={index === selectedProductIndex}
                        />
                        {product.stock <= 5 && (
                          <span className="absolute top-2 right-2 bg-primary-dark text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
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
            <div className="flex-1 bg-surface rounded-lg border border-border p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-text-primary">
                  Shopping Cart
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomerSearch(true)}
                    className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    {selectedCustomer ? "Change Customer" : "Select Customer"}
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-3 py-1 bg-primary-dark text-white rounded hover:bg-primary"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Show selected customer details if any */}
              {selectedCustomer && (
                <div className="mb-4 p-3 rounded bg-primary-light/50 border border-primary-light text-text-primary">
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
                  <div className="text-center py-4 text-text-muted">
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
                        onUpdateItemDiscount={(id, type, value) => {
                          updateCartItemDiscount(id, type, value);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Batch Actions */}
              {selectedItems.length > 0 && (
                <div className="bg-primary-light/50 p-3 rounded-lg mb-4 border border-primary-light">
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary">
                      {selectedItems.length} items selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          selectedItems.forEach((id) => removeFromCart(id));
                          setSelectedItems([]);
                        }}
                        className="px-3 py-1 bg-primary-dark text-white rounded hover:bg-primary"
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
                <div className="space-y-2 text-sm border-t border-border pt-4 bg-surface z-10">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal:</span>
                    <span className="text-text-primary">Rs {calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  {discount.value > 0 && (
                    <div className="flex justify-between text-primary-dark">
                      <span>Manual Discount:</span>
                      <span>
                        -Rs{" "}
                        {(discount.type === "percentage"
                          ? (calculatedSubtotal * discount.value) / 100
                          : discount.value
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-secondary">
                    <span>Tax ({taxRate}%):</span>
                    <span className="text-text-primary">Rs {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-primary border-t border-border pt-2">
                    <span>Total:</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark font-semibold transition-colors mt-2"
                  >
                    Checkout
                  </button>
                  <button
                    onClick={clearCart}
                     className="w-full bg-primary-dark text-white py-3 px-4 rounded-lg hover:bg-primary font-semibold transition-colors mt-2"
                    title="Clear Cart (ESC)"
                  >
                    Clear Cart
                  </button>
                  {/* Tax and Discount Table */}
                  <div className="mt-4 bg-primary-light/20 rounded-lg p-4 border border-primary-light">
                    <h3 className="text-primary-dark font-medium mb-3">
                      Tax & Discount Details
                    </h3>
                    <div className="space-y-3">
                      {/* Tax Input */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
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
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                          />
                          <button
                            onClick={() => setTaxRate(0)}
                            className="px-3 py-2 bg-secondary text-text-primary rounded-lg hover:bg-accent"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Discount Table */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
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
                              className="w-1/3 px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
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
                              className="w-2/3 px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <button
                            onClick={() =>
                              setDiscount({ type: "amount", value: 0 })
                            }
                            className="w-full px-3 py-2 bg-secondary text-text-primary rounded-lg hover:bg-accent"
                          >
                            Clear Discount
                          </button>
                        </div>
                      </div>

                      {/* Quick Discount Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
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
                              className="px-3 py-2 bg-secondary text-text-primary rounded-lg hover:bg-accent"
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
          subtotal={calculatedSubtotal}
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
const ProductCard = ({ product, onAddToCart, selectedPriceType, isSelected }) => {
  const priceKey = `${selectedPriceType}Price`;
  const currentPrice = product[priceKey] || 0;
  const isLowStock = product.stock <= product.minStock;

  return (
    <div 
      className={`bg-surface border ${
        isSelected ? 'border-primary ring-2 ring-primary' : 'border-border'
      } rounded-lg p-4 hover:border-primary transition-all duration-200`}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-text-primary text-sm leading-tight">
            {product.name}
          </h3>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              isLowStock
                ? "bg-primary-dark text-white"
                : "bg-primary-light text-primary-dark"
            }`}
          >
            {product.stock}
          </span>
        </div>

        <div className="text-xs text-text-secondary">
          <div>SKU: {product.barcode}</div>
          <div>Category: {product.category}</div>
        </div>

        <div className="text-lg font-bold text-primary">
          Rs {currentPrice.toFixed(2)}
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-lg font-medium text-sm ${
            product.stock === 0
              ? "bg-secondary text-text-muted cursor-not-allowed"
              : "bg-primary text-white hover:bg-primary-dark"
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
  onUpdateItemDiscount,
}) => {
  const [showDiscountFields, setShowDiscountFields] = useState(false);
  const [discountMethod, setDiscountMethod] = useState(item.discountMethod || "none");
  const [discountValue, setDiscountValue] = useState(item.discountValue || 0);

  // Calculate final price of the item after applying its discount
  const calculateFinalItemPrice = () => {
    let finalPrice = item.price;

    if (discountMethod === "price") {
      finalPrice = Math.max(0, item.price - discountValue);
    } else if (discountMethod === "percentage") {
      finalPrice = item.price * (1 - discountValue / 100);
    }

    return finalPrice;
  };

  const finalItemPrice = calculateFinalItemPrice();

  // Handle changes to discount fields
  useEffect(() => {
    onUpdateItemDiscount(item.id, discountMethod, discountValue);
  }, [discountMethod, discountValue, item.id, onUpdateItemDiscount]);

  return (
    <div 
      className="bg-surface rounded-lg p-3 border border-border hover:bg-primary-light/50"
      data-cart-item-id={item.id}
      tabIndex="0"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-text-primary text-sm truncate">
            {item.name}
          </h4>
          <div className="text-xs text-text-secondary">
            <div>Original Price: Rs {item.price.toFixed(2)} each</div>
            <div>Category: {item.category}</div>
          </div>
          {discountMethod !== "none" && (
            <div className="text-xs text-primary-dark mt-1">
              Discount: {
                discountMethod === "price" ? `-Rs ${discountValue.toFixed(2)}` :
                discountMethod === "percentage" ? `-${discountValue.toFixed(2)}%` :
                ""
              }
            </div>
          )}
        </div>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-primary-dark hover:text-primary ml-2 p-1"
        >
          ×
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 bg-secondary rounded text-text-primary hover:bg-accent flex items-center justify-center"
          >
            -
          </button>

          <input
            type="number"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.id, Number.parseInt(e.target.value) || 0)
            }
            className="w-16 text-center text-sm bg-background border border-border rounded text-text-primary"
            min="0"
          />

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 bg-secondary rounded text-text-primary hover:bg-accent flex items-center justify-center"
          >
            +
          </button>
        </div>

        <div className="text-right">
          <div className="font-medium text-text-primary">
            Rs {(finalItemPrice * item.quantity).toFixed(2)}
          </div>
          {discountMethod !== "none" && (
            <div className="text-xs text-text-secondary line-through">
              Rs {(item.price * item.quantity).toFixed(2)}
            </div>
          )}
          <div className="text-xs text-text-secondary">
            {item.quantity} × Rs {finalItemPrice.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Discount Fields */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setShowDiscountFields(!showDiscountFields)}
          className="px-3 py-1 bg-secondary text-text-primary rounded-lg hover:bg-accent text-sm"
        >
          {showDiscountFields ? "Hide Discount" : "Add Discount"}
        </button>

        {showDiscountFields && (
          <div className="flex gap-2 items-center">
            <select
              value={discountMethod}
              onChange={(e) => {
                setDiscountMethod(e.target.value);
                setDiscountValue(0);
              }}
              className="px-2 py-1 bg-background border border-border rounded-lg text-text-primary text-xs"
            >
              <option value="none">No Discount</option>
              <option value="price">Price Discount</option>
              <option value="percentage">Percentage Discount</option>
            </select>

            {discountMethod !== "none" && (
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                className="w-24 px-2 py-1 bg-background border border-border rounded-lg text-text-primary text-xs"
                min="0"
                max={discountMethod === "percentage" ? "100" : undefined}
                step={discountMethod === "percentage" ? "1" : "0.01"}
                placeholder={discountMethod === "percentage" ? "0-100" : "0.00"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

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
  const [activeField, setActiveField] = useState("paymentMethod"); // Track active field for keyboard navigation

  // Refs for payment modal elements
  const cashButtonRef = useRef(null);
  const cardButtonRef = useRef(null);
  const amountReceivedInputRef = useRef(null);
  const cardNumberInputRef = useRef(null);
  const expiryInputRef = useRef(null);
  const cvvInputRef = useRef(null);
  const completePaymentButtonRef = useRef(null);

  const quickAmounts = [1000, 2000, 5000, 10000];
  const changeAmount = Number.parseFloat(amountReceived) - grandTotal;

  const handleQuickAmount = (amount) => {
    setAmountReceived(amount.toString());
    setActiveField("amountReceived");
  };

  const handleCardInput = (field, value) => {
    let formattedValue = value;

    if (field === "number") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim();
    } else if (field === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .substr(0, 5);
    } else if (field === "cvv") {
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

  useEffect(() => {
    const handlePaymentModalKeyPress = (e) => {
      if (paymentMethod === "cash") {
        switch (activeField) {
          case "paymentMethod":
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setPaymentMethod("cash");
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              setPaymentMethod("card");
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveField("amountReceived");
              amountReceivedInputRef.current?.focus();
            }
            break;
          case "amountReceived":
            if (e.key === "Enter" && changeAmount > 0) {
              e.preventDefault();
              completePayment();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveField("paymentMethod");
              cashButtonRef.current?.focus();
            }
            break;
        }
      } else {
        // Card payment navigation
        switch (activeField) {
          case "paymentMethod":
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              setPaymentMethod("cash");
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              setPaymentMethod("card");
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveField("cardNumber");
              cardNumberInputRef.current?.focus();
            }
            break;
          case "cardNumber":
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveField("paymentMethod");
              cardButtonRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveField("expiry");
              expiryInputRef.current?.focus();
            }
            break;
          case "expiry":
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveField("cardNumber");
              cardNumberInputRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveField("cvv");
              cvvInputRef.current?.focus();
            }
            break;
          case "cvv":
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveField("expiry");
              expiryInputRef.current?.focus();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveField("paymentMethod");
              cardButtonRef.current?.focus();
            } else if (e.key === "Enter") {
              e.preventDefault();
              completePayment();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handlePaymentModalKeyPress);
    return () => window.removeEventListener("keydown", handlePaymentModalKeyPress);
  }, [activeField, paymentMethod, changeAmount]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary">Payment Processing</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-primary text-2xl">×</button>
        </div>

        {/* Summary Section */}
        <div className="space-y-1 mb-4 p-3 bg-primary-light/50 rounded-lg text-sm border border-primary-light">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal:</span>
            <span className="text-text-primary">Rs {subtotal.toFixed(2)}</span>
          </div>
          {discount.value > 0 && (
            <div className="flex justify-between text-primary-dark">
              <span>Discount:</span>
              <span className="text-text-primary">
                -Rs {discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value}
              </span>
            </div>
          )}
          <div className="flex justify-between text-text-secondary">
            <span>Tax ({taxRate}%):</span>
            <span className="text-text-primary">Rs {(subtotal * (taxRate / 100)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-border">
            <span className="text-text-primary">Total:</span>
            <span>Rs {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              ref={cashButtonRef}
              onClick={() => {
                setPaymentMethod("cash");
                setActiveField("paymentMethod");
              }}
              className={`p-3 rounded-lg border-2 ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border bg-surface text-text-secondary hover:border-primary-light"
              }`}
            >
              Cash
            </button>
            <button
              ref={cardButtonRef}
              onClick={() => {
                setPaymentMethod("card");
                setActiveField("paymentMethod");
              }}
              className={`p-3 rounded-lg border-2 ${
                paymentMethod === "card"
                  ? "border-primary bg-primary-light text-primary-dark"
                  : "border-border bg-surface text-text-secondary hover:border-primary-light"
              }`}
            >
              Card
            </button>
          </div>
        </div>

        {paymentMethod === "cash" ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Amount Received</label>
              <input
                ref={amountReceivedInputRef}
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                onFocus={() => setActiveField("amountReceived")}
                className="w-full p-2 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter amount"
              />
            </div>
            {changeAmount > 0 && (
              <div className="text-primary-dark font-medium">
                Change Due: Rs {changeAmount.toFixed(2)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  className="p-2 border border-border rounded-lg hover:border-primary-light"
                >
                  Rs {amount}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Card Number</label>
              <input
                ref={cardNumberInputRef}
                type="text"
                value={cardDetails.number}
                onChange={(e) => handleCardInput("number", e.target.value)}
                onFocus={() => setActiveField("cardNumber")}
                className="w-full p-2 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Expiry Date</label>
                <input
                  ref={expiryInputRef}
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardInput("expiry", e.target.value)}
                  onFocus={() => setActiveField("expiry")}
                  className="w-full p-2 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">CVV</label>
                <input
                  ref={cvvInputRef}
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => handleCardInput("cvv", e.target.value)}
                  onFocus={() => setActiveField("cvv")}
                  className="w-full p-2 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:border-primary-light"
          >
            Cancel
          </button>
          <button
            ref={completePaymentButtonRef}
            onClick={completePayment}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            disabled={
              paymentMethod === "cash"
                ? !amountReceived || Number.parseFloat(amountReceived) < grandTotal
                : !(
                    cardDetails.number.replace(/\s/g, "").length === 16 && /* Card number should be 16 digits */
                    cardDetails.expiry.length === 5 &&
                    cardDetails.cvv.length === 3
                  )
            }
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
      styleTag.innerHTML = printStyles;
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
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Invoice</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-primary text-2xl"
          >
            ×
          </button>
        </div>

        {/* Printable Invoice Content */}
        <div
          id="printable-invoice"
          ref={printableRef}
          className="bg-background text-text-primary p-8 rounded-lg mb-6 border border-border"
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
                <h1 className="text-3xl font-bold text-primary">
                  R-tech Solution
                </h1>
              </div>
              <div className="text-text-secondary text-sm">
                <p>262 Peradeniya road, Kandy</p>
                <p>Phone: +94 11 123 4567</p>
                <p>Email: support@srilankapos.com</p>
              </div>
              {/* Bill To Section */}
              {(customerDetails ||
                (invoice.customer && invoice.customer.id)) && (
                <div className="mt-6 bg-primary-light border-l-4 border-primary p-4 rounded">
                  <div className="font-semibold text-primary-dark mb-1">
                    Bill To:
                  </div>
                  <div className="text-text-primary">
                    {customerDetails?.name || ""}
                  </div>
                  {customerDetails?.company && (
                    <div className="text-text-secondary">
                      {customerDetails.company}
                    </div>
                  )}
                  {customerDetails?.phone && (
                    <div className="text-text-secondary">
                      📞 {customerDetails.phone}
                    </div>
                  )}
                  {customerDetails?.email && (
                    <div className="text-text-secondary">
                      ✉️ {customerDetails.email}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-primary mb-2">INVOICE</h2>
              <div className="text-text-secondary text-sm">
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
                <tr className="border-b-2 border-border bg-primary-light">
                  <th className="text-left py-3 px-2 font-semibold text-primary-dark">
                    Item
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-primary-dark">
                    Qty
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-primary-dark">
                    Unit Price
                  </th>
                  <th className="text-right py-3 px-2 font-semibold text-primary-dark">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-border hover:bg-primary-light/30">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium text-text-primary">{item.name}</div>
                        <div className="text-sm text-text-secondary">
                          {item.category}
                        </div>
                        {item.barcode && (
                          <div className="text-xs text-text-muted">
                            SKU: {item.barcode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 text-text-primary">{item.quantity}</td>
                    <td className="text-right py-3 px-2 text-text-primary">
                      <div>
                        <div>Rs {item.originalPrice.toFixed(2)}</div>
                        {item.discountMethod !== "none" && (
                          <div className="text-sm text-primary-dark">
                            {item.discountMethod === "price" 
                              ? `-Rs ${item.discountValue.toFixed(2)}`
                              : `-${item.discountValue.toFixed(2)}%`}
                          </div>
                        )}
                        <div className="text-sm font-medium">
                          Rs {item.discountedPrice.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 font-medium text-text-primary">
                      <div>
                        <div>Rs {(item.discountedPrice * item.quantity).toFixed(2)}</div>
                        {item.discountMethod !== "none" && (
                          <div className="text-xs text-text-secondary line-through">
                            Rs {(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Summary Section */}
          <div className="flex flex-col md:flex-row justify-end mb-8 gap-6">
            <div className="w-full md:w-80 bg-primary-light/20 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-text-secondary">Subtotal:</span>
                  <span className="font-medium text-text-primary">
                    Rs {invoice.subtotal.toFixed(2)}
                  </span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-primary-dark">
                    <span>Discount:</span>
                    <span>-Rs {invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-text-secondary">Tax:</span>
                  <span className="font-medium text-text-primary">
                    Rs {invoice.taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-border">
                  <span className="text-text-primary">Total:</span>
                  <span className="text-primary">Rs {invoice.total.toFixed(2)}</span>
                </div>
                {/* Payment Method(s) */}
                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="pt-2">
                    <div className="font-semibold text-primary-dark mb-1">
                      Payment:
                    </div>
                    {invoice.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize text-text-secondary">{p.method}</span>
                        <span className="text-text-primary">Rs {p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    {invoice.change > 0 && (
                      <div className="flex justify-between text-primary text-sm">
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
          <div className="mt-8 bg-primary-light/10 p-4 rounded-lg">
            <div className="mb-4">
              <div className="font-semibold text-primary-dark mb-1">Notes:</div>
              <div className="text-text-secondary text-sm">
                {notesTerms.notes || "—"}
              </div>
            </div>
            <div>
              <div className="font-semibold text-primary-dark mb-1">
                Terms &amp; Conditions:
              </div>
              <ul className="list-disc pl-5 text-text-muted text-xs space-y-1">
                {notesTerms.terms && notesTerms.terms.length > 0 ? (
                  notesTerms.terms.map((term, idx) => <li key={idx}>{term}</li>)
                ) : (
                  <li>No terms &amp; conditions set.</li>
                )}
              </ul>
            </div>
          </div>
          {/* Footer */}
          <div className="text-center text-text-muted text-xs border-t border-border pt-4 mt-8">
            <p>Thank you for your business!</p>
            <p>Powered by R-tech Solution POS</p>
          </div>
        </div>

        <div className="flex gap-3 no-print">
          <button
            onClick={printInvoice}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Print Invoice
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-border rounded-lg text-text-secondary hover:bg-primary-light hover:text-primary transition-colors"
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
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-secondary hover:text-primary text-2xl"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-primary mb-4">
          {showAddForm ? "Add New Customer" : "Select Customer"}
        </h2>
        {showAddForm ? (
          <form onSubmit={handleAddCustomer} className="space-y-3">
            <input
              type="text"
              required
              placeholder="Name"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Company"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <input
              type="text"
              placeholder="Website"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
            <textarea
              placeholder="Notes"
              className="w-full px-3 py-2 rounded bg-surface border border-border text-text-primary placeholder-text-muted"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            {error && <div className="text-primary-dark text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-secondary text-text-primary rounded hover:bg-accent"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
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
                <div className="text-text-muted text-center py-8">
                  No customers found
                </div>
              ) : (
                customers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`p-3 rounded-lg cursor-pointer border border-border hover:bg-primary-light/50 transition-colors flex justify-between items-center ${
                      selectedCustomer && selectedCustomer.id === customer.id
                        ? "bg-primary-light text-primary-dark"
                        : "bg-surface text-text-primary"
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer);
                      onClose();
                    }}
                  >
                    <div>
                      <div className="font-medium text-text-primary">
                        {customer.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {customer.email} | {customer.phone}
                      </div>
                    </div>
                    {selectedCustomer &&
                      selectedCustomer.id === customer.id && (
                        <span className="text-primary font-bold">✓</span>
                      )}
                  </div>
                ))
              )}
            </div>

            <button
              className="w-full mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
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
  const [selectedProductIndex, setSelectedProductIndex] = useState(-1);

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
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary">Products</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-primary text-2xl"
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
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary"
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
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              selectedPriceType={selectedPriceType}
              isSelected={index === selectedProductIndex}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-text-muted">
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
      <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-primary font-medium">Low Stock Alerts</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-primary">
            ×
          </button>
        </div>
        <div className="space-y-2">
          {alerts.map((product) => (
            <div key={product.id} className="text-primary-dark text-sm">
              {product.name}: {product.stock} units remaining
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPOSSystem;
