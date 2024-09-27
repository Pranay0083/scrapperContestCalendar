import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function convertToIST(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [month, day, year] = datePart.split('/');
    const [time, timezone] = timePart.split('UTC');
    const [hours, minutes] = time.split(':');
    const date = new Date(Date.UTC(year, getMonthIndex(month), day, hours, minutes));
    date.setMinutes(date.getMinutes() + 330);
    const istTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    });
    return `${istTime} IST`;
}

function getMonthIndex(monthStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthStr);
}

function calculateDateFromBeforeStart(dateString) {
    const now = new Date();
    const timeMatch = dateString.match(/(\d+):(\d+):(\d+)/);
    const daysMatch = dateString.match(/(\d+)\s*days/);

    if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const seconds = parseInt(timeMatch[3], 10);
        now.setHours(now.getHours() + hours);
        now.setMinutes(now.getMinutes() + minutes);
        now.setSeconds(now.getSeconds() + seconds);
    } else if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        now.setDate(now.getDate() + days);
    }

    return now.toISOString();
}

function formatDateToReadableString(isoDateString) {
    const date = new Date(isoDateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://codeforces.com/contests');
        const pageSource = await driver.getPageSource();
        const dom = new JSDOM(pageSource);
        const document = dom.window.document;
        const contestRows = document.querySelectorAll('tr[data-contestid]');
        const contests = [];
        contestRows.forEach(row => {
            const contestId = row.getAttribute('data-contestid');
            const event = row.querySelector('td:nth-child(1)')?.textContent.trim().replace(/\n\s+/g, '').split('»')[0].trim();
            const writers = row.querySelector('td:nth-child(2)')?.textContent.trim().split('\n').map(w => w.trim()).filter(Boolean);
            const time = convertToIST(row.querySelector('td:nth-child(3)')?.textContent.trim());
            const length = row.querySelector('td:nth-child(4)')?.textContent.trim();
            let date = row.querySelector('td:nth-child(5)')?.textContent.trim();
            // console.log(date,time)
            if (date !== "Final standings" && date.includes("Before")) {
                contests.push({
                    id: uuidv4(),
                    event,
                    resource: "https://codeforces.com/contests",
                    date: formatDateToReadableString(calculateDateFromBeforeStart(date)),
                    time,
                    href: "https://codeforces.com/contests",
                })
            }else if(date.includes("Running")){
                contests.push({
                    id: uuidv4(),
                    event,
                    resource: "https://codeforces.com/contests",
                    date: "Live Now",
                    time: "Live Now",
                    href: "https://codeforces.com/contests",
                })
            }

        });
        await fs.writeFile('data.json', JSON.stringify(contests, null, 2));
        console.log('Scraping completed successfully');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;