"use client"

import { useState } from "react"

const ProductProposalManager = () => {
  // State management
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState([])
  const [productName, setProductName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Handle form submission for adding products
  const handleAddProduct = (e) => {
    e.preventDefault()

    if (!productName || !price) return

    const newProduct = {
      id: Date.now(),
      name: productName,
      description,
      price: Number.parseFloat(price),
    }

    setProducts([...products, newProduct])
    setProductName("")
    setDescription("")
    setPrice("")
  }

  // Handle product selection for proposals
  const handleProductSelection = (productId) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId)
      } else {
        return [...prev, productId]
      }
    })
  }

  // Create proposal
  const handleCreateProposal = () => {
    if (selectedProductIds.length === 0) return
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 3000)
  }

  // Get selected products
  const selectedProducts = products.filter((product) => selectedProductIds.includes(product.id))

  // Calculate total price of selected products
  const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0)

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "products" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "proposals" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("proposals")}
        >
          Proposals
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

          {/* Product Form */}
          <form onSubmit={handleAddProduct} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)*</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
            >
              Add Product
            </button>
          </form>

          {/* Product List */}
          <h2 className="text-xl font-semibold mb-4">Product List</h2>

          {products.length === 0 ? (
            <p className="text-gray-500">No products added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-700 hidden md:table-cell">
                      Description
                    </th>
                    <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="py-3 px-4 text-sm">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 hidden md:table-cell">{product.description}</td>
                      <td className="py-3 px-4 text-sm text-right">${product.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Card View (visible on small screens) */}
          <div className="md:hidden mt-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                <div className="text-sm font-medium text-right mt-2">${product.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proposals Tab */}
      {activeTab === "proposals" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>

          {products.length === 0 ? (
            <p className="text-gray-500 mb-4">No products available. Please add products in the Products tab.</p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Select Products</h3>
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`product-${product.id}`}
                        checked={selectedProductIds.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`product-${product.id}`} className="ml-2 block text-sm text-gray-900">
                        {product.name} - ${product.price.toFixed(2)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedProductIds.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-medium mb-3">Proposal Summary</h3>
                  <ul className="space-y-2 mb-4">
                    {selectedProducts.map((product) => (
                      <li key={product.id} className="flex justify-between">
                        <span>{product.name}</span>
                        <span>${product.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateProposal}
                disabled={selectedProductIds.length === 0}
                className={`py-2 px-4 rounded-md transition-colors ${
                  selectedProductIds.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Create Proposal
              </button>

              {/* Confirmation Message */}
              {showConfirmation && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
                  Proposal created successfully with {selectedProducts.length} product(s)!
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductProposalManager
