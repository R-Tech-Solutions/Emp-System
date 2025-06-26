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

// Permission-based route component
const PermissionRoute = ({ permission, children }) => {
  if (hasPermission(permission)) {
    return children;
  }
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  // Setup auth interceptor for JWT tokens
  useEffect(() => {
    setupAuthInterceptor();
  }, []);

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
                <UserAdd />
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
                <BuisnessSettings />
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
        </Route>
        <Route path="*" element={<InitialRedirect />} />
      </Routes>
    </div>
  );
}

export default App;
