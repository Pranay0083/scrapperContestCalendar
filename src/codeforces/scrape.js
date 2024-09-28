import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertUTCOffsetToISO(dateTimeString) {
    // Parse the date and time components
    const [datePart, timePart] = dateTimeString.split(' ');
    const [month, day, year] = datePart.split('/');
    const [time, offsetPart] = timePart.split('UTC');
    const [hours, minutes] = time.split(':');

    // Parse the UTC offset
    const offsetSign = offsetPart.startsWith('-') ? -1 : 1;
    const [offsetHours, offsetMinutes] = offsetPart.substring(1).split('.');
    const totalOffsetMinutes = (parseInt(offsetHours) * 60 + (offsetMinutes ? parseInt(offsetMinutes) * 6 : 0)) * offsetSign;

    // Create a Date object
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthIndex = monthNames.indexOf(month);
    const date = new Date(Date.UTC(
        parseInt(year),
        monthIndex,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
    ));

    // Adjust for UTC offset
    date.setUTCMinutes(date.getUTCMinutes() - totalOffsetMinutes);

    // Format the result
    const pad = (num) => num.toString().padStart(2, '0');
    const formattedDate = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    const formattedTime = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;

    return `${formattedDate}T${formattedTime}.000Z`;
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://codeforces.com/contests');
        await sleep(5000);
        const pageSource = await driver.getPageSource();
        const dom = new JSDOM(pageSource);
        const document = dom.window.document;
        const contestRows = document.querySelectorAll('tr[data-contestid]');
        const contests = [];
        contestRows.forEach(row => {
            const contestId = row.getAttribute('data-contestid');
            const event = row.querySelector('td:nth-child(1)')?.textContent.trim().replace(/\n\s+/g, '').split('»')[0].trim();
            const writers = row.querySelector('td:nth-child(2)')?.textContent.trim().split('\n').map(w => w.trim()).filter(Boolean);
            const time = row.querySelector('td:nth-child(3)')?.textContent.trim();
            const length = row.querySelector('td:nth-child(4)')?.textContent.trim();
            let date = row.querySelector('td:nth-child(5)')?.textContent.trim();
            // console.log(date,time)
            if (date !== "Final standings" && date.includes("Before")) {
                contests.push({
                    id: uuidv4(),
                    event,
                    resource: "https://codeforces.com/contests",
                    date: convertUTCOffsetToISO(time),
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
        await fs.writeFile('codeforces.json', JSON.stringify(contests, null, 2));
        console.log('Contest data of Codeforces saved to data.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;