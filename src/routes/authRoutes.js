import express from 'express';
import { signup, signin, changePassword } from '../controllers/authControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.put('/changepassword', authMiddleware("user"), changePassword)

export default router;
