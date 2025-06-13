"use client"

import { useState, useEffect } from "react"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { backEndURL } from "../Backendurl";

export default function PurchaseApp() {
    const [currentView, setCurrentView] = useState("list") // "list", "create", "details"
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null)
    const [purchases, setPurchases] = useState([
        {
            id: "PUR-001",
            date: "2024-01-15",
            name: "John Doe",
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
            billingAddress: "123 Main St, New York, NY 10001",
            shippingAddress: "123 Main St, New York, NY 10001",
        },
        {
            id: "PUR-002",
            date: "2024-01-14",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "555-0456",
            items: [{ name: "Bluetooth Speaker", quantity: 1, price: 149.99, total: 149.99 }],
            subtotal: 149.99,
            shipping: 9.99,
            tax: 12.0,
            total: 171.98,
            billingAddress: "456 Oak Ave, Los Angeles, CA 90210",
            shippingAddress: "456 Oak Ave, Los Angeles, CA 90210",
        },
    ])

    // Form state for creating new purchase
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        supplierNotes: "",
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

    // Remove static supplier list
    // const existingSuppliers = [...];
    const [suppliers, setSuppliers] = useState([])
    const [supplierType, setSupplierType] = useState("new") // 'new' or 'existing'
    const [selectedSupplierId, setSelectedSupplierId] = useState("")
    const [loadingSuppliers, setLoadingSuppliers] = useState(false)
    const [savingSupplier, setSavingSupplier] = useState(false)
    const [customerSaved, setCustomerSaved] = useState(false)

    // Add after other useState hooks
    const [editingPrices, setEditingPrices] = useState({}); // { [sku]: value }
    const [savingPriceSku, setSavingPriceSku] = useState("");

    // Add state for modal and product form
    const [productMode, setProductMode] = useState("existing"); // 'new' or 'existing'
    const [addProductModalOpen, setAddProductModalOpen] = useState(false);
    const [viewProductsModalOpen, setViewProductsModalOpen] = useState(false);
    const [newProductForm, setNewProductForm] = useState({
        name: "",
        costPrice: "",
        sku: "",
        category: "General",
        description: "",
    });
    const [newProductLoading, setNewProductLoading] = useState(false);
    const [newProductError, setNewProductError] = useState("");
    const [productSearch, setProductSearch] = useState("");

    // Add this state for selected purchase details
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    // Fetch suppliers from backend
    useEffect(() => {
        if (supplierType === "existing") {
            setLoadingSuppliers(true)
            fetch(`${backEndURL}/api/contacts`)
                .then(res => res.json())
                .then(data => {
                    // Only suppliers
                    setSuppliers(Array.isArray(data) ? data.filter(s => s.categoryType === "Supplier") : [])
                })
                .catch(() => setSuppliers([]))
                .finally(() => setLoadingSuppliers(false))
        }
    }, [supplierType])

    // Auto-fill form when existing supplier is selected
    useEffect(() => {
        if (supplierType === "existing" && selectedSupplierId) {
            const supplier = suppliers.find(s => s.id === selectedSupplierId)
            if (supplier) {
                setFormData(prev => ({
                    ...prev,
                    name: supplier.name || "",
                    email: supplier.email || "",
                    phone: supplier.phone || "",
                    company: supplier.company || "",
                    website: supplier.website || "",
                    supplierNotes: supplier.supplierNotes || "",
                }))
            }
        }
    }, [selectedSupplierId, suppliers, supplierType])

    useEffect(() => {
        async function fetchProducts() {
            setProductsLoading(true)
            try {
                const res = await fetch(`${backEndURL}/api/products`)
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
    }, [priceList, products])

    // Add this useEffect after other useEffect hooks
    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                const response = await fetch(`${backEndURL}/api/purchase`);
                if (!response.ok) {
                    throw new Error('Failed to fetch purchases');
                }
                const data = await response.json();
                setPurchases(data);
            } catch (error) {
                console.error('Error fetching purchases:', error);
            }
        };

        fetchPurchases();
    }, []);

    const addPurchase = (newPurchase) => {
        const purchaseId = `PUR-${String(purchases.length + 1).padStart(3, "0")}`
        const purchase = {
            ...newPurchase,
            id: purchaseId,
            date: new Date().toISOString().split("T")[0],
        }
        setPurchases((prev) => [purchase, ...prev])
        setCurrentView("list")
        // Reset form
        setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            website: "",
            supplierNotes: "",
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

    const viewPurchase = async (purchaseId) => {
        try {
            const response = await fetch(`${backEndURL}/api/purchase/${purchaseId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch purchase details');
            }
            const data = await response.json();
            setSelectedPurchase(data);
            setSelectedPurchaseId(purchaseId);
            setCurrentView("details");
        } catch (error) {
            console.error('Error fetching purchase details:', error);
            alert('Failed to load purchase details');
        }
    };


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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
        const grandTotal = subtotal;

        const purchaseData = {
            customerName: formData.name,
            customerEmail: formData.email,
            items: cartItems.map(item => ({
                sku: item.sku,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total
            })),
            subtotal,
            total: grandTotal,
            paymentMethod: paymentMethod
        };

        try {
            // Save to backend
            const response = await fetch(`${backEndURL}/api/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData)
            });

            if (!response.ok) {
                throw new Error('Failed to save purchase');
            }

            const savedPurchase = await response.json();

            // Add to local state
            addPurchase(savedPurchase);

            // Send each product to inventory
            for (const item of cartItems) {
                await fetch(`${backEndURL}/api/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.sku,
                        quantity: item.quantity,
                        supplierEmail: formData.email,
                    }),
                });
            }

            // Reset form and cart
            setFormData({
                name: "",
                email: "",
                phone: "",
                company: "",
                website: "",
                supplierNotes: "",
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
            });
            setCartItems([]);
            setCurrentView("list");

            // Fast page refresh after saving
            window.location.reload();
        } catch (error) {
            console.error('Error saving purchase:', error);
            alert('Failed to save purchase. Please try again.');
        }
    };

    const getProductPrice = (product) => {
        if (!product) return 0;
        return Number(product.costPrice) || 0;
    };

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

    // Save customer info (POST to backend if new supplier)
    const handleSaveCustomer = async (e) => {
        e.preventDefault()
        if (supplierType === "new") {
            setSavingSupplier(true)
            try {
                const res = await fetch(`${backEndURL}/api/contacts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        company: formData.company,
                        website: formData.website,
                        supplierNotes: formData.supplierNotes,
                        categoryType: "Supplier",
                    })
                })
                if (!res.ok) throw new Error("Failed to save supplier")
                // Optionally, you can get the new supplier and add to suppliers list
                // const newSupplier = await res.json()
            } catch (err) {
                alert("Failed to save supplier. Please try again.")
                setSavingSupplier(false)
                return
            }
            setSavingSupplier(false)
        }
        setCustomerSaved(true)
    }
    // Edit customer info
    const handleEditCustomer = () => {
        setCustomerSaved(false)
    }
    // Delete customer info
    const handleDeleteCustomer = () => {
        setCustomerSaved(false)
        setSupplierType("new")
        setSelectedSupplierId("")
        setFormData(prev => ({
            ...prev,
            name: "",
            email: "",
            phone: "",
            company: "",
            website: "",
            supplierNotes: "",
        }))
    }

    // Add this handler before renderCreatePurchase
    const handlePriceInputChange = (sku, value) => {
        setEditingPrices((prev) => ({ ...prev, [sku]: value }))
    }

    const handleSavePrice = async (item) => {
        const newPrice = parseFloat(editingPrices[item.sku])
        if (isNaN(newPrice) || newPrice <= 0) return;
        setSavingPriceSku(item.sku);
        // Update cart item price
        setCartItems((prev) =>
            prev.map((ci) =>
                ci.sku === item.sku
                    ? { ...ci, price: newPrice, total: newPrice * ci.quantity }
                    : ci
            )
        );
        // Update product costPrice in backend
        try {
            await fetch(`${backEndURL}/api/products/${item.sku}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ costPrice: newPrice }),
            });
        } catch (err) {
            // Optionally show error
        }
        setSavingPriceSku("");
    };

    // Handler for new product form
    const handleNewProductFormChange = (e) => {
        const { name, value } = e.target;
        setNewProductForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateNewProduct = async (e) => {
        e.preventDefault();
        setNewProductLoading(true);
        setNewProductError("");
        try {
            const res = await fetch(`${backEndURL}/api/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newProductForm.name,
                    costPrice: Number(newProductForm.costPrice),
                    sku: newProductForm.sku,
                    category: newProductForm.category,
                    description: newProductForm.description,
                }),
            });
            if (!res.ok) throw new Error("Failed to create product");
            const product = await res.json();
            // Add to cart
            addProductToCart(product);
            setAddProductModalOpen(false);
            setNewProductForm({ name: "", costPrice: "", sku: "", category: "General", description: "" });
        } catch (err) {
            setNewProductError("Failed to create product. Please check your input.");
        }
        setNewProductLoading(false);
    };

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
                    <div className="text-2xl font-bold text-white">
                        Rs {purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
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
                                    <tr key={`purchase-${purchase.purchaseId}`} className="border-b border-gray-700 hover:bg-gray-750">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-white">{purchase.purchaseId}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-white font-medium">{purchase.customerName}</div>
                                            <div className="text-gray-400 text-sm">{purchase.customerEmail}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-300">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-gray-300">
                                            {purchase.numberOfProducts} item{purchase.numberOfProducts !== 1 ? "s" : ""}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="font-semibold text-white">Rs {purchase.total.toFixed(2)}</div>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <span className={`px-2 py-1 rounded text-sm ${purchase.paymentStatus === "Paid by Cash"
                                                    ? "bg-green-600 text-white"
                                                    : "bg-blue-600 text-white"
                                                }`}>
                                                {purchase.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => viewPurchase(purchase.purchaseId)}
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
        const grandTotal = subtotal

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
                    <div className="mb-4 flex items-center space-x-8">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="productMode"
                                value="new"
                                checked={productMode === "new"}
                                onChange={() => setProductMode("new")}
                                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span>New Product</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="productMode"
                                value="existing"
                                checked={productMode === "existing"}
                                onChange={() => setProductMode("existing")}
                                className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                            <span>Existing Product</span>
                        </label>
                        {productMode === "new" ? (
                            <button
                                type="button"
                                onClick={() => setAddProductModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Add Product
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setViewProductsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                            >
                                View All Products
                            </button>
                        )}
                    </div>
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="text-left py-3 px-2">Product ID</th>
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
                                            <div className="font-medium">{item.sku}</div>
                                        </td>
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
                                        <td className="text-right py-4 px-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editingPrices[item.sku] !== undefined ? editingPrices[item.sku] : item.price}
                                                onChange={e => handlePriceInputChange(item.sku, e.target.value)}
                                                className="text-right bg-gray-700 border border-gray-600 rounded px-2 py-1 w-24 text-white"
                                                min="0.01"
                                            />
                                            <button
                                                type="button"
                                                className="ml-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                                onClick={() => handleSavePrice(item)}
                                                disabled={savingPriceSku === item.sku}
                                            >
                                                {savingPriceSku === item.sku ? "Saving..." : "Save"}
                                            </button>
                                        </td>

                                        <td className="text-right py-4 px-2 font-semibold">Rs {item.total.toFixed(2)}</td>
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
                            <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                                <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

                                {/* Preview mode */}
                                {customerSaved ? (
                                    <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="font-semibold text-lg">{formData.name}</div>
                                            <div className="space-x-2">
                                                <button
                                                    type="button"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                    onClick={handleEditCustomer}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                                    onClick={handleDeleteCustomer}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 text-sm mb-1">Email: {formData.email}</div>
                                        {formData.phone && <div className="text-gray-300 text-sm mb-1">Phone: {formData.phone}</div>}
                                        {formData.company && <div className="text-gray-300 text-sm mb-1">Company: {formData.company}</div>}
                                        {formData.website && <div className="text-gray-300 text-sm mb-1">Website: {formData.website}</div>}
                                        {formData.supplierNotes && <div className="text-gray-300 text-sm mb-1">Notes: {formData.supplierNotes}</div>}
                                    </div>
                                ) : (
                                    <>
                                        {/* Supplier Type Selection */}
                                        <div className="mb-4 flex items-center space-x-8">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="supplierType"
                                                    value="new"
                                                    checked={supplierType === "new"}
                                                    onChange={() => { setSupplierType("new"); setSelectedSupplierId(""); setFormData(prev => ({ ...prev, name: "", email: "", phone: "", company: "", website: "", supplierNotes: "" })); }}
                                                    className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                />
                                                <span>New Supplier</span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="supplierType"
                                                    value="existing"
                                                    checked={supplierType === "existing"}
                                                    onChange={() => setSupplierType("existing")}
                                                    className="mr-2 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                                />
                                                <span>Existing Supplier</span>
                                            </label>
                                        </div>
                                        {/* Existing Supplier Dropdown */}
                                        {supplierType === "existing" && (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium mb-2">Select Supplier</label>
                                                {loadingSuppliers ? (
                                                    <div className="text-gray-400">Loading suppliers...</div>
                                                ) : (
                                                    <select
                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                                        value={selectedSupplierId}
                                                        onChange={e => setSelectedSupplierId(e.target.value)}
                                                    >
                                                        <option value="">-- Select Supplier --</option>
                                                        {suppliers.map(supplier => (
                                                            <option key={supplier.id} value={supplier.id}>{supplier.name} {supplier.company ? `(${supplier.company})` : ""}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                                    required
                                                    disabled={supplierType === "existing"}
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
                                                    disabled={supplierType === "existing"}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                                    disabled={supplierType === "existing"}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Company</label>
                                                <input
                                                    type="text"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                                    disabled={supplierType === "existing"}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Website</label>
                                                <input
                                                    type="text"
                                                    name="website"
                                                    value={formData.website}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                                    disabled={supplierType === "existing"}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Notes</label>
                                                <input
                                                    type="text"
                                                    name="supplierNotes"
                                                    value={formData.supplierNotes}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                                                    disabled={supplierType === "existing"}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                            onClick={handleSaveCustomer}
                                            disabled={savingSupplier}
                                        >
                                            {savingSupplier ? "Saving..." : "Save"}
                                        </button>
                                    </>
                                )}
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
                                        <span>Rs {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-700 pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>Rs {grandTotal.toFixed(2)}</span>
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

                {/* Add Product Modal */}
                {addProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-md relative">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                                onClick={() => setAddProductModalOpen(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-semibold mb-6 text-white">Add New Product</h2>
                            <form onSubmit={handleCreateNewProduct} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newProductForm.name}
                                        onChange={handleNewProductFormChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cost Price *</label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        value={newProductForm.costPrice}
                                        onChange={handleNewProductFormChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        required
                                        min="0.01"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={newProductForm.sku}
                                        onChange={handleNewProductFormChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={newProductForm.category}
                                        onChange={handleNewProductFormChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                    >
                                        <option value="General">General</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Office">Office</option>
                                        <option value="Services">Services</option>
                                        <option value="Hardware">Hardware</option>
                                        <option value="Software">Software</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={newProductForm.description}
                                        onChange={handleNewProductFormChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                                        rows={2}
                                    />
                                </div>
                                {newProductError && <div className="text-red-500 text-sm">{newProductError}</div>}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200"
                                    disabled={newProductLoading}
                                >
                                    {newProductLoading ? "Creating..." : "Create Product & Add to Cart"}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* View All Products Modal */}
                {viewProductsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-2xl relative">
                            <button
                                className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                                onClick={() => setViewProductsModalOpen(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-semibold mb-6 text-white">All Products</h2>
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="w-full mb-4 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            />
                            <div className="overflow-y-auto max-h-96">
                                <table className="w-full text-white">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            <th className="py-2 px-2 text-left">Name</th>
                                            <th className="py-2 px-2 text-left">SKU</th>
                                            <th className="py-2 px-2 text-left">Category</th>
                                            <th className="py-2 px-2 text-left">Cost Price</th>
                                            <th className="py-2 px-2 text-left">Description</th>
                                            <th className="py-2 px-2 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                                            <tr key={product.sku} className="border-b border-gray-700">
                                                <td className="py-2 px-2">{product.name}</td>
                                                <td className="py-2 px-2">{product.sku}</td>
                                                <td className="py-2 px-2">{product.category}</td>
                                                <td className="py-2 px-2">{product.costPrice}</td>
                                                <td className="py-2 px-2">{product.description}</td>
                                                <td className="py-2 px-2 text-center">
                                                    <button
                                                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                                                        onClick={() => {
                                                            addProductToCart(product);
                                                            setViewProductsModalOpen(false);
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Purchase Details View
    const renderPurchaseDetails = () => {
        if (!selectedPurchase) {
            return (
                <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Loading Purchase Details...</h1>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Purchase Details</h1>
                        <p className="text-gray-400">Purchase ID: {selectedPurchase.purchaseId}</p>
                    </div>
                    <button
                        onClick={() => setCurrentView("list")}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 no-print"
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
                                    <p className="text-gray-400">Created on {new Date(selectedPurchase.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded text-sm ${selectedPurchase.paymentStatus === "Paid by Cash"
                                        ? "bg-green-600 text-white"
                                        : "bg-blue-600 text-white"
                                    }`}>
                                    {selectedPurchase.paymentStatus}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-2">Customer Information</h3>
                                    <div className="text-gray-300 space-y-1">
                                        <p>{selectedPurchase.customerName}</p>
                                        <p>{selectedPurchase.customerEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-3 px-2">Product ID</th>
                                            <th className="text-left py-3 px-2">Product</th>
                                            <th className="text-center py-3 px-2">Quantity</th>
                                            <th className="text-right py-3 px-2">Price</th>
                                            <th className="text-right py-3 px-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPurchase.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-700">
                                                <td className="py-4 px-2">
                                                    <div className="font-medium">{item.sku}</div>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <div className="font-medium">{item.name}</div>
                                                </td>
                                                <td className="text-center py-4 px-2">{item.quantity}</td>
                                                <td className="text-right py-4 px-2">Rs {item.price.toFixed(2)}</td>
                                                <td className="text-right py-4 px-2 font-semibold">Rs {item.total.toFixed(2)}</td>
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
                                        <p className="text-gray-400 text-sm">
                                            {new Date(selectedPurchase.createdAt).toLocaleDateString()} at {new Date(selectedPurchase.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
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
                                    <span>Rs {selectedPurchase.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>Rs {selectedPurchase.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 no-print">
                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200" onClick={handlePrintInvoice}>
                                    Print Invoice
                                </button>
                                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200" onClick={handleDownloadPDF}>
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
    if (!selectedPurchase) return;

    const doc = new jsPDF();

    // === Company Header ===
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Company Name', 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Business Street, City, Country', 105, 22, { align: 'center' });
    doc.text('Email: contact@yourcompany.com | Phone: +123-456-7890', 105, 28, { align: 'center' });

    // Optional Logo (adjust x/y/width/height as needed)
    // doc.addImage(logo, 'PNG', 15, 10, 30, 20);

    // === Invoice Title ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Invoice', 105, 40, { align: 'center' });

    // === Purchase Info ===
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Purchase ID: ${selectedPurchase.purchaseId}`, 20, 55);
    doc.text(`Date: ${new Date(selectedPurchase.createdAt).toLocaleDateString()}`, 20, 63);
    doc.text(`Status: ${selectedPurchase.paymentStatus}`, 20, 71);

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);

    // === Customer Info ===
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information:', 20, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${selectedPurchase.customerName}`, 30, 93);
    doc.text(`Email: ${selectedPurchase.customerEmail}`, 30, 101);

    // === Product Table ===
    const tableColumn = ['Product ID', 'Product', 'Quantity', 'Price', 'Total'];
    const tableRows = selectedPurchase.items.map(item => [
        item.sku,
        item.name,
        item.quantity.toString(),
        `Rs ${item.price.toFixed(2)}`,
        `Rs ${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 110,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 10 }
    });
    const finalY = doc.lastAutoTable.finalY || 200;
    doc.setFont('helvetica', 'bold');
    doc.text(`Subtotal:`, 140, finalY + 10);
    doc.text(`Rs ${selectedPurchase.subtotal.toFixed(2)}`, 180, finalY + 10, { align: 'right' });
    doc.text(`Total:`, 140, finalY + 18);
    doc.text(`Rs ${selectedPurchase.total.toFixed(2)}`, 180, finalY + 18, { align: 'right' });

    // === Footer ===
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your purchase!', 105, finalY + 35, { align: 'center' });

    // Save PDF
    doc.save(`purchase-${selectedPurchase.purchaseId}.pdf`);
};


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

    return (
        <div className="min-h-screen bg-gray-900">
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-content, .print-content * {
                            visibility: visible;
                        }
                        .print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
            <div className="print-content">
                {renderCurrentView()}
            </div>
        </div>
    );
}
