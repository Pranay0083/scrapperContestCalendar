import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { scraper } from './utils/scraper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Function to get the most recent file from data directory
function getMostRecentFile(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    return files.reduce((latest, file) => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (latest.stats && latest.stats.mtime > stats.mtime) {
            return latest;
        }
        
        return {
            file: file,
            path: filePath,
            stats: stats
        };
    }, { stats: null });
}

// Endpoint to send the most recent file data
app.get('/latest-data', async (req, res) => {
    try {
        // Run the scraper first to update the data
        console.log('Starting scraper...');
        await scraper();
        console.log('Scraper finished, fetching latest data...');

        const dataDir = path.join(__dirname, 'data');
        
        // Check if data directory exists
        if (!fs.existsSync(dataDir)) {
            return res.status(404).json({ error: 'Data directory not found' });
        }

        const mostRecent = getMostRecentFile(dataDir);
        
        if (!mostRecent.stats) {
            return res.status(404).json({ error: 'No files found in data directory' });
        }

        // Read the file content
        const fileContent = fs.readFileSync(mostRecent.path, 'utf8');
        
        // Try to parse if it's JSON
        try {
            const jsonContent = JSON.parse(fileContent);
            res.json({
                filename: mostRecent.file,
                lastModified: mostRecent.stats.mtime,
                data: jsonContent,
                message: 'Data successfully updated and retrieved'
            });
        } catch (parseError) {
            // If not JSON, send as plain text
            res.send({
                filename: mostRecent.file,
                lastModified: mostRecent.stats.mtime,
                data: fileContent,
                message: 'Data successfully updated and retrieved'
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the latest data at http://localhost:${PORT}/latest-data`);
});