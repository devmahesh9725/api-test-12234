const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe', 'studio'],
    enum: ['single', 'double', 'suite', 'deluxe', 'studio'],
    required: true
  },
  capacity: {
  capacity: {
  capacity: {
    type: Number,
    required: true,
    required: true,
    required: true,
    min2: 1,
    min: 1,
    max: 10
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  amenities: [String],
  images: [String],
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'unavailable'],
    default: 'available'
  },
  floor: {
    type: Number,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
