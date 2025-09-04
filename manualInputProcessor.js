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
            // More flexible URL detection
            if (input.startsWith('http://') || input.startsWith('https://')) {
                const url = new URL(input);
                return url.protocol === 'http:' || url.protocol === 'https:';
            }
            
            // Also check for common URL patterns without protocol
            if (input.includes('ultimate-guitar.com') || 
                input.includes('tabs.ultimate-guitar.com') ||
                input.includes('arkjuander.com') ||
                input.includes('chordu.com') ||
                input.includes('azchords.com') ||
                input.includes('.com') && input.includes('/')) {
                return true;
            }
            
            return false;
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
            console.log('🔗 Processing URL:', url);
            if (message) await message.edit('🔗 Processing URL... Fetching content from website...');
            
            // Ensure URL has protocol
            let fullURL = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                fullURL = 'https://' + url;
            }
            
            console.log('🌐 Full URL:', fullURL);
            
            const content = await this.fetchURLContent(fullURL);
            
            if (content) {
                console.log('📄 Content fetched, length:', content.length);
                
                // Try to extract song info from the content
                const songInfo = this.extractSongInfoFromHTML(content, fullURL);
                
                if (songInfo) {
                    if (message) await message.edit('✅ Successfully extracted lyrics from URL! Generating PDF...');
                    console.log('✅ Song extracted:', songInfo.title, 'by', songInfo.artist);
                    return songInfo;
                } else {
                    console.log('❌ Could not extract song info from content');
                    console.log('📄 Content preview:', content.substring(0, 500));
                }
            } else {
                console.log('❌ No content received from URL');
            }
            
            if (message) await message.edit('❌ Could not extract lyrics from this URL. The site might not be supported or content is not accessible. Try pasting the lyrics directly instead.');
            return null;
            
        } catch (error) {
            console.error('URL processing error:', error.message);
            console.error('Error stack:', error.stack);
            if (message) await message.edit(`❌ Error processing URL: ${error.message}. Please paste the lyrics directly.`);
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
            console.log('🔍 Extracting song info from HTML...');
            
            // Remove script and style tags completely
            let cleanText = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
                .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
                .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');

            // Extract title and artist from URL first
            const urlInfo = this.extractTitleFromURL(url);
            console.log('📝 URL info:', urlInfo);

            // Try to find chord/lyric content in the HTML
            let lyricsContent = this.extractChordsFromHTML(cleanText);
            
            if (lyricsContent && lyricsContent.length > 50) {
                console.log('🎵 Found lyrics content, length:', lyricsContent.length);
                
                // Use URL info for title/artist if available
                const title = urlInfo?.title || 'Song from URL';
                const artist = urlInfo?.artist || 'Unknown Artist';
                
                return {
                    id: Date.now(),
                    title: title,
                    artist: artist,
                    lyrics: lyricsContent.split('\n'),
                    source: "URL content",
                    disclaimer: "Content extracted from URL - ensure you have proper rights for distribution",
                    isWebResult: true,
                    isManualInput: true
                };
            }

            console.log('❌ No suitable lyrics content found in HTML');
            return null;
            
        } catch (error) {
            console.error('HTML extraction error:', error.message);
            return null;
        }
    }

    // Extract chords and lyrics from HTML content
    extractChordsFromHTML(html) {
        // Remove all HTML tags but preserve line breaks
        let text = html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/div>/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\s+/g, ' ')
            .trim();

        // Split into lines and filter for chord patterns
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const lyricsLines = [];
        
        let foundChords = false;
        let inSongContent = false;
        
        for (const line of lines) {
            // Skip until we find song content markers
            if (line.toLowerCase().includes('intro:') || 
                line.toLowerCase().includes('verse') ||
                line.toLowerCase().includes('chorus') ||
                line.toLowerCase().includes('bridge')) {
                inSongContent = true;
                lyricsLines.push(`[${line.replace(/:/g, '')}]`);
                foundChords = true;
                continue;
            }
            
            // Skip navigation, advertisement, and other non-content
            if (!inSongContent || 
                line.toLowerCase().includes('advertisement') ||
                line.toLowerCase().includes('subscribe') ||
                line.toLowerCase().includes('ultimate guitar') ||
                line.toLowerCase().includes('arkjuander') ||
                line.toLowerCase().includes('copyright') ||
                line.toLowerCase().includes('no copyright') ||
                line.toLowerCase().includes('contact us') ||
                line.toLowerCase().includes('home') ||
                line.toLowerCase().includes('songs') ||
                line.toLowerCase().includes('privacy') ||
                line.toLowerCase().includes('sitemap') ||
                line.toLowerCase().includes('composer') ||
                line.toLowerCase().includes('album') ||
                line.toLowerCase().includes('release date') ||
                line.toLowerCase().includes('tags :') ||
                line.toLowerCase().includes('buy me a coffee') ||
                line.toLowerCase().includes('digital ocean') ||
                line.toLowerCase().includes('original key') ||
                line.toLowerCase().includes('transposed key') ||
                line.toLowerCase().includes('font') ||
                line.length < 3) {
                continue;
            }
            
            // Check if line contains chord patterns (common chord names)
            const hasChords = /\b[A-G](?:#|b)?(?:maj|min|m|aug|dim|sus|add)?[0-9]?\b/.test(line) ||
                             /\b[A-G](?:#|b)?\b/.test(line);
            
            // Check if it looks like lyrics (has meaningful words)
            const hasLyrics = line.length > 5 && 
                             !/^[A-G\s#b/]+$/.test(line) &&
                             /[aeiouAEIOU]/.test(line);
            
            // Add lines with chords or lyrics
            if (hasChords || hasLyrics) {
                // Clean up common website artifacts
                let cleanLine = line
                    .replace(/\s+/g, ' ')
                    .replace(/^\d+\.\s*/, '') // Remove numbering
                    .trim();
                
                if (cleanLine.length > 0) {
                    lyricsLines.push(cleanLine);
                    if (hasChords) foundChords = true;
                }
            }
        }
        
        console.log(`🎵 Extracted ${lyricsLines.length} lines, found chords: ${foundChords}`);
        
        return foundChords && lyricsLines.length > 5 ? lyricsLines.join('\n') : null;
    }

    // Extract title from URL
    extractTitleFromURL(url) {
        try {
            const urlObj = new URL(url);
            console.log('🔍 Parsing URL:', url);
            
            // Handle arkjuander.com URLs specifically
            if (urlObj.hostname.includes('arkjuander.com')) {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                console.log('📂 Arkjuander path parts:', pathParts);
                
                // Format: /lyrics-and-chords/song-title-artist
                if (pathParts.length >= 2 && pathParts[0] === 'lyrics-and-chords') {
                    const songPart = pathParts[1];
                    // Try to extract from "one-thing-hillsong-worship"
                    const parts = songPart.split('-');
                    
                    // Look for common artist indicators
                    const artistIndicators = ['hillsong', 'bethel', 'elevation', 'jesus', 'culture'];
                    let artistIndex = -1;
                    
                    for (let i = 0; i < parts.length; i++) {
                        if (artistIndicators.some(indicator => parts[i].toLowerCase().includes(indicator))) {
                            artistIndex = i;
                            break;
                        }
                    }
                    
                    if (artistIndex > 0) {
                        const title = parts.slice(0, artistIndex).join(' ').replace(/\b\w/g, char => char.toUpperCase());
                        const artist = parts.slice(artistIndex).join(' ').replace(/\b\w/g, char => char.toUpperCase());
                        console.log('🎵 Extracted from Arkjuander URL:', { artist, title });
                        return { artist, title };
                    }
                }
            }
            
            // Handle ultimate-guitar.com URLs specifically
            if (urlObj.hostname.includes('ultimate-guitar.com')) {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                console.log('📂 Path parts:', pathParts);
                
                // Format: /tab/artist/song-title-chords-123456
                if (pathParts.length >= 3 && pathParts[0] === 'tab') {
                    const artist = pathParts[1].replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                    let songTitle = pathParts[2]
                        .replace(/-chords.*$/i, '')
                        .replace(/-tabs.*$/i, '')
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase());
                    
                    console.log('🎵 Extracted from UG URL:', { artist, title: songTitle });
                    return { artist, title: songTitle };
                }
            }
            
            // Generic URL parsing
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            
            if (pathParts.length > 0) {
                const lastPart = pathParts[pathParts.length - 1];
                const title = lastPart
                    .replace(/\.(html|htm|php|aspx?)$/i, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, char => char.toUpperCase());
                
                return { artist: 'Unknown Artist', title };
            }
            
            return null;
        } catch (error) {
            console.error('URL parsing error:', error.message);
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
