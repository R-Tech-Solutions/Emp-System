import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { backEndURL } from "../Backendurl";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  FileIcon as FilePdf,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  RefreshCw,
  Users,
} from "lucide-react";
import DotSpinner from "../loaders/Loader"; // Import the loader
import { motion, AnimatePresence } from "framer-motion";

export default function ReportsDashboard() {
  // State for managing which reports are expanded
  const [expandedReports, setExpandedReports] = useState({
    employeeMaster: true,
    departmentWise: false,
    designationWise: false,
    employeeContact: false,
    dailyAttendance: false,
    monthlySummary: false,
    lateComers: false,
    absenteeism: false,
    leaveSummary: false,
    salaryRegister: false,
    payslip: false,
    overtime: false,
    performanceEvaluation: false,
    appraisalHistory: false,
    workAnniversary: false,
    birthday: false,
  });

  const [employeeMasterData, setEmployeeMasterData] = useState([]);
  const [departmentWiseData, setDepartmentWiseData] = useState([]);
  const [designationWiseData, setDesignationWiseData] = useState([]);
  const [employeeContactData, setEmployeeContactData] = useState([]);
  const [workAnniversaryData, setWorkAnniversaryData] = useState([]);
  const [birthdayData, setBirthdayData] = useState([]);
  const [workHoursOpen, setWorkHoursOpen] = useState(true);


  // Loading states for each report
  const [loadingStates, setLoadingStates] = useState({
    employeeMaster: false,
    departmentWise: false,
    designationWise: false,
    employeeContact: false,
    workAnniversary: false,
    birthday: false,
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [workHoursData, setWorkHoursData] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeWorkHours, setEmployeeWorkHours] = useState({});
  const [loadingWorkHours, setLoadingWorkHours] = useState(false);

  const [months, setMonths] = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const fetchEmployeeWorkHours = async (employeeId) => {
    setLoadingWorkHours(true);
    try {
      const response = await axios.get(
        `${backEndURL}/api/employee-work-hours/${employeeId}`
      );
      if (response.data && response.data.success) {
        setEmployeeWorkHours(response.data.data.workHours || {});
      } else {
        setEmployeeWorkHours({});
      }
    } catch (error) {
      console.error("Error fetching employee work hours:", error);
      setEmployeeWorkHours({});
    } finally {
      setLoadingWorkHours(false);
    }
  };
  const calculateMonthlyTaskHours = (tasks, shifts, selectedYear, employeeId) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Filter shifts by employeeId first
    const employeeShifts = shifts.filter(shift =>
      shift.employeeId === employeeId
    );

    // Initialize task map with all months set to 0 hours
    const taskMap = tasks.reduce((acc, task) => {
      // Only include tasks that belong to this employee
      if (task.employee_id === employeeId) {
        acc[task.name] = months.reduce((monthAcc, month) => {
          monthAcc[month] = 0; // Initialize all months to 0 hours
          return monthAcc;
        }, {});
      }
      return acc;
    }, {});

    // Process each shift to calculate monthly hours
    employeeShifts.forEach(shift => {
      if (shift.date?._seconds) {
        const shiftDate = new Date(shift.date._seconds * 1000);
        const shiftYear = shiftDate.getFullYear();
        const shiftMonth = shiftDate.getMonth(); // 0-11
        const monthName = months[shiftMonth];

        if (shiftYear === parseInt(selectedYear)) {
          const taskName = shift.taskName?.trim() || "Unknown Task";
          const hoursWorked = shift.totalSpentTime ?
            shift.totalSpentTime / 3600 : // Convert seconds to hours
            (shift.endTime?._seconds - shift.startTime?._seconds) / 3600 || 0;

          // Add hours to the corresponding task and month
          if (taskMap[taskName]) {
            taskMap[taskName][monthName] += hoursWorked;
          } else {
            // If task not in initial list but belongs to employee, initialize it
            taskMap[taskName] = months.reduce((monthAcc, month) => {
              monthAcc[month] = month === monthName ? hoursWorked : 0;
              return monthAcc;
            }, {});
          }
        }
      }
    });

    return { taskMap, months };
  };

  const downloadYearlyTaskExcel = (employee, year, tasks, shifts) => {
    const { taskMap, months } = processYearlyTaskData(tasks, shifts, year);

    // Prepare data for Excel
    const headers = ['Task Name', ...months, 'Total'];
    const rows = Object.entries(taskMap).map(([taskName, monthData]) => {
      const total = Object.values(monthData).reduce((sum, hours) => sum + hours, 0);
      return [taskName, ...months.map(month => monthData[month].toFixed(2)), total.toFixed(2)];
    });

    // Add employee info at the top
    const sheetData = [
      [`Employee ID: ${employee.id}`, `Employee Name: ${employee.name}`, `Year: ${year}`],
      [],
      headers,
      ...rows
    ];

    // Generate Excel file
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${employee.name}_Yearly`);
    XLSX.writeFile(workbook, `${employee.name}_Tasks_${year}.xlsx`);
  };

  // Modify your shift fetching function to get full year data


  const processYearlyTaskData = (tasks, shifts, selectedYear) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Initialize task map with all months set to 0 hours
    const taskMap = tasks.reduce((acc, task) => {
      acc[task.name] = months.reduce((monthAcc, month) => {
        monthAcc[month] = 0;
        return monthAcc;
      }, {});
      return acc;
    }, {});

    // Process shifts to calculate hours per task per month
    shifts.forEach(shift => {
      if (shift.date?._seconds) {
        const shiftDate = new Date(shift.date._seconds * 1000);
        const shiftYear = shiftDate.getFullYear();
        const shiftMonth = shiftDate.getMonth(); // 0-11

        if (shiftYear === selectedYear) {
          const monthName = months[shiftMonth];
          const taskName = shift.taskName?.trim() || "Unknown Task";

          // Calculate hours worked (convert seconds to hours)
          const hoursWorked = shift.totalSpentTime ?
            shift.totalSpentTime / 3600 :
            (shift.endTime?._seconds - shift.startTime?._seconds) / 3600 || 0;

          // Add to task map
          if (taskMap[taskName]) {
            taskMap[taskName][monthName] += hoursWorked;
          } else {
            // Handle case where task isn't in initial task list
            taskMap[taskName] = months.reduce((monthAcc, month) => {
              monthAcc[month] = month === monthName ? hoursWorked : 0;
              return monthAcc;
            }, {});
          }
        }
      }
    });

    return { taskMap, months };
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await axios.get(`${backEndURL}/api/employees`);
        if (response.data && Array.isArray(response.data.data)) {
          const employees = response.data.data.map((employee) => ({
            id: employee.employeeId,
            name: `${employee.firstName} ${employee.lastName}`,
          }));
          setWorkHoursData(employees);
        } else {
          console.error("Unexpected API response format:", response.data);
          setWorkHoursData([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    // Dynamically fetch months based on the selected year
    const fetchMonths = () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth(); // 0-based index for months
      let availableMonths;

      if (selectedYear < currentYear) {
        availableMonths = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
      } else {
        availableMonths = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].slice(0, currentMonth + 1);
      }

      setMonths(availableMonths);
    };

    fetchMonths();
  }, [selectedYear]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, employeeMaster: true }));
        const employeeMasterRes = await axios.get(
          `${backEndURL}/api/employees/reports/employee-master`
        );
        setEmployeeMasterData(employeeMasterRes.data.data);
        setLoadingStates((prev) => ({ ...prev, employeeMaster: false }));

        setLoadingStates((prev) => ({ ...prev, departmentWise: true }));
        const departmentWiseRes = await axios.get(
          `${backEndURL}/api/employees/reports/department-wise`
        );
        setDepartmentWiseData(departmentWiseRes.data.data);
        setLoadingStates((prev) => ({ ...prev, departmentWise: false }));

        setLoadingStates((prev) => ({ ...prev, designationWise: true }));
        const designationWiseRes = await axios.get(
          `${backEndURL}/api/employees/reports/position-wise`
        );
        setDesignationWiseData(designationWiseRes.data.data);
        setLoadingStates((prev) => ({ ...prev, designationWise: false }));

        setLoadingStates((prev) => ({ ...prev, employeeContact: true }));
        const employeeContactRes = await axios.get(
          `${backEndURL}/api/employees/reports/employee-contact`
        );
        setEmployeeContactData(employeeContactRes.data.data);
        setLoadingStates((prev) => ({ ...prev, employeeContact: false }));

        setLoadingStates((prev) => ({ ...prev, workAnniversary: true }));
        const workAnniversaryRes = await axios.get(
          `${backEndURL}/api/employees/reports/work-anniversary`
        );
        setWorkAnniversaryData(workAnniversaryRes.data.data);
        setLoadingStates((prev) => ({ ...prev, workAnniversary: false }));

        setLoadingStates((prev) => ({ ...prev, birthday: true }));
        const birthdayRes = await axios.get(
          `${backEndURL}/api/employees/reports/birthday`
        );
        setBirthdayData(birthdayRes.data.data);
        setLoadingStates((prev) => ({ ...prev, birthday: false }));
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const toggleReport = (reportKey) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportKey]: !prev[reportKey],
    }));
  };

  const [expandedSections, setExpandedSections] = useState({
    employeeReports: true,
    analyticsReports: true,
    workHoursReport: true,
  });

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const downloadExcel = (tasks, fileName, employee) => {
    if (!tasks || !Array.isArray(tasks)) {
      console.error("Invalid tasks data:", tasks);
      alert("No tasks available to export.");
      return;
    }
  
    if (!employee || !employee.id || !employee.name) {
      console.error("Invalid employee data:", employee);
      alert("Invalid employee data. Cannot export.");
      return;
    }
  
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Task Hours');
  
    // Get current month dates (1-31)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
  
    // Create headers
    const headers = ['Task Name'];
    for (let day = 1; day <= daysInMonth; day++) {
      headers.push(day.toString());
    }
    headers.push('Total');
  
    // Add headers to worksheet
    worksheet.addRow(headers);
  
    // Process each task
    tasks.forEach((task) => {
      const rowData = [task.name];
      let totalHours = 0;
  
      // Initialize all days with 0 hours
      const dailyHours = Array(daysInMonth).fill(0);
  
      // Process shifts to calculate hours per day
      if (task.shifts && task.shifts.length > 0) {
        task.shifts.forEach((shift) => {
          if (shift.startTime && shift.endTime) {
            const shiftStart = new Date(shift.startTime);
            const shiftEnd = new Date(shift.endTime);
  
            if (shiftStart.getMonth() === month && shiftStart.getFullYear() === year) {
              const day = shiftStart.getDate() - 1; // zero-based index
              const hours = (shiftEnd - shiftStart) / (1000 * 60 * 60); // Convert milliseconds to hours
              dailyHours[day] += hours;
              totalHours += hours;
            }
          }
        });
      }
  
      // Add daily hours to row
      dailyHours.forEach((hours) => {
        rowData.push(hours > 0 ? hours.toFixed(2) : '');
      });
  
      // Add total hours
      rowData.push(totalHours.toFixed(2));
  
      // Add row to worksheet
      worksheet.addRow(rowData);
    });
  
    // Add employee info at the top
    worksheet.insertRow(1, ['Employee ID:', employee.id]);
    worksheet.insertRow(2, ['Employee Name:', employee.name]);
    worksheet.insertRow(3, ['Month:', `${months[month]} ${year}`]);
  
    // Style the headers
    worksheet.getRow(5).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  
    // Generate Excel file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}_${months[month]}_${year}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  };
  

  const downloadEmployeeWorkHours = (employeeId, employeeName) => {
    const monthIndex = months.indexOf(selectedMonth);
    const totalDays = daysInMonth(selectedYear, monthIndex);

    const workHoursForMonth = Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const dateKey = `${selectedYear}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const hours = employeeWorkHours[dateKey]
        ? (employeeWorkHours[dateKey] / 3600).toFixed(2)
        : "0";
      return hours;
    });

    const sheetData = [
      ["Employee ID", employeeId],
      ["Employee Name", employeeName],
      ["Month", selectedMonth],
      ["Year", selectedYear],
      [],
      ["Date", ...Array.from({ length: totalDays }, (_, i) => i + 1)],
      ["Hours Worked", ...workHoursForMonth],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Work Hours");
    XLSX.writeFile(
      workbook,
      `${employeeName}_Work_Hours_${selectedMonth}_${selectedYear}.xlsx`
    );
  };

  const renderCalendar = () => {
    if (!selectedYear || !selectedMonth || !selectedEmployee) return null;

    const monthIndex = months.indexOf(selectedMonth);
    const totalDays = daysInMonth(selectedYear, monthIndex);
    const workHoursForMonth = Object.entries(employeeWorkHours)
      .filter(([date]) =>
        date.startsWith(
          `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`
        )
      )
      .reduce((acc, [date, seconds]) => {
        const day = parseInt(date.split("-")[2], 10);
        acc[day] = seconds;
        return acc;
      }, {});

    return (
      <div>
        <div className="mb-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
            onClick={() =>
              downloadEmployeeTasks(
                selectedEmployee,
                selectedMonth,
                selectedYear,
                selectedEmployee.tasks
              )
            }
          >
            <FileSpreadsheet className="inline h-4 w-4" /> Export
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const hours = workHoursForMonth[day]
              ? (workHoursForMonth[day] / 3600).toFixed(2)
              : "0";
            return (
              <div
                key={day}
                className="p-2 bg-gray-700 rounded-lg text-center text-gray-300 text-sm"
              >
                <p className="font-bold">{day}</p>
                <p>{hours} hrs</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [taskViewMode, setTaskViewMode] = useState("monthly"); // "monthly" or "yearly"
  const [taskData, setTaskData] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedTaskEmployee, setSelectedTaskEmployee] = useState(null);
  const [selectedTaskMonth, setSelectedTaskMonth] = useState(
    new Date().getMonth()
  );
  const [selectedTaskYear, setSelectedTaskYear] = useState(
    new Date().getFullYear()
  );
  const [selectedYearlyEmployee, setSelectedYearlyEmployee] = useState(null);

  const [selectedTask, setSelectedTask] = useState(null);
  const [shiftData, setShiftData] = useState([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  const fetchShiftsForTask = async (employeeId) => {
    console.log("Fetching shifts for employee ID:", employeeId); // Debug log
    setLoadingShifts(true);
    setShiftData([]); // Clear previous shift data
    try {
      const response = await axios.get(`${backEndURL}/api/shifts`);
      if (response.data && Array.isArray(response.data)) {
        // Filter shifts by employee ID
        const filteredShifts = response.data.filter(
          (shift) => shift.employeeId === employeeId
        );

        console.log("Filtered shifts for employee:", filteredShifts); // Debug log

        // Group shifts by date and task name
        const groupedShifts = filteredShifts.reduce((acc, shift) => {
          const date = new Date(shift.date?._seconds * 1000).getDate();
          const taskName = shift.taskName?.trim() || "Unknown Task"; // Handle missing taskName
          if (!acc[date]) acc[date] = {};
          if (!acc[date][taskName]) acc[date][taskName] = [];
          acc[date][taskName].push(shift);
          return acc;
        }, {});

        // Process shifts for calendar view
        const processedShifts = Object.entries(groupedShifts).flatMap(
          ([day, tasks]) =>
            Object.entries(tasks).map(([taskName, shifts]) => {
              const totalSeconds = shifts.reduce((sum, shift) => {
                if (shift.totalSpentTime) return sum + shift.totalSpentTime;
                const startTime = shift.startTime?._seconds * 1000 || 0;
                const endTime = shift.endTime?._seconds * 1000 || 0;
                return sum + Math.ceil((endTime - startTime) / 1000);
              }, 0);

              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.ceil((totalSeconds % 3600) / 60);

              return {
                day: parseInt(day, 10),
                taskName,
                timeWorked: `${hours}h ${minutes}m`,
              };
            })
        );
        setShiftData(processedShifts);
      } else {
        console.error("Unexpected API response format:", response.data);
        setShiftData([]);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    } finally {
      setLoadingShifts(false);
    }
  };

  // Modify the "View" button functionality to fetch shifts for all tasks of the employee
  const handleViewTask = (employee) => {
    console.log("View button clicked for employee:", employee); // Debug log
    setSelectedTaskEmployee(employee);
    fetchShiftsForTask(employee.id); // Fetch shifts for the selected employee
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await axios.get(`${backEndURL}/api/tasks`);
        if (response.data && Array.isArray(response.data)) {
          const tasks = response.data;
          const updatedTaskData = workHoursData.map((employee) => {
            const employeeTasks = tasks.filter(
              (task) => task.employee_id === employee.id
            );
            return {
              ...employee,
              tasks: employeeTasks,
            };
          });
          setTaskData(updatedTaskData);
        } else {
          console.error("Unexpected API response format:", response.data);
          setTaskData([]);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoadingTasks(false);
      }
    };

    if (workHoursData.length > 0) {
      fetchTasks();
    }
  }, [workHoursData]);

  const renderTaskDetails = (tasks = []) => {
    // Ensure tasks is defined and properly initialized
    return (
      <div className="grid grid-cols-7 gap-2">
        {(tasks || []).map((task, index) => (
          <div
            key={index}
            className="p-2 bg-gray-700 rounded-lg text-center text-gray-300 text-sm"
          >
            <p className="font-bold">{task.taskName}</p>
            <p>Status: {task.status}</p>
            <p>Worked On: {task.datesWorked?.join(", ") || "N/A"}</p>
          </div>
        ))}
      </div>
    );
  };

  // Function to filter and process shifts for the calendar
  const filterAndProcessShifts = (shifts, selectedYear, selectedMonth) => {
    // Filter shifts for the selected month and year
    const filteredShifts = shifts.filter((shift) => {
      if (!shift.date || !shift.date._seconds) return false; // Handle missing or invalid `_seconds`
      const shiftDate = new Date(shift.date._seconds * 1000); // Convert Firestore timestamp
      return (
        shiftDate.getFullYear() === selectedYear &&
        shiftDate.getMonth() === selectedMonth
      );
    });

    // Process shifts for calendar view
    const processedShifts = filteredShifts.reduce((acc, shift) => {
      const day = new Date(shift.date._seconds * 1000).getDate();
      const taskName = shift.taskName?.trim() || "Unknown Task"; // Handle missing taskName
      const totalSeconds = shift.totalSpentTime || 0;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.ceil((totalSeconds % 3600) / 60);

      if (!acc[day]) acc[day] = [];
      acc[day].push({ taskName, timeWorked: `${hours}h ${minutes}m` });
      return acc;
    }, {});

    return processedShifts;
  };

  const renderMonthlyCalendar = () => {
    if (
      !selectedTaskEmployee ||
      !selectedTaskYear ||
      selectedTaskMonth === null
    ) {
      return <div>Please select an employee, year, and month</div>;
    }

    const daysInSelectedMonth = daysInMonth(
      selectedTaskYear,
      selectedTaskMonth
    );

    // Ensure shiftData is defined and properly initialized
    const tasksByDay = (shiftData || []).reduce((acc, shift) => {
      if (!acc[shift.day]) acc[shift.day] = [];
      acc[shift.day].push(shift);
      return acc;
    }, {});

    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: daysInSelectedMonth }, (_, i) => {
          const day = i + 1;
          const tasksForDay = tasksByDay[day] || [];

          return (
            <div
              key={day}
              className={`p-2 rounded-lg text-center text-sm ${tasksForDay.length > 0
                ? "bg-green-600 text-white"
                : "bg-red-600 text-gray-200"
                }`}
            >
              <p className="font-bold">{day}</p>
              {tasksForDay.length > 0 ? (
                tasksForDay.map((task, index) => (
                  <div key={index} className="text-xs">
                    <p>{task.taskName}</p>
                    <p>{task.timeWorked}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs">No tasks</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderYearlyTable = (tasks = [], shifts = [], selectedYear, employeeId) => {
    const { taskMap, months } = calculateMonthlyTaskHours(tasks, shifts, selectedYear, employeeId);

    // Filter out empty tasks (if any)
    const filteredTasks = Object.entries(taskMap).filter(([_, monthData]) =>
      Object.values(monthData).some(hours => hours > 0)
    );

    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          No task data found for this employee in {selectedYear}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-sm border border-gray-700 rounded-lg">
          <thead>
            {/* Month Header Row */}
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left border-r border-gray-600">Task Name</th>
              {months.map(month => (
                <th
                  key={month}
                  className="px-2 py-3 text-center border-r border-gray-600"
                  style={{ minWidth: '80px' }}
                >
                  {month.substring(0, 3)}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-bold bg-gray-750">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(([taskName, monthData]) => {
              const totalHours = Object.values(monthData).reduce(
                (sum, hours) => sum + hours,
                0
              );
              return (
                <tr key={taskName} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="px-4 py-3 border-r border-gray-600 font-medium">
                    {taskName}
                  </td>
                  {months.map(month => (
                    <td
                      key={month}
                      className={`px-2 py-3 text-center border-r border-gray-600 ${monthData[month] > 0 ? 'text-green-400' : 'text-gray-500'
                        }`}
                    >
                      {monthData[month] > 0 ? monthData[month].toFixed(2) : "0.00"}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold bg-gray-750">
                    {totalHours.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const downloadEmployeeTasks = (employee, month, year, tasks) => {
    if (!tasks || tasks.length === 0) {
      alert("No tasks available to export.");
      return;
    }

    const monthIndex = months.indexOf(month);
    const totalDays = daysInMonth(year, monthIndex);

    // Prepare headers
    const headers = ["Task Name", ...Array.from({ length: totalDays }, (_, i) => i + 1), "Total"];

    // Prepare data rows
    const rows = tasks.map((task) => {
      const taskRow = Array(totalDays).fill(0); // Initialize with 0 for each day
      let totalHours = 0;

      if (task.shifts && Array.isArray(task.shifts)) {
        task.shifts.forEach((shift) => {
          const shiftDate = new Date(shift.date._seconds * 1000);
          const day = shiftDate.getDate() - 1; // Convert to 0-based index
          const hoursWorked = shift.totalSpentTime ? (shift.totalSpentTime / 3600).toFixed(2) : 0;
          taskRow[day] = hoursWorked;
          totalHours += parseFloat(hoursWorked);
        });
      }

      return [task.taskName, ...taskRow, totalHours.toFixed(2)];
    });

    // Add employee details at the top
    const sheetData = [
      [`Employee ID: ${employee.id}`, `Employee Name: ${employee.name}`, `Month: ${month}`, `Year: ${year}`],
      [],
      headers,
      ...rows,
    ];

    // Generate Excel file
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${employee.name}_Tasks`);
    XLSX.writeFile(workbook, `${employee.name}_Tasks_${month}_${year}.xlsx`);
  };

  const downloadMonthlyTaskExcel = (employee, month, year, tasks) => {
    if (!tasks || tasks.length === 0) {
      alert("No tasks available to export.");
      return;
    }

    const monthIndex = months.indexOf(month);
    const totalDays = daysInMonth(year, monthIndex);

    // Prepare headers
    const headers = ["Task Name", ...Array.from({ length: totalDays }, (_, i) => i + 1), "Total"];

    // Process shifts data to get hours per day per task
    const shiftsByTask = {};

    // Group shifts by task name
    shiftData.forEach(shift => {
      if (!shiftsByTask[shift.taskName]) {
        shiftsByTask[shift.taskName] = Array(totalDays).fill(0);
      }

      // Parse hours from timeWorked string (e.g., "17h 43m")
      const [hoursStr, minutesStr] = shift.timeWorked.split(/h\s*/);
      const hours = parseFloat(hoursStr);
      const minutes = parseFloat(minutesStr.replace('m', '')) / 60;
      const totalHours = hours + minutes;

      shiftsByTask[shift.taskName][shift.day - 1] = totalHours;
    });

    // Prepare data rows
    const rows = Object.entries(shiftsByTask).map(([taskName, dailyHours]) => {
      const totalHours = dailyHours.reduce((sum, hours) => sum + hours, 0);
      return [taskName, ...dailyHours.map(hours => hours > 0 ? hours.toFixed(2) : "0"), totalHours.toFixed(2)];
    });

    // Add employee details at the top
    const sheetData = [
      [`Employee ID: ${employee.id}`, `Employee Name: ${employee.name}`, `Month: ${month}`, `Year: ${year}`],
      [],
      headers,
      ...rows,
    ];

    // Generate Excel file
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${employee.name}_Tasks`);
    XLSX.writeFile(workbook, `${employee.name}_Tasks_${month}_${year}.xlsx`);
  };
  // Modify your shift fetching function to get full year data


  // Update the employee selection handler
  // Modify your shift fetching function to get full year data
  const fetchShiftsForYearlyView = async (employeeId, year) => {
    setLoadingShifts(true);
    try {
      const response = await axios.get(`${backEndURL}/api/shifts`, {
        params: {
          employeeId, // Ensure API filters by employeeId
          year
        }
      });

      if (response.data && Array.isArray(response.data)) {
        setShiftData(response.data);
      } else {
        console.error("Unexpected API response format:", response.data);
        setShiftData([]);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setShiftData([]);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchTasksForEmployee = async (employeeId) => {
    setLoadingTasks(true);
    try {
      const response = await axios.get(`${backEndURL}/api/tasks`, {
        params: { employeeId } // Ensure API filters by employeeId
      });

      if (response.data && Array.isArray(response.data)) {
        setTaskData(response.data);
      } else {
        console.error("Unexpected tasks response format:", response.data);
        setTaskData([]);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTaskData([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Update the employee selection handler
  const handleYearlyEmployeeClick = async (employee) => {
    setSelectedYearlyEmployee(employee);
    await fetchTasksForEmployee(employee.id);
    await fetchShiftsForYearlyView(employee.id, selectedTaskYear);
  };

  // Update the employee selection handler
  // const handleYearlyEmployeeClick = async (employee) => {
  //   setSelectedYearlyEmployee(employee);
  //   setLoadingTasks(true);
  //   try {
  //     // Fetch tasks
  //     const tasksResponse = await axios.get(`${backEndURL}/api/tasks`, {
  //       params: { employeeId: employee.id }
  //     });

  //     // Fetch shifts for the selected year
  //     await fetchShiftsForYearlyView(employee.id, selectedTaskYear);

  //     if (tasksResponse.data && Array.isArray(tasksResponse.data)) {
  //       setTaskData(tasksResponse.data);
  //     } else {
  //       console.error("Unexpected tasks response format:", tasksResponse.data);
  //       setTaskData([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setTaskData([]);
  //   } finally {
  //     setLoadingTasks(false);
  //   }
  // };

  const fetchAndDownloadExcel = async (url, fileName, reportName) => {
    try {
      const response = await axios.get(url);
      if (response.data && Array.isArray(response.data.data)) {
        const data = response.data.data;

        // Create a new workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(reportName);

        // Add headers dynamically based on keys in the first object
        const headers = Object.keys(data[0] || {});
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((row) => {
          worksheet.addRow(headers.map((header) => row[header]));
        });

        // Style the headers
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' },
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.xlsx`;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        alert("No data available to export.");
      }
    } catch (error) {
      console.error("Error fetching or exporting data:", error);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className=" p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="bg-gray-700 hover:bg-gray-600 p-2 rounded-full">
              <RefreshCw className="h-5 w-5" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span>April 2023</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {/* Employee Reports Section */}
        <section className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={() => toggleSection("employeeReports")}
          >
            <h2 className="text-xl font-bold text-blue-400 border-b border-gray-700 pb-2">
              Employee Reports
            </h2>
            {expandedSections.employeeReports ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </div>
          {expandedSections.employeeReports && (
            <>
              {/* Employee Master Report */}
              <div className="bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-700"
                  onClick={() => toggleReport("employeeMaster")}
                >
                  <h3 className="text-lg font-semibold">
                    Employee Master Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAndDownloadExcel(
                          `${backEndURL}/api/employees/reports/employee-master`,
                          "Employee_Master_Report",
                          "Employee Master Report"
                        );
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </button>

                    {expandedReports.employeeMaster ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedReports.employeeMaster && (
                  <div className="p-4">
                    {loadingStates.employeeMaster ? (
                      <DotSpinner /> // Show loader
                    ) : (
                      <div className="overflow-x-auto">
                        <table
                          id="employeeMasterTable"
                          className="min-w-full bg-gray-800 text-sm"
                        >
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left">
                                Employee ID
                              </th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">
                                Department
                              </th>
                              <th className="px-4 py-2 text-left">Position</th>
                              <th className="px-4 py-2 text-left">Join Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeMasterData.map((employee, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-750"
                              >
                                <td className="px-4 py-2">
                                  {employee.employeeId}
                                </td>
                                <td className="px-4 py-2">{employee.name}</td>
                                <td className="px-4 py-2">
                                  {employee.department}
                                </td>
                                <td className="px-4 py-2">
                                  {employee.position}
                                </td>
                                <td className="px-4 py-2">
                                  {employee.joinDate}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Department-wise Report */}
              <div className="bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-700"
                  onClick={() => toggleReport("departmentWise")}
                >
                  <h3 className="text-lg font-semibold">
                    Department-wise Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAndDownloadExcel(
                          `${backEndURL}/api/employees/reports/department-wise`,
                          "Department_Wise_Report",
                          "Department Wise Report"
                        );
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </button>

                    {expandedReports.departmentWise ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedReports.departmentWise && (
                  <div className="p-4">
                    {loadingStates.departmentWise ? (
                      <DotSpinner /> // Show loader
                    ) : (
                      <div className="overflow-x-auto">
                        <table
                          id="departmentWiseTable"
                          className="min-w-full bg-gray-800 text-sm"
                        >
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left">
                                Department
                              </th>
                              <th className="px-4 py-2 text-left">
                                Total Employees
                              </th>
                              <th className="px-4 py-2 text-left">Male</th>
                              <th className="px-4 py-2 text-left">Female</th>
                            </tr>
                          </thead>
                          <tbody>
                            {departmentWiseData.map((dept, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-750"
                              >
                                <td className="px-4 py-2">{dept.department}</td>
                                <td className="px-4 py-2">
                                  {dept.totalEmployees}
                                </td>
                                <td className="px-4 py-2">{dept.maleCount}</td>
                                <td className="px-4 py-2">
                                  {dept.femaleCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Position-wise Report */}
              <div className="bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-700"
                  onClick={() => toggleReport("designationWise")}
                >
                  <h3 className="text-lg font-semibold">
                    Position-wise Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAndDownloadExcel(
                          `${backEndURL}/api/employees/reports/position-wise`,
                          "Position_Wise_Report",
                          "Position Wise Report"
                        );
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </button>

                    {expandedReports.designationWise ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedReports.designationWise && (
                  <div className="p-4">
                    {loadingStates.designationWise ? (
                      <DotSpinner /> // Show loader
                    ) : (
                      <div className="overflow-x-auto">
                        <table
                          id="designationWiseTable"
                          className="min-w-full bg-gray-800 text-sm"
                        >
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left">Position</th>
                              <th className="px-4 py-2 text-left">
                                Department
                              </th>
                              <th className="px-4 py-2 text-left">Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {designationWiseData.map((desig, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-750"
                              >
                                <td className="px-4 py-2">{desig.position}</td>
                                <td className="px-4 py-2">
                                  {desig.department}
                                </td>
                                <td className="px-4 py-2">{desig.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Employee Contact Report */}
              <div className="bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-700"
                  onClick={() => toggleReport("employeeContact")}
                >
                  <h3 className="text-lg font-semibold">
                    Employee Contact Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAndDownloadExcel(
                          `${backEndURL}/api/employees/reports/employee-contact`,
                          "Employee_Contact_Report",
                          "Employee Contact Report"
                        );
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </button>

                    {expandedReports.employeeContact ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedReports.employeeContact && (
                  <div className="p-4">
                    {loadingStates.employeeContact ? (
                      <DotSpinner /> // Show loader
                    ) : (
                      <div className="overflow-x-auto">
                        <table
                          id="employeeContactTable"
                          className="min-w-full bg-gray-800 text-sm"
                        >
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left">
                                Employee ID
                              </th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Email</th>
                              <th className="px-4 py-2 text-left">Phone</th>
                              <th className="px-4 py-2 text-left">Address</th>
                              <th className="px-4 py-2 text-left">
                                Emergency Contact
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {employeeContactData.map((contact, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-750"
                              >
                                <td className="px-4 py-2">
                                  {contact.employeeId}
                                </td>
                                <td className="px-4 py-2">{contact.name}</td>
                                <td className="px-4 py-2">{contact.email}</td>
                                <td className="px-4 py-2">{contact.phone}</td>
                                <td className="px-4 py-2">{contact.address}</td>
                                <td className="px-4 py-2">
                                  {contact.emergencyContact}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
        <section className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={() => toggleSection("analyticsReports")}
          >
            <h2 className="text-xl font-bold text-pink-400 border-b border-gray-700 pb-2">
              Analytics Reports
            </h2>
            {expandedSections.analyticsReports ? (
              <ChevronUp className="h-6 w-6 text-gray-400" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400" />
            )}
          </div>
          {expandedSections.analyticsReports && (
            <>
              {/* Work Anniversary Report */}
              <div className="bg-gray-800 rounded-lg shadow-lg mb-4 overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex justify-between items-center border-b border-gray-700"
                  onClick={() => toggleReport("workAnniversary")}
                >
                  <h3 className="text-lg font-semibold">
                    Work Anniversary Report
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchAndDownloadExcel(
                          `${backEndURL}/api/employees/reports/work-anniversary`,
                          "Work_Anniversary_Report",
                          "Work Anniversary Report"
                        );
                      }}
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </button>

                    {expandedReports.workAnniversary ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>

                {expandedReports.workAnniversary && (
                  <div className="p-4">
                    {loadingStates.workAnniversary ? (
                      <DotSpinner /> // Show loader
                    ) : (
                      <div className="overflow-x-auto">
                        <table
                          id="workAnniversaryTable"
                          className="min-w-full bg-gray-800 text-sm"
                        >
                          <thead>
                            <tr className="bg-gray-700">
                              <th className="px-4 py-2 text-left">
                                Employee ID
                              </th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Join Date</th>
                              <th className="px-4 py-2 text-left">
                                Months of Service
                              </th>
                              <th className="px-4 py-2 text-left">
                                Department
                              </th>
                              <th className="px-4 py-2 text-left">
                                Upcoming Anniversary
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {workAnniversaryData.map((anniversary, index) => (
                              <tr
                                key={index}
                                className="border-t border-gray-700 hover:bg-gray-750"
                              >
                                <td className="px-4 py-2">
                                  {anniversary.employeeId}
                                </td>
                                <td className="px-4 py-2">
                                  {anniversary.name}
                                </td>
                                <td className="px-4 py-2">
                                  {anniversary.joinDate}
                                </td>
                                <td className="px-4 py-2">
                                  {anniversary.monthsOfService}
                                </td>
                                <td className="px-4 py-2">
                                  {anniversary.department}
                                </td>
                                <td className="px-4 py-2">
                                  {anniversary.upcomingAnniversary}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>             
            </>
          )}
        </section>

        <section className="mb-8">
          <div
            className="flex justify-between items-center cursor-pointer mb-4 transition-all hover:scale-[1.01]"
            onClick={() => toggleSection("workHoursReport")}
          >
            <h2 className="text-2xl font-extrabold text-green-400 border-b border-gray-700 pb-2">
              Work Hours Month by Month
            </h2>
            {expandedSections.workHoursReport ? (
              <ChevronUp className="h-6 w-6 text-gray-400 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-6 w-6 text-gray-400 transition-transform duration-200" />
            )}
          </div>

          <AnimatePresence>
            {expandedSections.workHoursReport && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 rounded-2xl shadow-2xl p-6"
              >
                {!selectedMonth && !selectedEmployee ? (
                  <>
                    <div className="mb-6">
                      <label className="text-gray-300 font-medium">
                        Select Year:
                      </label>
                      <select
                        className="bg-gray-700 text-white px-4 py-2 rounded-md ml-3"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {Array.from(
                          { length: 5 },
                          (_, i) => new Date().getFullYear() - i
                        ).map((year, index) => (
                          <option key={index} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {months.map((month, index) => (
                        <button
                          key={index}
                          className={`p-4 rounded-xl font-semibold shadow hover:shadow-lg transition-all ${selectedMonth === month
                            ? "bg-green-600 text-white"
                            : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          onClick={() => setSelectedMonth(month)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </>
                ) : !selectedEmployee ? (
                  <>
                    <button
                      className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      onClick={() => setSelectedMonth(null)}
                    >
                      ← Back to Months
                    </button>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5" /> Employees for{" "}
                      {selectedMonth} {selectedYear}
                    </h3>

                    {loadingEmployees ? (
                      <DotSpinner />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 text-sm rounded-xl">
                          <thead>
                            <tr className="bg-gray-700 text-gray-300">
                              <th className="px-4 py-3 text-left">
                                Employee ID
                              </th>
                              <th className="px-4 py-3 text-left">
                                Employee Name
                              </th>
                              <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {workHoursData.map((employee) => (
                              <tr
                                key={employee.id}
                                className="border-t border-gray-700 hover:bg-gray-750 transition"
                              >
                                <td className="px-4 py-2">{employee.id}</td>
                                <td className="px-4 py-2">{employee.name}</td>
                                <td className="px-4 py-2">
                                  <button
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mr-2"
                                    onClick={() => {
                                      setSelectedEmployee(employee);
                                      fetchEmployeeWorkHours(employee.id);
                                    }}
                                  >
                                    <ChevronDown className="inline h-4 w-4" />{" "}
                                    View
                                  </button>
                                  <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                                    onClick={() => downloadExcel(employee.tasks, `${employee.name}_Tasks`, employee)}
                                  >
                                    <FileSpreadsheet className="inline h-4 w-4" /> Export
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <button
                      className="mb-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                      onClick={() => setSelectedEmployee(null)}
                    >
                      ← Back to Employees
                    </button>
                    <h3 className="text-xl font-semibold text-blue-400 mb-4">
                      Work Hours for {selectedEmployee.name} in {selectedMonth}{" "}
                      {selectedYear}
                    </h3>
                    {loadingWorkHours ? <DotSpinner /> : renderCalendar()}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <section className="mb-8 bg-gray-800 rounded-xl shadow-lg p-4">
          <div
            className="flex justify-between items-center cursor-pointer mb-4"
            onClick={() => setWorkHoursOpen(!workHoursOpen)}
          >
            <h2 className="text-xl font-bold text-yellow-400 border-b border-gray-700 pb-2">
              Work Hours for Each Task
            </h2>
            {workHoursOpen ? (
              <ChevronUp className="text-yellow-400" />
            ) : (
              <ChevronDown className="text-yellow-400" />
            )}
          </div>

          {workHoursOpen && (
            <div className="transition-all duration-300 ease-in-out">
              <div className="flex space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-lg transition ${taskViewMode === "monthly"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-700 text-gray-300"
                    }`}
                  onClick={() => setTaskViewMode("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition ${taskViewMode === "yearly"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-700 text-gray-300"
                    }`}
                  onClick={() => setTaskViewMode("yearly")}
                >
                  Yearly
                </button>
              </div>

              {loadingTasks ? (
                <DotSpinner />
              ) : taskViewMode === "monthly" ? (
                selectedTask ? (
                  <div>
                    <button
                      className="mb-4 bg-gray-700 text-white px-3 py-1 rounded-md"
                      onClick={() => setSelectedTask(null)}
                    >
                      Back to Tasks
                    </button>
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      Shifts for {selectedTask.name} in{" "}
                      {months[selectedTaskMonth]} {selectedTaskYear}
                    </h3>
                    {loadingShifts ? (
                      <DotSpinner />
                    ) : (
                      renderMonthlyCalendar(shiftData)
                    )}
                  </div>
                ) : selectedTaskEmployee ? (
                  <div>
                    <button
                      className="mb-4 bg-gray-700 text-white px-3 py-1 rounded-md"
                      onClick={() => setSelectedTaskEmployee(null)}
                    >
                      Back to Employees
                    </button>
                    <br />
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                      onClick={() =>
                        downloadMonthlyTaskExcel(
                          selectedTaskEmployee,
                          months[selectedTaskMonth],
                          selectedTaskYear,
                          shiftData // Pass the shiftData instead of tasks
                        )
                      }
                    >
                      <FileSpreadsheet className="inline h-4 w-4" /> Export
                    </button>
                    <h3 className="text-lg font-semibold text-blue-400 mb-4">
                      Tasks for {selectedTaskEmployee.name} in{" "}
                      {months[selectedTaskMonth]} {selectedTaskYear}
                    </h3>
                    {renderMonthlyCalendar(selectedTaskEmployee.tasks)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-900 text-sm rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-700">
                          <th className="px-4 py-2 text-left">Employee ID</th>
                          <th className="px-4 py-2 text-left">Employee Name</th>
                          <th className="px-4 py-2 text-left">
                            Assigned Tasks
                          </th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskData.map((employee) => (
                          <tr
                            key={employee.id}
                            className="border-t border-gray-700 hover:bg-gray-750"
                          >
                            <td className="px-4 py-2">{employee.id}</td>
                            <td className="px-4 py-2">{employee.name}</td>
                            <td className="px-4 py-2">
                              {employee.tasks.map((task) => (
                                <div key={task.taskId}>
                                  {task.name} - {task.status}
                                </div>
                              ))}
                            </td>
                            <td className="px-4 py-2">
                              <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md mr-2"
                                onClick={() => handleViewTask(employee)}
                              >
                                <ChevronDown className="inline h-4 w-4" /> View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div>
                  {/* <div className="mb-4">
                    <label className="text-gray-300">Select Year:</label>
                    <select
                      className="bg-gray-700 text-white px-3 py-2 rounded-md ml-2"
                      value={selectedTaskYear}
                      onChange={(e) => setSelectedTaskYear(e.target.value)}
                    >
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div> */}
                  <div className="mb-4">
                    <label className="text-gray-300">Select Employee:</label>
                    <select
                      className="bg-gray-700 text-white px-3 py-2 rounded-md ml-2"
                      value={selectedYearlyEmployee?.id || ""}
                      onChange={(e) => {
                        const selectedEmployee = workHoursData.find(
                          (emp) => emp.id === e.target.value
                        );
                        if (selectedEmployee) {
                          handleYearlyEmployeeClick(selectedEmployee);
                        } else {
                          setSelectedYearlyEmployee(null); // Allow clearing the selection
                          setTaskData([]); // Clear tasks when no employee is selected
                        }
                      }}
                    >
                      <option value="">-- Select Employee --</option>
                      {workHoursData.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedYearlyEmployee && (
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-4">
                        Tasks for {selectedYearlyEmployee.name} in {selectedTaskYear}
                      </h3>

                      {/* Year selection dropdown */}
                      <div className="mb-4">
                        <label className="text-gray-300 mr-2">Year:</label>
                        <select
                          className="bg-gray-700 text-white px-3 py-1 rounded"
                          value={selectedTaskYear}
                          onChange={(e) => setSelectedTaskYear(e.target.value)}
                        >
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {loadingShifts ? (
                        <DotSpinner />
                      ) : (
                        renderYearlyTable(
                          taskData,
                          shiftData,
                          selectedTaskYear,
                          selectedYearlyEmployee.id
                        )
                      )}

                      <button
                        className="mt-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                        onClick={() => downloadYearlyTaskExcel(
                          selectedYearlyEmployee,
                          selectedTaskYear,
                          taskData,
                          shiftData
                        )}
                      >
                        <FileSpreadsheet className="inline h-4 w-4" /> Export Yearly Report
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
