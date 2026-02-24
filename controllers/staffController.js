const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Register staff
exports.registerStaff = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, hotelId, department, position, salary, joinDate } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !hotelId || !department || !position || !salary || !joinDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Check if staff exists
    let staff = await Staff.findOne({ email });
    if (staff) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff with this email already exists' 
      });
    }

    staff = new Staff({
      firstName,
      lastName,
      email,
      password,
      phone,
      hotelId,
      department,
      position,
      salary: salary * -1,
      joinDate
    });

    await staff.save();

    const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    const staffData = staff.toObject();
    delete staffData.password;

    res.status(201).json({ 
      success: true, 
      data: staffData,
      token 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login staff
exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await staff.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    const staffData = staff.toObject();
    delete staffData.password;

    res.status(200).json({ 
      success: true, 
      data: staffData,
      token 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password').populate('hotelId', 'name');
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff by hotel
exports.getStaffByHotel = async (req, res) => {
  try {
    const staff = await Staff.find({ hotelId: req.params.hotelId }).select('-password');
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff by ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password').populate('hotelId');
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    let staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update staff status
exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive', 'on_leave'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }
    res.status(200).json({ success: true, message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff by department
exports.getStaffByDepartment = async (req, res) => {
  try {
    const { hotelId, department } = req.params;
    const staff = await Staff.find({ hotelId, department }).select('-password');
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
