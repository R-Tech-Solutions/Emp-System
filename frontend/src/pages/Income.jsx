"use client"

import { useState, useMemo } from "react"

const IncomePage = () => {
  // State management
  const [incomes, setIncomes] = useState([
    {
      id: 1,
      date: "2025-06-01",
      title: "Web Dev Project",
      category: "Services",
      amount: 1500,
      receivedFrom: "Client XYZ",
      paymentMethod: "Bank Transfer",
      status: "Received",
      project: "Website Redesign",
      description: "Complete website redesign and development",
      invoice: "INV-001.pdf",
      isRecurring: false,
    },
    {
      id: 2,
      date: "2025-06-02",
      title: "Affiliate Income",
      category: "Commissions",
      amount: 200,
      receivedFrom: "Partner ABC",
      paymentMethod: "PayPal",
      status: "Pending",
      project: "Marketing",
      description: "Monthly affiliate commission",
      invoice: "INV-002.pdf",
      isRecurring: true,
    },
    {
      id: 3,
      date: "2025-05-28",
      title: "Product Sales",
      category: "Sales",
      amount: 850,
      receivedFrom: "Customer DEF",
      paymentMethod: "Stripe",
      status: "Received",
      project: "E-commerce",
      description: "Online product sales",
      invoice: "INV-003.pdf",
      isRecurring: false,
    },
    {
      id: 4,
      date: "2025-05-25",
      title: "Consulting Fee",
      category: "Services",
      amount: 2000,
      receivedFrom: "Corp GHI",
      paymentMethod: "Bank Transfer",
      status: "Received",
      project: "Consulting",
      description: "Business strategy consulting",
      invoice: "INV-004.pdf",
      isRecurring: false,
    },
    {
      id: 5,
      date: "2025-05-20",
      title: "Investment Returns",
      category: "Investments",
      amount: 500,
      receivedFrom: "Investment Fund",
      paymentMethod: "Bank Transfer",
      status: "Received",
      project: "Investments",
      description: "Quarterly investment returns",
      invoice: "INV-005.pdf",
      isRecurring: true,
    },
    {
      id: 6,
      date: "2025-05-15",
      title: "Donation",
      category: "Donations",
      amount: 100,
      receivedFrom: "Anonymous",
      paymentMethod: "Cash",
      status: "Received",
      project: "General",
      description: "Charitable donation",
      invoice: "REC-006.pdf",
      isRecurring: false,
    },
    {
      id: 7,
      date: "2025-06-05",
      title: "License Fee",
      category: "Royalties",
      amount: 750,
      receivedFrom: "Tech Company",
      paymentMethod: "Wire Transfer",
      status: "Pending",
      project: "Licensing",
      description: "Software license fee",
      invoice: "INV-007.pdf",
      isRecurring: false,
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    receivedFrom: "",
    project: "",
    status: "",
    search: "",
  })

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: "",
    receivedFrom: "",
    project: "",
    description: "",
    paymentMethod: "",
    status: "Pending",
    isRecurring: false,
  })

  // Categories and options for dropdowns
  const categories = [
    "Sales",
    "Services",
    "Commissions",
    "Investments",
    "Donations",
    "Royalties",
    "Freelance",
    "Consulting",
  ]
  const projects = [
    "Website Redesign",
    "Marketing",
    "E-commerce",
    "Consulting",
    "Investments",
    "General",
    "Licensing",
    "Mobile App",
  ]
  const paymentMethods = ["Cash", "Bank Transfer", "PayPal", "Stripe", "Wire Transfer", "Check", "Crypto"]
  const statuses = ["Pending", "Received", "Cancelled"]

  // Filter and sort incomes
  const filteredAndSortedIncomes = useMemo(() => {
    const filtered = incomes.filter((income) => {
      const matchesSearch =
        income.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        income.receivedFrom.toLowerCase().includes(filters.search.toLowerCase()) ||
        income.description.toLowerCase().includes(filters.search.toLowerCase())
      const matchesCategory = !filters.category || income.category === filters.category
      const matchesReceivedFrom =
        !filters.receivedFrom || income.receivedFrom.toLowerCase().includes(filters.receivedFrom.toLowerCase())
      const matchesProject = !filters.project || income.project === filters.project
      const matchesStatus = !filters.status || income.status === filters.status

      let matchesDateRange = true
      if (filters.dateFrom && filters.dateTo) {
        const incomeDate = new Date(income.date)
        const fromDate = new Date(filters.dateFrom)
        const toDate = new Date(filters.dateTo)
        matchesDateRange = incomeDate >= fromDate && incomeDate <= toDate
      }

      return (
        matchesSearch && matchesCategory && matchesReceivedFrom && matchesProject && matchesStatus && matchesDateRange
      )
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "amount") {
        aValue = Number.parseFloat(aValue)
        bValue = Number.parseFloat(bValue)
      } else if (sortBy === "date") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [incomes, filters, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedIncomes.length / itemsPerPage)
  const paginatedIncomes = filteredAndSortedIncomes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = incomes.reduce((sum, income) => sum + income.amount, 0)
    const received = incomes.filter((i) => i.status === "Received").reduce((sum, income) => sum + income.amount, 0)
    const pending = incomes.filter((i) => i.status === "Pending").reduce((sum, income) => sum + income.amount, 0)
    const recurring = incomes
      .filter((i) => i.isRecurring && i.status === "Received")
      .reduce((sum, income) => sum + income.amount, 0)

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonth = incomes
      .filter((i) => {
        const incomeDate = new Date(i.date)
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear
      })
      .reduce((sum, income) => sum + income.amount, 0)

    return { total, received, pending, thisMonth, recurring }
  }, [incomes])

  // Chart data for category breakdown
  const chartData = useMemo(() => {
    const categoryTotals = {}
    incomes.forEach((income) => {
      if (income.status === "Received") {
        categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount
      }
    })
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
  }, [incomes])

  // Monthly income data for line chart
  const monthlyData = useMemo(() => {
    const monthlyTotals = {}
    incomes.forEach((income) => {
      if (income.status === "Received") {
        const month = new Date(income.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })
        monthlyTotals[month] = (monthlyTotals[month] || 0) + income.amount
      }
    })
    return Object.entries(monthlyTotals).map(([month, amount]) => ({ month, amount }))
  }, [incomes])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingIncome) {
      setIncomes(
        incomes.map((income) =>
          income.id === editingIncome.id
            ? { ...formData, id: editingIncome.id, amount: Number.parseFloat(formData.amount) }
            : income,
        ),
      )
    } else {
      const newIncome = {
        ...formData,
        id: Math.max(...incomes.map((i) => i.id)) + 1,
        amount: Number.parseFloat(formData.amount),
        invoice: `INV-${String(Math.max(...incomes.map((i) => i.id)) + 1).padStart(3, "0")}.pdf`,
      }
      setIncomes([...incomes, newIncome])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      amount: "",
      date: "",
      receivedFrom: "",
      project: "",
      description: "",
      paymentMethod: "",
      status: "Pending",
      isRecurring: false,
    })
    setEditingIncome(null)
    setShowModal(false)
  }

  const handleEdit = (income) => {
    setFormData(income)
    setEditingIncome(income)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      setIncomes(incomes.filter((income) => income.id !== id))
    }
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Title",
      "Category",
      "Amount",
      "Received From",
      "Payment Method",
      "Status",
      "Project",
      "Recurring",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedIncomes.map((income) =>
        [
          income.date,
          income.title,
          income.category,
          income.amount,
          income.receivedFrom,
          income.paymentMethod,
          income.status,
          income.project,
          income.isRecurring ? "Yes" : "No",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "income-records.csv"
    a.click()
  }

  const exportToPDF = () => {
    // Simple PDF export simulation
    const printContent = `
      <html>
        <head><title>Income Report</title></head>
        <body style="font-family: Arial, sans-serif; margin: 20px;">
          <h1>Income Report</h1>
          <h3>Summary</h3>
          <p>Total Income: $${summary.total.toLocaleString()}</p>
          <p>Received: $${summary.received.toLocaleString()}</p>
          <p>Pending: $${summary.pending.toLocaleString()}</p>
          <h3>Income Records</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Date</th><th>Title</th><th>Category</th><th>Amount</th><th>Status</th>
            </tr>
            ${filteredAndSortedIncomes
              .map(
                (income) => `
              <tr>
                <td>${income.date}</td>
                <td>${income.title}</td>
                <td>${income.category}</td>
                <td>$${income.amount.toLocaleString()}</td>
                <td>${income.status}</td>
              </tr>
            `,
              )
              .join("")}
          </table>
        </body>
      </html>
    `
    const printWindow = window.open("", "_blank")
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-sm text-gray-400 mb-2">
            <span>Dashboard</span> <span className="mx-2">{">"}</span>
            <span>Income</span> <span className="mx-2">{">"}</span>
            <span className="text-white">Advanced Income</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">Advanced Income</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">💰 Total Income</h3>
            <p className="text-2xl font-bold text-green-400">${summary.total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">✅ Received</h3>
            <p className="text-2xl font-bold text-blue-400">${summary.received.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">🕗 Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">${summary.pending.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">📅 This Month</h3>
            <p className="text-2xl font-bold text-purple-400">${summary.thisMonth.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">🔁 Recurring</h3>
            <p className="text-2xl font-bold text-indigo-400">${summary.recurring.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Category Breakdown */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded mr-3 bg-${["blue", "green", "yellow", "red", "purple", "pink", "indigo", "cyan"][index % 8]}-500`}
                    ></div>
                    <span className="text-sm">{item.category}</span>
                  </div>
                  <span className="font-semibold">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Monthly Income Trend</h3>
            <div className="space-y-3">
              {monthlyData.slice(-6).map((item, index) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm">{item.month}</span>
                  <div className="flex items-center">
                    <div
                      className="bg-green-500 h-2 rounded mr-2"
                      style={{ width: `${(item.amount / Math.max(...monthlyData.map((d) => d.amount))) * 100}px` }}
                    ></div>
                    <span className="font-semibold">${item.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <input
              type="text"
              placeholder="Search income..."
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <input
              type="date"
              placeholder="From Date"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <input
              type="date"
              placeholder="To Date"
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={filters.project}
              onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            >
              <option value="">All Projects</option>
              {projects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
            <select
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Received from..."
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              value={filters.receivedFrom}
              onChange={(e) => setFilters({ ...filters, receivedFrom: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span>➕</span> Add Income
          </button>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium">
              Export CSV
            </button>
            <button onClick={exportToPDF} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium">
              Export PDF
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium">Import CSV</button>
          </div>
        </div>

        {/* Income Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("date")}
                  >
                    Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("title")}
                  >
                    Income Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("category")}
                  >
                    Source/Category {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("amount")}
                  >
                    Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left">Received From</th>
                  <th className="px-4 py-3 text-left">Payment Method</th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("status")}
                  >
                    Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncomes.map((income) => (
                  <tr key={income.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3">{income.date}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{income.title}</div>
                      {income.isRecurring && (
                        <span className="text-xs text-blue-400 bg-blue-900 px-2 py-1 rounded-full">Recurring</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{income.category}</td>
                    <td className="px-4 py-3 font-semibold text-green-400">${income.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{income.receivedFrom}</td>
                    <td className="px-4 py-3">{income.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          income.status === "Received"
                            ? "bg-green-900 text-green-300"
                            : income.status === "Pending"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                        }`}
                      >
                        {income.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(income)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                        <button className="text-gray-400 hover:text-gray-300 text-sm">View</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-400">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredAndSortedIncomes.length)} of {filteredAndSortedIncomes.length}{" "}
            entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border border-gray-600 rounded ${
                  currentPage === page ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingIncome ? "Edit Income" : "Add New Income"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Income Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source/Category</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Received From</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.receivedFrom}
                  onChange={(e) => setFormData({ ...formData, receivedFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project/Department</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Select Payment Method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  />
                  <span className="text-sm">Recurring Income</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description / Notes</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium">
                  {editingIncome ? "Update" : "Add"} Income
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
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

export default IncomePage
