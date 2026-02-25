// EXTREME HARD BUG #4: Memory Leak Through Event Listener Accumulation
// Every request adds listeners that are never removed, causing memory to grow unbounded

const EventEmitter = require('events');
const Database = new EventEmitter();

// BUGGY: Memory leak in request handler
exports.bookingWithMemoryLeak = async (req, res) => {
  try {
    const { guestId, roomId } = req.body;
    
    // BUG: Every request adds a listener but never removes it
    // This listener accumulates in memory indefinitely
    Database.on('bookingCreated', (booking) => {
      console.log(`Booking created for guest ${booking.guestId}`);
      // This function is NEVER removed, even after response sent
      // If API gets 10,000 requests/day, you'll have 10,000 listeners by end of day
    });
    
    // Another issue: Closure captures entire req/res objects
    const notificationListeners = [];
    req.on('data', (chunk) => {
      // BUG: req object is captured in closure and referenced by event listener
      // Even after res.send(), this listener keeps req in memory
      notificationListeners.push(chunk);
    });
    
    const booking = new Booking({ guestId, roomId });
    await booking.save();
    
    // Event emitted but listeners never cleaned up
    Database.emit('bookingCreated', booking);
    
    res.status(201).json({ success: true, data: booking });
    
    // By here, listeners are STILL attached and accumulating
    // Process memory usage grows by ~1-5MB per request eventually
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// FIX: Properly manage listeners
exports.bookingWithoutMemoryLeak = async (req, res) => {
  try {
    const { guestId, roomId } = req.body;
    
    // Create a scoped listener function that can be removed
    const bookingListener = (booking) => {
      console.log(`Booking created for guest ${booking.guestId}`);
    };
    
    Database.once('bookingCreated', bookingListener); // Use 'once' instead of 'on'
    
    const booking = new Booking({ guestId, roomId });
    await booking.save();
    
    Database.emit('bookingCreated', booking);
    
    // Listener automatically removed after first emission
    Database.removeListener('bookingCreated', bookingListener);
    
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Monitor memory leaks
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    // In the buggy version, this will increase indefinitely
    const listenerCount = Database.listenerCount('bookingCreated');
    console.log(`Booking event listeners: ${listenerCount}`); // Increases every request
    
    // Expected: Should be 0 or 1 (for actual listeners, not per-request listeners)
    // Buggy version: 10000+ after heavy traffic
  }, 60000);
}
