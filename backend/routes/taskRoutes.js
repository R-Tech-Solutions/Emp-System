const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
// const authenticateJWT = require('../middleware/authMiddleware');
// const { checkPermission } = require('../middleware/permissionMiddleware');

// All task routes require authentication
// router.use(authenticateJWT);

// Custom middleware to check tasks permission or admin role
// const checkTasksPermission = (req, res, next) => {
//   if (req.user.role === 'admin') {
//     return next();
//   }
//   const userPermissions = req.user.permissions || {};
//   if (userPermissions.tasks === true) {
//     return next();
//   }
//   return res.status(403).json({
//     success: false,
//     message: 'Access denied: You don\'t have permission to access tasks'
//   });
// };

// router.use(checkTasksPermission);

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id', taskController.updateTaskStatus);

module.exports = router;
