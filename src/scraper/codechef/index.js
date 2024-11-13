import scrapePage from './scrape.js';

const scraper = async () => {
    try {
        await scrapePage();
        console.log('Codechef scraping completed successfully!');
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

export default scraper;