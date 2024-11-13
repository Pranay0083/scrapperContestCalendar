import Contest from '../models/Contest.js';
import scraper from '../scraper/scraper.js';

// Get all contests
export const getall = async (req, res) => {
  try {
    const contests = await Contest.find();
    res.status(200).json({ objects: contests });
  } catch (err) {
    res.status(500).send(`Error fetching contests: ${err.message}`);
  }
};

// Scrape contests
export const scrape = async (req, res) => {
  try {
    await scraper();
    res.send('Scraping completed and data saved.');
  } catch (error) {
    res.status(500).send(`Error during scraping: ${error.message}`);
  }
};
