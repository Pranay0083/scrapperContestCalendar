import cron from 'node-cron';
import { scrape } from './controllers/contestControllers.js';

// Schedule a cron job to run the scrape function every day at midnight
cron.schedule('*/7 * * * *', async () => {
    try {
        console.log('service is running');
    } catch (error) {
        console.error('service slept');
    }
});