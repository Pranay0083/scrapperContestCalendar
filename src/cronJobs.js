import cron from 'node-cron';

cron.schedule('*/7 * * * *', async () => {
    try {
        console.log('service is running');
    } catch (error) {
        console.error('service slept');
    }
});