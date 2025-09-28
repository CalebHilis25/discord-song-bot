// Replit-compatible web search service using built-in modules
const https = require('https');
const { URL } = require('url');

class LyricsSearchService {
    constructor() {
        console.log('🌐 Web search service initialized (Replit compatible)');
    }

    // Replit-compatible web search
    async searchLyrics(songTitle, artist = '') {
        try {
            console.log(`🔍 Web search for: "${songTitle}" by ${artist}`);
            
            // Try the API search first
            const result = await this.searchWithSimpleAPI(songTitle, artist);
            
            if (result) {
                return result;
            }
            
            // If API fails, return enhanced placeholder
            return this.generateEnhancedResult(songTitle, artist);
            
        } catch (error) {
            console.error('Web search error:', error.message);
            return this.generateEnhancedResult(songTitle, artist);
        }
    }

    // Simple API search using built-in https module
    searchWithSimpleAPI(songTitle, artist) {
        return new Promise((resolve) => {
            try {
                // Use lyrics.ovh API with built-in https
                const apiUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`;
                const url = new URL(apiUrl);
                
                const options = {
                    hostname: url.hostname,
                    path: url.pathname + url.search,
                    method: 'GET',
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Discord-Song-Bot/1.0'
                    }
                };

                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        try {
                            if (res.statusCode === 200) {
                                const parsed = JSON.parse(data);
                                if (parsed.lyrics) {
                                    console.log(`✅ Found lyrics via API for "${songTitle}"`);
                                    resolve(this.formatLyricsFromAPI(parsed.lyrics, songTitle, artist));
                                    return;
                                }
                            }
                            resolve(null);
                        } catch (parseError) {
                            console.log('API parse error:', parseError.message);
                            resolve(null);
                        }
                    });
                });

                req.on('error', (error) => {
                    console.log('API request error:', error.message);
                    resolve(null);
                });

                req.on('timeout', () => {
                    console.log('API request timeout');
                    req.destroy();
                    resolve(null);
                });

                req.end();
                
            } catch (error) {
                console.log('API setup error:', error.message);
                resolve(null);
            }
        });
    }

    // Format lyrics from API
    formatLyricsFromAPI(rawLyrics, songTitle, artist) {
        try {
            // Clean and format lyrics
            const lines = rawLyrics
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const formattedLines = [];
            
            for (let i = 0; i < Math.min(lines.length, 40); i++) {
                const line = lines[i];
                
                // Detect section headers
                if (line.match(/^\[.*\]$/) || 
                    line.toLowerCase().includes('verse') || 
                    line.toLowerCase().includes('chorus') || 
                    line.toLowerCase().includes('bridge')) {
                    formattedLines.push(`[${line.replace(/[\[\]]/g, '')}]`);
                } else if (line.length > 5) {
                    // Add chord progression for longer lines
                    const chords = this.getChordProgression(i);
                    formattedLines.push(chords);
                    formattedLines.push(line);
                } else {
                    formattedLines.push(line);
                }
                
                // Add spacing
                if (i % 4 === 3) {
                    formattedLines.push('');
                }
            }

            return {
                title: songTitle,
                artist: artist,
                lyrics: formattedLines,
                source: "lyrics.ovh API",
                disclaimer: "Lyrics sourced from lyrics.ovh - for educational/personal use only",
                isWebResult: true
            };
            
        } catch (error) {
            console.error('Error formatting lyrics:', error.message);
            return null;
        }
    }

    // Generate chord progressions
    getChordProgression(index) {
        const progressions = [
            "C               G",
            "Am              F", 
            "F               C",
            "G               Am",
            "Em              C",
            "D               G",
            "A               E",
            "Bm              G"
        ];
        return progressions[index % progressions.length];
    }

    // Enhanced placeholder when song not found
    generateEnhancedResult(songTitle, artist) {
        return {
            title: songTitle,
            artist: artist || 'Unknown Artist',
            lyrics: [
                "[Web Search Result]",
                "C               G",
                `Searched for: "${songTitle}"`,
                "Am              F",
                `By: ${artist || 'Unknown Artist'}`,
                "",
                "[Status]",
                "F               C",
                "Song not found in lyrics database",
                "G               Am", 
                "Try with exact artist and title",
                "",
                "[Suggestions]",
                "Em              C",
                "• Check spelling carefully",
                "D               G",
                "• Use format: 'Artist - Song Title'",
                "C               F",
                "• Try popular/well-known songs",
                "G               C",
                "• Add this song to local database"
            ],
            source: "web_search",
            disclaimer: "Song not found in online databases - consider adding manually",
            isWebResult: true
        };
    }

    // Discovery with popular songs
    async discoverPopularSongs() {
        return [
            { title: "Shape of You", artist: "Ed Sheeran" },
            { title: "Blinding Lights", artist: "The Weeknd" },
            { title: "Someone Like You", artist: "Adele" },
            { title: "Perfect", artist: "Ed Sheeran" },
            { title: "Watermelon Sugar", artist: "Harry Styles" },
            { title: "Levitating", artist: "Dua Lipa" },
            { title: "Stay", artist: "The Kid LAROI" },
            { title: "Anti-Hero", artist: "Taylor Swift" }
        ];
    }

    // Enhanced suggestions
    async getSongSuggestions(partialTitle) {
        return [
            `Try: "${partialTitle}" with artist name`,
            `Format: "Artist - ${partialTitle}"`,
            `Check spelling: "${partialTitle}"`,
            `Popular songs similar to "${partialTitle}"`,
            `Add "lyrics" to search: "${partialTitle} lyrics"`
        ];
    }
}

module.exports = { LyricsSearchService };
