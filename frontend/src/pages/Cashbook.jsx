"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Filter, X, Save, DollarSign, FileText } from "lucide-react"
import axios from "axios"
import { backEndURL } from "../Backendurl";

export default function CashbookApp() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openingBalance, setOpeningBalance] = useState(null)
  const [summaryData, setSummaryData] = useState(null)

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
        // Fetch cashbook entries (now includes invoices and return invoices)
        const cashbookRes = await axios.get(`${backEndURL}/api/cashbook`)
        const allEntries = cashbookRes.data.sort((a, b) => new Date(a.date) - new Date(b.date))
        setEntries(allEntries)
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

  // Fetch opening balance from business settings and summary from backend
  useEffect(() => {
    const fetchBusinessSettingsAndSummary = async () => {
      try {
        // Fetch business settings for opening balance
        const businessSettingsRes = await axios.get(`${backEndURL}/api/business-settings`)
        const businessSettings = businessSettingsRes.data?.data
        const openCash = businessSettings?.openCash ? Number(businessSettings.openCash) : 0
        setOpeningBalance(openCash)

        // Fetch summary data
        const summaryRes = await axios.get(`${backEndURL}/api/additional`)
        setSummaryData(summaryRes.data)
      } catch (err) {
        console.error('Error fetching business settings or summary:', err)
        // If summary doesn't exist, create it with opening balance from business settings
        try {
          const businessSettingsRes = await axios.get(`${backEndURL}/api/business-settings`)
          const businessSettings = businessSettingsRes.data?.data
          const openCash = businessSettings?.openCash ? Number(businessSettings.openCash) : 0
          setOpeningBalance(openCash)
          
          // Create summary with opening balance
          const summaryRes = await axios.post(`${backEndURL}/api/additional/opening`, { 
            openingBalance: openCash 
          })
          setSummaryData(summaryRes.data)
        } catch (summaryErr) {
          console.error('Error creating summary:', summaryErr)
          setOpeningBalance(0)
        }
      }
    }
    fetchBusinessSettingsAndSummary()
  }, [])

  // Filtered and searched entries
  const filteredEntries = useMemo(() => {
    const filtered = entries.filter((entry) => {
      const matchesSearch =
        (entry.particulars ? entry.particulars.toLowerCase() : "").includes(searchTerm.toLowerCase()) ||
        (entry.voucher ? entry.voucher.toLowerCase() : "").includes(searchTerm.toLowerCase())

      const matchesDateFrom = !filters.dateFrom || entry.date >= filters.dateFrom
      const matchesDateTo = !filters.dateTo || entry.date <= filters.dateTo
      const matchesType = !filters.transactionType || entry.type === filters.transactionType
      const matchesCategory = !filters.category || entry.category === filters.category
      const matchesPaymentMode = !filters.paymentMode || 
        (entry.mode ? entry.mode.toLowerCase() : "").includes(filters.paymentMode.toLowerCase())

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesType && matchesCategory && matchesPaymentMode
    })

    // Sort chronologically (oldest to newest)
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [entries, searchTerm, filters])

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

  // Update summary in backend whenever entries change
  useEffect(() => {
    if (!summaryData) return
    const totalCashIn = entries.filter(e => e.type === 'Cash In').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const totalCashOut = entries.filter(e => e.type === 'Cash Out').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    const currentBalance = (summaryData.openingBalance || 0) + totalCashIn - totalCashOut
    axios.put(`${backEndURL}/api/additional/summary`, {
      currentBalance,
      totalCashIn,
      totalCashOut
    }).then(res => setSummaryData(res.data)).catch(() => {})
  }, [entries, summaryData?.openingBalance])

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
      <div className="px-6 py-6">
        {/* Balance Summary Card */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Opening Balance</h3>
              <p className="text-xl font-semibold text-white">Rs {(summaryData?.openingBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Current Balance</h3>
              <p className="text-xl font-semibold text-white">Rs {(summaryData?.currentBalance || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Total Cash In</h3>
              <p className="text-xl font-semibold text-green-400">Rs {(summaryData?.totalCashIn || 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-300">Total Cash Out</h3>
              <p className="text-xl font-semibold text-red-400">Rs {(summaryData?.totalCashOut || 0).toLocaleString()}</p>
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
                    Amount (Rs)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    New Opening Balance (Rs)
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
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {entry.voucher}
                      {entry.isReturn && (
                        <span className="ml-2 text-xs text-red-400">↩️</span>
                      )}
                    </td> 
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.isReturn 
                            ? "bg-red-900 text-red-300" // Return invoices in red
                            : entry.type === "Cash In"
                              ? "bg-green-900 text-green-300" // Regular invoices in green
                              : "bg-red-900 text-red-300" // Other cash out in red
                        }`}
                      >
                        {entry.isReturn ? "Return" : entry.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-medium ${
                        entry.isReturn 
                          ? "text-red-400" // Return invoices in red
                          : entry.type === "Cash In" 
                            ? "text-green-400" // Regular invoices in green
                            : "text-red-400" // Other cash out in red
                      }`}
                    >
                      Rs {(entry.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.mode}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 capitalize">{entry.category}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-300">
                      Rs {(entry.balance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-900 border-t border-gray-700">
                  <td colSpan="7" className="px-4 py-3 text-right font-semibold text-gray-200">Total Balance (Rs)</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">
                    Rs {(currentBalance || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
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
