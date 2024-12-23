import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js'
const options = new chrome.Options();
options.addArguments('--headless=new'); // Run Chrome in headless mode
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');
import Contest from '../../models/Contest.js';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseDateString(dateString) {
    const pad = (num) => num.toString().padStart(2, '0');
    let date;
    const dateTimeRegex = /^(\d{2}) (\w{3}) (\d{4}) @(\d{2}):(\d{2}) (AM|PM) IST$/;
    const matchDateTime = dateString.match(dateTimeRegex);
    if (matchDateTime) {
        const [_, day, month, year, hour, minute, period] = matchDateTime;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(month);
        let hour24 = parseInt(hour, 10);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        if (period === "AM" && hour24 === 12) hour24 = 0;
        date = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day), hour24, parseInt(minute), 0));
    }
    else if (dateString.startsWith("Starts in")) {
        const relativeDays = parseInt(dateString.match(/Starts in (\d+) days/)[1], 10);
        date = new Date(); // Current date
        date.setUTCDate(date.getUTCDate() + relativeDays);
    }
    else if (/^\d{2}-\w{3}, \d{4}$/.test(dateString)) {
        const [dayMonth, year] = dateString.split(', ');
        const [day, month] = dayMonth.split('-');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(month);
        if (monthIndex === -1) {
            console.error(`Invalid month: ${month}`);
            return null;
        }
        date = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day)));
    } else {
        return null;
    }

    if (isNaN(date.getTime())) {
        console.error(`Invalid date constructed: ${date}`);
        return null;
    }

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    const some = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
    const some2 = new Date(dateString);
    const now = new Date();
    // return some2 < now ? "Live Now" : some;
    return some
}

async function scrapePage() {
     

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options.addArguments('--headless=new')).build();
    try {
        await driver.get('https://www.naukri.com/code360/challenges');
        await sleep(10000); // Wait for the page to load

        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);

        const challenges = $(".challenge-header").toArray().map((header) => {
            const name = $(header).find('.zen-typo-nav').text().trim();
            const startTime = $(header).next('.challenge-body').find('.challenge-timeline-start .zen-typo-caption-bold').text().trim();
            const endTime = $(header).next('.challenge-body').find('.challenge-timeline-end .zen-typo-caption-bold').text().trim();

            if (name && startTime && endTime) {
                return {
                    event: name,
                    resource: 'https://www.naukri.com/code360/challenges',
                    date: parseDateString(startTime),
                    href: 'https://www.naukri.com/code360/challenges',
                };
            }
        });

        var filteredChallenges = challenges.filter(Boolean); // Remove undefined values

        // Save each challenge to MongoDB
        console.log(filteredChallenges.length)
        await Contest.insertMany(filteredChallenges);
        console.log('Challenges data of Naukri saved to MongoDB');
    } catch (error) {
        console.log(filteredChallenges)
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
          
    }
}

export default scrapePage;
