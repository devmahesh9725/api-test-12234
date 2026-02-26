const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Guest = require('../models/Guest');

// Generate booking number
const generateBookingNumber = () => {
  return 'BK' + Date.now() + Math.floor(Math.random() * 1000);
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { guestId, hotelId, roomId, checkInDate, checkOutDate, numberOfGuests, paymentMethod, specialRequests } = req.body;

    if (!guestId || !hotelId || !roomId || !checkInDate || !checkOutDate || !numberOfGuests || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' 
      });
    }

    // Check if guest exists
    const guest = await Guest.findById(guestId);
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Calculate number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const numberOfNights = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (numberOfNights < 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Check-out date must be after check-in date' 
      });
    }

    const totalPrice = room.pricePerNight * numberOfNights;

    const booking = new Booking({
      bookingNumber: generateBookingNumber(),
      guestId,
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfNights,
      numberOfGuests,
      pricePerNight: room.pricePerNight,
      totalPrice,
      specialRequests,
      paymentMethod
    });

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('guestId', 'firstName lastName email phone')
      .populate('roomId', 'roomNumber roomType');

    // Update guest booking count
    guest.totalBookings += 1;
    await guest.save();

    // Update room status
    room.status = 'occupied';
    await room.save();

    res.status(201).json({ success: true, data: populatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guestId', 'firstName lastName email')
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber roomType');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guestId')
      .populate('hotelId')
      .populate('roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings by guest ID
exports.getBookingsByGuest = async (req, res) => {
  try {
    const bookings = await Booking.find({ guestId: req.params.guestId })
      .populate('hotelId', 'name')
      .populate('roomId', 'roomNumber');
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('guestId').populate('roomId');

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('guestId').populate('roomId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // If checked-out, update room status back to available
    if (status === 'checked-out') {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!['pending', 'partial', 'completed', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    await Booking.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );

    const booking = await Booking.findById(req.params.id);

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Booking is already cancelled' 
      });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Update room status back to available
    await Room.findByIdAndUpdate(booking.roomId, { status: 'available' });

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
