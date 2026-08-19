import { Router } from 'express';
import { login, register, me, updateProfile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', verifyToken, me);
router.put('/profile', verifyToken, updateProfile);

export default router;
