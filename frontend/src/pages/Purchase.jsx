"use client"

import { useState, useEffect } from "react"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { backEndURL } from "../Backendurl";
import * as XLSX from 'xlsx';
import { useToast } from "../components/Toats";
import { FaEye, FaUndo } from 'react-icons/fa';

export default function PurchaseApp() {
    const toast = useToast();
    const [currentView, setCurrentView] = useState("list") // "list", "create", "details"
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null)
    const [purchases, setPurchases] = useState([
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
    const [identifierModalOpen, setIdentifierModalOpen] = useState(false)
    const [currentItem, setCurrentItem] = useState(null)
    const [productIdentifiers, setProductIdentifiers] = useState({}) // { productId: { identifiers: [] } }
    const [pendingQuantityUpdates, setPendingQuantityUpdates] = useState({}) // { productId: newQuantity }

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
    const [customerSaved, setCustomerSaved] = useState(false)

    // Add after other useState hooks
    const [editingPrices, setEditingPrices] = useState({}); // { [sku]: value }

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

    const updateItemQuantity = async (id, newQuantity) => {
        if (newQuantity < 1) return
        
        const item = cartItems.find(item => item.id === id)
        if (!item) return

        // Store the pending quantity update
        setPendingQuantityUpdates(prev => ({
            ...prev,
            [id]: newQuantity
        }))

        // Update the display quantity immediately
        setCartItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity, total: item.price * newQuantity } : item)),
        )
    }

    const confirmQuantityUpdate = async (id) => {
        const newQuantity = pendingQuantityUpdates[id]
        if (!newQuantity) return

        const item = cartItems.find(item => item.id === id)
        if (!item) return

        // Fetch product details to check identifier type
        try {
            const response = await fetch(`${backEndURL}/api/products/${item.sku}`)
            const product = await response.json()
            
            if (product.productIdentifierType === 'serial' || product.productIdentifierType === 'imei') {
                setCurrentItem({ 
                    ...item, 
                    newQuantity, 
                    productIdentifierType: product.productIdentifierType,
                    existingIdentifiers: item.existingIdentifiers || [], // Preserve existing identifiers
                    warranty: product.warranty === true || product.warranty === 'Yes', // Store warranty as boolean
                })
                setIdentifierModalOpen(true)
            } else {
                // If not serial or imei, just confirm the quantity
                setCartItems((prev) =>
                    prev.map((item) => 
                        item.id === id 
                            ? { ...item, quantity: newQuantity, total: item.price * newQuantity } 
                            : item
                    )
                )
            }
        } catch (error) {
            console.error('Error fetching product details:', error)
        }

        // Clear the pending update
        setPendingQuantityUpdates(prev => {
            const newState = { ...prev }
            delete newState[id]
            return newState
        })
    }

    const handleIdentifiersSubmit = (identifiers) => {
        if (!currentItem) return;

        // Update the cart item with new identifiers
        setCartItems((prev) =>
            prev.map((item) => {
                if (item.id === currentItem.id) {
                    // Replace all existing identifiers with the new ones
                    const newIdentifiers = identifiers.map(i => ({
                        value: i.value,
                        index: i.index,
                        warranty: i.warranty,
                    }));
                    return {
                        ...item,
                        quantity: currentItem.newQuantity,
                        total: item.price * currentItem.newQuantity,
                        existingIdentifiers: newIdentifiers // Replace instead of append
                    };
                }
                return item;
            })
        );

        // Store identifiers for later saving - replace instead of append
        setProductIdentifiers(prev => ({
            ...prev,
            [currentItem.id]: { 
                identifiers: identifiers // Replace instead of append
            }
        }));

        // Show success toast
        const filledCount = identifiers.filter(id => id.value.trim() !== '').length;
        toast.success(
            `${filledCount} ${currentItem.productIdentifierType === 'serial' ? 'serial numbers' : 'IMEI numbers'} saved for ${currentItem.name}`,
            "Identifiers Updated",
            {
                duration: 3000
            }
        );

        setIdentifierModalOpen(false);
        setCurrentItem(null);
    };

    const removeItem = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = "Processing...";
        submitButton.disabled = true;

        // Show loading toast
        const loadingToastId = toast.loading("Processing your purchase...", "Creating Purchase");

        try {
            // Step 1: Save supplier information if it's a new supplier
            if (supplierType === "new" && !customerSaved) {
                toast.info("Saving supplier information...", "Step 1/7");
                const supplierResponse = await fetch(`${backEndURL}/api/contacts`, {
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
                });
                if (!supplierResponse.ok) {
                    throw new Error("Failed to save supplier information");
                }
            }

            // Step 2: Save all price updates
            toast.info("Updating product prices...", "Step 2/7");
            const priceUpdatePromises = cartItems.map(async (item) => {
                if (editingPrices[item.sku] !== undefined) {
                    const newPrice = parseFloat(editingPrices[item.sku]);
                    if (!isNaN(newPrice) && newPrice > 0) {
                        return fetch(`${backEndURL}/api/products/${item.sku}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ costPrice: newPrice }),
                        });
                    }
                }
                return Promise.resolve();
            });
            await Promise.all(priceUpdatePromises);

            // Step 3: Save all identifiers
            toast.info("Processing product identifiers...", "Step 3/7");
            const identifierPromises = cartItems.map(async (item) => {
                // Get all identifiers for this item (from both productIdentifiers and existingIdentifiers)
                const allIdentifiers = [];
                // Add identifiers from productIdentifiers state
                if (productIdentifiers[item.id]?.identifiers) {
                    allIdentifiers.push(...productIdentifiers[item.id].identifiers);
                }
                // Add identifiers from cart item's existingIdentifiers
                if (item.existingIdentifiers) {
                    allIdentifiers.push(...item.existingIdentifiers);
                }
                // Deduplicate by value
                const uniqueIdentifiersMap = {};
                allIdentifiers.forEach(i => {
                    if (i.value && !uniqueIdentifiersMap[i.value]) {
                        uniqueIdentifiersMap[i.value] = i;
                    }
                });
                const uniqueIdentifiers = Object.values(uniqueIdentifiersMap);
                if (uniqueIdentifiers.length > 0) {
                    return fetch(`${backEndURL}/api/identifiers/save`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            productId: item.sku,
                            identifiers: uniqueIdentifiers.map(i => ({ value: i.value, warranty: i.warranty })),
                            type: item.productIdentifierType,
                            purchaseId: `TEMP-${Date.now()}-${item.id}`
                        })
                    });
                }
                return Promise.resolve();
            });
            await Promise.all(identifierPromises);

            // Step 4: Create purchase data
            toast.info("Preparing purchase data...", "Step 4/7");
            const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
            const grandTotal = subtotal;

            const purchaseData = {
                customerName: formData.name,
                customerEmail: formData.email,
                items: cartItems.map(item => {
                    // Get all identifiers for this item
                    const allIdentifiers = [];
                    
                    // Add identifiers from productIdentifiers state
                    if (productIdentifiers[item.id]?.identifiers) {
                        allIdentifiers.push(...productIdentifiers[item.id].identifiers);
                    }
                    
                    // Add identifiers from cart item's existingIdentifiers
                    if (item.existingIdentifiers) {
                        allIdentifiers.push(...item.existingIdentifiers);
                    }
                    
                    let result = {
                        sku: item.sku,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.total,
                        identifiers: allIdentifiers
                    };
                    if (item.productIdentifierType === 'none' && item.warranty && item.warrantyValue) {
                        result.warrantyValue = item.warrantyValue;
                    }
                    return result;
                }),
                subtotal,
                total: grandTotal,
                paymentMethod: paymentMethod
            };

            // Step 5: Save purchase to backend
            toast.info("Saving purchase to database...", "Step 5/7");
            const purchaseResponse = await fetch(`${backEndURL}/api/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData)
            });

            if (!purchaseResponse.ok) {
                throw new Error('Failed to save purchase');
            }

            const savedPurchase = await purchaseResponse.json();

            // Step 6: Update identifiers with actual purchase ID
            toast.info("Updating product identifiers...", "Step 6/7");
            const updateIdentifierPromises = cartItems.map(async (item) => {
                if (productIdentifiers[item.id]?.identifiers) {
                    const identifiers = productIdentifiers[item.id].identifiers;
                    if (identifiers.length > 0) {
                        return fetch(`${backEndURL}/api/identifiers/update-purchase-id`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                productId: item.sku,
                                type: item.productIdentifierType,
                                tempPurchaseId: identifiers[0].purchaseId,
                                purchaseId: savedPurchase.purchaseId
                            })
                        });
                    }
                }
                return Promise.resolve();
            });
            await Promise.all(updateIdentifierPromises);

            // Step 7: Update inventory
            toast.info("Updating inventory...", "Step 7/7");
            const inventoryPromises = cartItems.map(async (item) => {
                // Get all identifiers for this item
                const allIdentifiers = [];
                
                // Add identifiers from productIdentifiers state
                if (productIdentifiers[item.id]?.identifiers) {
                    allIdentifiers.push(...productIdentifiers[item.id].identifiers);
                }
                
                // Add identifiers from cart item's existingIdentifiers
                if (item.existingIdentifiers) {
                    allIdentifiers.push(...item.existingIdentifiers);
                }
                
                return fetch(`${backEndURL}/api/inventory/update`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productId: item.sku,
                        quantity: item.quantity,
                        supplierEmail: formData.email,
                        invoiceId: savedPurchase.id,
                        identifiers: allIdentifiers
                    }),
                });
            });
            await Promise.all(inventoryPromises);

            // Step 8: Add to local state
            addPurchase(savedPurchase);

            // Step 9: Reset form and cart
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
            setProductIdentifiers({});
            setEditingPrices({});
            setCustomerSaved(false);
            setCurrentView("list");

            // Dismiss loading toast and show success
            toast.dismiss(loadingToastId);
            toast.success(
                `Purchase completed successfully! Total: Rs ${grandTotal.toFixed(2)}`,
                "Purchase Created",
                {
                    duration: 5000,
                    actions: [
                        {
                            label: "View Details",
                            onClick: () => viewPurchase(savedPurchase.purchaseId),
                            className: "bg-primary text-white px-3 py-1 rounded"
                        }
                    ]
                }
            );

        } catch (error) {
            console.error('Error processing purchase:', error);
            
            // Dismiss loading toast and show error
            toast.dismiss(loadingToastId);
            toast.error(
                `Failed to process purchase: ${error.message}`,
                "Purchase Failed",
                {
                    duration: 8000,
                    actions: [
                        {
                            label: "Try Again",
                            onClick: () => window.location.reload(),
                            className: "bg-red-500 text-white px-3 py-1 rounded"
                        }
                    ]
                }
            );
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    };

    const getProductPrice = (product) => {
        if (!product) return 0;
        return Number(product.costPrice) || 0;
    };

    const addProductToCart = async (product) => {
        try {
            // Fetch complete product details including identifier type
            const response = await fetch(`${backEndURL}/api/products/${product.sku}`)
            const productDetails = await response.json()
            
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
                                productIdentifierType: productDetails.productIdentifierType,
                                existingIdentifiers: item.existingIdentifiers || [], // Keep track of existing identifiers
                                warranty: productDetails.warranty === true || productDetails.warranty === 'Yes',
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
                        productIdentifierType: productDetails.productIdentifierType,
                        existingIdentifiers: [], // Initialize empty array for new products
                        warranty: productDetails.warranty === true || productDetails.warranty === 'Yes',
                    },
                ]
            })
            setAddProductDropdownOpen(false)
        } catch (error) {
            console.error('Error fetching product details:', error)
            // Fallback to adding without identifier type
            setCartItems((prev) => {
                const existing = prev.find((item) => item.sku === product.sku)
                if (existing) {
                    return prev.map((item) =>
                        item.sku === product.sku
                            ? {
                                ...item,
                                quantity: item.quantity + 1,
                                price: getProductPrice(product),
                                total: getProductPrice(product) * (item.quantity + 1)
                            }
                            : item
                    )
                }
                return [
                    ...prev,
                    {
                        id: product.sku,
                        sku: product.sku,
                        name: product.name,
                        price: getProductPrice(product),
                        quantity: 1,
                        total: getProductPrice(product)
                    },
                ]
            })
            setAddProductDropdownOpen(false)
        }
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



    const handlePriceChange = (item, newPrice) => {
        // Update cart item price immediately for display
        setCartItems((prev) =>
            prev.map((ci) =>
                ci.sku === item.sku
                    ? { ...ci, price: newPrice, total: newPrice * ci.quantity }
                    : ci
            )
        );
        // Store the price change for later saving
        setEditingPrices((prev) => ({ ...prev, [item.sku]: newPrice }));
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
            await addProductToCart(product);
            setAddProductModalOpen(false);
            setNewProductForm({ name: "", costPrice: "", sku: "", category: "General", description: "" });
        } catch (err) {
            setNewProductError("Failed to create product. Please check your input.");
        }
        setNewProductLoading(false);
    };

    // Purchase List View
    const renderPurchaseList = () => (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/20">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                    <div className="mb-6 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Purchase Management
                                </h1>
                                <p className="text-text-secondary mt-1">Streamline your procurement process</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => setCurrentView("create")}
                            className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-medium text-white bg-gradient-to-r from-primary to-secondary rounded-xl shadow-2xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-primary/25"
                        >
                            <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Purchase
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">Total Purchases</p>
                                <p className="text-3xl font-bold text-text-primary mt-2">{purchases.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">Total Value</p>
                                <p className="text-3xl font-bold text-text-primary mt-2">
                                    Rs {purchases.reduce((sum, p) => sum + p.total, 0).toFixed(2)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">This Month</p>
                                <p className="text-3xl font-bold text-text-primary mt-2">
                                    {purchases.filter(p => {
                                        const purchaseDate = new Date(p.createdAt);
                                        const now = new Date();
                                        return purchaseDate.getMonth() === now.getMonth() && 
                                               purchaseDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-secondary text-sm font-medium">Pending</p>
                                <p className="text-3xl font-bold text-text-primary mt-2">
                                    {purchases.filter(p => p.paymentStatus === "SupplierAcc").length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                </div>

                {/* Purchases Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-border/50">
                    <div className="px-8 py-6 border-b border-border/30 bg-gradient-to-r from-surface to-white">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-text-primary">Recent Purchases</h2>
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-text-secondary text-sm">{purchases.length} purchases</span>
                            </div>
                        </div>
                    </div>

                    {purchases.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-text-primary mb-2">No purchases yet</h3>
                            <p className="text-text-secondary mb-6">Start by creating your first purchase order</p>
                            <button
                                onClick={() => setCurrentView("create")}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Your First Purchase
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-surface to-white border-b border-border/30">
                                    <tr>
                                        <th className="text-left py-4 px-8 text-text-secondary font-semibold">Purchase ID</th>
                                        <th className="text-left py-4 px-8 text-text-secondary font-semibold">Supplier</th>
                                        <th className="text-left py-4 px-8 text-text-secondary font-semibold">Date</th>
                                        <th className="text-left py-4 px-8 text-text-secondary font-semibold">Items</th>
                                        <th className="text-right py-4 px-8 text-text-secondary font-semibold">Total</th>
                                        <th className="text-center py-4 px-8 text-text-secondary font-semibold">Status</th>
                                        <th className="text-center py-4 px-8 text-text-secondary font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {purchases.map((purchase, index) => (
                                        <tr key={`purchase-${purchase.purchaseId}`} 
                                            className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                                        <span className="text-primary font-semibold text-sm">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-text-primary">{purchase.purchaseId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div>
                                                    <div className="font-semibold text-text-primary">{purchase.customerName}</div>
                                                    <div className="text-text-secondary text-sm">{purchase.customerEmail}</div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="text-text-secondary">
                                                    {new Date(purchase.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                                        {purchase.numberOfProducts} item{purchase.numberOfProducts !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <div className="font-bold text-text-primary text-lg">
                                                    Rs {purchase.total.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    purchase.paymentStatus === "Paid by Cash"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}>
                                                    <span className={`w-2 h-2 rounded-full mr-2 ${
                                                        purchase.paymentStatus === "Paid by Cash" ? "bg-green-500" : "bg-blue-500"
                                                    }`}></span>
                                                    {purchase.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8 text-center">
                                                <button
                                                    onClick={() => viewPurchase(purchase.purchaseId)}
                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View
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
        </div>
    )

    // Create Purchase View
    const renderCreatePurchase = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0)
        const grandTotal = subtotal

        // Card Modal overlay
        const CardModal = () => (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-border/50">
                    <button
                        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors"
                        onClick={() => setCardModalOpen(false)}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">Card Payment</h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">Name on Card *</label>
                            <input
                                type="text"
                                name="cardName"
                                value={formData.cardName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-text-primary">Card Number *</label>
                            <input
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-text-primary">Expiry Date *</label>
                                <input
                                    type="text"
                                    name="expiryDate"
                                    value={formData.expiryDate}
                                    onChange={handleInputChange}
                                    placeholder="MM/YY"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-text-primary">CVV *</label>
                                <input
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="mt-8 w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                        onClick={() => {
                            setCardModalOpen(false)
                            document.getElementById('purchase-form').requestSubmit()
                        }}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit Payment
                    </button>
                </div>
            </div>
        )

        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/20">
                <div className="container mx-auto px-6 py-8 max-w-7xl">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                        <div className="mb-6 lg:mb-0">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        Create New Purchase
                                    </h1>
                                    <p className="text-text-secondary mt-1">Complete the form below to create a new purchase</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentView("list")}
                            className="inline-flex items-center px-6 py-3 bg-white text-text-primary font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:scale-105"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Purchases
                        </button>
                    </div>

                    {/* Purchase Items */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-border/50">
                        <div className="mb-6 flex items-center space-x-8">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="productMode"
                                    value="new"
                                    checked={productMode === "new"}
                                    onChange={() => setProductMode("new")}
                                    className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                />
                                <span className="text-text-primary font-medium">New Product</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="productMode"
                                    value="existing"
                                    checked={productMode === "existing"}
                                    onChange={() => setProductMode("existing")}
                                    className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                />
                                <span className="text-text-primary font-medium">Existing Product</span>
                            </label>
                            {productMode === "new" ? (
                                <button
                                    type="button"
                                    onClick={() => setAddProductModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add Product
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setViewProductsModalOpen(true)}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    View All Products
                                </button>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/30">
                                        <th className="text-left py-4 px-4 text-text-secondary font-semibold">Product ID</th>
                                        <th className="text-left py-4 px-4 text-text-secondary font-semibold">Product</th>
                                        <th className="text-center py-4 px-4 text-text-secondary font-semibold">Quantity</th>
                                        <th className="text-right py-4 px-4 text-text-secondary font-semibold">Price</th>
                                        <th className="text-right py-4 px-4 text-text-secondary font-semibold">Total</th>
                                        {/* Warranty column for products with productIdentifierType none and warranty true */}
                                        <th className="text-center py-4 px-4 text-text-secondary font-semibold">Warranty</th>
                                        <th className="text-center py-4 px-4 text-text-secondary font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {cartItems.map((item) => (
                                        <tr key={item.sku} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                                            <td className="py-6 px-4">
                                                <div className="font-semibold text-text-primary">{item.sku}</div>
                                            </td>
                                            <td className="py-6 px-4">
                                                <div className="font-semibold text-text-primary">{item.name}</div>
                                            </td>
                                            <td className="text-center py-6 px-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg flex items-center justify-center hover:shadow-md transition-all duration-200 hover:scale-105"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newQuantity = parseInt(e.target.value) || 1;
                                                            updateItemQuantity(item.id, newQuantity);
                                                        }}
                                                        className="w-16 text-center bg-surface border border-border rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                    <button
                                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg flex items-center justify-center hover:shadow-md transition-all duration-200 hover:scale-105"
                                                    >
                                                        +
                                                    </button>
                                                    {pendingQuantityUpdates[item.id] && (item.productIdentifierType === 'serial' || item.productIdentifierType === 'imei') && (
                                                        <button
                                                            onClick={() => confirmQuantityUpdate(item.id)}
                                                            className="w-8 h-8 bg-gradient-to-r from-primary to-secondary text-white rounded-lg flex items-center justify-center hover:shadow-md transition-all duration-200 hover:scale-105"
                                                            title="Confirm quantity update"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="text-right py-6 px-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={editingPrices[item.sku] !== undefined ? editingPrices[item.sku] : item.price}
                                                    onChange={e => {
                                                        const newPrice = parseFloat(e.target.value) || 0;
                                                        handlePriceChange(item, newPrice);
                                                    }}
                                                    className="text-right bg-surface border border-border rounded-lg px-3 py-2 w-24 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                    min="0.01"
                                                />
                                            </td>
                                            <td className="text-right py-6 px-4 font-semibold text-text-primary">Rs {item.total.toFixed(2)}</td>
                                            {/* Warranty input for productIdentifierType none and warranty true */}
                                            <td className="text-center py-6 px-4">
                                                {item.productIdentifierType === 'none' && item.warranty && (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={item.warrantyValue || ''}
                                                        onChange={e => {
                                                            const value = e.target.value;
                                                            setCartItems(prev => prev.map(ci => ci.id === item.id ? { ...ci, warrantyValue: value } : ci));
                                                        }}
                                                        className="w-24 px-2 py-1 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                                        placeholder="Days"
                                                    />
                                                )}
                                            </td>
                                            <td className="text-center py-6 px-4">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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
                                <div className="bg-white rounded-2xl shadow-xl p-8 border border-border/50">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-text-primary">Supplier Information</h2>
                                    </div>

                                    {/* Supplier Type Selection */}
                                    <div className="mb-6 flex items-center space-x-8">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="supplierType"
                                                value="new"
                                                checked={supplierType === "new"}
                                                onChange={() => { setSupplierType("new"); setSelectedSupplierId(""); setFormData(prev => ({ ...prev, name: "", email: "", phone: "", company: "", website: "", supplierNotes: "" })); }}
                                                className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                            />
                                            <span className="text-text-primary font-medium">New Supplier</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="supplierType"
                                                value="existing"
                                                checked={supplierType === "existing"}
                                                onChange={() => setSupplierType("existing")}
                                                className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                            />
                                            <span className="text-text-primary font-medium">Existing Supplier</span>
                                        </label>
                                    </div>
                                    
                                    {/* Existing Supplier Dropdown */}
                                    {supplierType === "existing" && (
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Select Supplier</label>
                                            {loadingSuppliers ? (
                                                <div className="text-text-secondary">Loading suppliers...</div>
                                            ) : (
                                                <select
                                                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
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
                                    
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                required
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                required
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Company</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Website</label>
                                            <input
                                                type="text"
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-text-primary">Notes</label>
                                            <input
                                                type="text"
                                                name="supplierNotes"
                                                value={formData.supplierNotes}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                disabled={supplierType === "existing"}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-primary text-sm font-medium">
                                        ✓ Supplier information will be saved when you complete the purchase
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 border border-border/50">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-text-primary">Payment Information</h2>
                                    </div>
                                    
                                    {/* Payment Method Selection */}
                                    <div className="mb-6 flex items-center space-x-8">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="Cash"
                                                checked={paymentMethod === "Cash"}
                                                onChange={() => setPaymentMethod("Cash")}
                                                className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                            />
                                            <span className="text-text-primary font-medium">Cash</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="SupplierAcc"
                                                checked={paymentMethod === "SupplierAcc"}
                                                onChange={() => setPaymentMethod("SupplierAcc")}
                                                className="mr-3 h-5 w-5 text-primary bg-surface border-border rounded focus:ring-primary"
                                            />
                                            <span className="text-text-primary font-medium">Supplier Account</span>
                                        </label>
                                    </div>
                                    
                                    {paymentMethod === "Cash" && (
                                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            You have selected to pay by cash
                                        </div>
                                    )}
                                    {paymentMethod === "SupplierAcc" && (
                                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Credit to Supplier Account
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8 border border-border/50">
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold text-text-primary">Order Summary</h2>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center py-3 border-b border-border/30">
                                            <span className="text-text-secondary font-medium">Subtotal</span>
                                            <span className="text-text-primary font-semibold">Rs {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3">
                                            <span className="text-text-primary text-lg font-bold">Total</span>
                                            <span className="text-text-primary text-2xl font-bold">Rs {grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    {paymentMethod === "Cash" && (
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Pay by Cash
                                        </button>
                                    )}
                                    {paymentMethod === "SupplierAcc" && (
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                            Debit to Supplier Account
                                        </button>
                                    )}

                                    <div className="mt-6 text-xs text-text-secondary text-center">
                                        <p>Your payment information is secure and encrypted.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                    {cardModalOpen && <CardModal />}

                    {/* Add Product Modal */}
                    {addProductModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-border/50">
                                <button
                                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors"
                                    onClick={() => setAddProductModalOpen(false)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-primary">Add New Product</h2>
                                </div>
                                <form onSubmit={handleCreateNewProduct} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">Product Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newProductForm.name}
                                            onChange={handleNewProductFormChange}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">Cost Price *</label>
                                        <input
                                            type="number"
                                            name="costPrice"
                                            value={newProductForm.costPrice}
                                            onChange={handleNewProductFormChange}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                            required
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">SKU</label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={newProductForm.sku}
                                            onChange={handleNewProductFormChange}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">Category</label>
                                        <select
                                            name="category"
                                            value={newProductForm.category}
                                            onChange={handleNewProductFormChange}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
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
                                        <label className="block text-sm font-semibold mb-2 text-text-primary">Description</label>
                                        <textarea
                                            name="description"
                                            value={newProductForm.description}
                                            onChange={handleNewProductFormChange}
                                            className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                            rows={3}
                                        />
                                    </div>
                                    {newProductError && (
                                        <div className="px-4 py-3 bg-red-100 text-red-800 rounded-lg text-sm">
                                            {newProductError}
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                                        disabled={newProductLoading}
                                    >
                                        {newProductLoading ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Product & Add to Cart
                                            </div>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* View All Products Modal */}
                    {viewProductsModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl relative border border-border/50 max-h-[90vh] overflow-hidden">
                                <button
                                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors z-10"
                                    onClick={() => setViewProductsModalOpen(false)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                <div className="flex items-center mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-primary">All Products</h2>
                                </div>
                                
                                <div className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search products by name..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            className="w-full px-4 py-3 pl-12 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                        />
                                        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="overflow-y-auto max-h-[60vh] pr-2">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-surface to-white border-b border-border/30 sticky top-0">
                                            <tr>
                                                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Name</th>
                                                <th className="py-4 px-4 text-left text-text-secondary font-semibold">SKU</th>
                                                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Category</th>
                                                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Cost Price</th>
                                                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Description</th>
                                                <th className="py-4 px-4 text-center text-text-secondary font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(product => (
                                                <tr key={product.sku} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                                                    <td className="py-4 px-4">
                                                        <div className="font-semibold text-text-primary">{product.name}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                            {product.sku}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-text-secondary">{product.category}</td>
                                                    <td className="py-4 px-4 font-semibold text-text-primary">Rs {product.costPrice}</td>
                                                    <td className="py-4 px-4 text-text-secondary text-sm max-w-xs truncate">{product.description}</td>
                                                    <td className="py-4 px-4 text-center">
                                                        <button
                                                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                                                            onClick={() => {
                                                                addProductToCart(product);
                                                                setViewProductsModalOpen(false);
                                                                toast.success(`${product.name} added to cart!`, "Product Added");
                                                            }}
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                                            </svg>
                                                            Add
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
                                        <p className="text-text-secondary">Try adjusting your search terms</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Identifier Modal */}
                    {identifierModalOpen && currentItem && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-border/50 max-h-[80vh] flex flex-col">
                                <button
                                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors"
                                    onClick={() => setIdentifierModalOpen(false)}
                                    aria-label="Close"
                                >
                                    &times;
                                </button>
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-text-primary">
                                        Enter {currentItem.productIdentifierType === 'serial' ? 'Serial Numbers' : 'IMEI Numbers'}
                                    </h2>
                                </div>
                                
                                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-4">
                                    <div className="text-sm text-text-primary">
                                        <div className="flex justify-between mb-1">
                                            <span>Total quantity needed:</span>
                                            <span className="font-semibold">{currentItem.newQuantity}</span>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <span>Previously entered:</span>
                                            <span className="font-semibold">{currentItem.existingIdentifiers?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Remaining:</span>
                                            <span className="font-semibold">{Math.max(0, currentItem.newQuantity - (currentItem.existingIdentifiers?.length || 0))}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    const formData = new FormData(e.target)
                                    const identifiers = Array.from({ length: currentItem.newQuantity }, (_, i) => ({
                                        index: i + 1,
                                        value: formData.get(`identifier-${i}`),
                                        warranty: currentItem.warranty ? formData.get(`warranty-${i}`) : undefined,
                                    }))
                                    handleIdentifiersSubmit(identifiers)
                                }} className="flex flex-col flex-grow">
                                    <div className="space-y-4 overflow-y-auto pr-2 max-h-[calc(80vh-280px)]">
                                        {Array.from({ length: currentItem.newQuantity }, (_, i) => {
                                            const existingIdentifier = currentItem.existingIdentifiers?.[i];
                                            return (
                                                <div key={i} className="bg-surface p-4 rounded-xl border border-border/50 flex flex-col md:flex-row md:items-center md:space-x-4">
                                                    <div className="flex-1">
                                                    <label className="block text-sm font-semibold mb-2 text-text-primary">
                                                        Product {i + 1} {currentItem.productIdentifierType === 'serial' ? 'Serial Number' : 'IMEI'}
                                                        {existingIdentifier && (
                                                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Already entered
                                                            </span>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={`identifier-${i}`}
                                                        defaultValue={existingIdentifier?.value || ''}
                                                        required
                                                        className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                        placeholder={`Enter ${currentItem.productIdentifierType === 'serial' ? 'serial number' : 'IMEI'} for product ${i + 1}`}
                                                    />
                                                    </div>
                                                    {currentItem.warranty && (
                                                        <div className="flex-1 mt-4 md:mt-0">
                                                            <label className="block text-sm font-semibold mb-2 text-text-primary">
                                                                Warranty (days)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name={`warranty-${i}`}
                                                                defaultValue={existingIdentifier?.warranty || ''}
                                                                min="0"
                                                                step="1"
                                                                className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary transition-all"
                                                                placeholder="Enter warranty in days"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-border/30">
                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Continue (Save Later)
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
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
                                    <h3 className="font-medium mb-2">Supplier Information</h3>
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
                                <button className="w-full bg-primary hover:bg-primaryDark text-white font-semibold py-2 px-4 rounded-md transition duration-200" onClick={handlePrintInvoice}>
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


const handleExport = () => {
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(purchases.map(purchase => ({
        'Purchase ID': purchase.purchaseId,
        'Customer Name': purchase.customerName,
        'Customer Email': purchase.customerEmail,
        'Date': new Date(purchase.createdAt).toLocaleDateString(),
        'Total': purchase.total,
        'Status': purchase.paymentStatus
    })));

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchases');

    // Save the file
    XLSX.writeFile(wb, 'purchases.xlsx');
};

    const [activeTab, setActiveTab] = useState('purchase');
    const [damagedItems, setDamagedItems] = useState([]);
    const [selectedDamaged, setSelectedDamaged] = useState([]);
    const [returnSupplier, setReturnSupplier] = useState("");
    const [damagedLoading, setDamagedLoading] = useState(false);
    const [damagedSupplierSelections, setDamagedSupplierSelections] = useState({}); // { [damagedItemKey]: { supplierId, supplierDetails } }
    const [processedReturns, setProcessedReturns] = useState([]);
    const [processedReturnsLoading, setProcessedReturnsLoading] = useState(false);

    // Fetch processed returns when the tab is active
    useEffect(() => {
        if (activeTab === 'processedReturns') {
            setProcessedReturnsLoading(true);
            fetch(`${backEndURL}/api/return-process/processes`)
                .then(res => res.json())
                .then(data => setProcessedReturns(Array.isArray(data) ? data : []))
                .catch(() => setProcessedReturns([]))
                .finally(() => setProcessedReturnsLoading(false));
        }
    }, [activeTab]);

    // Fetch damaged serial/IMEI items for the return tab
    useEffect(() => {
        if (activeTab !== 'damaged') return;
        async function fetchDamaged() {
            setDamagedLoading(true);
            try {
                const productsRes = await fetch(`${backEndURL}/api/products`);
                const allProducts = await productsRes.json();
                const serialProducts = allProducts.filter(p => p.productIdentifierType === 'serial');
                const imeiProducts = allProducts.filter(p => p.productIdentifierType === 'imei');
                let damaged = [];
                for (const p of serialProducts) {
                    const res = await fetch(`${backEndURL}/api/identifiers/serial/${p.sku}`);
                    const data = await res.json();
                    (data.identifiers || []).forEach(id => {
                        if (id.damaged) {
                            damaged.push({ ...id, type: 'serial', product: p });
                        }
                    });
                }
                for (const p of imeiProducts) {
                    const res = await fetch(`${backEndURL}/api/identifiers/imei/${p.sku}`);
                    const data = await res.json();
                    (data.identifiers || []).forEach(id => {
                        if (id.damaged) {
                            damaged.push({ ...id, type: 'imei', product: p });
                        }
                    });
                }
                // Filter out items that have already been returned (exist in processedReturns)
                const processedSet = new Set(
                    processedReturns.map(r => `${r.product?.sku || ''}__${r.serial || r.imei || ''}`)
                );
                damaged = damaged.filter(item => {
                    const key = `${item.product?.sku || ''}__${item.serial || item.imei || ''}`;
                    return !processedSet.has(key);
                });
                setDamagedItems(damaged);
            } catch {
                setDamagedItems([]);
            }
            setDamagedLoading(false);
        }
        fetchDamaged();
    }, [activeTab, processedReturns]);

    const handleReturnSubmit = () => {
        setShowReturnModal(true);
    };

    const handleConfirmReturn = async () => {
        setReturning(true);
        setReturnError("");
        setReturnSuccess("");
        try {
            // Prepare payload
            const payload = selectedDamaged.map(item => {
                const key = item.type + '-' + (item.serial || item.imei);
                const supplier = damagedSupplierSelections[key]?.supplierDetails;
                return {
                    type: item.type,
                    serial: item.serial,
                    imei: item.imei,
                    product: item.product,
                    supplier,
                };
            });
            const res = await fetch(`${backEndURL}/api/returns/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: payload })
            });
            if (!res.ok) throw new Error('Failed to process returns');
            setReturnSuccess('Return processed and supplier notified!');
            // Optimistically remove returned items from UI
            setDamagedItems(prev => prev.filter(item => !selectedDamaged.includes(item)));
            setSelectedDamaged([]);
            setDamagedSupplierSelections({});
            setShowReturnModal(false);
            toast.success('Return processed and supplier notified!');
        } catch (err) {
            setReturnError(err.message || 'Failed to process returns');
            toast.error('Failed to process returns');
        }
        setReturning(false);
};

    const renderCurrentView = () => {
        if (activeTab === 'damaged') return renderDamagedTab();
        switch (currentView) {
            case "create":
                return renderCreatePurchase();
            case "details":
                return renderPurchaseDetails();
            default:
                return renderPurchaseList();
        }
    }

    // Damaged/Return Tab UI
    const renderDamagedTab = () => (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/20">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                    <div className="mb-6 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                                <FaUndo className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                    Return/Damaged Products
                                </h1>
                                <p className="text-text-secondary mt-1">Manage and return damaged products to suppliers</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-border/50">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Damaged Items</h2>
                    {damagedLoading ? (
                        <div>Loading damaged items...</div>
                    ) : damagedItems.length === 0 ? (
                        <div className="text-center text-text-secondary py-8">No damaged serial/IMEI items found.</div>
                    ) : (
                        <form onSubmit={e => { e.preventDefault(); handleReturnSubmit(); }}>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Product</th>
                                            <th>SKU</th>
                                            <th>Type</th>
                                            <th>Serial/IMEI</th>
                                            <th>Damaged At</th>
                                            <th>Customer</th>
                                            <th>Supplier</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {damagedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-8 text-text-secondary">No damaged serial/IMEI items found.</td>
                                            </tr>
                                        ) : (
                                            damagedItems.map((item, idx) => {
                                                const key = item.type + '-' + (item.serial || item.imei);
                                                const supplierSelection = damagedSupplierSelections[key] || {};
                                                return (
                                                    <tr key={idx}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedDamaged.includes(item)}
                                                                onChange={e => {
                                                                    if (e.target.checked) {
                                                                        setSelectedDamaged(prev => [...prev, item]);
                                                                        fetchSupplierForDamaged(item);
                                                                    } else {
                                                                        setSelectedDamaged(prev => prev.filter(i => i !== item));
                                                                    }
                                                                }}
                                                            />
                                                        </td>
                                                        <td
                                                            style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                                            onClick={() => fetchSupplierForDamaged(item)}
                                                        >
                                                            {item.product?.name || '-'}
                                                        </td>
                                                        <td>{item.product?.sku || '-'}</td>
                                                        <td>{item.type}</td>
                                                        <td>{item.type === 'serial' ? item.serial : item.imei}</td>
                                                        <td>{item.damagedAt ? new Date(item.damagedAt).toLocaleString() : '-'}</td>
                                                        <td>{item.customer || '-'}</td>
                                                        <td>
                                                            {/* Supplier dropdown and details */}
                                                            <select
                                                                value={supplierSelection.supplierEmail || ''}
                                                                onChange={e => handleSupplierChange(key, e.target.value)}
                                                                className="px-4 py-2 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
                                                            >
                                                                <option value="">-- Select Supplier --</option>
                                                                {contactsSuppliers.map(supplier => (
                                                                    <option key={supplier.id} value={supplier.email}>{supplier.name} {supplier.company ? `(${supplier.company})` : ""} [{supplier.email}]</option>
                                                                ))}
                                                            </select>
                                                            {supplierSelection.supplierDetails && (
                                                                <div className="bg-green-50 p-2 rounded mt-2">
                                                                    <div><b>Name:</b> {supplierSelection.supplierDetails.contactId}</div>
                                                                    <div><b>Status:</b> {supplierSelection.supplierDetails.status}</div>
                                                                    <div><b>Total Amount:</b> {supplierSelection.supplierDetails.totalAmount}</div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-6 flex items-center gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    disabled={selectedDamaged.length === 0 || selectedDamaged.some(item => {
                                        const key = item.type + '-' + (item.serial || item.imei);
                                        return !damagedSupplierSelections[key]?.supplierEmail;
                                    })}
                                >
                                    Return Selected
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                {showReturnModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-border/50">
                            <button
                                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors"
                                onClick={() => setShowReturnModal(false)}
                                aria-label="Close"
                            >
                                &times;
                            </button>
                            <h2 className="text-2xl font-bold mb-4 text-primary">Confirm Return</h2>
                            <div className="mb-4">You are about to return the following items to their suppliers:</div>
                            <div className="overflow-x-auto mb-4">
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Serial/IMEI</th>
                                            <th>Supplier</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedDamaged.map((item, idx) => {
                                            const key = item.type + '-' + (item.serial || item.imei);
                                            const supplier = damagedSupplierSelections[key]?.supplierDetails;
                                            return (
                                                <tr key={idx}>
                                                    <td>{item.product?.name || '-'}</td>
                                                    <td>{item.serial || item.imei || '-'}</td>
                                                    <td>{supplier?.name || supplier?.contactId || '-'}</td>
                                                    <td>{supplier?.email || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {returnError && <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-2">{returnError}</div>}
                            {returnSuccess && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-2">{returnSuccess}</div>}
                            <div className="flex gap-4 mt-4">
                                <button
                                    className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl shadow hover:bg-gray-300"
                                    onClick={() => setShowReturnModal(false)}
                                    disabled={returning}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    onClick={handleConfirmReturn}
                                    disabled={returning}
                                >
                                    {returning ? 'Processing...' : 'Confirm Return'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Helper to fetch supplier details for a damaged item
    const fetchSupplierForDamaged = async (damagedItem) => {
        try {
            const purchasesRes = await fetch(`${backEndURL}/api/purchase`);
            const purchases = await purchasesRes.json();
            let foundPurchase = null;
            for (const purchase of purchases) {
                for (const item of purchase.items || []) {
                    if (item.sku === damagedItem.product?.sku && Array.isArray(item.identifiers)) {
                        if (damagedItem.type === 'serial') {
                            if (item.identifiers.some(id => id.value === damagedItem.serial || id.serial === damagedItem.serial)) {
                                foundPurchase = purchase;
                                break;
                            }
                        } else if (damagedItem.type === 'imei') {
                            if (item.identifiers.some(id => id.value === damagedItem.imei || id.imei === damagedItem.imei)) {
                                foundPurchase = purchase;
                                break;
                            }
                        }
                    }
                }
                if (foundPurchase) break;
            }
            console.log('Clicked Damaged Item:', damagedItem);
            console.log('Found Purchase:', foundPurchase);
            if (!foundPurchase) return;
            const customerEmail = foundPurchase.customerEmail;
            console.log('Customer Email:', customerEmail);
            // Fetch contacts and find supplier by email
            const contactsRes = await fetch(`${backEndURL}/api/contacts`);
            const allContacts = await contactsRes.json();
            const supplier = allContacts.find(c => c.categoryType === 'Supplier' && c.email === customerEmail);
            console.log('Found Supplier (Contact):', supplier);
            if (supplier) {
                setDamagedSupplierSelections(prev => ({
                    ...prev,
                    [damagedItem.type + '-' + (damagedItem.serial || damagedItem.imei)]: {
                        supplierId: supplier.id,
                        supplierEmail: supplier.email,
                        supplierDetails: supplier
                    }
                }));
            }
        } catch (err) {
            // ignore
        }
    };

    // Helper to handle supplier dropdown change per item
    const handleSupplierChange = (key, supplierEmail) => {
        const supplier = contactsSuppliers.find(s => s.email === supplierEmail);
        setDamagedSupplierSelections(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                supplierEmail,
                supplierDetails: supplier || prev[key]?.supplierDetails
            }
        }));
    };

    // For Return/Damaged tab: suppliers from contacts
    const [contactsSuppliers, setContactsSuppliers] = useState([]);

    // Fetch contacts (suppliers) when Return/Damaged tab is active
    useEffect(() => {
        if (activeTab === 'damaged') {
            fetch(`${backEndURL}/api/contacts`)
                .then(res => res.json())
                .then(data => {
                    setContactsSuppliers(Array.isArray(data) ? data.filter(s => s.categoryType === 'Supplier') : []);
                })
                .catch(() => setContactsSuppliers([]));
        }
    }, [activeTab]);

    // Modal and return state for Return/Damaged tab
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returning, setReturning] = useState(false);
    const [returnError, setReturnError] = useState("");
    const [returnSuccess, setReturnSuccess] = useState("");

    // Processed Returns Tab UI
    const renderProcessedReturnsTab = () => (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/20">
            <div className="container mx-auto px-6 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
                    <div className="mb-6 lg:mb-0">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                                <FaEye className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                                    Processed Returns
                                </h1>
                                <p className="text-text-secondary mt-1">All items that have been returned to suppliers</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-border/50">
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Processed Returns</h2>
                    {processedReturnsLoading ? (
                        <div>Loading processed returns...</div>
                    ) : processedReturns.length === 0 ? (
                        <div className="text-center text-text-secondary py-8">No processed returns found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Type</th>
                                        <th>Serial/IMEI</th>
                                        <th>Supplier</th>
                                        <th>Returned At</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedReturns.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.product?.name || '-'}</td>
                                            <td>{item.product?.sku || '-'}</td>
                                            <td>{item.type}</td>
                                            <td>{item.serial || item.imei || '-'}</td>
                                            <td>{item.supplier?.name || item.supplier?.contactId || '-'}</td>
                                            <td>{item.returnedAt ? new Date(item.returnedAt).toLocaleString() : '-'}</td>
                                            <td>{item.status || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

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
            <div className="flex gap-4 px-6 pt-6">
                <button
                    className={`px-6 py-3 rounded-t-xl font-semibold ${activeTab === 'purchase' ? 'bg-white text-primary shadow' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveTab('purchase')}
                >
                    Purchase
                </button>
                <button
                    className={`px-6 py-3 rounded-t-xl font-semibold ${activeTab === 'damaged' ? 'bg-white text-red-600 shadow' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveTab('damaged')}
                >
                    Return/Damaged
                </button>
                <button
                    className={`px-6 py-3 rounded-t-xl font-semibold ${activeTab === 'processedReturns' ? 'bg-white text-green-600 shadow' : 'bg-gray-200 text-gray-600'}`}
                    onClick={() => setActiveTab('processedReturns')}
                >
                    Processed Returns
                </button>
            </div>
            <div className="print-content">
                {activeTab === 'processedReturns' ? renderProcessedReturnsTab() : renderCurrentView()}
            </div>
            <toast.ToastContainer />
        </div>
    );
}
