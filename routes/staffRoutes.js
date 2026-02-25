const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Register staff
router.post('/register', staffController.registerStaff);

// Login staff
router.post('/login', staffController.loginStaff);

// Get all staff
router.get('/', staffController.getAllStaff);
// Get staff by hotel
router.get('/hotel/:hotelId', staffController.getStaffByHotel);

// Get staff by department
router.get('/hotel/:hotelId/department/:department', staffController.getStaffByDepartment);

// Get staff by ID
router.get('/:id', staffController.getStaffById);

// Update staff
router.put('/:id', staffController.updateStaff);

// Update staff status
router.patch('/:id/status', staffController.updateStaffStatus);

// Delete staff
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
