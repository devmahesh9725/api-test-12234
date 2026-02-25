// EXTREME HARD BUG #3: Timing Attack on JWT Verification
// Attackers can forge tokens through timing analysis of string comparisons

// Current buggy implementation in middleware/auth.js
const jwt = require('jsonwebtoken');

// BUGGY IMPLEMENTATION - Vulnerable to timing attack
exports.protectWithTimingVulnerability = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // VULNERABILITY: Simple string comparison
    // Attacker can guess tokens byte-by-byte through timing analysis
    // Correct bytes take slightly longer to fail than wrong bytes
    if (token === process.env.ADMIN_TOKEN) { // Direct comparison
      req.user = { id: 'admin', role: 'admin' };
    } else {
      req.user = decoded;
    }
    
    // Another timing issue: No rate limiting on failed attempts
    // Attacker can brute-force tokens
    next();
  } catch (error) {
    // Time difference between error types leaks information
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired for:', token); // Logs token!
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    // Different error messages leak timing information
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};

// FIX: Use constant-time comparison and rate limiting
const crypto = require('crypto');

exports.protectSecure = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }

  try {
    // Always verify JWT properly
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Use constant-time comparison if needed
    if (process.env.ADMIN_TOKEN) {
      const userToken = crypto.timingSafeEqual(
        Buffer.from(token),
        Buffer.from(process.env.ADMIN_TOKEN)
      );
      if (userToken) {
        req.user = { id: 'admin', role: 'admin' };
      }
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    // Same generic error response always
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized to access this route' 
    });
  }
};
