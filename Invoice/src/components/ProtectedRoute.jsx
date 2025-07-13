import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { getAuthToken, getUserData } from "../utils/auth"

// Check if user is authenticated (has JWT token and user data)
const isAuthenticated = () => {
  return sessionStorage.getItem("isLoggedIn") === "true";
}

// Check if user is restricted (can only access /user)
const isRestrictedUser = () => {
  return sessionStorage.getItem("restrictedUser") === "true";
}

const ProtectedRoute = ({ children }) => {
  const location = useLocation()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // If user is restricted, only allow access to /user route
  if (isRestrictedUser() && location.pathname !== "/user") {
    return <Navigate to="/user" replace />
  }
  
  return children
}

// Component to handle initial redirects based on user type
export const InitialRedirect = () => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  // If user is restricted, redirect to /user
  if (isRestrictedUser()) {
    return <Navigate to="/user" replace />
  }
  
  // All other users go to dashboard
  return <Navigate to="/dashboard" replace />
}

export default ProtectedRoute
