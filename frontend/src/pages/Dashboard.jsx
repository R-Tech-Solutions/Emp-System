"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Briefcase,
  Building,
  Search,
  AlignJustifyIcon,
  Filter,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Mail,
  ClipboardPlus,
  UserPlus,
  Megaphone,
  UserCircle2,
  ListChecks,
} from "lucide-react";
import axios from "axios";
import { backEndURL } from "../Backendurl";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
  const [assets, setAssets] = useState([]);
  const [employeesData, setEmployeesData] = useState([]); // Initialize as an empty array
  const [departmentStats, setDepartmentStats] = useState([]);
  const [positionStats, setPositionStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [attendanceData, setAttendanceData] = useState([]); // Initialize as an empty array
  const [workingToday, setWorkingToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [onTimeEmployees, setOnTimeEmployees] = useState(0);
  const [lateEmployees, setLateEmployees] = useState(0);
  const [contractData, setContractData] = useState([]); // State for contract details
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]); // State for upcoming birthdays
  const [onLeaveTodayDetails, setOnLeaveTodayDetails] = useState([]);
  const [futureLeaveDetails, setFutureLeaveDetails] = useState([]);
  const [pendingLeaveDetails, setPendingLeaveDetails] = useState([]);
  const [notStartedTasks, setNotStartedTasks] = useState(0);
  const [startedTasks, setStartedTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [overtimeTasks, setOvertimeTasks] = useState(0);

  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/tasks`);
        const tasks = response.data.data || response.data || [];
        setNotStartedTasks(tasks.filter(task => task.status === "not-started").length);
        setStartedTasks(tasks.filter(task => task.status === "started").length);
        setCompletedTasks(tasks.filter(task => task.status === "completed").length);
        setOvertimeTasks(tasks.filter(task => task.status === "overtime").length);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTaskCounts();
  }, []);
  const pieColors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  const [activeWidgets, setActiveWidgets] = useState({
    performance: true,
    attendanceTrend: true,
    leaveTrend: true,
    departmentChart: true,
    contractStatus: true,
    newHires: true,
    exitingEmployees: true,
    teamWorkload: true,
    assets: true,
    holidays: true,
    events: true,
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    department: "",
    position: "",
    status: "",
    contractStatus: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const departmentOptions = useMemo(() => {
    const uniqueDepartments = [
      ...new Set(employeesData.map((emp) => emp.department)),
    ];
    return uniqueDepartments.filter(Boolean).map((dept) => ({
      value: dept,
      label: dept,
    }));
  }, [employeesData]);
  const positionOptions = useMemo(() => {
    const uniquePositions = [
      ...new Set(employeesData.map((emp) => emp.position)),
    ];
    return uniquePositions.filter(Boolean).map((pos) => ({
      value: pos,
      label: pos,
    }));
  }, [employeesData]);
  const toggleWidget = (widget) => {
    setActiveWidgets((prev) => ({
      ...prev,
      [widget]: !prev[widget],
    }));
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        const employees = response.data.data || []; // Ensure data is an array
        setEmployeesData(employees);

        // Calculate department stats
        const departmentMap = {};
        employees.forEach((emp) => {
          if (!departmentMap[emp.department]) {
            departmentMap[emp.department] = 0;
          }
          departmentMap[emp.department] += 1;
        });
        const departments = Object.keys(departmentMap).map((dept) => ({
          name: dept,
          count: departmentMap[dept],
          color: "bg-blue-500", // Default color, can be customized
        }));
        setDepartmentStats(departments);

        // Calculate position stats
        const positionMap = {};
        employees.forEach((emp) => {
          if (!positionMap[emp.position]) {
            positionMap[emp.position] = 0;
          }
          positionMap[emp.position] += 1;
        });
        const totalPositions = employees.length;
        const positions = Object.keys(positionMap).map((pos) => ({
          position: pos,
          count: positionMap[pos],
          percentage: Math.round((positionMap[pos] / totalPositions) * 100),
        }));
        setPositionStats(positions);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get(
          `${backEndURL}/api/employee-work-hours/today-attendance`
        );
        const data = response.data.data || []; // Ensure data is an array
        setAttendanceData(data);
        setWorkingToday(data.filter((emp) => emp.status === "Working").length);
        setOnLeaveToday(data.filter((emp) => emp.status === "Absent").length);
        setOnTimeEmployees(
          data.filter((emp) => emp.attendance === "On Time").length
        );
        setLateEmployees(
          data.filter((emp) => emp.attendance === "Late").length
        );
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };

    fetchAttendanceData();
  }, []);

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        const employees = response.data.data || [];
        setContractData(employees);
      } catch (error) {
        console.error("Error fetching contract data:", error);
      }
    };

    fetchContractData();
  }, []);

  useEffect(() => {
    const fetchUpcomingBirthdays = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        const employees = response.data.data || [];

        const today = new Date();
        const birthdayData = employees
          .filter((employee) => employee.dateOfBirth) // Ensure dateOfBirth exists
          .map((employee) => {
            const birthDate = new Date(employee.dateOfBirth);
            if (isNaN(birthDate)) return null; // Skip invalid dates

            const currentYear = today.getFullYear();
            const nextBirthday = new Date(birthDate);
            nextBirthday.setFullYear(currentYear);

            if (nextBirthday < today) {
              nextBirthday.setFullYear(currentYear + 1);
            }

            const daysUntilBirthday = Math.ceil(
              (nextBirthday - today) / (1000 * 60 * 60 * 24)
            );

            return {
              employeeId: employee.employeeId,
              name: `${employee.firstName} ${employee.lastName}`,
              profilePhoto: employee.profileImage || "/placeholder.svg",
              dateOfBirth: birthDate.toISOString().split("T")[0],
              ageTurning:
                currentYear -
                birthDate.getFullYear() +
                (nextBirthday.getFullYear() > currentYear ? 1 : 0),
              daysUntilBirthday,
            };
          })
          .filter((b) => b !== null); // Remove null entries

        const filteredAndSortedBirthdays = birthdayData
          .filter((b) => b.daysUntilBirthday >= 0)
          .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);

        setUpcomingBirthdays(filteredAndSortedBirthdays);
      } catch (error) {
        console.error("Error fetching upcoming birthdays:", error);
      }
    };

    fetchUpcomingBirthdays();
  }, []);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/leave`);
        const leaveRequests = response.data || [];
        const today = new Date();

        const onLeaveToday = [];
        const futureLeaves = [];
        const pendingLeaves = [];

        leaveRequests.forEach((leave) => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);

          if (leave.status === "Approved") {
            if (today >= startDate && today <= endDate) {
              onLeaveToday.push(leave);
            } else if (today < startDate) {
              futureLeaves.push(leave);
            }
          } else if (leave.status === "Pending") {
            pendingLeaves.push(leave);
          }
        });

        setOnLeaveTodayDetails(onLeaveToday);
        setFutureLeaveDetails(futureLeaves);
        setPendingLeaveDetails(pendingLeaves);
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, []);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/assets`);
        const assetsData = response.data.data || []; // Ensure data is an array
        setAssets(assetsData);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssets();
  }, []);

  const calculateContractDetails = useMemo(() => {
    return contractData.map((employee) => {
      const joinDate = new Date(employee.joinDate);
      const contractEndDate = new Date(joinDate);
      contractEndDate.setMonth(
        contractEndDate.getMonth() + parseInt(employee.contractPeriod)
      );
      if (contractEndDate.getDate() !== joinDate.getDate()) {
        contractEndDate.setDate(0);
      }
      const today = new Date();
      const daysLeft = Math.ceil(
        (contractEndDate - today) / (1000 * 60 * 60 * 24)
      );

      return {
        ...employee,
        contractEndDate: contractEndDate.toISOString().split("T")[0],
        daysLeft,
        status:
          daysLeft < 0
            ? "Expired"
            : daysLeft <= 30
            ? "Nearing Expiry"
            : "Active",
      };
    });
  }, [contractData]);

  const totalEmployees = employeesData.length;

  const filteredEmployees = employeesData.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) || // Ensure employee.name is defined
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) || // Ensure employee.position is defined
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()); // Ensure employee.department is defined

    const matchesStatus =
      filterStatus === "All" || employee.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="bg-gray-800 rounded-lg px-3 py-2 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <br />
        <div className="flex flex-wrap gap-3">
          {/* Add Employee */}
          <Link
            to="/employees"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Employee</span>
          </Link>

          {/* Add User */}
          <Link
            to="/user"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add User</span>
          </Link>

          {/* Add Task */}
          <Link
            to="/tasks"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-yellow-700 transition"
          >
            <ClipboardPlus className="h-5 w-5" />
            <span>Add Task</span>
          </Link>

          {/* Leave Request */}
          <Link
            to="/leave-requests "
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Mail className="h-5 w-5" />
            <span>Leave Request</span>
          </Link>

          {/* Send Announcement */}
          <Link
            to="/messages"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Megaphone className="h-5 w-5" />
            <span>Send Announcement</span>
          </Link>

          {/* Profile */}
          <Link
            to="/my"
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
          >
            <UserCircle2 className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </div>
        <br />
        <br />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Employees",
              count: totalEmployees,
              icon: <Users className="h-6 w-6 text-blue-500" />,
              border: "border-blue-500",
              bg: "bg-blue-500",
            },
            {
              title: "Working Today",
              count: workingToday,
              icon: <UserCheck className="h-6 w-6 text-green-500" />,
              border: "border-green-500",
              bg: "bg-green-500",
            },
            {
              title: "On Leave Today",
              count: onLeaveTodayDetails.length,
              icon: <UserX className="h-6 w-6 text-yellow-500" />,
              border: "border-yellow-500",
              bg: "bg-yellow-500",
              details: onLeaveTodayDetails,
            },
            {
              title: "Future Leaves",
              count: futureLeaveDetails.length,
              icon: <Calendar className="h-6 w-6 text-blue-500" />,
              border: "border-blue-500",
              bg: "bg-blue-500",
              details: futureLeaveDetails,
            },
            {
              title: "Pending Leave Requests",
              count: pendingLeaveDetails.length,
              icon: <AlignJustifyIcon className="h-6 w-6 text-red-500" />,
              border: "border-red-500",
              bg: "bg-red-500",
              details: pendingLeaveDetails,
            },
            {
              title: "Not Started Tasks",
              count: notStartedTasks,
              icon: <ListChecks className="h-5 w-5 text-white" />,
              border: "border-blue-800",
              bg: "bg-blue-800",
            },
            {
              title: "Started Tasks",
              count: startedTasks,
              icon: <ListChecks className="h-5 w-5 text-white" />,
              border: "border-blue-800",
              bg: "bg-blue-800",
            },
            {
              title: "Complete Tasks",
              count: completedTasks,
              icon: <ListChecks className="h-5 w-5 text-white" />,
              border: "border-green-800",
              bg: "bg-green-800",
            },
            {
              title: "Overtime Tasks",
              count: overtimeTasks,
              icon: <ListChecks className="h-5 w-5 text-white" />,
              border: "border-red-800",
              bg: "bg-red-800",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl p-5 shadow-lg  bg-opacity-60 border-l-4 ${item.border} transition-transform transform`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${item.bg} bg-opacity-20`}>
                  {item.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-semibold text-gray-300">
                    {item.title}
                  </h2>
                  <p className="text-2xl font-extrabold text-white">
                    {item.count}
                  </p>
                </div>
              </div>
              {item.details && (
                <div className="mt-4 max-h-32 overflow-y-auto pr-2">
                  {item.details.length === 0 ? (
                    <p className="text-sm text-gray-400">No data available.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-200">
                      {item.details.map((leave) => (
                        <li
                          key={leave.id}
                          className="border-b border-gray-700 pb-1"
                        >
                          <strong>{leave.employeeId}</strong>
                          {leave.employeeName}
                          <br />
                          <span className="text-xs text-gray-400">
                            ({new Date(leave.startDate).toLocaleDateString()} -{" "}
                            {new Date(leave.endDate).toLocaleDateString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="rounded-2xl shadow-lg  mt-6 px-6 py-5">
          <h3 className="text-white text-lg font-semibold mb-4">
            Contract Days Left Overview
          </h3>
          <ResponsiveContainer
            width="100%"
            height={calculateContractDetails.length * 50}
          >
            <BarChart
              layout="vertical"
              data={calculateContractDetails}
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#D1D5DB" />
              <YAxis
                dataKey={(employee) =>
                  `${employee.firstName} ${employee.lastName}`
                }
                type="category"
                stroke="#D1D5DB"
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                }}
                labelStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(3, 3, 3, 0.05)" }}
              />
              <Bar
                dataKey="daysLeft"
                radius={[0, 5, 5, 0]}
                label={{ fill: "#ffffff", position: "Right" }}
              >
                {calculateContractDetails.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === "Expired"
                        ? "#DC2626"
                        : entry.status === "Nearing Expiry"
                        ? "#F59E0B"
                        : "#10B981"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <br />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Distribution - Bar Chart */}
          <div className="rounded-2xl shadow-2xl p-6 ">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Building className="h-6 w-6 mr-2 text-blue-500 drop-shadow-md" />
                Department Distribution
              </h2>
              <span className="text-sm px-3 py-1 bg-blue-700 text-white rounded-full shadow-inner">
                {departmentStats.length} Departments
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1" }}
                />
                <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    color: "#e2e8f0",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Position Distribution - Pie Chart */}
          <div className=" rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-green-400 drop-shadow-md" />
                Position Distribution
              </h2>
              <span className="text-sm text-gray-400">
                Percentage Distribution
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionStats}
                  dataKey="percentage"
                  nameKey="position"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {positionStats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    color: "#e2e8f0",
                  }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Employee Directory
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage and view all employee records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-700 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-3 py-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-sm"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="px-5 py-4 border-b border-gray-700 bg-gray-750">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.department}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        department: e.target.value,
                      })
                    }
                  >
                    <option value="">All Departments</option>
                    {departmentOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Position
                  </label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.position}
                    onChange={(e) =>
                      setAdvancedFilters({
                        ...advancedFilters,
                        position: e.target.value,
                      })
                    }
                  >
                    <option value="">All Positions</option>
                    {positionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() =>
                    setAdvancedFilters({
                      department: "",
                      position: "",
                      status: "",
                      contractStatus: "",
                    })
                  }
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-auto">
              <thead className="text-xs uppercase bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Position</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => {
                    const contractInfo = calculateContractDetails.find(
                      (e) => e.employeeId === employee.employeeId
                    );
                    return (
                      <tr
                        key={employee.id}
                        className={`border-b border-gray-700 ${
                          index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                        } hover:bg-gray-700 transition-colors`}
                      >
                        <td className="px-6 py-4 flex items-center whitespace-nowrap">
                          <img
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                            src={employee.profileImage || "/placeholder.svg"}
                            alt={employee.name}
                          />
                          <div>
                            <span className="font-medium text-white block">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <span className="text-xs text-gray-400">
                              ID: {employee.employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {employee.position}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="text-center">
                    <td colSpan="6" className="px-6 py-6 text-gray-500">
                      No matching employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-3 sm:mb-0">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredEmployees.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {employeesData.length}
              </span>{" "}
              employees
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 bg-gray-700 rounded-md text-sm hover:bg-gray-600 disabled:opacity-50"
                disabled={true} // Implement pagination logic
              >
                Previous
              </button>
              <button
                className="px-3 py-1 bg-blue-600 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={true} // Implement pagination logic
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-700 flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-400" />
                Today's Employee Status
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Live attendance and working status overview
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-700 text-white text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <select
                className="bg-gray-700 text-white text-sm rounded-lg block p-2.5 focus:ring-blue-500 focus:border-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Working">Working</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-auto">
              <thead className="text-xs uppercase bg-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Position</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Attendance</th>
                  <th className="px-6 py-3">Check In</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => (
                    <tr
                      key={employee.id}
                      className={`border-b border-gray-700 ${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                      } hover:bg-gray-700 transition-colors`}
                    >
                      <td className="px-6 py-4 flex items-center whitespace-nowrap">
                        <img
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                          src={employee.avatar || "/placeholder.svg"}
                          alt={employee.name}
                        />
                        <span className="font-medium text-white">
                          {employee.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          title={employee.status}
                          className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-max ${
                            employee.status === "Working"
                              ? "bg-green-900 text-green-300"
                              : "bg-yellow-900 text-yellow-300"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              employee.status === "Working"
                                ? "bg-green-400"
                                : "bg-yellow-400"
                            }`}
                          ></span>
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          title={employee.attendance}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            employee.attendance === "On Time"
                              ? "bg-blue-900 text-blue-300"
                              : employee.attendance === "Late"
                              ? "bg-red-900 text-red-300"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {employee.attendance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {employee.checkIn}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="6" className="px-6 py-6 text-gray-500">
                      No matching employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-3 sm:mb-0">
              Showing{" "}
              <span className="font-semibold text-white">
                {filteredEmployees.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-white">
                {employeesData.length}
              </span>{" "}
              employees
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 bg-gray-700 rounded-md text-sm hover:bg-gray-600 disabled:opacity-50"
                // disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1 bg-blue-600 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                // disabled={currentPage * pageSize >= filteredEmployees.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
            <h4 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              🎂 Upcoming Birthdays
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-800 pr-2">
              {upcomingBirthdays.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-6">
                  No upcoming birthdays
                </div>
              ) : (
                upcomingBirthdays.map((birthday) => (
                  <div
                    key={birthday.employeeId}
                    className="flex items-start p-4 rounded-xl bg-gray-700/60 hover:bg-gray-600 transition-all shadow-inner"
                  >
                    <div className="relative w-12 h-12 mr-4">
                      <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow-md"
                        src={birthday.profilePhoto || "/default-avatar.png"}
                        alt={birthday.firstName}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-pink-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg">
                        {birthday.ageTurning}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm leading-snug">
                        {birthday.name}
                        <span className="text-xs text-gray-400 ml-1">
                          (ID: {birthday.employeeId})
                        </span>
                      </p>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        📅{" "}
                        {new Date(birthday.dateOfBirth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                        <br />
                        🎈 In{" "}
                        <span className="font-semibold text-pink-400">
                          {birthday.daysUntilBirthday}
                        </span>{" "}
                        day(s)
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {activeWidgets.assets && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  Asset Allocation
                </h2>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                  {assets.length} Assets
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs bg-gray-700">
                    <tr>
                      <th className="p-3 text-left">Asset</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Assigned To</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 5).map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b border-gray-700 hover:bg-gray-700"
                      >
                        <td className="p-3">{asset.name}</td>
                        <td className="p-3 capitalize">{asset.type}</td>
                        <td className="p-3">
                          {asset.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <span>{asset.assignedTo}</span>
                            </div>
                          ) : (
                            "Unassigned"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              asset.status === "Active"
                                ? "bg-green-900 text-green-300"
                                : asset.status === "Maintenance"
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {assets.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No asset data available
                </p>
              )}
              {assets.length > 5 && (
                <div className="mt-4 text-right">
                  <button className="text-sm text-blue-400 hover:text-blue-300">
                    View All Assets →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
