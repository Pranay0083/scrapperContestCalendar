import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

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
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
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
                id: uuidv4(),
                event,
                resource: "https://www.codechef.com/contests",
                date: convertToISO(date, time),
                href: `https://www.codechef.com${href}`,
            });
        });
        
        await fs.writeFile('codechef.json', JSON.stringify(contests, null, 2));
        console.log('Contest data of Codechef saved to data.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
