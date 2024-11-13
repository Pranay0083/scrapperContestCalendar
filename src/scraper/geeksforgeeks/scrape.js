import { Builder, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'
const options = new chrome.Options();
options.addArguments('--headless=new'); // Run Chrome in headless mode
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');
import { JSDOM } from 'jsdom';
import Contest from '../../models/Contest.js';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToISO(dateStr, timeStr) {
    const date = new Date(dateStr);
    const timeParts = timeStr.match(/(\d+):(\d+)\s(AM|PM)\s(\w+)/);
    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const period = timeParts[3];
    const timezone = timeParts[4];
    if (period === 'PM' && hours < 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    return utcDate.toISOString();
}

async function scrapePage() {
     

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments('--headless=new')).build();
    try {
        await driver.get('https://www.geeksforgeeks.org/events');
        await sleep(5000);
        const pageSource = await driver.getPageSource();
        const dom = new JSDOM(pageSource);
        const document = dom.window.document;
        const contestCards = document.querySelectorAll('div.ui.stackable.three.column.grid div[id^="eventsLanding_eachEventContainer"]');
        const contests = [];
        contestCards.forEach(card => {
            const titleElement = card.querySelector('.eventsLanding_eventCardTitle__byiHw');
            const dateElement = card.querySelector('.eventsLanding_eventDateContainer__Z1zke p');
            const timeElement = card.querySelector('.eventsLanding_eventDateContainer__Z1zke p + p');
            const linkElement = card.querySelector('a');
            const date = dateElement?.textContent.trim();
            const time = timeElement?.textContent.trim();
            const contest = {
                event: titleElement?.textContent.trim() || 'No title available',
                resource: "https://www.geeksforgeeks.org/events",
                date: convertToISO(date, time),
                href: linkElement?.getAttribute('href') || 'No link available'
            };
            const eventDate = new Date(contest.date);
            if (eventDate > new Date()) {
                contests.push(contest);
            }
        });

        // Save each contest to MongoDB
        console.log(contests.length)
        await Contest.insertMany(contests);
        console.log('Contest data of GeeksforGeeks saved to MongoDB');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
          
    }
}

export default scrapePage;
