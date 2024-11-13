import { load } from 'cheerio';
import chrome from 'selenium-webdriver/chrome.js';
import { Builder, Browser } from 'selenium-webdriver';
import Contest from '../../models/Contest.js';

const options = new chrome.Options();
options.addArguments('--headless=new'); // Run Chrome in headless mode
options.addArguments('--disable-gpu');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');

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
    } else if (dateString.startsWith("Starts in")) {
        const relativeDays = parseInt(dateString.match(/Starts in (\d+) days/)[1], 10);
        date = new Date();
        date.setUTCDate(date.getUTCDate() + relativeDays);
    } else {
        return null;
    }
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}

async function scrapePage() {

    let driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    try {
        await driver.get('https://www.naukri.com/code360/contests');
        await sleep(10000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contestData = [];
        const ratedContestInfoHtml = $('.rated-contest-info').html();

        if (!ratedContestInfoHtml) {
            console.error("No rated-contest-info found.");
        } else {
            const ratedContestInfo = load(ratedContestInfoHtml);
            const contestCards = ratedContestInfo('.rated-contest-card');
            contestCards.each((index, element) => {
                const title = ratedContestInfo(element).find('.contest-title').text().trim();
                const startTime = ratedContestInfo(element).find('.contest-timing').text().trim();
                contestData.push({
                    event: title,
                    resource: "https://www.naukri.com/code360/contests",
                    date: parseDateString(startTime),
                    href: "https://www.naukri.com/code360/contests",
                });
            });
        }

        const liveAndUpcomingContests = $('.card-body.ng-star-inserted');
        liveAndUpcomingContests.each((index, element) => {
            const contestCard = $(element);
            const event = contestCard.find('.contest-info .heading').text().trim();
            const resource = "https://www.naukri.com/code360/contests";
            const startTime = contestCard.find('.notify.live span').text().trim() || contestCard.find('.notify.ng-star-inserted').text().trim();
            if (startTime === "Live Now") {
                contestData.push({
                    resource: resource,
                    href: resource,
                    event: event,
                    date: startTime,
                });
            } else {
                contestData.push({
                    resource: resource,
                    href: resource,
                    event: event,
                    date: parseDateString(startTime),
                });
            }
        });

        // Save each contest to MongoDB
        console.log(contestData.length)
        await Contest.insertMany(contestData);
        console.log('Contest data of Coding Ninjas saved to MongoDB');
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
          
    }
}

export default scrapePage;
