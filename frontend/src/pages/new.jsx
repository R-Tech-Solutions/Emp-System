import { useState, useEffect, useMemo, lazy, Suspense } from "react"
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Briefcase,
  Building,
  Search,
  AlignJustifyIcon,
  PlusCircle,
  Bell,
  ClipboardList,
  PieChart,
  BarChart,
  Clock,
  Mail,
  CalendarDays,
  Download,
  Settings,
  ArrowUpDown,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import axios from "axios"
import { backEndURL } from "../Backendurl";

// Replace dynamic imports with React.lazy
const LineChart = lazy(() => import('react-apexcharts').then(mod => ({ default: mod.default })));
const BarChartComponent = lazy(() => import('react-apexcharts').then(mod => ({ default: mod.default })));
const PieChartComponent = lazy(() => import('react-apexcharts').then(mod => ({ default: mod.default })));

export default function AdminDashboard() {
  // Existing state variables
  const [employeesData, setEmployeesData] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [positionStats, setPositionStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [attendanceData, setAttendanceData] = useState([]);
  const [workingToday, setWorkingToday] = useState(0);
  const [onLeaveToday, setOnLeaveToday] = useState(0);
  const [onTimeEmployees, setOnTimeEmployees] = useState(0);
  const [lateEmployees, setLateEmployees] = useState(0);
  const [contractData, setContractData] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [onLeaveTodayDetails, setOnLeaveTodayDetails] = useState([]);
  const [futureLeaveDetails, setFutureLeaveDetails] = useState([]);
  const [pendingLeaveDetails, setPendingLeaveDetails] = useState([]);

  // New state variables for additional features
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [attendanceTrends, setAttendanceTrends] = useState([]);
  const [leaveTrends, setLeaveTrends] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [newHires, setNewHires] = useState([]);
  const [exitingEmployees, setExitingEmployees] = useState([]);
  const [teamWorkload, setTeamWorkload] = useState([]);
  const [assets, setAssets] = useState([]);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
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
    events: true
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    department: '',
    position: '',
    status: '',
    contractStatus: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Chart configurations
  const departmentChartOptions = {
    chart: {
      type: 'pie',
      foreColor: '#fff',
    },
    labels: departmentStats.map(dept => dept.name),
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#fff'
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  const attendanceTrendOptions = {
    chart: {
      type: 'line',
      foreColor: '#fff',
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    colors: ['#3B82F6', '#10B981'],
    legend: {
      position: 'top',
      labels: {
        colors: '#fff'
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const leaveTrendOptions = {
    chart: {
      type: 'bar',
      stacked: true,
      foreColor: '#fff',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    colors: ['#F59E0B', '#EF4444', '#10B981'],
    xaxis: {
      categories: departmentStats.map(dept => dept.name),
    },
    legend: {
      position: 'top',
      labels: {
        colors: '#fff'
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const contractStatusOptions = {
    chart: {
      type: 'donut',
      foreColor: '#fff',
    },
    labels: ['Active', 'Nearing Expiry', 'Expired'],
    colors: ['#10B981', '#F59E0B', '#EF4444'],
    legend: {
      position: 'bottom',
      labels: {
        colors: '#fff'
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Existing data fetches
        const employeesRes = await axios.get(`${backEndURL}/api/employees`);
        const employees = employeesRes.data.data || [];
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

        // Attendance data
        const attendanceRes = await axios.get(`${backEndURL}/api/employee-work-hours/today-attendance`);
        const attendanceData = attendanceRes.data.data || [];
        setAttendanceData(attendanceData);
        setWorkingToday(attendanceData.filter((emp) => emp.status === "Working").length);
        setOnLeaveToday(attendanceData.filter((emp) => emp.status === "Absent").length);
        setOnTimeEmployees(attendanceData.filter((emp) => emp.attendance === "On Time").length);
        setLateEmployees(attendanceData.filter((emp) => emp.attendance === "Late").length);

        // New data fetches
        const performanceRes = await axios.get(`${backEndURL}/api/performance`);
        setPerformanceMetrics(performanceRes.data || []);

        const attendanceTrendRes = await axios.get(`${backEndURL}/api/attendance/trend`);
        setAttendanceTrends(attendanceTrendRes.data || []);

        const leaveTrendRes = await axios.get(`${backEndURL}/api/leave/trend`);
        setLeaveTrends(leaveTrendRes.data || []);

        const holidaysRes = await axios.get(`${backEndURL}/api/holidays`);
        setUpcomingHolidays(holidaysRes.data || []);

        const eventsRes = await axios.get(`${backEndURL}/api/events`);
        setUpcomingEvents(eventsRes.data || []);

        const newHiresRes = await axios.get(`${backEndURL}/api/employees/new-hires`);
        setNewHires(newHiresRes.data || []);

        const exitingRes = await axios.get(`${backEndURL}/api/employees/exiting`);
        setExitingEmployees(exitingRes.data || []);

        const workloadRes = await axios.get(`${backEndURL}/api/team-workload`);
        setTeamWorkload(workloadRes.data || []);

        const assetsRes = await axios.get(`${backEndURL}/api/assets`);
        setAssets(assetsRes.data || []);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  // Calculate contract details
  const calculateContractDetails = useMemo(() => {
    return contractData.map((employee) => {
      const joinDate = new Date(employee.joinDate);
      const contractEndDate = new Date(joinDate);
      contractEndDate.setMonth(contractEndDate.getMonth() + parseInt(employee.contractPeriod));
      if (contractEndDate.getDate() !== joinDate.getDate()) {
        contractEndDate.setDate(0);
      }
      const today = new Date();
      const daysLeft = Math.ceil((contractEndDate - today) / (1000 * 60 * 60 * 24));

      return {
        ...employee,
        contractEndDate: contractEndDate.toISOString().split("T")[0],
        daysLeft,
        status: daysLeft < 0 ? "Expired" : daysLeft <= 30 ? "Nearing Expiry" : "Active",
      };
    });
  }, [contractData]);

  // Filter employees with advanced filters
  const filteredEmployees = useMemo(() => {
    return employeesData.filter((employee) => {
      const matchesSearch =
        (employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.department?.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === "All" || employee.status === filterStatus;

      const matchesAdvancedFilters = (
        (!advancedFilters.department || employee.department === advancedFilters.department) &&
        (!advancedFilters.position || employee.position === advancedFilters.position) &&
        (!advancedFilters.status || employee.status === advancedFilters.status) &&
        (!advancedFilters.contractStatus || 
          (calculateContractDetails.find(e => e.employeeId === employee.employeeId)?.status === advancedFilters.contractStatus))
      );

      return matchesSearch && matchesStatus && matchesAdvancedFilters;
    });
  }, [employeesData, searchTerm, filterStatus, advancedFilters, calculateContractDetails]);

  // Toggle widget visibility
  const toggleWidget = (widget) => {
    setActiveWidgets(prev => ({
      ...prev,
      [widget]: !prev[widget]
    }));
  };

  // Generate department options for filter
  const departmentOptions = useMemo(() => {
    const uniqueDepartments = [...new Set(employeesData.map(emp => emp.department))];
    return uniqueDepartments.filter(Boolean).map(dept => ({
      value: dept,
      label: dept
    }));
  }, [employeesData]);

  // Generate position options for filter
  const positionOptions = useMemo(() => {
    const uniquePositions = [...new Set(employeesData.map(emp => emp.position))];
    return uniquePositions.filter(Boolean).map(pos => ({
      value: pos,
      label: pos
    }));
  }, [employeesData]);

  // Calculate contract status distribution for chart
  const contractStatusData = useMemo(() => {
    const statusCounts = {
      Active: 0,
      'Nearing Expiry': 0,
      Expired: 0
    };

    calculateContractDetails.forEach(emp => {
      statusCounts[emp.status]++;
    });

    return Object.values(statusCounts);
  }, [calculateContractDetails]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button 
              onClick={() => setShowWidgetSettings(!showWidgetSettings)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              title="Customize Dashboard"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              <PlusCircle className="h-5 w-5" />
              <span>Add Employee</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition">
              <Mail className="h-5 w-5" />
              <span>Send Announcement</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
              <Download className="h-5 w-5" />
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Widget Customization Panel */}
        {showWidgetSettings && (
          <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-3">Customize Dashboard</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(activeWidgets).map(([widget, isActive]) => (
                <div key={widget} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`widget-${widget}`}
                    checked={isActive}
                    onChange={() => toggleWidget(widget)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`widget-${widget}`} className="capitalize">
                    {widget.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards - Enhanced with more metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Employees",
              count: employeesData.length,
              icon: <Users className="h-6 w-6 text-blue-500" />,
              border: "border-blue-500",
              bg: "bg-blue-500"
            },
            {
              title: "Working Today",
              count: workingToday,
              icon: <UserCheck className="h-6 w-6 text-green-500" />,
              border: "border-green-500",
              bg: "bg-green-500"
            },
            {
              title: "On Leave Today",
              count: onLeaveTodayDetails.length,
              icon: <UserX className="h-6 w-6 text-yellow-500" />,
              border: "border-yellow-500",
              bg: "bg-yellow-500",
              details: onLeaveTodayDetails
            },
            {
              title: "Pending Approvals",
              count: pendingLeaveDetails.length + performanceMetrics.filter(m => m.needsReview).length,
              icon: <ClipboardList className="h-6 w-6 text-red-500" />,
              border: "border-red-500",
              bg: "bg-red-500",
              details: [
                ...pendingLeaveDetails.map(l => ({ type: 'Leave', id: l.id, name: l.employeeName })),
                ...performanceMetrics.filter(m => m.needsReview).map(m => ({ type: 'Performance', id: m.id, name: m.employeeName }))
              ]
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl p-5 shadow-lg bg-gray-900 bg-opacity-60 border-l-4 ${item.border} transition-transform transform hover:scale-[1.02] duration-300`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${item.bg} bg-opacity-20`}>
                  {item.icon}
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-semibold text-gray-300">{item.title}</h2>
                  <p className="text-2xl font-extrabold text-white">{item.count}</p>
                </div>
              </div>
              {item.details && item.details.length > 0 && (
                <div className="mt-4 max-h-32 overflow-y-auto pr-2">
                  <ul className="space-y-2 text-sm text-gray-200">
                    {item.details.slice(0, 3).map((detail, i) => (
                      <li key={i} className="border-b border-gray-700 pb-1">
                        <span className="font-medium">{detail.type}</span>: {detail.name}
                      </li>
                    ))}
                    {item.details.length > 3 && (
                      <li className="text-xs text-gray-400">+{item.details.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {activeWidgets.attendanceTrend && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Attendance Trends
                </h2>
                <select className="bg-gray-700 text-white text-sm rounded-lg p-2">
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Daily</option>
                </select>
              </div>
              <div className="h-64">
                <Suspense fallback={<div>Loading...</div>}>
                  <LineChart
                    options={attendanceTrendOptions}
                    series={[
                      {
                        name: 'Present',
                        data: attendanceTrends.map(t => t.present)
                      },
                      {
                        name: 'Absent',
                        data: attendanceTrends.map(t => t.absent)
                      }
                    ]}
                    type="line"
                    height="100%"
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Leave Trends */}
          {activeWidgets.leaveTrend && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-yellow-400" />
                  Leave Trends by Department
                </h2>
                <select className="bg-gray-700 text-white text-sm rounded-lg p-2">
                  <option>This Year</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-64">
                <Suspense fallback={<div>Loading...</div>}>
                  <BarChartComponent
                    options={leaveTrendOptions}
                    series={[
                      {
                        name: 'Approved',
                        data: leaveTrends.map(t => t.approved)
                      },
                      {
                        name: 'Rejected',
                        data: leaveTrends.map(t => t.rejected)
                      },
                      {
                        name: 'Pending',
                        data: leaveTrends.map(t => t.pending)
                      }
                    ]}
                    type="bar"
                    height="100%"
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Department Distribution */}
          {activeWidgets.departmentChart && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-400" />
                  Department Distribution
                </h2>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                  {departmentStats.length} Departments
                </span>
              </div>
              <div className="h-64 flex items-center justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                  <PieChartComponent
                    options={departmentChartOptions}
                    series={departmentStats.map(dept => dept.count)}
                    type="pie"
                    height="100%"
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* Contract Status */}
          {activeWidgets.contractStatus && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-400" />
                  Contract Status
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-xs">Active</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-xs">Nearing Expiry</span>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span className="text-xs">Expired</span>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center">
                <Suspense fallback={<div>Loading...</div>}>
                  <PieChartComponent
                    options={contractStatusOptions}
                    series={contractStatusData}
                    type="donut"
                    height="100%"
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>

        {/* New Hires and Exiting Employees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* New Hires */}
          {activeWidgets.newHires && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-400" />
                  New Hires (Last 30 Days)
                </h2>
                <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">
                  {newHires.length} Employees
                </span>
              </div>
              <div className="space-y-4">
                {newHires.slice(0, 5).map((hire) => (
                  <div key={hire.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <img 
                        src={hire.profileImage || "/placeholder.svg"} 
                        alt={hire.name} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium">{hire.firstName} {hire.lastName}</h4>
                        <p className="text-xs text-gray-400">{hire.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(hire.joinDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">
                        {Math.floor((new Date() - new Date(hire.joinDate)) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>
                ))}
                {newHires.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No new hires in the last 30 days</p>
                )}
                {newHires.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View All {newHires.length} New Hires →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exiting Employees */}
          {activeWidgets.exitingEmployees && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-400" />
                  Upcoming Employee Exits
                </h2>
                <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">
                  {exitingEmployees.length} Employees
                </span>
              </div>
              <div className="space-y-4">
                {exitingEmployees.slice(0, 5).map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <img 
                        src={employee.profileImage || "/placeholder.svg"} 
                        alt={employee.name} 
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <h4 className="font-medium">{employee.firstName} {employee.lastName}</h4>
                        <p className="text-xs text-gray-400">
                          {employee.exitType === 'contract' ? 'Contract Ending' : 'Resignation'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(employee.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.floor((new Date(employee.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>
                ))}
                {exitingEmployees.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No upcoming employee exits</p>
                )}
                {exitingEmployees.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View All {exitingEmployees.length} Exits →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Team Workload and Assets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Team Workload */}
          {activeWidgets.teamWorkload && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-purple-400" />
                  Team Workload
                </h2>
                <select className="bg-gray-700 text-white text-sm rounded-lg p-2">
                  <option>All Teams</option>
                  {departmentOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-4">
                {teamWorkload.slice(0, 5).map((team) => (
                  <div key={team.department} className="space-y-2">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{team.department}</h4>
                      <span className="text-sm text-gray-400">
                        {team.currentLoad}/{team.capacity} ({Math.round((team.currentLoad / team.capacity) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          team.currentLoad / team.capacity > 0.9 ? 'bg-red-500' :
                          team.currentLoad / team.capacity > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((team.currentLoad / team.capacity) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {teamWorkload.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No workload data available</p>
                )}
              </div>
            </div>
          )}

          {/* Asset Allocation */}
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
                      <tr key={asset.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3">{asset.name}</td>
                        <td className="p-3 capitalize">{asset.type}</td>
                        <td className="p-3">
                          {asset.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={asset.assignedTo.profileImage || "/placeholder.svg"} 
                                alt={asset.assignedTo.name} 
                                className="w-6 h-6 rounded-full"
                              />
                              <span>{asset.assignedTo.name}</span>
                            </div>
                          ) : 'Unassigned'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            asset.status === 'Active' ? 'bg-green-900 text-green-300' :
                            asset.status === 'Maintenance' ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {assets.length === 0 && (
                <p className="text-center text-gray-400 py-4">No asset data available</p>
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

        {/* Upcoming Holidays and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Holidays */}
          {activeWidgets.holidays && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-yellow-400" />
                  Upcoming Holidays
                </h2>
                <span className="text-xs px-2 py-1 bg-yellow-600 text-white rounded-full">
                  {upcomingHolidays.length} Holidays
                </span>
              </div>
              <div className="space-y-3">
                {upcomingHolidays.slice(0, 5).map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <CalendarDays className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{holiday.name}</h4>
                        <p className="text-xs text-gray-400">{holiday.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.floor((new Date(holiday.date) - new Date()) / (1000 * 60 * 60 * 24))} days away
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingHolidays.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No upcoming holidays</p>
                )}
                {upcomingHolidays.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View All Holidays →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          {activeWidgets.events && (
            <div className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Upcoming Events
                </h2>
                <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                  {upcomingEvents.length} Events
                </span>
              </div>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10">
                        <Calendar className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-xs text-gray-400">{event.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-center text-gray-400 py-4">No upcoming events</p>
                )}
                {upcomingEvents.length > 5 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-400 hover:text-blue-300">
                      View All Events →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Employee Table with Advanced Filters */}
        <div className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Employee Directory
              </h2>
              <p className="text-sm text-gray-400 mt-1">Manage and view all employee records</p>
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
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="px-5 py-4 border-b border-gray-700 bg-gray-750">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.department}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, department: e.target.value})}
                  >
                    <option value="">All Departments</option>
                    {departmentOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.position}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, position: e.target.value})}
                  >
                    <option value="">All Positions</option>
                    {positionOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.status}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contract Status</label>
                  <select
                    className="bg-gray-700 text-white text-sm rounded-lg block w-full p-2.5"
                    value={advancedFilters.contractStatus}
                    onChange={(e) => setAdvancedFilters({...advancedFilters, contractStatus: e.target.value})}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Nearing Expiry">Nearing Expiry</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => setAdvancedFilters({
                    department: '',
                    position: '',
                    status: '',
                    contractStatus: ''
                  })}
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
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Contract</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee, index) => {
                    const contractInfo = calculateContractDetails.find(e => e.employeeId === employee.employeeId);
                    return (
                      <tr
                        key={employee.id}
                        className={`border-b border-gray-700 ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} hover:bg-gray-700 transition-colors`}
                      >
                        <td className="px-6 py-4 flex items-center whitespace-nowrap">
                          <img
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                            src={employee.profileImage || "/placeholder.svg"}
                            alt={employee.name}
                          />
                          <div>
                            <span className="font-medium text-white block">{employee.firstName} {employee.lastName}</span>
                            <span className="text-xs text-gray-400">ID: {employee.employeeId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{employee.department}</td>
                        <td className="px-6 py-4 text-gray-300">{employee.position}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-max ${
                              employee.status === "Active"
                                ? "bg-green-900 text-green-300"
                                : employee.status === "On Leave"
                                  ? "bg-yellow-900 text-yellow-300"
                                  : "bg-red-900 text-red-300"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              employee.status === "Active" ? "bg-green-400" :
                              employee.status === "On Leave" ? "bg-yellow-400" : "bg-red-400"
                            }`}></span>
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contractInfo ? (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                contractInfo.status === "Active"
                                  ? "bg-green-900 text-green-300"
                                  : contractInfo.status === "Nearing Expiry"
                                    ? "bg-yellow-900 text-yellow-300"
                                    : "bg-red-900 text-red-300"
                              }`}
                            >
                              {contractInfo.daysLeft < 0
                                ? "Expired"
                                : `${contractInfo.daysLeft} days left`}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">No contract</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">
                              View
                            </button>
                            <button className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded">
                              Edit
                            </button>
                          </div>
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
              Showing <span className="font-semibold text-white">{filteredEmployees.length}</span> of{" "}
              <span className="font-semibold text-white">{employeesData.length}</span> employees
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
      </div>
    </div>
  );
}