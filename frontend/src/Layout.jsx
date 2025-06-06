import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"
import { useState } from "react"

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isInvoicePage = location.pathname === "/invoice"
  const [isMinimized, setIsMinimized] = useState(false)

  const handleClose = () => {
    if (isMinimized) {
      setIsMinimized(false)
    } else {
      navigate("/dashboard")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {!isInvoicePage && <Sidebar />}
      <main className={`overflow-y-auto p-6 ${isInvoicePage ? 'w-full' : 'flex-1'} relative`}>
        {isInvoicePage && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg shadow-lg transition-colors"
            title={isMinimized ? "Maximize" : "Back to Dashboard"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMinimized ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>
          </button>
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

