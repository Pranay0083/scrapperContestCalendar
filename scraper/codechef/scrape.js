import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'
const options = new chrome.Options();
options.addArguments('--headless=new'); // Run Chrome in headless mode
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Contest from '../../models/Contest.js'; // Ensure the path is correct

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToISO(dateStr, timeStr) {
    const dateParts = dateStr.split(' ');
    const day = parseInt(dateParts[0], 10);
    const month = new Date(Date.parse(dateParts[1] +" 1, 2024")).getMonth();
    const year = parseInt(dateParts[2], 10);
    const timeParts = timeStr.split(' ')[1].split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const date = new Date(year, month, day, hours, minutes);
    const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
    return utcDate.toISOString();
}

async function scrapePage() {
    const dbURI = process.env.MONGODB_URI; // Ensure your MongoDB URI is in your .env file
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments('--headless=new')).build();
    try {
        await driver.get('https://www.codechef.com/contests');
        await sleep(10000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const targetDiv = $('div._table__container_7s2sw_344._dark_7s2sw_247').first();
        const contests = [];

        targetDiv.find('tbody tr').each((i, row) => {
            const id = $(row).find('td[data-colindex="0"] p').text().trim();
            const event = $(row).find('td[data-colindex="1"] a span').text().trim();
            const href = $(row).find('td[data-colindex="1"] a').attr('href');
            const date = $(row).find('td[data-colindex="2"] p:first-of-type').text().trim();
            const time = $(row).find('td[data-colindex="2"] p._grey__text_7s2sw_462').text().trim();
            const duration = $(row).find('td[data-colindex="3"] p').text().trim();
            contests.push({
                event,
                resource: "https://www.codechef.com/contests",
                date: convertToISO(date, time),
                href: `https://www.codechef.com${href}`,
            });
        });

        // Save each contest to MongoDB
        console.log(contests.length)
        await Contest.insertMany(contests);
        console.log('Contest data of Codechef saved to MongoDB');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
        mongoose.connection.close();
    }
}

export default scrapePage;
