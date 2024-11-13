import express from 'express';
import { set, getAll } from '../controllers/notificationControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/set/:id', authMiddleware("user"), set);
router.get('/getAll', getAll);

export default router;
