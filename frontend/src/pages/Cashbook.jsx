"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Filter, X, Save, DollarSign, FileText } from "lucide-react"

export default function CashbookApp() {
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: "2024-01-15",
      particulars: "Opening Balance",
      voucherNumber: "OB001",
      transactionType: "cash-in",
      amount: 10000,
      paymentMode: "cash",
      category: "opening",
      balance: 10000,
    },
    {
      id: 2,
      date: "2024-01-16",
      particulars: "Sales Revenue",
      voucherNumber: "SR001",
      transactionType: "cash-in",
      amount: 2500,
      paymentMode: "cash",
      category: "sales",
      balance: 12500,
    },
    {
      id: 3,
      date: "2024-01-16",
      particulars: "Office Rent",
      voucherNumber: "EX001",
      transactionType: "cash-out",
      amount: 1500,
      paymentMode: "bank",
      category: "expense",
      balance: 11000,
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    transactionType: "",
    category: "",
    paymentMode: "",
  })

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    particulars: "",
    voucherNumber: "",
    transactionType: "cash-in",
    amount: "",
    paymentMode: "cash",
    category: "sales",
  })

  const categories = ["sales", "purchase", "expense", "investment", "opening", "other"]
  const paymentModes = ["cash", "bank", "upi", "cheque", "card"]

  // Calculate running balance for all entries
  const calculateBalances = (entriesList) => {
    let runningBalance = 0
    return entriesList
      .sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id)
      .map((entry) => {
        if (entry.transactionType === "cash-in") {
          runningBalance += entry.amount
        } else {
          runningBalance -= entry.amount
        }
        return { ...entry, balance: runningBalance }
      })
  }

  // Update balances whenever entries change
  useEffect(() => {
    setEntries((prevEntries) => calculateBalances(prevEntries))
  }, [])

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDateFrom = !filters.dateFrom || entry.date >= filters.dateFrom
      const matchesDateTo = !filters.dateTo || entry.date <= filters.dateTo
      const matchesType = !filters.transactionType || entry.transactionType === filters.transactionType
      const matchesCategory = !filters.category || entry.category === filters.category
      const matchesPaymentMode = !filters.paymentMode || entry.paymentMode === filters.paymentMode

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesType && matchesCategory && matchesPaymentMode
    })

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)
  }, [entries, searchTerm, filters])

  // Summary calculations
  const summary = useMemo(() => {
    const totalCashIn = entries
      .filter((entry) => entry.transactionType === "cash-in")
      .reduce((sum, entry) => sum + entry.amount, 0)

    const totalCashOut = entries
      .filter((entry) => entry.transactionType === "cash-out")
      .reduce((sum, entry) => sum + entry.amount, 0)

    const netBalance = totalCashIn - totalCashOut

    return { totalCashIn, totalCashOut, netBalance }
  }, [entries])
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      particulars: "",
      voucherNumber: "",
      transactionType: "cash-in",
      amount: "",
      paymentMode: "cash",
      category: "sales",
    })
    setEditingEntry(null)
    setShowModal(false)
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      transactionType: "",
      category: "",
      paymentMode: "",
    })
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="px-6 py-6">
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by particulars or voucher number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            {(searchTerm || Object.values(filters).some((f) => f)) && (
              <button
                onClick={clearFilters}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => setFilters((prev) => ({ ...prev, transactionType: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="cash-in">Cash In</option>
                  <option value="cash-out">Cash Out</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Payment Mode</label>
                <select
                  value={filters.paymentMode}
                  onChange={(e) => setFilters((prev) => ({ ...prev, paymentMode: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Modes</option>
                  {paymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Entries Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Particulars
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{entry.particulars}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.voucherNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.transactionType === "cash-in"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {entry.transactionType === "cash-in" ? "Cash In" : "Cash Out"}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        entry.transactionType === "cash-in" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ₹{entry.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.paymentMode}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.category}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-gray-400">No entries found matching your criteria.</div>
          )}
        </div>
      </div>
    </div>
  )
}
