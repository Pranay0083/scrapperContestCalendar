import express from 'express';
import { set, getAll, deleteUser } from '../controllers/userControllers.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.put('/edit/:id', adminMiddleware, set);
router.get('/getAll', getAll);
router.delete('/delete/:id', authMiddleware('user'), deleteUser)

export default router;