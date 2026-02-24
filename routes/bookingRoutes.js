const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings
router.get('/', bookingController.getAllBookings);

// Get bookings by guest ID
router.get('/guest/:guestId', bookingController.getBookingsByGuest);

// Get single booking by ID
router.get('/:id', bookingController.getBookingById);

// Update booking
router.put('/:id', bookingController.updateBooking);

// Update booking status
router.patch('/:id/status', bookingController.updateBookingStatus);

// Update payment status
router.patch('/:id/payment-status', bookingController.updatePaymentStatus);

// Cancel booking
router.patch('/:id/cancel', bookingController.cancelBooking);

// Delete booking
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
