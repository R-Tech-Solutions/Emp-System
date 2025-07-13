"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  X,
  Check,
  ChevronDown,
  Laptop,
  Smartphone,
  CreditCard,
  Headphones,
  Monitor,
} from "lucide-react"
import * as XLSX from "xlsx"
import { backEndURL } from "../Backendurl"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import DotSpinner from "../loaders/Loader" // Import the loader

export default function AssetManagement() {
  // State for assets
  const [assets, setAssets] = useState([])

  // Fetch assets from the backend
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/assets`)
        setAssets(response.data.data)
      } catch (error) {
        console.error("Error fetching assets:", error.message)
      }
    }
    fetchAssets()
  }, [])

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAsset, setCurrentAsset] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [viewAsset, setViewAsset] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // State for employees
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
      

        // Handle different response structures
        const employeeArray = Array.isArray(response.data)
          ? response.data
          : response.data.data || []; // Adjust if data is nested under `data`

        setEmployees(
          employeeArray.map((data) => ({
            employeeId: data.employeeId,
            fullName: `${data.firstName} ${data.lastName}`,
            email: data.email, // Include email in the employee object
            department: data.department, // Include department in the employee object
          }))
        );
      } catch (error) {
        console.error("Error fetching employees:", error.message);
      }
    };

    fetchEmployees();
  }, []);

  // Add loading state for the button
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "Laptop",
    serialNumber: "",
    assignedTo: "",
    email: "",
    department: "",
    status: "Active",
    purchaseDate: "",
    value: "",
  })

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target

    // Automatically fetch email and department when "assignedTo" changes
    if (name === "assignedTo") {
      const selectedEmployee = employees.find(
        (employee) => employee.fullName === value
      )
      setFormData({
        ...formData,
        [name]: value,
        email: selectedEmployee ? selectedEmployee.email : "", // Set email if employee is found
        department: selectedEmployee ? selectedEmployee.department : "", // Set department if employee is found
      })
    } else {
      setFormData({
        ...formData,
        [name]: name === "value" ? Number.parseFloat(value) || "" : value,
      })
    }
  }

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Start loader

    try {
      if (currentAsset) {
        // Update existing asset
        const response = await axios.put(
          `${backEndURL}/api/assets/${currentAsset.id}`,
          formData
        )
        setAssets(
          assets.map((asset) =>
            asset.id === currentAsset.id ? response.data.data : asset
          )
        )
        toast.success("Asset updated successfully!")
      } else {
        // Add new asset
        const response = await axios.post(
          `${backEndURL}/api/assets`,
          formData
        )
        setAssets([...assets, response.data.data])
        toast.success("Asset added successfully!")
      }
    } catch (error) {
      console.error("Error saving asset:", error.message)
      toast.error("Failed to save asset!")
    } finally {
      setIsLoading(false) // Stop loader
    }

    // Close modal and reset form
    setIsModalOpen(false)
    setCurrentAsset(null)
    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "Laptop",
      serialNumber: "",
      assignedTo: "",
      email: "",
      department: "",
      status: "Active",
      purchaseDate: "",
      value: "",
    })
  }

  // Handle edit
  const handleEdit = (asset) => {
    setCurrentAsset(asset)
    setFormData(asset)
    setIsModalOpen(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await axios.delete(`${backEndURL}/api/assets/${id}`)
        setAssets(assets.filter((asset) => asset.id !== id))
        toast.success("Asset deleted successfully!")
      } catch (error) {
        console.error("Error deleting asset:", error.message)
        toast.error("Failed to delete asset!")
      }
    }
  }

  // Handle view
  const handleView = (asset) => {
    setViewAsset(asset)
    setIsViewModalOpen(true)
  }

  // Filter assets based on search term and status
  const filterAssets = () => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "All" || asset.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }

  // Get icon based on asset type
  const getAssetIcon = (type) => {
    switch (type.toLowerCase()) {
      case "laptop":
        return <Laptop className="h-5 w-5" />
      case "phone":
        return <Smartphone className="h-5 w-5" />
      case "access card":
        return <CreditCard className="h-5 w-5" />
      case "monitor":
        return <Monitor className="h-5 w-5" />
      case "headphones":
        return <Headphones className="h-5 w-5" />
      default:
        return <Laptop className="h-5 w-5" />
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border border-green-200"
      case "Inactive":
        return "bg-red-100 text-red-800 border border-red-200"
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Toast Container */}
      <ToastContainer theme="light" />

      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-text-primary">Asset Management</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full md:w-64 bg-white border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                className="flex items-center justify-between w-full md:w-40 bg-white border border-border rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <span className="text-text-primary">Status: {statusFilter}</span>
                <ChevronDown className="h-4 w-4 ml-2 text-text-secondary" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-lg shadow-lg">
                  {["All", "Active", "Inactive", "Maintenance"].map((status) => (
                    <div
                      key={status}
                      className="px-4 py-2 text-sm hover:bg-primary-light cursor-pointer text-text-primary"
                      onClick={() => {
                        setStatusFilter(status)
                        setIsStatusDropdownOpen(false)
                      }}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => {
                setCurrentAsset(null)
                resetForm()
                setIsModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Asset
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface text-text-secondary text-xs uppercase font-medium">
                  <th className="px-6 py-4 text-left">Asset</th>
                  <th className="px-6 py-4 text-left">Serial Number</th>
                  <th className="px-6 py-4 text-left">Assigned To</th>
                  <th className="px-6 py-4 text-left">Department</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filterAssets().length > 0 ? (
                  filterAssets().map((asset) => (
                    <tr key={asset.id} className="hover:bg-primary-light transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{asset.name}</div>
                            <div className="text-sm text-text-secondary">{asset.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-primary">{asset.serialNumber}</td>
                      <td className="px-6 py-4 text-sm text-text-primary">{asset.assignedTo}</td>
                      <td className="px-6 py-4 text-sm text-text-primary">{asset.department}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}
                        >
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(asset)}
                            className="p-2 rounded-lg hover:bg-accent text-text-secondary hover:text-primary transition-all duration-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(asset)}
                            className="p-2 rounded-lg hover:bg-accent text-text-secondary hover:text-primary transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-2 rounded-lg hover:bg-red-100 text-text-secondary hover:text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-text-muted">
                      No assets found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">{currentAsset ? "Edit Asset" : "Add New Asset"}</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setCurrentAsset(null)
                  resetForm()
                }}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Asset Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Asset Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Phone">Phone</option>
                    <option value="Access Card">Access Card</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Headphones">Headphones</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Assigned To</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employeeId} value={employee.fullName}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-border rounded-lg py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setCurrentAsset(null)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? <DotSpinner /> : <Check className="h-4 w-4" />}
                  {currentAsset ? "Update Asset" : "Add Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Asset Modal */}
      {isViewModalOpen && viewAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-semibold text-text-primary">Asset Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setViewAsset(null)
                }}
                className="text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                  {getAssetIcon(viewAsset.type)}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-text-primary">{viewAsset.name}</h4>
                  <p className="text-text-secondary">{viewAsset.type}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewAsset.status)}`}
                >
                  {viewAsset.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Serial Number</h5>
                  <p className="text-text-primary font-medium">{viewAsset.serialNumber}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Assigned To</h5>
                  <p className="text-text-primary font-medium">{viewAsset.assignedTo}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Department</h5>
                  <p className="text-text-primary font-medium">{viewAsset.department}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-text-secondary mb-2">Purchase Date</h5>
                  <p className="text-text-primary font-medium">{viewAsset.purchaseDate}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewAsset)
                }}
                className="px-6 py-2 bg-accent hover:bg-secondary text-text-primary rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setViewAsset(null)
                }}
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
