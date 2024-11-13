import atcoder from './atcoder/index.js';
import codechef from './codechef/index.js';
import codeforces from './codeforces/index.js';
import codingninjas from './codingninjas/index.js';
import geeksforgeeks from './geeksforgeeks/index.js';
import leetcode from './leetcode/index.js';
import Contest from '../models/Contest.js';

const scrapeAll = async () => {
  try {
    await Contest.deleteMany({}); 
    console.log('Existing data cleared from the database.');
    await atcoder();
    await codechef();
    await codeforces();
    await codingninjas();
    await geeksforgeeks();
    await leetcode();
    console.log('Scraping completed.');
  } catch (error) {
    console.error('Error during scraping:', error);
  }
};

export default scrapeAll;
