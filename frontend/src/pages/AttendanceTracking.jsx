"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import DotSpinner from "../loaders/Loader"; // Import the loader
import { backEndURL } from "../Backendurl";

export default function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("daily"); // daily, weekly, monthly
  const [expandedEmployees, setExpandedEmployees] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [loading, setLoading] = useState(false); // State for loader
  const [selectedEmployee, setSelectedEmployee] = useState(null); // State for selected employee
  const [showCalendar, setShowCalendar] = useState(false); // State to toggle calendar view

  const toggleEmployeeRecords = (employeeId) => {
    setExpandedEmployees((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  // Fetch employees and attendance data
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true); // Show loader
      try {
        const response = await fetch(`${backEndURL}/api/employees`);
        const data = await response.json();
        if (data.success) {
          setEmployees(data.data);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false); // Hide loader
      }
    };

    const fetchAttendance = async () => {
      setLoading(true); // Show loader
      try {
        const response = await fetch(`${backEndURL}/api/employee-work-hours`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) { 
          setAttendanceRecords(data.data);
        } else {
          console.error("Error in API response:", data.message);
        }
      } catch (error) {
        console.error("Error fetching attendance records:", error);
        alert("Unable to fetch attendance records. Please try again later."); // Display a user-friendly error message
      } finally {
        setLoading(false); // Hide loader
      }
    };

    fetchEmployees();
    fetchAttendance();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate work hours in HH:MM:SS format
  const formatWorkHours = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`; // Ensure correct formatting
  };

  // Get date range for the current view
  const getDateRange = () => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);

    if (viewMode === "daily") {
      return formatDate(startDate);
    } else if (viewMode === "weekly") {
      const day = startDate.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Monday as the start of the week
      startDate.setDate(startDate.getDate() + diffToMonday);
      endDate.setDate(startDate.getDate() + 6);
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } else if (viewMode === "monthly") {
      return startDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
  };

  // Filter attendance records based on the selected view
  const getFilteredAttendanceRecords = () => {
    const filteredRecords = [];
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);

    if (viewMode === "daily") {
      const dateString = startDate.toISOString().split("T")[0];
      attendanceRecords.forEach((record) => {
        if (record.workHours && record.workHours[dateString]) { // Add check for workHours
          filteredRecords.push({ ...record, date: dateString });
        }
      });
    } else if (viewMode === "weekly") {
      const day = startDate.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Monday as the start of the week
      startDate.setDate(startDate.getDate() + diffToMonday);
      endDate.setDate(startDate.getDate() + 6);

      attendanceRecords.forEach((record) => {
        if (record.workHours) { // Add check for workHours
          Object.keys(record.workHours).forEach((date) => {
            const recordDate = new Date(date);
            if (recordDate >= startDate && recordDate <= endDate) {
              filteredRecords.push({ ...record, date });
            }
          });
        }
      });
    } else if (viewMode === "monthly") {
      const year = startDate.getFullYear();
      const month = startDate.getMonth();

      attendanceRecords.forEach((record) => {
        if (record.workHours) { // Add check for workHours
          Object.keys(record.workHours).forEach((date) => {
            const recordDate = new Date(date);
            if (
              recordDate.getFullYear() === year &&
              recordDate.getMonth() === month
            ) {
              filteredRecords.push({ ...record, date });
            }
          });
        }
      });
    }

    return filteredRecords;
  };

  // Handle date navigation
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);

    if (viewMode === "daily") {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (viewMode === "monthly") {
      newDate.setMonth(newDate.getMonth() + direction);
    }

    setSelectedDate(newDate);
  };

  const calculateTotalHours = (employeeRecords) => {
    return employeeRecords.reduce((total, record) => {
      const workHours = record.workHours[record.date] || 0; // Work hours are stored in seconds
      return total + workHours;
    }, 0);
  };

  const sendMonthlyTotalToBackend = async (employeeId, totalHours) => {
    try {
      const currentMonth = new Date().toLocaleString("default", { month: "long" });
      const response = await fetch(`${backEndURL}/api/employee-work-hours/update-monthly-total`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          month: currentMonth,
          totalHours,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Total work hours for ${currentMonth} saved successfully!`);
      } else {
        console.error("Error saving monthly total:", data.message);
        alert("Failed to save monthly total. Please try again.");
      }
    } catch (error) {
      console.error("Error sending monthly total to backend:", error);
      alert("An error occurred while saving the monthly total.");
    }
  };

  const calculateAndSendMonthlyTotal = (employee) => {
    const currentMonth = selectedDate.getMonth(); // Use selectedDate for consistency
    const currentYear = selectedDate.getFullYear();

    const monthlyRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.employeeId === employee.employeeId &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    const totalHours = monthlyRecords.reduce((total, record) => {
      const workHours = record.workHours[record.date] || 0;
      return total + workHours; // Ensure correct total in seconds
    }, 0);

    sendMonthlyTotalToBackend(employee.employeeId, totalHours); // Send correct totalHours in seconds
  };

  const filteredRecords = getFilteredAttendanceRecords();

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) =>
    employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle employee click and show calendar
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setShowCalendar(true);
  };

  // Function to get attendance days for the selected employee
  const getAttendanceDays = () => {
    if (!selectedEmployee) return { present: [], absent: [] };

    const presentDays = [];
    const absentDays = [];
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => new Date(currentYear, currentMonth, i + 1));

    allDays.forEach((day) => {
      const dayString = day.toISOString().split("T")[0];
      const isPresent = attendanceRecords.some(
        (record) =>
          record.employeeId === selectedEmployee.employeeId &&
          record.workHours[dayString]
      );

      if (isPresent) {
        presentDays.push(day);
      } else {
        absentDays.push(day);
      }
    });

    return { present: presentDays, absent: absentDays };
  };

  // Function to render the calendar
  const renderCalendar = () => {
    const { present, absent } = getAttendanceDays();

    if (viewMode === "daily") {
      return null; // Hide daily clicks
    }

    if (viewMode === "weekly") {
      const startOfWeek = new Date(selectedDate);
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekDays = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));

      return (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Weekly Attendance for {selectedEmployee.firstName} {selectedEmployee.lastName}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const isPresent = present.some(
                (presentDay) =>
                  presentDay.getDate() === day.getDate() &&
                  presentDay.getMonth() === day.getMonth() &&
                  presentDay.getFullYear() === day.getFullYear()
              );

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${
                    isPresent ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short", day: "numeric" })}
                </div>
              );
            })}
          </div>
          <button
            className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
            onClick={() => setShowCalendar(false)}
          >
            Close
          </button>
        </div>
      );
    }

    if (viewMode === "monthly") {
      const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();

      return (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">
            Monthly Attendance for {selectedEmployee.firstName} {selectedEmployee.lastName}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
              const isPresent = present.some(
                (presentDay) =>
                  presentDay.getDate() === day.getDate() &&
                  presentDay.getMonth() === day.getMonth() &&
                  presentDay.getFullYear() === day.getFullYear()
              );

              return (
                <div
                  key={i}
                  className={`p-2 rounded-lg ${
                    isPresent ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>
          <button
            className="mt-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
            onClick={() => setShowCalendar(false)}
          >
            Close
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Search bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search by Employee ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none"
        />
      </div>

      {/* Date navigation */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <button
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
            onClick={() => navigateDate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-xl font-semibold">{getDateRange()}</div>

          <button
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
            onClick={() => navigateDate(1)}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg ml-2"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </button>
        </div>

        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-lg ${
              viewMode === "daily"
                ? "bg-indigo-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setViewMode("daily")}
          >
            Daily
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              viewMode === "weekly"
                ? "bg-indigo-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${
              viewMode === "monthly"
                ? "bg-indigo-600"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => setViewMode("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {showCalendar && selectedEmployee ? (
        renderCalendar()
      ) : (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <DotSpinner /> {/* Show loader while data is being fetched */}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-xl">No attendance records found</p>
              <p className="mt-2">
                Try adjusting your search criteria or date range
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">Position</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Work Hours</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => {
                    const employeeRecords = filteredRecords.filter(
                      (record) => record.employeeId === employee.employeeId
                    );

                    if (employeeRecords.length === 0) return null;

                    const totalHoursInSeconds = calculateTotalHours(employeeRecords); // Total in seconds

                    return (
                      <React.Fragment key={employee.employeeId}>
                        <tr
                          className="bg-gray-800 border-b border-gray-700 hover:bg-gray-750 cursor-pointer"
                          onClick={() => handleEmployeeClick(employee)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                                <img
                                  src={`${employee.profileImage}`}
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {employee.firstName} {employee.lastName}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {employee.employeeId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{employee.department}</td>
                          <td className="px-4 py-3">{employee.position}</td>
                          <td></td>
                          <td className="px-4 py-3 font-bold">
                            Total: {formatWorkHours(totalHoursInSeconds)} {/* Display in HH:MM:SS */}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEmployeeRecords(employee.employeeId);
                              }}
                            >
                              <ChevronDown className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                        {expandedEmployees[employee.employeeId] &&
                          employeeRecords.map((record) => (
                            <tr
                              key={`${record.employeeId}-${record.date}`}
                              className="bg-gray-700 border-b border-gray-600"
                            >
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3"></td>
                              <td className="px-4 py-3">{formatDate(record.date)}</td>
                              <td className="px-4 py-3">
                                {formatWorkHours(record.workHours[record.date])} {/* Display daily work hours */}
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );  
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
