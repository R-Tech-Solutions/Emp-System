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
    <div className="min-h-screen bg-background dark:bg-gray-900 text-text-primary dark:text-gray-100">
      {/* Header */}
      <header className="bg-surface dark:bg-gray-800 border-b border-border rounded-xl shadow-lg p-6 mb-6 py-6 px-4 transition-all duration-200">
        <div className="container mx-auto">
          <div className="flex border-b border-border mb-4">
            <button
              className={`px-4 py-2 font-bold text-lg rounded-xl transition-all duration-200 ${activeTab === "new" ? "text-primary border-b-2 border-primary bg-accent" : "text-text-secondary hover:text-primary hover:bg-accent"}`}
              onClick={() => setActiveTab("new")}
            >
              New Product
            </button>
            <button
              className={`px-4 py-2 font-bold text-lg rounded-xl transition-all duration-200 ${activeTab === "all" ? "text-primary border-b-2 border-primary bg-accent" : "text-text-secondary hover:text-primary hover:bg-accent"}`}
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
          <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-border transition-all duration-200">
            <h2 className="text-2xl font-bold text-text-primary mb-8">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Product Image */}
                <div>
                  <label className="block text-lg font-bold text-text-primary mb-4">Product Image</label>
                  <div className="flex items-center">
                    <div className="h-32 w-32 rounded-xl overflow-hidden bg-accent flex items-center justify-center shadow-lg border border-border">
                      {newProduct.image ? (
                        <img
                          src={URL.createObjectURL(newProduct.image)}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-text-muted text-lg">No image</span>
                      )}
                    </div>
                    <label className="ml-6 cursor-pointer">
                      <div className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-lg font-bold transition-all duration-200 shadow-lg">
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
                  <h3 className="text-xl font-bold text-text-primary mb-6">Basic Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Product Type</label>
                      <select
                        value={newProduct.productType}
                        onChange={(e) => handleNewProductChange("productType", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      >
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {/* Barcode and Scale fields for Goods */}
                    {newProduct.productType === "Goods" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="toWeighWithScale"
                            checked={!!newProduct.toWeighWithScale}
                            onChange={e => handleNewProductChange("toWeighWithScale", e.target.checked)}
                            className="form-checkbox h-5 w-5 text-primary rounded-lg"
                          />
                          <label htmlFor="toWeighWithScale" className="text-lg font-bold text-text-primary">
                            To Weigh With Scale?
                          </label>
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-text-primary mb-2">
                            Barcode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newProduct.barcode}
                            onChange={e => handleNewProductChange("barcode", e.target.value)}
                            className={`w-full bg-surface border ${errors.barcode ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                          />
                          {errors.barcode && <p className="mt-2 text-lg text-red-500">{errors.barcode}</p>}
                        </div>
                        <div className="mt-6">
                          <label className="block text-lg font-bold text-text-primary mb-4">Additional Product Identifier</label>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="none"
                                name="productIdentifierType"
                                value="none"
                                checked={newProduct.productIdentifierType === "none"}
                                onChange={e => handleNewProductChange("productIdentifierType", e.target.value)}
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="none" className="ml-3 text-lg text-text-primary">
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
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="serial" className="ml-3 text-lg text-text-primary">
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
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="imei" className="ml-3 text-lg text-text-primary">
                                Product with IMEI Number
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => handleNewProductChange("name", e.target.value)}
                        className={`w-full bg-surface border ${errors.name ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                      />
                      {errors.name && <p className="mt-2 text-lg text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => handleNewProductChange("description", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6">Pricing</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Cost Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.costPrice}
                          onChange={e => handleNewProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Wholesale Price
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.marginPrice}
                            onChange={e => syncPricePercent('marginPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.marginPricePercent}
                          onChange={e => syncPricePercent('marginPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Retail Price
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.retailPrice}
                            onChange={e => syncPricePercent('retailPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.retailPricePercent}
                          onChange={e => syncPricePercent('retailPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Sales Price <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newProduct.salesPrice}
                            onChange={e => syncPricePercent('salesPrice', parseFloat(e.target.value) || 0, false)}
                            className={`w-full bg-surface border ${errors.salesPrice ? 'border-red-500' : 'border-border'} rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.salesPricePercent}
                          onChange={e => syncPricePercent('salesPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-2 text-lg text-red-500">{errors.salesPrice}</p>}
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6">Inventory</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">SKU</label>
                      <input
                        type="text"
                        value={newProduct.sku}
                        onChange={e => handleNewProductChange("sku", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Category</label>
                      <select
                        value={newProduct.category}
                        onChange={e => handleNewProductChange("category", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
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
                  <h3 className="text-xl font-bold text-text-primary mb-6">Additional Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Reference</label>
                      <input
                        type="text"
                        value={newProduct.reference}
                        onChange={(e) => handleNewProductChange("reference", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Internal Notes</label>
                      <textarea
                        value={newProduct.internalNotes}
                        onChange={(e) => handleNewProductChange("internalNotes", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-10">
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
                className="px-8 py-3 bg-secondary hover:bg-accent text-primary rounded-xl font-bold transition-all duration-200 shadow-lg"
              >
                Clear
              </button>
              <button
                onClick={handleCreateProduct}
                disabled={isLoading || !newProduct.name || newProduct.salesPrice <= 0}
                className={`px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all duration-200 shadow-lg ${(isLoading || !newProduct.name || newProduct.salesPrice <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Creating...' : 'Create Product'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-border transition-all duration-200">
            {/* Search and filter */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={20} className="text-text-muted" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {productCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              {/* Import/Export Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setImportModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-accent text-primary rounded-xl font-bold transition-all duration-200 shadow-lg"
                >
                  <Upload size={18} />
                  Import
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-accent text-primary rounded-xl font-bold transition-all duration-200 shadow-lg"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Products table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full">
                <thead className="bg-accent">
                  <tr className="text-left text-text-primary border-b border-border">
                    <th
                      className="pb-4 pt-4 pl-6 font-bold text-lg cursor-pointer hover:text-primary transition-all duration-200"
                      onClick={() => requestSort('sku')}
                    >
                      <div className="flex items-center">
                        SKU
                        {renderSortIcon('sku')}
                      </div>
                    </th>
                    <th className="pb-4 pt-4 font-bold text-lg">Image</th>
                    <th
                      className="pb-4 pt-4 font-bold text-lg cursor-pointer hover:text-primary transition-all duration-200"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {renderSortIcon('name')}
                      </div>
                    </th>
                    <th
                      className="pb-4 pt-4 font-bold text-lg cursor-pointer hover:text-primary transition-all duration-200"
                      onClick={() => requestSort('category')}
                    >
                      <div className="flex items-center">
                        Category
                        {renderSortIcon('category')}
                      </div>
                    </th>
                    <th
                      className="pb-4 pt-4 font-bold text-lg cursor-pointer hover:text-primary transition-all duration-200"
                      onClick={() => requestSort('salesPrice')}
                    >
                      <div className="flex items-center">
                        Sales Price
                        {renderSortIcon('salesPrice')}
                      </div>
                    </th>
                    <th
                      className="pb-4 pt-4 font-bold text-lg cursor-pointer hover:text-primary transition-all duration-200"
                      onClick={() => requestSort('costPrice')}
                    >
                      <div className="flex items-center">
                        Cost Price
                        {renderSortIcon('costPrice')}
                      </div>
                    </th>

                    <th className="pb-4 pt-4 font-bold text-lg">Barcode</th>
                    <th className="pb-4 pt-4 font-bold text-lg">Weigh With Scale?</th>
                    <th className="pb-4 pt-4 font-bold text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-surface">
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        </div>
                      </td>
                    </tr>
                  ) : currentProducts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-text-muted text-lg">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    currentProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-accent transition-all duration-200">
                        <td className="py-6 pl-6 text-lg font-bold">{product.sku || '-'}</td>
                        <td className="py-6">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-16 w-16 rounded-xl object-cover shadow-lg"
                              onError={(e) => { e.target.src = 'fallback-image-url'; }}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                              <span className="text-text-muted text-lg">No image</span>
                            </div>
                          )}
                        </td>
                        <td className="py-6">
                          <div className="text-lg font-bold text-text-primary">{product.name}</div>
                          <div className="text-lg text-text-secondary">{product.description}</div>
                        </td>
                        <td className="py-6">
                          <span className="px-4 py-2 bg-secondary text-primary rounded-xl text-lg font-bold shadow-lg">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-6 text-lg font-bold text-text-primary">Rs {product.salesPrice?.toLocaleString() || '0'}</td>
                        <td className="py-6 text-lg font-bold text-text-primary">Rs {product.costPrice?.toLocaleString() || '0'}</td>
                        <td className="py-6 text-lg text-text-primary">{product.barcode || '-'}</td>
                        <td className="py-6">
                          {product.productType === "Goods" ? (
                            <span className={`px-4 py-2 rounded-xl text-lg font-bold ${product.toWeighWithScale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {product.toWeighWithScale ? "Yes" : "No"}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="py-6">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleViewIdentifiers(product)}
                              className="text-primary hover:text-primary-dark transition-all duration-200"
                              title="View Identifiers"
                            >
                              <Eye size={20} />
                            </button>
                            
                            {/* Only show edit button if user has products permission */}
                            {hasPermission('products') && (
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-primary hover:text-primary-dark transition-all duration-200"
                                title="Edit"
                              >
                                <Edit size={20} />
                              </button>
                            )}
                            
                            {/* Only show delete button if user has products permission */}
                            {hasPermission('products') && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-500 hover:text-red-700 transition-all duration-200"
                                title="Delete"
                              >
                                <Trash2 size={20} />
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
            <div className="flex justify-between items-center mt-8">
              <div className="text-lg text-text-secondary">
                Showing {indexOfFirstProduct + 1} to {Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                      className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${currentPage === pageNum ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border text-text-primary hover:bg-accent'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-text-primary hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
          <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-4xl w-[1800px] max-h-screen h-[1000px] overflow-y-auto border border-border transition-all duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Edit Product</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Product Image */}
                <div>
                  <label className="block text-lg font-bold text-text-primary mb-4">Product Image</label>
                  <div className="flex items-center">
                    <div className="h-32 w-32 rounded-xl overflow-hidden bg-accent flex items-center justify-center shadow-lg border border-border">
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
                        <span className="text-text-muted text-lg">No image</span>
                      )}
                    </div>
                    <label className="ml-6 cursor-pointer">
                      <div className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-lg font-bold transition-all duration-200 shadow-lg">
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
                  <h3 className="text-xl font-bold text-text-primary mb-6">Basic Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Product Type</label>
                      <select
                        value={editProduct.productType}
                        onChange={(e) => handleEditProductChange("productType", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      >
                        {productTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {/* Barcode and Scale fields for Goods */}
                    {editProduct.productType === "Goods" && (
                      <>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="editToWeighWithScale"
                            checked={!!editProduct.toWeighWithScale}
                            onChange={e => handleEditProductChange("toWeighWithScale", e.target.checked)}
                            className="form-checkbox h-5 w-5 text-primary rounded-lg"
                          />
                          <label htmlFor="editToWeighWithScale" className="text-lg font-bold text-text-primary">
                            To Weigh With Scale?
                          </label>
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-text-primary mb-2">
                            Barcode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={editProduct.barcode}
                            onChange={e => handleEditProductChange("barcode", e.target.value)}
                            className={`w-full bg-surface border ${errors.barcode ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                          />
                          {errors.barcode && <p className="mt-2 text-lg text-red-500">{errors.barcode}</p>}
                        </div>
                        <div className="mt-6">
                          <label className="block text-lg font-bold text-text-primary mb-4">Additional Product Identifier</label>
                          <div className="space-y-4">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="editNone"
                                name="editProductIdentifierType"
                                value="none"
                                checked={editProduct.productIdentifierType === "none"}
                                onChange={e => handleEditProductChange("productIdentifierType", e.target.value)}
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="editNone" className="ml-3 text-lg text-text-primary">
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
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="editSerial" className="ml-3 text-lg text-text-primary">
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
                                className="h-5 w-5 text-primary"
                              />
                              <label htmlFor="editImei" className="ml-3 text-lg text-text-primary">
                                Product with IMEI Number
                              </label>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) => handleEditProductChange("name", e.target.value)}
                        className={`w-full bg-surface border ${errors.name ? 'border-red-500' : 'border-border'} rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                      />
                      {errors.name && <p className="mt-2 text-lg text-red-500">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Description</label>
                      <textarea
                        value={editProduct.description}
                        onChange={(e) => handleEditProductChange("description", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6">Pricing</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Cost Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.costPrice}
                          onChange={e => handleEditProductChange("costPrice", parseFloat(e.target.value) || 0)}
                          className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Wholesale Price
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.marginPrice}
                            onChange={e => syncEditPricePercent('marginPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.marginPricePercent}
                          onChange={e => syncEditPricePercent('marginPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Retail Price
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.retailPrice}
                            onChange={e => syncEditPricePercent('retailPrice', parseFloat(e.target.value) || 0, false)}
                            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.retailPricePercent}
                          onChange={e => syncEditPricePercent('retailPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">
                        Sales Price <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="relative w-2/3">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-muted text-lg">Rs</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editProduct.salesPrice}
                            onChange={e => syncEditPricePercent('salesPrice', parseFloat(e.target.value) || 0, false)}
                            className={`w-full bg-surface border ${errors.salesPrice ? 'border-red-500' : 'border-border'} rounded-xl py-3 pl-12 pr-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200`}
                          />
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editProduct.salesPricePercent}
                          onChange={e => syncEditPricePercent('salesPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-1/3 bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="%"
                        />
                      </div>
                      {errors.salesPrice && <p className="mt-2 text-lg text-red-500">{errors.salesPrice}</p>}
                    </div>
                  </div>
                </div>

                {/* Inventory */}
                <div>
                  <h3 className="text-xl font-bold text-text-primary mb-6">Inventory</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">SKU</label>
                      <input
                        type="text"
                        value={editProduct.sku}
                        onChange={e => handleEditProductChange("sku", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Category</label>
                      <select
                        value={editProduct.category}
                        onChange={e => handleEditProductChange("category", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
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
                  <h3 className="text-xl font-bold text-text-primary mb-6">Additional Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Reference</label>
                      <input
                        type="text"
                        value={editProduct.reference}
                        onChange={(e) => handleEditProductChange("reference", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-bold text-text-primary mb-2">Internal Notes</label>
                      <textarea
                        value={editProduct.internalNotes}
                        onChange={(e) => handleEditProductChange("internalNotes", e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl py-3 px-4 text-text-primary focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-10">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-8 py-3 bg-secondary hover:bg-accent text-primary rounded-xl font-bold transition-all duration-200 shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                disabled={isLoading || !editProduct.name || editProduct.salesPrice <= 0}
                className={`px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all duration-200 shadow-lg ${(isLoading || !editProduct.name || editProduct.salesPrice <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-border transition-all duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary">Import Products</h2>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-lg text-text-secondary mb-4">
                  Download the template, fill it out, and upload it to bulk-import products.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="text-primary hover:text-primary-dark text-lg font-bold transition-all duration-200"
                >
                  Download Template.xlsx
                </button>
              </div>

              <div>
                <label className="block text-lg font-bold text-text-primary mb-4">Upload File</label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-border border-dashed rounded-xl cursor-pointer bg-accent hover:bg-secondary transition-all duration-200">
                        <div className="flex flex-col items-center justify-center pt-8 pb-6">
                            <Upload size={32} className="mb-4 text-text-muted"/>
                            <p className="mb-2 text-lg text-text-primary">
                              {importFile ? importFile.name : <><span className="font-bold">Click to upload</span> or drag and drop</>}
                            </p>
                            <p className="text-lg text-text-muted">XLSX or CSV file</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImportFileChange} accept=".xlsx, .csv" />
                    </label>
                </div> 
              </div>

              {importErrors.length > 0 && (
                <div className="bg-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl">
                  <h3 className="font-bold text-lg mb-2">Import Errors</h3>
                  <ul className="mt-2 list-disc list-inside text-lg">
                    {importErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-6 py-3 bg-secondary hover:bg-accent text-primary rounded-xl font-bold transition-all duration-200 shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || !importFile}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-surface dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto border border-border transition-all duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-text-primary">
                Identifiers for {selectedProductIdentifiers.product.name}
              </h2>
              <button
                onClick={() => setIdentifiersModalOpen(false)}
                className="text-text-muted hover:text-text-primary transition-all duration-200"
              >
                <X size={24} />
              </button>
            </div>

            {isLoadingIdentifiers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* IMEI Numbers */}
                {selectedProductIdentifiers.imei && (
                  <div>
                    <h3 className="text-xl font-bold text-text-primary mb-6">IMEI Numbers</h3>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full">
                        <thead className="bg-accent">
                          <tr className="text-left text-text-primary border-b border-border">
                            <th className="pb-4 pt-4 pl-6 font-bold text-lg">IMEI</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Status</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Purchase ID</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Created At</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Damaged</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Opened</th>
                          </tr>
                        </thead>
                        <tbody className="bg-surface">
                          {selectedProductIdentifiers.imei.identifiers?.map((item, index) => {
                            // Debug log for each item's createdAt
                            console.log('Item createdAt:', item.createdAt);
                            return (
                              <tr key={index} className="border-b border-border hover:bg-accent transition-all duration-200">
                                <td className="py-4 pl-6 text-lg font-bold text-text-primary">{item.imei}</td>
                                <td className="py-4">
                                  <span className={`px-4 py-2 rounded-xl text-lg font-bold ${item.sold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {item.sold ? 'Sold' : 'Available'}
                                  </span>
                                </td>
                                <td className="py-4 text-lg text-text-primary">{item.purchaseId || '-'}</td>
                                <td className="py-4 text-lg text-text-primary">
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
                                <td className="py-4">
                                  {item.damaged ? (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-red-100 text-red-800">Damaged</span>
                                  ) : (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-gray-100 text-gray-800">No</span>
                                  )}
                                </td>
                                <td className="py-4">
                                  {item.opened ? (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-yellow-100 text-yellow-800">Opened</span>
                                  ) : (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-gray-100 text-gray-800">No</span>
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
                    <h3 className="text-xl font-bold text-text-primary mb-6">Serial Numbers</h3>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full">
                        <thead className="bg-accent">
                          <tr className="text-left text-text-primary border-b border-border">
                            <th className="pb-4 pt-4 pl-6 font-bold text-lg">Serial</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Status</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Purchase ID</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Created At</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Damaged</th>
                            <th className="pb-4 pt-4 font-bold text-lg">Opened</th>
                          </tr>
                        </thead>
                        <tbody className="bg-surface">
                          {selectedProductIdentifiers.serial.identifiers?.map((item, index) => {
                            // Debug log for each item's createdAt
                            console.log('Item createdAt:', item.createdAt);
                            return (
                              <tr key={index} className="border-b border-border hover:bg-accent transition-all duration-200">
                                <td className="py-4 pl-6 text-lg font-bold text-text-primary">{item.serial}</td>
                                <td className="py-4">
                                  <span className={`px-4 py-2 rounded-xl text-lg font-bold ${item.sold ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                    {item.sold ? 'Sold' : 'Available'}
                                  </span>
                                </td>
                                <td className="py-4 text-lg text-text-primary">{item.purchaseId || '-'}</td>
                                <td className="py-4 text-lg text-text-primary">
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
                                <td className="py-4">
                                  {item.damaged ? (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-red-100 text-red-800">Damaged</span>
                                  ) : (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-gray-100 text-gray-800">No</span>
                                  )}
                                </td>
                                <td className="py-4">
                                  {item.opened ? (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-yellow-100 text-yellow-800">Opened</span>
                                  ) : (
                                    <span className="px-4 py-2 rounded-xl text-lg font-bold bg-gray-100 text-gray-800">No</span>
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
                  <div className="text-center py-8 text-text-muted text-xl">
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