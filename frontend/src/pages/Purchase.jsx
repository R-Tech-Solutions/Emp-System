"use client"

import { useState, useEffect } from "react"

export default function PurchaseApp() {
    const [currentView, setCurrentView] = useState("list") // "list", "create", "details"
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null)
    const [purchases, setPurchases] = useState([
        {
            id: "PUR-001",
            date: "2024-01-15",
            customerName: "John Doe",
            email: "john@example.com",
            phone: "555-0123",
            items: [
                { name: "Premium Wireless Headphones", quantity: 1, price: 299.99, total: 299.99 },
                { name: "USB-C Cable", quantity: 2, price: 24.99, total: 49.98 },
            ],
            subtotal: 349.97,
            shipping: 15.99,
            tax: 28.0,
            total: 393.96,
            status: "Completed",
            billingAddress: "123 Main St, New York, NY 10001",
            shippingAddress: "123 Main St, New York, NY 10001",
        },
        {
            id: "PUR-002",
            date: "2024-01-14",
            customerName: "Jane Smith",
            email: "jane@example.com",
            phone: "555-0456",
            items: [{ name: "Bluetooth Speaker", quantity: 1, price: 149.99, total: 149.99 }],
            subtotal: 149.99,
            shipping: 9.99,
            tax: 12.0,
            total: 171.98,
            status: "Processing",
            billingAddress: "456 Oak Ave, Los Angeles, CA 90210",
            shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
        },
    ])

    // Form state for creating new purchase
    const [formData, setFormData] = useState({
        customerName: "",
        email: "",
        phone: "",
        billingAddress: "",
        billingCity: "",
        billingState: "",
        billingZip: "",
        shippingAddress: "",
        shippingCity: "",
        shippingState: "",
        shippingZip: "",
        orderNotes: "",
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        sameAsShipping: false,
    })

    const [cartItems, setCartItems] = useState([])

    // Add this new state for price list selection
    const [priceList, setPriceList] = useState("Standard")

    const [products, setProducts] = useState([])
    const [productsLoading, setProductsLoading] = useState(false)
    const [addProductDropdownOpen, setAddProductDropdownOpen] = useState(false)

    // Add payment method and modal state
    const [paymentMethod, setPaymentMethod] = useState("Cash")
    const [cardModalOpen, setCardModalOpen] = useState(false)

    useEffect(() => {
        async function fetchProducts() {
            setProductsLoading(true)
            try {
                const res = await fetch("http://localhost:3001/api/products")
                const data = await res.json()
                setProducts(data)
            } catch (err) {
                setProducts([])
            }
            setProductsLoading(false)
        }
        fetchProducts()
    }, [])

    useEffect(() => {
        // Update prices in cart when priceList changes
        setCartItems((prev) =>
            prev.map((item) => {
                const product = products.find((p) => p.sku === item.sku)
                if (!product) return item
                const newPrice = getProductPrice(product)
                return {
                    ...item,
                    price: newPrice,
                    total: newPrice * item.quantity,
                }
            })
        )
        // eslint-disable-next-line
    }, [priceList, products])

    const addPurchase = (newPurchase) => {
        const purchaseId = `PUR-${String(purchases.length + 1).padStart(3, "0")}`
        const purchase = {
            ...newPurchase,
            id: purchaseId,
            date: new Date().toISOString().split("T")[0],
            status: "Processing",
        }
        setPurchases((prev) => [purchase, ...prev])
        setCurrentView("list")
        // Reset form
        setFormData({
            customerName: "",
            email: "",
            phone: "",
            billingAddress: "",
            billingCity: "",
            billingState: "",
            billingZip: "",
            shippingAddress: "",
            shippingCity: "",
            shippingState: "",
            shippingZip: "",
            orderNotes: "",
            cardName: "",
            cardNumber: "",
            expiryDate: "",
            cvv: "",
            sameAsShipping: false,
        })
    }

    const viewPurchase = (purchaseId) => {
        setSelectedPurchaseId(purchaseId)
        setCurrentView("details")
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-600"
            case "Processing":
                return "bg-yellow-600"
            case "Cancelled":
                return "bg-red-600"
            default:
                return "bg-gray-600"
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? e.target.checked : value,
        }))
    }

    const updateItemQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity, total: item.price * newQuantity } : item)),
        )
    }

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
        const shipping = 15.99
        const tax = subtotal * 0.08
        const grandTotal = subtotal + shipping + tax

        const purchaseData = {
            customerName: formData.customerName,
            email: formData.email,
            phone: formData.phone,
            items: cartItems,
            subtotal,
            shipping,
            tax,
            total: grandTotal,
            billingAddress: `${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZip}`,
            shippingAddress: formData.sameAsShipping
                ? `${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZip}`
                : `${formData.shippingAddress}, ${formData.shippingCity}, ${formData.shippingState} ${formData.shippingZip}`,
            orderNotes: formData.orderNotes,
        }

        addPurchase(purchaseData)
    }

    const getProductPrice = (product) => {
        if (!product) return 0
        if (priceList === "Standard") return Number(product.salesPrice) || 0
        if (priceList === "Wholesale") return Number(product.marginPrice) || 0
        if (priceList === "Retail") return Number(product.retailPrice) || 0
        return 0
    }

    const addProductToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.sku === product.sku)
            if (existing) {
                // If already in cart, increase quantity
                return prev.map((item) =>
                    item.sku === product.sku
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                            price: getProductPrice(product),
                            total: getProductPrice(product) * (item.quantity + 1),
                        }
                        : item
                )
            }
            // Add new product to cart
            return [
                ...prev,
                {
                    id: product.sku,
                    sku: product.sku,
                    name: product.name,
                    price: getProductPrice(product),
                    quantity: 1,
                    total: getProductPrice(product),
                },
            ]
        })
        setAddProductDropdownOpen(false)
    }

    // Purchase List View
    const renderPurchaseList = () => (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Purchase Management</h1>
                    <p className="text-gray-400">Manage and track all your purchases</p>
                </div>
                <button
                    onClick={() => setCurrentView("create")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Create New Purchase
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-2xl font-bold text-white">{purchases.length}</div>
                    <div className="text-gray-400">Total Purchases</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-2xl font-bold text-green-400">
                        {purchases.filter((p) => p.status === "Completed").length}
                    </div>
                    <div className="text-gray-400">Completed</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-2xl font-bold text-yellow-400">
                        {purchases.filter((p) => p.status === "Processing").length}
                    </div>
                    <div className="text-gray-400">Processing</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                    <div className="text-2xl font-bold text-white">
                        ${purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                    </div>
                    <div className="text-gray-400">Total Revenue</div>
                </div>
            </div>

            {/* Purchases Table */}
            <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">All Purchases</h2>
                </div>

                {purchases.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-4">No purchases found</div>
                        <button
                            onClick={() => setCurrentView("create")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Create Your First Purchase
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="text-left py-3 px-6 text-gray-300 font-medium">Purchase ID</th>
                                    <th className="text-left py-3 px-6 text-gray-300 font-medium">Customer</th>
                                    <th className="text-left py-3 px-6 text-gray-300 font-medium">Date</th>
                                    <th className="text-left py-3 px-6 text-gray-300 font-medium">Items</th>
                                    <th className="text-right py-3 px-6 text-gray-300 font-medium">Total</th>
                                    <th className="text-center py-3 px-6 text-gray-300 font-medium">Status</th>
                                    <th className="text-center py-3 px-6 text-gray-300 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="border-b border-gray-700 hover:bg-gray-750">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-white">{purchase.id}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-white font-medium">{purchase.customerName}</div>
                                            <div className="text-gray-400 text-sm">{purchase.email}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-300">{new Date(purchase.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-gray-300">
                                            {purchase.items.length} item{purchase.items.length !== 1 ? "s" : ""}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="font-semibold text-white">${purchase.total.toFixed(2)}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(purchase.status)}`}
                                            >
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => viewPurchase(purchase.id)}
                                                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm transition duration-200"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )

    // Create Purchase View
    const renderCreatePurchase = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
        const shipping = 15.99
        const tax = subtotal * 0.08
        const grandTotal = subtotal + shipping + tax

        // Card Modal overlay
        const CardModal = () => (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-md relative">
                    <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                        onClick={() => setCardModalOpen(false)}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <h2 className="text-xl font-semibold mb-6 text-white">Card Payment</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Name on Card *</label>
                            <input
                                type="text"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Card Number *</label>
                            <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                                <input
                                    type="text"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">CVV *</label>
                                <input
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => {
                            setCardModalOpen(false)
                            document.getElementById('purchase-form').requestSubmit()
                        }}
                    >
                        Submit Payment
                    </button>
                </div>
            </div>
        )

        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl text-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Create New Purchase</h1>
                        <p className="text-gray-400">Complete the form below to create a new purchase</p>
                    </div>
                    <button
                        onClick={() => setCurrentView("list")}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Cancel
                    </button>
                </div>
                {/* Purchase Items */}
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
                    <div className="mb-4 relative">
                        <button
                            type="button"
                            onClick={() => setAddProductDropdownOpen((open) => !open)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Add Product
                        </button>
                        {addProductDropdownOpen && (
                            <div className="absolute z-10 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                {productsLoading ? (
                                    <div className="p-4 text-gray-400">Loading products...</div>
                                ) : products.length === 0 ? (
                                    <div className="p-4 text-gray-400">No products found</div>
                                ) : (
                                    <ul>
                                        {products.map((product) => (
                                            <li
                                                key={product.sku}
                                                className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex justify-between items-center"
                                                onClick={() => addProductToCart(product)}
                                            >
                                                <span>{product.name}</span>
                                                <span className="text-sm text-gray-400 ml-2">
                                                    {priceList === "Standard" && <>${Number(product.salesPrice).toFixed(2)}</>}
                                                    {priceList === "Wholesale" && <>${Number(product.marginPrice).toFixed(2)}</>}
                                                    {priceList === "Retail" && <>${Number(product.retailPrice).toFixed(2)}</>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-2">Product</th>
                                    <th className="text-center py-3 px-2">Quantity</th>
                                    <th className="text-right py-3 px-2">Price</th>
                                    <th className="text-right py-3 px-2">Total</th>
                                    <th className="text-center py-3 px-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr key={item.sku} className="border-b border-gray-700">
                                        <td className="py-4 px-2">
                                            <div className="font-medium">{item.name}</div>
                                        </td>
                                        <td className="text-center py-4 px-2">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                    className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded flex items-center justify-center"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                    className="bg-gray-600 hover:bg-gray-500 text-white w-8 h-8 rounded flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-right py-4 px-2">${item.price.toFixed(2)}</td>
                                        <td className="text-right py-4 px-2 font-semibold">${item.total.toFixed(2)}</td>
                                        <td className="text-center py-4 px-2">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <form id="purchase-form" onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Customer Info & Payment */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Customer Information */}
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                    />
                                </div>
                                {/* Order Notes */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Order Notes (Optional)</label>
                                    <textarea
                                        name="orderNotes"
                                        value={formData.orderNotes}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                        placeholder="Any special instructions for your order..."
                                    />
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                                {/* Payment Method Selection */}
                                <div className="mb-6 flex items-center space-x-8">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Cash"
                                            checked={paymentMethod === "Cash"}
                                            onChange={() => setPaymentMethod("Cash")}
                                            className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <span>Cash</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="Card"
                                            checked={paymentMethod === "Card"}
                                            onChange={() => setPaymentMethod("Card")}
                                            className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <span>Card</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="SupplierAcc"
                                            checked={paymentMethod === "SupplierAcc"}
                                            onChange={() => setPaymentMethod("SupplierAcc")}
                                            className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <span>SupplierAcc</span>
                                    </label>
                                </div>
                                {/* Card fields only shown in modal now */}
                                {paymentMethod === "Cash" && (
                                    <div className="text-green-400 mb-4">You have selected to pay by cash.</div>
                                )}
                                {paymentMethod === "Card" && (
                                    <div className="text-blue-400 mb-4">You have selected to pay by card. Click below to enter card details.</div>
                                )}
                                {paymentMethod === "SupplierAcc" && (
                                    <div className="text-blue-400 mb-4">Credit to SupplierAcc.</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6 sticky top-8">
                                <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Shipping</span>
                                        <span>${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Tax</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>${grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                {paymentMethod === "Cash" && (
                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        Pay by Cash
                                    </button>
                                )}
                                {paymentMethod === "Card" && (
                                    <button
                                        type="button"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                        onClick={() => setCardModalOpen(true)}
                                    >
                                        Pay by Card
                                    </button>
                                )}
                                {paymentMethod === "SupplierAcc" && (
                                    <button
                                        type="submit"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        Debit to Supplier Account
                                    </button>
                                )}

                                <div className="mt-4 text-xs text-gray-400 text-center">
                                    <p>Your payment information is secure and encrypted.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                {cardModalOpen && <CardModal />}
            </div>
        )
    }

    // Purchase Details View
    const renderPurchaseDetails = () => {
        const purchase = purchases.find((p) => p.id === selectedPurchaseId)

        if (!purchase) {
            return (
                <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Purchase Not Found</h1>
                        <button
                            onClick={() => setCurrentView("list")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            Back to Purchases
                        </button>
                    </div>
                </div>
            )
        }

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Purchase Details</h1>
                        <p className="text-gray-400">Purchase ID: {purchase.id}</p>
                    </div>
                    <button
                        onClick={() => setCurrentView("list")}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Back to Purchases
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Purchase Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Purchase Overview */}
                        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">Purchase Overview</h2>
                                    <p className="text-gray-400">Created on {new Date(purchase.date).toLocaleDateString()}</p>
                                </div>
                                <span
                                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${getStatusColor(purchase.status)}`}
                                >
                                    {purchase.status}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-2">Customer Information</h3>
                                    <div className="text-gray-300 space-y-1">
                                        <p>{purchase.customerName}</p>
                                        <p>{purchase.email}</p>
                                        {purchase.phone && <p>{purchase.phone}</p>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2">Billing Address</h3>
                                    <p className="text-gray-300">{purchase.billingAddress}</p>
                                </div>
                            </div>

                            {purchase.billingAddress !== purchase.shippingAddress && (
                                <div className="mt-4">
                                    <h3 className="font-medium mb-2">Shipping Address</h3>
                                    <p className="text-gray-300">{purchase.shippingAddress}</p>
                                </div>
                            )}
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-2">Product</th>
                                            <th className="text-center py-3 px-2">Quantity</th>
                                            <th className="text-right py-3 px-2">Price</th>
                                            <th className="text-right py-3 px-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchase.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-700">
                                                <td className="py-4 px-2">
                                                    <div className="font-medium">{item.name}</div>
                                                </td>
                                                <td className="text-center py-4 px-2">{item.quantity}</td>
                                                <td className="text-right py-4 px-2">${item.price.toFixed(2)}</td>
                                                <td className="text-right py-4 px-2 font-semibold">${item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    <div>
                                        <p className="font-medium">Order Created</p>
                                        <p className="text-gray-400 text-sm">{new Date(purchase.date).toLocaleDateString()} at 10:30 AM</p>
                                    </div>
                                </div>
                                {purchase.status === "Processing" && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                        <div>
                                            <p className="font-medium">Payment Confirmed</p>
                                            <p className="text-gray-400 text-sm">
                                                {new Date(purchase.date).toLocaleDateString()} at 10:32 AM
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {purchase.status === "Completed" && (
                                    <>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                            <div>
                                                <p className="font-medium">Payment Confirmed</p>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(purchase.date).toLocaleDateString()} at 10:32 AM
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                                            <div>
                                                <p className="font-medium">Order Completed</p>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(purchase.date).toLocaleDateString()} at 2:15 PM
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg shadow-xl p-6 sticky top-8">
                            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span>${purchase.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Shipping</span>
                                    <span>${purchase.shipping.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tax</span>
                                    <span>${purchase.tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>${purchase.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                                    Print Invoice
                                </button>
                                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                                    Download PDF
                                </button>
                                {purchase.status === "Processing" && (
                                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200">
                                        Cancel Order
                                    </button>
                                )}
                            </div>

                            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                                <h3 className="font-medium mb-2">Need Help?</h3>
                                <p className="text-gray-400 text-sm mb-3">Contact our support team for assistance with your order.</p>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    const renderCurrentView = () => {
        switch (currentView) {
            case "create":
                return renderCreatePurchase()
            case "details":
                return renderPurchaseDetails()
            default:
                return renderPurchaseList()
        }
    }

    return <div className="min-h-screen bg-gray-900">{renderCurrentView()}</div>
}
