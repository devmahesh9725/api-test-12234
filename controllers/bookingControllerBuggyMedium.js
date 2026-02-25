// MEDIUM BUG #1: Race condition - concurrent bookings can oversell rooms
// This bug exists in the updateBookingStatus function - no transaction/lock mechanism
// Two concurrent requests could both think the room is available and create conflicting updates

// Original booking controller already has this issue where:
// 1. Room status is checked
// 2. Booking is created (async operation - gap here!)
// 3. Room status is updated
// Between steps 1 and 3, another request can book the same room

// MEDIUM BUG #2 Example in a separate function:
exports.vulnerableBookingWithoutTransaction = async (req, res) => {
  try {
    const { roomId, guestId } = req.body;
    
    // Check room availability
    const room = await Room.findById(roomId);
    if (room.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Room not available' });
    }
    
    // RACE CONDITION: Between this check and the next line, another request
    // could also pass the check above, causing double-booking
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulates processing delay
    
    // Both concurrent requests will reach here thinking room is available
    const booking = new Booking({ roomId, guestId, status: 'confirmed' });
    await booking.save();
    
    room.status = 'occupied';
    await room.save();
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
