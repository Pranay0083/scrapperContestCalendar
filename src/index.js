import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import scraper from './scraper/scraper.js';
import Contest from './models/Contest.js';
import morgan from 'morgan';
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import contestRoutes from './routes/contestRoutes.js'

dotenv.config();

const app = express();
app.use(morgan('dev'))
app.use(cors())
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

connectDB();


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/contests', contestRoutes)

app.get('/getAllContests', async (req, res) => {
  try {
    const contests = {
      objects: await Contest.find(),
  }
  res.status(200).json(contests);
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
