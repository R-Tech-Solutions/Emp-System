"use client";

import { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext.jsx";
import {
  MenuIcon,
  XIcon,
  LogoutIcon,
  MoonIcon,
  SunIcon,
} from "./icons.jsx";

import {
  Home,
  Building2,
  User,
  Users,
  ListChecks,
  Clock,
  CalendarCheck2,
  Wallet,
  MessageCircle,
  BarChart2,
  FileSignature,
  ShoppingCart,
  Boxes,
  Truck,
  BookOpen,
  Receipt,
  DollarSign,
  ChevronDown,
  Settings,
  TrendingUp,
  Activity,
  Zap,
  Clock as ClockIcon
} from "lucide-react";

import { logout, getUserData, hasPermission } from './utils/auth';

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
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
      badge: "New"
    },
    { type: "header", name: "Human Resource", section: "hrm" },
    {
      name: "Sections",
      path: "/sections",
      icon: <Building2 className="w-5 h-5" />,
      section: "hrm",
      description: "Department management"
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Users className="w-5 h-5" />,
      section: "hrm",
      description: "Employee directory",
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <ListChecks className="w-5 h-5" />,
      section: "hrm",
      description: "Task management",
    },
    {
      name: "Timesheets",
      path: "/timesheets",
      icon: <Clock className="w-5 h-5" />,
      section: "hrm",
      description: "Time tracking"
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <Activity className="w-5 h-5" />,
      section: "hrm",
      description: "Attendance tracking"
    },
    {
      name: "Leave Requests",
      path: "/leave-requests",
      icon: <CalendarCheck2 className="w-5 h-5" />,
      section: "hrm",
      description: "Leave management",
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: <Wallet className="w-5 h-5" />,
      section: "hrm",
      description: "Salary processing"
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageCircle className="w-5 h-5" />,
      section: "hrm",
      description: "Internal messaging",
    },
    {
      name: "Assets",
      path: "/assets",
      icon: <Boxes className="w-5 h-5" />,
      section: "hrm",
      description: "Asset management"
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "hrm",
      description: "HR analytics"
    },

    {
      name: "Sales Overview",
      path: "/salesdashboard",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Sales performance"
    },
    { type: "header", name: "Sales & Inventory", section: "sales" },
    {
      name: "CRM",
      path: "/crm",
      icon: <Users className="w-5 h-5" />,
      section: "sales",
      description: "Customer management"
    },
    {
      name: "Products",
      path: "/products",
      icon: <Boxes className="w-5 h-5" />,
      section: "sales",
      description: "Product catalog"
    },
    {
      name: "Quotation",
      path: "/quatation",
      icon: <FileSignature className="w-5 h-5" />,
      section: "sales",
      description: "Quote generation"
    },
    {
      name: "Purchase",
      path: "/purchase",
      icon: <ShoppingCart className="w-5 h-5" />,
      section: "sales",
      description: "Purchase orders"
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Boxes className="w-5 h-5" />,
      section: "sales",
      description: "Stock management"
    },
    {
      name: "Supplier",
      path: "/supplier",
      icon: <Truck className="w-5 h-5" />,
      section: "sales",
      description: "Supplier directory"
    },
    {
      name: "Cashbook",
      path: "/cashbook",
      icon: <BookOpen className="w-5 h-5" />,
      section: "sales",
      description: "Financial records"
    },
    {
      name: "Income",
      path: "/income",
      icon: <DollarSign className="w-5 h-5" />,
      section: "sales",
      description: "Income tracking"
    },
    {
      name: "Sales Report",
      path: "/sales-report",
      icon: <BarChart2 className="w-5 h-5" />,
      section: "sales",
      description: "Sales analytics"
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-surface text-text-primary shadow-md border border-border"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
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
          toggleTheme={toggleTheme}
          theme={theme}
          openSections={openSections}
          toggleSection={toggleSection}
          recentPages={recentPages}
          favorites={favorites}
          setFavorites={setFavorites}
          showNotifications={showNotifications}
          showHelp={showHelp}
          showShortcuts={showShortcuts}
        />
      </div>
    </>
  );
}

function SidebarContent({
  navItems,
  toggleTheme,
  theme,
  openSections,
  toggleSection,
  recentPages,
  favorites,
  setFavorites,
  showNotifications,
  showHelp,
  showShortcuts
}) {
  const navigate = useNavigate();
  const userData = getUserData();
  const userEmail = userData?.email || sessionStorage.getItem("email") || "admin@example.com";

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

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    if (userData?.role === "admin") return true;

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
      "/sales-report": "sales-report"
    };

    const requiredPermission = pathToPermissionMap[item.path];
    if (!requiredPermission) return true;

    return hasPermission(requiredPermission);
  });

  // Group items by section
  const groupedItems = {};
  filteredNavItems.forEach(item => {
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

  return (
    <>
      {/* Header with Search */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/images/logo1.jpg"
            className="w-10 h-10 rounded-full border-2 border-primary object-cover"
            alt="Avatar"
          />
          <div className="flex-1">
            <p className="font-semibold text-text-primary text-sm">Welcome back!</p>
            <p className="text-text-secondary text-xs truncate">{userEmail}</p>
          </div>
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
                  className="flex items-center justify-between px-4 py-3 mt-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface rounded-lg transition-colors"
                >
                  <span>{item.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${openSections[item.section] ? "transform rotate-180" : ""}`}
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
                  `flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 relative ${isActive
                    ? "bg-primary-light text-primary shadow-sm"
                    : "text-text-secondary hover:bg-surface"
                  }`
                }
              >
                <div className="flex items-center flex-1">
                  {item.icon}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">New</span>
                      )}
                      {item.count && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{item.count}</span>
                      )}
                      {item.section === "quickActions" && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.shortcut && (
                    <span className="text-xs text-text-secondary bg-surface px-1.5 py-0.5 rounded">
                      {item.shortcut}
                    </span>
                  )}
                </div>
              </NavLink>

              {/* Recent indicator */}
              {isRecent && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full"></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-start flex-wrap gap-2">
          {hasPermission('user') && (
            <NavLink
              to="/user"
              className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              title="User"
            >
              <User className="w-4 h-4 mr-1" />
            </NavLink>
          )}
          {hasPermission('my') && (
            <NavLink
              to="/my"
              className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg text-green-500 hover:bg-green-50 transition-colors"
              title="My"
            >
              <User className="w-4 h-4 mr-1" />
            </NavLink>
          )}

          {hasPermission('invoice') && (
            <div className="relative group">
              <button
                onClick={() => navigate('/invoice')}
                className="flex items-center px-3 py-2 text-sm font-medium text-green-500 rounded-lg hover:bg-green-50 transition-colors"
              >
                <Receipt className="w-4 h-4 mr-1" />
              </button>
            </div>
          )}

          <div className="relative group">
            <button
              onClick={() => navigate('/buisness')}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-1" />
            </button>
          </div>

          <div className="relative group">
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogoutIcon className="w-4 h-4 mr-1" />
            </button>
          </div>
        </div>
      </div>

    </>
  );
}

export default Sidebar;
