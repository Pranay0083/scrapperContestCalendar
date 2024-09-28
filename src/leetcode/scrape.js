import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToISO(input) {
    const now = new Date();
    const regex = /(?:(\d+)d\s)?(\d+)h\s(\d+)m\s(\d+)s/;
    const matches = input.match(regex);

    if (matches) {
        const days = parseInt(matches[1] || 0, 10);
        const hours = parseInt(matches[2], 10);
        const minutes = parseInt(matches[3], 10);
        const seconds = parseInt(matches[4], 10);

        now.setDate(now.getDate() + days);
        now.setHours(now.getHours() + hours);
        now.setMinutes(now.getMinutes() + minutes);
        now.setSeconds(now.getSeconds() + seconds);

        return now.toISOString();
    } else {
        return false;
    }
}


async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://leetcode.com/contest/');
        await sleep(5000);
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
                if (contestName && contestStartInfo && convertToISO(contestStartInfo)) {
                    contests.push({
                        id: uuidv4(),
                        event: contestName,
                        resource: "https://leetcode.com/",
                        date: convertToISO(contestStartInfo),
                        href: "https://leetcode.com" + href,
                    });
                }
            });
            await fs.writeFile('leetcode.json', JSON.stringify(contests, null, 2));
            console.log('Contest data of Leetcode saved to data.json');
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