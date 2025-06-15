import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"

function Layout() {
  const location = useLocation()
  const isInvoicePage = location.pathname.includes('/invoice')

  return (
    <div className="flex h-screen bg-background">
      {!isInvoicePage && <Sidebar />}
      <main className={`${isInvoicePage ? 'w-full' : 'flex-1'} overflow-y-auto bg-background`}>
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout

