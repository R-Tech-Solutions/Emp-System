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
const UserRoutes = require('./routes/userRoutes');
const AssetRoutes = require('./routes/AssetRoutes');
const ShiftRoutes = require('./routes/ShiftRoutes');
const EmployeeWorkHoursRoutes = require('./routes/employee/EmployeeWorkHoursRoutes');
const MonthlyWorkHoursRoutes = require('./routes/MonthlyWorkHoursRoutes');
const SalaryRoutes = require('./routes/SalaryRoutes');
const IncomeExpenseRoutes = require('./routes/employee/IncomeExpenseRoutes');
const AttendanceRoutes = require('./routes/AttendanceRoutes');
const ProductRoutes = require('./routes/ProductRoutes');
const ContactRoutes = require('./routes/ContactRoutes');
const CrmRoutes = require('./routes/CrmRoutes');
const QuatationRoute = require('./routes/QuatationRoute');
const InventoryRoute = require('./routes/InventoryRoute');
const PurchaseRoutes = require('./routes/PurchaseRoutes');
const SupplierRoutes = require('./routes/SupplierRoutes');
const CashbookRoutes = require('./routes/CashbookRoutes');
const FinanceRoutes = require('./routes/FinanceRoutes');
const InvoiceRoutes = require('./routes/InvoiceRoutes');
const AdditionalRoutes = require('./routes/AdditionalRoutes');
const IdentifiersRoutes = require('./routes/IdentifiersRoutes');
const BuisnessSettingsRoutes = require('./routes/BuisnessSettingsRoutes');
const CashInRoutes = require('./routes/CashInRoutes');
const ReturnRoute = require('./routes/ReturnRoute');
const InvoiceModel = require('./models/InvoiceModel');
const databaseRoutes = require('./routes/databaseRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration to allow both development and production origins
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://3.92.180.32').split(',');
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ["Authorization"],
}));

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
app.use('/api/contacts', ContactRoutes);
app.use('/api/crm', CrmRoutes);
app.use('/api/quotation', QuatationRoute);
app.use('/api/inventory', InventoryRoute);
app.use('/api/purchase', PurchaseRoutes);
app.use('/api/suppliers', SupplierRoutes);
app.use('/api/cashbook', CashbookRoutes);
app.use('/api/finance', FinanceRoutes);
app.use('/api/invoices', InvoiceRoutes);
app.use('/api/additional', AdditionalRoutes);
app.use('/api/identifiers', IdentifiersRoutes);
app.use('/api/business-settings', BuisnessSettingsRoutes);
app.use('/api/cashin', CashInRoutes);
app.use('/api/returns', ReturnRoute);
app.use('/api/database', databaseRoutes);

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
    
    // Run invoice migration on server start
    InvoiceModel.migrateExistingInvoices()
        .then(count => {
            console.log(`Invoice migration completed. ${count} invoices processed.`);
        })
        .catch(error => {
            console.error('Invoice migration failed:', error);
        });
});

module.exports = { app, db };