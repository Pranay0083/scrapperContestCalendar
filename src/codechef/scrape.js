import { load } from 'cheerio';
import { Builder, Browser } from 'selenium-webdriver';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertDateTimeToIST(dateString, timeString) {
    const [day, month, year] = dateString.split(' ');
    const [_, time] = timeString.split(' ');
    const [hours, minutes] = time.split(':');
    
    const date = new Date(Date.UTC(year, getMonthIndex(month), parseInt(day), parseInt(hours), parseInt(minutes)));
    
    // Adjust to IST (UTC+5:30)
    date.setMinutes(date.getMinutes() + 330);
    
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

function getMonthIndex(monthStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.indexOf(monthStr);
}

async function scrapePage() {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://www.codechef.com/contests');
        await sleep(10000);
        const pageSource = await driver.getPageSource();
        const $ = load(pageSource);
        const targetDiv = $('div._table__container_7s2sw_344._dark_7s2sw_247').first();
        const contests = [];
        
        targetDiv.find('tbody tr').each((i, row) => {
            const id = $(row).find('td[data-colindex="0"] p').text().trim();
            const event = $(row).find('td[data-colindex="1"] a span').text().trim();
            const href = $(row).find('td[data-colindex="1"] a').attr('href');
            const date = $(row).find('td[data-colindex="2"] p:first-of-type').text().trim();
            const time = $(row).find('td[data-colindex="2"] p._grey__text_7s2sw_462').text().trim();
            const duration = $(row).find('td[data-colindex="3"] p').text().trim();
            
            // Convert the date and time to IST
            const { date: istDate, time: istTime } = convertDateTimeToIST(date, time);
            
            contests.push({
                id: uuidv4(),
                event,
                resource: "https://www.codechef.com/contests",
                date: istDate,
                time: istTime,
                href: `https://www.codechef.com${href}`,
            });
        });
        
        await fs.writeFile('data.json', JSON.stringify(contests, null, 2));
        console.log('Scraping completed successfully and saved to contests.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        await driver.quit();
    }
}

export default scrapePage;
