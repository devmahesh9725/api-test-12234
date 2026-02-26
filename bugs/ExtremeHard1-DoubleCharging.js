// EXTREME HARD BUG FILE #1: Race Condition Leading to Double Charging
// This bug causes customers to be charged multiple times for the same booking

// Location: bookingController.js - createBooking function
// The critical section:
exports.createBookingWithDoubleBillingBug = async (req, res) => {
  try {
    const { guestId, hotelId, roomId, checkInDate, checkOutDate, numberOfGuests, paymentMethod } = req.body;
    
    // Step 1: Read room status
    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Room not available' });
    }
    
    // CRITICAL RACE CONDITION GAP (approx 100-200ms in real scenarios)
    // Two concurrent requests both see the room as available
    
    // Step 2: Calculate price and create booking
    const numberOfNights = 3;
    const totalPrice = room.pricePerNight * numberOfNights; // $300
    
    // Step 3: Process payment (async, ~2-5 seconds)
    // Both concurrent requests process payment independently
    let paymentResult = await processPayment(guestId, totalPrice); // This could execute twice
    
    // Step 4: Only NOW do we check if room was already booked (too late!)
    const existingBooking = await Booking.findOne({ roomId, checkInDate });
    if (existingBooking) {
      // Room already booked, but customer was ALREADY CHARGED
      // Money is gone, but we reject the booking
      return res.status(400).json({ 
        success: false, 
        message: 'Room no longer available',
        chargeAlreadyProcessed: true // The real issue
      });
    }
    
    const booking = new Booking({
      guestId, hotelId, roomId, checkInDate, checkOutDate,
      numberOfNights, numberOfGuests, totalPrice, paymentMethod,
      paymentStatus: 'completed'
    });
    
    await booking.save();
    room.status = 'occupied';
    await room.save();
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function processPayment(guestId, amount) {
  // Simulates payment gateway call - takes time
  return new Promise(resolve => {
    setTimeout(() => resolve({ success: true, amount }), 3000);
  });
}
