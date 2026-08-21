import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createReservation,
  getAllReservations,
  getMyReservations,
  updateReservationStatus,
  deleteReservation,
  cleanupFakeBookings
} from '../controllers/reservationController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Anti-spam / Bot rate limiter for public booking creation
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // max 15 booking submissions per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many booking attempts from this network. Please try again after 15 minutes.'
  }
});

// Public route: Web Customer Reservation creation (with rate limiting)
router.post('/', bookingLimiter, createReservation);

// Customer route: Get logged-in user's reservations
router.get('/my-reservations', verifyToken, getMyReservations);

// Protected routes for ERP management
router.get('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), getAllReservations);
router.post('/cleanup-fake-bookings', verifyToken, requireRole('admin', 'manager'), cleanupFakeBookings);
router.put('/:id/status', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateReservationStatus);
router.put('/:id', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateReservationStatus);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), deleteReservation);

export default router;
