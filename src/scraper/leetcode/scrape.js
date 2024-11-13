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
     

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments('--headless=new')).build();
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
                        event: contestName,
                        resource: "https://leetcode.com/",
                        date: convertToISO(contestStartInfo),
                        href: "https://leetcode.com" + href,
                    });
                }
            });

            // Save each contest to MongoDB
            console.log(contests.length)
            await Contest.insertMany(contests);
            console.log('Contest data of Leetcode saved to MongoDB');
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
