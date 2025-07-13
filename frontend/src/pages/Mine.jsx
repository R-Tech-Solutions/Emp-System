"use client"

import { useState, useEffect } from "react"
import { backEndURL } from "../Backendurl";

export default function UserProfile() {
  const [user, setUser] = useState({
    email: "",
    name: "",
    role: "",
    password: "",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState("")

  // Get email from sessionStorage
  useEffect(() => {
    const email = sessionStorage.getItem("email")
    const jwtToken = sessionStorage.getItem("jwtToken")
    if (!jwtToken) {
      // No token, redirect to login
      window.location.replace('/login')
      return
    }
    if (email) {
      setLoading(true)
      fetch(`${backEndURL}/api/users/email/${email}`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`
        }
      })
        .then((res) => {
          if (res.status === 401) {
            setError("Session expired or unauthorized. Redirecting to login...")
            setTimeout(() => window.location.replace('/login'), 1500)
            return { success: false }
          }
          return res.json()
        })
        .then((data) => {
          if (data.success) {
            setUser(data.data)
            setError("")
          } else if (!data.success && !error) {
            setError("Failed to fetch user details")
          }
        })
        .catch(() => setError("Error fetching user details"))
        .finally(() => setLoading(false))
    } else {
      setError("No user email found in session.")
      setLoading(false)
    }
  }, [])

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setPasswordChangeSuccess("")
    setPasswordChangeError("")
    if (newPassword.length < 6) {
      setPasswordChangeError("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeError("Passwords do not match.")
      return
    }
    setPasswordChangeLoading(true)
    fetch(`${backEndURL}/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("jwtToken")}`
      },
      body: JSON.stringify({ password: newPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPasswordChangeSuccess("Password updated successfully.")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          setPasswordChangeError(data.message || "Failed to update password.")
        }
      })
      .catch(() => setPasswordChangeError("Error updating password."))
      .finally(() => setPasswordChangeLoading(false))
  }

  // Avatar: use initials
  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map((n) => n[0]).join("").toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-primary">User Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-surface rounded-xl p-6 shadow border border-border flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
              {getInitials(user.name)}
            </div>
            <div className="text-lg font-semibold mb-2">{user.name}</div>
            <div className="text-sm text-text-secondary mb-6">{user.email}</div>
            <div className="flex flex-col w-full gap-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-lg text-left font-medium transition ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"}`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 rounded-lg text-left font-medium transition ${activeTab === "password" ? "bg-primary text-white" : "hover:bg-primary/10 text-primary"}`}
              >
                Change Password
              </button>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1 bg-surface rounded-xl p-8 shadow border border-border min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">Loading...</div>
            ) : error ? (
              <div className="text-red-500 text-center">{error}</div>
            ) : activeTab === "profile" ? (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-primary">Profile Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                    <div className="bg-background p-3 rounded-lg border border-border">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                    <div className="bg-background p-3 rounded-lg border border-border">{user.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                    <div className="bg-background p-3 rounded-lg border border-border capitalize">{user.role}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                    <div className="bg-background p-3 rounded-lg border border-border tracking-widest select-none">********</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-primary">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                  {/* Current password (not used in backend, but for UX) */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showPassword"
                      checked={showPassword}
                      onChange={() => setShowPassword((v) => !v)}
                      className="accent-primary"
                    />
                    <label htmlFor="showPassword" className="text-sm text-text-secondary">Show Passwords</label>
                  </div>
                  {passwordChangeError && <div className="text-red-500 text-sm">{passwordChangeError}</div>}
                  {passwordChangeSuccess && <div className="text-green-600 text-sm">{passwordChangeSuccess}</div>}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold shadow disabled:opacity-60"
                      disabled={passwordChangeLoading}
                    >
                      {passwordChangeLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

