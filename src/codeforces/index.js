import scrapePage from './scrape.js';

const scraper = async () => {
    try {
        await scrapePage();
        console.log('Codeforces scraping completed successfully!');
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

export default scraper;