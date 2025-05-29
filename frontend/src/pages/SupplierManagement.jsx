"use client"

import { useState, useEffect } from "react"
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

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showPaymentHistory, setShowPaymentHistory] = useState({})

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
  }, [])

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/contacts')
      const supplierData = response.data.filter(contact => contact.categoryType === "Supplier")
      setSuppliers(supplierData)
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

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
  const totalAmount = suppliers.reduce((sum, supplier) => sum + supplier.totalAmount, 0)
  const totalPaid = suppliers.reduce((sum, supplier) => sum + supplier.paidAmount, 0)
  const totalPending = totalAmount - totalPaid
  const fullyPaidSuppliers = suppliers.filter((s) => s.totalAmount === s.paidAmount).length

  // Get unique categories
  const categories = [...new Set(suppliers.map((s) => s.category))]

  const handleAddSupplier = (e) => {
    e.preventDefault()
    const supplier = {
      ...newSupplier,
      id: Date.now(),
      paidAmount: 0,
      totalAmount: Number.parseFloat(newSupplier.totalAmount) || 0,
      paymentHistory: [],
    }
    setSuppliers([...suppliers, supplier])
    setNewSupplier({
      name: "",
      email: "",
      phone: "",
      address: "",
      totalAmount: 0,
      category: "Technology",
    })
    setShowAddForm(false)
  }

  const handleEditSupplier = (supplier) => {
    setEditingSupplier({ ...supplier })
  }

  const handleUpdateSupplier = (e) => {
    e.preventDefault()
    setSuppliers(
      suppliers.map((s) =>
        s.id === editingSupplier.id
          ? { ...editingSupplier, totalAmount: Number.parseFloat(editingSupplier.totalAmount) || 0 }
          : s,
      ),
    )
    setEditingSupplier(null)
  }

  const handleDeleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id))
    }
  }

  const handlePayment = (supplier, isFullPayment = false) => {
    setSelectedSupplier(supplier)
    if (isFullPayment) {
      setPaymentForm({
        ...paymentForm,
        amount: supplier.pendingAmount?.toString() || "0",
      })
    } else {
      setPaymentForm({
        ...paymentForm,
        amount: "",
      })
    }
    setShowPaymentModal(true)
  }

  const processPayment = (e) => {
    e.preventDefault()
    const paymentAmount = Number.parseFloat(paymentForm.amount)
    const supplier = selectedSupplier

    if (paymentAmount <= 0) {
      alert("Invalid payment amount")
      return
    }

    const newPayment = {
      id: Date.now(),
      amount: paymentAmount,
      method: paymentForm.method,
      date: new Date().toISOString().split("T")[0],
      ...(paymentForm.method === "card" && { cardLast4: paymentForm.cardNumber.slice(-4) }),
    }

    // Here you would typically make an API call to update the payment
    // For now, we'll just update the local state
    setSuppliers(
      suppliers.map((s) =>
        s.id === supplier.id
          ? {
              ...s,
              paymentHistory: [...(s.paymentHistory || []), newPayment],
            }
          : s,
      ),
    )

    setShowPaymentModal(false)
    setPaymentForm({
      amount: "",
      method: "cash",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    })
    setSelectedSupplier(null)
  }

  const togglePaymentHistory = (supplierId) => {
    setShowPaymentHistory((prev) => ({
      ...prev,
      [supplierId]: !prev[supplierId],
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Supplier Management</h1>
              <p className="text-gray-400">Manage your supplier contacts</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Suppliers</p>
                <p className="text-2xl font-bold text-white">{suppliers.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="h-8 w-8 bg-green-900/30 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPending)}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-900/30 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
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
                  <>
                    <tr key={supplier.id} className="hover:bg-gray-700/50 transition-colors">
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
                        <div className="text-sm font-medium text-white">-</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-green-400">-</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-yellow-400">-</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePayment(supplier)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => handlePayment(supplier, true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Full Pay
                          </button>
                          <button
                            onClick={() => togglePaymentHistory(supplier.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
                          >
                            <span>History</span>
                            <ChevronDown
                              className={`h-3 w-3 transition-transform ${showPaymentHistory[supplier.id] ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {showPaymentHistory[supplier.id] && (
                      <tr className="bg-gray-700/30">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-white">Payment History</h4>
                              {supplier.pendingAmount === 0 ? (
                                <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                  Fully Paid
                                </span>
                              ) : (
                                <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                                  {formatCurrency(supplier.pendingAmount)} Pending
                                </span>
                              )}
                            </div>
                            {supplier.paymentHistory?.length > 0 ? (
                              <div className="space-y-2">
                                {supplier.paymentHistory.map((payment) => (
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
                              <p className="text-gray-400 text-sm">No payment history available</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Payment for {selectedSupplier.name}</h2>
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">
                Pending Amount:{" "}
                <span className="text-yellow-400 font-medium">{formatCurrency(selectedSupplier.pendingAmount)}</span>
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
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: "cash" })}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      paymentForm.method === "cash"
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
                    className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                      paymentForm.method === "card"
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
                >
                  Process Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedSupplier(null)
                    setPaymentForm({
                      amount: "",
                      method: "cash",
                      cardNumber: "",
                      expiryDate: "",
                      cvv: "",
                      cardholderName: "",
                    })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
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
