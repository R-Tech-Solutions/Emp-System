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
        return "bg-green-500/20 text-green-500"
      case "Inactive":
        return "bg-red-500/20 text-red-500"
      case "Maintenance":
        return "bg-yellow-500/20 text-yellow-500"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Toast Container */}
      <ToastContainer theme="dark" />

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">Asset Management</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full md:w-64 bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                className="flex items-center justify-between w-full md:w-40 bg-gray-800 border border-gray-700 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <span>Status: {statusFilter}</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>

              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                  {["All", "Active", "Inactive", "Maintenance"].map((status) => (
                    <div
                      key={status}
                      className="px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
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
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
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
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-xs uppercase">
                  <th className="px-6 py-3 text-left">Asset</th>
                  <th className="px-6 py-3 text-left">Serial Number</th>
                  <th className="px-6 py-3 text-left">Assigned To</th>
                  <th className="px-6 py-3 text-left">Department</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filterAssets().length > 0 ? (
                  filterAssets().map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                            {getAssetIcon(asset.type)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{asset.name}</div>
                            <div className="text-sm text-gray-400">{asset.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{asset.serialNumber}</td>
                      <td className="px-6 py-4 text-sm">{asset.assignedTo}</td>
                      <td className="px-6 py-4 text-sm">{asset.department}</td>
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
                            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(asset)}
                            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">{currentAsset ? "Edit Asset" : "Add New Asset"}</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setCurrentAsset(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Asset Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Asset Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Assigned To</label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setCurrentAsset(null)
                    resetForm()
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-medium text-white">Asset Details</h3>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setViewAsset(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center">
                  {getAssetIcon(viewAsset.type)}
                </div>
                <div>
                  <h4 className="text-xl font-medium text-white">{viewAsset.name}</h4>
                  <p className="text-gray-400">{viewAsset.type}</p>
                </div>
                <span
                  className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewAsset.status)}`}
                >
                  {viewAsset.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Serial Number</h5>
                  <p className="text-white">{viewAsset.serialNumber}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Assigned To</h5>
                  <p className="text-white">{viewAsset.assignedTo}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Department</h5>
                  <p className="text-white">{viewAsset.department}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Purchase Date</h5>
                  <p className="text-white">{viewAsset.purchaseDate}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  handleEdit(viewAsset)
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false)
                  setViewAsset(null)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
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
