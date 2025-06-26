const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateJWT = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissionMiddleware');

// All task routes require authentication and 'tasks' permission
router.use(authenticateJWT);
router.use(checkPermission('tasks'));

router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.patch('/:id', taskController.updateTaskStatus);

module.exports = router;
