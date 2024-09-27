import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateFutureTime(timeString) {
    if (timeString.includes("days")) {
        return timeString;
    }
    const match = timeString.match(/(\d+)\s*hours/);
    if (match) {
        const hours = parseInt(match[1], 10); // Get the number of hours as an integer
        const now = new Date();
        now.setHours(now.getHours() + hours);
        const formattedTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        return formattedTime + " IST";
    }
    return timeString; // Return the original time string if it doesn't match the expected format
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
                date,
                time: calculateFutureTime(time),
                href: 'https://www.naukri.com/code360/events?selected_tab=Coding%20events',
            });
        });

        let existingData = [];
        try {
            const fileData = await fs.readFile('data.json', 'utf-8');
            existingData = JSON.parse(fileData); // Parse the existing data
        } catch (error) {
            console.warn('No existing data found, starting with an empty array.');
        }

        // Combine the existing data with the new contest data
        const updatedData = [...existingData, ...contestData];

        // Save the updated data back to 'data.json'
        await fs.writeFile('data.json', JSON.stringify(updatedData, null, 2));
        console.log("Contest data saved successfully!");
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
