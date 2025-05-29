const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.createContact);

router.get('/', contactController.getContacts);
// Get a contact by ID
router.get('/:id', contactController.getContactById);
// Update a contact
router.put('/:id', contactController.updateContact);
// Delete a contact
router.delete('/:id', contactController.deleteContact);

module.exports = router;