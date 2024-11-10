import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
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
    const dbURI = process.env.MONGODB_URI; // Ensure your MongoDB URI is in your .env file
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

    let driver = await new Builder().forBrowser(Browser.CHROME).build();
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
