import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

