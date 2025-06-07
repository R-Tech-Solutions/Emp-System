const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./firebaseConfig'); 
const departmentRoutes = require("./routes/System/departmentRoutes");
const employmentTypeRoutes = require("./routes/System/employmentTypeRoutes");
const employmentStatusRoutes = require("./routes/System/employmentStatusRoutes");
const certificateLevelRoutes = require("./routes/System/certificateLevelRoutes");
const employeeRoutes = require('./routes/employee/employeeRoutes');
const positionsRoutes = require("./routes/System/positionsRoutes");
const taskRoutes = require('./routes/taskRoutes');
const groupRoutes = require('./routes/groupRoutes');
const announcementRoutes = require('./routes/announcementRoutes'); 
const leaveRoutes = require('./routes/leaveRoutes');
const userRoutes = require('./routes/userRoutes');
const assetRoutes =require('./routes/assetRoutes');
const shiftRoutes =require('./routes/shiftRoutes')
const employeeWorkHoursRoutes = require('./routes/employee/employeeWorkHoursRoutes');
const monthlyWorkHoursRoutes = require('./routes/monthlyWorkHoursRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const incomeExpenseRoutes = require('./routes/employee/incomeExpenseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const productRoutes = require('./routes/productRoutes');
const contactRoutes = require('./routes/ContactRoutes');
const crmRoutes = require('./routes/CrmRoutes');
const quatationRoutes = require('./routes/QuatationRoute');
const inventoryRoutes = require('./routes/InventoryRoute');
const purchaseRoutes = require('./routes/PurchaseRoutes');
const supplierRoutes = require('./routes/SupplierRoutes');
const cashbookRoutes = require('./routes/CashbookRoutes');
const financeRoutes = require('./routes/FinanceRoutes');
const invoiceRoutes = require('./routes/InvoiceRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); 
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
app.use('/api/assets', assetRoutes)
app.use('/api/shifts', shiftRoutes)
app.use('/api/employee-work-hours', employeeWorkHoursRoutes);
app.use('/api/monthly-work-hours', monthlyWorkHoursRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/income-expenses', incomeExpenseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/quotation', quatationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!'); 
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' }); 
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Firebase connected with configuration');
});

module.exports = { app, db };