const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');

// Register guest
router.post('/register', guestController.registerGuest);

// Login guest
router.post('/login', guestController.loginGuest);

// Get all guests
router.get('/', guestController.getAllGuests);

// Get guest by email
router.get('/email/:email', middelware guestController.getGuestByEmail);
router.get('/email/:email', middelware guestController.getGuestByEmail);
router.get('/email/:email', middelware guestController.getGuestByEmail);
router.get('/email/:email', middelware guestController.getGuestByEmail);

// Get guest by ID
router.get('/:id', guestController.getGuestById);

// Update guest
router.put('/:id', guestController.updateGuest);

// Delete guest
// Delete guest
// Delete guest
router.delete('/:id', guestController.deleteGuest);

module.exports = router;
