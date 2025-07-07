"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit2, Trash2, Search, Filter, X, Save, DollarSign, FileText, Loader2 } from "lucide-react"
import axios from "axios"
import { backEndURL } from "../Backendurl";
import * as XLSX from "xlsx"
import DotSpinner from "../loaders/Loader";

export default function CashbookApp() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openingBalance, setOpeningBalance] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [businessSettings, setBusinessSettings] = useState(null)

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

  // Add state for filter panel
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const rowsPerPage = 10

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

  // Utility to parse opening balance
  function parseOpeningBalance(val) {
    if (val === undefined || val === null || val === "") return 0;
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  }

  // Fetch opening balance from business settings and summary from backend
  useEffect(() => {
    const fetchBusinessSettingsAndSummary = async () => {
      try {
        // Fetch business settings for opening balance
        const businessSettingsRes = await axios.get(`${backEndURL}/api/business-settings`)
        const businessSettingsData = businessSettingsRes.data?.data
        setBusinessSettings(businessSettingsData)
        const openCash = parseOpeningBalance(businessSettingsData?.openCash)
        setOpeningBalance(openCash)

        // Fetch summary data
        const summaryRes = await axios.get(`${backEndURL}/api/additional`)
        setSummaryData(summaryRes.data)
      } catch (err) {
        console.error('Error fetching business settings or summary:', err)
        // If summary doesn't exist, create it with opening balance from business settings
        try {
          const businessSettingsRes = await axios.get(`${backEndURL}/api/business-settings`)
          const businessSettingsData = businessSettingsRes.data?.data
          setBusinessSettings(businessSettingsData)
          const openCash = parseOpeningBalance(businessSettingsData?.openCash)
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

  // Filtered and searched entries (reverse order: latest first)
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
    // Sort reverse chronologically (latest to oldest)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [entries, searchTerm, filters])

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const paginatedEntries = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    return filteredEntries.slice(start, start + rowsPerPage)
  }, [filteredEntries, page])

  // Calculate running balance for each entry (on the full filtered list, but display only paginated)
  const entriesWithBalance = useMemo(() => {
    if (!openingBalance) return filteredEntries.map(entry => ({ ...entry, balance: 0 }))
    let runningBalance = openingBalance
    // Since we reversed, calculate from the oldest to newest for correct running balance
    const chronological = [...filteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date))
    const balances = {}
    chronological.forEach(entry => {
      if (entry.type === "Cash In") {
        runningBalance += Number(entry.amount) || 0
      } else {
        runningBalance -= Number(entry.amount) || 0
      }
      balances[entry.voucher] = runningBalance
    })
    // Now, for the paginated (reversed) entries, assign the correct balance
    return paginatedEntries.map(entry => ({ ...entry, balance: balances[entry.voucher] }))
  }, [filteredEntries, paginatedEntries, openingBalance])

  // Get current balance
  const currentBalance = useMemo(() => {
    if (!openingBalance) return 0
    return entriesWithBalance.length > 0 
      ? entriesWithBalance[entriesWithBalance.length - 1].balance || 0
      : openingBalance
  }, [entriesWithBalance, openingBalance])

  // Calculate grand total balance for all filtered entries
  const grandTotalBalance = useMemo(() => {
    if (!businessSettings) return 0
    let runningBalance = parseOpeningBalance(businessSettings?.openCash)
    // Chronological order for correct running balance
    const chronological = [...filteredEntries].sort((a, b) => new Date(a.date) - new Date(b.date))
    chronological.forEach(entry => {
      if (entry.type === "Cash In") {
        runningBalance += Number(entry.amount) || 0
      } else {
        runningBalance -= Number(entry.amount) || 0
      }
    })
    return runningBalance
  }, [filteredEntries, businessSettings])

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

  // Excel export handler
  const handleExport = () => {
    // Prepare data for export
    const exportData = entriesWithBalance.map(entry => ({
      Date: new Date(entry.date).toLocaleDateString(),
      Particulars: entry.particulars,
      Voucher: entry.voucher,
      Type: entry.isReturn ? "Return" : entry.type,
      Amount: entry.amount,
      Mode: entry.mode,
      Category: entry.category,
      "New Opening Balance": entry.balance
    }))
    // Add summary row
    exportData.push({
      Date: "",
      Particulars: "",
      Voucher: "",
      Type: "",
      Amount: "",
      Mode: "",
      Category: "Total Balance (Rs)",
      "New Opening Balance": currentBalance
    })
    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Cashbook")
    // Export to file
    XLSX.writeFile(wb, `Cashbook_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  // Reset page to 1 when filters/search change
  useEffect(() => { setPage(1) }, [searchTerm, filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <DotSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-red-500 font-semibold">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
        {/* Opening balance warning */}
        {(!openingBalance || openingBalance === 0) && (
          <div className="mb-4 p-3 rounded bg-yellow-100 border border-yellow-300 text-yellow-800 flex items-center gap-2">
            <span className="font-bold">Warning:</span>
            Opening balance is missing or zero. Please set it in Business Settings.
          </div>
        )}
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-surface rounded-lg px-3 py-2 shadow border border-border">
            <Search className="text-muted w-5 h-5 mr-2" />
            <input
              type="text"
              placeholder="Search by particulars or voucher..."
              className="bg-transparent outline-none flex-1 text-text-primary placeholder:text-text-muted"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button
              className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition"
              onClick={() => setFilterPanelOpen(v => !v)}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-accent hover:bg-primary text-primary hover:text-white text-sm font-medium transition"
              onClick={clearFilters}
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface border border-border text-text-primary font-semibold shadow hover:bg-accent hover:text-primary transition"
              onClick={handleExport}
            >
              <FileText className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterPanelOpen && (
          <div className="bg-surface border border-border rounded-lg shadow p-4 mb-6 animate-fade-in flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-semibold text-text-secondary">Date From</label>
              <input type="date" className="bg-background border border-border rounded px-2 py-1" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-semibold text-text-secondary">Date To</label>
              <input type="date" className="bg-background border border-border rounded px-2 py-1" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-semibold text-text-secondary">Type</label>
              <select className="bg-background border border-border rounded px-2 py-1" value={filters.transactionType} onChange={e => setFilters(f => ({ ...f, transactionType: e.target.value }))}>
                <option value="">All</option>
                <option value="Cash In">Cash In</option>
                <option value="Cash Out">Cash Out</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-semibold text-text-secondary">Category</label>
              <select className="bg-background border border-border rounded px-2 py-1" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
                <option value="">All</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-semibold text-text-secondary">Payment Mode</label>
              <select className="bg-background border border-border rounded px-2 py-1" value={filters.paymentMode} onChange={e => setFilters(f => ({ ...f, paymentMode: e.target.value }))}>
                <option value="">All</option>
                {paymentModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Balance Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface rounded-lg p-4 border border-border shadow flex flex-col items-center">
            <h3 className="text-xs font-medium text-text-secondary mb-1">Opening Balance</h3>
            <p className="text-2xl font-bold text-primary">Rs {parseOpeningBalance(businessSettings?.openCash).toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border shadow flex flex-col items-center">
            <h3 className="text-xs font-medium text-text-secondary mb-1">Current Balance</h3>
            <p className="text-2xl font-bold text-accent">Rs {(summaryData?.currentBalance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border shadow flex flex-col items-center">
            <h3 className="text-xs font-medium text-text-secondary mb-1">Total Cash In</h3>
            <p className="text-2xl font-bold text-green-600">Rs {(summaryData?.totalCashIn || 0).toLocaleString()}</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border shadow flex flex-col items-center">
            <h3 className="text-xs font-medium text-text-secondary mb-1">Total Cash Out</h3>
            <p className="text-2xl font-bold text-red-500">Rs {(summaryData?.totalCashOut || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-surface rounded-lg border border-border shadow overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-primary text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Particulars</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Voucher</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount (Rs)</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Mode</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">New Opening Balance (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entriesWithBalance.map((entry, idx) => (
                <tr key={entry.voucher} className={
                  `transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-surface'} hover:bg-accent/20`
                }>
                  <td className="px-4 py-3 text-sm text-text-secondary">{new Date(entry.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-text-primary font-medium">{entry.particulars}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {entry.voucher}
                    {entry.isReturn && (
                      <span className="ml-2 text-xs text-red-400">↩️</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      entry.isReturn
                        ? "bg-red-100 text-red-600"
                        : entry.type === "Cash In"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {entry.isReturn ? "Return" : entry.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    entry.isReturn
                      ? "text-red-500"
                      : entry.type === "Cash In"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}>
                    Rs {(entry.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary capitalize">{entry.mode}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary capitalize">{entry.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-text-secondary">Rs {(entry.balance || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface border-t border-border">
                <td colSpan="7" className="px-4 py-3 text-right font-semibold text-text-primary">Total Balance (Rs)</td>
                <td className="px-4 py-3 text-sm font-bold text-primary">Rs {(grandTotalBalance || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          {filteredEntries.length === 0 && (
            <div className="text-center py-8 text-text-muted flex flex-col items-center">
              <DollarSign className="w-10 h-10 mb-2 text-accent" />
              <span>No entries found matching your criteria.</span>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-text-secondary">
              Showing <span className="font-semibold">{(page - 1) * rowsPerPage + 1}</span> to <span className="font-semibold">{Math.min(page * rowsPerPage, filteredEntries.length)}</span> of <span className="font-semibold">{filteredEntries.length}</span> entries
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded bg-surface border border-border text-text-secondary hover:bg-accent hover:text-primary disabled:opacity-50"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >First</button>
              <button
                className="px-3 py-1 rounded bg-surface border border-border text-text-secondary hover:bg-accent hover:text-primary disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >Prev</button>
              <span className="px-3 py-1 rounded bg-primary text-white font-semibold">{page}</span>
              <button
                className="px-3 py-1 rounded bg-surface border border-border text-text-secondary hover:bg-accent hover:text-primary disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >Next</button>
              <button
                className="px-3 py-1 rounded bg-surface border border-border text-text-secondary hover:bg-accent hover:text-primary disabled:opacity-50"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >Last</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
