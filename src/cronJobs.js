// import cron from 'node-cron';
// import { scrape } from './controllers/contestControllers.js';

// // Schedule a cron job to run the scrape function every day at midnight
// cron.schedule('0 0 * * *', async () => {
//     console.log('Running the scrape job at midnight');
//     try {
//         await scrape();
//         console.log('Scrape job completed successfully');
//     } catch (error) {
//         console.error('Error running scrape job:', error);
//     }
// });