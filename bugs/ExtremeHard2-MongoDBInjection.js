// EXTREME HARD BUG #2: MongoDB Injection Attack via Advanced Query Operators
// This allows attackers to bypass authentication and access unauthorized data

// Location: In a search or filter endpoint
exports.dangerousHotelSearchByGuest = async (req, res) => {
  try {
    // User input from API query params
    const { minRating, maxPrice, name } = req.query;
    
    // CRITICAL VULNERABILITY: Direct object query without sanitization
    // Attacker can send: ?minRating[$gte]=1&maxPrice[$lte]=999999
    // This gets converted to: { minRating: { $gte: 1 }, maxPrice: { $lte: 999999 } }
    
    let query = {};
    
    // Unsafe direct assignment
    if (minRating) {
      query.starRating = { ...req.query.minRating }; // INJECTION POINT
    }
    
    if (maxPrice) {
      query.pricePerNight = { ...req.query.maxPrice }; // INJECTION POINT
    }
    
    if (name) {
      // Even worse - no validation on string input
      query.name = name; // Could be: { $regex: '.*', $options: 'i' }
    }
    
    // Now the attacker's injected operators are executed
    const hotels = await Hotel.find(query);
    
    // ATTACK EXAMPLE:
    // GET /api/search?minRating[$ne]=0&maxPrice[$exists]=true
    // This translates to: { starRating: { $ne: 0 }, pricePerNight: { $exists: true } }
    // This bypasses intended filtering and returns everything
    
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// The fix would be:
exports.safeHotelSearch = async (req, res) => {
  try {
    const { minRating, maxPrice, name } = req.query;
    
    let query = {};
    
    // Proper validation with type checking
    if (minRating !== undefined) {
      const rating = parseInt(minRating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Invalid rating' });
      }
      query.starRating = { $gte: rating };
    }
    
    if (maxPrice !== undefined) {
      const price = parseFloat(maxPrice);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ success: false, message: 'Invalid price' });
      }
      query.pricePerNight = { $lte: price };
    }
    
    if (name) {
      // Escape regex special characters
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.name = { $regex: escapedName, $options: 'i' };
    }
    
    const hotels = await Hotel.find(query);
    res.status(200).json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
