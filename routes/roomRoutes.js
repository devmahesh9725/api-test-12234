const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Create a new room
router.post('/', roomController.createRoom);

// Get all rooms
router.get('/', roomController.getAllRooms);

// Get rooms by hotel ID
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);

// Search available rooms
router.get('/search/available', roomController.searchAvailableRooms);

// Get single room by ID
router.get('/:id', roomController.getRoomById);

// Update room
router.put('/:id', roomController.updateRoom);

// Update room status
router.patch('/:id/status', roomController.updateRoomStatus);

// Delete room
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
