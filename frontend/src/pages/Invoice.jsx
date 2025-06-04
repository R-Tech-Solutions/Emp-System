"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Plus, Trash2, Printer, CreditCard, Banknote, Eye, Search, ShoppingCart, ChevronRight, ChevronLeft, X, Keyboard, Info, Barcode } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import toast from 'react-hot-toast'


export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("create")
  const [savedInvoices, setSavedInvoices] = useState([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")

  const [companyInfo, setCompanyInfo] = useState({
    name: "R-Tech Solutions",
    address: "262 Peradenita road Kandy",
    city: "kandy",
    phone: "0766187001",
    email: "info@Rtechsl.com",
    website: "www.rtechsl.lk",
  })

  const [clientInfo, setClientInfo] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
  })

  const [invoiceDetails, setInvoiceDetails] = useState({
    number: "INV-001",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    currency: "USD",
  })

  const [items, setItems] = useState([{ id: 1, name: "", quantity: 1, price: 0, tax: 0, discount: 0 }])

  const [notes, setNotes] = useState("")
  const [terms, setTerms] = useState("")

  const [cardPaymentDetails, setCardPaymentDetails] = useState({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    amount: "",
    balance: 0
  })

  const [cashPaymentDetails, setCashPaymentDetails] = useState({
    amount: "",
    receivedBy: "",
    date: "",
    balance: 0
  })

  const [priceType, setPriceType] = useState("standard")
  const [showProductModal, setShowProductModal] = useState(false)
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [productCache, setProductCache] = useState(new Map())
  const barcodeTimeoutRef = useRef(null)
  const lastBarcodeRef = useRef('')
  const scanCountRef = useRef(0)
  const lastScanTimeRef = useRef(Date.now())
  const barcodeInputRef = useRef(null)
  const barcodeDebounceRef = useRef(null)
  const apiCache = useRef(new Map())

  // Hide sidebar when this page is open
  useEffect(() => {
    const sidebar = document.querySelector('.fixed.md\\:static');
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    // Optionally, hide mobile sidebar overlay if open
    const overlay = document.querySelector('.fixed.inset-0.z-40');
    if (overlay) {
      overlay.style.display = 'none';
    }
    // Clean up: show sidebar again when unmounting
    return () => {
      if (sidebar) sidebar.style.display = '';
      if (overlay) overlay.style.display = '';
    };
  }, [/* intentionally empty: only run on mount/unmount */]);

  // Load saved invoices from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("savedInvoices")
    if (saved) {
      setSavedInvoices(JSON.parse(saved))
    }
  }, [])

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add product to items
  const addProductToItems = (product) => {
    const newItem = {
      id: Date.now(),
      name: product.name,
      quantity: 1,
      price: Number(priceType === 'standard' ? product.salesPrice : 
             priceType === 'wholesale' ? product.marginPrice : 
             product.retailPrice),
      tax: 0,
      discount: 0,
    }
    setItems([...items, newItem])
    setShowProductModal(false)
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      name: "",
      quantity: 1,
      price: 0,
      tax: 0,
      discount: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: field === 'price' ? Number(value) : value } : item)))
  }

  const calculateItemTotal = (item) => {
    const subtotal = Number(item.quantity) * Number(item.price)
    const discountAmount = (subtotal * Number(item.discount)) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = (taxableAmount * Number(item.tax)) / 100
    return taxableAmount + taxAmount
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0)
    const totalDiscount = items.reduce((sum, item) => sum + ((Number(item.quantity) * Number(item.price) * Number(item.discount)) / 100), 0)
    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = Number(item.quantity) * Number(item.price)
      const itemDiscount = (itemSubtotal * Number(item.discount)) / 100
      const taxableAmount = itemSubtotal - itemDiscount
      return sum + (taxableAmount * Number(item.tax)) / 100
    }, 0)
    const total = subtotal - totalDiscount + totalTax

    return { subtotal, totalDiscount, totalTax, total }
  }

  const handlePrint = () => {
    window.print()
  }

  const saveInvoice = () => {
    const invoice = {
      id: Date.now(),
      companyInfo,
      clientInfo,
      invoiceDetails,
      items,
      notes,
      terms,
      paymentMethod: selectedPaymentMethod,
      paymentDetails: selectedPaymentMethod === "card" ? cardPaymentDetails : cashPaymentDetails,
      totals: calculateTotals(),
      createdAt: new Date().toISOString(),
    }

    const updatedInvoices = [...savedInvoices, invoice]
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))
    alert("Invoice saved successfully!")
  }

  const deleteInvoice = (id) => {
    const updatedInvoices = savedInvoices.filter((invoice) => invoice.id !== id)
    setSavedInvoices(updatedInvoices)
    localStorage.setItem("savedInvoices", JSON.stringify(updatedInvoices))
  }

  const totals = calculateTotals()

  const PaymentMethodCard = ({ method, icon: Icon, title, description, isSelected, onClick }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={24} className={isSelected ? "text-blue-600" : "text-gray-600 dark:text-gray-400"} />
        <div>
          <h3 className={`font-medium ${isSelected ? "text-blue-600" : "text-gray-800 dark:text-gray-200"}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl + F to open product modal
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowProductModal(true)
        fetchProducts()
      }
      // Ctrl + N to add new item
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        addItem()
      }
      // Ctrl + P to change price type
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault()
        setPriceType(prev => {
          const types = ['standard', 'wholesale', 'retail']
          const currentIndex = types.indexOf(prev)
          return types[(currentIndex + 1) % types.length]
        })
      }
      // Ctrl + B to focus barcode input
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        document.getElementById('barcode-input')?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Handle product found
  const handleProductFound = useCallback((product) => {
    setItems(prevItems => {
      // Check if product already exists in items by name (or use product.id/sku if available)
      const existingIndex = prevItems.findIndex(item => item.name === product.name);
      if (existingIndex !== -1) {
        // If found, increase quantity
        return prevItems.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: Number(item.quantity) + 1 }
            : item
        );
      } else {
        // If not found, add as new item
        const newItem = {
          id: Date.now(),
          name: product.name,
          quantity: 1,
          price: Number(
            priceType === 'standard' ? product.salesPrice : 
            priceType === 'wholesale' ? product.marginPrice : 
            product.retailPrice
          ),
          tax: 0,
          discount: 0,
        };
        return [...prevItems, newItem];
      }
    });

    toast.success('Product added!', {
      icon: '✅',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });

    // Auto-focus barcode input for next scan
    setTimeout(() => {
      const barcodeInput = document.getElementById('barcode-input');
      if (barcodeInput) barcodeInput.focus();
    }, 50);
  }, [priceType]);

  // Optimized product lookup function
  const lookupProduct = useCallback(async (barcode) => {
    try {
      // Check memory cache first
      if (productCache.has(barcode)) {
        return productCache.get(barcode);
      }

      // Check API cache
      if (apiCache.current.has(barcode)) {
        const cachedProduct = apiCache.current.get(barcode);
        productCache.set(barcode, cachedProduct);
        return cachedProduct;
      }

      // Make API call with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`http://localhost:3001/api/products/barcode/${barcode}`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Product not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const product = await response.json();
      
      // Cache the result
      productCache.set(barcode, product);
      apiCache.current.set(barcode, product);
      
      return product;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }, [productCache]);

  // Optimized barcode handler
  const handleBarcodeInput = useCallback((e) => {
    const barcode = e.target.value.trim();
    
    // Only proceed if we have exactly 14 digits
    if (barcode.length === 14 && /^\d+$/.test(barcode)) {
      // Prevent duplicate scans
      const now = Date.now();
      if (barcode === lastBarcodeRef.current && now - lastScanTimeRef.current < 1000) {
        e.target.value = '';
        return;
      }

      lastBarcodeRef.current = barcode;
      lastScanTimeRef.current = now;

      // Process barcode immediately
      lookupProduct(barcode)
        .then(product => {
          handleProductFound(product);
          e.target.value = ''; // Clear input after successful scan
        })
        .catch(error => {
          toast.error(error.message === 'Product not found' ? 'Product not found!' : 'Error scanning product!', {
            icon: '❌',
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          });
          e.target.value = ''; // Clear input on error
        });
    }
  }, [lookupProduct, handleProductFound]);

  // Optimized paste handler
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text').trim();
    
    // Handle multiple barcodes in paste
    const barcodes = pastedText.split(/[\n\s,]+/).filter(code => code.length === 14 && /^\d+$/.test(code));
    
    if (barcodes.length > 0) {
      // Process each barcode with minimal delay
      barcodes.forEach((barcode, index) => {
        setTimeout(() => {
          lookupProduct(barcode)
            .then(product => {
              handleProductFound(product);
            })
            .catch(error => {
              toast.error(error.message === 'Product not found' ? 'Product not found!' : 'Error scanning product!', {
                icon: '❌',
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
              });
            });
        }, index * 50); // Reduced delay between barcodes
      });
    }
  }, [lookupProduct, handleProductFound]);

  // Optimized keydown handler
  const handleBarcodeKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      const barcode = e.target.value.trim();
      if (barcode.length === 14 && /^\d+$/.test(barcode)) {
        e.preventDefault(); // Prevent form submission
        
        // Process immediately without debounce
        lookupProduct(barcode)
          .then(product => {
            handleProductFound(product);
            e.target.value = '';
          })
          .catch(error => {
            toast.error(error.message === 'Product not found' ? 'Product not found!' : 'Error scanning product!', {
              icon: '❌',
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            });
            e.target.value = '';
          });
      }
    }
  }, [lookupProduct, handleProductFound]);

  // Add event listeners with cleanup
  useEffect(() => {
    const barcodeInput = document.getElementById('barcode-input');
    if (barcodeInput) {
      barcodeInput.addEventListener('input', handleBarcodeInput);
      barcodeInput.addEventListener('paste', handlePaste);
      barcodeInput.addEventListener('keydown', handleBarcodeKeyDown);
      
      // Auto-focus barcode input when component mounts
      barcodeInput.focus();
      
      return () => {
        barcodeInput.removeEventListener('input', handleBarcodeInput);
        barcodeInput.removeEventListener('paste', handlePaste);
        barcodeInput.removeEventListener('keydown', handleBarcodeKeyDown);
      };
    }
  }, [handleBarcodeInput, handlePaste, handleBarcodeKeyDown]);

  // Clear caches periodically to prevent memory bloat
  useEffect(() => {
    const cacheCleanupInterval = setInterval(() => {
      if (productCache.size > 1000) {
        setProductCache(new Map());
      }
      if (apiCache.current.size > 1000) {
        apiCache.current.clear();
      }
    }, 300000); // Clean every 5 minutes

    return () => clearInterval(cacheCleanupInterval);
  }, []);

  // Shortcuts bar for Close and Home
  const handleCloseInvoice = () => {
    // Show sidebar again
    const sidebar = document.querySelector('.fixed.md\\:static');
    if (sidebar) sidebar.style.display = '';
    const overlay = document.querySelector('.fixed.inset-0.z-40');
    if (overlay) overlay.style.display = '';
    // Optionally, navigate away or reload
    window.history.back(); // Or use a router if available
  };
  const handleGoHome = () => {
    // Show sidebar again
    const sidebar = document.querySelector('.fixed.md\\:static');
    if (sidebar) sidebar.style.display = '';
    const overlay = document.querySelector('.fixed.inset-0.z-40');
    if (overlay) overlay.style.display = '';
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Shortcuts Bar */}
      <div className="flex justify-end gap-2 p-2">
        <button
          onClick={handleCloseInvoice}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white border border-gray-600 transition-all"
        >
          Close
        </button>
        <button
          onClick={handleGoHome}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white border border-blue-700 transition-all"
        >
          Home
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1.5 flex shadow-lg">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-8 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                activeTab === "create" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <ShoppingCart size={18} />
              Create Invoice
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-8 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                activeTab === "history" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              <Eye size={18} />
              Invoice History ({savedInvoices.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "create" ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-1 gap-8"
            >
              {/* Invoice Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 space-y-6 shadow-xl border border-gray-700/50">
                <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                  Invoice Details
                </h2>

                {/* Company Info Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                    <ChevronRight className="text-blue-400" size={20} />
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={companyInfo.name}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      value={companyInfo.address}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={companyInfo.city}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={companyInfo.phone}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={companyInfo.email}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Website"
                      value={companyInfo.website}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg cursor-not-allowed opacity-75 focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>
                </motion.div>

                {/* Enhanced Product Selection Modal */}
                {showProductModal && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-gray-800 rounded-xl p-6 w-11/12 max-w-6xl max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-700/50"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                          Select Product
                        </h3>
                        <button
                          onClick={() => setShowProductModal(false)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X size={24} className="text-gray-400" />
                        </button>
                      </div>
                      
                      {/* Enhanced Search Bar */}
                      <div className="mb-6">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by name, SKU, or barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                          />
                          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        </div>
                      </div>

                      {/* Product Cards Grid (replaces table) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? (
                          <div className="col-span-full flex items-center justify-center gap-2 py-12">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-400">Loading products...</span>
                          </div>
                        ) : filteredProducts.length === 0 ? (
                          <div className="col-span-full text-center text-gray-400 py-12">
                            No products found
                          </div>
                        ) : (
                          filteredProducts.map((product) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-700/40 border border-gray-700/60 rounded-xl shadow-lg flex flex-col items-center p-3 hover:shadow-blue-500/20 transition-all group relative min-h-[220px]"
                              style={{ maxWidth: '240px', margin: '0 auto' }}
                            >
                              <div className="w-20 h-20 bg-gray-800 rounded-md flex items-center justify-center mb-2 overflow-hidden border border-gray-700/50">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="object-contain w-full h-full"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="text-gray-500 text-2xl font-bold">?</div>
                                )}
                              </div>
                              <div className="w-full text-center mb-1">
                                <div className="font-semibold text-base text-white truncate" title={product.name}>{product.name}</div>
                                <div className="text-xs text-gray-400 mt-0.5">SKU: <span className="font-mono">{product.sku}</span></div>
                              </div>
                              <div className="text-xs text-gray-400 mb-1">{product.category}</div>
                              <div className="flex flex-col gap-0.5 w-full text-xs mb-2">
                                <div className="flex justify-between text-gray-300">
                                  <span>Std:</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-300">
                                  <span>Wholesale:</span>
                                  <span className="font-semibold text-green-400">Rs {product.marginPrice}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-300">
                                  <span>Retail:</span>
                                  <span className="font-semibold text-purple-400">Rs {product.retailPrice}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => addProductToItems(product)}
                                className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 font-medium text-white"
                              >
                                Add to Cart
                              </button>
                            </motion.div>
                          ))
                        )}
                      </div>

                    </motion.div>
                  </motion.div>
                )}

                {/* Enhanced Items Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-4">
                    {/* Header with Keyboard Shortcuts Info */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                          <ChevronRight className="text-blue-400" size={20} />
                          Items
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Keyboard size={16} />
                          <span>Keyboard Shortcuts:</span>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs">Ctrl + F</kbd>
                            <span>View Products</span>
                            <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs">Ctrl + N</kbd>
                            <span>Add Item</span>
                            <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs">Ctrl + P</kbd>
                            <span>Change Price Type</span>
                            <kbd className="px-2 py-1 bg-gray-700/50 rounded text-xs">Ctrl + B</kbd>
                            <span>Scan Barcode</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600/50">
                      {/* Barcode Scanner */}
                      <div className="flex items-center gap-2 flex-1">
                        <div className="relative flex-1">
                          <input
                            id="barcode-input"
                            ref={barcodeInputRef}
                            type="text"
                            placeholder="Scan or paste barcode (14 digits)"
                            maxLength={14}
                            className="w-full px-4 py-2 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            onKeyDown={handleBarcodeKeyDown}
                          />
                          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          {loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            {document.getElementById('barcode-input')?.value.length || 0}/14
                          </div>
                        </div>
                      </div>

                      {/* Price Type Selector */}
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-300">Price Type:</label>
                        <select
                          value={priceType}
                          onChange={(e) => setPriceType(e.target.value)}
                          className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        >
                          <option value="standard">Standard Price</option>
                          <option value="wholesale">Wholesale Price</option>
                          <option value="retail">Retail Price</option>
                        </select>
                        <div className="relative group">
                          <Info size={16} className="text-gray-400 cursor-help" />
                          <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-gray-800 rounded-lg shadow-lg text-sm text-gray-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                            <p>Standard: Regular selling price</p>
                            <p>Wholesale: Bulk purchase price</p>
                            <p>Retail: Individual customer price</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => {
                            setShowProductModal(true)
                            fetchProducts()
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all shadow-lg hover:shadow-green-500/25 group relative"
                        >
                          <ShoppingCart size={18} />
                          <span>View Products</span>
                          <kbd className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Ctrl + F
                          </kbd>
                        </button>
                        <button
                          onClick={addItem}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 group relative"
                        >
                          <Plus size={18} />
                          <span>Add Item</span>
                          <kbd className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Ctrl + N
                          </kbd>
                        </button>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="grid grid-cols-12 gap-2 items-center bg-gray-700/30 p-4 rounded-lg border border-gray-600/50 hover:border-blue-500/50 transition-all group"
                        >
                          <div className="col-span-4 relative">
                            <input
                              type="text"
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            {!item.name && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                                Required
                              </div>
                            )}
                          </div>
                          <div className="col-span-2 relative">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              min="1"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              units
                            </div>
                          </div>
                          <div className="col-span-2 relative">
                            <input
                              type="number"
                              placeholder="Price"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              min="0"
                              step="0.01"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              Rs
                            </div>
                          </div>
                          <div className="col-span-1 relative">
                            <input
                              type="number"
                              placeholder="Tax%"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              min="0"
                              max="100"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              %
                            </div>
                          </div>
                          <div className="col-span-2 relative">
                            <input
                              type="number"
                              placeholder="Disc%"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                              min="0"
                              max="100"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                              %
                            </div>
                          </div>
                          {/* Show total for this item */}
                          <div className="col-span-1 text-right text-green-400 font-semibold text-sm">
                            Total: Rs {calculateItemTotal(item).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="col-span-1 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remove Item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </motion.div>
                      ))}
                      {/* Show full total below all items */}
                      <div className="flex justify-end mt-4">
                        <div className="bg-gray-800/70 rounded-lg px-6 py-3 border border-gray-600/50 text-lg font-bold text-green-300 shadow">
                          Full Total: Rs {totals.total.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Empty State */}
                    {items.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600/50"
                      >
                        <ShoppingCart size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-400">No items added yet</p>
                        <p className="text-sm text-gray-500 mt-1">Use Ctrl + N to add an item or click the button above</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced Payment Method Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium text-gray-300 flex items-center gap-2">
                    <ChevronRight className="text-blue-400" size={20} />
                    Payment Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PaymentMethodCard
                      method="card"
                      icon={CreditCard}
                      title="Card Payment"
                      description="Secure card payment processing"
                      isSelected={selectedPaymentMethod === "card"}
                      onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === "card" ? "" : "card")}
                    />
                    <PaymentMethodCard
                      method="cash"
                      icon={Banknote}
                      title="Cash Payment"
                      description="Direct cash payment handling"
                      isSelected={selectedPaymentMethod === "cash"}
                      onClick={() => setSelectedPaymentMethod(selectedPaymentMethod === "cash" ? "" : "cash")}
                    />
                  </div>

                  {/* Enhanced Payment Details Forms */}
                  <AnimatePresence>
                    {selectedPaymentMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-700/30 p-6 rounded-lg border border-gray-600/50 space-y-4"
                      >
                        <h4 className="font-medium text-gray-300">Bank Transfer Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Bank Name"
                            value={cardPaymentDetails.bankName}
                            onChange={(e) => setCardPaymentDetails({ ...cardPaymentDetails, bankName: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Account Number"
                            value={cardPaymentDetails.accountNumber}
                            onChange={(e) =>
                              setCardPaymentDetails({ ...cardPaymentDetails, accountNumber: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Routing Number"
                            value={cardPaymentDetails.routingNumber}
                            onChange={(e) =>
                              setCardPaymentDetails({ ...cardPaymentDetails, routingNumber: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="SWIFT Code"
                            value={cardPaymentDetails.swiftCode}
                            onChange={(e) => setCardPaymentDetails({ ...cardPaymentDetails, swiftCode: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="number"
                            placeholder="Amount Received"
                            value={cardPaymentDetails.amount}
                            onChange={(e) => {
                              const amount = Number(e.target.value) || 0;
                              const balance = amount - totals.total;
                              setCardPaymentDetails({ 
                                ...cardPaymentDetails, 
                                amount: amount,
                                balance: balance
                              });
                            }}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md">
                            <div className="text-sm text-gray-300">Balance:</div>
                            <div className={`text-lg font-semibold ${cardPaymentDetails.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${Math.abs(cardPaymentDetails.balance).toFixed(2)} {cardPaymentDetails.balance >= 0 ? 'to be returned' : 'remaining'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {selectedPaymentMethod === "cash" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-700/30 p-6 rounded-lg border border-gray-600/50 space-y-4"
                      >
                        <h4 className="font-medium text-gray-300">Cash Payment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="number"
                            placeholder="Amount Received"
                            value={cashPaymentDetails.amount}
                            onChange={(e) => {
                              const amount = Number(e.target.value) || 0;
                              const balance = amount - totals.total;
                              setCashPaymentDetails({ 
                                ...cashPaymentDetails, 
                                amount: amount,
                                balance: balance
                              });
                            }}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="date"
                            placeholder="Payment Date"
                            value={cashPaymentDetails.date}
                            onChange={(e) => setCashPaymentDetails({ ...cashPaymentDetails, date: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md">
                            <div className="text-sm text-gray-300">Balance:</div>
                            <div className={`text-lg font-semibold ${cashPaymentDetails.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${Math.abs(cashPaymentDetails.balance).toFixed(2)} {cashPaymentDetails.balance >= 0 ? 'to be returned' : 'remaining'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Enhanced Notes and Terms Section */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional notes..."
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-24 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Terms & Conditions</label>
                    <textarea
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      placeholder="Terms and conditions..."
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-24 resize-none"
                    />
                  </div>
                </motion.div>

                {/* Enhanced Save and Print Buttons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={saveInvoice}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all shadow-lg hover:shadow-green-500/25 text-lg font-medium flex items-center gap-2"
                  >
                    <span>Save Invoice</span>
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 text-lg font-medium flex items-center gap-2"
                  >
                    <Printer size={20} />
                    <span>Preview & Print</span>
                  </button>
                </div>
              </div>

              {/* Invoice Preview Modal */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white text-black rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 relative"
                    >
                      <button
                        onClick={() => setShowPreview(false)}
                        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X size={24} />
                      </button>

                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-gray-300 pb-6">
                          <div>
                            <h1 className="text-3xl font-bold text-blue-600">{companyInfo.name || "Your Company"}</h1>
                            <div className="text-sm text-gray-600 mt-2">
                              {companyInfo.address && <div>{companyInfo.address}</div>}
                              {companyInfo.city && <div>{companyInfo.city}</div>}
                              {companyInfo.phone && <div>Phone: {companyInfo.phone}</div>}
                              {companyInfo.email && <div>Email: {companyInfo.email}</div>}
                              {companyInfo.website && <div>Website: {companyInfo.website}</div>}
                            </div>
                          </div>
                          <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
                            <div className="text-sm text-gray-600 mt-2">
                              <div>Invoice #: {invoiceDetails.number}</div>
                              <div>Date: {invoiceDetails.date}</div>
                              {invoiceDetails.dueDate && <div>Due Date: {invoiceDetails.dueDate}</div>}
                            </div>
                          </div>
                        </div>

                        {/* ... rest of the invoice preview content ... */}

                        {/* Print Button */}
                        <div className="flex justify-center gap-4 print:hidden">
                          <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Printer size={16} />
                            Print Invoice
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* Enhanced Invoice History Tab */
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50"
            >
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                Invoice History
              </h2>

              {savedInvoices.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-gray-400 text-lg">No invoices saved yet</p>
                  <p className="text-gray-500 text-sm mt-2">Create your first invoice to see it here</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {savedInvoices.map((invoice, index) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-700/30 rounded-lg p-4 flex justify-between items-center border border-gray-600/50 hover:border-blue-500/50 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-medium text-white">{invoice.invoiceDetails.number}</h3>
                            <p className="text-sm text-gray-400">
                              {invoice.clientInfo.name || "No client name"} • ${invoice.totals.total.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(invoice.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCompanyInfo(invoice.companyInfo)
                            setClientInfo(invoice.clientInfo)
                            setInvoiceDetails(invoice.invoiceDetails)
                            setItems(invoice.items)
                            setNotes(invoice.notes)
                            setTerms(invoice.terms)
                            setSelectedPaymentMethod(invoice.paymentMethod)
                            if (invoice.paymentMethod === "card") {
                              setCardPaymentDetails(invoice.paymentDetails)
                            } else {
                              setCashPaymentDetails(invoice.paymentDetails)
                            }
                            setActiveTab("create")
                          }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Edit Invoice"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => deleteInvoice(invoice.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete Invoice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
