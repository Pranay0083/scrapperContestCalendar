import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sortEvents } from './sortData.js'; // Import with .js extension and named export

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mergeAllData = async () => {
    const platforms = ["leetcode", "geeksforgeeks", "codingninjas", "codeforces", "atcoder", "codechef"];
    const data = [];

    for (let platform of platforms) {
        const filePath = path.resolve(__dirname, `../${platform}/data.json`);
        try {
            let fileData = await fs.readFile(filePath, 'utf-8');
            fileData = JSON.parse(fileData);
            fileData.map((item) => {
                data.push(item);
            });
        } catch (error) {
            console.error(`Error reading file at ${filePath}:`, error);
            return false;
        }
    }

    const sortedData = sortEvents(data);
    console.log("me")
    const time = Date.now();
    const dataPath = path.resolve(__dirname, `../data/data${time}.json`);

    try {
        await fs.writeFile(dataPath, JSON.stringify(sortedData, null, 2));
        return `data${time}.json`;
    } catch (err) {
        console.error('Error writing sorted data to file:', err);
        return false;
    }
};

export default mergeAllData;
