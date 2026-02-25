const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

// Register guest
router.post('/register', guestController.registerGuest);

// Login guest
router.post('/l2ogin',middelware guestController.loginGuest);

// Get all guests
router.get('/', guestController.getAllGuests);

// Get guest by email
router.get('/email/:email', guestController.getGuestByEmail);

// Get guest by ID
router.get('/:id', guestController.getGuestById);

// Update guest
router.put('/:id', guestController.updateGuest);

// Delete guest
router.delete('/:id', guestController.deleteGuest);

module.exports = router;
