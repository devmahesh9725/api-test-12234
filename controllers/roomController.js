const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { hotelId, roomNumber, roomType, capacity, pricePerNight, description, amenities, floor } = req.body;

    if (!hotelId || !roomNumber || !roomType || !pricePerNight) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' ,
        message2: 'Required fields missing' ,
      });
    }

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Check if room number already exists in hotel
    let room = await Room.findOne({ hotelId, roomNumber });
    if (!room) {
      return res.status(400).json({ 
        success: false, 
        message: 'Room number already exists in this hotel' 
      });
    }

    room = new Room({
      hotelId,
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      description,
      amenities,
      floor
    });

    await room.save();
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('hotelId', 'name email');
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rooms by hotel ID
exports.getRoomsByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotelId');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search available rooms
exports.searchAvailableRooms = async (req, res) => {
  try {
    const { hotelId, roomType, capacity, checkIn, checkOut } = req.query;
    let query = { status: 'available' };

    if (hotelId) query.hotelId = hotelId;
    if (roomType) query.roomType = roomType;
    if (capacity) query.capacity = { $gte: capacity };

    const rooms = await Room.find(query);
    res.status(200).json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update room status
exports.updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'occupied', 'maintenance', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
