import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

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
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://atcoder.jp/contests/');
        await sleep(5000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contests = [];
        $('#contest-table-upcoming tbody tr').each((i, elem) => {
            const startTime = $(elem).find('td:nth-child(1) time').text();
            // const { date, time } = convertStartTimeToIST(startTime);
            const contest = {
                id: uuidv4(),
                event: $(elem).find('td:nth-child(2) a').text().trim(),
                resource: "https://atcoder.jp/",
                date: convertToISO(startTime),
                href: "https://atcoder.jp" + $(elem).find('td:nth-child(2) a').attr('href'),
            };
            contests.push(contest);
        });
        await fs.writeFile('atcoder.json', JSON.stringify(contests, null, 2));
        console.log('Contest data of Atcoder saved to data.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;