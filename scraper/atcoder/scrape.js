import { load } from 'cheerio';
import chrome from 'selenium-webdriver/chrome.js'
const options = new chrome.Options();
options.addArguments('--headless=new'); // Run Chrome in headless mode
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');
import { Builder, Browser } from 'selenium-webdriver';
import mongoose from 'mongoose';
import Contest from '../../models/Contest.js';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToISO(dateTimeStr) {
    const dateTimeRegex = /(\d{4}-\d{2}-\d{2})\(\w+\)\s(\d{2}:\d{2})/;
    const matches = dateTimeStr.match(dateTimeRegex);
    if (matches) {
        const datePart = matches[1];
        const timePart = matches[2];
        const date = new Date(`${datePart}T${timePart}:00`);
        const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
        return utcDate.toISOString();
    } else {
        throw new Error("Invalid input format");
    }
}

async function scrapePage() {
    const dbURI = process.env.MONGODB_URI;
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments('--headless=new')).build();
    try {
        await driver.get('https://atcoder.jp/contests/');
        await sleep(5000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contests = [];
        $('#contest-table-upcoming tbody tr').each((i, elem) => {
            const startTime = $(elem).find('td:nth-child(1) time').text();
            const contest = {
                event: $(elem).find('td:nth-child(2) a').text().trim(),
                resource: "https://atcoder.jp/",
                date: convertToISO(startTime),
                href: "https://atcoder.jp" + $(elem).find('td:nth-child(2) a').attr('href'),
            };
            contests.push(contest);
        });

        // Save each contest to MongoDB
        console.log(contests.length)
        await Contest.insertMany(contests);
        console.log('Contest data of Atcoder saved to MongoDB');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
        mongoose.connection.close();
    }
}

export default scrapePage;
