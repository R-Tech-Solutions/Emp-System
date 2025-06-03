"use client"

import { useState, useMemo, useEffect } from "react"
import {
  createIncome,
  getAllIncomes,
  updateIncome,
  deleteIncome,
  createExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense
} from "../services/financeService"

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState("income")

  // Income State management
  const [incomes, setIncomes] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [incomesResponse, expensesResponse] = await Promise.all([
        getAllIncomes(),
        getAllExpenses()
      ])
      setIncomes(incomesResponse.data || [])
      setExpenses(expensesResponse.data || [])
    } catch (err) {
      setError(err.message || 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)

  // Pagination states
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(1)
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Sorting states
  const [incomeSortBy, setIncomeSortBy] = useState("date")
  const [incomeSortOrder, setIncomeSortOrder] = useState("desc")
  const [expenseSortBy, setExpenseSortBy] = useState("date")
  const [expenseSortOrder, setExpenseSortOrder] = useState("desc")

  // Filter states
  const [incomeFilters, setIncomeFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    receivedFrom: "",
    project: "",
    status: "",
    search: "",
  })

  const [expenseFilters, setExpenseFilters] = useState({
    dateFrom: "",
    dateTo: "",
    category: "",
    department: "",
    paidBy: "",
    status: "",
    search: "",
  })

  // Form states
  const [incomeFormData, setIncomeFormData] = useState({
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

  const [expenseFormData, setExpenseFormData] = useState({
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

  // Categories and options
  const incomeCategories = [
    "Sales",
    "Services",
    "Commissions",
    "Investments",
    "Donations",
    "Royalties",
    "Freelance",
    "Consulting",
  ]
  const expenseCategories = ["Travel", "Office", "Meals", "Software", "Utilities", "Marketing", "Training"]
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
  const departments = ["Sales", "Admin", "Engineering", "IT", "Marketing", "HR"]
  const paymentMethods = ["Cash","Card"]

  // Filter and sort incomes
  const filteredAndSortedIncomes = useMemo(() => {
    const filtered = incomes.filter((income) => {
      const matchesSearch =
        income.title.toLowerCase().includes(incomeFilters.search.toLowerCase()) ||
        income.receivedFrom.toLowerCase().includes(incomeFilters.search.toLowerCase()) ||
        income.description.toLowerCase().includes(incomeFilters.search.toLowerCase())
      const matchesCategory = !incomeFilters.category || income.category === incomeFilters.category
      const matchesReceivedFrom =
        !incomeFilters.receivedFrom ||
        income.receivedFrom.toLowerCase().includes(incomeFilters.receivedFrom.toLowerCase())
      const matchesProject = !incomeFilters.project || income.project === incomeFilters.project
      const matchesStatus = !incomeFilters.status || income.status === incomeFilters.status

      let matchesDateRange = true
      if (incomeFilters.dateFrom && incomeFilters.dateTo) {
        const incomeDate = new Date(income.date)
        const fromDate = new Date(incomeFilters.dateFrom)
        const toDate = new Date(incomeFilters.dateTo)
        matchesDateRange = incomeDate >= fromDate && incomeDate <= toDate
      }

      return (
        matchesSearch && matchesCategory && matchesReceivedFrom && matchesProject && matchesStatus && matchesDateRange
      )
    })

    filtered.sort((a, b) => {
      let aValue = a[incomeSortBy]
      let bValue = b[incomeSortBy]

      if (incomeSortBy === "amount") {
        aValue = Number.parseFloat(aValue)
        bValue = Number.parseFloat(bValue)
      } else if (incomeSortBy === "date") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (incomeSortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [incomes, incomeFilters, incomeSortBy, incomeSortOrder])

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(expenseFilters.search.toLowerCase()) ||
        expense.paidBy.toLowerCase().includes(expenseFilters.search.toLowerCase())
      const matchesCategory = !expenseFilters.category || expense.category === expenseFilters.category
      const matchesDepartment = !expenseFilters.department || expense.department === expenseFilters.department
      const matchesPaidBy =
        !expenseFilters.paidBy || expense.paidBy.toLowerCase().includes(expenseFilters.paidBy.toLowerCase())
      const matchesStatus = !expenseFilters.status || expense.status === expenseFilters.status

      let matchesDateRange = true
      if (expenseFilters.dateFrom && expenseFilters.dateTo) {
        const expenseDate = new Date(expense.date)
        const fromDate = new Date(expenseFilters.dateFrom)
        const toDate = new Date(expenseFilters.dateTo)
        matchesDateRange = expenseDate >= fromDate && expenseDate <= toDate
      }

      return matchesSearch && matchesCategory && matchesDepartment && matchesPaidBy && matchesStatus && matchesDateRange
    })

    filtered.sort((a, b) => {
      let aValue = a[expenseSortBy]
      let bValue = b[expenseSortBy]

      if (expenseSortBy === "amount") {
        aValue = Number.parseFloat(aValue)
        bValue = Number.parseFloat(bValue)
      } else if (expenseSortBy === "date") {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (expenseSortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [expenses, expenseFilters, expenseSortBy, expenseSortOrder])

  // Pagination
  const incomeTotalPages = Math.ceil(filteredAndSortedIncomes.length / itemsPerPage)
  const paginatedIncomes = filteredAndSortedIncomes.slice(
    (incomeCurrentPage - 1) * itemsPerPage,
    incomeCurrentPage * itemsPerPage,
  )

  const expenseTotalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage)
  const paginatedExpenses = filteredAndSortedExpenses.slice(
    (expenseCurrentPage - 1) * itemsPerPage,
    expenseCurrentPage * itemsPerPage,
  )

  // Calculate summary statistics
  const incomeSummary = useMemo(() => {
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

  const expenseSummary = useMemo(() => {
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

  // Chart data
  const incomeChartData = useMemo(() => {
    const categoryTotals = {}
    incomes.forEach((income) => {
      if (income.status === "Received") {
        categoryTotals[income.category] = (categoryTotals[income.category] || 0) + income.amount
      }
    })
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
  }, [incomes])

  const expenseChartData = useMemo(() => {
    const categoryTotals = {}
    expenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })
    return Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount }))
  }, [expenses])

  // Handle form submissions
  const handleIncomeSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editingIncome) {
        const response = await updateIncome(editingIncome.id, incomeFormData)
        setIncomes(incomes.map(income => 
          income.id === editingIncome.id ? response.data : income
        ))
      } else {
        const response = await createIncome(incomeFormData)
        setIncomes([...incomes, response.data])
      }
      resetIncomeForm()
    } catch (err) {
      setError(err.message || 'Error saving income')
    } finally {
      setLoading(false)
    }
  }

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (editingExpense) {
        const response = await updateExpense(editingExpense.id, expenseFormData)
        setExpenses(expenses.map(expense => 
          expense.id === editingExpense.id ? response.data : expense
        ))
      } else {
        const response = await createExpense(expenseFormData)
        setExpenses([...expenses, response.data])
      }
      resetExpenseForm()
    } catch (err) {
      setError(err.message || 'Error saving expense')
    } finally {
      setLoading(false)
    }
  }

  const resetIncomeForm = () => {
    setIncomeFormData({
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
    setShowIncomeModal(false)
  }

  const resetExpenseForm = () => {
    setExpenseFormData({
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
    setShowExpenseModal(false)
  }

  const handleIncomeEdit = (income) => {
    setIncomeFormData(income)
    setEditingIncome(income)
    setShowIncomeModal(true)
  }

  const handleExpenseEdit = (expense) => {
    setExpenseFormData(expense)
    setEditingExpense(expense)
    setShowExpenseModal(true)
  }

  const handleIncomeDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income record?")) {
      setLoading(true)
      setError(null)
      try {
        await deleteIncome(id)
        setIncomes(incomes.filter(income => income.id !== id))
      } catch (err) {
        setError(err.message || 'Error deleting income')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleExpenseDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setLoading(true)
      setError(null)
      try {
        await deleteExpense(id)
        setExpenses(expenses.filter(expense => expense.id !== id))
      } catch (err) {
        setError(err.message || 'Error deleting expense')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleIncomeSort = (column) => {
    if (incomeSortBy === column) {
      setIncomeSortOrder(incomeSortOrder === "asc" ? "desc" : "asc")
    } else {
      setIncomeSortBy(column)
      setIncomeSortOrder("asc")
    }
  }

  const handleExpenseSort = (column) => {
    if (expenseSortBy === column) {
      setExpenseSortOrder(expenseSortOrder === "asc" ? "desc" : "asc")
    } else {
      setExpenseSortBy(column)
      setExpenseSortOrder("asc")
    }
  }

  const exportToCSV = (type) => {
    if (type === "income") {
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
    } else {
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
  }

  // Calculate net profit
  const netProfit = incomeSummary.received - expenseSummary.approved

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          {error}
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">💰 Total Income</h3>
            <p className="text-2xl font-bold text-green-400">${incomeSummary.total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">💸 Total Expenses</h3>
            <p className="text-2xl font-bold text-red-400">${expenseSummary.total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">📊 Net Profit</h3>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${netProfit.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm text-gray-400">📈 Profit Margin</h3>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {incomeSummary.total > 0 ? ((netProfit / incomeSummary.total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("income")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "income"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            💰 Income Management
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "expenses"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            💸 Expense Management
          </button>
        </div>

        {/* Income Tab Content */}
        {activeTab === "income" && (
          <div>
            {/* Income Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">💰 Total Income</h3>
                <p className="text-2xl font-bold text-green-400">${incomeSummary.total.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">✅ Received</h3>
                <p className="text-2xl font-bold text-blue-400">${incomeSummary.received.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">🕗 Pending</h3>
                <p className="text-2xl font-bold text-yellow-400">${incomeSummary.pending.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">📅 This Month</h3>
                <p className="text-2xl font-bold text-purple-400">${incomeSummary.thisMonth.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">🔁 Recurring</h3>
                <p className="text-2xl font-bold text-indigo-400">${incomeSummary.recurring.toLocaleString()}</p>
              </div>
            </div>

            {/* Income Chart */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
              <div className="space-y-3">
                {incomeChartData.map((item, index) => (
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

            {/* Income Filters */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <input
                  type="text"
                  placeholder="Search income..."
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                  value={incomeFilters.search}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, search: e.target.value })}
                />
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFilters.dateFrom}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, dateFrom: e.target.value })}
                />
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFilters.dateTo}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, dateTo: e.target.value })}
                />
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFilters.category}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {incomeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFilters.project}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, project: e.target.value })}
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
                  value={incomeFilters.status}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <input
                  type="text"
                  placeholder="Received from..."
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                  value={incomeFilters.receivedFrom}
                  onChange={(e) => setIncomeFilters({ ...incomeFilters, receivedFrom: e.target.value })}
                />
              </div>
            </div>

            {/* Income Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowIncomeModal(true)}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <span>➕</span> Add Income
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV("income")}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
                >
                  Export CSV
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium">
                  Import CSV
                </button>
              </div>
            </div>

            {/* Income Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleIncomeSort("date")}
                      >
                        Date {incomeSortBy === "date" && (incomeSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleIncomeSort("title")}
                      >
                        Income Title {incomeSortBy === "title" && (incomeSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleIncomeSort("category")}
                      >
                        Source/Category {incomeSortBy === "category" && (incomeSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleIncomeSort("amount")}
                      >
                        Amount {incomeSortBy === "amount" && (incomeSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-3 text-left">Received From</th>
                      <th className="px-4 py-3 text-left">Payment Method</th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleIncomeSort("status")}
                      >
                        Status {incomeSortBy === "status" && (incomeSortOrder === "asc" ? "↑" : "↓")}
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
                              onClick={() => handleIncomeEdit(income)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleIncomeDelete(income.id)}
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

            {/* Income Pagination */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {(incomeCurrentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(incomeCurrentPage * itemsPerPage, filteredAndSortedIncomes.length)} of{" "}
                {filteredAndSortedIncomes.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIncomeCurrentPage(Math.max(1, incomeCurrentPage - 1))}
                  disabled={incomeCurrentPage === 1}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                {Array.from({ length: incomeTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setIncomeCurrentPage(page)}
                    className={`px-3 py-1 border border-gray-600 rounded ${
                      incomeCurrentPage === page ? "bg-green-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setIncomeCurrentPage(Math.min(incomeTotalPages, incomeCurrentPage + 1))}
                  disabled={incomeCurrentPage === incomeTotalPages}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab Content */}
        {activeTab === "expenses" && (
          <div>
            {/* Expense Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-400">${expenseSummary.total.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">Approved</h3>
                <p className="text-2xl font-bold text-blue-400">${expenseSummary.approved.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">Pending</h3>
                <p className="text-2xl font-bold text-yellow-400">${expenseSummary.pending.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">Rejected</h3>
                <p className="text-2xl font-bold text-red-400">${expenseSummary.rejected.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm text-gray-400">This Month</h3>
                <p className="text-2xl font-bold text-purple-400">${expenseSummary.thisMonth.toLocaleString()}</p>
              </div>
            </div>

            {/* Expense Chart */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
              <div className="flex flex-wrap gap-4">
                {expenseChartData.map((item, index) => (
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

            {/* Expense Filters */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">Filters & Search</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                  value={expenseFilters.search}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, search: e.target.value })}
                />
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFilters.dateFrom}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, dateFrom: e.target.value })}
                />
                <input
                  type="date"
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFilters.dateTo}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, dateTo: e.target.value })}
                />
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFilters.category}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFilters.department}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, department: e.target.value })}
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
                  value={expenseFilters.status}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input
                  type="text"
                  placeholder="Paid by..."
                  className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                  value={expenseFilters.paidBy}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, paidBy: e.target.value })}
                />
              </div>
            </div>

            {/* Expense Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowExpenseModal(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <span>➕</span> Add Expense
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV("expense")}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium"
                >
                  Export CSV
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium">
                  Import CSV
                </button>
              </div>
            </div>

            {/* Expense Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleExpenseSort("date")}
                      >
                        Date {expenseSortBy === "date" && (expenseSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleExpenseSort("title")}
                      >
                        Title {expenseSortBy === "title" && (expenseSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleExpenseSort("category")}
                      >
                        Category {expenseSortBy === "category" && (expenseSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleExpenseSort("amount")}
                      >
                        Amount {expenseSortBy === "amount" && (expenseSortOrder === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-3 text-left">Paid By</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-600"
                        onClick={() => handleExpenseSort("status")}
                      >
                        Status {expenseSortBy === "status" && (expenseSortOrder === "asc" ? "↑" : "↓")}
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
                              onClick={() => handleExpenseEdit(expense)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleExpenseDelete(expense.id)}
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

            {/* Expense Pagination */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing {(expenseCurrentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(expenseCurrentPage * itemsPerPage, filteredAndSortedExpenses.length)} of{" "}
                {filteredAndSortedExpenses.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpenseCurrentPage(Math.max(1, expenseCurrentPage - 1))}
                  disabled={expenseCurrentPage === 1}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Previous
                </button>
                {Array.from({ length: expenseTotalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setExpenseCurrentPage(page)}
                    className={`px-3 py-1 border border-gray-600 rounded ${
                      expenseCurrentPage === page ? "bg-blue-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setExpenseCurrentPage(Math.min(expenseTotalPages, expenseCurrentPage + 1))}
                  disabled={expenseCurrentPage === expenseTotalPages}
                  className="px-3 py-1 bg-gray-700 border border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingIncome ? "Edit Income" : "Add New Income"}</h2>
            <form onSubmit={handleIncomeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Income Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFormData.title}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Source/Category</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFormData.category}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {incomeCategories.map((cat) => (
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
                  value={incomeFormData.amount}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFormData.date}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Received From</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFormData.receivedFrom}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, receivedFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project/Department</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={incomeFormData.project}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, project: e.target.value })}
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
                  value={incomeFormData.paymentMethod}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, paymentMethod: e.target.value })}
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
                  value={incomeFormData.status}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Received">Received</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={incomeFormData.isRecurring}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, isRecurring: e.target.checked })}
                  />
                  <span className="text-sm">Recurring Income</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description / Notes</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  rows="3"
                  value={incomeFormData.description}
                  onChange={(e) => setIncomeFormData({ ...incomeFormData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-medium">
                  {editingIncome ? "Update" : "Add"} Income
                </button>
                <button
                  type="button"
                  onClick={resetIncomeForm}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingExpense ? "Edit Expense" : "Add New Expense"}</h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFormData.title}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map((cat) => (
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
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Paid By</label>
                <input
                  type="text"
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFormData.paidBy}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, paidBy: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  value={expenseFormData.department}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, department: e.target.value })}
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
                  value={expenseFormData.paymentMethod}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMethod: e.target.value })}
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
                  value={expenseFormData.status}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  rows="3"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium">
                  {editingExpense ? "Update" : "Add"} Expense
                </button>
                <button
                  type="button"
                  onClick={resetExpenseForm}
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

export default FinanceDashboard
