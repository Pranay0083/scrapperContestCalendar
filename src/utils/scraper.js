import fs from 'fs/promises';
import path from 'path';
import mergeAllData from './mergeAllData.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const scraper = async () => {
    const platforms = ["leetcode", "geeksforgeeks", "codingninjas", "codeforces", "codechef", "atcoder"];
    for (let platform of platforms) {
        const filePath = path.resolve(__dirname, `../${platform}/index.js`);
        const { default: scraperModule } = await import(filePath);
        if (typeof scraperModule === 'function') {
            await scraperModule();
        }
    }
    return await mergeAllData();
};

console.log(await scraper().catch(console.error));
