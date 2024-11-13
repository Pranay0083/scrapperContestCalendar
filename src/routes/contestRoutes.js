import express from 'express';
import { getall, scrape } from '../controllers/contestControllers.js';

const router = express.Router();

router.get('/getall', getall);
router.post('/scrape', scrape);

export default router;
