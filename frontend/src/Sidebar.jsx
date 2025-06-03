"use client";

import { useState } from "react";
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
  DollarSign
} from "lucide-react";

function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
    { name: "Sections", path: "/sections", icon: <Building2 className="w-5 h-5" /> },
    { name: "Employees", path: "/employees", icon: <Users className="w-5 h-5" /> },
    { name: "Tasks", path: "/tasks", icon: <ListChecks className="w-5 h-5" /> },
    { name: "Timesheets", path: "/timesheets", icon: <Clock className="w-5 h-5" /> },
    { name: "Attendance", path: "/attendance", icon: <Clock className="w-5 h-5" /> },
    { name: "Leave Requests", path: "/leave-requests", icon: <CalendarCheck2 className="w-5 h-5" /> },
    { name: "Payroll", path: "/payroll", icon: <Wallet className="w-5 h-5" /> },
    { name: "Messages", path: "/messages", icon: <MessageCircle className="w-5 h-5" /> },
    { name: "Assets", path: "/assets", icon: <Boxes className="w-5 h-5" /> },
    { name: "User", path: "/user", icon: <User className="w-5 h-5" /> },
    { name: "Profile", path: "/my", icon: <User className="w-5 h-5" /> },
    { name: "Reports", path: "/reports", icon: <BarChart2 className="w-5 h-5" /> },
    { name: "CRM", path: "/crm", icon: <Users className="w-5 h-5" /> },
    { name: "Products", path: "/products", icon: <Boxes className="w-5 h-5" /> },
    { name: "Quotation", path: "/quatation", icon: <FileSignature className="w-5 h-5" /> },
    { name: "Purchase", path: "/purchase", icon: <ShoppingCart className="w-5 h-5" /> },
    { name: "Inventory", path: "/inventory", icon: <Boxes className="w-5 h-5" /> },
    { name: "Supplier", path: "/supplier", icon: <Truck className="w-5 h-5" /> },
    { name: "Cashbook", path: "/cashbook", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Invoice", path: "/invoice", icon: <Receipt className="w-5 h-5" /> },
    { name: "Income", path: "/income", icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 dark:bg-gray-700 shadow-md"
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
          } md:flex flex-col w-64 h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 shadow-lg`}
      >
        <SidebarContent navItems={navItems} toggleTheme={toggleTheme} theme={theme} />
      </div>
    </>
  );
}

function SidebarContent({ navItems, toggleTheme, theme }) {
  const navigate = useNavigate();
  const userEmail = sessionStorage.getItem("email") || "admin@example.com";

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("email");
      window.location.href = "/login"; // Force full reload
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out. Please try again.");
    }
  };


  return (
    <>
      {/* Top - Profile */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <img
          src="/images/logo1.jpg"
          className=" rounded-full border-2 border-blue-white object-cover"
          alt="Avatar"
        />
      </div>
      <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm">
          <p className="font-semibold text-gray-800 dark:text-white">Welcome</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[10rem]">{userEmail}</p>
        </div>
      </div>

      {/* Nav Links */}
      < div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700" >
        {
          navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                  ? "bg-blue-100 dark:bg-gray-700 text-blue-800 dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))
        }
      </div >

      {/* Bottom - Theme and Logout */}
      < div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700" >
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900"
        >
          <LogoutIcon className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div >
    </>
  );
}

export default Sidebar;
