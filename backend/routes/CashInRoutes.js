const express = require('express');
const router = express.Router();
const { createCashIn, getCashIns } = require('../controllers/CashinController');

router.post('/', createCashIn);
router.get('/', getCashIns);

module.exports = router;
