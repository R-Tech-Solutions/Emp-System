"use client"

import { useState, useEffect, useRef } from "react"

// Mock product database
const mockProducts = [
  {
    id: 1,
    name: "Coca Cola 500ml",
    barcode: "N33163-371",
    category: "Beverages",
    stock: 50,
    standardPrice: 250,
    wholesalePrice: 200,
    retailPrice: 275,
    cost: 150,
    description: "Refreshing cola drink",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Bread Loaf",
    barcode: "2345678901234",
    category: "Bakery",
    stock: 25,
    standardPrice: 300,
    wholesalePrice: 250,
    retailPrice: 325,
    cost: 180,
    description: "Fresh white bread",
    image: "/placeholder.svg?height=100&width=100",
  }
]

const mockCustomers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+94771234567",
    loyaltyPoints: 150,
    totalSpent: 125075,
    visits: 25,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+94771234568",
    loyaltyPoints: 89,
    totalSpent: 89050,
    visits: 18,
  }
]

const categories = ["All", "Beverages", "Bakery", "Dairy", "Fruits", "Meat", "Electronics"]

// Toast Notification Component
const Toast = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

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
          <button onClick={onClose} className="ml-4 text-gray-300 hover:text-white">
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Billing POS Component
const BillingPOSSystem = () => {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState(mockCustomers)
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [selectedPriceType, setSelectedPriceType] = useState("standard")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [discount, setDiscount] = useState({ type: "amount", value: 0 })
  const [taxRate, setTaxRate] = useState(0)
  const [showPayment, setShowPayment] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [currentEmployee] = useState({ id: 1, name: "Admin User", role: "Cashier" })
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Toast state
  const [toast, setToast] = useState({ message: "", type: "", isVisible: false })

  const barcodeRef = useRef(null)

  // Add new state variables
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [lowStockAlerts, setLowStockAlerts] = useState([])
  const [dailySales, setDailySales] = useState({ total: 0, count: 0 })
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', name: 'Cash', icon: '💵' },
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'mobile', name: 'Mobile Pay', icon: '📱' },
    { id: 'credit', name: 'Credit', icon: '📝' }
  ])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState('today')

  // Add new state variables for enhanced billing
  const [quickActions] = useState([
    { id: 'hold', name: 'Hold Bill', icon: '⏸️', shortcut: 'Ctrl+H' },
    { id: 'split', name: 'Split Bill', icon: '✂️', shortcut: 'Ctrl+S' },
    { id: 'merge', name: 'Merge Bills', icon: '🔄', shortcut: 'Ctrl+M' },
    { id: 'return', name: 'Return Item', icon: '↩️', shortcut: 'Ctrl+R' },
  ])
  const [heldBills, setHeldBills] = useState([])
  const [splitBills, setSplitBills] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearchTerm, setCustomerSearchTerm] = useState('')
  const [showBatchActions, setShowBatchActions] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState([])

  // Add new state for active tab
  const [activeTab, setActiveTab] = useState('pos') // 'pos' or 'invoices'

  // Add new state for invoice list
  const [invoices, setInvoices] = useState([])
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('')
  const [invoiceDateRange, setInvoiceDateRange] = useState('all')
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Fetch products and inventory data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch products
        const productsResponse = await fetch('http://localhost:3001/api/products')
        const productsData = await productsResponse.json()

        // Fetch inventory
        const inventoryResponse = await fetch('http://localhost:3001/api/inventory')
        const inventoryData = await inventoryResponse.json()

        // Combine products with inventory data
        const combinedProducts = productsData.map(product => {
          // Find matching inventory record
          const inventory = inventoryData.find(inv => inv.productId === product.id)
          
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
          }
        })

        setProducts(combinedProducts)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        showToast('Failed to load products', 'error')
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            barcodeRef.current?.focus();
            break;
          case 'v':
            e.preventDefault();
            if (cart.length > 0) setShowPayment(true);
            break;
          case 'd':
            e.preventDefault();
            setSelectedPriceType(prev => 
              prev === 'standard' ? 'wholesale' : 
              prev === 'wholesale' ? 'retail' : 'standard'
            );
            break;
          case 't':
            e.preventDefault();
            clearCart();
            break;
          case 'f':
            e.preventDefault();
            setShowProductsModal(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart.length]);

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast({ ...toast, isVisible: false })
  }

  // Effect to update cart prices when price type changes
  useEffect(() => {
    setCart(prevCart => 
      prevCart.map(item => {
        const product = products.find(p => p.id === item.id)
        if (product) {
          const priceKey = `${selectedPriceType}Price`
          return {
            ...item,
            price: product[priceKey]
          }
        }
        return item
      })
    )
  }, [selectedPriceType, products])

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value
  const loyaltyDiscount = selectedCustomer ? Math.min(selectedCustomer.loyaltyPoints * 0.1, subtotal * 0.1) : 0
  const totalDiscount = discountAmount + loyaltyDiscount
  const taxableAmount = subtotal - totalDiscount
  const taxAmount = taxableAmount * (taxRate / 100)
  const grandTotal = taxableAmount + taxAmount

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Add product to cart
  const addToCart = (product) => {
    const priceKey = `${selectedPriceType}Price`
    const price = product[priceKey]

    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
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
      ])
    }
  }

  // Update cart item quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
    } else {
      setCart(cart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setDiscount({ type: "amount", value: 0 })
    setSelectedCustomer(null)
    showToast("Cart cleared", "info")
  }

  // Handle barcode scan
  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const product = products.find((p) => p.barcode === barcodeInput.trim())
      if (product) {
        addToCart(product)
        showToast(`Product found: ${product.name}`, "success")
        setBarcodeInput("")
      } else {
        showToast("Product not found", "error")
        setBarcodeInput("")
      }
    }
  }

  // Add new functions for advanced features
  const fetchPurchaseHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/purchases')
      const data = await response.json()
      setPurchaseHistory(data)
    } catch (error) {
      console.error('Error fetching purchase history:', error)
    }
  }

  const checkLowStock = () => {
    const alerts = products.filter(product => product.stock <= 5)
    setLowStockAlerts(alerts)
  }

  const calculateDailySales = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaySales = purchaseHistory.filter(purchase => 
      purchase.createdAt.split('T')[0] === today
    )
    
    const total = todaySales.reduce((sum, purchase) => sum + purchase.total, 0)
    setDailySales({ total, count: todaySales.length })
  }

  // Enhanced completePayment function
  const completePayment = async (paymentData) => {
    try {
      const invoice = {
        id: `INV-${Date.now()}`,
        date: new Date(),
        items: cart,
        customer: selectedCustomer,
        subtotal,
        discountAmount: totalDiscount,
        taxAmount,
        total: grandTotal,
        payments: paymentData.payments,
        change: paymentData.change,
        employee: currentEmployee,
        loyaltyPointsEarned: Math.floor(grandTotal / 100),
      }

      // Save to backend
      const response = await fetch('http://localhost:3001/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice)
      })

      if (!response.ok) {
        throw new Error('Failed to save purchase')
      }

      // Update inventory
      for (const item of cart) {
        await fetch('http://localhost:3001/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.id,
            quantity: -item.quantity, // Negative to reduce stock
            supplierEmail: 'pos@system.com'
          })
        })
      }

      setCurrentInvoice(invoice)
      setShowInvoice(true)
      setShowPayment(false)
      clearCart()
      showToast("Payment completed successfully", "success")

      // Update customer loyalty points
      if (selectedCustomer) {
        selectedCustomer.loyaltyPoints += Math.floor(grandTotal / 100)
        selectedCustomer.totalSpent += grandTotal
        selectedCustomer.visits += 1
      }

      // Refresh data
      fetchPurchaseHistory()
      checkLowStock()
      calculateDailySales()
    } catch (error) {
      console.error('Error completing payment:', error)
      showToast('Failed to complete payment', 'error')
    }
  }

  // Add useEffect for new features
  useEffect(() => {
    fetchPurchaseHistory()
    checkLowStock()
    calculateDailySales()
  }, [products])

  // Enhanced cart management functions
  const handleHoldBill = () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error')
      return
    }
    const billToHold = {
      id: `HOLD-${Date.now()}`,
      items: [...cart],
      customer: selectedCustomer,
      subtotal,
      discount,
      taxRate,
      timestamp: new Date(),
    }
    setHeldBills([...heldBills, billToHold])
    clearCart()
    showToast('Bill held successfully', 'success')
  }

  const handleSplitBill = () => {
    if (cart.length === 0) {
      showToast('Cart is empty', 'error')
      return
    }
    setSplitBills([...splitBills, { items: [...cart], customer: selectedCustomer }])
    clearCart()
    showToast('Bill split successfully', 'success')
  }

  const handleMergeBills = () => {
    if (splitBills.length < 2) {
      showToast('Need at least 2 bills to merge', 'error')
      return
    }
    const mergedItems = splitBills.flatMap(bill => bill.items)
    setCart(mergedItems)
    setSplitBills([])
    showToast('Bills merged successfully', 'success')
  }

  const handleReturnItem = (item) => {
    const returnData = {
      itemId: item.id,
      quantity: item.quantity,
      reason: 'Customer Return',
      timestamp: new Date(),
    }
    // Add to payment history for refund
    setPaymentHistory([...paymentHistory, { type: 'return', data: returnData }])
    removeFromCart(item.id)
    showToast('Item returned successfully', 'success')
  }

  // Enhanced customer management
  const handleCustomerSearch = async (term) => {
    setCustomerSearchTerm(term)
    if (term.length < 3) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/customers/search?term=${term}`)
      const data = await response.json()
      // Update customer list with search results
      setCustomers(data)
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  // Enhanced payment processing
  const handleBatchPayment = async (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const paymentData = {
      items,
      total,
      customer: selectedCustomer,
      timestamp: new Date(),
    }
    await completePayment(paymentData)
  }

  // Add function to fetch invoices
  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/purchases')
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      showToast('Failed to load invoices', 'error')
    }
  }

  // Add useEffect to fetch invoices
  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices()
    }
  }, [activeTab])

  // Add new InvoicesList component
  const InvoicesList = () => {
    const filteredInvoices = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.id.toLowerCase().includes(invoiceSearchTerm.toLowerCase()) ||
        (invoice.customer && invoice.customer.name.toLowerCase().includes(invoiceSearchTerm.toLowerCase()))
      
      const invoiceDate = new Date(invoice.createdAt)
      const now = new Date()
      
      switch(invoiceDateRange) {
        case 'today':
          return matchesSearch && invoiceDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          return matchesSearch && invoiceDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          return matchesSearch && invoiceDate >= monthAgo
        default:
          return matchesSearch
      }
    })

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
            {filteredInvoices.map(invoice => (
              <div
                key={invoice.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedInvoice(invoice)
                  setShowInvoiceDetails(true)
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">Invoice #{invoice.id}</div>
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
                    <div className="font-medium text-white">Rs {invoice.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{invoice.items.length} items</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-8 text-gray-400">No invoices found</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Toast Notification */}
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
      
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="text-white text-lg">Loading products...</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'pos'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            POS System
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'invoices'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Invoices
          </button>
        </div>

        {activeTab === 'pos' ? (
          <div className="space-y-6">
            {/* Products Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              {/* Barcode Scanner */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Barcode Scanner</label>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyPress={handleBarcodeScan}
                  placeholder="Scan or enter barcode..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search and Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Price Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Type</label>
                  <select
                    value={selectedPriceType}
                    onChange={(e) => setSelectedPriceType(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
                
                <div>
                  <button
                    onClick={() => setShowProductsModal(true)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Show Products
                  </button>
                </div>       
              </div>
            </div>

            {/* Shopping Cart Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Shopping Cart</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCustomerSearch(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {selectedCustomer ? 'Change Customer' : 'Select Customer'}
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Cart Items with Enhanced Features */}
              <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
                {cart.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">Cart is empty</div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="relative group">
                      <CartItem
                        item={item}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        onSelect={() => {
                          if (selectedItems.includes(item.id)) {
                            setSelectedItems(selectedItems.filter(id => id !== item.id))
                          } else {
                            setSelectedItems([...selectedItems, item.id])
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
                          selectedItems.forEach(id => removeFromCart(id))
                          setSelectedItems([])
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Remove Selected
                      </button>
                      <button
                        onClick={() => {
                          const selectedCartItems = cart.filter(item => selectedItems.includes(item.id))
                          handleBatchPayment(selectedCartItems)
                          setSelectedItems([])
                        }}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Pay Selected
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="space-y-2 text-sm border-t border-gray-600 pt-4">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  {discount.value > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Manual Discount:</span>
                      <span>-Rs {(discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value).toFixed(2)}</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Loyalty Discount:</span>
                      <span>-Rs {loyaltyDiscount.toFixed(2)}</span>
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

                  {/* Tax and Discount Table */}
                  <div className="mt-4 bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Tax & Discount Details</h3>
                    <div className="space-y-3">
                      {/* Tax Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tax Rate (%)</label>
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Discount</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <select
                              value={discount.type}
                              onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
                              className="w-1/3 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="amount">Amount</option>
                              <option value="percentage">Percentage</option>
                            </select>
                            <input
                              type="number"
                              value={discount.value}
                              onChange={(e) => setDiscount({ ...discount, value: Number(e.target.value) })}
                              min="0"
                              step="0.01"
                              placeholder={discount.type === "percentage" ? "Enter percentage" : "Enter amount"}
                              className="w-2/3 px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            onClick={() => setDiscount({ type: "amount", value: 0 })}
                            className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                          >
                            Clear Discount
                          </button>
                        </div>
                      </div>

                      {/* Quick Discount Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Quick Discounts</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[5, 10, 15, 20].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => setDiscount({ type: "percentage", value: percent })}
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
        <InvoiceModal invoice={currentInvoice} onClose={() => setShowInvoice(false)} />
      )}

      {showProductsModal && (
        <ProductsModal
          products={products}
          selectedPriceType={selectedPriceType}
          onAddToCart={addToCart}
          onClose={() => setShowProductsModal(false)}
        />
      )}

      {/* Add Analytics Button */}
      <button
        onClick={() => setShowAnalytics(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Analytics
      </button>

      {/* Add new modals */}
      {showAnalytics && (
        <AnalyticsModal
          onClose={() => setShowAnalytics(false)}
          dailySales={dailySales}
          purchaseHistory={purchaseHistory}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
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
            setShowInvoiceDetails(false)
            setSelectedInvoice(null)
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        <QuickActions
          actions={quickActions}
          onAction={(action) => {
            switch(action) {
              case 'hold':
                handleHoldBill()
                break
              case 'split':
                handleSplitBill()
                break
              case 'merge':
                handleMergeBills()
                break
              case 'return':
                if (selectedItems.length > 0) {
                  selectedItems.forEach(handleReturnItem)
                }
                break
            }
          }}
        />
      </div>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product, onAddToCart, selectedPriceType }) => {
  const priceKey = `${selectedPriceType}Price`
  const currentPrice = product[priceKey] || 0
  const isLowStock = product.stock <= product.minStock

  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-all duration-200">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-white text-sm leading-tight">{product.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            isLowStock ? "bg-red-900 text-red-200" : "bg-green-900 text-green-200"
          }`}>
            {product.stock}
          </span>
        </div>

        <div className="text-xs text-gray-400">
          <div>SKU: {product.barcode}</div>
          <div>Category: {product.category}</div>
        </div>

        <div className="text-lg font-bold text-blue-400">Rs {currentPrice.toFixed(2)}</div>

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
  )
}

