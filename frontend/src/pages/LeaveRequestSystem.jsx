"use client"

import { useState, useEffect } from "react"
import { PlusIcon, FilterIcon, CheckCircleIcon, ExclamationCircleIcon } from "../icons.jsx"
import axios from "axios";
import { backEndURL } from "../Backendurl.jsx";

function LeaveRequestSystem() {
  const [leaveRequests, setLeaveRequests] = useState([
  ])

  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, name: "Sick", daysAllowed: 10, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    { id: 2, name: "Casual", daysAllowed: 7, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    {
      id: 3,
      name: "Vacation",
      daysAllowed: 15,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentLeaveRequest, setCurrentLeaveRequest] = useState({
    employeeId: "",
    employeeName: "",
    email: "", // Add email field
    department: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    days: "",
    reason: "",
    status: "Pending",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [filter, setFilter] = useState("All")

  const [isLeaveTypeModalOpen, setIsLeaveTypeModalOpen] = useState(false)
  const [currentLeaveType, setCurrentLeaveType] = useState({
    name: "",
    daysAllowed: "",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  })
  const [isEditingLeaveType, setIsEditingLeaveType] = useState(false)

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState(null);

  const statusOptions = ["Pending", "Approved", "Rejected"]
  const filterOptions = ["All", ...statusOptions]

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircleIcon className="w-5 h-5" />
      case "Rejected":
        return <ExclamationCircleIcon className="w-5 h-5" />
      default:
        return null
    }
  }

  const getLeaveTypeColor = (leaveType) => {
    const type = leaveTypes.find((t) => t.name === leaveType)
    return type ? type.color : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
  }

  const openModal = (leaveRequest = null) => {
    if (leaveRequest) {
      setCurrentLeaveRequest(leaveRequest)
      setIsEditing(true)
    } else {
      setCurrentLeaveRequest({
        employeeId: "",
        employeeName: "",
        email: "", // Add email field
        department: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        days: "",
        reason: "",
        status: "Pending",
      })
      setIsEditing(false)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openLeaveTypeModal = (leaveType = null) => {
    if (leaveType) {
      setCurrentLeaveType(leaveType)
      setIsEditingLeaveType(true)
    } else {
      setCurrentLeaveType({
        name: "",
        daysAllowed: "",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      })
      setIsEditingLeaveType(false)
    }
    setIsLeaveTypeModalOpen(true)
  }

  const closeLeaveTypeModal = () => {
    setIsLeaveTypeModalOpen(false)
  }

  const openRejectModal = (id) => {
    setRejectingRequestId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectingRequestId(null);
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    try {
      await axios.patch(`${backEndURL}/api/leave/${rejectingRequestId}`, {
        status: "Rejected",
        rejectReason, // Send rejection reason to backend
      });
      fetchLeaveRequests();
      closeRejectModal();
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentLeaveRequest({ ...currentLeaveRequest, [name]: value }) // Handle email input
  }

  const handleLeaveTypeInputChange = (e) => {
    const { name, value } = e.target
    setCurrentLeaveType({ ...currentLeaveType, [name]: value })
  }

  const calculateDays = () => {
    if (currentLeaveRequest.startDate && currentLeaveRequest.endDate) {
      const start = new Date(currentLeaveRequest.startDate)
      const end = new Date(currentLeaveRequest.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      setCurrentLeaveRequest({ ...currentLeaveRequest, days: diffDays })
    }
  }

  const fetchLeaveRequests = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/leave`);
      setLeaveRequests(response.data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (isEditing) {
        // Update existing leave request
        await axios.put(`${backEndURL}/api/leave/${currentLeaveRequest.id}`, currentLeaveRequest); // Include email
      } else {
        // Add new leave request
        await axios.post(`${backEndURL}/api/leave`, currentLeaveRequest); // Include email
      }
      fetchLeaveRequests();
      closeModal();
    } catch (error) {
      console.error("Error submitting leave request:", error);
    }
  };

  const handleLeaveTypeSubmit = (e) => {
    e.preventDefault()

    if (isEditingLeaveType) {
      // Update existing leave type
      setLeaveTypes(leaveTypes.map((type) => (type.id === currentLeaveType.id ? { ...currentLeaveType } : type)))
    } else {
      // Add new leave type
      const newLeaveType = {
        id: Date.now(),
        ...currentLeaveType,
      }
      setLeaveTypes([...leaveTypes, newLeaveType])
    }

    closeLeaveTypeModal()
  }

  const handleApproveReject = async (id, status) => {
    try {
      await axios.patch(`${backEndURL}/api/leave/${id}`, { status }); // Send status to backend
      fetchLeaveRequests();
    } catch (error) {
      console.error(`Error updating leave request status to ${status}:`, error);
    }
  };

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const filteredLeaveRequests =
    filter === "All" ? leaveRequests : leaveRequests.filter((request) => request.status === filter)

  return (
    <div className="space-y-6 bg-background text-text-primary">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Leave Request System</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Leave Request
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FilterIcon className="w-5 h-5 text-text-secondary" />
          <span className="text-sm font-medium text-text-primary">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-border shadow-sm focus:border-primary focus:ring-primary/20 bg-background text-text-primary text-sm"
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-text-secondary">
          Showing {filteredLeaveRequests.length} of {leaveRequests.length} leave requests
        </div>
      </div>

      <div className="bg-surface shadow overflow-hidden rounded-lg border border-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-light">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Employee
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Leave Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Days
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Reason
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filteredLeaveRequests.map((request) => (
                <tr key={request.id} className="hover:bg-surface/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{request.employeeId}-{request.name}</div>
                    <div className="text-sm text-text-secondary">{request.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{request.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(request.leaveType)}`}>
                      {request.leaveType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                      {request.startstartDate}
                    </div>
                    <div className="text-sm text-text-secondary">
                      to 
                    </div>
                    <div className="text-sm text-text-secondary">
                      {request.endstartDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{request.days}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-secondary">{request.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {request.status === "Pending" && (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleApproveReject(request.id, "Approved")}
                          className="text-primary hover:text-primary-dark"
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="sr-only">Approve</span>
                        </button>
                        <button
                          onClick={() => openRejectModal(request.id)}
                          className="text-accent hover:text-accent/80"
                        >
                          <ExclamationCircleIcon className="w-5 h-5" />
                          <span className="sr-only">Reject</span>
                        </button>
                      </div>
                    )}
                    {request.status !== "Pending" && (
                      <button
                        onClick={() => openModal(request)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <span className="sr-only">View</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Types Section */}
      

      {/* Modal for adding/editing leave requests */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-surface rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-border">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-text-primary">
                    {isEditing ? "Edit Leave Request" : "New Leave Request"}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="employeeName" className="block text-sm font-medium text-text-secondary">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        name="employeeName"
                        id="employeeName"
                        value={currentLeaveRequest.employeeName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-text-secondary"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={currentLeaveRequest.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-text-secondary"
                      >
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        id="department"
                        value={currentLeaveRequest.department}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                      />
                    </div>
                    <div>
                      <label htmlFor="leaveType" className="block text-sm font-medium text-text-secondary">
                        Leave Type
                      </label>
                      <select
                        name="leaveType"
                        id="leaveType"
                        value={currentLeaveRequest.leaveType}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                      >
                        <option value="">Select Leave Type</option>
                        {leaveTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-text-secondary"
                        >
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={currentLeaveRequest.startDate}
                          onChange={(e) => {
                            handleInputChange(e)
                            setTimeout(calculateDays, 100)
                          }}
                          required
                          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={currentLeaveRequest.endDate}
                          onChange={(e) => {
                            handleInputChange(e)
                            setTimeout(calculateDays, 100)
                          }}
                          required
                          className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="days" className="block text-sm font-medium text-text-secondary">
                        Total Days
                      </label>
                      <input
                        type="number"
                        name="days"
                        id="days"
                        value={currentLeaveRequest.days}
                        onChange={handleInputChange}
                        required
                        readOnly
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 bg-background text-text-primary sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-text-secondary">
                        Reason
                      </label>
                      <textarea
                        name="reason"
                        id="reason"
                        rows="3"
                        value={currentLeaveRequest.reason}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm bg-background text-text-primary"
                      ></textarea>
                    </div>
                    {isEditing && (
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-text-secondary">
                          Status
                        </label>
                        <select
                          name="status"
                          id="status"
                          value={currentLeaveRequest.status}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? "Update" : "Submit"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding/editing leave types */}
      {isLeaveTypeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleLeaveTypeSubmit}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium">
                    {isEditingLeaveType ? "Edit Leave Type" : "Add Leave Type"}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Leave Type Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={currentLeaveType.name}
                        onChange={handleLeaveTypeInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="daysAllowed"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Days Allowed
                      </label>
                      <input
                        type="number"
                        name="daysAllowed"
                        id="daysAllowed"
                        value={currentLeaveType.daysAllowed}
                        onChange={handleLeaveTypeInputChange}
                        required
                        min="1"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditingLeaveType ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={closeLeaveTypeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal for rejecting leave requests */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium">Reject Leave Request</h3>
                <div className="mt-4">
                  <label
                    htmlFor="rejectReason"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Reason for Rejection
                  </label>
                  <textarea
                    id="rejectReason"
                    name="rejectReason"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleRejectSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Submit
                </button>
                <button
                  onClick={closeRejectModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequestSystem

