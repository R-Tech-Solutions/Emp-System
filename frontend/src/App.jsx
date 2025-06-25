"use client";
import { Routes, Route, Navigate } from "react-router-dom";
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
import salesReport from "./pages/SalesReport.jsx";
function App() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

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
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute>
                <Employee />
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute>
                <AttendanceTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="leave-requests"
            element={
              <ProtectedRoute>
                <LeaveRequestSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <MessagingSystem />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <Report />
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
                <UserAdd />
              </ProtectedRoute>
            }
          />
          <Route
            path="my"
            element={
              <ProtectedRoute>
                <Mysettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="assets"
            element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            }
          />
          <Route
            path="timesheets"
            element={
              <ProtectedRoute>
                <Timesheets />
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
                <Payrol />
              </ProtectedRoute>
            }
          />
          <Route
            path="crm"
            element={
              <ProtectedRoute>
                <Crm />
              </ProtectedRoute>
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route
            path="quatation"
            element={
              <ProtectedRoute>
                <Quatation />
              </ProtectedRoute>
            }
          />
          <Route
            path="purchase"
            element={
              <ProtectedRoute>
                <Purchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="supplier"
            element={
              <ProtectedRoute>
                <SupplierManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="cashbook"
            element={
              <ProtectedRoute>
                <Cashbook />
              </ProtectedRoute>
            }
          />
          <Route
            path="invoice"
            element={
              <ProtectedRoute>
                <Invoice />
              </ProtectedRoute>
            }
          />
          <Route
            path="income"
            element={
              <ProtectedRoute>
                <Income />
              </ProtectedRoute>
            }
          />
          <Route
            path="salesdashboard"
            element={
              <ProtectedRoute>
                <SalesDashboard />
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
                <salesReport />
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
