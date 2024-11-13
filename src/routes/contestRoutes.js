import express from 'express';
import { getall, scrape } from '../controllers/contestControllers.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/getall', getall);
router.post('/scrape', admin, scrape);

export default router;
