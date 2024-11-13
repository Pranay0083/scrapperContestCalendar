// index.js
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import bot from './Bot/Bot.js';
import './cronJobs.js';

dotenv.config();

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/contests', contestRoutes);

app.get('/getAllContests', async (req, res) => {
  try {
    const contests = {
      objects: await Contest.find(),
    };
    res.status(200).json(contests);
  } catch (err) {
    res.status(500).send(`Error fetching contests: ${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});