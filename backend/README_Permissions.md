# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This system implements secure role-based access control using JWT tokens. Users can be either:
- **Admin**: Full access to all features
- **User**: Access based on specific permissions

## JWT Token Structure
When a user logs in, a JWT token is generated containing:
```json
{
  "id": "user_id",
  "email": "user@example.com", 
  "role": "admin|user",
  "status": "active|inactive",
  "permissions": {
    "employees": true,
    "tasks": true,
    "payroll": false,
    // ... other permissions
  },
  "name": "User Name"
}
```

## Permission Categories
Based on your frontend sidebar structure:

### Human Resource
- `employees` - Employee management
- `tasks` - Task management  
- `timesheets` - Timesheet management
- `attendance` - Attendance tracking
- `leave-requests` - Leave request system
- `payroll` - Payroll management
- `messages` - Messaging system
- `assets` - Asset management
- `user` - User management
- `my` - Personal profile
- `reports` - HR reports

### Sales & Inventory
- `salesdashboard` - Sales dashboard
- `crm` - Customer relationship management
- `products` - Product management
- `quatation` - Quotation system
- `purchase` - Purchase management
- `inventory` - Inventory management
- `supplier` - Supplier management
- `cashbook` - Cashbook management
- `income` - Income management
- `invoice` - Invoice management

## How to Apply Permissions to Routes

### 1. Import Required Middleware
```javascript
const authenticateJWT = require('../middleware/authMiddleware');
const { checkPermission, checkAnyPermission, checkAllPermissions } = require('../middleware/permissionMiddleware');
```

### 2. Apply to Route Files

#### Option A: Apply to All Routes in a File
```javascript
// All routes in this file require 'employees' permission
router.use(authenticateJWT);
router.use(checkPermission('employees'));

router.get('/', controller.getAll);
router.post('/', controller.create);
// ... other routes
```

#### Option B: Apply to Specific Routes
```javascript
router.get('/', authenticateJWT, checkPermission('employees'), controller.getAll);
router.post('/', authenticateJWT, checkPermission('employees'), controller.create);
```

#### Option C: Multiple Permissions (Any)
```javascript
// User needs either 'employees' OR 'tasks' permission
router.get('/', authenticateJWT, checkAnyPermission(['employees', 'tasks']), controller.getAll);
```

#### Option D: Multiple Permissions (All)
```javascript
// User needs BOTH 'employees' AND 'tasks' permission
router.get('/', authenticateJWT, checkAllPermissions(['employees', 'tasks']), controller.getAll);
```

## Route Permission Mapping

### Human Resource Routes
- `/api/employees` → `employees` permission
- `/api/tasks` → `tasks` permission
- `/api/employee-work-hours` → `timesheets` permission
- `/api/attendance` → `attendance` permission
- `/api/leave` → `leave-requests` permission
- `/api/salary` → `payroll` permission
- `/api/assets` → `assets` permission
- `/api/users` → `user` permission (admin only for all users)

### Sales & Inventory Routes
- `/api/crm` → `crm` permission
- `/api/products` → `products` permission
- `/api/quotation` → `quatation` permission
- `/api/purchase` → `purchase` permission
- `/api/inventory` → `inventory` permission
- `/api/suppliers` → `supplier` permission
- `/api/cashbook` → `cashbook` permission
- `/api/income-expenses` → `income` permission
- `/api/invoices` → `invoice` permission

## Frontend Implementation

### 1. Store JWT Token
```javascript
// On login success
const { token, user } = response.data;
// Store in React state/context (NOT localStorage/sessionStorage)
setAuthToken(token);
setUser(user);
```

### 2. Send Token with Requests
```javascript
// Add to axios requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Or for individual requests
const response = await axios.get('/api/employees', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Check Permissions in Frontend
```javascript
// Check if user has permission
const hasPermission = (permission) => {
  return user.role === 'admin' || user.permissions[permission] === true;
};

// Show/hide components based on permissions
{hasPermission('employees') && <EmployeeManagement />}
```

## Security Notes

1. **Never store JWT in localStorage/sessionStorage** - Use React state or context
2. **Always verify JWT on backend** - Never trust frontend-sent user data
3. **JWT expires in 24 hours** - Implement refresh token if needed
4. **Admin bypasses all permission checks** - Admins have full access
5. **Regular users can only access their own data** - Unless they have specific permissions

## Testing

### Test Admin Access
```bash
# Login as admin
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use returned token
curl -X GET http://localhost:3001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test User Access
```bash
# Login as regular user
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Test with permissions
curl -X GET http://localhost:3001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 