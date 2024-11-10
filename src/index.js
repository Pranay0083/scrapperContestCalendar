import express from 'express';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import scraper from '../scraper/scraper.js';
import Contest from '../models/Contest.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.get('/getAllContests', async (req, res) => {
  try {
    const contests = await Contest.find();
    res.json(contests);
  } catch (err) {
    res.status(500).send(`Error fetching contests: ${err.message}`);
  }
})

app.get('/scrapeContests', async (req, res) => {
  try {
    await scraper();
    res.send('Scraping completed and data saved.');
  } catch (error) {
    res.status(500).send(`Error during scraping: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
