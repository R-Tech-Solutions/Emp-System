import React from "react"
import { Navigate } from "react-router-dom"

// Check session storage for authentication status
const isAuthenticated = () => {
  return sessionStorage.getItem("isLoggedIn") === "true"
}

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
