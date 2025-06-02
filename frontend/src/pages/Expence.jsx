"use client"

import { useState, useMemo } from "react"

const ExpensesPage = () => {
  // State management
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: "2025-06-01",
      title: "Flight to NYC",
      category: "Travel",
      amount: 500,
      paidBy: "John D.",
      department: "Sales",
      status: "Approved",
      paymentMethod: "Card",
      description: "Business trip to meet clients",
      receipt: "receipt1.pdf",
    },
    {
      id: 2,
      date: "2025-06-01",
      title: "Printer Ink",
      category: "Office",
      amount: 30,
      paidBy: "Sarah K.",
      department: "Admin",
      status: "Pending",
      paymentMethod: "Cash",
      description: "Office supplies for printer",
      receipt: "receipt2.pdf",
    },
    {
      id: 3,
      date: "2025-05-28",
      title: "Team Lunch",
      category: "Meals",
      amount: 120,
      paidBy: "Mike R.",
      department: "Engineering",
      status: "Approved",
      paymentMethod: "Card",
      description: "Team building lunch",
      receipt: "receipt3.pdf",
    },
    {
      id: 4,
      date: "2025-05-25",
      title: "Software License",
      category: "Software",
      amount: 299,
      paidBy: "Lisa M.",
      department: "IT",
      status: "Rejected",
      paymentMethod: "Bank",
      description: "Annual software subscription",
      receipt: "receipt4.pdf",
    },
    {
      id: 5,
      date: "2025-05-20",
      title: "Office Rent",
      category: "Utilities",
      amount: 2500,
      paidBy: "Admin",
      department: "Admin",
      status: "Approved",
      paymentMethod: "Bank",
      description: "Monthly office rent payment",
      receipt: "receipt5.pdf",
    },
  ])

  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    department: "",
    paidBy: "",
    status: "",
    search: "",
  })

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    amount: "",
    date: "",
    paidBy: "",
    department: "",
    description: "",
    paymentMethod: "",
    status: "Pending",
  })

  // Categories and departments for dropdowns
  const categories = ["Travel", "Office", "Meals", "Software", "Utilities", "Marketing", "Training"]
  const departments = ["Sales", "Admin", "Engineering", "IT", "Marketing", "HR"]
  const paymentMethods = ["Cash", "Card", "Bank"]
  const statuses = ["Pending", "Approved", "Rejected"]

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        expense.paidBy.toLowerCase().includes(filters.search.toLowerCase())
      const matchesCategory = !filters.category || expense.category === filters.category
      const matchesDepartment = !filters.department || expense.department === filters.department
      const matchesPaidBy = !filters.paidBy || expense.paidBy.toLowerCase().includes(filters.paidBy.toLowerCase())
      const matchesStatus = !filters.status || expense.status === filters.status

      let matchesDateRange = true
      if (filters.dateFrom && filters.dateTo) {
        const expenseDate = new Date(expense.date)
        const fromDate = new Date(filters.dateFrom)
        const toDate = new Date(filters.dateTo)
        matchesDateRange = expenseDate >= fromDate && expenseDate <= toDate
      }

      return matchesSearch && matchesCategory && matchesDepartment && matchesPaidBy && matchesStatus && matchesDateRange
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
  }, [expenses, filters, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredAndSortedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const approved = expenses.filter((e) => e.status === "Approved").reduce((sum, expense) => sum + expense.amount, 0)
    const pending = expenses.filter((e) => e.status === "Pending").reduce((sum, expense) => sum + expense.amount, 0)
    const rejected = expenses.filter((e) => e.status === "Rejected").reduce((sum, expense) => sum + expense.amount, 0)

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const thisMonth = expenses
      .filter((e) => {
        const expenseDate = new Date(e.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
      .reduce((sum, expense) => sum + expense.amount, 0)

    return { total, approved, pending, rejected, thisMonth }
  }, [expenses])

  // Chart data for category breakdown
  const chartData = useMemo(() => {
    const categoryTotals = {}
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
  }, [expenses])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingExpense) {
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id
            ? { ...formData, id: editingExpense.id, amount: Number.parseFloat(formData.amount) }
            : expense,
        ),
      )
    } else {
      const newExpense = {
        ...formData,
        id: Math.max(...expenses.map((e) => e.id)) + 1,
        amount: Number.parseFloat(formData.amount),
      }
      setExpenses([...expenses, newExpense])
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      amount: "",
      date: "",
      paidBy: "",
      department: "",
      description: "",
      paymentMethod: "",
      status: "Pending",
    })
    setEditingExpense(null)
    setShowModal(false)
  }

  const handleEdit = (expense) => {
    setFormData(expense)
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((expense) => expense.id !== id))
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
    const headers = ["Date", "Title", "Category", "Amount", "Paid By", "Department", "Status", "Payment Method"]
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedExpenses.map((expense) =>
        [
          expense.date,
          expense.title,
          expense.category,
          expense.amount,
          expense.paidBy,
          expense.department,
          expense.status,
          expense.paymentMethod,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "expenses.csv"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <nav className="text-sm text-gray-400 mb-2">
            <span>Dashboard</span> <span className="mx-2">{">"}</span>
            <span>Expenses</span> <span className="mx-2">{">"}</span>
            <span className="text-white">Advanced Expenses</span>
          </nav>
          <h1 className="text-3xl font-bold text-white">Advanced Expenses</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">Total Expenses</h3>
            <p className="text-2xl font-bold text-green-400">${summary.total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">Approved</h3>
            <p className="text-2xl font-bold text-blue-400">${summary.approved.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">Pending</h3>
            <p className="text-2xl font-bold text-yellow-400">${summary.pending.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">Rejected</h3>
            <p className="text-2xl font-bold text-red-400">${summary.rejected.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">This Month</h3>
            <p className="text-2xl font-bold text-purple-400">${summary.thisMonth.toLocaleString()}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          <div className="flex flex-wrap gap-4">
            {chartData.map((item, index) => (
              <div key={item.category} className="flex items-center">
                <div
                  className={`w-4 h-4 rounded mr-2 bg-${["blue", "green", "yellow", "red", "purple", "pink", "indigo"][index % 7]}-500`}
                ></div>
                <span className="text-sm">
                  {item.category}: ${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <input
              type="text"
              placeholder="Search expenses..."
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
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
              placeholder="Paid by..."
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
              value={filters.paidBy}
              onChange={(e) => setFilters({ ...filters, paidBy: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span>➕</span> Add Expense
          </button>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium">
              Export CSV
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium">Import CSV</button>
          </div>
        </div>

        {/* Expenses Table */}
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
                    Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("category")}
                  >
                    Category {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                    onClick={() => handleSort("amount")}
                  >
                    Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-4 py-3 text-left">Paid By</th>
                  <th className="px-4 py-3 text-left">Department</th>
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
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-gray-700 hover:bg-gray-750">
                    <td className="px-4 py-3">{expense.date}</td>
                    <td className="px-4 py-3 font-medium">{expense.title}</td>
                    <td className="px-4 py-3">{expense.category}</td>
                    <td className="px-4 py-3 font-semibold">${expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{expense.paidBy}</td>
                    <td className="px-4 py-3">{expense.department}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.status === "Approved"
                            ? "bg-green-900 text-green-300"
                            : expense.status === "Pending"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
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
            {Math.min(currentPage * itemsPerPage, filteredAndSortedExpenses.length)} of{" "}
            {filteredAndSortedExpenses.length} entries
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
                  currentPage === page ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"
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
            <h2 className="text-xl font-bold mb-4">{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
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
                <label className="block text-sm font-medium mb-1">Paid By</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.paidBy}
                  onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
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
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium">
                  {editingExpense ? "Update" : "Add"} Expense
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

export default ExpensesPage
