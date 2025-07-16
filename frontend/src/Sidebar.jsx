"use client"
import React, { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  LogOut,
  Search,
  Clock,
  Settings,
  User,
  Receipt,
  Home,
  Building,
  Users,
  ClipboardList,
  Calendar,
  Wallet,
  MessageCircle,
  BarChart2,
  FileText,
  ShoppingCart,
  Boxes,
  Truck,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { logout, getUserData, hasPermission } from "./utils/auth"

function Sidebar({ onModuleClick }) {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState({
    hrm: false,
    sales: false,
    quickActions: false,
  })
  const [recentPages, setRecentPages] = useState([])
  const [favorites, setFavorites] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const location = useLocation()

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const handleLogout = () => {
    try {
      logout()
    } catch (error) {
      console.error("Error during logout:", error)
      alert("An error occurred while logging out. Please try again.")
    }
  }

  const toggleSection = (section) => {
    setOpenSections((prev) => {
      const newState = {
        hrm: false,
        sales: false,
        quickActions: false,
      }
      if (!prev[section]) {
        newState[section] = true
      }
      return newState
    })
  }

  // Track recent pages
  useEffect(() => {
    if (location.pathname !== "/") {
      setRecentPages((prev) => {
        const newPages = [location.pathname, ...prev.filter((p) => p !== location.pathname)].slice(0, 5)
        return newPages
      })
    }
  }, [location.pathname])

  const navItems = [
    {
      name: "Admin Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      description: "Overview and analytics",
      badge: "New",
      shortcut: "Ctrl+D",
    },
    // Human Resource
    {
      name: "Sections",
      path: "/sections",
      icon: <Building className="w-5 h-5" />,
      description: "Department management",
      shortcut: "Ctrl+S",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Users className="w-5 h-5" />,
      description: "Employee directory",
      shortcut: "Ctrl+E",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <ClipboardList className="w-5 h-5" />,
      description: "Task management",
      shortcut: "Ctrl+T",
    },
    {
      name: "Timesheets",
      path: "/timesheets",
      icon: <Clock className="w-5 h-5" />,
      description: "Time tracking",
      shortcut: "Ctrl+H",
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <Activity className="w-5 h-5" />,
      description: "Attendance tracking",
      shortcut: "Ctrl+A",
    },
    {
      name: "Leave Requests",
      path: "/leave-requests",
      icon: <Calendar className="w-5 h-5" />,
      description: "Leave management",
      shortcut: "Ctrl+L",
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: <Wallet className="w-5 h-5" />,
      description: "Salary processing",
      shortcut: "Ctrl+P",
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageCircle className="w-5 h-5" />,
      description: "Internal messaging",
      shortcut: "Ctrl+M",
    },
    {
      name: "Assets",
      path: "/assets",
      icon: <Boxes className="w-5 h-5" />,
      description: "Asset management",
      shortcut: "Ctrl+B",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 className="w-5 h-5" />,
      description: "HR analytics",
      shortcut: "Ctrl+R",
    },
    // Sales & Inventory
    {
      name: "Sales Overview",
      path: "/salesdashboard",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Sales performance",
      shortcut: "Ctrl+O",
    },
    {
      name: "CRM",
      path: "/crm",
      icon: <Users className="w-5 h-5" />,
      description: "Customer management",
      shortcut: "Ctrl+C",
    },
    {
      name: "Products",
      path: "/products",
      icon: <Boxes className="w-5 h-5" />,
      description: "Product catalog",
      shortcut: "Ctrl+Q",
    },
    {
      name: "Quotation",
      path: "/quatation",
      icon: <FileText className="w-5 h-5" />,
      description: "Quote generation",
      shortcut: "Ctrl+U",
    },
    {
      name: "Purchase",
      path: "/purchase",
      icon: <ShoppingCart className="w-5 h-5" />,
      description: "Purchase orders",
      shortcut: "Ctrl+G",
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Boxes className="w-5 h-5" />,
      description: "Stock management",
      shortcut: "Ctrl+I",
    },
    {
      name: "Supplier",
      path: "/supplier",
      icon: <Truck className="w-5 h-5" />,
      description: "Supplier directory",
      shortcut: "Ctrl+Y",
    },
    {
      name: "Cashbook",
      path: "/cashbook",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Financial records",
      shortcut: "Ctrl+K",
    },
    {
      name: "Income",
      path: "/income",
      icon: <DollarSign className="w-5 h-5" />,
      description: "Income tracking",
      shortcut: "Ctrl+N",
    },
    {
      name: "Sales Report",
      path: "/sales-report",
      icon: <BarChart2 className="w-5 h-5" />,
      description: "Sales analytics",
      shortcut: "Ctrl+F",
    },
  ]

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Global shortcuts (no modifier needed)
      if (event.key === "Escape") {
        setShowNotifications(false)
        setShowHelp(false)
        setShowShortcuts(false)
        setSearchQuery("")
      }

      // Shift shortcuts
      if (event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case "p":
            if (hasPermission("invoice")) {
              navigate("/invoice")
            }
            break
          case "l":
            handleLogout()
            break
          case "s":
            navigate("/buisness")
            break
          case "h":
            setShowHelp(!showHelp)
            break
          case "k":
            setShowShortcuts(!showShortcuts)
            break
          case "n":
            setShowNotifications(!showNotifications)
            break
        }
      }

      // Ctrl shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case "k":
            event.preventDefault()
            document.querySelector('input[placeholder="Search menu..."]')?.focus()
            break
          case "i":
            if (hasPermission("invoice")) {
              navigate("/invoice")
            }
            break
          case "e":
            navigate("/employees")
            break
          case "t":
            navigate("/tasks")
            break
          case "d":
            navigate("/sidebar")
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [navigate])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 shadow-2xl border border-slate-200/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-200/50"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-gradient-to-br from-slate-900/60 via-blue-900/40 to-indigo-900/60 backdrop-blur-sm transition-all duration-500 ease-out md:hidden ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar Container */}
      <div
        className={`fixed inset-0 z-50 transform transition-all duration-500 ease-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } flex flex-col w-screen h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border-r border-slate-200/50 shadow-2xl backdrop-blur-xl`}
      >
        <SidebarContent
          navItems={navItems}
          openSections={openSections}
          toggleSection={toggleSection}
          recentPages={recentPages}
          favorites={favorites}
          setFavorites={setFavorites}
          showNotifications={showNotifications}
          showHelp={showHelp}
          showShortcuts={showShortcuts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onModuleClick={onModuleClick}
        />
      </div>
    </>
  )
}

