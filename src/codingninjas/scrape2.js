import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDaysBetweenDates(startTime, endTime) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (isNaN(startDate) || isNaN(endDate)) {
        return 'Invalid date';
    }

    const timeDifference = endDate - startDate;
    return timeDifference / (1000 * 60 * 60 * 24); // Convert milliseconds to days
}

function formatDate(input) {
    const [dayMonth, year] = input.split(', '); // Split into day and month part
    const [day, monthAbbr] = dayMonth.split('-'); // Split into day and month abbreviation

    // Create a new date object using the month abbreviation and year
    const date = new Date(`${monthAbbr} ${day}, ${year}`);

    // Return the formatted date as "Month Day, Year"
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
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
                const duration = getDaysBetweenDates(startTime, endTime);
                return {
                    id: uuidv4(),
                    event: name,
                    resource: 'https://www.naukri.com/code360/challenges',
                    start: formatDate(startTime),
                    time: duration + " days",
                    href: 'https://www.naukri.com/code360/challenges',
                };
            }
        });

        const filteredChallenges = challenges.filter(Boolean); // Remove undefined values

        // Read the existing data from the 'data.json' file
        let existingData = [];
        try {
            const fileData = await fs.readFile('data.json', 'utf-8');
            existingData = JSON.parse(fileData); // Parse the existing data
        } catch (error) {
            console.warn('No existing data found, starting with an empty array.');
        }

        // Combine the existing data with the new challenges
        const updatedData = [...existingData, ...filteredChallenges];

        // Save the updated data back to 'challenges.json'
        await fs.writeFile('data.json', JSON.stringify(updatedData, null, 2));
        console.log("Challenges data saved successfully!");
    } catch (error) {
        console.error("Error during scraping:", error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
