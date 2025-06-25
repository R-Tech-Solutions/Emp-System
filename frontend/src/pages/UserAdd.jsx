import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, XIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { backEndURL } from "../Backendurl";

export default function UserManagementPage() {
  const initialUsers = [
  ]
  const [users, setUsers] = useState(initialUsers)
  const [filteredUsers, setFilteredUsers] = useState(initialUsers)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  
  // Define sidebar permissions structure
  const sidebarPermissions = {
    "Human Resource": {
      sections: true,
      employees: true,
      tasks: true,
      timesheets: true,
      attendance: true,
      "leave-requests": true,
      payroll: true,
      messages: true,
      assets: true,
      user: true,
      my: true,
      reports: true
    },
    "Sales & Inventory": {
      salesdashboard: true,
      crm: true,
      products: true,
      quatation: true,
      purchase: true,
      inventory: true,
      supplier: true,
      cashbook: true,
      income: true,
      invoice: true
    }
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    status: "active",
    permissions: {}
  })
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/users`);
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let result = users

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(result)
  }, [users, searchTerm, roleFilter, statusFilter])

  // Form validation
  const validateForm = () => {
    const errors = {}

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!isEditModalOpen && !formData.password) {
      errors.password = "Password is required"
    } else if (!isEditModalOpen && formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!formData.name) {
      errors.name = "Name is required"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }

    // Handle role change
    if (name === "role") {
      if (value === "admin") {
        // Admin gets all permissions
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          permissions: {} // Empty object means all permissions for admin
        }))
      } else {
        // User role - initialize with no permissions
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          permissions: {}
        }))
      }
    }
  }

  // Handle permission changes
  const handlePermissionChange = (category, permission, checked) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: checked
      }
    }))
  }

  // Handle category permission changes (select all/none for a category)
  const handleCategoryPermissionChange = (category, checked) => {
    const categoryPermissions = sidebarPermissions[category]
    const newPermissions = { ...formData.permissions }
    
    Object.keys(categoryPermissions).forEach(permission => {
      newPermissions[permission] = checked
    })
    
    setFormData((prev) => ({
      ...prev,
      permissions: newPermissions
    }))
  }

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (category) => {
    const categoryPermissions = sidebarPermissions[category]
    return Object.keys(categoryPermissions).every(permission => 
      formData.permissions[permission] === true
    )
  }

  // Check if any permissions in a category are selected
  const isCategoryPartiallySelected = (category) => {
    const categoryPermissions = sidebarPermissions[category]
    const hasSelected = Object.keys(categoryPermissions).some(permission => 
      formData.permissions[permission] === true
    )
    const hasUnselected = Object.keys(categoryPermissions).some(permission => 
      formData.permissions[permission] !== true
    )
    return hasSelected && hasUnselected
  }

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await axios.post(`${backEndURL}/api/users`, formData);
      setUsers((prev) => [...prev, response.data.data]);
      setIsAddModalOpen(false);
      resetForm();
      showToast(`User ${response.data.data.name} added successfully`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add user", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Edit user
  const handleEditUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.put(
       `${backEndURL}/api/users/${currentUser.id}`,
        formData
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === currentUser.id ? response.data.data : user
        )
      );
      setIsEditModalOpen(false);
      resetForm();
      showToast(`User ${response.data.data.name} updated successfully`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update user", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    setIsLoading(true);

    try {
      await axios.delete(`${backEndURL}/api/users/${currentUser.id}`);
      setUsers((prev) => prev.filter((user) => user.id !== currentUser.id));
      setIsDeleteModalOpen(false);
      showToast(`User ${currentUser.name} deleted successfully`);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setCurrentUser(user)
    setFormData({
      email: user.email,
      password: "",
      name: user.name,
      role: user.role,
      status: user.status,
      permissions: user.permissions || {}
    })
    setIsEditModalOpen(true)
  }

  // Open delete modal
  const openDeleteModal = (user) => {
    setCurrentUser(user)
    setIsDeleteModalOpen(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "user",
      status: "active",
      permissions: {}
    })
    setFormErrors({})
    setShowPassword(false)
    setShowEditPassword(false)
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-surface shadow-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* Search */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-text-secondary" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              className="px-3 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="px-3 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background transition-colors flex items-center gap-2"
              onClick={() => {
                resetForm()
                setIsAddModalOpen(true)
              }}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-surface rounded-lg shadow-lg overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-primary-light">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-surface/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-text-primary">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text-secondary">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin" ? "bg-primary-light text-primary" : "bg-secondary/20 text-text-primary"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === "active" ? "bg-secondary/20 text-text-primary" : "bg-accent/20 text-text-primary"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{user.createdAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-primary hover:text-primary-dark mr-4"
                          onClick={() => openEditModal(user)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="text-accent hover:text-accent/80" onClick={() => openDeleteModal(user)}>
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-text-muted">
                      No users found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-border">
              <div className="flex justify-between items-center px-6 py-4 bg-primary-light">
                <h3 className="text-lg font-medium text-text-primary">Add New User</h3>
                <button className="text-text-secondary hover:text-text-primary" onClick={() => setIsAddModalOpen(false)}>
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAddUser}>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${
                          formErrors.email ? "border-accent" : "border-border"
                        } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                        placeholder="user@example.com"
                      />
                      {formErrors.email && <p className="mt-1 text-sm text-accent">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 pr-10 rounded-md bg-background border ${
                            formErrors.password ? "border-accent" : "border-border"
                          } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-text-muted hover:text-text-secondary" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && <p className="mt-1 text-sm text-accent">{formErrors.password}</p>}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${
                          formErrors.name ? "border-accent" : "border-border"
                        } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                        placeholder="John Doe"
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-accent">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                        User Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Permissions Section - Only show for user role */}
                    {formData.role === "user" && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">
                          User Permissions
                        </label>
                        <div className="space-y-4">
                          {Object.entries(sidebarPermissions).map(([category, permissions]) => (
                            <div key={category} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-text-primary">{category}</h4>
                                <div className="flex items-center space-x-2">
                                  <label className="flex items-center text-xs text-text-secondary">
                                    <input
                                      type="checkbox"
                                      checked={isCategoryFullySelected(category)}
                                      onChange={(e) => handleCategoryPermissionChange(category, e.target.checked)}
                                      className="mr-1 rounded border-border text-primary focus:ring-primary/20"
                                    />
                                    Select All
                                  </label>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {Object.entries(permissions).map(([permission, _]) => (
                                  <label key={permission} className="flex items-center text-xs text-text-secondary">
                                    <input
                                      type="checkbox"
                                      checked={formData.permissions[permission] === true}
                                      onChange={(e) => handlePermissionChange(category, permission, e.target.checked)}
                                      className="mr-2 rounded border-border text-primary focus:ring-primary/20"
                                    />
                                    {permission.charAt(0).toUpperCase() + permission.slice(1).replace('-', ' ')}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-primary-light flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-background hover:bg-surface text-text-primary font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-primary-light transition-colors"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Adding..." : "Add User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-border">
              <div className="flex justify-between items-center px-6 py-4 bg-primary-light">
                <h3 className="text-lg font-medium text-text-primary">Edit User</h3>
                <button className="text-text-secondary hover:text-text-primary" onClick={() => setIsEditModalOpen(false)}>
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEditUser}>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${
                          formErrors.email ? "border-accent" : "border-border"
                        } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      />
                      {formErrors.email && <p className="mt-1 text-sm text-accent">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${
                          formErrors.name ? "border-accent" : "border-border"
                        } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-accent">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                        User Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Permissions Section - Only show for user role */}
                    {formData.role === "user" && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-3">
                          User Permissions
                        </label>
                        <div className="space-y-4">
                          {Object.entries(sidebarPermissions).map(([category, permissions]) => (
                            <div key={category} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-text-primary">{category}</h4>
                                <div className="flex items-center space-x-2">
                                  <label className="flex items-center text-xs text-text-secondary">
                                    <input
                                      type="checkbox"
                                      checked={isCategoryFullySelected(category)}
                                      onChange={(e) => handleCategoryPermissionChange(category, e.target.checked)}
                                      className="mr-1 rounded border-border text-primary focus:ring-primary/20"
                                    />
                                    Select All
                                  </label>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {Object.entries(permissions).map(([permission, _]) => (
                                  <label key={permission} className="flex items-center text-xs text-text-secondary">
                                    <input
                                      type="checkbox"
                                      checked={formData.permissions[permission] === true}
                                      onChange={(e) => handlePermissionChange(category, permission, e.target.checked)}
                                      className="mr-2 rounded border-border text-primary focus:ring-primary/20"
                                    />
                                    {permission.charAt(0).toUpperCase() + permission.slice(1).replace('-', ' ')}
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-md bg-background border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-primary-light flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-background hover:bg-surface text-text-primary font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-primary-light transition-colors"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Updating..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-border">
              <div className="px-6 py-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-text-primary mb-2">Delete User</h3>
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">
                      Are you sure you want to delete the user{" "}
                      <span className="font-semibold">{currentUser?.name}</span>? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-primary-light flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-background hover:bg-surface text-text-primary font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-primary-light transition-colors"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="px-4 py-2 bg-accent hover:bg-accent/80 text-text-primary font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 focus:ring-offset-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleDeleteUser}
                >
                  {isLoading ? "Deleting..." : "Delete User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${
            toast.type === "error" ? "bg-accent" : "bg-primary"
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
