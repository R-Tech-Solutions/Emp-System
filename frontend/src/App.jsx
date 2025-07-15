"use client";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { setupAuthInterceptor, hasPermission } from "./utils/auth";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Departments from "./pages/Departments.jsx";
import Employee from "./pages/Employee.jsx";
import Layout from "./Layout.jsx";
import TaskManagement from "./pages/TaskManagement.jsx";
import AttendanceTracking from "./pages/AttendanceTracking.jsx";
import LeaveRequestSystem from "./pages/LeaveRequestSystem.jsx";
import MessagingSystem from "./pages/MessagingSystem.jsx";
import Report from "./pages/Report.jsx";
import ProtectedRoute, { InitialRedirect } from "./components/ProtectedRoute.jsx";
import UserAdd from "./pages/UserAdd.jsx";
import Mysettings from "./pages/Mine.jsx";
import Assets from "./pages/Stocks.jsx";
import Timesheets from "./pages/Timesheets.jsx";
import Payrol from "./pages/Payroll.jsx";
import New from "./pages/new.jsx";
import Crm from "./pages/Crm";
import Products from "./pages/Product.jsx";
import Quatation from "./pages/Quatation.jsx";
import Purchase from "./pages/Purchase.jsx";
import InventoryManagement from "./pages/InventoryManagemnet.jsx";
import SupplierManagement from "./pages/SupplierManagement.jsx";
import Cashbook from "./pages/Cashbook.jsx";
import Invoice from "./pages/Invoice.jsx";
import Income from "./pages/Income.jsx";
import SalesDashboard from "./pages/SalesDashboard.jsx";
import BuisnessSettings from "./pages/BuisnessSettings.jsx";
import SalesReport from "./pages/SalesReport.jsx";
import UserHrm from "./pages/Usermanual/userHRM.jsx";
import UserSales from "./pages/Usermanual/userSales.jsx";
import ReturnDashboard from "./pages/Retrundashboard.jsx";
import CustomerAccounts from "./pages/CustomerAccounts.jsx";
// Permission-based route component
const PermissionRoute = ({ permission, children }) => {
  if (hasPermission(permission)) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

// Admin-only route component
const AdminOnlyRoute = ({ children }) => {
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  const email = sessionStorage.getItem("email");
  const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
  
  // Allow access if user is admin, super-admin, or has the special hardcoded credentials
  if (userData.role === "admin" || userData.role === "super-admin" || (email === "info@rtechsl.lk" && restrictedUser)) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

// Helper to check invoice permission
function hasInvoicePermission() {
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  if (!userData) return false;
  if (userData.role === "admin" || userData.role === "super-admin") return true;
  if (userData.permissions && (userData.permissions.invoice === true || userData.permissions.invoice === 1)) return true;
  return false;
}

// NoAccess component for users without permission
function NoAccess() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <h1 style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '1rem' }}>🚫 Access Denied</h1>
      <p style={{ color: '#64748b', fontSize: '1.1rem' }}>You do not have permission to access the Invoice page.<br/>Please contact your administrator if you believe this is a mistake.</p>
      <a href="/login" style={{ marginTop: '2rem', color: '#2563eb', textDecoration: 'underline' }}>Back to Login</a>
    </div>
  );
}

function App() {
  // All hooks at the top!
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const hostname = window.location.hostname;
  const port = window.location.port;
  const isInvoiceOnly =
    hostname.startsWith("inv.") ||
    hostname === "inv.erp.rtechsl.lk" ||
    port === "3002";

  if (isInvoiceOnly) {
    // Invoice-only mode: only allow login and invoice page
    return (
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn && hasInvoicePermission() ? (
              <Navigate to="/invoice" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn ? (
              hasInvoicePermission() ? (
                <ProtectedRoute>
                  <Invoice />
                </ProtectedRoute>
              ) : (
                <NoAccess />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/invoice"
          element={
            isLoggedIn ? (
              hasInvoicePermission() ? (
                <ProtectedRoute>
                  <Invoice />
                </ProtectedRoute>
              ) : (
                <NoAccess />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        {/* Fallback: redirect any other route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <InitialRedirect /> : <Login />
          }
        />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <InitialRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="sections"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="sections">
                  <Departments />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="employees">
                  <Employee />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="tasks">
                  <TaskManagement />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="attendance">
                  <AttendanceTracking />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="leave-requests"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="leave-requests">
                  <LeaveRequestSystem />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="messages">
                  <MessagingSystem />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="reports">
                  <Report />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="user"
            element={
              <ProtectedRoute>
                <AdminOnlyRoute>
                  <UserAdd />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-user"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="user">
                  <UserAdd />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="my"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="my">
                  <Mysettings />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="assets"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="assets">
                  <Assets />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="timesheets"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="timesheets">
                  <Timesheets />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="new"
            element={
              <ProtectedRoute>
                <New />
              </ProtectedRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="payroll">
                  <Payrol />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="crm"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="crm">
                  <Crm />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="products">
                  <Products />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="quatation"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="quatation">
                  <Quatation />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="purchase"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="purchase">
                  <Purchase />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="inventory">
                  <InventoryManagement />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="supplier"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="supplier">
                  <SupplierManagement />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="cashbook"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="cashbook">
                  <Cashbook />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="invoice"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="invoice">
                  <Invoice />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="income"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="income">
                  <Income />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="salesdashboard"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="salesdashboard">
                  <SalesDashboard />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="buisness"
            element={
              <ProtectedRoute>
                <AdminOnlyRoute>
                  <BuisnessSettings />
                </AdminOnlyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="sales-report"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="sales-report">
                  <SalesReport />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="User-Hrm"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="reports">
                  <UserHrm />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="User-Sales"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="reports">
                  <UserSales />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="return-dashboard"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="return-dashboard">
                  <ReturnDashboard />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="customerAccounts"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="customerAccounts">
                  <CustomerAccounts />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<InitialRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
