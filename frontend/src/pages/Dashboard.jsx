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
// import PermissionDebug from '../components/PermissionDebug';

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
        const response = await axios.get(`${backEndURL}/api/attendance`);
        const data = response.data || []; // Ensure data is an array
        setAttendanceData(data); // Set all attendance records
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
          .filter((employee) => {
            // Check if dateOfBirth exists and is a valid date string
            if (!employee.dateOfBirth) return false;
            const birthDate = new Date(employee.dateOfBirth);
            return !isNaN(birthDate.getTime()); // Only keep valid dates
          })
          .map((employee) => {
            const birthDate = new Date(employee.dateOfBirth);
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
          });

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

  // Calculate workingToday from attendanceData (status === "Present")
  useEffect(() => {
    const presentCount = attendanceData.filter(emp => emp.status === "Present").length;
    setWorkingToday(presentCount);
  }, [attendanceData]);

  // Fetch leave data and calculate On Leave Today and Future Leaves (per-day granularity)
  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const response = await axios.get(`${backEndURL}/api/leave`);
        const leaveRequests = response.data || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper to get all dates in a leave period
        const getDatesInRange = (start, end) => {
          const dates = [];
          let current = new Date(start);
          current.setHours(0, 0, 0, 0);
          const last = new Date(end);
          last.setHours(0, 0, 0, 0);
          while (current <= last) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
          return dates;
        };

        // For On Leave Today and Future Leaves (per day)
        const onLeaveTodayArr = [];
        const futureLeaveArr = [];

        leaveRequests.forEach((leave) => {
          if (leave.status !== "Approved") return;
          const startDate = new Date(leave.startDate || leave.startstartDate);
          const endDate = new Date(leave.endDate || leave.endstartDate);
          if (isNaN(startDate) || isNaN(endDate)) return;
          const leaveDates = getDatesInRange(startDate, endDate);

          leaveDates.forEach(date => {
            date.setHours(0, 0, 0, 0);
            if (date.getTime() === today.getTime()) {
              onLeaveTodayArr.push({
                ...leave,
                leaveDate: new Date(date),
              });
            } else if (date.getTime() > today.getTime()) {
              futureLeaveArr.push({
                ...leave,
                leaveDate: new Date(date),
              });
            }
          });
        });

        setOnLeaveTodayDetails(onLeaveTodayArr);
        setFutureLeaveDetails(futureLeaveArr);
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
    return contractData
      .filter((employee) => employee.joinDate) // Filter out employees without joinDate
      .map((employee) => {
        try {
          const joinDate = new Date(employee.joinDate);
          if (isNaN(joinDate.getTime())) return null; // Skip invalid dates

          const contractEndDate = new Date(joinDate);
          contractEndDate.setMonth(
            contractEndDate.getMonth() + parseInt(employee.contractPeriod || 0)
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
        } catch (error) {
          console.error("Error processing contract for employee:", employee.employeeId, error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null entries
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

  useEffect(() => {
    const fetchAttendanceAndEmployees = async () => {
      try {
        const [attendanceResponse, employeesResponse] = await Promise.all([
          axios.get(`${backEndURL}/api/attendance`),
          axios.get(`${backEndURL}/api/employees`),
        ]);

        const attendance = attendanceResponse.data || [];
        const employees = employeesResponse.data.data || [];

        // Match attendance with employee details
        const matchedData = attendance
          .filter((record) => {
            const today = new Date().toISOString().split("T")[0];
            return record.date && record.date.split("T")[0] === today; // Add null check for record.date
          })
          .map((record) => {
            const employee = employees.find(
              (emp) => emp.email === record.employeeEmail
            );
            if (employee) {
              return {
                firstName: employee.firstName,
                lastName: employee.lastName,
                department: employee.department,
                position: employee.position,
                status: record.isAttend ? "Present" : "Absent",
              };
            }
            return null;
          })
          .filter(Boolean); // Remove null entries

        setAttendanceData(matchedData);
      } catch (error) {
        console.error("Error fetching attendance or employee data:", error);
      }
    };

    fetchAttendanceAndEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Debug Component - Remove this after testing */}
      {/* <PermissionDebug /> */}
      
      {/* Header */}
      <header className="bg-surface shadow-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-2">Welcome back! Here's what's happening today.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="bg-surface rounded-lg px-3 py-2 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span className="text-text-secondary">
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
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Employee</span>
          </Link>

          {/* Add User */}
          <Link
            to="/user"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-primary-light transition"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add User</span>
          </Link>

          {/* Add Task */}
          <Link
            to="/tasks"
            className="flex items-center gap-2 px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-primary-light transition"
          >
            <ClipboardPlus className="h-5 w-5" />
            <span>Add Task</span>
          </Link>

          {/* Leave Request */}
          <Link
            to="/leave-requests "
            className="flex items-center gap-2 px-4 py-2 bg-primary-light text-text-primary rounded-lg hover:bg-primary transition"
          >
            <Mail className="h-5 w-5" />
            <span>Leave Request</span>
          </Link>

          {/* Send Announcement */}
          <Link
            to="/messages"
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-text-primary rounded-lg hover:bg-primary-light transition"
          >
            <Megaphone className="h-5 w-5" />
            <span>Send Announcement</span>
          </Link>

          {/* Profile */}
          <Link
            to="/my"
            className="flex items-center gap-2 px-4 py-2 bg-surface text-text-primary rounded-lg hover:bg-primary-light transition"
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
              icon: <Users className="h-6 w-6 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
            {
              title: "Working Today",
              count: workingToday,
              icon: <UserCheck className="h-6 w-6 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
            {
              title: "On Leave Today",
              count: onLeaveTodayDetails.length,
              icon: <UserX className="h-6 w-6 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
              details: onLeaveTodayDetails,
            },
            {
              title: "Future Leaves",
              count: futureLeaveDetails.length,
              icon: <Calendar className="h-6 w-6 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
              details: futureLeaveDetails,
            },
            {
              title: "Pending Leave Requests",
              count: pendingLeaveDetails.length,
              icon: <AlignJustifyIcon className="h-6 w-6 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
              details: pendingLeaveDetails,
            },
            {
              title: "Not Started Tasks",
              count: notStartedTasks,
              icon: <ListChecks className="h-5 w-5 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
            {
              title: "Started Tasks",
              count: startedTasks,
              icon: <ListChecks className="h-5 w-5 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
            {
              title: "Complete Tasks",
              count: completedTasks,
              icon: <ListChecks className="h-5 w-5 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
            {
              title: "Overtime Tasks",
              count: overtimeTasks,
              icon: <ListChecks className="h-5 w-5 text-primary" />,
              border: "border-primary",
              bg: "bg-primary-light",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl p-5 shadow-lg bg-surface border-l-4 ${item.border} transition-transform transform`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${item.bg}`}>
                  {item.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-semibold text-text-secondary">
                    {item.title}
                  </h2>
                  <p className="text-2xl font-extrabold text-text-primary">
                    {item.count}
                  </p>
                </div>
              </div>
              {item.details && (
                <div className="mt-4 max-h-32 overflow-y-auto pr-2">
                  {item.details.length === 0 ? (
                    <p className="text-sm text-text-muted"></p>
                  ) : (
                    <ul className="space-y-2 text-sm text-text-secondary">
                      {item.details.map((leave, idx) => (
                        <li
                          key={leave.id + "-" + (leave.leaveDate ? leave.leaveDate.toISOString() : idx)}
                          className="border-b border-border pb-1"
                        >
                          <strong>{leave.employeeId}</strong>{" "}
                          {leave.employeeName || leave.name}
                          <br />
                          <span className="text-xs text-text-muted">
                            ({leave.leaveDate
                              ? new Date(leave.leaveDate).toLocaleDateString()
                              : ""}
                            )
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
        <div className="rounded-2xl shadow-lg mt-6 px-6 py-5 bg-surface">
          <h3 className="text-text-primary text-lg font-semibold mb-4">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#D9C9D6" />
              <XAxis type="number" stroke="#5A5A5A" />
              <YAxis
                dataKey={(employee) =>
                  `${employee.firstName} ${employee.lastName}`
                }
                type="category"
                stroke="#5A5A5A"
                width={150}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF8FA",
                  borderColor: "#D9C9D6",
                  color: "#2D2D2D",
                }}
                labelStyle={{ color: "#2D2D2D" }}
                cursor={{ fill: "rgba(203, 168, 198, 0.1)" }}
              />
              <Bar
                dataKey="daysLeft"
                radius={[0, 5, 5, 0]}
                label={{ fill: "#2D2D2D", position: "Right" }}
              >
                {calculateContractDetails.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === "Expired"
                        ? "#875A7B"
                        : entry.status === "Nearing Expiry"
                          ? "#CBA8C6"
                          : "#D8BFD8"
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
          <div className="rounded-2xl shadow-2xl p-6 bg-surface">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary flex items-center">
                <Building className="h-6 w-6 mr-2 text-primary drop-shadow-md" />
                Department Distribution
              </h2>
              <span className="text-sm px-3 py-1 bg-primary text-white rounded-full shadow-inner">
                {departmentStats.length} Departments
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <XAxis
                  dataKey="name"
                  stroke="#5A5A5A"
                  tick={{ fill: "#2D2D2D" }}
                />
                <YAxis stroke="#5A5A5A" tick={{ fill: "#2D2D2D" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF8FA",
                    borderColor: "#D9C9D6",
                    color: "#2D2D2D",
                  }}
                  labelStyle={{ color: "#2D2D2D" }}
                />
                <Bar dataKey="count" fill="#875A7B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Position Distribution - Pie Chart */}
          <div className="rounded-2xl shadow-2xl p-6 bg-surface">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text-primary flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-primary drop-shadow-md" />
                Position Distribution
              </h2>
              <span className="text-sm text-text-secondary">
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
                      fill={[
                        "#875A7B", // Primary
                        "#F5EDF2", // Primary Light
                        "#6C4462", // Primary Dark
                        "#CBA8C6", // Secondary
                        "#D8BFD8", // Accent
                      ][index % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FAF8FA",
                    borderColor: "#D9C9D6",
                    color: "#2D2D2D",
                  }}
                  labelStyle={{ color: "#2D2D2D" }}
                />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ color: "#2D2D2D" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-surface rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-primary" />
                Today's Employee Status
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Live attendance and working status overview
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  type="text"
                  className="bg-surface text-text-primary text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary placeholder-text-muted border border-border"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Dropdown */}
              <select
                className="bg-surface text-text-primary text-sm rounded-lg block p-2.5 focus:ring-primary focus:border-primary border border-border"
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
              <thead className="text-xs uppercase bg-primary-light sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-text-primary">Employee</th>
                  <th className="px-6 py-3 text-text-primary">Department</th>
                  <th className="px-6 py-3 text-text-primary">Position</th>
                  <th className="px-6 py-3 text-text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((employee, index) => (
                    <tr
                      key={index}
                      className={`border-b border-border ${index % 2 === 0 ? "bg-surface" : "bg-primary-light"} hover:bg-secondary/20 transition-colors`}
                    >
                      <td className="px-6 py-4 flex items-center whitespace-nowrap">
                        <span className="font-medium text-text-primary">
                          {employee.firstName} {employee.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{employee.department}</td>
                      <td className="px-6 py-4 text-text-secondary">{employee.position}</td>
                      <td className="px-6 py-4">
                        <span
                          title={employee.status}
                          className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-max ${
                            employee.status === "Present"
                              ? "bg-primary-light text-primary"
                              : "bg-accent text-primary"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              employee.status === "Present"
                                ? "bg-primary"
                                : "bg-primary"
                            }`}
                          ></span>
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="6" className="px-6 py-6 text-text-muted">
                      No attendance records found for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 bg-surface border-t border-border flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 bg-primary-light text-text-primary rounded-md text-sm hover:bg-primary hover:text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-border flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Employee Directory
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Manage and view all employee records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  type="text"
                  className="bg-surface text-text-primary text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary placeholder-text-muted border border-border"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2 px-3 py-2.5 bg-primary-light text-text-primary rounded-lg hover:bg-primary hover:text-white transition text-sm"
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
            <div className="px-5 py-4 border-b border-border bg-primary-light/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Department
                  </label>
                  <select
                    className="bg-surface text-text-primary text-sm rounded-lg block w-full p-2.5 border border-border"
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
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Position
                  </label>
                  <select
                    className="bg-surface text-text-primary text-sm rounded-lg block w-full p-2.5 border border-border"
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
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left table-auto">
              <thead className="text-xs uppercase bg-primary-light sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-text-primary">Employee</th>
                  <th className="px-6 py-3 text-text-primary">Department</th>
                  <th className="px-6 py-3 text-text-primary">Position</th>
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
                        className={`border-b border-border ${
                          index % 2 === 0 ? "bg-surface" : "bg-primary-light"
                        } hover:bg-secondary/20 transition-colors`}
                      >
                        <td className="px-6 py-4 flex items-center whitespace-nowrap">
                          <img
                            className="w-8 h-8 rounded-full mr-3 object-cover border-2 border-primary-light"
                            src={employee.profileImage || "/placeholder.svg"}
                            alt={employee.name}
                          />
                          <div>
                            <span className="font-medium text-text-primary block">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <span className="text-xs text-text-muted">
                              ID: {employee.employeeId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {employee.department}
                        </td>
                        <td className="px-6 py-4 text-text-secondary">
                          {employee.position}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="text-center">
                    <td colSpan="6" className="px-6 py-6 text-text-muted">
                      No matching employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 bg-surface border-t border-border flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 bg-primary-light text-text-primary rounded-md text-sm hover:bg-primary hover:text-white disabled:opacity-50"
              >
                Previous
              </button>
              <button
                className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface rounded-2xl shadow-xl p-6 transition-transform hover:scale-[1.01]">
            <h4 className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2">
              🎂 Upcoming Birthdays
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary scrollbar-track-surface pr-2">
              {upcomingBirthdays.length === 0 ? (
                <div className="text-text-muted text-sm text-center py-6">
                  No upcoming birthdays
                </div>
              ) : (
                upcomingBirthdays.map((birthday) => (
                  <div
                    key={birthday.employeeId}
                    className="flex items-start p-4 rounded-xl bg-primary-light/30 hover:bg-primary-light/50 transition-all shadow-inner"
                  >
                    <div className="relative w-12 h-12 mr-4">
                      <img
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary shadow-md"
                        src={birthday.profilePhoto || "/default-avatar.png"}
                        alt={birthday.firstName}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg">
                        {birthday.ageTurning}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary font-medium text-sm leading-snug">
                        {birthday.name}
                        <span className="text-xs text-text-muted ml-1">
                          (ID: {birthday.employeeId})
                        </span>
                      </p>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
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
                        <span className="font-semibold text-primary">
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
            <div className="bg-surface rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Asset Allocation
                </h2>
                <span className="text-xs px-2 py-1 bg-primary text-white rounded-full">
                  {assets.length} Assets
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs bg-primary-light">
                    <tr>
                      <th className="p-3 text-left text-text-primary">Asset</th>
                      <th className="p-3 text-left text-text-primary">Type</th>
                      <th className="p-3 text-left text-text-primary">Assigned To</th>
                      <th className="p-3 text-left text-text-primary">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 5).map((asset) => (
                      <tr
                        key={asset.id}
                        className="border-b border-border hover:bg-primary-light/30"
                      >
                        <td className="p-3 text-text-primary">{asset.name}</td>
                        <td className="p-3 text-text-secondary capitalize">{asset.type}</td>
                        <td className="p-3 text-text-secondary">
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
                                ? "bg-primary-light text-primary"
                                : asset.status === "Maintenance"
                                ? "bg-accent text-primary"
                                : "bg-primary-light text-primary"
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
                <p className="text-center text-text-muted py-4">
                  No asset data available
                </p>
              )}
              {assets.length > 5 && (
                <div className="mt-4 text-right">
                  <button className="text-sm text-primary hover:text-primary-dark">
                    View All Assets →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  );
}
