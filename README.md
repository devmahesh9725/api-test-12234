# Hotel Management System Backend API

A comprehensive Node.js/Express backend API for managing hotel operations including rooms, bookings, guests, and staff.

## Features

- **Hotel Management**: Create, update, and manage hotel properties
- **Room Management**: Manage rooms with different types and pricing
- **Guest Management**: Register and manage guest profiles
- **Booking System**: Create and manage reservations with automatic status tracking
- **Staff Management**: Manage hotel staff by department and role
- **Authentication**: JWT-based authentication for guests and staff
- **Payment Tracking**: Track booking payment status

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hotel_management
   JWT_SECRET=your_super_secret_jwt_key_change_this
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev  # Development mode with nodemon
   npm start    # Production mode
   ```

## API Endpoints

### Hotels
- `POST /api/hotels` - Create a new hotel
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/hotel/:hotelId` - Get rooms by hotel
- `GET /api/rooms/search/available` - Search available rooms
- `GET /api/rooms/:id` - Get room by ID
- `PUT /api/rooms/:id` - Update room
- `PATCH /api/rooms/:id/status` - Update room status
- `DELETE /api/rooms/:id` - Delete room

### Guests
- `POST /api/guests/register` - Register new guest
- `POST /api/guests/login` - Login guest
- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get guest by ID
- `GET /api/guests/email/:email` - Get guest by email
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `GET /api/bookings/guest/:guestId` - Get bookings by guest
- `PUT /api/bookings/:id` - Update booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/payment-status` - Update payment status
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `DELETE /api/bookings/:id` - Delete booking

### Staff
- `POST /api/staff/register` - Register new staff
- `POST /api/staff/login` - Login staff
- `GET /api/staff` - Get all staff
- `GET /api/staff/hotel/:hotelId` - Get staff by hotel
- `GET /api/staff/hotel/:hotelId/department/:department` - Get staff by department
- `GET /api/staff/:id` - Get staff by ID
- `PUT /api/staff/:id` - Update staff
- `PATCH /api/staff/:id/status` - Update staff status
- `DELETE /api/staff/:id` - Delete staff

## Database Models

### Hotel
- name, email, phone, address, totalRooms, description, starRating, amenities, image, status

### Room
- hotelId, roomNumber, roomType, capacity, pricePerNight, description, amenities, images, status, floor

### Guest
- firstName, lastName, email, password, phone, dateOfBirth, gender, address, idType, idNumber, loyaltyPoints, status

### Booking
- bookingNumber, guestId, hotelId, roomId, checkInDate, checkOutDate, numberOfNights, numberOfGuests, pricePerNight, totalPrice, specialRequests, status, paymentStatus, paymentMethod, notes

### Staff
- firstName, lastName, email, password, phone, hotelId, department, position, salary, joinDate, status, role

## Room Types
- single
- double
- suite
- deluxe
- studio

## Booking Status
- pending
- confirmed
- checked-in
- checked-out
- cancelled

## Payment Methods
- credit_card
- debit_card
- net_banking
- upi
- cash

## Staff Departments
- reception
- housekeeping
- maintenance
- kitchen
- management
- security

## Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Future Enhancements

- Email notifications
- SMS alerts for bookings
- Payment gateway integration
- Advanced reporting and analytics
- Room inventory management
- Guest reviews and ratings
- Loyalty program management
