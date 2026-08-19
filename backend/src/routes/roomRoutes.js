import { Router } from 'express';
import { getAllRooms, getAvailableRooms, addRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Public routes for customer booking website
router.get('/available', getAvailableRooms);

// Routes for ERP & internal management
router.get('/', getAllRooms);
router.post('/', verifyToken, requireRole('admin', 'manager'), addRoom);
router.post('/rooms', verifyToken, requireRole('admin', 'manager'), addRoom);
router.put('/:id', verifyToken, requireRole('admin', 'manager'), updateRoom);
router.delete('/:id', verifyToken, requireRole('admin', 'manager'), deleteRoom);

export default router;
