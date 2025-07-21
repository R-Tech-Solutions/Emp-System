import React, { useState, useEffect } from 'react';
import { backEndURL } from "../Backendurl";
import { FaEye } from 'react-icons/fa';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
};

function getWarrantyStatus(purchaseDate, warrantyDays) {
  if (!purchaseDate || !warrantyDays) return { status: 'unknown', daysLeft: null };
  const purchase = new Date(purchaseDate);
  const expiry = new Date(purchase.getTime() + warrantyDays * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return { status: 'expired', daysLeft };
  if (daysLeft <= 30) return { status: 'expiring', daysLeft };
  return { status: 'active', daysLeft };
}

export default function Warranty() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  // Debug states
  const [debugProducts, setDebugProducts] = useState([]);
  const [debugPurchases, setDebugPurchases] = useState([]);
  const [debugAllWarranty, setDebugAllWarranty] = useState([]);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalWarrantyRows, setModalWarrantyRows] = useState([]);

  const handleSearch = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      // Fetch all products with warranty enabled
      const productsRes = await fetch(`${backEndURL}/api/products`);
      const allProducts = await productsRes.json();
      const warrantyProducts = allProducts.filter(p => p.warranty === true || p.warranty === 'Yes');
      setDebugProducts(warrantyProducts);
      // Fetch all purchases
      const purchasesRes = await fetch(`${backEndURL}/api/purchase`);
      const purchases = await purchasesRes.json();
      setDebugPurchases(purchases);
      let allWarranty = [];
      for (const product of warrantyProducts) {
        if (product.productIdentifierType === 'none') {
          // For 'none', find all purchase items for this product with warrantyValue
          for (const purchase of purchases) {
            for (const item of purchase.items || []) {
              if (item.sku === product.sku && item.warrantyValue) {
                allWarranty.push({
                  product,
                  purchase,
                  customer: { name: purchase.customerName, email: purchase.customerEmail },
                  identifier: null,
                  warrantyDays: parseInt(item.warrantyValue),
                  purchaseDate: purchase.createdAt,
                });
              }
            }
          }
        } else if (product.productIdentifierType === 'serial' || product.productIdentifierType === 'imei') {
          // For serial/imei, look for warranty info in purchase.items[].identifiers
          for (const purchase of purchases) {
            for (const item of purchase.items || []) {
              if (item.sku === product.sku && Array.isArray(item.identifiers)) {
                for (const identifier of item.identifiers) {
                  if (identifier.warranty && identifier.value) {
                    allWarranty.push({
                      product,
                      purchase,
                      customer: { name: purchase.customerName, email: purchase.customerEmail },
                      identifier: identifier.value,
                      warrantyDays: parseInt(identifier.warranty),
                      purchaseDate: purchase.createdAt,
                    });
                  }
                }
              }
            }
          }
        }
      }
      setDebugAllWarranty(allWarranty);
      // Filter by search
      const q = search.trim().toLowerCase();
      let filtered = allWarranty;
      if (q) {
        filtered = allWarranty.filter(w =>
          (w.identifier && w.identifier.toLowerCase().includes(q)) ||
          (w.customer.email && w.customer.email.toLowerCase().includes(q)) ||
          (w.customer.name && w.customer.name.toLowerCase().includes(q)) ||
          (w.product && w.product.name && w.product.name.toLowerCase().includes(q))
        );
      }
      // Filter by status
      if (filter !== 'all') {
        filtered = filtered.filter(w => getWarrantyStatus(w.purchaseDate, w.warrantyDays).status === filter);
      }
      // Group warranty data by product
      const grouped = {};
      filtered.forEach(w => {
        const sku = w.product?.sku || '-';
        if (!grouped[sku]) grouped[sku] = { product: w.product, rows: [] };
        grouped[sku].rows.push(w);
      });
      const groupedResults = Object.values(grouped);
      setResults(groupedResults);
    } catch (err) {
      setError("Failed to fetch warranty data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-accent/20 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Warranty Management</h1>
        {/* Debug output - only show in development */}
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by Serial/IMEI, Email, Product Name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary text-text-primary bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border border-border/50">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-surface to-white border-b border-border/30">
              <tr>
                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Product</th>
                <th className="py-4 px-4 text-left text-text-secondary font-semibold">SKU</th>
                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Warranty Type</th>
                <th className="py-4 px-4 text-left text-text-secondary font-semibold">Warranty Count</th>
                <th className="py-4 px-4 text-center text-text-secondary font-semibold">View</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-secondary">No warranty records found.</td>
                </tr>
              )}
              {results.map((g, idx) => {
                const { product, rows } = g;
                const warrantyType = product?.productIdentifierType === 'none' ? 'None' : (product?.productIdentifierType || '-');
                return (
                  <tr key={idx} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-200">
                    <td className="py-4 px-4 font-semibold text-text-primary">{product?.name || '-'}</td>
                    <td className="py-4 px-4 text-text-secondary">{product?.sku || '-'}</td>
                    <td className="py-4 px-4 text-text-secondary">{warrantyType}</td>
                    <td className="py-4 px-4 text-center">{rows.length}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        className="inline-flex items-center justify-center p-2 bg-surface hover:bg-primary/10 rounded-full transition"
                        title="View Warranty Details"
                        onClick={() => { setModalProduct(product); setModalWarrantyRows(rows); }}
                      >
                        <FaEye className="text-primary" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Warranty Details Modal */}
        {modalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative border border-border/50">
              <button
                className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-2xl font-bold transition-colors"
                onClick={() => { setModalProduct(null); setModalWarrantyRows([]); }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-primary">{modalProduct.name} Warranty Details</h2>
              <div className="mb-4">
                <b>SKU:</b> {modalProduct.sku} &nbsp; <b>Barcode:</b> {modalProduct.barcode || '-'} &nbsp; <b>Type:</b> {modalProduct.productIdentifierType || '-'}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {modalProduct.productIdentifierType !== 'none' && <th className="py-2 px-2 text-left">Identifier</th>}
                      <th className="py-2 px-2 text-left">Customer</th>
                      <th className="py-2 px-2 text-left">Email</th>
                      <th className="py-2 px-2 text-left">Purchase Date</th>
                      <th className="py-2 px-2 text-left">Warranty (days)</th>
                      <th className="py-2 px-2 text-left">Days Left</th>
                      <th className="py-2 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalWarrantyRows.map((w, i) => {
                      const { status, daysLeft } = getWarrantyStatus(w.purchaseDate, w.warrantyDays);
                      return (
                        <tr key={i}>
                          {modalProduct.productIdentifierType !== 'none' && <td className="py-2 px-2">{w.identifier || '-'}</td>}
                          <td className="py-2 px-2">{w.customer?.name || '-'}</td>
                          <td className="py-2 px-2">{w.customer?.email || '-'}</td>
                          <td className="py-2 px-2">{w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString() : '-'}</td>
                          <td className="py-2 px-2 text-center">{w.warrantyDays || '-'}</td>
                          <td className="py-2 px-2 text-center">{daysLeft !== null ? (daysLeft >= 0 ? daysLeft : 0) : '-'}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