// Cart Item Component
const CartItem = ({ item, updateQuantity, removeFromCart, onSelect, isSelected }) => {
  return (
    <div className="bg-gray-700 rounded-lg p-3 border border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm truncate">{item.name}</h4>
          <div className="text-xs text-gray-400">
            Rs {item.price.toFixed(2)} each • {item.category}
          </div>
        </div>
        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 ml-2 p-1">
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
            onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
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
          <div className="font-medium text-white">Rs {(item.price * item.quantity).toFixed(2)}</div>
          <div className="text-xs text-gray-400">
            {item.quantity} × Rs {item.price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

// Payment Modal Component
const PaymentModal = ({ grandTotal, subtotal, taxRate, discount, onClose, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: ""
  })

  const quickAmounts = [1000, 2000, 5000, 10000]
  const changeAmount = Number.parseFloat(amountReceived) - grandTotal

  const handleQuickAmount = (amount) => {
    setAmountReceived(amount.toString())
  }

  const handleCardInput = (field, value) => {
    let formattedValue = value

    // Format card number with spaces
    if (field === "number") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
    }
    // Format expiry date
    else if (field === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .substr(0, 5)
    }
    // Format CVV
    else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substr(0, 3)
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const completePayment = () => {
    if (paymentMethod === "cash") {
      const finalAmount = Number.parseFloat(amountReceived) || 0
      if (finalAmount >= grandTotal) {
        onPaymentComplete({
          payments: [{
            method: paymentMethod,
            amount: finalAmount,
            timestamp: new Date(),
          }],
          change: changeAmount > 0 ? changeAmount : 0,
        })
      }
    } else {
      // Validate card details
      if (cardDetails.number.replace(/\s/g, "").length === 16 &&
          cardDetails.expiry.length === 5 &&
          cardDetails.cvv.length === 3) {
        onPaymentComplete({
          payments: [{
            method: paymentMethod,
            amount: grandTotal,
            timestamp: new Date(),
            cardDetails: {
              last4: cardDetails.number.slice(-4),
              expiry: cardDetails.expiry
            }
          }],
          change: 0,
        })
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Payment Processing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
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
              <span>-Rs {discount.type === "percentage" ? (subtotal * discount.value) / 100 : discount.value}</span>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Expiry</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Quick Amounts</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount Received</label>
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
                : !(cardDetails.number.replace(/\s/g, "").length === 16 &&
                   cardDetails.expiry.length === 5 &&
                   cardDetails.cvv.length === 3)
            }
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  )
}

// Invoice Modal Component
const InvoiceModal = ({ invoice, onClose }) => {
  const printInvoice = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Invoice</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <div className="bg-white text-black p-8 rounded-lg mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Sri Lanka POS</h1>
              <div className="text-gray-600">
                <p>123 Business Street</p>
                <p>Colombo, Sri Lanka</p>
                <p>Phone: +94 11 123 4567</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
              <div className="text-gray-600">
                <p><strong>Invoice #:</strong> {invoice.id}</p>
                <p><strong>Date:</strong> {invoice.date.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {invoice.date.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {invoice.customer && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
              <div className="text-gray-600">
                <p><strong>{invoice.customer.name}</strong></p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.phone}</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold text-gray-800">Item</th>
                  <th className="text-center py-3 px-2 font-semibold text-gray-800">Qty</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-800">Unit Price</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">{item.quantity}</td>
                    <td className="text-right py-3 px-2">Rs {item.price.toFixed(2)}</td>
                    <td className="text-right py-3 px-2 font-medium">Rs {(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">Rs {invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between py-1 text-red-600">
                    <span>Discount:</span>
                    <span>-Rs {invoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">Rs {invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-gray-300">
                  <span>Total:</span>
                  <span>Rs {invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm border-t pt-4">
            <p>Thank you for your business!</p>
            <p>For support, contact us at support@srilankapos.com</p>
          </div>
        </div>

        <div className="flex gap-3">
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
  )
}

// Customer Modal Component
const CustomerModal = ({ customers, selectedCustomer, setSelectedCustomer, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Select Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3 mb-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => {
                setSelectedCustomer(customer)
                onClose()
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedCustomer?.id === customer.id
                  ? "border-blue-500 bg-blue-900"
                  : "border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-400">{customer.email}</p>
                  <p className="text-sm text-gray-400">{customer.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">{customer.loyaltyPoints} points</div>
                  <div className="text-sm text-gray-400">Rs {customer.totalSpent.toFixed(2)} spent</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-400">No customers found</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedCustomer(null)
              onClose()
            }}
            className="flex-1 px-4 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            No Customer
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Products Modal Component
const ProductsModal = ({ products, selectedPriceType, onAddToCart, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Products</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
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
          <div className="text-center py-8 text-gray-400">No products found</div>
        )}
      </div>
    </div>
  )
}

// Analytics Modal Component
const AnalyticsModal = ({ onClose, dailySales, purchaseHistory, selectedDateRange, setSelectedDateRange }) => {
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    // Calculate sales data based on date range
    const filteredSales = purchaseHistory.filter(purchase => {
      const purchaseDate = new Date(purchase.createdAt)
      const now = new Date()
      
      switch(selectedDateRange) {
        case 'today':
          return purchaseDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7))
          return purchaseDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
          return purchaseDate >= monthAgo
        default:
          return true
      }
    })

    // Calculate top products
    const productSales = {}
    filteredSales.forEach(purchase => {
      purchase.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          }
        }
        productSales[item.id].quantity += item.quantity
        productSales[item.id].revenue += item.price * item.quantity
      })
    })

    setTopProducts(Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    )

    setSalesData(filteredSales)
  }, [purchaseHistory, selectedDateRange])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sales Analytics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Daily Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300">
                <span>Total Sales:</span>
                <span>Rs {dailySales.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Transactions:</span>
                <span>{dailySales.count}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Average Sale:</span>
                <span>Rs {(dailySales.total / (dailySales.count || 1)).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Date Range</h3>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">{product.name}</div>
                  <div className="text-sm text-gray-400">{product.quantity} units sold</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">Rs {product.revenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">
                    Rs {(product.revenue / product.quantity).toFixed(2)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {salesData.slice(0, 5).map((sale, index) => (
              <div key={index} className="border-b border-gray-600 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-white">Invoice #{sale.id}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(sale.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">Rs {sale.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{sale.items.length} items</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Low Stock Alerts Component
const LowStockAlerts = ({ alerts, onClose }) => {
  if (alerts.length === 0) return null

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
          {alerts.map(product => (
            <div key={product.id} className="text-red-200 text-sm">
              {product.name}: {product.stock} units remaining
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Add new component for Quick Actions
const QuickActions = ({ actions, onAction }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className="flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <span className="text-xl">{action.icon}</span>
          <span className="text-sm">{action.name}</span>
          <span className="text-xs text-gray-400">{action.shortcut}</span>
        </button>
      ))}
    </div>
  )
}

// Add new component for Held Bills
const HeldBills = ({ bills, onRestore }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">Held Bills</h3>
      <div className="space-y-2">
        {bills.map(bill => (
          <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
            <div>
              <div className="text-white font-medium">Bill #{bill.id}</div>
              <div className="text-sm text-gray-400">
                {bill.items.length} items • Rs {bill.subtotal.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => onRestore(bill)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Add new component for Customer Search
const CustomerSearch = ({ onSelect, onClose }) => {
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (term) => {
    setIsSearching(true)
    try {
      const response = await fetch(`http://localhost:3001/api/customers/search?term=${term}`)
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Error searching customers:', error)
    }
    setIsSearching(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Search Customer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="text-center py-4 text-gray-400">Searching...</div>
          ) : (
            <div className="space-y-2">
              {searchResults.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => {
                    onSelect(customer)
                    onClose()
                  }}
                  className="p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600"
                >
                  <div className="font-medium text-white">{customer.name}</div>
                  <div className="text-sm text-gray-400">{customer.email}</div>
                  <div className="text-sm text-gray-400">{customer.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillingPOSSystem
