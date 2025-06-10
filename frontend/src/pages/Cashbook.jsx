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
  const [showOpeningBalanceModal, setShowOpeningBalanceModal] = useState(false)

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
    const fetchEntriesAndInvoices = async () => {
      try {
        setLoading(true)
        // Fetch cashbook entries
        const [cashbookRes, invoicesRes] = await Promise.all([
          axios.get(`${backEndURL}/api/cashbook`),
          axios.get(`${backEndURL}/api/invoices`)
        ])
        let cashbookEntries = cashbookRes.data
        let invoiceEntries = []
        // Fetch contacts for invoices with customer array
        for (const invoice of invoicesRes.data) {
          let particulars = null
          if (Array.isArray(invoice.customer) && invoice.customer.length > 0) {
            try {
              const contactId = invoice.customer[0]
              const contactRes = await axios.get(`${backEndURL}/api/contacts/${contactId}`)
              particulars = contactRes.data?.email || null
            } catch {
              particulars = null
            }
          }
          invoiceEntries.push({
            date: invoice.date,
            particulars,
            voucher: invoice.invoiceNumber,
            type: 'Cash In',
            amount: invoice.total,
            mode: Array.isArray(invoice.payments) && invoice.payments.length > 0 ? invoice.payments[0].method : '',
            category: 'POS',
          })
        }
        // Merge and sort by date
        const allEntries = [...cashbookEntries, ...invoiceEntries].sort((a, b) => new Date(a.date) - new Date(b.date))
        setEntries(allEntries)
        setError(null)
      } catch (err) {
        console.error('Error fetching cashbook/invoice entries:', err)
        setError('Failed to fetch cashbook/invoice entries')
      } finally {
        setLoading(false)
      }
    }

    fetchEntriesAndInvoices()
  }, [])

  // Fetch summary (Additional) from backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${backEndURL}/api/additional`)
        setSummaryData(res.data)
        setOpeningBalance(res.data.openingBalance)
        setShowOpeningBalanceModal(false)
      } catch (err) {
        // If not set, show modal
        setShowOpeningBalanceModal(true)
      }
    }
    fetchSummary()
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

  // Save opening balance to backend
  const saveOpeningBalance = async (balance) => {
    try {
      const numericBalance = Number(balance)
      const res = await axios.post(`${backEndURL}/api/additional/opening`, { openingBalance: numericBalance })
      setSummaryData(res.data)
      setOpeningBalance(numericBalance)
      setShowOpeningBalanceModal(false)
    } catch (err) {
      alert('Failed to set opening balance. It may already be set.')
    }
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
