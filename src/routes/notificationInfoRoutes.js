import express from 'express';
import { setTelegramUsername } from '../controllers/notificationInfoControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/teleusername', authMiddleware, setTelegramUsername);

export default router;