function SidebarContent({
  navItems,
  openSections,
  toggleSection,
  recentPages,
  favorites,
  setFavorites,
  showNotifications,
  showHelp,
  showShortcuts,
  searchQuery,
  setSearchQuery,
  onModuleClick,
}) {
  // All hooks at the top!
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeTimeout = useRef(null);
  const navigate = useNavigate()
  const location = useLocation()
  const userData = getUserData()
  const userEmail = userData?.email || sessionStorage.getItem("email") || "admin@example.com"

  // Debug: log permissions
  console.log("User permissions:", userData?.permissions);

  // Helper for permission check
  function hasModulePermission(key) {
    if (userData?.role === "admin" || userData?.role === "super-admin") return true;
    return userData?.permissions && userData.permissions[key] === true;
  }

  // Human Resource and Sales & Inventory modules
  const humanResourceModules = [
    { name: "Sections", icon: <Building className="w-6 h-6" />, path: "/sections", desc: "Department management", color: "blue", key: "sections" },
    { name: "Employees", icon: <Users className="w-6 h-6" />, path: "/employees", desc: "Employee directory", color: "indigo", key: "employees" },
    { name: "Tasks", icon: <ClipboardList className="w-6 h-6" />, path: "/tasks", desc: "Task management", color: "purple", key: "tasks" },
    { name: "Timesheets", icon: <Clock className="w-6 h-6" />, path: "/timesheets", desc: "Time tracking", color: "pink", key: "timesheets" },
    { name: "Attendance", icon: <Activity className="w-6 h-6" />, path: "/attendance", desc: "Attendance tracking", color: "rose", key: "attendance" },
    { name: "Leave Requests", icon: <Calendar className="w-6 h-6" />, path: "/leave-requests", desc: "Leave management", color: "orange", key: "leave-requests" },
    { name: "Payroll", icon: <Wallet className="w-6 h-6" />, path: "/payroll", desc: "Salary processing", color: "amber", key: "payroll" },
    { name: "Messages", icon: <MessageCircle className="w-6 h-6" />, path: "/messages", desc: "Internal messaging", color: "yellow", key: "messages" },
    { name: "Assets", icon: <Boxes className="w-6 h-6" />, path: "/assets", desc: "Asset management", color: "lime", key: "assets" },
    { name: "Reports", icon: <BarChart2 className="w-6 h-6" />, path: "/reports", desc: "HR analytics", color: "green", key: "reports" },
  ];
  const salesInventoryModules = [
    { name: "CRM", icon: <Users className="w-6 h-6" />, path: "/crm", desc: "Customer management", color: "green", key: "crm" },
    { name: "Inventory", icon: <Boxes className="w-6 h-6" />, path: "/inventory", desc: "Stock management", color: "emerald", key: "inventory" },
    { name: "Purchase", icon: <ShoppingCart className="w-6 h-6" />, path: "/purchase", desc: "Purchase orders", color: "teal", key: "purchase" },
    { name: "Products", icon: <Boxes className="w-6 h-6" />, path: "/products", desc: "Product catalog", color: "cyan", key: "products" },
    { name: "Quotation", icon: <FileText className="w-6 h-6" />, path: "/quatation", desc: "Quote generation", color: "sky", key: "quatation" },
    { name: "Supplier", icon: <Truck className="w-6 h-6" />, path: "/supplier", desc: "Supplier directory", color: "blue", key: "supplier" },
    { name: "Cashbook", icon: <BookOpen className="w-6 h-6" />, path: "/cashbook", desc: "Financial records", color: "indigo", key: "cashbook" },
    { name: "Income", icon: <DollarSign className="w-6 h-6" />, path: "/income", desc: "Income tracking", color: "purple", key: "income" },
    { name: "Sales Report", icon: <BarChart2 className="w-6 h-6" />, path: "/sales-report", desc: "Sales analytics", color: "pink", key: "sales-report" },
    { name: "Customer", icon: <Users className="w-6 h-6" />, path: "/customerAccounts", desc: "Manage customer accounts", color: "rose", key: "customerAccounts" },
    { name: "Return", icon: <TrendingUp className="w-6 h-6" />, path: "/return-dashboard", desc: "Manage return dashboard", color: "orange", key: "return-dashboard" },
  ];

  // User Manual Dropdown State
  const [showManualMenu, setShowManualMenu] = useState(false)
  const manualMenuRef = React.useRef()

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (manualMenuRef.current && !manualMenuRef.current.contains(event.target)) {
        setShowManualMenu(false)
      }
    }
    if (showManualMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showManualMenu])

  const handleLogout = () => {
    try {
      logout()
    } catch (error) {
      console.error("Error during logout:", error)
      alert("An error occurred while logging out. Please try again.")
    }
  }

  const toggleFavorite = (path) => {
    setFavorites((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  // Handler to open sidebar
  const handleOpenSidebar = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsSidebarOpen(true);
  };
  // Handler to close sidebar (with delay)
  const handleCloseSidebar = () => {
    closeTimeout.current = setTimeout(() => setIsSidebarOpen(false), 200);
  };
  // Cancel close if mouse re-enters
  const handleCancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  // Filter navigation items based on user permissions and search
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-yellow-50">
        <div className="p-8 bg-white rounded-xl shadow-lg border border-yellow-200 text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Session Expired</h2>
          <p className="text-yellow-600 mb-4">User session not found. Please log in again.</p>
          <a href="/login" className="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Go to Login</a>
        </div>
      </div>
    );
  }
  const filteredNavItems = navItems.filter((item) => {
    if (userData?.role === "admin" || userData?.role === "super-admin") return true
    const pathToPermissionMap = {
      "/dashboard": "dashboard",
      "/sections": "sections",
      "/employees": "employees",
      "/tasks": "tasks",
      "/timesheets": "timesheets",
      "/attendance": "attendance",
      "/leave-requests": "leave-requests",
      "/payroll": "payroll",
      "/messages": "messages",
      "/assets": "assets",
      "/user": "user",
      "/my": "my",
      "/reports": "reports",
      "/salesdashboard": "salesdashboard",
      "/crm": "crm",
      "/products": "products",
      "/quatation": "quatation",
      "/purchase": "purchase",
      "/inventory": "inventory",
      "/supplier": "supplier",
      "/cashbook": "cashbook",
      "/income": "income",
      "/invoice": "invoice",
      "/sales-report": "sales-report",
      "/return-dashboard": "return-dashboard",
      "/customerAccounts": "customerAccounts",
    }
    const requiredPermission = pathToPermissionMap[item.path]
    if (!requiredPermission) return true
    // Explicit permission check: only show if permission is true
    return userData && userData.permissions && userData.permissions[requiredPermission] === true
  })

  // Filter by search query
  const searchFilteredItems = filteredNavItems.filter((item) => {
    if (item.type === "header") return true
    if (!searchQuery) return true
    return (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Group items by section
  const groupedItems = {}
  searchFilteredItems.forEach((item) => {
    if (item.type === "header") {
      if (item.section) {
        groupedItems[item.section] = {
          header: item,
          items: [],
        }
      }
    } else if (item.section && groupedItems[item.section]) {
      groupedItems[item.section].items.push(item)
    } else if (!item.section) {
      if (!groupedItems["main"]) {
        groupedItems["main"] = { header: null, items: [] }
      }
      groupedItems["main"].items.push(item)
    }
  })

  const finalItems = []
  Object.entries(groupedItems).forEach(([section, group]) => {
    if (group.items.length > 0) {
      if (group.header) {
        finalItems.push(group.header)
      }
      finalItems.push(...group.items)
    }
  })

  const isAdminOrSuperAdmin =
    userData?.role === "admin" ||
    userData?.role === "super-admin" ||
    (sessionStorage.getItem("email") === "info@rtechsl.lk" && sessionStorage.getItem("restrictedUser") === "true")

  const isAdmin = userData?.role === "admin";
  const isSuperAdmin = userData?.role === "super-admin";

  return (
    <>
      <div className="flex h-full w-full">
        {/* Main Sidebar (left) */}
        <div className="flex flex-col h-full w-full">
          {/* Header with Search */}
          <div className="p-6 border-b border-slate-200/50 bg-gradient-to-br from-blue-600/10 via-indigo-50/80 to-purple-50/60 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-6 relative">
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back!
                </p>
                <p className="text-slate-600 text-sm truncate font-medium">{userEmail}</p>
              </div>
              {/* User Manual Icon */}
              <div className="relative" ref={manualMenuRef}>
                <button
                  className="p-3 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 focus:outline-none focus:ring-4 focus:ring-blue-200/50 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-200/50 border border-slate-200/50"
                  title="User Manuals"
                  onClick={() => setShowManualMenu((prev) => !prev)}
                >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </button>
                {showManualMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-slate-200/50 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-2 duration-300 overflow-hidden">
                    <button
                      className="w-full text-left px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 transition-all duration-200 font-medium border-b border-slate-100/50"
                      onClick={() => {
                        setShowManualMenu(false)
                        navigate("/User-Hrm")
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-blue-500" />
                        HRM User Manual
                      </div>
                    </button>
                    <button
                      className="w-full text-left px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-slate-700 hover:text-blue-700 transition-all duration-200 font-medium"
                      onClick={() => {
                        setShowManualMenu(false)
                        navigate("/User-Sales")
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        Sales User Manual
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Enhanced Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search menu... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-sm bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-300/50 transition-all duration-300 hover:border-blue-300/50 hover:bg-white/90 placeholder-slate-400 font-medium shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors duration-200 text-xl font-bold"
                >
                  ×
                </button>
              )}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 px-4 py-6">
            {/* Top row: Admin Dashboard and Sales Overview */}
            <div className="flex justify-center items-center gap-4 mb-6">
              {navItems.filter(item => ["Admin Dashboard", "Sales Overview"].includes(item.name)).map(item => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-40 h-28 bg-white/90 border border-slate-200/50 rounded-xl shadow hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 m-0 p-2 ${isActive ? "bg-blue-100 border-blue-400" : "hover:bg-blue-50"}`
                  }
                  title={item.name}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-1 flex items-center justify-center">{item.icon}</div>
                    <span className="text-base font-bold text-center leading-tight">{item.name}</span>
                    <span className="text-xs text-slate-500 text-center leading-tight mt-1">{item.description}</span>
                  </div>
                </NavLink>
              ))}
            </div>
            {/* Unified Modules Section (excluding Admin Dashboard and Sales Overview) */}
            <div className="flex flex-wrap justify-center items-center gap-4 w-full">
              {navItems.filter(item => {
                if (["Admin Dashboard", "Sales Overview"].includes(item.name)) return false;
                if (userData?.role === "admin" || userData?.role === "super-admin") return true;
                const pathToPermissionMap = {
                  "/dashboard": "dashboard",
                  "/sections": "sections",
                  "/employees": "employees",
                  "/tasks": "tasks",
                  "/timesheets": "timesheets",
                  "/attendance": "attendance",
                  "/leave-requests": "leave-requests",
                  "/payroll": "payroll",
                  "/messages": "messages",
                  "/assets": "assets",
                  "/user": "user",
                  "/my": "my",
                  "/reports": "reports",
                  "/salesdashboard": "salesdashboard",
                  "/crm": "crm",
                  "/products": "products",
                  "/quatation": "quatation",
                  "/purchase": "purchase",
                  "/inventory": "inventory",
                  "/supplier": "supplier",
                  "/cashbook": "cashbook",
                  "/income": "income",
                  "/invoice": "invoice",
                  "/sales-report": "sales-report",
                  "/return-dashboard": "return-dashboard",
                  "/customerAccounts": "customerAccounts",
                };
                const requiredPermission = pathToPermissionMap[item.path];
                if (!requiredPermission) return true;
                return userData && userData.permissions && userData.permissions[requiredPermission] === true;
              }).map((item, idx) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center w-32 h-28 bg-white/90 border border-slate-200/50 rounded-xl shadow hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 m-0 p-2 ${isActive ? "bg-blue-100 border-blue-400" : "hover:bg-blue-50"}`
                  }
                  title={item.name}
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-1 flex items-center justify-center">{item.icon}</div>
                    <span className="text-sm font-bold text-center leading-tight">{item.name}</span>
                    <span className="text-xs text-slate-500 text-center leading-tight mt-1">{item.description}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right Action Panel */}
          {/* Hot zone at right edge to trigger sidebar */}
          <div
            className="fixed right-0 top-0 h-screen w-3 z-50 cursor-pointer"
            style={{ background: 'transparent' }}
            onMouseEnter={handleOpenSidebar}
            onMouseLeave={handleCancelClose}
          />
          {/* Collapsible Right Sidebar (hover-triggered) */}
          <div
            className={`fixed right-0 top-1/2 ${isSidebarOpen ? "w-20" : "w-0"} -translate-y-1/2 flex flex-col items-center bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200/50 z-50 rounded-l-3xl transition-all duration-200 ease-in-out overflow-hidden`}
            style={{ minHeight: isSidebarOpen ? "auto" : "3rem" }}
            onMouseEnter={handleOpenSidebar}
            onMouseLeave={handleCloseSidebar}
          >
            {isSidebarOpen && (
              <div className="flex flex-col items-center justify-center gap-4 p-4">
                {/* User Management (admin and super-admin only) */}
                {(isAdmin || isSuperAdmin) && (
                  <div className="group relative">
                    <NavLink
                      to="/user"
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 hover:from-blue-100 hover:to-indigo-200 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/50"
                      title="User Management"
                    >
                      <User className="w-5 h-5" />
                    </NavLink>
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                        User Management
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                      </div>
                    </div>
                  </div>
                )}
                {/* Business Settings (super-admin only) */}
                {isSuperAdmin && (
                  <div className="group relative">
                    <button
                      onClick={() => navigate("/buisness")}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 text-purple-600 hover:from-purple-100 hover:to-violet-200 hover:text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50"
                      title="Business Settings"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                        Business Settings
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                      </div>
                    </div>
                  </div>
                )}
                {/* My Profile (all users) */}
                <div className="group relative">
                  <NavLink
                    to="/my"
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 hover:from-green-100 hover:to-emerald-200 hover:text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200/50"
                    title="My Profile"
                  >
                    <User className="w-5 h-5" />
                  </NavLink>
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                      My Profile
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                    </div>
                  </div>
                </div>
                {hasPermission("invoice") && (
                  <div className="group relative">
                    <button
                      onClick={() => navigate("/invoice")}
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-600 hover:from-amber-100 hover:to-yellow-200 hover:text-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-amber-200/50"
                      title="Invoice"
                    >
                      <Receipt className="w-5 h-5" />
                    </button>
                    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                      <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                        Invoice
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-2" />
                <div className="group relative">
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600 hover:from-red-100 hover:to-rose-200 hover:text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-200/50"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                  <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                    <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                      Logout
                      <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function RightSidebar({ isAdmin, isSuperAdmin, hasPermission, handleLogout, navigate }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeTimeout = useRef(null);

  // Handler to open sidebar
  const handleOpenSidebar = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsSidebarOpen(true);
  };
  // Handler to close sidebar (with delay)
  const handleCloseSidebar = () => {
    closeTimeout.current = setTimeout(() => setIsSidebarOpen(false), 200);
  };
  // Cancel close if mouse re-enters
  const handleCancelClose = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  return (
    <>
      {/* Hot zone at right edge to trigger sidebar */}
      <div
        className="fixed right-0 top-0 h-screen w-3 z-50 cursor-pointer"
        style={{ background: 'transparent' }}
        onMouseEnter={handleOpenSidebar}
        onMouseLeave={handleCancelClose}
      />
      {/* Collapsible Right Sidebar (hover-triggered) */}
      <div
        className={`fixed right-0 top-1/2 ${isSidebarOpen ? "w-20" : "w-0"} -translate-y-1/2 flex flex-col items-center bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-200/50 z-50 rounded-l-3xl transition-all duration-200 ease-in-out overflow-hidden`}
        style={{ minHeight: isSidebarOpen ? "auto" : "3rem" }}
        onMouseEnter={handleOpenSidebar}
        onMouseLeave={handleCloseSidebar}
      >
        {isSidebarOpen && (
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            {/* User Management (admin and super-admin only) */}
            {(isAdmin || isSuperAdmin) && (
              <div className="group relative">
                <NavLink
                  to="/user"
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 hover:from-blue-100 hover:to-indigo-200 hover:text-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-blue-200/50"
                  title="User Management"
                >
                  <User className="w-5 h-5" />
                </NavLink>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                    User Management
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                  </div>
                </div>
              </div>
            )}
            {/* Business Settings (super-admin only) */}
            {isSuperAdmin && (
              <div className="group relative">
                <button
                  onClick={() => navigate("/buisness")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 text-purple-600 hover:from-purple-100 hover:to-violet-200 hover:text-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50"
                  title="Business Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                    Business Settings
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                  </div>
                </div>
              </div>
            )}
            {/* My Profile (all users) */}
            <div className="group relative">
              <NavLink
                to="/my"
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 hover:from-green-100 hover:to-emerald-200 hover:text-green-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-green-200/50"
                title="My Profile"
              >
                <User className="w-5 h-5" />
              </NavLink>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                  My Profile
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                </div>
              </div>
            </div>
            {hasPermission("invoice") && (
              <div className="group relative">
                <button
                  onClick={() => navigate("/invoice")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 text-amber-600 hover:from-amber-100 hover:to-yellow-200 hover:text-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-amber-200/50"
                  title="Invoice"
                >
                  <Receipt className="w-5 h-5" />
                </button>
                <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                    Invoice
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                  </div>
                </div>
              </div>
            )}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent my-2" />
            <div className="group relative">
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600 hover:from-red-100 hover:to-rose-200 hover:text-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-200/50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-slate-800/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-xl shadow-xl border border-slate-600/50 whitespace-nowrap font-medium">
                  Logout
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-slate-800/90 rotate-45" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;
