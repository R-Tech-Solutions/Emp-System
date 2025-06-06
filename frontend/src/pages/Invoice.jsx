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
  const [customers] = useState(mockCustomers)
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
          case 'p':
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

  // Complete payment
  const completePayment = (paymentData) => {
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

      {/* Keyboard Shortcuts Help */}
      <div className="fixed top-4 left-4 bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs text-gray-400 z-50">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <span>Ctrl+B: Barcode</span>
          <span>Ctrl+P: Payment</span>
          <span>Ctrl+D: Price Type</span>
          <span>Ctrl+T: Clear Cart</span>
          <span>Ctrl+F: Show Products</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Main Content - Single Column Layout */}
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
              <button
                onClick={clearCart}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Clear
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-60 overflow-y-auto mb-4 space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-4 text-gray-400">Cart is empty</div>
              ) : (
                cart.map((item) => (
                  <CartItem key={item.id} item={item} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />
                ))
              )}
            </div>

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
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product, onAddToCart, selectedPriceType }) => {
  const priceKey = `${selectedPriceType}Price`
  const currentPrice = product[priceKey]
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
const CartItem = ({ item, updateQuantity, removeFromCart }) => {
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

export default BillingPOSSystem
