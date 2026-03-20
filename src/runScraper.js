import dotenv from 'dotenv';
import connectDB from './config/db.js';
import scrapeAll from './scraper/scraper.js';

dotenv.config();

await connectDB();
await scrapeAll();
process.exit(0);
