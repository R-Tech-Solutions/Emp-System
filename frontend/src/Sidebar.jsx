"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  Search,
  Bell,
  HelpCircle,
  Keyboard,
  Star,
  Clock,
  Settings,
  User,
  Receipt,
  ChevronDown,
  Zap,
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
  Activity
} from "lucide-react";

import { logout, getUserData, hasPermission } from './utils/auth';

function Sidebar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    hrm: false,
    sales: false,
    quickActions: false
  });
  const [recentPages, setRecentPages] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  const toggleSection = (section) => {
    setOpenSections(prev => {
      const newState = {
        hrm: false,
        sales: false,
        quickActions: false
      };
      if (!prev[section]) {
        newState[section] = true;
      }
      return newState;
    });
  };

  // Track recent pages
  useEffect(() => {
    if (location.pathname !== "/") {
      setRecentPages(prev => {
        const newPages = [location.pathname, ...prev.filter(p => p !== location.pathname)].slice(0, 5);
        return newPages;
      });
    }
  }, [location.pathname]);

  const navItems = [
    {
      name: "Admin Dashboard",
      path: "/dashboard",
      icon: <Home className="w-5 h-5" />,
      description: "Overview and analytics",
      badge: "New",
      shortcut: "Ctrl+D"
    },
    { type: "header", name: "Human Resource", section: "hrm" },
    {
      name: "Sections",
      path: "/sections",
      icon: <Building className="w-5 h-5" />,
      section: "hrm",
      description: "Department management",
      shortcut: "Ctrl+S"
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Users className="w-5 h-5" />,
      section: "hrm",
      description: "Employee directory",
      shortcut: "Ctrl+E"
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <ClipboardList className="w-5 h-5" />,
      section: "hrm",
      description: "Task management",
      shortcut: "Ctrl+T"
    },
    {
      name: "Timesheets",
      path: "/timesheets",
      icon: <Clock className="w-5 h-5" />,
      section: "hrm",
      description: "Time tracking",
      shortcut: "Ctrl+H"
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <Activity className="w-5 h-5" />,
      section: "hrm",
      description: "Attendance tracking",
      shortcut: "Ctrl+A"
    },
    {
      name: "Leave Requests",
      path: "/leave-requests",
      icon: <Calendar className="w-5 h-5" />,
      section: "hrm",
      description: "Leave management",
      shortcut: "Ctrl+L"
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: <Wallet className="w-5 h-5" />,
      section: "hrm",
      description: "Salary processing",
      shortcut: "Ctrl+P"
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageCircle className="w-5 h-5" />,
      section: "hrm",
      description: "Internal messaging",
      shortcut: "Ctrl+M"
    },
    {
      name: "Assets",
      path: "/assets",
      icon: <Boxes className="w-5 h-5" />,
      section: "hrm",
      description: "Asset management",
      shortcut: "Ctrl+B"
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "hrm",
      description: "HR analytics",
      shortcut: "Ctrl+R"
    },

    {
      name: "Sales Overview",
      path: "/salesdashboard",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Sales performance",
      shortcut: "Ctrl+O"
    },
    { type: "header", name: "Sales & Inventory", section: "sales" },
    {
      name: "CRM",
      path: "/crm",
      icon: <Users className="w-5 h-5" />,
      section: "sales",
      description: "Customer management",
      shortcut: "Ctrl+C"
    },
    {
      name: "Products",
      path: "/products",
      icon: <Boxes className="w-5 h-5" />,
      section: "sales",
      description: "Product catalog",
      shortcut: "Ctrl+Q"
    },
    {
      name: "Quotation",
      path: "/quatation",
      icon: <FileText className="w-5 h-5" />,
      section: "sales",
      description: "Quote generation",
      shortcut: "Ctrl+U"
    },
    {
      name: "Purchase",
      path: "/purchase",
      icon: <ShoppingCart className="w-5 h-5" />,
      section: "sales",
      description: "Purchase orders",
      shortcut: "Ctrl+G"
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Boxes className="w-5 h-5" />,
      section: "sales",
      description: "Stock management",
      shortcut: "Ctrl+I"
    },
    {
      name: "Supplier",
      path: "/supplier",
      icon: <Truck className="w-5 h-5" />,
      section: "sales",
      description: "Supplier directory",
      shortcut: "Ctrl+Y"
    },
    {
      name: "Cashbook",
      path: "/cashbook",
      icon: <BookOpen className="w-5 h-5" />,
      section: "sales",
      description: "Financial records",
      shortcut: "Ctrl+K"
    },
    {
      name: "Income",
      path: "/income",
      icon: <DollarSign className="w-5 h-5" />,
      section: "sales",
      description: "Income tracking",
      shortcut: "Ctrl+N"
    },
    {
      name: "Sales Report",
      path: "/sales-report",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "sales",
      description: "Sales analytics",
      shortcut: "Ctrl+F"
    },
    {
      name: "RETURN",
      path: "/return-dashboard",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "sales",
      description: "Manage return dashboard",
      shortcut: "Ctrl+W"
    },
    {
      name: "CUSTOMER",
      path: "/customerAccounts",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "sales",
      description: "Manage customer accounts",
      shortcut: "Ctrl+X"
    },
  ];

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Global shortcuts (no modifier needed)
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowHelp(false);
        setShowShortcuts(false);
        setSearchQuery("");
      }

      // Shift shortcuts
      if (event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'p':
            if (hasPermission('invoice')) {
              navigate('/invoice');
            }
            break;
          case 'l':
            handleLogout();
            break;
          case 's':
            navigate('/buisness');
            break;
          case 'h':
            setShowHelp(!showHelp);
            break;
          case 'k':
            setShowShortcuts(!showShortcuts);
            break;
          case 'n':
            setShowNotifications(!showNotifications);
            break;
        }
      }

      // Ctrl shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'k':
            event.preventDefault();
            document.querySelector('input[placeholder="Search menu..."]')?.focus();
            break;
          case 'i':
            if (hasPermission('invoice')) {
              navigate('/invoice');
            }
            break;
          case 'e':
            navigate('/employees');
            break;
          case 't':
            navigate('/tasks');
            break;
          case 'd':
            navigate('/dashboard');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-surface text-text-primary shadow-md border border-border hover:bg-primary-light transition-colors"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Sidebar Container */}
      <div
        className={`fixed md:static z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:flex flex-col w-72 h-full bg-background border-r border-border shadow-lg`}
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
        />
      </div>
    </>
  );
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
  setSearchQuery
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
  const userEmail = userData?.email || sessionStorage.getItem("email") || "admin@example.com";

  // User Manual Dropdown State
  const [showManualMenu, setShowManualMenu] = useState(false);
  const manualMenuRef = React.useRef();

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (manualMenuRef.current && !manualMenuRef.current.contains(event.target)) {
        setShowManualMenu(false);
      }
    }
    if (showManualMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showManualMenu]);

  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };

  const toggleFavorite = (path) => {
    setFavorites(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  // Filter navigation items based on user permissions and search
  const filteredNavItems = navItems.filter(item => {
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
      "/customerAccounts": "customerAccounts"
    };

    const requiredPermission = pathToPermissionMap[item.path];
    if (!requiredPermission) return true;

    return hasPermission(requiredPermission);
  });

  // Filter by search query
  const searchFilteredItems = filteredNavItems.filter(item => {
    if (item.type === "header") return true;
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Group items by section
  const groupedItems = {};
  searchFilteredItems.forEach(item => {
    if (item.type === "header") {
      if (item.section) {
        groupedItems[item.section] = {
          header: item,
          items: []
        };
      }
    } else if (item.section && groupedItems[item.section]) {
      groupedItems[item.section].items.push(item);
    } else if (!item.section) {
      if (!groupedItems['main']) {
        groupedItems['main'] = { header: null, items: [] };
      }
      groupedItems['main'].items.push(item);
    }
  });

  const finalItems = [];
  Object.entries(groupedItems).forEach(([section, group]) => {
    if (group.items.length > 0) {
      if (group.header) {
        finalItems.push(group.header);
      }
      finalItems.push(...group.items);
    }
  });

  const isAdminOrSuperAdmin = userData?.role === "admin" || userData?.role === "super-admin" || (sessionStorage.getItem("email") === "info@rtechsl.lk" && sessionStorage.getItem("restrictedUser") === "true");

  return (
    <>
      {/* Header with Search */}
      <div className="p-4 border-b border-border bg-gradient-to-br from-primary-light via-surface to-accent/20">
        <div className="flex items-center gap-3 mb-4 relative">
          
          <div className="flex-1">
            <p className="font-semibold text-text-primary text-sm">Welcome back!</p>
            <p className="text-text-secondary text-xs truncate">{userEmail}</p>
          </div>
          {/* User Manual Icon */}
          <div className="relative" ref={manualMenuRef}>
            <button
              className="p-2 rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary"
              title="User Manuals"
              onClick={() => setShowManualMenu((prev) => !prev)}
            >
              <BookOpen className="w-5 h-5 text-primary" />
            </button>
            {showManualMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-primary-light text-text-primary rounded-t-lg"
                  onClick={() => { setShowManualMenu(false); navigate('/User-Hrm'); }}
                >
                  HRM User Manual
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-primary-light text-text-primary rounded-b-lg"
                  onClick={() => { setShowManualMenu(false); navigate('/User-Sales'); }}
                >
                  Sales User Manual
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search menu... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-border">
        {finalItems.map((item) => {
          if (item.type === "header") {
            if (item.section) {
              return (
                <div
                  key={item.name}
                  onClick={() => toggleSection(item.section)}
                  className="flex items-center justify-between px-4 py-3 mt-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-primary-light rounded-lg transition-all duration-200 group"
                >
                  <span className="group-hover:text-primary transition-colors">{item.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 group-hover:text-primary ${openSections[item.section] ? "transform rotate-180" : ""}`}
                  />
                </div>
              );
            }
            return (
              <div key={item.name} className="px-4 py-3 mt-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {item.name}
              </div>
            );
          }

          if (item.section && !openSections[item.section]) {
            return null;
          }

          const isFavorite = favorites.includes(item.path);
          const isRecent = recentPages.includes(item.path);

          return (
            <div key={item.name} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-300 relative group/item hover:shadow-md ${isActive
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg transform scale-[1.02] border-l-4 border-accent"
                    : "text-text-secondary hover:bg-gradient-to-r hover:from-primary-light hover:to-accent/20 hover:text-primary hover:border-l-4 hover:border-primary/30"
                  }`
                }
              >
                <div className="flex items-center flex-1">
                  <div className={`${location.pathname === item.path ? "text-white" : "text-primary"} transition-colors duration-200`}>
                    {item.icon}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full animate-pulse font-semibold">New</span>
                      )}
                      {item.count && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full font-medium">{item.count}</span>
                      )}
                      {item.section === "quickActions" && (
                        <Zap className="w-3 h-3 text-yellow-500 animate-pulse" />
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-text-secondary mt-0.5 opacity-75">{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all duration-200 transform translate-x-2 group-hover/item:translate-x-0">
                  {item.shortcut && (
                    <span className="text-xs text-text-secondary bg-surface px-1.5 py-0.5 rounded border shadow-sm">
                      {item.shortcut}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(item.path);
                    }}
                    className={`p-1 rounded transition-all duration-200 hover:scale-110 ${isFavorite ? "text-yellow-500" : "text-text-secondary hover:text-yellow-500"}`}
                    title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`w-3 h-3 ${isFavorite ? "fill-current" : ""}`} />
                  </button>
                </div>
              </NavLink>

              {/* Recent indicator */}
              {isRecent && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border bg-gradient-to-br from-surface via-primary-light/30 to-accent/10">
        <div className="flex items-center justify-start flex-wrap gap-2">
          {/* Admin-only buttons */}
          {isAdminOrSuperAdmin && (
            <>
              <NavLink
                to="/user"
                className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                title="User Management (Admin Only)"
              >
                <User className="w-4 h-4 mr-1" />
              </NavLink>
              <button
                onClick={() => navigate('/buisness')}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-500 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                title="Business Settings (Admin Only)"
              >
                <Settings className="w-4 h-4 mr-1" />
              </button>
            </>
          )}

          {/* Regular user buttons */}
          {hasPermission('my') && (
            <NavLink
              to="/my"
              className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 hover:shadow-md hover:scale-105"
              title="My Settings"
            >
              <User className="w-4 h-4 mr-1" />
            </NavLink>
          )}

          {hasPermission('invoice') && (
            <div className="relative group">
              <button
                onClick={() => navigate('/invoice')}
                className="flex items-center px-3 py-2 text-sm font-medium text-green-500 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200 hover:shadow-md hover:scale-105"
                title="Invoice"
              >
                <Receipt className="w-4 h-4 mr-1" />
              </button>
            </div>
          )}

          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-200 hover:shadow-md hover:scale-105"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-1" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Recent: {recentPages.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>Favorites: {favorites.length}</span>
            </div>
            <span className="text-primary font-medium bg-primary-light px-2 py-1 rounded-full text-xs">v2.0</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
