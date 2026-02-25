const Hotel = require('../models/Hotel');

// Create a new hotel
exports.createHotel = async (req, res) => {
  try {
    const { name, email, phone, address, totalRooms, description, starRating, amenities } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and phone are required' 
      });
    }

    let hotel = await Hotel.findOne({ email });
    if (hotel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hotel with this email already exists' 
      });
    }

    const hotelData = { ...req.body, name, email, phone };
    const allowedFields = ['name', 'email', 'phone', 'address', 'totalRooms', 'description', 'starRating', 'amenities'];
    
    Object.keys(hotelData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete hotelData[key];
      }
    });

    hotel = new Hotel(hotelData);

    await hotel.save();
    res.status(201).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all hotels
exports.getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single hotel by ID
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update hotel
exports.updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(200).json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search hotels
exports.searchHotels = async (req, res) => {
  try {
    const { name, city, starRating } = req.query;
    let query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (starRating) query.starRating = starRating;

    const hotels = await Hotel.find(query);
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
