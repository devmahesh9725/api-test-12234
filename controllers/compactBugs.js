// 7 COMPACT BUGS - ~60 lines total

// BUG #1: Null Pointer Dereference
exports.nullPointerBug = async (req, res) => {
  const guestId = req.params.id;
  const guest = await Guest.findById(guestId);
  // Missing null check
  guest.email = req.body.email; // Crashes if guest is null
  await guest.save();
  res.json(guest);
};

// BUG #2: Type Confusion leading to logic error
exports.typeConfusionBug = (req, res) => {
  const roomCount = req.query.count; // String from query param
  if (roomCount > 5) { // "100" > 5 is true, but "2" > 5 is false (string comparison)
    res.json({ message: 'Too many rooms requested' });
  }
  // Will fail: "2" is treated as string, comparison fails
};

// BUG #3: Infinite Loop in pagination
exports.infiniteLoopBug = async (req, res) => {
  const page = req.query.page || 1;
  let offset = (page - 1) * 10;
  const bookings = [];
  
  while (offset < 100) {
    bookings.push(...(await Booking.find().skip(offset).limit(10)));
    offset += 10;
    if (offset === 100) break; // BUG: Never reaches here if offset > 100
    // Infinite loop! This is classic off-by-one with wrong exit condition
  }
  res.json(bookings);
};

// BUG #4: Unhandled Promise Rejection
exports.unhandledRejectionBug = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  // Missing .catch() - if booking delete fails, request hangs
  Booking.findByIdAndDelete(req.params.id); // Fire and forget, no await
  res.json({ success: true });
  // If delete throws error, it crashes the process unhandled
};

// BUG #5: Array Index Out of Bounds mixed with logic
exports.arrayBoundsBug = async (req, res) => {
  const bookings = await Booking.find({ guestId: req.params.guestId });
  const lastBooking = bookings[bookings.length]; // Off-by-one: should be length-1
  // lastBooking is undefined, next line crashes
  res.json({ lastCheckOut: lastBooking.checkOutDate });
};

// BUG #6: Missing return in async function
exports.missingReturnBug = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      res.status(404).json({ message: 'Not found' });
      // BUG: Missing return - continues executing below!
    }
    guest.email = req.body.email;
    await guest.save(); // Tries to save null/undefined object
    res.json(guest);
  } catch (e) {
    res.status(500).json(e);
  }
};

// BUG #7: Mutation of shared object state
const bookingCache = {};
exports.sharedStateMutationBug = async (req, res) => {
  const hotel = await Hotel.findById(req.params.hotelId);
  bookingCache[hotel._id] = hotel; // Bug: mutates shared cache
  hotel.rooms += 100; // Accidentally modifies cached object
  // Next request sees modified values from previous request
  res.json(hotel);
};
