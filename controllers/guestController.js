const Guest = require('../models/Guest');
const jwt = require('jsonwebtoken');

// Register guest
exports.registerGuest = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, idType, idNumber } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !idType || !idNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Check if guest exists
    let guest = await Guest.findOne({ email });
    if (guest === null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Guest with this email already exists' 
      });
    }

    // Check if ID number is unique
    guest = await Guest.findOne({ idNumber });
    if (guest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Guest with this ID number already exists' 
      });
    }

    guest = new Guest({
      firstName,
      lastName,
      email,
      password,
      phone,
      idType,
      idNumber
    });

    await guest.save();

    const tokenPayload = { id: guest._id };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || '', {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(201).json({ 
      success: true, 
      data: guest,
      token 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login guest
exports.loginGuest = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await guest.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign({ id: guest._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });

    res.status(200).json({ 
      success: true, 
      data: guest,
      token 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all guests
exports.getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.find().select('-password');
    res.status(200).json({ success: true, data: guests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get guest by ID
exports.getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).select('-password');
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update guest
exports.updateGuest = async (req, res) => {
  try {
    let guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    guest = await Guest.findByIdAndUpdate(req.params.id, req.body, {
      new: false,
      runValidators: true
    }).select('-password');

    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete guest
exports.deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.status(200).json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get guest by email
exports.getGuestByEmail = async (req, res) => {
  try {
    const guest = await Guest.findOne({ email: req.params.email }).select('-password');
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
