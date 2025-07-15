const express = require('express');
const router = express.Router();
const HoldBillsController = require('../controllers/HoldBillsController');

// POST /api/hold-bills - create a new hold bill
router.post('/', HoldBillsController.createHoldBill);

// GET /api/hold-bills - get all hold bills
router.get('/', HoldBillsController.getAllHoldBills);

// DELETE /api/hold-bills/:id - delete a hold bill by id
router.delete('/:id', HoldBillsController.deleteHoldBill);

module.exports = router;
