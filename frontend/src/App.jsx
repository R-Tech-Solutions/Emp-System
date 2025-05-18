"use client";
import { Routes, Route, Navigate } from "react-router-dom";
import { useTheme } from "./contexts/ThemeContext.jsx";
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
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserAdd from "./pages/UserAdd.jsx";
import Mysettings from "./pages/Mine.jsx";
import Assets from "./pages/Stocks.jsx";
import Timesheets from "./pages/Timesheets.jsx";
import Payrol from "./pages/Payroll.jsx";
import New from "./pages/new.jsx";
import Crm from "./pages/Crm";
import Products from "./pages/Product.jsx";
import Quatation from "./pages/Quatation.jsx";

function App() {
  const { theme } = useTheme();

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Routes>
          <Route
            path="/login"
            element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
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
              path="my"
              element={
                <ProtectedRoute>
                  <Mysettings />
                </ProtectedRoute>
              }
            /><Route
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
            {" "}
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
