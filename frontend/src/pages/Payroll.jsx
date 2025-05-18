"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink, PDFViewer, pdf } from "@react-pdf/renderer";
import {
  Eye,
  Download,
  Printer,
  Send,
  Edit,
  Trash,
  ChevronDown,
  ChevronUp,
} from "lucide-react"; // Import chevron icons
import DotSpinner from "../loaders/Loader"; // Import the loader
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import { backEndURL } from "../Backendurl";

// Adjust styles to fit content on one page
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 10,
  },
  companyName: {
    fontSize: 18,
    color: "#38bdf8",
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 10,
    color: "#64748b",
  },
  titleCenter: {
    textAlign: "center",
    fontSize: 16,
    marginVertical: 8,
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  section: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#0ea5e9",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    marginBottom: 4,
  },
  label: {
    color: "#64748b",
  },
  value: {
    color: "#1e293b",
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e2e8f0",
    padding: 4,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 4,
    fontSize: 10,
    borderBottom: "1px solid #e2e8f0",
  },
  footer: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
  },
  footerLogo: {
    width: 30,
    height: 30,
    marginTop: 8,
    marginLeft: "auto",
    marginRight: "auto",
  },
});

// Component
const PayrollPDF = ({ employee, payrollResult, selectedMonthName, selectedYear, incomeExpenseData, totalWithIncomeExpense }) => {
  const date = new Date().toLocaleDateString();
  const employeeIncomeExpense = incomeExpenseData[employee.employeeId] || { income: [], expense: [] };

  const totalIncome = employeeIncomeExpense.income.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpense = employeeIncomeExpense.expense.reduce((sum, entry) => sum + entry.amount, 0);
  const netTotal = totalWithIncomeExpense; // Use the passed totalWithIncomeExpense

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/images/logo.jpg" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>RTECH SOLUTION</Text>
            <Text style={styles.subTitle}>262 Peradeniya Road Kandy</Text>
            <Text style={styles.subTitle}>Phone: +94 76 635 6336</Text>
            <Text style={styles.subTitle}>Email: info@rtechsl.lk</Text>
            <Text style={styles.subTitle}>Website: www.rtechsl.lk</Text>
          </View>
        </View>

        <Text style={styles.titleCenter}>PAYSLIP</Text>

        {/* Payroll Meta */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Pay Date:</Text>
            <Text style={styles.value}>{selectedMonthName} {selectedYear}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pay Type:</Text>
            <Text style={styles.value}>Monthly</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Period:</Text>
            <Text style={styles.value}>{selectedMonthName} {selectedYear}</Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{employee.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Position:</Text>
            <Text style={styles.value}>{employee.position}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{employee.department}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EPF Number:</Text>
            <Text style={styles.value}>{employee.epfNumber || "N/A"}</Text>
          </View>
        </View>

        {/* Earnings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2 }}>Type</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Basic Pay</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{employee.basicSalary.toLocaleString()}/=</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Overtime Pay</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{payrollResult.overtimeSalary.toLocaleString()}/=</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Employee EPF (8%)</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{payrollResult.employeeEpfDeduction.toLocaleString()}/=</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2, fontWeight: "bold" }}>Total Pay</Text>
            <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>
              {netTotal.toLocaleString()}/=
            </Text>
          </View>
        </View>

        {/* Work Hours Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Hours Summary</Text>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2 }}>Description</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Hours</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Fixed Monthly Hours</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{payrollResult.monthlyWorkHours}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Total Worked Hours</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{payrollResult.totalHours}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 2 }}>Overtime Hours</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{payrollResult.overtimeHours}</Text>
          </View>
        </View>

        {/* Income/Expense History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income/Expense History</Text>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2 }}>Type</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>Amount</Text>
            <Text style={{ flex: 4 }}>Note</Text>
          </View>
          {["income", "expense"].map((type) =>
            employeeIncomeExpense[type].map((entry, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={{ flex: 2 }}>{type}</Text>
                <Text style={{ flex: 1, textAlign: "right" }}>{entry.amount.toLocaleString()}/=</Text>
                <Text style={{ flex: 4 }}>{entry.note}</Text>
              </View>
            ))
          )}
        </View>

        {/* Total Income/Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Total Income:</Text>
            <Text style={styles.value}>{totalIncome.toLocaleString()}/=</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Expenses:</Text>
            <Text style={styles.value}>{totalExpense.toLocaleString()}/=</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Net Total:</Text>
            <Text style={styles.value}>{netTotal.toLocaleString()}/=</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RTECHSL Pvt Ltd | www.rtechsl.lk | info@rtechsl.lk</Text>
          <Text>Generated on: {date}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to calculate working days in a month (excluding weekends)
const getWorkingDaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];

  while (date.getMonth() === month) {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    // Only count weekdays (Monday to Friday)
    if (day !== 0 && day !== 6) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }

  return days.length;
};

function App() {
  // State for the current view date and admin settings
  const [viewDate, setViewDate] = useState(() => new Date());
  const [startMonth, setStartMonth] = useState(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [monthsData, setMonthsData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollResult, setPayrollResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    to: "",
    subject: "",
    message: "",
    attachment: null,
  });
  const [isSending, setIsSending] = useState(false); // State to track email sending status
  const [incomeExpenseData, setIncomeExpenseData] = useState({});
  const [incomeExpenseType, setIncomeExpenseType] = useState("income");
  const [incomeExpenseAmount, setIncomeExpenseAmount] = useState("");
  const [incomeExpenseNote, setIncomeExpenseNote] = useState("");
  const [showAddIncomeExpense, setShowAddIncomeExpense] = useState(false); // State to toggle section
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false); 
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const currentMonthId = `${viewDate.getFullYear()}-${String(
    viewDate.getMonth() + 1
  ).padStart(2, "0")}`;
  const currentMonthName = viewDate.toLocaleString("default", {
    month: "long",
  });
  const currentYear = viewDate.getFullYear();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch employees from the backend API
        const employeesResponse = await fetch(
          `${backEndURL}/api/employees`
        );
        if (!employeesResponse.ok) {
          throw new Error("Failed to fetch employees");
        }
        const employeesData = await employeesResponse.json();

        if (employeesData.success) {
          const mappedEmployees = employeesData.data.map((emp) => ({
            profile: emp.profileImage,
            name: `${emp.firstName} ${emp.lastName}`,
            employeeId: emp.employeeId,
            email: emp.email,
            position: emp.position,
            department: emp.department,
            basicSalary: emp.monthlySalary,
            OVERTIME_RATE: emp.overtimeHourlyRate,
            EPFeTF: emp.hasEpfEtf,
            epfNumber: emp.epfNumber,
          }));
          setEmployees(mappedEmployees);
        } else {
          console.error("Failed to fetch employees:", employeesData.message);
        }

        // Fetch work hours from the backend API
        const workHoursResponse = await fetch(
          `${backEndURL}/api/employee-work-hours`
        );
        if (!workHoursResponse.ok) {
          throw new Error("Failed to fetch work hours");
        }
        const workHoursData = await workHoursResponse.json();

        if (workHoursData.success) {
          const workHoursMap = {};
          workHoursData.data.forEach((doc) => {
            workHoursMap[doc.employeeId] = doc.monthlyTotals;
          });

          setEmployees((prevEmployees) =>
            prevEmployees.map((emp) => ({
              ...emp,
              monthlyWorkHours: workHoursMap[emp.employeeId] || {},
            }))
          );
        } else {
          console.error("Failed to fetch work hours:", workHoursData.message);
        }

        // Set the current month and year as the initial view date
        const currentDate = new Date();
        setViewDate(currentDate);

        // Generate months data
        const generatedMonthsData = {};
        const currentYear = currentDate.getFullYear();

        for (let year = currentYear - 2; year <= currentYear + 1; year++) {
          for (let month = 0; month < 12; month++) {
            const monthId = `${year}-${String(month + 1).padStart(2, "0")}`;
            const workingDays = getWorkingDaysInMonth(year, month);
            const totalHours = workingDays * 8;

            generatedMonthsData[monthId] = {
              id: monthId,
              name: new Date(year, month, 1).toLocaleString("default", {
                month: "long",
              }),
              year: year,
              month: month,
              workingDays: workingDays,
              totalHours: totalHours,
              employeeHours: {},
            };
          }
        }
        setMonthsData(generatedMonthsData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch totalWorkHours dynamically based on the selected viewDate
  useEffect(() => {
    const fetchTotalWorkHours = async () => {
      try {
        const totalHoursResponse = await fetch(
          `${backEndURL}/api/salary/totalHour/`
        );
        if (!totalHoursResponse.ok) {
          throw new Error("Failed to fetch total hours");
        }
        const totalHoursData = await totalHoursResponse.json();
        if (totalHoursData.success) {
          setMonthsData((prev) => {
            const updatedMonthsData = { ...prev };
            Object.keys(totalHoursData.data).forEach((monthId) => {
              if (!updatedMonthsData[monthId]) {
                updatedMonthsData[monthId] = {}; // Initialize if not present
              }
              updatedMonthsData[monthId].totalHours =
                totalHoursData.data[monthId];
            });
            return updatedMonthsData;
          });
        }
      } catch (error) {
        console.error("Error fetching total work hours:", error);
      }
    };

    fetchTotalWorkHours();
  }, [viewDate]);

  // Generate employee hours for the current month
  useEffect(() => {
    const generateEmployeeHours = () => {
      if (!currentMonthId || !monthsData[currentMonthId]) {
        return;
      }

      try {
        const currentMonth = monthsData[currentMonthId];

        if (
          !currentMonth.employeeHours ||
          Object.keys(currentMonth.employeeHours).length === 0
        ) {
          const newEmployeeHours = {};

          employees.forEach((employee) => {
            const totalHours = currentMonth.totalHours;
            const isFutureMonth =
              new Date(currentYear, viewDate.getMonth(), 1) > new Date();

            if (isFutureMonth) {
              newEmployeeHours[employee.id] = 0;
            } else {
              const variation = Math.floor(Math.random() * 30) - 10;
              newEmployeeHours[employee.id] = Math.max(
                totalHours + variation,
                totalHours - 20
              );
            }
          });

          setMonthsData((prev) => ({
            ...prev,
            [currentMonthId]: {
              ...prev[currentMonthId],
              employeeHours: newEmployeeHours,
            },
          }));
        }
      } catch (error) {
        console.error("Error generating employee hours:", error);
      }
    };

    generateEmployeeHours();
  }, [currentMonthId, employees, monthsData]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchIncomeExpenseData(
        selectedEmployee.employeeId,
        selectedEmployee.email,
        currentYear,
        viewDate.getMonth() + 1
      ); // Fetch data when an employee is selected
    }
  }, [selectedEmployee]);

  // Calculate monthly salary based on basic salary and other factors
  const calculateMonthlySalary = (employee) => {
    // In a real app, this would be a more complex calculation
    // For this demo, we'll add 1000 to the basic salary
    return employee.basicSalary + 1000;
  };

  // Ensure payrollSalary, overtimeSalary, and totalMonthlySalary are numbers
  const calculatePayroll = (employee) => {
    if (!monthsData[currentMonthId]) return null;

    const currentMonth = monthsData[currentMonthId];
    const monthlyWorkHours = currentMonth.totalHours; // Expected monthly work hours
    const employeeWorkHoursInSeconds =
      employee.monthlyWorkHours?.[currentMonthId] || 0;
    const totalHours = Math.round(employeeWorkHoursInSeconds / 3600); // Convert seconds to hours and round

    let overtimeHours = 0;
    let payrollSalary = 0;
    let overtimeSalary = 0;
    let employeeEpfDeduction = 0;
    let companyEpfContribution = 0;
    let companyEtfContribution = 0;

    // Step 2: Determine if the employee has overtime
    if (totalHours > monthlyWorkHours) {
      overtimeHours = Math.round(totalHours - monthlyWorkHours);
    }

    // Step 3: Calculate the payroll (base salary)
    if (totalHours >= monthlyWorkHours) {
      payrollSalary = Math.round(employee.basicSalary || 0); // Ensure payrollSalary is a whole number
    } else {
      const workPercentage = Math.round((totalHours / monthlyWorkHours) * 100);
      payrollSalary = Math.round(
        (employee.basicSalary / 100) * workPercentage || 0
      ); // Ensure payrollSalary is a whole number
    }

    // Step 4: Calculate the overtime pay (if any)
    if (overtimeHours > 0) {
      overtimeSalary = Math.round(
        overtimeHours * (employee.OVERTIME_RATE || 0)
      ); // Use employee's overtimeHourlyRate
    }

    // Step 5: EPF/ETF calculations (only if EPFeTF is "Yes")
    if (employee.EPFeTF === "Yes") {
      employeeEpfDeduction = Math.round((payrollSalary * 8) / 100); // 8% employee EPF deduction
      companyEpfContribution = Math.round((payrollSalary * 12) / 100); // 12% company EPF contribution
      companyEtfContribution = Math.round((payrollSalary * 3) / 100); // 3% company ETF contribution
      payrollSalary -= employeeEpfDeduction; // Deduct employee EPF contribution from payroll salary
    }

    // Step 6: Final salary and cost calculations
    const totalMonthlySalary = Math.round(payrollSalary + overtimeSalary);
    const totalCostToCompany = Math.round(
      payrollSalary +
        overtimeSalary +
        companyEpfContribution +
        companyEtfContribution
    );

    return {
      payrollSalary,
      overtimeSalary,
      totalMonthlySalary,
      overtimeHours,
      totalHours,
      monthlyWorkHours,
      employeeEpfDeduction,
      companyEpfContribution,
      companyEtfContribution,
      totalCostToCompany,
    };
  };
  const saveSalaryToBackend = async (employee, payrollResult) => {
    try {
      const response = await fetch(`${backEndURL}/api/salary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: currentYear,
          month: String(viewDate.getMonth() + 1).padStart(2, "0"),
          employee: {
            email: employee.email,
            name: employee.name,
            basicSalary: employee.basicSalary,
          },
          payrollResult: {
            payrollSalary: payrollResult.payrollSalary,
            overtimeSalary: payrollResult.overtimeSalary,
            totalMonthlySalary: payrollResult.totalMonthlySalary,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save salary data");
      }
    } catch (error) {
      console.error("Error saving salary data:", error);
    }
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    const result = calculatePayroll(employee);
    setPayrollResult(result);

    // Save the calculated payroll data to the backend
    saveSalaryToBackend(employee, result);
  };

  const handlePreviousMonth = () => {
    setViewDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);

      // Don't go before the start month
      if (startMonth) {
        const [startYear, startMonthNum] = startMonth.split("-").map(Number);
        const startDate = new Date(startYear, startMonthNum - 1, 1);

        if (newDate < startDate) {
          return prevDate; // Don't update if it would go before start month
        }
      }

      return newDate;
    });
  };

  const handleNextMonth = () => {
    setViewDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleMonthYearSelect = (year, month) => {
    setViewDate(new Date(year, month, 1));
    setShowMonthPicker(false);
  };

  const handleAdminSubmit = async (totalHours) => {
    try {
      // Save total hours to the backend
      const response = await fetch(`${backEndURL}/api/salary/totalHour/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: currentYear,
          month: String(viewDate.getMonth() + 1).padStart(2, "0"),
          totalHours,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save total hours");
      }

      // Update the total hours for the current month
      setMonthsData((prev) => ({
        ...prev,
        [currentMonthId]: {
          ...prev[currentMonthId],
          totalHours,
        },
      }));

      setShowAdminForm(false);

      // Recalculate payroll if an employee is selected
      if (selectedEmployee) {
        const result = calculatePayroll(selectedEmployee);
        setPayrollResult(result);
      }
    } catch (error) {
      console.error("Error saving total hours:", error);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current month is a future month
  const isFutureMonth = () => {
    const today = new Date();
    return (
      viewDate.getFullYear() > today.getFullYear() ||
      (viewDate.getFullYear() === today.getFullYear() &&
        viewDate.getMonth() > today.getMonth())
    );
  };

  // Check if current month is the current actual month
  const isCurrentMonth = () => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth()
    );
  };

  // Month Year Picker Component
  const MonthYearPicker = ({ onSelect }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [viewMode, setViewMode] = useState("months"); // "months" or "years"

    // Parse start month if provided
    const startDate = startMonth
      ? new Date(
          startMonth.split("-")[0],
          Number.parseInt(startMonth.split("-")[1]) - 1,
          1
        )
      : null;
    const startYear = startDate ? startDate.getFullYear() : currentYear - 5;
    const startMonthIndex = startDate ? startDate.getMonth() : 0;

    // Generate years range (start year to current year + 5)
    const years = Array.from(
      { length: currentYear + 5 - startYear + 1 },
      (_, i) => startYear + i
    );

    // Month names
    const months = [
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

    const handleYearClick = (year) => {
      setSelectedYear(year);
      setViewMode("months");
    };

    const handleMonthClick = (monthIndex) => {
      onSelect(selectedYear, monthIndex);
    };

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 w-64">
        {viewMode === "months" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedYear(selectedYear - 1)}
              >
                &lt;
              </button>
              <button
                className="text-white font-medium"
                onClick={() => setViewMode("years")}
              >
                {selectedYear}
              </button>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setSelectedYear(selectedYear + 1)}
              >
                &gt;
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  className="py-2 px-1 text-sm rounded hover:bg-gray-700 text-white"
                  onClick={() => handleMonthClick(index)}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <button
                className="text-white font-medium"
                onClick={() => setViewMode("months")}
              >
                Select Year
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  className={`py-2 px-1 text-sm rounded hover:bg-gray-700 ${
                    year === selectedYear
                      ? "bg-blue-600 text-white"
                      : "text-white"
                  }`}
                  onClick={() => handleYearClick(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Admin Hours Form Component
  const AdminHoursForm = ({
    month,
    year,
    totalHours,
    currentTotalHours,
    onSubmit,
    onCancel,
  }) => {
    const [hours, setHours] = useState(currentTotalHours);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();

      if (!hours || hours <= 0) {
        setError("Total hours must be greater than 0");
        return;
      }

      onSubmit(hours);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">
            Set Total Work Hours
          </h2>
          <p className="text-gray-300 mb-4">
            Set the total work hours for {month} {year}. This will be used to
            calculate overtime and regular hours.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Total Hours</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={hours}
                onChange={(e) => {
                  setHours(Number(e.target.value));
                  setError("");
                }}
                min="1"
              />
              {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              <p className="text-gray-400 text-sm mt-1">
                Set the total work hours for this month based on working days.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="text-center">
          <DotSpinner />
        </div>
      </div>
    );
  }

  // Fix the SVG `viewBox` attribute
  const svgViewBox = "0 0 24 24";

  const handleExportPDF = async () => {
    const blob = await pdf(
      <PayrollPDF employee={selectedEmployee} payrollResult={payrollResult} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payroll_${selectedEmployee.name}_${currentMonthName}_${currentYear}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printContent = document.getElementById("payroll-section");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Payroll</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .payroll-container {
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 10px;
              background-color: #f9f9f9;
            }
            h2 {
              color: #007bff;
            }
          </style>
        </head>
        <body>
          <div class="payroll-container">${printContent.innerHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const fetchIncomeExpenseData = async (
    employeeId,
    employeeEmail,
    year,
    month
  ) => {
    setIncomeExpenseLoading(true); // Start loading
    try {
      const response = await fetch(
        `${backEndURL}/api/income-expenses?year=${year}&month=${month}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch income/expense data for employeeId: ${employeeId}`
        );
      }
      const data = await response.json();
      if (data.success) {
        const matchedEntry = data.data.entries.find(
          (entry) => entry.employeeEmail === employeeEmail
        );
        if (matchedEntry) {
          setIncomeExpenseData((prev) => ({
            ...prev,
            [employeeId]: {
              income: matchedEntry.income || [],
              expense: matchedEntry.expense || [],
            },
          }));
        }
      } else {
        console.error(`Error fetching income/expense data: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching income/expense data:", error);
    } finally {
      setIncomeExpenseLoading(false); // Stop loading
    }
  };

  const handleAddIncomeExpense = async (type, amount, note) => {
    if (!selectedEmployee) {
      toast.error("No employee selected");
      return;
    }

    try {
      const response = await fetch(
        `${backEndURL}/api/income-expenses`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: selectedEmployee.employeeId,
            employeeEmail: selectedEmployee.email,
            employeeName: selectedEmployee.name,
            type,
            amount: parseFloat(amount),
            note,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add income/expense");
      }

      const newEntry = await response.json(); // Get the new entry with its unique ID
      setIncomeExpenseData((prev) => ({
        ...prev,
        [selectedEmployee.employeeId]: {
          ...prev[selectedEmployee.employeeId],
          [type]: [
            ...(prev[selectedEmployee.employeeId]?.[type] || []),
            newEntry.data,
          ],
        },
      }));

      toast.success("Entry added successfully");
      await fetchIncomeExpenseData(
        selectedEmployee.employeeId,
        selectedEmployee.email,
        viewDate.getFullYear(),
        viewDate.getMonth() + 1
      );
    } catch (error) {
      console.error("Error adding income/expense:", error);
      toast.error("Failed to add entry");
    }
  };

  const handleEditIncomeExpense = async (typeId, updatedEntry) => {
    try {
    

      if (!typeId || !updatedEntry) {
        console.error("Missing typeId or updatedEntry", {
          typeId,
          updatedEntry,
        });
        throw new Error("Missing required fields");
      }

      const existingType = updatedEntry.originalType; // Original type before editing
      const newType = updatedEntry.type; // New type after editing

      if (existingType !== newType) {
        // Delete the old entry
        await fetch(`${backEndURL}/api/income-expenses/${typeId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        // Create a new entry with the updated type
        const createPayload = {
          employeeId: selectedEmployee.employeeId,
          employeeEmail: selectedEmployee.email,
          employeeName: selectedEmployee.name,
          type: newType,
          amount: updatedEntry.amount,
          note: updatedEntry.note,
        };

        const createResponse = await fetch(
          `${backEndURL}/api/income-expenses`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createPayload),
          }
        );

        if (!createResponse.ok) {
          throw new Error("Failed to create new income/expense entry");
        }

        toast.success("Entry updated successfully");
      } else {
        // Type has not changed, perform a normal update
        const payload = {
          type: updatedEntry.type,
          amount: updatedEntry.amount,
          note: updatedEntry.note,
          updatedAt: new Date().toISOString(),
        };

      

        const response = await fetch(
          `${backEndURL}/api/income-expenses/${typeId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to update income/expense"
          );
        }

        toast.success("Entry updated successfully");
      }

      // Re-fetch the data for consistency
      await fetchIncomeExpenseData(
        selectedEmployee.employeeId,
        selectedEmployee.email,
        viewDate.getFullYear(),
        viewDate.getMonth() + 1
      );
    } catch (error) {
      console.error("Error updating income/expense:", error);
      toast.error(error.message || "Failed to update entry");
    }
  };

  const handleDeleteIncomeExpense = async (typeId) => {
    try {
      if (!typeId) {
        throw new Error("Missing required typeId");
      }

      // Optimistically update the UI
      setIncomeExpenseData((prev) => {
        const updatedTypeEntries = {
          ...prev[selectedEmployee.employeeId],
          income: prev[selectedEmployee.employeeId].income.filter(
            (entry) => entry.income_id !== typeId
          ),
          expense: prev[selectedEmployee.employeeId].expense.filter(
            (entry) => entry.expense_id !== typeId
          ),
        };
        return { ...prev, [selectedEmployee.employeeId]: updatedTypeEntries };
      });

      // Send the delete request to the backend
      const response = await fetch(
        `${backEndURL}/api/income-expenses/${typeId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete income/expense");
      }

      toast.success("Entry deleted successfully");

      // Re-fetch the data for consistency
      await fetchIncomeExpenseData(
        selectedEmployee.employeeId,
        selectedEmployee.email,
        viewDate.getFullYear(),
        viewDate.getMonth() + 1
      );
    } catch (error) {
      console.error("Error deleting income/expense:", error);
      toast.error(error.message || "Failed to delete entry");
    }
  };

  const calculateTotalWithIncomeExpense = (employeeId, baseTotal) => {
    const entries = incomeExpenseData[employeeId] || {
      income: [],
      expense: [],
    };
    const income = Array.isArray(entries.income) ? entries.income : [];
    const expense = Array.isArray(entries.expense) ? entries.expense : [];

    const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = expense.reduce((sum, entry) => sum + entry.amount, 0);

    const updatedTotal = baseTotal + totalIncome - totalExpense;

    // Update the database with the new total asynchronously
    (async () => {
      try {
        const response = await fetch(`${backEndURL}/api/salary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            year: currentYear,
            month: String(viewDate.getMonth() + 1).padStart(2, "0"),
            employee: {
              email: selectedEmployee.email,
              name: selectedEmployee.name,
              basicSalary: selectedEmployee.basicSalary,
            },
            payrollResult: {
              totalMonthlySalary: updatedTotal,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(
            "Failed to update totalMonthlySalary in the database"
          );
        }
      } catch (error) {
        console.error("Error updating totalMonthlySalary:", error);
      }
    })();

    return updatedTotal;
  };

  // UI for the Edit Modal
  const EditIncomeExpenseModal = ({ entry, onClose, onSave }) => {
    const [type, setType] = useState(entry.type);
    const [amount, setAmount] = useState(entry.amount);
    const [note, setNote] = useState(entry.note);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Edit Entry</h2>
            <button
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave({ type, amount: parseFloat(amount), note });
            }}
          >
            {/* <div className="mb-4">
              <label className="block text-gray-300 mb-2">Type</label>
              <select
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div> */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Note</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Employee Payroll Calculator
        </h1>

        {/* Month Navigation and Calendar */}
        <div className="flex justify-between items-center mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <button
            className="flex items-center justify-center p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            onClick={handlePreviousMonth}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox={svgViewBox} // Use the corrected viewBox
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center relative">
            <button
              className="text-xl font-bold text-white flex items-center justify-center gap-2"
              onClick={() => setShowMonthPicker((prev) => !prev)}
            >
              {currentMonthName} {currentYear}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox={svgViewBox} // Use the corrected viewBox
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {isCurrentMonth() && (
                <span className="ml-2 text-green-400 text-sm px-2 py-0.5 bg-green-900 rounded-full">
                  Current
                </span>
              )}
              {isFutureMonth() && (
                <span className="ml-2 text-yellow-400 text-sm px-2 py-0.5 bg-yellow-900 rounded-full">
                  Future
                </span>
              )}
            </button>

            {showMonthPicker && (
              <div className="absolute z-10 mt-2 left-1/2 transform -translate-x-1/2">
                <MonthYearPicker onSelect={handleMonthYearSelect} />
              </div>
            )}

            {monthsData[currentMonthId] && (
              <p className="text-gray-400 text-sm">
                Total Hours: {monthsData[currentMonthId].totalHours}
              </p>
            )}
          </div>

          <button
            className="flex items-center justify-center p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            onClick={handleNextMonth}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox={svgViewBox} // Use the corrected viewBox
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Admin Controls */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            onClick={() => setShowAdminForm(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox={svgViewBox} // Use the corrected viewBox
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Set Total Hours
          </button>
        </div>

        {/* Admin Form Modal */}
        {showAdminForm && monthsData[currentMonthId] && (
          <AdminHoursForm
            month={currentMonthName}
            year={currentYear}
            totalHours={monthsData[currentMonthId].totalHours}
            currentTotalHours={monthsData[currentMonthId].totalHours}
            onSubmit={handleAdminSubmit}
            onCancel={() => setShowAdminForm(false)}
          />
        )}

        {/* Future Month Warning */}
        {isFutureMonth() && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-yellow-200">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-3 mt-0.5"
                fill="none"
                viewBox={svgViewBox} // Use the corrected viewBox
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-lg">Future Month</h3>
                <p>
                  {currentMonthName} {currentYear} hasn't started yet. No hours
                  have been worked and payroll cannot be calculated. You can
                  view employee information but payroll details are not
                  available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Employee Table */}
        {!isFutureMonth() && (
          <div className="overflow-x-auto mb-8 rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Monthly Work Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {employees.map((employee, index) => {
                  const currentMonthWorkHoursInSeconds =
                    employee.monthlyWorkHours?.[currentMonthId] || 0;
                  const currentMonthWorkHoursInHours = (
                    currentMonthWorkHoursInSeconds / 3600
                  ).toFixed(2);

                  return (
                    <tr
                      key={employee.employeeId}
                      className="hover:bg-gray-700 transition-colors text-center"
                    >
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center mx-auto">
                          {employee.profile ? (
                            <img
                              src={`${employee.profile}`}
                              alt={`${employee.name || ""}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 text-sm">
                              No Image
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {employee.employeeId} - {employee.name} <br />
                        {employee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {employee.basicSalary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {currentMonthWorkHoursInHours} hours
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm flex justify-center gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-2"
                          onClick={() => handleSelectEmployee(employee)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-2"
                          onClick={async () => {
                            const totalWithIncomeExpense = calculateTotalWithIncomeExpense(
                              employee.employeeId,
                              payrollResult.totalMonthlySalary
                            );
                        
                            const blob = await pdf(
                              <PayrollPDF
                                employee={employee}
                                payrollResult={calculatePayroll(employee)}
                                selectedMonthName={currentMonthName}
                                selectedYear={currentYear}
                                incomeExpenseData={incomeExpenseData}
                                totalWithIncomeExpense={totalWithIncomeExpense}
                              />
                            ).toBlob();
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = `Payroll_${employee.name}_${currentMonthName}_${currentYear}.pdf`;
                            link.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download size={16} />
                        </button>
                        <button
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-2"
                          onClick={async () => {
                            const totalWithIncomeExpense = calculateTotalWithIncomeExpense(
                              employee.employeeId,
                              payrollResult.totalMonthlySalary
                            );
                        
                            const blob = await pdf(
                              <PayrollPDF
                                employee={employee}
                                payrollResult={calculatePayroll(employee)}
                                selectedMonthName={currentMonthName}
                                selectedYear={currentYear}
                                incomeExpenseData={incomeExpenseData}
                                totalWithIncomeExpense={totalWithIncomeExpense}
                              />
                            ).toBlob();
                            const url = URL.createObjectURL(blob);
                            const printWindow = window.open("", "_blank");
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Print Payroll</title>
                                  <style>
                                    body {
                                      margin: 0;
                                      padding: 0;
                                      display: flex;
                                      justify-content: center;
                                      align-items: center;
                                      height: 100vh;
                                      background-color: #f3f4f6;
                                    }
                                    iframe {
                                      width: 100%;
                                      height: 100%;
                                      border: none;
                                    }
                                  </style>
                                </head>
                                <body>
                                  <iframe src="${url}" onload="this.contentWindow.print();"></iframe>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-2"
                          onClick={() => {
                            setEmailDetails({
                              to: employee.email,
                              subject: `Payroll Details for ${employee.name} - ${currentMonthName} ${currentYear}`,
                              message: "",
                              attachment: null,
                            });
                            setShowEmailForm(true);
                          }}
                        >
                          <Send size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Payroll Calculation Section */}
        {isFutureMonth() ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-yellow-500 mb-4"
                fill="none"
                viewBox={svgViewBox} // Use the corrected viewBox
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-bold text-white mb-2">
                Future Month - Payroll Not Available
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Payroll calculations for {currentMonthName} {currentYear} are
                not available because this month hasn't started yet. Please
                select a current or past month to view payroll details.
              </p>
            </div>
          </div>
        ) : selectedEmployee && payrollResult ? (
          <div
            id="payroll-section"
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
          >
            <div className="bg-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">
                Payroll Calculation - {selectedEmployee.name} -{" "}
                {currentMonthName} {currentYear}
              </h2>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Employee Info */}
              <div className="bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-600">
                  Employee Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white font-medium">
                      {selectedEmployee.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span className="text-white">
                      {selectedEmployee.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Department:</span>
                    <span className="text-white">
                      {selectedEmployee.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Basic Salary:</span>
                    <span className="text-white">
                      {selectedEmployee.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payroll Salary:</span>
                    <span className="text-white">
                      {payrollResult?.payrollSalary
                        ? payrollResult.payrollSalary.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Overtime Salary:</span>
                    <span className="text-white">
                      {payrollResult?.overtimeSalary
                        ? payrollResult.overtimeSalary.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Monthly Salary:</span>
                    <span className="text-white font-medium">
                      {calculateTotalWithIncomeExpense(
                        selectedEmployee.employeeId,
                        payrollResult.totalMonthlySalary
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Employee EPF Deduction (8%):
                    </span>
                    <span className="text-white">
                      {payrollResult?.employeeEpfDeduction
                        ? payrollResult.employeeEpfDeduction.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Company EPF Contribution (12%):
                    </span>
                    <span className="text-white">
                      {payrollResult?.companyEpfContribution
                        ? payrollResult.companyEpfContribution.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Company ETF Contribution (3%):
                    </span>
                    <span className="text-white">
                      {payrollResult?.companyEtfContribution
                        ? payrollResult.companyEtfContribution.toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Income/Expense Input */}
                <div className="max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-lg">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setShowAddIncomeExpense((prev) => !prev)}
                  >
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Add Income or Expense
                    </h2>
                    {showAddIncomeExpense ? (
                      <ChevronUp className="text-white" />
                    ) : (
                      <ChevronDown className="text-white" />
                    )}
                  </div>
                  {showAddIncomeExpense && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddIncomeExpense(
                          incomeExpenseType,
                          incomeExpenseAmount,
                          incomeExpenseNote
                        );
                        // Clear inputs after saving
                        setIncomeExpenseType("income");
                        setIncomeExpenseAmount("");
                        setIncomeExpenseNote("");
                      }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-gray-300 mb-1"
                            htmlFor="type"
                          >
                            Type
                          </label>
                          <select
                            id="type"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            value={incomeExpenseType}
                            onChange={(e) =>
                              setIncomeExpenseType(e.target.value)
                            }
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>
                        </div>

                        <div>
                          <label
                            className="block text-gray-300 mb-1"
                            htmlFor="amount"
                          >
                            Amount
                          </label>
                          <input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                            value={incomeExpenseAmount}
                            onChange={(e) =>
                              setIncomeExpenseAmount(e.target.value)
                            }
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-gray-300 mb-1"
                          htmlFor="note"
                        >
                          Note
                        </label>
                        <input
                          id="note"
                          type="text"
                          placeholder="Add a note (optional)"
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          value={incomeExpenseNote}
                          onChange={(e) => setIncomeExpenseNote(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg font-medium"
                        >
                          Add Entry
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Income/Expense Table */}
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-2">
                    Income/Expense History
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-600">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Note
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-600">
                        {incomeExpenseLoading ? (
                          <tr>
                            <td colSpan="4" className="text-center py-6">
                              <DotSpinner />{" "}
                              {/* Loader displayed while data is being fetched */}
                            </td>
                          </tr>
                        ) : (
                          ["income", "expense"].map((type) =>
                            (
                              incomeExpenseData[selectedEmployee?.employeeId]?.[
                                type
                              ] || []
                            ).map((entry) => (
                              <tr key={entry[`${type}_id`]}>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {type}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {entry.amount.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-300">
                                  {entry.note}
                                </td>
                                <td className="px-4 py-3 text-sm flex gap-2">
                                  <button
                                    className="text-yellow-400 hover:text-yellow-500"
                                    onClick={() => {
                                      setEditEntry(entry); // Set the selected entry
                                      setEditModalVisible(true); // Open the modal
                                    }}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    className="text-red-400 hover:text-red-500"
                                    onClick={() =>
                                      handleDeleteIncomeExpense(
                                        entry[`${type}_id`]
                                      )
                                    }
                                  >
                                    <Trash size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Payroll Breakdown */}
              <div className="md:col-span-2 bg-gray-750 rounded-lg p-4 border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-4 pb-2 border-b border-gray-600">
                  Payroll Breakdown
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          Regular Hours
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          {payrollResult?.totalHours || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          {payrollResult?.monthlyWorkHours || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          {payrollResult?.payrollSalary?.toLocaleString() ||
                            "N/A"}
                        </td>
                      </tr>
                      {payrollResult?.overtimeHours > 0 && (
                        <tr>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            Overtime Hours
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">
                            {payrollResult.overtimeHours}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">
                            {selectedEmployee.OVERTIME_RATE}/hr
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">
                            {payrollResult.overtimeSalary
                              ? payrollResult.overtimeSalary
                              : "N/A"}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          EPF Deduction (8%)
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          -
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 text-right">
                          -
                          {payrollResult?.employeeEpfDeduction
                            ? payrollResult.employeeEpfDeduction
                            : "N/A"}
                        </td>
                      </tr>
                      <tr className="bg-gray-700">
                        <td className="px-4 py-3 text-sm font-bold text-white">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-white text-right">
                          {payrollResult?.totalHours || 0}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-sm font-bold text-white text-right">
                          {calculateTotalWithIncomeExpense(
                            selectedEmployee.employeeId,
                            payrollResult.totalMonthlySalary
                          ).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-white mb-2">
                    Payment Summary for {currentMonthName} {currentYear}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {selectedEmployee.name} worked {payrollResult.totalHours}{" "}
                    hours in {currentMonthName} {currentYear} out of the total{" "}
                    {payrollResult.monthlyWorkHours} hours.
                    {payrollResult.overtimeHours > 0
                      ? ` This includes ${payrollResult.overtimeHours} hours of overtime which is compensated at a rate of ${selectedEmployee.OVERTIME_RATE}/= per hour.`
                      : payrollResult.totalHours <
                        payrollResult.monthlyWorkHours
                      ? ` The employee worked ${
                          payrollResult.monthlyWorkHours -
                          payrollResult.totalHours
                        } hours less than the total hours.`
                      : ` The employee worked exactly the total hours.`}
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    The regular salary is calculated as a percentage (
                    {payrollResult.percentage}%) of the monthly salary (
                    {payrollResult.monthlySalary}). This calculation follows the
                    formula: (monthlySalary / 100) * percentage.
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>EPF/ETF Breakdown:</strong>
                    <br />- Employee EPF Deduction (8%):{" "}
                    {payrollResult.employeeEpfDeduction.toLocaleString()}/=
                    <br />- Company EPF Contribution (12%):{" "}
                    {payrollResult.companyEpfContribution.toLocaleString()}/=
                    <br />- Company ETF Contribution (3%):{" "}
                    {payrollResult.companyEtfContribution.toLocaleString()}/=
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Expenses and Income Breakdown:</strong>
                    <br />- Total Income:{" "}
                    {Array.isArray(
                      incomeExpenseData[selectedEmployee.employeeId]?.income
                    )
                      ? incomeExpenseData[selectedEmployee.employeeId].income
                          .reduce((sum, entry) => sum + entry.amount, 0)
                          .toLocaleString()
                      : 0}
                    /=
                    <br />- Total Expenses:{" "}
                    {Array.isArray(
                      incomeExpenseData[selectedEmployee.employeeId]?.expense
                    )
                      ? incomeExpenseData[selectedEmployee.employeeId].expense
                          .reduce((sum, entry) => sum + entry.amount, 0)
                          .toLocaleString()
                      : 0}
                    /=
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    <strong>Total Expense for the Company:</strong>{" "}
                    {(
                      calculateTotalWithIncomeExpense(
                        selectedEmployee.employeeId,
                        payrollResult.totalMonthlySalary
                      ) +
                      // (payrollResult?.employeeEpfDeduction || 0) +
                      (payrollResult?.companyEpfContribution || 0) +
                      (payrollResult?.companyEtfContribution || 0)
                    ).toLocaleString()}
                    /=
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <p className="text-gray-400">
              Select an employee from the table above to view payroll
              calculation.
            </p>
          </div>
        )}
        {/* PDF Preview Modal */}
        {showPDFPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-4xl">
              <button
                onClick={() => setShowPDFPreview(false)}
                className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded"
              >
                Close
              </button>
              <PDFViewer style={{ width: "100%", height: "500px" }}>
                <PayrollPDF
                  employee={selectedEmployee}
                  payrollResult={payrollResult}
                />
              </PDFViewer>
            </div>
          </div>
        )}
        {/* Email Form Modal */}
        {showEmailForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold text-white mb-4">
                Send Payroll Details
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // handleSendEmail();
                }}
              >
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">To</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={emailDetails.to}
                    readOnly
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={emailDetails.subject}
                    onChange={(e) =>
                      setEmailDetails((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    value={emailDetails.message}
                    onChange={(e) =>
                      setEmailDetails((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Attachment</label>
                  <input
                    type="file"
                    className="w-full text-gray-300"
                    onChange={(e) =>
                      setEmailDetails((prev) => ({
                        ...prev,
                        attachment: e.target.files[0],
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    onClick={() => setShowEmailForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                    disabled={isSending}
                  >
                    {isSending ? <DotSpinner /> : "Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Render the Edit Modal */}
        {editModalVisible && editEntry && (
          <EditIncomeExpenseModal
            entry={{ ...editEntry, originalType: editEntry.type }}
            onClose={() => setEditModalVisible(false)} // Close the modal
            onSave={(updatedEntry) => {
             

              // Determine typeId and typert default App;
              const isIncome = !!editEntry?.income_id;
              const typeId = isIncome
                ? editEntry?.income_id
                : editEntry?.expense_id;
              const type = isIncome ? "income" : "expense";
              if (!typeId || !type) {
                console.error("Missing typeId or type", { typeId, type });
                return;
              }

              // Add type to the updated entry
              const finalUpdatedEntry = {
                ...updatedEntry,
                type,
              };

              handleEditIncomeExpense(typeId, finalUpdatedEntry); // Pass the correct `typeId` and `updatedEntry`
              setEditModalVisible(false); // Close the modal after saving
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
