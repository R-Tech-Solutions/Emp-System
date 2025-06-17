"use client"

import { useState, useEffect } from "react"
import { Eye, FileDown, Printer, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { backEndURL } from "../Backendurl";

export default function InventoryManagement() {
    const [items, setItems] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        totalQuantity: "",
        costPrice: "",
        marginPrice: "",
        retailPrice: "",
        salesPrice: "",
    })
    const [inventory, setInventory] = useState([]);
    const [viewProductModal, setViewProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [inventoryDetails, setInventoryDetails] = useState(null);
    const [historySuppliers, setHistorySuppliers] = useState([]);
    const [showValuationModal, setShowValuationModal] = useState(false);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [selectedProductForTransactions, setSelectedProductForTransactions] = useState(null);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch(`${backEndURL}/api/products`)
                const data = await res.json()
                setItems(data)
            } catch (err) {
                // Optionally handle error
                setItems([])
            }
        }
        fetchProducts()
    }, [])

    useEffect(() => {
        async function fetchInventory() {
            try {
                const res = await fetch(`${backEndURL}/api/inventory`);
                const data = await res.json();
                setInventory(data);
            } catch (err) {
                setInventory([]);
            }
        }
        fetchInventory();
    }, []);

    const categories = ["All", ...Array.from(new Set(items.map(item => item.category || "Other")))]

    const filteredItems = items.filter((item) => {
        const matchesSearch =
            (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.category || "").toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getStatusColor = (status) => {
        switch (status) {
            case "In Stock":
                return "bg-green-900 text-green-300"
            case "Low Stock":
                return "bg-yellow-900 text-yellow-300"
            case "Out of Stock":
                return "bg-red-900 text-red-300"
            default:
                return "bg-gray-700 text-gray-300"
        }
    }

    const getStatus = (totalQuantity) => {
        if (totalQuantity === 0) return "Out of Stock"
        if (totalQuantity <= 5) return "Low Stock"
        return "In Stock"
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const totalQuantity = Number.parseInt(formData.totalQuantity)
        const costPrice = Number.parseFloat(formData.costPrice)
        const wholesalePrice = Number.parseFloat(formData.wholesalePrice)
        const retailPrice = Number.parseFloat(formData.retailPrice)
        const salesPrice = Number.parseFloat(formData.salesPrice)

        if (editingItem) {
            setItems(
                items.map((item) =>
                    item.id === editingItem.id
                        ? {
                            ...item,
                            ...formData,
                            totalQuantity,
                            costPrice,
                            wholesalePrice,
                            retailPrice,
                            salesPrice,
                            status: getStatus(totalQuantity),
                        }
                        : item,
                ),
            )
            setEditingItem(null)
        } else {
            const newItem = {
                id: Date.now(),
                ...formData,
                totalQuantity,
                costPrice,
                wholesalePrice,
                retailPrice,
                salesPrice,
                status: getStatus(totalQuantity),
            }
            setItems([...items, newItem])
        }

        setFormData({ name: "", category: "", totalQuantity: "", costPrice: "", wholesalePrice: "", retailPrice: "", salesPrice: "" })
        setShowAddForm(false)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            category: item.category,
            totalQuantity: item.totalQuantity.toString(),
            costPrice: item.costPrice.toString(),
            wholesalePrice: item.wholesalePrice.toString(),
            retailPrice: item.retailPrice.toString(),
            salesPrice: item.salesPrice.toString(),
        })
        setShowAddForm(true)
    }

    const handleDelete = (id) => {
        setItems(items.filter((item) => item.id !== id))
    }

    const resetForm = () => {
        setFormData({ name: "", category: "", totalQuantity: "", costPrice: "", wholesalePrice: "", retailPrice: "", salesPrice: "" })
        setEditingItem(null)
        setShowAddForm(false)
    }

    const totalItems = items.reduce((sum, item) => sum + item.totalQuantity, 0)
    const totalValue = items.reduce((sum, item) => sum + item.totalQuantity * item.retailPrice, 0)
    const lowStockItems = items.filter((item) => item.totalQuantity <= 5 && item.totalQuantity > 0).length
    const outOfStockItems = items.filter((item) => item.totalQuantity === 0).length

    // Fetch supplier details for each history entry
    const fetchSuppliersForHistory = async (history) => {
        if (!history || history.length === 0) return [];
        try {
            const res = await fetch(`${backEndURL}/api/contacts`);
            const contacts = await res.json();
            return history.map(h => ({
                ...h,
                supplier: contacts.find(c => c.email === h.supplierEmail) || null
            }));
        } catch {
            return history.map(h => ({ ...h, supplier: null }));
        }
    };

    // Fetch transaction history for a product
    const fetchTransactionHistory = async (productId) => {
        try {
            const res = await fetch(`${backEndURL}/api/inventory/${productId}/transactions`);
            const data = await res.json();
            setTransactionHistory(data.transactions || []);
            setSelectedProductForTransactions(productId);
            setShowTransactionHistory(true);
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            setTransactionHistory([]);
        }
    };

    // Handler for Eye icon click
    const handleViewProduct = async (product) => {
        setSelectedProduct(product);
        setViewProductModal(true);
        // Find inventory for this product
        const inv = inventory.find(i => (i.productId === product.sku || i.productId === product.id));
        setInventoryDetails(inv);
        if (inv && Array.isArray(inv.history)) {
            const historyWithSuppliers = await fetchSuppliersForHistory(inv.history);
            setHistorySuppliers(historyWithSuppliers);
        } else {
            setHistorySuppliers([]);
        }
    };

    // Calculate valuations for all products
    const calculateValuations = () => {
        return items.map(item => {
            const inv = inventory.find(i => (i.productId === item.sku || i.productId === item.id));
            const totalQuantity = inv ? inv.totalQuantity : 0;
            const costPrice = Number(item.costPrice || 0);
            const wholesalePrice = Number(item.marginPrice || 0);
            const retailPrice = Number(item.retailPrice || 0);
            const salesPrice = Number(item.salesPrice || 0);

            return {
                id: item.sku || item.id,
                name: item.name,
                totalQuantity,
                costValuation: totalQuantity * costPrice,
                wholesaleValuation: totalQuantity * wholesalePrice,
                retailValuation: totalQuantity * retailPrice,
                salesValuation: totalQuantity * salesPrice
            };
        });
    };

    // Calculate totals
    const calculateTotals = (valuations) => {
        return valuations.reduce((acc, curr) => ({
            totalCostValuation: acc.totalCostValuation + curr.costValuation,
            totalWholesaleValuation: acc.totalWholesaleValuation + curr.wholesaleValuation,
            totalRetailValuation: acc.totalRetailValuation + curr.retailValuation,
            totalSalesValuation: acc.totalSalesValuation + curr.salesValuation
        }), {
            totalCostValuation: 0,
            totalWholesaleValuation: 0,
            totalRetailValuation: 0,
            totalSalesValuation: 0
        });
    };

    // Export to Excel function
    const exportToExcel = () => {
        const valuations = calculateValuations();
        const totals = calculateTotals(valuations);
        
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet([
            ...valuations.map(v => ({
                'Product ID': v.id,
                'Product Name': v.name,
                'Quantity': v.totalQuantity,
                'Cost Valuation': `Rs ${v.costValuation.toFixed(2)}`,
                'Wholesale Valuation': `Rs ${v.wholesaleValuation.toFixed(2)}`,
                'Retail Valuation': `Rs ${v.retailValuation.toFixed(2)}`,
                'Sales Valuation': `Rs ${v.salesValuation.toFixed(2)}`
            })),
            {
                'Product ID': 'Total',
                'Product Name': '',
                'Quantity': '',
                'Cost Valuation': `Rs ${totals.totalCostValuation.toFixed(2)}`,
                'Wholesale Valuation': `Rs ${totals.totalWholesaleValuation.toFixed(2)}`,
                'Retail Valuation': `Rs ${totals.totalRetailValuation.toFixed(2)}`,
                'Sales Valuation': `Rs ${totals.totalSalesValuation.toFixed(2)}`
            }
        ]);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Stock Valuation");

        // Save file
        XLSX.writeFile(wb, "Stock_Valuation.xlsx");
    };

    // Export to PDF function
    const exportToPDF = () => {
        const doc = new jsPDF();
        const valuations = calculateValuations();
        const totals = calculateTotals(valuations);

        // Add title
        doc.setFontSize(20);
        doc.text("Stock Valuation Report", 14, 15);
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 25);

        // Add table using autoTable
        autoTable(doc, {
            startY: 35,
            head: [['Product ID', 'Product Name', 'Quantity', 'Cost Valuation', 'Wholesale Valuation', 'Retail Valuation', 'Sales Valuation']],
            body: [
                ...valuations.map(v => [
                    v.id,
                    v.name,
                    v.totalQuantity,
                    `Rs ${v.costValuation.toFixed(2)}`,
                    `Rs ${v.wholesaleValuation.toFixed(2)}`,
                    `Rs ${v.retailValuation.toFixed(2)}`,
                    `Rs ${v.salesValuation.toFixed(2)}`
                ]),
                ['Total', '', '', 
                    `Rs ${totals.totalCostValuation.toFixed(2)}`,
                    `Rs ${totals.totalWholesaleValuation.toFixed(2)}`,
                    `Rs ${totals.totalRetailValuation.toFixed(2)}`,
                    `Rs ${totals.totalSalesValuation.toFixed(2)}`
                ]
            ],
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 8 },
            margin: { top: 35 }
        });

        // Save the PDF
        doc.save("Stock_Valuation.pdf");
    };

    // Print function
    const printValuation = () => {
        const printWindow = window.open('', '_blank');
        const valuations = calculateValuations();
        const totals = calculateTotals(valuations);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Stock Valuation Report</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 20px;
                            color: #333;
                        }
                        h1 {
                            color: #2980b9;
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .date {
                            text-align: right;
                            margin-bottom: 20px;
                            color: #666;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #2980b9;
                            color: white;
                        }
                        tr:nth-child(even) {
                            background-color: #f2f2f2;
                        }
                        .total-row {
                            font-weight: bold;
                            background-color: #e8e8e8;
                        }
                        @media print {
                            body {
                                margin: 0;
                                padding: 20px;
                            }
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <h1>Stock Valuation Report</h1>
                    <div class="date">Generated on: ${new Date().toLocaleString()}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Product ID</th>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Cost Valuation</th>
                                <th>Wholesale Valuation</th>
                                <th>Retail Valuation</th>
                                <th>Sales Valuation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${valuations.map(v => `
                                <tr>
                                    <td>${v.id}</td>
                                    <td>${v.name}</td>
                                    <td>${v.totalQuantity}</td>
                                    <td>Rs ${v.costValuation.toFixed(2)}</td>
                                    <td>Rs ${v.wholesaleValuation.toFixed(2)}</td>
                                    <td>Rs ${v.retailValuation.toFixed(2)}</td>
                                    <td>Rs ${v.salesValuation.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td>Total</td>
                                <td></td>
                                <td></td>
                                <td>Rs ${totals.totalCostValuation.toFixed(2)}</td>
                                <td>Rs ${totals.totalWholesaleValuation.toFixed(2)}</td>
                                <td>Rs ${totals.totalRetailValuation.toFixed(2)}</td>
                                <td>Rs ${totals.totalSalesValuation.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="no-print">
                        <button onclick="window.print()">Print</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
                    <p className="text-gray-400 mt-1">Manage your inventory items efficiently</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Total Items</h3>
                        <p className="text-2xl font-bold text-white mt-2">{totalItems}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Total Value</h3>
                        <p className="text-2xl font-bold text-green-400 mt-2">${totalValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Low Stock</h3>
                        <p className="text-2xl font-bold text-yellow-400 mt-2">{lowStockItems}</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400">Out of Stock</h3>
                        <p className="text-2xl font-bold text-red-400 mt-2">{outOfStockItems}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setShowValuationModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            Stock Valuation
                        </button>
                    </div>
                </div>


                {/* Tables Section */}
                <div className=" gap-8">
                    {/* Products Table */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">Products ({filteredItems.length})</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Cost Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Wholesale Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Retail Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Sales Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            totalQuantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Total Value
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredItems.map((item) => {
                                        // Find the matching inventory item
                                        const inv = inventory.find(i => (i.productId === item.sku || i.productId === item.id));
                                        const totalQuantity = inv ? inv.totalQuantity : 0;
                                        const costPrice = Number(item.costPrice || 0);
                                        const totalValue = totalQuantity * costPrice;

                                        return (
                                            <tr key={item.sku || item.id} className="hover:bg-gray-700 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{item.sku}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {costPrice.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.marginPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.retailPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.salesPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{totalQuantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getStatus(totalQuantity))}`}>
                                                        {getStatus(totalQuantity)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    Rs {totalValue.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button onClick={() => handleViewProduct(item)} className="text-blue-400 hover:text-blue-200" title="View Details">
                                                        <Eye size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {filteredItems.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400 text-lg">No products found</p>
                                    <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Details Modal */}
            {viewProductModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-2xl relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                            onClick={() => setViewProductModal(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-white">Product Details</h2>
                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-sm">Name</div>
                                    <div className="text-white font-semibold">{selectedProduct.name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">SKU</div>
                                    <div className="text-white font-semibold">{selectedProduct.sku || selectedProduct.id}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Category</div>
                                    <div className="text-white font-semibold">{selectedProduct.category}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Cost Price</div>
                                    <div className="text-white font-semibold">Rs {selectedProduct.costPrice}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Retail Price</div>
                                    <div className="text-white font-semibold">Rs {selectedProduct.retailPrice}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Sales Price</div>
                                    <div className="text-white font-semibold">Rs {selectedProduct.salesPrice}</div>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mt-6 mb-2">Inventory Details</h3>
                        {inventoryDetails ? (
                            <div className="mb-4">
                                <div className="text-gray-400 text-sm">Total Quantity</div>
                                <div className="text-white font-semibold mb-2">{inventoryDetails.totalQuantity}</div>
                                
                                {/* Transaction History Button */}
                                <button
                                    onClick={() => fetchTransactionHistory(selectedProduct.sku || selectedProduct.id)}
                                    className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    📊 View Transaction History
                                </button>
                                
                                <div className="text-gray-400 text-sm mb-1">History</div>
                                <div className="max-h-48 overflow-y-auto">
                                    <table className="w-full text-sm text-gray-200">
                                        <thead>
                                            <tr>
                                                <th className="py-1 px-2 text-left">Date</th>
                                                <th className="py-1 px-2 text-left">Quantity</th>
                                                <th className="py-1 px-2 text-left">Supplier Email</th>
                                                <th className="py-1 px-2 text-left">Supplier Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historySuppliers.map((h, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-1 px-2">{new Date(h.date).toLocaleString()}</td>
                                                    <td className="py-1 px-2">{h.totalQuantity}</td>
                                                    <td className="py-1 px-2">{h.supplierEmail}</td>
                                                    <td className="py-1 px-2">{h.supplier ? h.supplier.name : <span className="text-gray-500">Not found</span>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-400">No inventory details found for this product.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Stock Valuation Modal */}
            {showValuationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-6xl relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                            onClick={() => setShowValuationModal(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Stock Valuation</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportToExcel}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <FileDown size={20} />
                                    Export to Excel
                                </button>
                                <button
                                    onClick={exportToPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <FileText size={20} />
                                    Export to PDF
                                </button>
                                <button
                                    onClick={printValuation}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <Printer size={20} />
                                    Print
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-gray-200">
                                <thead className="bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left">ProductsID</th>
                                        <th className="px-4 py-2 text-left">ProductsName</th>
                                        <th className="px-4 py-2 text-right">ProductsQuantity</th>
                                        <th className="px-4 py-2 text-right">CostValuation</th>
                                        <th className="px-4 py-2 text-right">WholesaleValuation</th>
                                        <th className="px-4 py-2 text-right">RetailValuation</th>
                                        <th className="px-4 py-2 text-right">SalesValuation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {calculateValuations().map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-800">
                                            <td className="px-4 py-2">{item.id}</td>
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2 text-right">{item.totalQuantity}</td>
                                            <td className="px-4 py-2 text-right">Rs {item.costValuation.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">Rs {item.wholesaleValuation.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">Rs {item.retailValuation.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">Rs {item.salesValuation.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-800 font-bold">
                                        <td className="px-4 py-2" colSpan="2">Total</td>
                                        <td className="px-4 py-2"></td>
                                        <td className="px-4 py-2 text-right">Rs {calculateTotals(calculateValuations()).totalCostValuation.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">Rs {calculateTotals(calculateValuations()).totalWholesaleValuation.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">Rs {calculateTotals(calculateValuations()).totalRetailValuation.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right">Rs {calculateTotals(calculateValuations()).totalSalesValuation.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Transaction History Modal */}
            {showTransactionHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-4xl relative">
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
                            onClick={() => setShowTransactionHistory(false)}
                            aria-label="Close"
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-white">Transaction History</h2>
                        <p className="text-gray-400 mb-4">Product ID: {selectedProductForTransactions}</p>
                        
                        {transactionHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-gray-200">
                                    <thead className="bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-right">Quantity</th>
                                            <th className="px-4 py-2 text-left">Description</th>
                                            <th className="px-4 py-2 text-left">Reference</th>
                                            <th className="px-4 py-2 text-left">Supplier Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {transactionHistory.map((transaction, index) => (
                                            <tr key={index} className="hover:bg-gray-800">
                                                <td className="px-4 py-2">
                                                    {new Date(transaction.date).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        transaction.type === 'purchase' 
                                                            ? 'bg-green-900 text-green-300' 
                                                            : 'bg-red-900 text-red-300'
                                                    }`}>
                                                        {transaction.type === 'purchase' ? '📥 Purchase' : '📤 Sale'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    <span className={transaction.type === 'purchase' ? 'text-green-400' : 'text-red-400'}>
                                                        {transaction.type === 'purchase' ? '+' : '-'}{transaction.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">{transaction.description}</td>
                                                <td className="px-4 py-2">
                                                    {transaction.reference ? (
                                                        <span className="text-blue-400">
                                                            {transaction.type === 'sale' ? `Invoice: ${transaction.reference}` : `Purchase: ${transaction.reference}`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {transaction.supplierEmail || <span className="text-gray-500">-</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-400 text-lg">No transaction history found</p>
                                <p className="text-gray-500 text-sm mt-2">This product has no inventory transactions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
