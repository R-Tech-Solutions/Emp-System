"use client"

import React, { useState, useEffect } from "react"
import {
  Search,
  Plus,
  DollarSign,
  Building2,
  Phone,
  Mail,
  Calendar,
  ChevronDown,
  CreditCard,
  Banknote,
  Globe,
} from "lucide-react"
import axios from "axios"
import { backEndURL } from "../Backendurl";

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [supplierTotals, setSupplierTotals] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showPaymentHistory, setShowPaymentHistory] = useState({})
  const [isFullPayMode, setIsFullPayMode] = useState(false)
  const [supplierPurchases, setSupplierPurchases] = useState({});
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [paymentError, setPaymentError] = useState("")
  const [showError, setShowError] = useState(false)
  const [paymentHistoryData, setPaymentHistoryData] = useState({});
  const [supplierPaidAmounts, setSupplierPaidAmounts] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const calculatePaidAmount = (paymentHistory, purchaseId) => {
    if (!paymentHistory || !Array.isArray(paymentHistory)) return 0
    return paymentHistory
      .filter(payment => payment.purchaseId === purchaseId)
      .reduce((sum, payment) => {
        const amount = Number(payment.amount) || 0
        return amount > 0 ? sum + amount : sum
      }, 0)
  }

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    supplierNotes: "",
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "cash",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  useEffect(() => {
    fetchSuppliers()
    fetchSupplierTotals()
    fetchSupplierPaidAmounts()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/contacts`);
      const purchasesResponse = await axios.get(`${backEndURL}/api/purchase`);
      const suppliersResponse = await axios.get(`${backEndURL}/api/suppliers`);

      const supplierData = response.data
        .filter(contact => contact.categoryType === "Supplier")
        .map(supplier => {
          // Find supplier payment records
          const supplierPayments = suppliersResponse.data
            .filter(payment => payment.contactId === supplier.id);

          // Find all purchases for this supplier's email
          const supplierPurchases = purchasesResponse.data
            .filter(purchase => purchase.customerEmail === supplier.email)
            .map(purchase => {
              // Find corresponding supplier payment record
              const paymentRecord = supplierPayments.find(p => p.purchaseId === purchase.id);
              return {
                id: purchase.id,
                total: purchase.total,
                paymentStatus: purchase.paymentStatus,
                paidAmount: paymentRecord?.paidAmountTotal || 0,
                pendingAmount: paymentRecord?.pendingAmount || purchase.total,
                status: paymentRecord?.status || "Pending",
                paymentHistory: paymentRecord?.paidAmountHistory || []
              };
            });

          return {
            ...supplier,
            purchases: supplierPurchases
          };
        });

      setSuppliers(supplierData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchSupplierTotals = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/purchase`);
      const purchases = response.data;
      const totals = {};
      const purchaseDetails = {}; // New object to store purchase details

      purchases.forEach(purchase => {
        const email = purchase.customerEmail;
        if (purchase.paymentStatus === "Debited to Supplier Account") {
          if (!totals[email]) {
            totals[email] = 0;
            purchaseDetails[email] = [];
          }
          totals[email] += purchase.total;
          purchaseDetails[email].push({
            id: purchase.id,
            amount: purchase.total
          });
        }
      });

      setSupplierTotals(totals);
      // Store purchase details in state
      setSupplierPurchases(purchaseDetails);
    } catch (error) {
      console.error('Error fetching supplier totals:', error);
    }
  };

  const fetchSupplierPaidAmounts = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/suppliers`);
      const paidAmounts = {};
      response.data.forEach(supplier => {
        if (supplier.purchaseId) {
          paidAmounts[supplier.purchaseId] = supplier.paidAmountTotal || 0;
        }
      });
      setSupplierPaidAmounts(paidAmounts);
    } catch (error) {
      console.error('Error fetching supplier paid amounts:', error);
    }
  };

  // Filter and search suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.company?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Calculate totals
  const totalAmount = Object.values(supplierTotals).reduce((sum, amount) => sum + amount, 0)
  const totalPaid = suppliers.reduce(
    (sum, supplier) => sum + calculatePaidAmount(supplier.paymentHistory, null),
    0
  )
  const totalPending = totalAmount - totalPaid
  const fullyPaidSuppliers = suppliers.filter((s) => s.totalAmount === s.paidAmount).length

  // Get unique categories
  const categories = [...new Set(suppliers.map((s) => s.category))]

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    try {
      const supplier = {
        ...newSupplier,
        categoryType: "Supplier"
      };

      // Create contact
      const contactResponse = await axios.post(`${backEndURL}/api/contacts`, supplier);
      const contactId = contactResponse.data.id;

      // Create supplier record
      const supplierData = {
        contactId,
        purchaseId: null, // Will be set when first purchase is made
        totalAmount: 0,
        paidAmountTotal: 0,
        paidAmountHistory: [],
        pendingAmount: 0,
        status: "No Purchases"
      };

      await axios.post(`${backEndURL}/api/suppliers`, supplierData);

      setNewSupplier({
        name: "",
        email: "",
        phone: "",
        company: "",
        website: "",
        supplierNotes: "",
      });
      setShowAddForm(false);
      await fetchSuppliers();
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier({ ...supplier })
  }

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    try {
      // Update contact
      await axios.put(`${backEndURL}/api/contacts/${editingSupplier.id}`, editingSupplier);
      
      setEditingSupplier(null);
      await fetchSuppliers();
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        // Delete contact
        await axios.delete(`${backEndURL}/api/contacts/${id}`);
        
        // Delete supplier records
        const supplierRecords = await axios.get(`${backEndURL}/api/suppliers`);
        const recordsToDelete = supplierRecords.data.filter(record => record.contactId === id);
        
        await Promise.all(
          recordsToDelete.map(record => 
            axios.delete(`${backEndURL}/api/suppliers/${record.id}`)
          )
        );

        await fetchSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const handlePayment = (supplier, purchase, isFullPayment = false) => {
    setSelectedSupplier(supplier)
    setSelectedPurchase(purchase)
    setPaymentError("")
    setShowError(false)
    
    if (isFullPayment) {
      // Calculate pending amount
      const pendingAmount = purchase.amount - (supplierPaidAmounts[purchase.id] || 0)
      setPaymentForm({
        ...paymentForm,
        amount: pendingAmount > 0 ? pendingAmount.toString() : "0",
      })
      setIsFullPayMode(true)
    } else {
      setPaymentForm({
        ...paymentForm,
        amount: "",
      })
      setIsFullPayMode(false)
    }
    setShowPaymentModal(true)
  }

  const processPayment = async (e) => {
    e.preventDefault();
    const paymentAmount = Number.parseFloat(paymentForm.amount);
    const supplier = selectedSupplier;
    const purchase = selectedPurchase;

    if (paymentAmount <= 0) {
      setPaymentError("Invalid payment amount");
      setShowError(true);
      return;
    }

    // Check if payment amount exceeds pending amount
    const pendingAmount = purchase.amount - (supplierPaidAmounts[purchase.id] || 0);
    if (paymentAmount > pendingAmount) {
      setPaymentError(`Payment amount cannot exceed pending amount of ${formatCurrency(pendingAmount)}`);
      setShowError(true);
      return;
    }

    try {
      const paymentData = {
        amount: paymentAmount,
        method: paymentForm.method,
        cardLast4: paymentForm.method === "card" ? paymentForm.cardNumber.slice(-4) : null
      };

      // Add payment to supplier record using the new endpoint
      const response = await axios.post(`${backEndURL}/api/suppliers/payment/${purchase.id}`, paymentData);
      console.log('Payment processed:', response.data);

      // Immediately update the paid amounts state
      setSupplierPaidAmounts(prev => ({
        ...prev,
        [purchase.id]: (prev[purchase.id] || 0) + paymentAmount
      }));

      // Update payment history data
      setPaymentHistoryData(prev => ({
        ...prev,
        [purchase.id]: {
          ...prev[purchase.id],
          paymentHistory: [...(prev[purchase.id]?.paymentHistory || []), {
            id: Date.now().toString(),
            amount: paymentAmount,
            method: paymentForm.method,
            date: new Date().toISOString(),
            cardLast4: paymentData.cardLast4
          }],
          totalPaid: (prev[purchase.id]?.totalPaid || 0) + paymentAmount,
          pendingAmount: purchase.amount - ((prev[purchase.id]?.totalPaid || 0) + paymentAmount)
        }
      }));

      // Update suppliers state
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(s => {
          if (s.id === supplier.id) {
            return {
              ...s,
              purchases: s.purchases.map(p => {
                if (p.id === purchase.id) {
                  return {
                    ...p,
                    paidAmount: (p.paidAmount || 0) + paymentAmount,
                    pendingAmount: p.amount - ((p.paidAmount || 0) + paymentAmount),
                    status: p.amount - ((p.paidAmount || 0) + paymentAmount) === 0 ? "Paid" : "Pending",
                    paymentHistory: [...(p.paymentHistory || []), {
                      id: Date.now().toString(),
                      amount: paymentAmount,
                      method: paymentForm.method,
                      date: new Date().toISOString(),
                      cardLast4: paymentData.cardLast4
                    }]
                  };
                }
                return p;
              })
            };
          }
          return s;
        })
      );

      // Show success message
      setSuccessMessage(`Payment of ${formatCurrency(paymentAmount)} processed successfully!`);
      setShowSuccessMessage(true);

      // Close modal and reset form after 2 seconds
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentForm({
          amount: "",
          method: "cash",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          cardholderName: "",
        });
        setSelectedSupplier(null);
        setSelectedPurchase(null);
        setPaymentError("");
        setShowError(false);
        setShowSuccessMessage(false);
        setSuccessMessage("");
      }, 2000);

    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentError(error.response?.data?.error || "Failed to process payment. Please try again.");
      setShowError(true);
    }
  };

  const togglePaymentHistory = async (supplierId, purchaseId) => {
    try {
      console.log('Fetching payment history for:', { supplierId, purchaseId });
      const historyKey = `${supplierId}-${purchaseId || 'all'}`;
      
      // Fetch payment history from the endpoint
      const response = await axios.get(`${backEndURL}/api/suppliers/payment-history/${purchaseId}`);
      console.log('Payment history response:', response.data);

      // Fetch supplier data to get paidAmountTotal
      const supplierResponse = await axios.get(`${backEndURL}/api/suppliers`);
      const supplierData = supplierResponse.data.find(s => s.purchaseId === purchaseId);
      console.log('Supplier data:', supplierData);
      
      // Store payment history data in state
      setPaymentHistoryData(prev => ({
        ...prev,
        [purchaseId]: {
          paymentHistory: response.data.paymentHistory || [],
          totalPaid: supplierData?.paidAmountTotal || response.data.totalPaid || 0,
          pendingAmount: response.data.pendingAmount || 0,
          status: response.data.status || "Pending",
          totalAmount: response.data.totalAmount || 0
        }
      }));

      // Update the supplier's payment history in the state
      setSuppliers(prevSuppliers => 
        prevSuppliers.map(supplier => {
          if (supplier.id === supplierId) {
            console.log('Updating supplier:', supplier.id);
            const updatedPurchases = supplier.purchases.map(purchase => {
              if (purchase.id === purchaseId) {
                console.log('Updating purchase:', purchase.id);
                const updatedPurchase = {
                  ...purchase,
                  paymentHistory: response.data.paymentHistory || [],
                  paidAmount: supplierData?.paidAmountTotal || response.data.totalPaid || 0,
                  pendingAmount: response.data.pendingAmount || 0,
                  status: response.data.status || "Pending",
                  totalAmount: response.data.totalAmount || 0,
                  total: response.data.totalAmount || 0
                };
                console.log('Updated purchase data:', updatedPurchase);
                return updatedPurchase;
              }
              return purchase;
            });
            return { ...supplier, purchases: updatedPurchases };
          }
          return supplier;
        })
      );

      setShowPaymentHistory(prev => ({
        ...prev,
        [historyKey]: !prev[historyKey]
      }));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      alert('Failed to fetch payment history. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return `Rs ${(amount || 0).toLocaleString()}`
  }

  const renderPaymentHistory = (supplier, purchase) => {
    console.log('Rendering payment history for purchase:', purchase);
    
    // Get payment history data from state
    const historyData = paymentHistoryData[purchase.id] || {
      paymentHistory: [],
      totalPaid: 0,
      pendingAmount: 0,
      totalAmount: 0
    };

    // Ensure we have the correct data structure
    const paymentHistory = Array.isArray(historyData.paymentHistory) ? historyData.paymentHistory : [];
    const pendingAmount = Number(historyData.pendingAmount) || 0;
    const totalPaid = Number(historyData.totalPaid) || 0;
    const totalAmount = Number(historyData.totalAmount) || Number(purchase.total) || 0;

    console.log('Payment history data:', {
      purchaseId: purchase.id,
      paymentHistoryLength: paymentHistory.length,
      pendingAmount,
      totalPaid,
      totalAmount,
      paymentHistory
    });

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-white">Payment History for Purchase {purchase.id}</h4>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
              Paid: {formatCurrency(totalPaid)}
            </span>
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
              Pending: {formatCurrency(pendingAmount)}
            </span>
          </div>
        </div>
        {Array.isArray(paymentHistory) && paymentHistory.length > 0 ? (
          <div className="space-y-2">
            {paymentHistory
              .filter(payment => (Number(payment.amount) || 0) > 0)
              .map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between bg-gray-800 rounded p-3"
                >
                  <div className="flex items-center space-x-3">
                    {payment.method === "card" ? (
                      <CreditCard className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Banknote className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-sm text-gray-300">
                      {formatCurrency(payment.amount)} via {payment.method}
                      {payment.cardLast4 && ` (**** ${payment.cardLast4})`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(payment.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No payment history available for this purchase</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="px-6 py-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Purchase ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Notes
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Paid Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pending Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedSuppliers.map((supplier) => (
                  <React.Fragment key={supplier.id}>
                    {supplierPurchases[supplier.email]?.length > 0 ? (
                      supplierPurchases[supplier.email].map((purchase) => (
                        <React.Fragment key={`${supplier.id}-${purchase.id}`}>
                          <tr className="hover:bg-gray-700/50 transition-colors">
                           <td className="px-6 py-4">
                              <div className="text-sm text-gray-300">
                                {purchase.id}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">{supplier.name}</div>
                                <div className="text-sm text-gray-400">{supplier.company}</div>
                                {supplier.website && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-400">
                                    <Globe className="h-3 w-3" />
                                    <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                                      {supplier.website}
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-300">
                                <div className="flex items-center space-x-1 mb-1">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate max-w-xs">{supplier.email}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-3 w-3" />
                                  <span>{supplier.phone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-300">
                                {supplier.supplierNotes || '-'}
                              </div>
                            </td>
                           
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white">
                                {formatCurrency(purchase.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-green-400">
                                {formatCurrency(supplierPaidAmounts[purchase.id] || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-yellow-400">
                                {formatCurrency(purchase.amount - (supplierPaidAmounts[purchase.id] || 0))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                {purchase.amount - (supplierPaidAmounts[purchase.id] || 0) > 0 ? (
                                  <>
                                    <button
                                      onClick={() => handlePayment(supplier, purchase)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                      Pay
                                    </button>
                                    <button
                                      onClick={() => handlePayment(supplier, purchase, true)}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                    >
                                      Full Pay
                                    </button>
                                  </>
                                ) : (
                                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                    Paid
                                  </span>
                                )}
                                <button
                                  onClick={() => togglePaymentHistory(supplier.id, purchase.id)}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                                >
                                  <span>History</span>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform ${showPaymentHistory[`${supplier.id}-${purchase.id}`] ? "rotate-180" : ""}`}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {showPaymentHistory[`${supplier.id}-${purchase.id}`] && (
                            <tr className="bg-gray-700/30">
                              <td colSpan="8" className="px-6 py-4">
                                {renderPaymentHistory(supplier, purchase)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr className="hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{supplier.name}</div>
                            <div className="text-sm text-gray-400">{supplier.company}</div>
                            {supplier.website && (
                              <div className="flex items-center space-x-1 text-sm text-gray-400">
                                <Globe className="h-3 w-3" />
                                <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                                  {supplier.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            <div className="flex items-center space-x-1 mb-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-xs">{supplier.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{supplier.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            {supplier.supplierNotes || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">
                            -
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-white">
                            {formatCurrency(supplierTotals[supplier.email] || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-green-400">
                            {formatCurrency(supplierPaidAmounts[supplier.email] || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-yellow-400">
                            {formatCurrency((supplierTotals[supplier.email] || 0) - (supplierPaidAmounts[supplier.email] || 0))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            {(supplierTotals[supplier.email] || 0) - (supplierPaidAmounts[supplier.email] || 0) > 0 ? (
                              <>
                                <button
                                  onClick={() => handlePayment(supplier, null, true)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Full Pay
                                </button>
                              </>
                            ) : (
                              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                                Paid
                              </span>
                            )}
                            <button
                              onClick={() => togglePaymentHistory(supplier.id, 'all')}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                            >
                              <span>History</span>
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${showPaymentHistory[`${supplier.id}-all`] ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    {showPaymentHistory[`${supplier.id}-all`] && (
                      <tr className="bg-gray-700/30">
                        <td colSpan="8" className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-white">Payment History for All Purchases</h4>
                              <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                                {formatCurrency((supplierTotals[supplier.email] || 0) - (supplierPaidAmounts[supplier.email] || 0))} Pending
                              </span>
                            </div>
                            {supplier.paymentHistory?.length > 0 ? (
                              <div className="space-y-2">
                                {supplier.paymentHistory
                                  .filter(payment => (Number(payment.amount) || 0) > 0)
                                  .map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="flex items-center justify-between bg-gray-800 rounded p-3"
                                    >
                                      <div className="flex items-center space-x-3">
                                        {payment.method === "card" ? (
                                          <CreditCard className="h-4 w-4 text-blue-400" />
                                        ) : (
                                          <Banknote className="h-4 w-4 text-green-400" />
                                        )}
                                        <span className="text-sm text-gray-300">
                                          {formatCurrency(payment.amount)} via {payment.method}
                                          {payment.cardLast4 && ` (**** ${payment.cardLast4})`}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        <span>{payment.date}</span>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-gray-400 text-sm">No payment history available for all purchases</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {sortedSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No suppliers found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedSupplier && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Payment for {selectedSupplier.name}</h2>
            
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="mb-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-green-400 font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Purchase ID: <span className="text-white font-medium">{selectedPurchase.id}</span>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Total Amount: <span className="text-white font-medium">{formatCurrency(selectedPurchase.amount)}</span>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Paid Amount: <span className="text-green-400 font-medium">{formatCurrency(supplierPaidAmounts[selectedPurchase.id] || 0)}</span>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                Pending Amount:{" "}
                <span className="text-yellow-400 font-medium">
                  {formatCurrency(selectedPurchase.amount - (supplierPaidAmounts[selectedPurchase.id] || 0))}
                </span>
              </p>
            </div>

            <form onSubmit={processPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentForm.amount}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                    setShowError(false)
                    setPaymentError("")
                  }}
                  className={`w-full px-3 py-2 bg-gray-700 border ${showError ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  readOnly={isFullPayMode}
                />
                {isFullPayMode && (
                  <p className="text-xs text-blue-400 mt-1">Payment Amount is set to Pending Amount for Full Pay.</p>
                )}
                {showError && (
                  <div className="mt-2 p-2 bg-red-900/30 border border-red-500 rounded-lg">
                    <p className="text-sm text-red-400">{paymentError}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: "cash" })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${paymentForm.method === "cash"
                      ? "bg-green-600 border-green-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                  >
                    <Banknote className="h-4 w-4" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: "card" })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${paymentForm.method === "card"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Card</span>
                  </button>
                </div>
              </div>

              {paymentForm.method === "card" && (
                <div className="space-y-4 p-4 bg-gray-700 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-300">Card Details</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentForm.cardholderName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={paymentForm.cardNumber}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, cardNumber: e.target.value.replace(/\s/g, "") })
                      }
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  disabled={showSuccessMessage}
                >
                  {showSuccessMessage ? 'Processing...' : 'Process Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedSupplier(null);
                    setPaymentForm({
                      amount: "",
                      method: "cash",
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      cardholderName: "",
                    });
                    setShowSuccessMessage(false);
                    setSuccessMessage("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  disabled={showSuccessMessage}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Add New Supplier</h2>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={newSupplier.company}
                  onChange={(e) => setNewSupplier({ ...newSupplier, company: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={newSupplier.website}
                  onChange={(e) => setNewSupplier({ ...newSupplier, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={newSupplier.supplierNotes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, supplierNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Add Supplier
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit Supplier</h2>
            <form onSubmit={handleUpdateSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={editingSupplier.company}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, company: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  value={editingSupplier.website}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, website: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingSupplier.email}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={editingSupplier.phone}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                <textarea
                  value={editingSupplier.supplierNotes}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, supplierNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Update Supplier
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
