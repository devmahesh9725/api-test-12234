// EXTREME HARD BUG #5: Async Flow Data Corruption - Guest Loyalty Points Lost
// Complex async logic causes guest loyalty points to be lost due to stale data reads

const Guest = require('../models/Guest');
const Booking = require('../models/Booking');

// BUGGY: Stale data read causing loyalty points loss
exports.updateGuestPointsWithDataCorruption = async (req, res) => {
  try {
    const { guestId, bookingId } = req.body;
    
    // Step 1: Read guest data
    const guest = await Guest.findById(guestId); 
    const currentPoints = guest.loyaltyPoints; // Read: 1000 points
    
    // Step 2: Read booking data
    const booking = await Booking.findById(bookingId);
    let pointsToAdd = Math.floor(booking.totalPrice / 10); // $300 booking = 30 points
    
    // CRITICAL GAP - Async operation that takes time
    // While this promise is pending, another request might modify the guest
    const newVerification = await performSlowPointVerification(guestId); 
    
    // At this point:
    // - Request 1 read: guest.loyaltyPoints = 1000
    // - Request 2 read: guest.loyaltyPoints = 1000 (both read the same value)
    // - Request 2 added 50 points, now DB has: 1050
    // - Request 1 continues and now calculates: 1000 + 30 = 1030
    // - Result: Lost 20 points! (1050 is overwritten with 1030)
    
    // Step 3: Update with potentially stale data
    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      { 
        loyaltyPoints: currentPoints + pointsToAdd, // Using stale currentPoints!
        lastBookingDate: new Date()
      },
      { new: true }
    );
    
    // The concurrent request's update is lost!
    res.status(200).json({ 
      success: true, 
      data: updatedGuest,
      message: 'Loyalty points updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simulate a slow verification process
async function performSlowPointVerification(guestId) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ verified: true }), 2000); // 2 second delay
  });
}

// ANOTHER VARIANT: Using Promise.all with stale data
exports.anotherDataCorruptionPattern = async (req, res) => {
  try {
    const { guestId } = req.body;
    
    const guest = await Guest.findById(guestId);
    const bookings = await Booking.find({ guestId });
    
    // Calculate total spent - this uses potentially stale data from multiple sources
    const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Process multiple updates in parallel - can cause race conditions
    const updates = bookings.map(booking => {
      // Each update reads the current guest state async
      // But they're all executing concurrently with stale reads
      return Booking.findByIdAndUpdate(booking._id, {
        pointsAwarded: Math.floor(booking.totalPrice / 10),
        processedAt: new Date()
      });
    });
    
    // BUG: All these promises execute, but if guest is updated concurrently,
    // the guest.loyaltyPoints will be in an inconsistent state
    await Promise.all(updates);
    
    // Update guest with calculated total - but data is stale!
    guest.totalSpent = totalSpent;
    guest.loyaltyPoints = guest.loyaltyPoints + Math.floor(totalSpent / 10);
    
    // Another concurrent request might have already updated loyaltyPoints
    // This save() will OVERWRITE it with stale data
    await guest.save();
    
    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FIX: Use MongoDB transactions and atomic operations
exports.updateGuestPointsSafely = async (req, res) => {
  const session = await Guest.startSession();
  session.startTransaction();
  
  try {
    const { guestId, bookingId } = req.body;
    
    // Atomic read and update - no gap for concurrent modifications
    const booking = await Booking.findById(bookingId);
    const pointsToAdd = Math.floor(booking.totalPrice / 10);
    
    // This is atomic - locks the document and updates based on current value
    const updatedGuest = await Guest.findByIdAndUpdate(
      guestId,
      { 
        $inc: { loyaltyPoints: pointsToAdd }, // Atomic increment
        lastBookingDate: new Date()
      },
      { new: true, session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    res.status(200).json({ success: true, data: updatedGuest });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
