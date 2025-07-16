import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { PlusIcon, SearchIcon, PencilIcon, TrashIcon, XIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { backEndURL } from "../Backendurl";
import { hasPermission, getUserData } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function UserManagementPage() {
  const navigate = useNavigate();
  const VALID_EMAIL = "info@rtechsl.lk";

  // Check if user has access to this page
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const email = sessionStorage.getItem("email");
    const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

    // Allow access if:
    // 1. User is logged in with the specific hardcoded credentials, OR
    // 2. User is logged in and has admin or super-admin role
    const hasValidCredentials = email === VALID_EMAIL && restrictedUser;
    const isAdminOrSuperAdmin = userData.role === "admin" || userData.role === "super-admin";

    if (!isLoggedIn || (!hasValidCredentials && !isAdminOrSuperAdmin)) {
      navigate("/login");
      return;
    }
  }, [navigate]);

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
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

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
      invoice: true,
      "return-dashboard": true,
      customerAccounts: true
    }
  }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    username: "", // Add username
    role: "user",
    status: "active",
    permissions: {},
    mobileNumber: "" // New field for Super Admin
  })
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${backEndURL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setUsers(response.data.data);
          setFilteredUsers(response.data.data);
        } else {
          showToast("Failed to fetch users", "error");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        if (error.response?.status === 403) {
          showToast("You don't have permission to access user management", "error");
        } else if (error.response?.status === 401) {
          showToast("Please login again", "error");
        } else {
          showToast("Failed to fetch users. Please try again.", "error");
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    // Fetch users if user has proper access (admin or special credentials)
    const email = sessionStorage.getItem("email");
    const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");

    const hasValidCredentials = email === VALID_EMAIL && restrictedUser;
    const isAdminOrSuperAdmin = userData.role === "admin" || userData.role === "super-admin";
    if (hasValidCredentials || isAdminOrSuperAdmin) {
      fetchUsers();
    }
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
    if (!formData.username) {
      errors.username = "Username is required"
    }

    // Mobile number validation for Super Admin
    if (formData.role === "super-admin") {
      if (!formData.mobileNumber) {
        errors.mobileNumber = "Mobile number is required for Super Admin"
      } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.mobileNumber)) {
        errors.mobileNumber = "Please enter a valid mobile number"
      }
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
      if (value === "super-admin") {
        // Super Admin gets all permissions and requires mobile number
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          permissions: {} // Empty object means all permissions for super admin
        }))
      } else if (value === "admin") {
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

      // Clear mobile number if not Super Admin
      if (value !== "super-admin") {
        setFormData((prev) => ({
          ...prev,
          mobileNumber: ""
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
    // Restrict info@rtechsl.lk to only create super-admin
    const email = sessionStorage.getItem("email");
    const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
    if (email === VALID_EMAIL && restrictedUser && formData.role !== "super-admin") {
      showToast("info@rtechsl.lk can only create a Super Admin.", "error");
      return;
    }
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
    // Only super-admin can edit user roles
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    if ((formData.role !== currentUser.role || formData.status !== currentUser.status) && userData.role !== "super-admin") {
      showToast("Only Super Admin can change user roles or status.", "error");
      return;
    }
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
      username: user.username || "", // Add username
      role: user.role,
      status: user.status,
      permissions: user.permissions || {},
      mobileNumber: user.mobileNumber || ""
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
    const email = sessionStorage.getItem("email");
    const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
    setFormData({
      email: "",
      password: "",
      name: "",
      username: "",
      role: (email === VALID_EMAIL && restrictedUser) ? "super-admin" : "user",
      status: (email === VALID_EMAIL && restrictedUser) ? "active" : "active",
      permissions: {},
      mobileNumber: ""
    })
    setFormErrors({})
    setShowPassword(false)
    setShowEditPassword(false)
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              className={`px-3 py-2 rounded-md font-medium text-sm transition-colors ${statusFilter === 'active'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-background border border-border text-text-primary hover:bg-surface'
                }`}
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
            >
              Show Active
            </button>

            <button
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-text-primary font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:ring-offset-2 focus:ring-offset-background transition-colors flex items-center gap-2"
              onClick={() => {
                const fetchUsers = async () => {
                  setIsLoadingUsers(true);
                  try {
                    const token = sessionStorage.getItem('token');
                    const response = await axios.get(`${backEndURL}/api/users`, {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    });
                    if (response.data.success) {
                      setUsers(response.data.data);
                      setFilteredUsers(response.data.data);
                      showToast("Users refreshed successfully");
                    } else {
                      showToast("Failed to fetch users", "error");
                    }
                  } catch (error) {
                    console.error("Error fetching users:", error);
                    showToast("Failed to refresh users", "error");
                  } finally {
                    setIsLoadingUsers(false);
                  }
                };
                fetchUsers();
              }}
              disabled={isLoadingUsers}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>

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

        {/* User Statistics */}
        {!isLoadingUsers && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Total Users</p>
                  <p className="text-2xl font-bold text-text-primary">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{users.filter(user => user.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-secondary">Admins</p>
                  <p className="text-2xl font-bold text-blue-600">{users.filter(user => user.role === 'admin').length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-text-secondary">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
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
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin" ? "bg-primary-light text-primary" : "bg-secondary/20 text-text-primary"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-primary hover:text-primary-dark mr-4"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {JSON.parse(sessionStorage.getItem("userData") || "{}").role === "super-admin" && (
                          <button
                            className="text-accent hover:text-accent/80"
                            onClick={() => openDeleteModal(user)}
                            title="Delete user"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-text-muted">
                      {users.length === 0 ? "No users found in the system" : "No users found matching your criteria"}
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
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.email ? "border-accent" : "border-border"
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
                          className={`w-full px-4 py-2 pr-10 rounded-md bg-background border ${formErrors.password ? "border-accent" : "border-border"
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
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.name ? "border-accent" : "border-border"
                          } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                        placeholder="John Doe"
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-accent">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.username ? "border-accent" : "border-border"
                          } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                        placeholder="Unique username"
                      />
                      {formErrors.username && <p className="mt-1 text-sm text-accent">{formErrors.username}</p>}
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
                        disabled={(() => {
                          const email = sessionStorage.getItem("email");
                          const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
                          return (email === VALID_EMAIL && restrictedUser) || JSON.parse(sessionStorage.getItem("userData") || "{}").role !== "super-admin";
                        })()}
                      >
                        {(() => {
                          const email = sessionStorage.getItem("email");
                          const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
                          if (email === VALID_EMAIL && restrictedUser) {
                            return <option value="super-admin">Super Admin</option>;
                          }
                          return [
                            <option key="user" value="user">User</option>,
                            <option key="admin" value="admin">Admin</option>,
                            <option key="super-admin" value="super-admin">Super Admin</option>
                          ];
                        })()}
                      </select>
                      {(() => {
                        const email = sessionStorage.getItem("email");
                        const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
                        if (email === VALID_EMAIL && restrictedUser) {
                          return <p className="mt-1 text-xs text-accent">Login as Super Admin to add other user roles.</p>;
                        }
                        return null;
                      })()}
                    </div>

                    {/* Mobile Number Field - Only for Super Admin */}
                    {formData.role === "super-admin" && (
                      <div>
                        <label htmlFor="mobileNumber" className="block text-sm font-medium text-text-secondary mb-1">
                          Mobile Number <span className="text-accent">*</span>
                        </label>
                        <input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.mobileNumber ? "border-accent" : "border-border"
                            } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                          placeholder="+1234567890"
                        />
                        {formErrors.mobileNumber && <p className="mt-1 text-sm text-accent">{formErrors.mobileNumber}</p>}
                      </div>
                    )}

                    {/* Permissions Section - Only show for user role */}
                    {formData.role === "user" ? (
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
                    ) : null}

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
                        disabled={(() => {
                          const email = sessionStorage.getItem("email");
                          const restrictedUser = sessionStorage.getItem("restrictedUser") === "true";
                          return (email === VALID_EMAIL && restrictedUser) || JSON.parse(sessionStorage.getItem("userData") || "{}").role !== "super-admin";
                        })()}
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
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.email ? "border-accent" : "border-border"
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
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.name ? "border-accent" : "border-border"
                          } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-accent">{formErrors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.username ? "border-accent" : "border-border"
                          } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                      />
                      {formErrors.username && <p className="mt-1 text-sm text-accent">{formErrors.username}</p>}
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
                        disabled={(() => {
                          const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
                          return userData.role !== "super-admin";
                        })()}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="super-admin">Super Admin</option>
                      </select>
                    </div>

                    {/* Mobile Number Field - Only for Super Admin */}
                    {formData.role === "super-admin" && (
                      <div>
                        <label htmlFor="mobileNumber" className="block text-sm font-medium text-text-secondary mb-1">
                          Mobile Number <span className="text-accent">*</span>
                        </label>
                        <input
                          id="mobileNumber"
                          name="mobileNumber"
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-md bg-background border ${formErrors.mobileNumber ? "border-accent" : "border-border"
                            } text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
                          placeholder="+1234567890"
                        />
                        {formErrors.mobileNumber && <p className="mt-1 text-sm text-accent">{formErrors.mobileNumber}</p>}
                      </div>
                    )}

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
                        disabled={(() => {
                          const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
                          return userData.role !== "super-admin";
                        })()}
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
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-md shadow-lg ${toast.type === "error" ? "bg-accent" : "bg-primary"
            } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
