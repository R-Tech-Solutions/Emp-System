import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, X, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { backEndURL } from "../Backendurl";

export default function ProductManagement() {
  // State management
  const [activeTab, setActiveTab] = useState("new");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Product form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    salesPrice: 0,
    costPrice: 0,
    sku: "",
    category: "General",
    reference: "",
    internalNotes: "",
    productType: "Goods",
    image: null,
    barcode: "",
    toWeighWithScale: false,
  });

  // Modal and edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Activity logs
  const [activities, setActivities] = useState([
    { id: 1, time: "Just now", message: "Ready to create a new product...", user: "You" },
  ]);

  // Constants
  const productCategories = ["General", "Electronics", "Office", "Services", "Hardware", "Software"];
  const productTypes = ["Goods", "Service"];

  // Utility functions
  const addActivity = (message) => {
    const newId = activities.length > 0 ? Math.max(...activities.map((activity) => activity.id)) + 1 : 1;
    setActivities([{ id: newId, time: "Just now", message, user: "You" }, ...activities.slice(0, 9)]);
  };

  const validateForm = (product) => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (product.salesPrice <= 0) newErrors.salesPrice = "Sales price must be greater than 0";
    // Barcode required if Goods
    if (product.productType === "Goods" && !product.barcode.trim()) newErrors.barcode = "Barcode is required for Goods";
    return newErrors;
  };

  // Data fetching
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${backEndURL}/api/products`);
      setProducts(res.data);
      addActivity("Products fetched successfully");
    } catch (err) {
      addActivity("Failed to fetch products from server");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Sorting handler
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Form handlers
  const handleNewProductChange = (field, value) => {
    setNewProduct({
      ...newProduct,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleImageChange = (e) => {
    setNewProduct({
      ...newProduct,
      image: e.target.files[0],
    });
  };

  const handleEditProductChange = (field, value) => {
    setEditProduct({
      ...editProduct,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleEditImageChange = (e) => {
    setEditProduct({
      ...editProduct,
      image: e.target.files[0],
    });
  };

  // CRUD operations
  const handleCreateProduct = async () => {
    const validationErrors = validateForm(newProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(newProduct).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await axios.post(`${backEndURL}/api/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProducts([res.data, ...products]);
      addActivity(`Created new product: ${newProduct.name}`);

      // Reset form
      setNewProduct({
        name: "",
        description: "",
        salesPrice: 0,
        costPrice: 0,
        sku: "",
        category: "General",
        reference: "",
        internalNotes: "",
        productType: "Goods",
        image: null,
        barcode: "",
        toWeighWithScale: false,
      });
      setErrors({});
    } catch (err) {
      addActivity("Failed to create product");
      console.error("Error creating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditProduct({ ...product });
    setEditModalOpen(true);
    setErrors({});
  };

  const handleSaveEditProduct = async () => {
    const validationErrors = validateForm(editProduct);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(editProduct).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      const res = await axios.put(`${backEndURL}/api/products/${editProduct.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setProducts(products.map((p) => (p.id === editProduct.id ? res.data : p)));
      addActivity(`Edited product: ${editProduct.name}`);
      setEditModalOpen(false);
      setEditProduct(null);
    } catch (err) {
      addActivity("Failed to update product");
      console.error("Error updating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setIsLoading(true);
    try {
      await axios.delete(`${backEndURL}/api/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      addActivity(`Deleted product with ID: ${id}`);
    } catch (err) {
      addActivity("Failed to delete product");
      console.error("Error deleting product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Render helpers
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 rounded-lg p-6 mb-6 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "new" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"}`}
              onClick={() => setActiveTab("new")}
            >
              New Product
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "all" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-gray-300"}`}
              onClick={() => setActiveTab("all")}
            >
              View All Products
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {activeTab === "new" ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="flex items-center">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                      {newProduct.image ? (
                        <img
                          src={URL.createObjectURL(newProduct.image)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <label className="ml-4 cursor-pointer">
                      <div className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                        {newProduct.image ? "Change" : "Upload"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Type</label>
                      <select
                        value={newProduct.productType}
                        onChange={(e) => handleNewProductChange("productType", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {/* Barcode and Scale fields for Goods */}
                    {newProduct.productType === "Goods" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="toWeighWithScale"
                            checked={!!newProduct.toWeighWithScale}
                            onChange={e => handleNewProductChange("toWeighWithScale", e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="toWeighWithScale" className="text-sm font-medium">
                            To Weigh With Scale?
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Barcode <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={newProduct.barcode}
                            onChange={e => handleNewProductChange("barcode", e.target.value)}
                            className={`w-full bg-gray-700 border ${errors.barcode ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.barcode && <p className="mt-1 text-sm text-red-400">{errors.barcode}</p>}
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Product Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => handleNewProductChange("name", e.target.value)}
                        className={`w-full bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => handleNewProductChange("description", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sales Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.salesPrice}
                          onChange={(e) => handleNewProductChange("salesPrice", parseFloat(e.target.value) || 0)}
                          className={`w-full bg-gray-700 border ${errors.salesPrice ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-1 text-sm text-red-400">{errors.salesPrice}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cost Price</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.costPrice}
                          onChange={(e) => handleNewProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Inventory</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={(e) => handleNewProductChange("sku", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={(e) => handleNewProductChange("category", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {productCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference</label>
                      <input
                        type="text"
                        value={newProduct.reference}
                        onChange={(e) => handleNewProductChange("reference", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Internal Notes</label>
                      <textarea
                        value={newProduct.internalNotes}
                        onChange={(e) => handleNewProductChange("internalNotes", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setNewProduct({
                    name: "",
                    description: "",
                    salesPrice: 0,
                    costPrice: 0,
                    sku: "",
                    category: "General",
                    reference: "",
                    internalNotes: "",
                    productType: "Goods",
                    image: null,
                    barcode: "",
                    toWeighWithScale: false,
                  });
                  setErrors({});
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Clear
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={isLoading || !newProduct.name || newProduct.salesPrice <= 0}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md ${(isLoading || !newProduct.name || newProduct.salesPrice <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {renderSortIcon('category')}
                      </div>
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('salesPrice')}
                    >
                      <div className="flex items-center">
                        Sales Price
                        {renderSortIcon('salesPrice')}
                      </div>
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('costPrice')}
                    >
                      <div className="flex items-center">
                        Cost Price
                        {renderSortIcon('costPrice')}
                      </div>
                    </th>
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('sku')}
                    >
                      <div className="flex items-center">
                        SKU
                        {renderSortIcon('sku')}
                      </div>
                    </th>
                    <th className="pb-3 font-medium">Barcode</th>
                    <th className="pb-3 font-medium">Weigh With Scale?</th>
                    <th className="pb-3 font-medium">Image</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-4 font-medium">
                          <div>{product.name}</div>
                          <div className="text-sm text-gray-400">{product.description}</div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-gray-700 rounded-full text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4">Rs {typeof product.salesPrice === 'number' ? product.salesPrice.toLocaleString() : '0'}</td>
                        <td className="py-4">Rs {typeof product.costPrice === 'number' ? product.costPrice.toLocaleString() : '0'}</td>
                        <td className="py-4">{product.sku || '-'}</td>
                        <td className="py-4">{product.barcode || '-'}</td>
                        <td className="py-4">
                          {product.productType === "Goods"
                            ? (product.toWeighWithScale ? "Yes" : "No")
                            : "-"}
                        </td>
                        <td className="py-4">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-400 hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400">
                Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} entries
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {editModalOpen && editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Edit Product</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="flex items-center">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-700 flex items-center justify-center">
                      {editProduct.image ? (
                        typeof editProduct.image === 'string' ? (
                          <img
                            src={editProduct.image}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(editProduct.image)}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        )
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                    <label className="ml-4 cursor-pointer">
                      <div className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                        {editProduct.image ? "Change" : "Upload"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Product Type</label>
                      <select
                        value={editProduct.productType}
                        onChange={(e) => handleEditProductChange("productType", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {/* Barcode and Scale fields for Goods */}
                    {editProduct.productType === "Goods" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="editToWeighWithScale"
                            checked={!!editProduct.toWeighWithScale}
                            onChange={e => handleEditProductChange("toWeighWithScale", e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <label htmlFor="editToWeighWithScale" className="text-sm font-medium">
                            To Weigh With Scale?
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Barcode <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={editProduct.barcode}
                            onChange={e => handleEditProductChange("barcode", e.target.value)}
                            className={`w-full bg-gray-700 border ${errors.barcode ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.barcode && <p className="mt-1 text-sm text-red-400">{errors.barcode}</p>}
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Product Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) => handleEditProductChange("name", e.target.value)}
                        className={`w-full bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={editProduct.description}
                        onChange={(e) => handleEditProductChange("description", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sales Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.salesPrice}
                          onChange={(e) => handleEditProductChange("salesPrice", parseFloat(e.target.value) || 0)}
                          className={`w-full bg-gray-700 border ${errors.salesPrice ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-1 text-sm text-red-400">{errors.salesPrice}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Cost Price</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.costPrice}
                          onChange={(e) => handleEditProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Inventory</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">SKU</label>
                      <input
                        type="text"
                        value={editProduct.sku}
                        onChange={(e) => handleEditProductChange("sku", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={editProduct.category}
                        onChange={(e) => handleEditProductChange("category", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {productCategories.map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Reference</label>
                      <input
                        type="text"
                        value={editProduct.reference}
                        onChange={(e) => handleEditProductChange("reference", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Internal Notes</label>
                      <textarea
                        value={editProduct.internalNotes}
                        onChange={(e) => handleEditProductChange("internalNotes", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                disabled={isLoading || !editProduct.name || editProduct.salesPrice <= 0}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md ${(isLoading || !editProduct.name || editProduct.salesPrice <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}