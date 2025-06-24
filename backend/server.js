const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./firebaseConfig'); 

const DepartmentRoutes = require("./routes/system/DepartmentRoutes");
const EmploymentTypeRoutes = require("./routes/system/EmploymentTypeRoutes");
const EmploymentStatusRoutes = require("./routes/system/EmploymentStatusRoutes");
const CertificateLevelRoutes = require("./routes/system/CertificateLevelRoutes");
const PositionsRoutes = require("./routes/system/PositionsRoutes");

const EmployeeRoutes = require('./routes/employee/EmployeeRoutes');
const TaskRoutes = require('./routes/TaskRoutes');
const GroupRoutes = require('./routes/GroupRoutes');
const AnnouncementRoutes = require('./routes/AnnouncementRoutes'); 
const LeaveRoutes = require('./routes/LeaveRoutes');
const UserRoutes = require('./routes/UserRoutes');
const AssetRoutes = require('./routes/AssetRoutes');
const ShiftRoutes = require('./routes/ShiftRoutes');
const EmployeeWorkHoursRoutes = require('./routes/employee/EmployeeWorkHoursRoutes');
const MonthlyWorkHoursRoutes = require('./routes/MonthlyWorkHoursRoutes');
const SalaryRoutes = require('./routes/SalaryRoutes');
const IncomeExpenseRoutes = require('./routes/employee/IncomeExpenseRoutes');
const AttendanceRoutes = require('./routes/AttendanceRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const contactRoutes = require('./routes/ContactRoutes');
const crmRoutes = require('./routes/CrmRoutes');
const quatationRoutes = require('./routes/QuatationRoute');
const inventoryRoutes = require('./routes/InventoryRoute');
const purchaseRoutes = require('./routes/PurchaseRoutes');
const supplierRoutes = require('./routes/SupplierRoutes');
const cashbookRoutes = require('./routes/CashbookRoutes');
const financeRoutes = require('./routes/FinanceRoutes');
const invoiceRoutes = require('./routes/InvoiceRoutes');
const additionalRoutes = require('./routes/AdditionalRoutes');
const IdentifiersRoutes = require('./routes/IdentifiersRoutes');
const buisnessSettingsRoutes = require('./routes/BuisnessSettingsRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); 
app.use(express.json());

app.use("/api/departments", DepartmentRoutes);
app.use("/api/employees", EmployeeRoutes);
app.use("/api/employment-types", EmploymentTypeRoutes);
app.use("/api/employment-status", EmploymentStatusRoutes);
app.use("/api/certificate-levels", CertificateLevelRoutes);
app.use("/api/positions", PositionsRoutes);
app.use('/api/tasks', TaskRoutes);
app.use('/api/groups', GroupRoutes);
app.use('/api/announcements', AnnouncementRoutes);
app.use('/api/leave', LeaveRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/assets', AssetRoutes);
app.use('/api/shifts', ShiftRoutes);
app.use('/api/employee-work-hours', EmployeeWorkHoursRoutes);
app.use('/api/monthly-work-hours', MonthlyWorkHoursRoutes);
app.use('/api/salary', SalaryRoutes);
app.use('/api/income-expenses', IncomeExpenseRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/quotation', quatationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/additional', additionalRoutes);
app.use('/api/identifiers', IdentifiersRoutes);
app.use('/api/business-settings', buisnessSettingsRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!'); 
});
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: err.message 
    });
});
app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds
    res.setTimeout(30000);
    next();
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Firebase connected with configuration');
});

module.exports = { app, db };