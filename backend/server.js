const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./firebaseConfig'); 

const departmentRoutes = require("./routes/system/departmentRoutes");
const employmentTypeRoutes = require("./routes/system/employmentTypeRoutes");
const employmentStatusRoutes = require("./routes/system/employmentStatusRoutes");
const certificateLevelRoutes = require("./routes/system/certificateLevelRoutes");
const positionsRoutes = require("./routes/system/positionsRoutes");

const employeeRoutes = require('./routes/employee/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const groupRoutes = require('./routes/groupRoutes');
const announcementRoutes = require('./routes/announcementRoutes'); 
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const employeeWorkHoursRoutes = require('./routes/employee/employeeWorkHoursRoutes');
const monthlyWorkHoursRoutes = require('./routes/monthlyWorkHoursRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const incomeExpenseRoutes = require('./routes/employee/incomeExpenseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/ContactRoutes');
const crmRoutes = require('./routes/CrmRoutes');
const quatationRoute = require('./routes/QuatationRoute');
const inventoryRoute = require('./routes/InventoryRoute');
const purchaseRoutes = require('./routes/PurchaseRoutes');
const supplierRoutes = require('./routes/SupplierRoutes');
const cashbookRoutes = require('./routes/CashbookRoutes');
const financeRoutes = require('./routes/FinanceRoutes');
const invoiceRoutes = require('./routes/InvoiceRoutes');
const additionalRoutes = require('./routes/AdditionalRoutes');
const identifiersRoutes = require('./routes/IdentifiersRoutes');
const buisnessSettingsRoutes = require('./routes/BuisnessSettingsRoutes');
const cashInRoutes = require('./routes/CashInRoutes');
const returnRoute = require('./routes/ReturnRoute');
const InvoiceModel = require('./models/InvoiceModel');
const databaseRoutes = require('./routes/databaseRoutes');
const holdBillsRoutes = require('./routes/HoldBillsRoutes');
const returnProcessRoute = require('./routes/ReturnProcessRoute');

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

app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/employment-types", employmentTypeRoutes);
app.use("/api/employment-status", employmentStatusRoutes);
app.use("/api/certificate-levels", certificateLevelRoutes);
app.use("/api/positions", positionsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/announcements', announcementRoutes);  
app.use('/api/leave', leaveRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/employee-work-hours', employeeWorkHoursRoutes);
app.use('/api/monthly-work-hours', monthlyWorkHoursRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/income-expenses', incomeExpenseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/quotation', quatationRoute);
app.use('/api/inventory', inventoryRoute);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/additional', additionalRoutes);
app.use('/api/identifiers', identifiersRoutes);
app.use('/api/business-settings', buisnessSettingsRoutes);
app.use('/api/cashin', cashInRoutes);
app.use('/api/returns', returnRoute);
app.use('/api/return-process', returnProcessRoute); // changed from '/api/returns'
app.use('/api/database', databaseRoutes);
app.use('/api/hold-bills', holdBillsRoutes);

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