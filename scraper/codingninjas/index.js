import scrapePage1 from './scrape1.js';
import scrapePage2 from './scrape2.js'
import scrapePage3 from './scrape3.js';

const scraper = async () => {
    try {
        await scrapePage1();
        await scrapePage2();
        await scrapePage3();
        console.log('Coding Ninjas scraping completed successfully!');
    } catch (error) {
        console.error('Error during scraping:', error);
    }
};

export default scraper;