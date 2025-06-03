"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Filter, X, Save, DollarSign, FileText } from "lucide-react"
import axios from "axios"

export default function CashbookApp() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openingBalance, setOpeningBalance] = useState(() => {
    const savedBalance = localStorage.getItem('cashbookOpeningBalance')
    return savedBalance ? Number(savedBalance) : null
  })
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(() => {
    return !localStorage.getItem('cashbookOpeningBalance')
  })

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

  // Fetch entries from API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:3001/api/cashbook')
        setEntries(response.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching cashbook entries:', err)
        setError('Failed to fetch cashbook entries')
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [])

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucher.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDateFrom = !filters.dateFrom || entry.date >= filters.dateFrom
      const matchesDateTo = !filters.dateTo || entry.date <= filters.dateTo
      const matchesType = !filters.transactionType || entry.type === filters.transactionType
      const matchesCategory = !filters.category || entry.category === filters.category
      const matchesPaymentMode = !filters.paymentMode || 
        entry.mode.toLowerCase().includes(filters.paymentMode.toLowerCase())

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesType && matchesCategory && matchesPaymentMode
    })

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [entries, searchTerm, filters])

  // Save opening balance to localStorage
  const saveOpeningBalance = (balance) => {
    const numericBalance = Number(balance)
    setOpeningBalance(numericBalance)
    localStorage.setItem('cashbookOpeningBalance', numericBalance.toString())
    setShowOpeningBalanceModal(false)
  }

  // Calculate running balance for each entry
  const entriesWithBalance = useMemo(() => {
    if (!openingBalance) return filteredEntries.map(entry => ({ ...entry, balance: 0 }))
    let runningBalance = openingBalance
    return filteredEntries.map(entry => {
      if (entry.type === "Cash In") {
        runningBalance += Number(entry.amount) || 0
      } else {
        runningBalance -= Number(entry.amount) || 0
      }
      return { ...entry, balance: runningBalance }
    })
  }, [filteredEntries, openingBalance])

  // Get current balance
  const currentBalance = useMemo(() => {
    if (!openingBalance) return 0
    return entriesWithBalance.length > 0 
      ? entriesWithBalance[entriesWithBalance.length - 1].balance || 0
      : openingBalance
  }, [entriesWithBalance, openingBalance])

  // Summary calculations
  const summary = useMemo(() => {
    const totalCashIn = entries
      .filter((entry) => entry.type === "Cash In")
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)

    const totalCashOut = entries
      .filter((entry) => entry.type === "Cash Out")
      .reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading cashbook entries...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Opening Balance Modal */}
      {showOpeningBalanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Set Opening Balance</h2>
            <p className="text-gray-300 mb-4">Please enter the initial opening balance for your cashbook.</p>
            <div className="flex flex-col gap-4">
              <input
                type="number"
                value={openingBalance || ''}
                onChange={(e) => setOpeningBalance(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter opening balance"
              />
              <button
                onClick={() => saveOpeningBalance(openingBalance || 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Opening Balance
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 py-6">
        {/* Balance Summary Card */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Opening Balance</h3>
              <p className="text-xl font-semibold text-white">₹{(openingBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Current Balance</h3>
              <p className="text-xl font-semibold text-white">₹{(currentBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Total Cash In</h3>
              <p className="text-xl font-semibold text-green-400">₹{(summary.totalCashIn || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Total Cash Out</h3>
              <p className="text-xl font-semibold text-red-400">₹{(summary.totalCashOut || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {entriesWithBalance.map((entry) => (
                  <tr key={entry.voucher} className="hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{entry.particulars}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{entry.voucher}</td> 
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.type === "Cash In"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        entry.type === "Cash In" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ₹{(entry.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.mode}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300">
                      ₹{(entry.balance || 0).toLocaleString()}
                    </td>
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
