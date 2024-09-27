import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function getStartDateTime(startInfo) {
    const regex = /(\d+)d (\d+)h (\d+)m (\d+)s/;
    const match = startInfo.match(regex);
    if (match) {
        const days = parseInt(match[1], 10);
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        const seconds = parseInt(match[4], 10);
        const futureDate = new Date();
        futureDate.setSeconds(futureDate.getSeconds() + seconds);
        futureDate.setMinutes(futureDate.getMinutes() + minutes);
        futureDate.setHours(futureDate.getHours() + hours);
        futureDate.setDate(futureDate.getDate() + days);
        
        // Format date
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = futureDate.toLocaleDateString('en-US', options);
        
        // Format time
        let hours12 = futureDate.getHours() % 12 || 12;
        const minutes2Digits = futureDate.getMinutes().toString().padStart(2, '0');
        const ampm = futureDate.getHours() >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours12.toString().padStart(2, '0')}:${minutes2Digits} ${ampm} IST`;
        
        return {
            date: formattedDate,
            time: formattedTime
        };
    }

    return null;
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://leetcode.com/contest/');
        const pageSource = await driver.getPageSource();
        try {
            const dom = new JSDOM(pageSource);
            const document = dom.window.document;
            const contests = [];
            const contestCards = document.querySelectorAll('div.swiper-slide');
            contestCards.forEach((card) => {
                const href = card.querySelector('a')?.getAttribute('href');
                const contestName = card.querySelector('div.truncate span')?.textContent.trim();
                const contestStartInfo = card.querySelector('div.flex.items-center')?.textContent.trim();
                const startDateTime = getStartDateTime(contestStartInfo);
                if (contestName && startDateTime) {
                    contests.push({
                        id: uuidv4(),
                        event: contestName,
                        resource: "https://leetcode.com/",
                        date: startDateTime.date,
                        time: startDateTime.time,
                        href: "https://leetcode.com" + href,
                    });
                }
            });
            await fs.writeFile('data.json', JSON.stringify(contests, null, 2));
            console.log('Contest data saved to data.json');
        } catch (error) {
            console.error('Error:', error);
        }
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;