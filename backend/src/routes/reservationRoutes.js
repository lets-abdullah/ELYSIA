import { Router } from 'express';
import {
  createReservation,
  getAllReservations,
  getMyReservations,
  updateReservationStatus,
  deleteReservation
} from '../controllers/reservationController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Public route: Web Customer Reservation creation
router.post('/', createReservation);

// Customer route: Get logged-in user's reservations
router.get('/my-reservations', verifyToken, getMyReservations);

// Protected routes for ERP management
router.get('/', verifyToken, requireRole('admin', 'manager', 'receptionist'), getAllReservations);
router.put('/:id/status', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateReservationStatus);
router.put('/:id', verifyToken, requireRole('admin', 'manager', 'receptionist'), updateReservationStatus);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), deleteReservation);

export default router;
