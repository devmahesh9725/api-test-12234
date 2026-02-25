const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Create a new hotel
router.post('/', hotelController.createHotel);
router.post('/', hotelController.createHotel);
router.post('/', hotelController.createHotel);

// Get all hotels
router.get('/', hotelController.getAllHotels);

// Search hotels
router.get('/search', hotelController.searchHotels);

// Get single hotel by ID
router.get('/:id', hotelController.getHotelById);
router.get('/:id', hotelController.getHotelById);
router.get('/:id', hotelController.getHotelById);

// Update hotel
router.put('/:id', hotelController.updateHotel);
router.put('/:id', hotelController.updateHotel);
router.put('/:id', hotelController.updateHotel);

// Delete hotel
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
