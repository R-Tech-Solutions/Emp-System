const express = require('express');
const positionController = require('../../controllers/system/positionController');

const router = express.Router();

router.get('/', positionController.getAll);
router.get('/:id', positionController.getById);
router.post('/', positionController.create);
router.put('/:id', positionController.update);
router.delete('/:id', positionController.delete);

module.exports = router;
