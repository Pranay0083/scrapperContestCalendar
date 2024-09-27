import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseStartTime(startTime) {
    const regex = /(\d{1,2}) (\w{3}) (\d{4}) @(\d{1,2}):(\d{2}) (AM|PM) IST/;
    const match = startTime.match(regex);
    if (match) {
        const [_, day, month, year, hour, minute, period] = match;
        const dateStr = `${day} ${month} ${year} ${hour}:${minute} ${period}`;
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        });
        return {
            date: formattedDate,
            time: `${formattedTime} IST`
        };
    }
    return {
        date: false,
        time: false
    };
}
function formatISODateToReadable(dateString) {
    // Parse the ISO date string
    const date = new Date(dateString);

    // Define an array of month names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Extract the day, month, and year
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    // Format it into "Month Day, Year" format
    return `${month} ${day}, ${year}`;
}
function calculateFutureDate(daysString) {
    const days = parseInt(daysString.match(/\d+/), 10);
    if (isNaN(days)) {
        throw new Error("Invalid input for days string");
    }
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + days);
    return currentDate;
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://www.naukri.com/code360/contests');
        await sleep(10000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contestData = [];
        const ratedContestInfoHtml = $('.rated-contest-info').html();
        const ratedContestInfo = load(ratedContestInfoHtml);
        const contestCards = ratedContestInfo('.rated-contest-card');
        contestCards.each((index, element) => {
            const title = ratedContestInfo(element).find('.contest-title').text().trim();
            const startTime = ratedContestInfo(element).find('.contest-timing').text().trim();
            const start = parseStartTime(startTime);
            contestData.push({
                id: uuidv4(),
                event: title,
                resource: "https://www.naukri.com/code360/contests",
                date: start.date,
                time: start.time,
                href: "https://www.naukri.com/code360/contests",
            });
        });
        const liveAndUpcomingContests = $('.card-body.ng-star-inserted');
        liveAndUpcomingContests.each((index, element) => {
            const contestCard = $(element);
            const event = contestCard.find('.contest-info .heading').text().trim();
            const resource = "https://www.naukri.com/code360/contests";
            const startTime = contestCard.find('.notify.live span').text().trim() || contestCard.find('.notify.ng-star-inserted').text().trim();
            if (startTime === "Live Now") {
                contestData.push({
                    id: uuidv4(),
                    resource: resource,
                    href: resource,
                    event: event,
                    date: startTime,
                    time: startTime,
                });
            }else{
                contestData.push({
                    id: uuidv4(),
                    resource: resource,
                    href: resource,
                    event: event,
                    date: formatISODateToReadable(calculateFutureDate(startTime)),
                    time: startTime,
                });
            }
            
        });
        await fs.writeFile('data.json', JSON.stringify(contestData, null, 2));
        console.log("Contest data extracted and saved successfully!");
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;