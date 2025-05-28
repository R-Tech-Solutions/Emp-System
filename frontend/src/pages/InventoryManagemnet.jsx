"use client"

import { useState, useEffect } from "react"

export default function InventoryManagement() {
    const [items, setItems] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        quantity: "",
        costPrice: "",
        marginPrice: "",
        retailPrice: "",
        salesPrice: "",
    })
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch("http://localhost:3001/api/products")
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
                const res = await fetch("http://localhost:3001/api/inventory");
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

    const getStatus = (quantity) => {
        if (quantity === 0) return "Out of Stock"
        if (quantity <= 5) return "Low Stock"
        return "In Stock"
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const quantity = Number.parseInt(formData.quantity)
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
                            quantity,
                            costPrice,
                            wholesalePrice,
                            retailPrice,
                            salesPrice,
                            status: getStatus(quantity),
                        }
                        : item,
                ),
            )
            setEditingItem(null)
        } else {
            const newItem = {
                id: Date.now(),
                ...formData,
                quantity,
                costPrice,
                wholesalePrice,
                retailPrice,
                salesPrice,
                status: getStatus(quantity),
            }
            setItems([...items, newItem])
        }

        setFormData({ name: "", category: "", quantity: "", costPrice: "", wholesalePrice: "", retailPrice: "", salesPrice: "" })
        setShowAddForm(false)
    }

    const handleEdit = (item) => {
        setEditingItem(item)
        setFormData({
            name: item.name,
            category: item.category,
            quantity: item.quantity.toString(),
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
        setFormData({ name: "", category: "", quantity: "", costPrice: "", wholesalePrice: "", retailPrice: "", salesPrice: "" })
        setEditingItem(null)
        setShowAddForm(false)
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = items.reduce((sum, item) => sum + item.quantity * item.retailPrice, 0)
    const lowStockItems = items.filter((item) => item.quantity <= 5 && item.quantity > 0).length
    const outOfStockItems = items.filter((item) => item.quantity === 0).length

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
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                        >
                            Add Item
                        </button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showAddForm && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4">{editingItem ? "Edit Item" : "Add New Item"}</h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Item name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Select category</option>
                                {categories.slice(1).map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Quantity"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                min="0"
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder="Cost Price"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder="Wholesale Price"
                                value={formData.wholesalePrice}
                                onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder="Retail Price"
                                value={formData.retailPrice}
                                onChange={(e) => setFormData({ ...formData, retailPrice: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="number"
                                placeholder="Sales Price"
                                value={formData.salesPrice}
                                onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="md:col-span-2 lg:col-span-4 flex gap-2">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    {editingItem ? "Update Item" : "Add Item"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Total Value
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {filteredItems.map((item) => {
                                        // Find the matching inventory item
                                        const inv = inventory.find(i => (i.productId === item.sku || i.productId === item.id));
                                        const quantity = inv ? inv.quantity : 0;
                                        const costPrice = Number(item.costPrice || 0);
                                        const totalValue = quantity * costPrice;

                                        return (
                                            <tr key={item.sku || item.id} className="hover:bg-gray-700 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{item.sku}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {costPrice.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.marginPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.retailPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rs {Number(item.salesPrice || 0).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getStatus(quantity))}`}>
                                                        {getStatus(quantity)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                    Rs {totalValue.toFixed(2)}
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
        </div>
    )
}
