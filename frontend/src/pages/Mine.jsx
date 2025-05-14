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

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const email = sessionStorage.getItem("email")
    if (email) {
      fetch(`${backEndURL}/api/users/email/${email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.data)
          } else {
            alert("Failed to fetch user details")
          }
        })
        .catch((err) => console.error("Error fetching user details:", err))
    }
  }, [])

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    fetch(`${backEndURL}/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: newPassword }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Password updated successfully")
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          alert("Failed to update password")
        }
      })
      .catch((err) => console.error("Error updating password:", err))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">User Dashboard</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-gray-800 rounded-lg p-4">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 rounded-md text-left ${activeTab === "profile" ? "bg-gray-700" : "hover:bg-gray-700"}`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-4 py-2 rounded-md text-left ${activeTab === "password" ? "bg-gray-700" : "hover:bg-gray-700"}`}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-gray-800 rounded-lg p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Profile Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                    <div className="bg-gray-700 p-3 rounded-md">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <div className="bg-gray-700 p-3 rounded-md">{user.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                    <div className="bg-gray-700 p-3 rounded-md">{user.role}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                    <div className="bg-gray-700 p-3 rounded-md">{user.password}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                      Update Password
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
