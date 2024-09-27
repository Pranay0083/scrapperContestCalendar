import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://www.geeksforgeeks.org/events');
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
            
            const contest = {
                id: uuidv4(),
                event: titleElement?.textContent.trim() || 'No title available',
                resource: "https://www.geeksforgeeks.org/events",
                date: dateElement?.textContent.trim() || 'No date available',
                time: timeElement?.textContent.trim() || 'No time available',
                href: linkElement?.getAttribute('href') || 'No link available'
            };
            const eventDate = new Date(contest.date);
            if (eventDate > new Date()) {
                contests.push(contest);
            }
        });
        await fs.writeFile('data.json', JSON.stringify(contests, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
