import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function convertStartTimeToIST(startTime) {
    // Extract the date and time from the string
    const [dateString, timeString] = startTime.split(' '); // "2024-09-28(Sat)" "17:30"
    const [datePart] = dateString.split('('); // Remove the day part (e.g., "(Sat)")
    const [year, month, day] = datePart.split('-'); // "2024", "09", "28"
    const [hours, minutes] = timeString.split(':'); // "17", "30"
    
    // Create a Date object in UTC
    const date = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes)));

    // Adjust to IST (UTC+5:30)
    date.setMinutes(date.getMinutes() + 330);

    // Format the date to "Month Day, Year"
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });

    // Format the time to "HH:MM AM/PM IST"
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

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://atcoder.jp/contests/');
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const contests = [];
        
        // Scraping upcoming contests table
        $('#contest-table-upcoming tbody tr').each((i, elem) => {
            const startTime = $(elem).find('td:nth-child(1) time').text(); // Get start time string
            const { date, time } = convertStartTimeToIST(startTime); // Convert start time to IST
            
            const contest = {
                id: uuidv4(),
                event: $(elem).find('td:nth-child(2) a').text().trim(),
                resource: "https://atcoder.jp/",
                date: date,
                time: time,
                href: "https://atcoder.jp" + $(elem).find('td:nth-child(2) a').attr('href'),
            };
            contests.push(contest);
        });
        
        await fs.writeFile('data.json', JSON.stringify(contests, null, 2));
        console.log('Scraping completed and data saved to data.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
