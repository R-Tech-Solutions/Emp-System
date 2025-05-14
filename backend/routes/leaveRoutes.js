// leaveRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/leaveController');

router.post('/', controller.createLeave);
router.get('/', controller.getLeaves);
router.put('/:id', controller.updateLeave);
router.patch('/:id', controller.updateLeaveStatus);

module.exports = router;
