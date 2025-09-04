// URL and manual input processor for song lyrics
const https = require('https');
const { URL } = require('url');

class ManualInputProcessor {
    constructor() {
        console.log('📝 Manual input processor initialized');
    }

    // Process different types of user input
    async processUserInput(input, message) {
        const trimmedInput = input.trim();
        
        // Check if input is a URL
        if (this.isURL(trimmedInput)) {
            return await this.processURL(trimmedInput, message);
        }
        
        // Check if input contains lyrics (long text with multiple lines)
        if (this.looksLikeLyrics(trimmedInput)) {
            return await this.processLyricsText(trimmedInput, message);
        }
        
        // Otherwise, treat as regular song search
        return null;
    }

    // Check if input is a URL
    isURL(input) {
        try {
            const url = new URL(input);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Check if input looks like song lyrics
    looksLikeLyrics(input) {
        const lines = input.split('\n');
        const hasMultipleLines = lines.length >= 3;
        const hasChords = /[A-G](?:m|maj|dim|aug|sus|add|\d)*/.test(input);
        const hasSongStructure = /\[(verse|chorus|bridge|intro|outro)/i.test(input);
        const isLongEnough = input.length > 100;
        
        return hasMultipleLines && (hasChords || hasSongStructure || isLongEnough);
    }

    // Process URL (fetch content from website)
    async processURL(url, message) {
        try {
            await message.edit('🔗 Processing URL... Fetching content from website...');
            
            const content = await this.fetchURLContent(url);
            
            if (content) {
                // Try to extract song info from the content
                const songInfo = this.extractSongInfoFromHTML(content, url);
                
                if (songInfo) {
                    await message.edit('✅ Successfully extracted lyrics from URL! Generating PDF...');
                    return songInfo;
                }
            }
            
            await message.edit('❌ Could not extract lyrics from this URL. Try pasting the lyrics directly instead.');
            return null;
            
        } catch (error) {
            console.error('URL processing error:', error.message);
            await message.edit('❌ Error processing URL. Please paste the lyrics directly.');
            return null;
        }
    }

    // Fetch content from URL
    fetchURLContent(url) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            
            const options = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                    // Limit data size to prevent memory issues
                    if (data.length > 500000) { // 500KB limit
                        req.destroy();
                        reject(new Error('Content too large'));
                    }
                });
                
                res.on('end', () => {
                    resolve(data);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    // Extract song information from HTML content
    extractSongInfoFromHTML(html, url) {
        try {
            // Simple text extraction (without complex HTML parsing)
            const text = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]*>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\s+/g, ' ');

            // Try to find title in text or URL
            const title = this.extractTitleFromURL(url) || 'Song from URL';
            const artist = 'Unknown Artist';

            // If the content looks like lyrics, process it
            if (this.looksLikeLyrics(text)) {
                return this.processLyricsText(text, null, title, artist);
            }

            return null;
            
        } catch (error) {
            console.error('HTML extraction error:', error.message);
            return null;
        }
    }

    // Extract title from URL
    extractTitleFromURL(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                return lastPart
                    .replace(/\.(html|htm|php|aspx?)$/i, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, char => char.toUpperCase());
            }
            
            return null;
        } catch {
            return null;
        }
    }

    // Process pasted lyrics text
    async processLyricsText(input, message = null, customTitle = null, customArtist = null) {
        try {
            if (message) {
                await message.edit('📝 Processing pasted lyrics... Formatting for PDF...');
            }

            // Extract title and artist from the text if not provided
            const { title, artist } = customTitle && customArtist ? 
                { title: customTitle, artist: customArtist } : 
                this.extractTitleAndArtist(input);

            // Clean and format the lyrics
            const formattedLyrics = this.formatPastedLyrics(input);

            const songData = {
                id: Date.now(),
                title: title,
                artist: artist,
                lyrics: formattedLyrics,
                source: "manual_input",
                disclaimer: "Lyrics provided by user - ensure you have proper rights for distribution",
                isWebResult: true,
                isManualInput: true
            };

            if (message) {
                await message.edit('✅ Successfully processed your lyrics! Generating PDF...');
            }

            return songData;

        } catch (error) {
            console.error('Lyrics processing error:', error.message);
            if (message) {
                await message.edit('❌ Error processing lyrics. Please check the format and try again.');
            }
            return null;
        }
    }

    // Extract title and artist from pasted text
    extractTitleAndArtist(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let title = 'Unknown Song';
        let artist = 'Unknown Artist';

        // Look for common patterns in first few lines
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            
            // Pattern: "Title by Artist"
            if (line.toLowerCase().includes(' by ')) {
                const parts = line.split(/ by /i);
                if (parts.length >= 2) {
                    title = parts[0].trim();
                    artist = parts.slice(1).join(' by ').trim();
                    break;
                }
            }
            
            // Pattern: "Artist - Title"
            if (line.includes(' - ')) {
                const parts = line.split(' - ');
                if (parts.length >= 2) {
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                    break;
                }
            }

            // If line looks like a title (short, no chords, no brackets)
            if (line.length < 50 && 
                !line.includes('[') && 
                !/[A-G](?:m|maj|dim|aug|sus|add|\d)*/.test(line) &&
                !line.toLowerCase().includes('verse') &&
                !line.toLowerCase().includes('chorus')) {
                title = line;
            }
        }

        return { title, artist };
    }

    // Format pasted lyrics for PDF generation
    formatPastedLyrics(input) {
        const lines = input.split('\n').map(line => line.trim());
        const formattedLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip empty lines but preserve spacing
            if (line.length === 0) {
                formattedLines.push('');
                continue;
            }

            // Format section headers
            if (line.toLowerCase().includes('verse') || 
                line.toLowerCase().includes('chorus') || 
                line.toLowerCase().includes('bridge') ||
                line.toLowerCase().includes('intro') ||
                line.toLowerCase().includes('outro') ||
                line.startsWith('[') && line.endsWith(']')) {
                formattedLines.push(`[${line.replace(/[\[\]]/g, '')}]`);
                continue;
            }

            // Detect chord lines (lines with chord patterns)
            const isChordLine = /^[A-G](?:m|maj|dim|aug|sus|add|\d)*(\s+[A-G](?:m|maj|dim|aug|sus|add|\d)*)*\s*$/.test(line) ||
                               /[A-G](?:m|maj|dim|aug|sus|add|\d)*\s+/.test(line);

            if (isChordLine) {
                // This is a chord line - format it properly
                formattedLines.push(line);
            } else {
                // This is a lyrics line
                formattedLines.push(line);
            }
        }

        // Remove the first few lines that might be title/artist info
        // to avoid duplication since we extract them separately
        const startIndex = formattedLines.findIndex(line => 
            line.includes('[') || 
            /[A-G](?:m|maj|dim|aug|sus|add|\d)*/.test(line) ||
            (line.length > 10 && !line.toLowerCase().includes(' by ') && !line.includes(' - '))
        );

        return startIndex > 0 ? formattedLines.slice(startIndex) : formattedLines;
    }
}

module.exports = { ManualInputProcessor };
