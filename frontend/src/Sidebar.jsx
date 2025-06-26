"use client";

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Timer,
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
  FileText 
} from "lucide-react";

import { logout, getUserData, hasPermission } from './utils/auth';

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    hrm: false,
    sales: false
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSection = (section) => {
    setOpenSections(prev => {
      // Create a new state object with all sections closed
      const newState = {
        hrm: false,
        sales: false
      };
      // If the clicked section was closed, open it
      if (!prev[section]) {
        newState[section] = true;
      }
      return newState;
    });
  };

  const navItems = [
    { name: "Admin Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { type: "header", name: "Human Resource", section: "hrm" },
    { name: "Sections", path: "/sections", icon: <Building2 className="w-5 h-5" />, section: "hrm" },
    { name: "Employees", path: "/employees", icon: <Users className="w-5 h-5" />, section: "hrm" },
    { name: "Tasks", path: "/tasks", icon: <ListChecks className="w-5 h-5" />, section: "hrm" },
    { name: "Timesheets", path: "/timesheets", icon: <Clock className="w-5 h-5" />, section: "hrm" },
    { name: "Attendance", path: "/attendance", icon: <Clock className="w-5 h-5" />, section: "hrm" },
    { name: "Leave Requests", path: "/leave-requests", icon: <CalendarCheck2 className="w-5 h-5" />, section: "hrm" },
    { name: "Payroll", path: "/payroll", icon: <Wallet className="w-5 h-5" />, section: "hrm" },
    { name: "Messages", path: "/messages", icon: <MessageCircle className="w-5 h-5" />, section: "hrm" },
    { name: "Assets", path: "/assets", icon: <Boxes className="w-5 h-5" />, section: "hrm" },
    { name: "Reports", path: "/reports", icon: <BarChart2 className="w-5 h-5" />, section: "hrm" },

    { name: "Sales Overview", path: "/salesdashboard", icon: <Home className="w-5 h-5" /> },
    { type: "header", name: "Sales & Inventory", section: "sales" },
    { name: "CRM", path: "/crm", icon: <Users className="w-5 h-5" />, section: "sales" },
    { name: "Products", path: "/products", icon: <Boxes className="w-5 h-5" />, section: "sales" },
    { name: "Quotation", path: "/quatation", icon: <FileSignature className="w-5 h-5" />, section: "sales" },
    { name: "Purchase", path: "/purchase", icon: <ShoppingCart className="w-5 h-5" />, section: "sales" },
    { name: "Inventory", path: "/inventory", icon: <Boxes className="w-5 h-5" />, section: "sales" },
    { name: "Supplier", path: "/supplier", icon: <Truck className="w-5 h-5" />, section: "sales" },
    { name: "Cashbook", path: "/cashbook", icon: <BookOpen className="w-5 h-5" />, section: "sales" },
    { name: "Income", path: "/income", icon: <DollarSign className="w-5 h-5" />, section: "sales" },
    { name: "Sales Report", path: "/sales-report", icon: <BarChart2 className="w-5 h-5" />, section: "sales" },
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-surface text-text-primary shadow-md border border-border"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleMobileMenu}
      ></div>

      {/* Sidebar Container */}
      <div
        className={`fixed md:static z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:flex flex-col w-64 h-full bg-background border-r border-border shadow-lg`}
      >
        <SidebarContent
          navItems={navItems}
          toggleTheme={toggleTheme}
          theme={theme}
          openSections={openSections}
          toggleSection={toggleSection}
        />
      </div>
    </>
  );
}

function SidebarContent({ navItems, toggleTheme, theme, openSections, toggleSection }) {
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

  // Filter navigation items based on user permissions
  const filteredNavItems = navItems.filter(item => {
    // Admin sees everything
    if (userData?.role === "admin") return true;
    
    // For regular users, check permissions based on path
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
    if (!requiredPermission) return true; // Show items without specific permission mapping
    
    return hasPermission(requiredPermission);
  });

  // Group items by section and filter out empty sections
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
      // Items without section go to a special group
      if (!groupedItems['main']) {
        groupedItems['main'] = { header: null, items: [] };
      }
      groupedItems['main'].items.push(item);
    }
  });

  // Filter out sections with no items
  const finalItems = [];
  Object.entries(groupedItems).forEach(([section, group]) => {
    if (group.items.length > 0) {
      if (group.header) {
        finalItems.push(group.header);
      }
      finalItems.push(...group.items);
    }
  });

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger if Shift is pressed
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <>
      {/* Top - Profile */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border">
        <img
          src="/images/logo1.jpg"
          className="rounded-full border-2 border-primary object-cover"
          alt="Avatar"
        />
      </div>
      <div className="flex items-center gap-3 h-16 px-4 border-b border-border">
        <div className="text-sm">
          <p className="font-semibold text-text-primary">Welcome</p>
          <p className="text-text-secondary text-xs truncate max-w-[10rem]">{userEmail}</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-border">
        {finalItems.map((item) => {
          if (item.type === "header") {
            if (item.section) {
              return (
                <div
                  key={item.name}
                  onClick={() => toggleSection(item.section)}
                  className="flex items-center justify-between px-4 py-2 mt-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider cursor-pointer hover:bg-surface rounded-lg"
                >
                  <span>{item.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${openSections[item.section] ? "transform rotate-180" : ""
                      }`}
                  />
                </div>
              );
            }
            return (
              <div key={item.name} className="px-4 py-2 mt-4 mb-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {item.name}
              </div>
            );
          }

          if (item.section && !openSections[item.section]) {
            return null;
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                  ? "bg-primary-light text-primary"
                  : "text-text-secondary hover:bg-surface"
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-border">
        {/* User/Profile buttons outside main nav, above logout/settings */}
        <div className="flex flex-col gap-2 mb-4">
          {hasPermission('user') && (
            <NavLink to="/user" className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-blue-600 hover:bg-blue-50">
              <User className="w-5 h-5 mr-2" /> User Management
            </NavLink>
          )}
          {hasPermission('my') && (
            <NavLink to="/my" className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-green-600 hover:bg-green-50">
              <User className="w-5 h-5 mr-2" /> Profile
            </NavLink>
          )}
        </div>
        <div className="flex space-x-4">
          {/* Only show POS button if user has invoice permission */}
          {hasPermission('invoice') && (
            <button
              onClick={() => navigate('/invoice')}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 rounded-md hover:bg-red-50 relative group"
              title="POS (Shift + P)"
            >
              <Receipt className="w-5 h-5 mr-3" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Shift + P
              </span>
            </button>
          )}
          
          {/* Logout button - always visible */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 relative group"
            title="Logout (Shift + L)"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Shift + L
            </span>
          </button>
          
          {/* Settings button - always visible */}
          <button
            onClick={() => navigate('/buisness')}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 rounded-md hover:bg-red-50 relative group"
            title="Settings (Shift + S)"
          >
            <FileText className="w-5 h-5 mr-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Shift + S
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
