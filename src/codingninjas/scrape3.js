import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function convertDateTimeToISO(dateString, timeString) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const [month, day, year] = dateString.split(' ');
    const monthIndex = monthNames.indexOf(month);
    const parsedDate = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
    if (timeString.includes("Starts in")) {
        const [, amount, unit] = timeString.match(/Starts in (\d+) (hours?|days?)/);
        const amountNum = parseInt(amount);
        
        if (unit.startsWith("day")) {
            parsedDate.setUTCDate(parsedDate.getUTCDate() + amountNum);
        } else if (unit.startsWith("hour")) {
            const now = new Date();
            parsedDate.setUTCHours(now.getUTCHours() + amountNum);
            parsedDate.setUTCMinutes(now.getUTCMinutes());
            parsedDate.setUTCSeconds(now.getUTCSeconds());
        }
    } else {
        console.warn("Unhandled time format:", timeString);
    }
    
    const pad = (num) => num.toString().padStart(2, '0');
    const formattedDate = `${parsedDate.getUTCFullYear()}-${pad(parsedDate.getUTCMonth() + 1)}-${pad(parsedDate.getUTCDate())}`;
    const formattedTime = `${pad(parsedDate.getUTCHours())}:${pad(parsedDate.getUTCMinutes())}:${pad(parsedDate.getUTCSeconds())}`;
    return `${formattedDate}T${formattedTime}.000Z`;
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://www.naukri.com/code360/events?selected_tab=Coding%20events');
        await sleep(10000); // Wait for the page to load
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contestData = [];

        $('.event-list-card-container').each((index, element) => {
            const time = $(element).find('.contest-status-container').text().trim();
            const date = $(element).find('.event-date .value').text().trim();
            contestData.push({
                id: uuidv4(),
                event: $(element).find('.title-container').text().trim(),
                resource: 'https://www.naukri.com/code360/events?selected_tab=Coding%20events',
                date: convertDateTimeToISO(date, time),
                href: 'https://www.naukri.com/code360/events?selected_tab=Coding%20events',
            });
        });

        let existingData = [];
        try {
            const fileData = await fs.readFile('codingninjas.json', 'utf-8');
            existingData = JSON.parse(fileData); // Parse the existing data
        } catch (error) {
            console.warn('No existing data found, starting with an empty array.');
        }

        // Combine the existing data with the new contest data
        const updatedData = [...existingData, ...contestData];

        // Save the updated data back to 'data.json'
        await fs.writeFile('codingninjas.json', JSON.stringify(updatedData, null, 2));
        console.log('Events data of Coding Ninjas saved to data.json');
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
