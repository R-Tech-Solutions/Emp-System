import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, X, Edit, Trash2, ChevronDown, ChevronUp, Eye, Download, Upload } from "lucide-react";
import { backEndURL } from "../Backendurl";
import { hasPermission } from '../utils/auth';
import * as XLSX from 'xlsx';

export default function ProductManagement() {
  // State management
  const [activeTab, setActiveTab] = useState("new");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    salesPrice: 0,
    salesPricePercent: 0,
    costPrice: 0,
    sku: "",
    category: "General",
    reference: "",
    internalNotes: "",
    productType: "Goods",
    image: null,
    barcode: "",
    toWeighWithScale: false,
    marginPrice: 0,
    marginPricePercent: 0,
    retailPrice: 0,
    retailPricePercent: 0,
    productIdentifierType: "none",
  });

  // Modal and edit states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // New states for import/export
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Activity logs
  const [activities, setActivities] = useState([
    { id: 1, time: "Just now", message: "Ready to create a new product...", user: "You" },
  ]);

  // Constants
  const productCategories = ["General", "Electronics", "Office", "Services", "Hardware", "Software"];
  const productTypes = ["Goods", "Service"];

  // New state for identifiers modal
  const [identifiersModalOpen, setIdentifiersModalOpen] = useState(false);
  const [selectedProductIdentifiers, setSelectedProductIdentifiers] = useState(null);
  const [isLoadingIdentifiers, setIsLoadingIdentifiers] = useState(false);

  // Helper to calculate margin percentage
  const getMarginPercent = (price, cost) => {
    if (!cost || cost === 0) return 0;
    return (((price - cost) / price) * 100).toFixed(2);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Helper to sync price and percent for all price types
  const syncPricePercent = (type, value, isPercent) => {
    setNewProduct(prev => {
      const cost = parseFloat(prev.costPrice) || 0;
      let price, percent;

      if (isPercent) {
        // When percentage is changed
        percent = value;
        // Calculate price based on margin (selling price)
        if (type === 'marginPrice' || type === 'salesPrice' || type === 'retailPrice') {
          price = cost / (1 - percent / 100);
        } else {
          // Calculate price based on markup (cost price)
          price = cost * (1 + percent / 100);
        }
      } else {
        price = value;
        // Calculate margin percentage (on selling price)
        if (type === 'marginPrice' || type === 'salesPrice' || type === 'retailPrice') {
          percent = ((price - cost) / price) * 100;
        } else {
          percent = ((price - cost) / cost) * 100;
        }
      }
      return {
        ...prev,
        [type]: Math.floor(price), // Round DOWN to nearest whole number
        [`${type}Percent`]: parseFloat(percent.toFixed(2)), // Keep percentage as float with 2 decimals
      };
    });
  };

  function syncEditPricePercent(field, value, isPercent) {
    setEditProduct(prev => {
      let updated = { ...prev };
      const cost = parseFloat(prev.costPrice) || 0;
      let price, percent;

      if (isPercent) {
        percent = value;
        // Calculate price using margin formula for all price types
        price = cost > 0 && percent < 100 ? cost / (1 - percent / 100) : 0;
      } else {
        price = value;
        // Calculate margin percent for all price types
        percent = cost > 0 && price > 0 ? ((price - cost) / price) * 100 : 0;
      }

      if (field === 'marginPrice') {
        updated.marginPrice = Math.floor(price);
        updated.marginPricePercent = parseFloat(percent.toFixed(2));
      } else if (field === 'retailPrice') {
        updated.retailPrice = Math.floor(price);
        updated.retailPricePercent = parseFloat(percent.toFixed(2));
      } else if (field === 'salesPrice') {
        updated.salesPrice = Math.floor(price);
        updated.salesPricePercent = parseFloat(percent.toFixed(2));
      }
      return updated;
    });
  }
  const handleNewProductChange = (field, value) => {
    if (field === "marginPrice") {
      setNewProduct(prev => ({
        ...prev,
        marginPrice: value,
        marginPricePercent: prev.costPrice ? (((value - prev.costPrice) / value) * 100).toFixed(2) : 0
      }));
      return;
    }
    if (field === "marginPricePercent") {
      setNewProduct(prev => ({
        ...prev,
        marginPricePercent: value,
        marginPrice: prev.costPrice ? (prev.costPrice / (1 - value / 100)).toFixed(2) : 0
      }));
      return;
    }
    if (field === "retailPrice") {
      setNewProduct(prev => ({
        ...prev,
        retailPrice: value,
        retailPricePercent: prev.costPrice ? (((value - prev.costPrice) / value) * 100).toFixed(2) : 0
      }));
      return;
    }
    if (field === "retailPricePercent") {
      setNewProduct(prev => ({
        ...prev,
        retailPricePercent: value,
        retailPrice: prev.costPrice ? (parseFloat(prev.costPrice) + (parseFloat(prev.costPrice) * value / 100)).toFixed(2) : 0
      }));
      return;
    }
    if (field === "salesPrice") {
      setNewProduct(prev => ({
        ...prev,
        salesPrice: value,
        salesPricePercent: prev.costPrice ? (((value - prev.costPrice) / value) * 100).toFixed(2) : 0
      }));
      return;
    }
    if (field === "salesPricePercent") {
      setNewProduct(prev => ({
        ...prev,
        salesPricePercent: value,
        salesPrice: prev.costPrice ? (parseFloat(prev.costPrice) + (parseFloat(prev.costPrice) * value / 100)).toFixed(2) : 0
      }));
      return;
    }
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
      // Add all fields to formData for backend
      Object.entries(newProduct).forEach(([key, value]) => {
        // Only append if not null/undefined
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      // Send to backend
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
        salesPricePercent: 0,
        costPrice: 0,
        sku: "",
        category: "General",
        reference: "",
        internalNotes: "",
        productType: "Goods",
        image: null,
        barcode: "",
        toWeighWithScale: false,
        marginPrice: 0,
        marginPricePercent: 0,
        retailPrice: 0,
        retailPricePercent: 0,
        productIdentifierType: "none",
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

  const handleExport = () => {
    addActivity("Generating product export...");
    const headers = [
      "name", "description", "salesPrice", "costPrice", "sku", "category",
      "reference", "internalNotes", "productType", "barcode", "toWeighWithScale",
      "marginPrice", "retailPrice", "productIdentifierType"
    ];
    
    const wsData = filteredProducts.map(p => {
      let row = {};
      headers.forEach(header => {
        row[header] = p[header];
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(wsData, { header: headers });
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products");

    XLSX.writeFile(wb, "products_export.xlsx");
    addActivity("Product export downloaded.");
  };

  const handleDownloadTemplate = () => {
    const headers = [
        "name", "description", "salesPrice", "costPrice", "sku", "category",
        "reference", "internalNotes", "productType", "barcode", "toWeighWithScale",
        "marginPrice", "retailPrice", "productIdentifierType"
    ];
    const ws = XLSX.utils.json_to_sheet([], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Template");
    XLSX.writeFile(wb, "product_template.xlsx");
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      setImportErrors([]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportErrors(["Please select a file to import."]);
      return;
    }

    setIsImporting(true);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const productsToImport = json.map(row => ({
          name: row.name || "",
          description: row.description || "",
          salesPrice: parseFloat(row.salesPrice) || 0,
          costPrice: parseFloat(row.costPrice) || 0,
          sku: row.sku || "",
          category: row.category || "General",
          reference: row.reference || "",
          internalNotes: row.internalNotes || "",
          productType: row.productType || "Goods",
          barcode: row.barcode || "",
          toWeighWithScale: String(row.toWeighWithScale).toLowerCase() === 'true',
          marginPrice: parseFloat(row.marginPrice) || 0,
          retailPrice: parseFloat(row.retailPrice) || 0,
          productIdentifierType: row.productIdentifierType || "none",
        }));

        const validationErrors = productsToImport.reduce((acc, p, index) => {
          if (!p.name) acc.push(`Row ${index + 2}: Product name is required.`);
          if (!p.sku) acc.push(`Row ${index + 2}: SKU is required.`);
          return acc;
        }, []);

        if (validationErrors.length > 0) {
          setImportErrors(validationErrors);
          setIsImporting(false);
          return;
        }

        const res = await axios.post(`${backEndURL}/api/products/bulk`, { products: productsToImport });

        fetchProducts(); // Refresh the product list

        if (res.status === 207 && res.data.errors.length > 0) {
          addActivity(`Import partially successful. ${res.data.success.length} created, ${res.data.errors.length} failed.`);
          const backendErrors = res.data.errors.map(e => `SKU ${e.product.sku}: ${e.error}`);
          setImportErrors(backendErrors);
        } else {
          addActivity(`Successfully imported ${res.data.success.length} products.`);
          setImportModalOpen(false);
          setImportFile(null);
        }

      } catch (err) {
        console.error("Error importing products:", err);
        addActivity("Failed to import products.");
        if (err.response && err.response.data && err.response.data.errors) {
          const backendErrors = err.response.data.errors.map(e => `SKU ${e.product.sku}: ${e.error}`);
          setImportErrors(backendErrors);
        } else if (err.response && err.response.data && err.response.data.error) {
          setImportErrors([err.response.data.error]);
        }
        else {
          setImportErrors(["An unexpected error occurred. See console for details."]);
        }
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(importFile);
  };

  // Render helpers
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const handleViewIdentifiers = async (product) => {
    setIsLoadingIdentifiers(true);
    try {
      const [imeiResponse, serialResponse] = await Promise.all([
        axios.get(`${backEndURL}/api/identifiers/imei/${product.id}`),
        axios.get(`${backEndURL}/api/identifiers/serial/${product.id}`)
      ]);

      // Debug logs
      console.log('IMEI Response:', imeiResponse.data);
      console.log('Serial Response:', serialResponse.data);

      setSelectedProductIdentifiers({
        product,
        imei: imeiResponse.data,
        serial: serialResponse.data
      });
      setIdentifiersModalOpen(true);
    } catch (error) {
      console.error('Error fetching identifiers:', error);
    } finally {
      setIsLoadingIdentifiers(false);
    }
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
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">Additional Product Identifier</label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="none"
                                name="productIdentifierType"
                                value="none"
                                checked={newProduct.productIdentifierType === "none"}
                                onChange={e => handleNewProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="none" className="ml-2 text-sm">
                                None
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="serial"
                                name="productIdentifierType"
                                value="serial"
                                checked={newProduct.productIdentifierType === "serial"}
                                onChange={e => handleNewProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="serial" className="ml-2 text-sm">
                                Product with Serial Number
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="imei"
                                name="productIdentifierType"
                                value="imei"
                                checked={newProduct.productIdentifierType === "imei"}
                                onChange={e => handleNewProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="imei" className="ml-2 text-sm">
                                Product with IMEI Number
                              </label>
                            </div>
                          </div>
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
                <div>
                  <h3 className="text-sm font-medium mb-3">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cost Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.costPrice}
                          onChange={e => handleNewProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Wholesale Price
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.marginPrice}
                            onChange={e => syncPricePercent('marginPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.marginPricePercent}
                          onChange={e => syncPricePercent('marginPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Retail Price
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.retailPrice}
                            onChange={e => syncPricePercent('retailPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.retailPricePercent}
                          onChange={e => syncPricePercent('retailPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sales Price <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.salesPrice}
                            onChange={e => syncPricePercent('salesPrice', parseFloat(e.target.value) || 0, false)}
                            className={`w-full bg-gray-700 border ${errors.salesPrice ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.salesPricePercent}
                          onChange={e => syncPricePercent('salesPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-1 text-sm text-red-400">{errors.salesPrice}</p>}
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
                        onChange={e => handleNewProductChange("sku", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={e => handleNewProductChange("category", e.target.value)}
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
                    salesPricePercent: 0,
                    costPrice: 0,
                    sku: "",
                    category: "General",
                    reference: "",
                    internalNotes: "",
                    productType: "Goods",
                    image: null,
                    barcode: "",
                    toWeighWithScale: false,
                    marginPrice: 0,
                    marginPricePercent: 0,
                    retailPrice: 0,
                    retailPricePercent: 0,
                    productIdentifierType: "none",
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
              {/* Import/Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  <Upload size={16} />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Products table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th
                      className="pb-3 font-medium cursor-pointer hover:text-gray-300"
                      onClick={() => requestSort('sku')}
                    >
                      <div className="flex items-center">
                        SKU
                        {renderSortIcon('sku')}
                      </div>
                    </th>
                    <th className="pb-3 font-medium">Image</th>
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

                    <th className="pb-3 font-medium">Barcode</th>
                    <th className="pb-3 font-medium">Weigh With Scale?</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-4 text-center text-gray-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => (
                      <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-750">
                        <td className="py-4">{product.sku || '-'}</td>
                        <td className="py-4">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                              onError={(e) => { e.target.src = 'fallback-image-url'; }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-400">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 font-medium">
                          <div>{product.name}</div>
                          <div className="text-sm text-gray-400">{product.description}</div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-gray-700 rounded-full text-sm">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4">Rs {product.salesPrice?.toLocaleString() || '0'}</td>
                        <td className="py-4">Rs {product.costPrice?.toLocaleString() || '0'}</td>
                        <td className="py-4">{product.barcode || '-'}</td>
                        <td className="py-4">
                          {product.productType === "Goods" ? (product.toWeighWithScale ? "Yes" : "No") : "-"}
                        </td>
                        <td className="py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewIdentifiers(product)}
                              className="text-blue-400 hover:text-blue-300"
                              title="View Identifiers"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {/* Only show edit button if user has products permission */}
                            {hasPermission('products') && (
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-400 hover:text-blue-300"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            
                            {/* Only show delete button if user has products permission */}
                            {hasPermission('products') && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl w-[1800px] max-h-screen h-[1000px]  overflow-y-auto">
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
                        <div className="mt-4">
                          <label className="block text-sm font-medium mb-2">Additional Product Identifier</label>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="editNone"
                                name="editProductIdentifierType"
                                value="none"
                                checked={editProduct.productIdentifierType === "none"}
                                onChange={e => handleEditProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="editNone" className="ml-2 text-sm">
                                None
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="editSerial"
                                name="editProductIdentifierType"
                                value="serial"
                                checked={editProduct.productIdentifierType === "serial"}
                                onChange={e => handleEditProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="editSerial" className="ml-2 text-sm">
                                Product with Serial Number
                              </label>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="editImei"
                                name="editProductIdentifierType"
                                value="imei"
                                checked={editProduct.productIdentifierType === "imei"}
                                onChange={e => handleEditProductChange("productIdentifierType", e.target.value)}
                                className="h-4 w-4 text-blue-600"
                              />
                              <label htmlFor="editImei" className="ml-2 text-sm">
                                Product with IMEI Number
                              </label>
                            </div>
                          </div>
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

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cost Price <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.costPrice}
                          onChange={e => handleEditProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Wholesale Price
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.marginPrice}
                            onChange={e => syncEditPricePercent('marginPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.marginPricePercent}
                          onChange={e => syncEditPricePercent('marginPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Retail Price
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.retailPrice}
                            onChange={e => syncEditPricePercent('retailPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.retailPricePercent}
                          onChange={e => syncEditPricePercent('retailPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Sales Price <span className="text-red-400">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.salesPrice}
                            onChange={e => syncEditPricePercent('salesPrice', parseFloat(e.target.value) || 0, false)}
                            className={`w-full bg-gray-700 border ${errors.salesPrice ? 'border-red-500' : 'border-gray-600'} rounded-md py-2 pl-8 pr-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.salesPricePercent}
                          onChange={e => syncEditPricePercent('salesPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="%"
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-1 text-sm text-red-400">{errors.salesPrice}</p>}
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
                        onChange={e => handleEditProductChange("sku", e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={editProduct.category}
                        onChange={e => handleEditProductChange("category", e.target.value)}
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

      {/* Import Products Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Import Products</h2>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  Download the template, fill it out, and upload it to bulk-import products.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Download Template.xlsx
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload File</label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload size={24} className="mb-2 text-gray-400"/>
                            <p className="mb-2 text-sm text-gray-400">
                              {importFile ? importFile.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}
                            </p>
                            <p className="text-xs text-gray-500">XLSX or CSV file</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImportFileChange} accept=".xlsx, .csv" />
                    </label>
                </div> 
              </div>

              {importErrors.length > 0 && (
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
                  <h3 className="font-bold">Import Errors</h3>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {importErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || !importFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importing...' : 'Start Import'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Identifiers Modal */}
      {identifiersModalOpen && selectedProductIdentifiers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                Identifiers for {selectedProductIdentifiers.product.name}
              </h2>
              <button
                onClick={() => setIdentifiersModalOpen(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {isLoadingIdentifiers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* IMEI Numbers */}
                {selectedProductIdentifiers.imei && (
                  <div>
                    <h3 className="text-md font-medium mb-3">IMEI Numbers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-700">
                            <th className="pb-2">IMEI</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Purchase ID</th>
                            <th className="pb-2">Created At</th>
                            <th className="pb-2">Damaged</th>
                            <th className="pb-2">Opened</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProductIdentifiers.imei.identifiers?.map((item, index) => {
                            // Debug log for each item's createdAt
                            console.log('Item createdAt:', item.createdAt);
                            return (
                              <tr key={index} className="border-b border-gray-700">
                                <td className="py-2">{item.imei}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    item.sold ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                                  }`}>
                                    {item.sold ? 'Sold' : 'Available'}
                                  </span>
                                </td>
                                <td className="py-2">{item.purchaseId || '-'}</td>
                                <td className="py-2">
                                  {item.createdAt ? (
                                    (() => {
                                      let dateObj;
                                      if (typeof item.createdAt === 'string' || typeof item.createdAt === 'number') {
                                        dateObj = new Date(item.createdAt);
                                      } else if (item.createdAt && typeof item.createdAt.toDate === 'function') {
                                        dateObj = item.createdAt.toDate();
                                      } else {
                                        dateObj = null;
                                      }
                                      return dateObj && !isNaN(dateObj.getTime())
                                        ? dateObj.toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                          })
                                        : '-';
                                    })()
                                  ) : '-'}
                                </td>
                                <td className="py-2">
                                  {item.damaged ? (
                                    <span className="px-2 py-1 rounded-full text-xs bg-red-800 text-red-200">Damaged</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">No</span>
                                  )}
                                </td>
                                <td className="py-2">
                                  {item.opened ? (
                                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-700 text-yellow-200">Opened</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">No</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Serial Numbers */}
                {selectedProductIdentifiers.serial && (
                  <div>
                    <h3 className="text-md font-medium mb-3">Serial Numbers</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-gray-700">
                            <th className="pb-2">Serial</th>
                            <th className="pb-2">Status</th>
                            <th className="pb-2">Purchase ID</th>
                            <th className="pb-2">Created At</th>
                            <th className="pb-2">Damaged</th>
                            <th className="pb-2">Opened</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProductIdentifiers.serial.identifiers?.map((item, index) => {
                            // Debug log for each item's createdAt
                            console.log('Item createdAt:', item.createdAt);
                            return (
                              <tr key={index} className="border-b border-gray-700">
                                <td className="py-2">{item.serial}</td>
                                <td className="py-2">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    item.sold ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'
                                  }`}>
                                    {item.sold ? 'Sold' : 'Available'}
                                  </span>
                                </td>
                                <td className="py-2">{item.purchaseId || '-'}</td>
                                <td className="py-2">
                                  {item.createdAt ? (
                                    (() => {
                                      let dateObj;
                                      if (typeof item.createdAt === 'string' || typeof item.createdAt === 'number') {
                                        dateObj = new Date(item.createdAt);
                                      } else if (item.createdAt && typeof item.createdAt.toDate === 'function') {
                                        dateObj = item.createdAt.toDate();
                                      } else {
                                        dateObj = null;
                                      }
                                      return dateObj && !isNaN(dateObj.getTime())
                                        ? dateObj.toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false
                                          })
                                        : '-';
                                    })()
                                  ) : '-'}
                                </td>
                                <td className="py-2">
                                  {item.damaged ? (
                                    <span className="px-2 py-1 rounded-full text-xs bg-red-800 text-red-200">Damaged</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">No</span>
                                  )}
                                </td>
                                <td className="py-2">
                                  {item.opened ? (
                                    <span className="px-2 py-1 rounded-full text-xs bg-yellow-700 text-yellow-200">Opened</span>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">No</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!selectedProductIdentifiers.imei && !selectedProductIdentifiers.serial) && (
                  <div className="text-center py-8 text-gray-400">
                    No identifiers found for this product
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}