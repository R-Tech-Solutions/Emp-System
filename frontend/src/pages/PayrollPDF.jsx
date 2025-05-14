import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Adjust styles to fit content on one page
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 20, // Reduced padding
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10, // Reduced margin
  },
  logo: {
    width: 60, // Reduced size
    height: 60,
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 10, // Reduced font size
  },
  companyName: {
    fontSize: 18, // Reduced font size
    color: "#38bdf8",
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 10, // Reduced font size
    color: "#64748b",
  },
  titleCenter: {
    textAlign: "center",
    fontSize: 16, // Reduced font size
    marginVertical: 8, // Reduced margin
    fontWeight: "bold",
    color: "#0ea5e9",
  },
  section: {
    marginBottom: 10, // Reduced margin
    padding: 10, // Reduced padding
    backgroundColor: "#ffffff",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: 12, // Reduced font size
    marginBottom: 6, // Reduced margin
    fontWeight: "bold",
    color: "#0ea5e9",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 2, // Reduced padding
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10, // Reduced font size
    marginBottom: 4, // Reduced margin
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
    padding: 4, // Reduced padding
    fontSize: 10, // Reduced font size
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 4, // Reduced padding
    fontSize: 10, // Reduced font size
    borderBottom: "1px solid #e2e8f0",
  },
  footer: {
    marginTop: 10, // Reduced margin
    textAlign: "center",
    fontSize: 8, // Reduced font size
    color: "#6b7280",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8, // Reduced padding
  },
  footerLogo: {
    width: 30, // Reduced size
    height: 30,
    marginTop: 8, // Reduced margin
    marginLeft: "auto",
    marginRight: "auto",
  },
});

// Component
const PayrollPDF = ({ employee, payrollResult, selectedMonthName, selectedYear }) => {
  const date = new Date().toLocaleDateString();

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
              {(payrollResult.totalMonthlySalary).toLocaleString()}/=
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text>RTECHSL Pvt Ltd | www.rtechsl.lk | info@rtechsl.lk</Text>
          <Text>Generated on: {date}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default PayrollPDF;
