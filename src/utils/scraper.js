import fs from 'fs/promises';
import path from 'path';
import mergeAllData from './mergeAllData.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const scraper = async () => {
    const platforms = ["leetcode", "geeksforgeeks", "codingninjas", "codeforces", "atcoder", "codechef"];
    
    for (let platform of platforms) {
        const filePath = path.resolve(__dirname, `../${platform}/index.js`);
        const { default: scraperModule } = await import(filePath);
        
        // Call the scraper function from the module if it exists
        if (typeof scraperModule === 'function') {
            await scraperModule();
        }
    }
    return await mergeAllData();
};

console.log(await scraper().catch(console.error));
