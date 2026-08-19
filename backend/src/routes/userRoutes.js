import { Router } from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, requireRole('admin', 'manager'), getAllUsers);
router.post('/', verifyToken, requireRole('admin'), createUser);
router.put('/:id', verifyToken, requireRole('admin'), updateUser);
router.delete('/:id', verifyToken, requireRole('admin'), deleteUser);

export default router;
