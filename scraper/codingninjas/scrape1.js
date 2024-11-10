import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Contest from '../../models/Contest.js'; // Ensure the path is correct

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseDateString(dateString) {
    // Helper function to pad numbers to two digits
    const pad = (num) => num.toString().padStart(2, '0');

    let date;

    // Handle absolute date like "03 Oct 2024 @08:00 PM IST"
    const dateTimeRegex = /^(\d{2}) (\w{3}) (\d{4}) @(\d{2}):(\d{2}) (AM|PM) IST$/;
    const matchDateTime = dateString.match(dateTimeRegex);

    if (matchDateTime) {
        const [_, day, month, year, hour, minute, period] = matchDateTime;

        // Convert month name to number (0-11)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthIndex = monthNames.indexOf(month);

        // Adjust hour for AM/PM format
        let hour24 = parseInt(hour, 10);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        if (period === "AM" && hour24 === 12) hour24 = 0;

        // Create a Date object
        date = new Date(Date.UTC(parseInt(year), monthIndex, parseInt(day), hour24, parseInt(minute), 0));
    }
    // Handle relative date like "Starts in 4 days"
    else if (dateString.startsWith("Starts in")) {
        const relativeDays = parseInt(dateString.match(/Starts in (\d+) days/)[1], 10);
        date = new Date(); // Current date
        date.setUTCDate(date.getUTCDate() + relativeDays);
    } else {
        return null; // Invalid format
    }

    // Convert date to ISO 8601 format with 'Z' (UTC timezone)
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1); // Months are 0-indexed in JavaScript
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}

async function scrapePage() {
    const dbURI = process.env.MONGODB_URI; // Ensure your MongoDB URI is in your .env file
    await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

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
            contestData.push({
                event: title,
                resource: "https://www.naukri.com/code360/contests",
                date: parseDateString(startTime),
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
        await Contest.insertMany(contestData);
        console.log('Contest data of Coding Ninjas saved to MongoDB');
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
        mongoose.connection.close();
    }
}

export default scrapePage;
