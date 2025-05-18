"use client"

import { useState } from "react"
import {
  Plus,
  Search,
  Eye,
  FileText,
  X,
  Tag,
  DollarSign,
  MessageSquare,
  Check,
  Edit,
  Trash2,
} from "lucide-react"

export default function ProductManagement() {
  // State for active tab
  const [activeTab, setActiveTab] = useState("new")

  // State for products (mock data initially)
  const [products, setProducts] = useState([
    { id: 1, name: "Product A", price: 1000, description: "Description for Product A", category: "General" },
    { id: 2, name: "Product B", price: 2500, description: "Description for Product B", category: "Electronics" },
    { id: 3, name: "Product C", price: 750, description: "Description for Product C", category: "Office" },
    { id: 4, name: "Service X", price: 5000, description: "Description for Service X", category: "Services" },
    { id: 5, name: "Maintenance Plan", price: 1200, description: "Description for Maintenance Plan", category: "Services" },
  ])

  // State for new product
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    description: "",
    category: "General",
  })

  // State for activity logs
  const [activities, setActivities] = useState([
    { id: 1, time: "Just now", message: "Ready to create a new product...", user: "You" },
  ])

  // Product categories
  const productCategories = ["General", "Electronics", "Office", "Services", "Hardware", "Software"]

  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)

  // Add activity log
  const addActivity = (message) => {
    const newId = activities.length > 0 ? Math.max(...activities.map((activity) => activity.id)) + 1 : 1
    setActivities([{ id: newId, time: "Just now", message, user: "You" }, ...activities])
  }

  // Handle new product input changes
  const handleNewProductChange = (field, value) => {
    setNewProduct({
      ...newProduct,
      [field]: value,
    })
  }

  // Handle create product
  const handleCreateProduct = () => {
    if (!newProduct.name || newProduct.price <= 0) return
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1
    setProducts([{ ...newProduct, id: newId }, ...products])
    addActivity(`Created new product: ${newProduct.name}`)
    setNewProduct({
      name: "",
      price: 0,
      description: "",
      category: "General",
    })
  }

  // Handle edit product
  const handleEditProduct = (product) => {
    setEditProduct(product)
    setEditModalOpen(true)
  }

  // Handle save edited product
  const handleSaveEditProduct = () => {
    setProducts(
      products.map((p) => (p.id === editProduct.id ? editProduct : p))
    )
    addActivity(`Edited product: ${editProduct.name}`)
    setEditModalOpen(false)
    setEditProduct(null)
  }

  // Handle delete product
  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    addActivity(`Deleted product with ID: ${id}`)
  }

  // Handle edit product input changes
  const handleEditProductChange = (field, value) => {
    setEditProduct({
      ...editProduct,
      [field]: value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "new" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("new")}
            >
              New Product
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("all")}
            >
              View All Products
            </button>
          </div>

          {activeTab === "new" && (
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">New Product</h1>
            </div>
          )}

          {activeTab === "all" && (
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">All Products</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("new")}
                  className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm"
                >
                  <Plus size={16} className="mr-2" /> Create New
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      {activeTab === "new" ? (
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Product Form */}
            <div className="flex-1">
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold mb-4">Product Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => handleNewProductChange("name", e.target.value)}
                      placeholder="Enter product name"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Price *</label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.price}
                      onChange={(e) => handleNewProductChange("price", Number.parseFloat(e.target.value) || 0)}
                      placeholder="Enter price"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => handleNewProductChange("category", e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {productCategories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => handleNewProductChange("description", e.target.value)}
                      placeholder="Enter product description"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    onClick={() => setNewProduct({ name: "", price: 0, description: "", category: "General" })}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCreateProduct}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                    disabled={!newProduct.name || newProduct.price <= 0}
                  >
                    Create Product
                  </button>
                </div>
              </div>
            </div>
            {/* Right Column - Activity Panel */}
            <div className="w-full lg:w-80">
              <div className="bg-gray-800 rounded-lg p-4 sticky top-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MessageSquare size={18} className="mr-2" /> Activity
                </h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {activities.map((activity) => (
                    <div key={activity.id} className="border-l-2 border-gray-700 pl-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="text-gray-400">{activity.time}</span>
                      </div>
                      <p className="text-gray-300">{activity.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-6 px-4">
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <select className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Categories</option>
                  {productCategories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4 font-medium">{product.name}</td>
                      <td className="py-4">{product.category}</td>
                      <td className="py-4 text-right">Rs {product.price.toLocaleString()}</td>
                      <td className="py-4">{product.description}</td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          <button className="text-gray-400 hover:text-blue-400" title="View">
                            <Eye size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-green-400"
                            title="Edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-gray-400 hover:text-red-400"
                            title="Delete"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">Showing 1 to {products.length} of {products.length} entries</div>
              <div className="flex space-x-1">
                <button className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">Previous</button>
                <button className="px-3 py-1 bg-blue-600 rounded-md text-white">1</button>
                <button className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600">Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Edit Product</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => handleEditProductChange("name", e.target.value)}
                  placeholder="Enter product name"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="number"
                  min="0"
                  value={editProduct.price}
                  onChange={(e) => handleEditProductChange("price", Number.parseFloat(e.target.value) || 0)}
                  placeholder="Enter price"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editProduct.category}
                  onChange={(e) => handleEditProductChange("category", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {productCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) => handleEditProductChange("description", e.target.value)}
                  placeholder="Enter product description"
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                disabled={!editProduct.name || editProduct.price <= 0}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
