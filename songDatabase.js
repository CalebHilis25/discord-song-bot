const fs = require('fs');
const path = require('path');
const { LyricsSearchService } = require('./webSearchService');

// Initialize web search service
const webSearch = new LyricsSearchService();

// Sample song database - Replace with your own legal content
const songs = [
    {
        id: 1,
        title: "Sample Song",
        artist: "Sample Artist",
        lyrics: [
            "[Verse 1]",
            "C               G",
            "This is a sample song",
            "Am              F", 
            "For demonstration only",
            "",
            "[Chorus]",
            "F               C",
            "Replace this content",
            "G               Am",
            "With your legal lyrics",
            "",
            "[Verse 2]", 
            "C               G",
            "Make sure you have rights",
            "Am              F",
            "To any songs you add"
        ]
    },
    {
        id: 2,
        title: "Demo Track",
        artist: "Demo Artist",
        lyrics: [
            "[Intro]",
            "G    D    Em   C",
            "",
            "[Verse 1]",
            "G               D",
            "This is just a demo",
            "Em              C",
            "To show the format",
            "G               D", 
            "Add your own content",
            "Em              C",
            "Following copyright laws",
            "",
            "[Chorus]",
            "C               G",
            "Always respect",
            "D               Em",
            "Artist's rights",
            "C               G",
            "Use legal sources",
            "D               G",
            "For all your songs"
        ]
    }
];

// Enhanced search function with web search capabilities
async function searchSong(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    // First, search local database
    const localResult = songs.find(song => 
        song.title.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
    );
    
    if (localResult) {
        console.log(`✅ Found "${searchTerm}" in local database`);
        return localResult;
    }
    
    // Parse the search term to extract artist and title
    const { artist, title } = parseSearchTerm(searchTerm);
    
    // If not found locally, search the web
    console.log(`🌐 Searching web for "${title}" by "${artist}"...`);
    
    try {
        const webResult = await webSearch.searchLyrics(title, artist);
        
        if (webResult) {
            console.log(`✅ Found "${title}" on the web from ${webResult.source}`);
            
            // Convert web result to our format
            const formattedResult = {
                id: songs.length + 1,
                title: webResult.title,
                artist: webResult.artist,
                lyrics: webResult.lyrics,
                source: webResult.source,
                disclaimer: webResult.disclaimer,
                isWebResult: true
            };
            
            // Optionally cache the result
            await cacheWebResult(formattedResult);
            
            return formattedResult;
        }
        
    } catch (error) {
        console.error('Web search error:', error.message);
    }
    
    // If still not found, try auto-suggestions
    console.log(`💡 Suggesting alternatives for "${searchTerm}"...`);
    return null;
}

// Parse search term to extract artist and title
function parseSearchTerm(searchTerm) {
    const term = searchTerm.trim();
    
    // Try different parsing patterns
    let artist = '';
    let title = '';
    
    // Pattern 1: "Artist - Title" or "Artist-Title"
    if (term.includes(' - ') || term.includes('-')) {
        const separator = term.includes(' - ') ? ' - ' : '-';
        const parts = term.split(separator);
        if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join(separator).trim();
        }
    }
    // Pattern 2: "Title by Artist"
    else if (term.includes(' by ')) {
        const parts = term.split(' by ');
        if (parts.length >= 2) {
            title = parts[0].trim();
            artist = parts.slice(1).join(' by ').trim();
        }
    }
    // Pattern 3: "Artist Title" (guess based on common artist names)
    else {
        const words = term.split(' ');
        if (words.length >= 2) {
            // Common patterns for artist names
            const commonArtists = ['ed sheeran', 'taylor swift', 'adele', 'the weeknd', 'billie eilish', 'harry styles', 'dua lipa'];
            
            for (const commonArtist of commonArtists) {
                if (term.toLowerCase().includes(commonArtist)) {
                    artist = commonArtist;
                    title = term.toLowerCase().replace(commonArtist, '').trim();
                    break;
                }
            }
            
            // If no common artist found, assume first word(s) is artist
            if (!artist) {
                if (words.length === 2) {
                    artist = words[0];
                    title = words[1];
                } else if (words.length >= 3) {
                    artist = words.slice(0, 2).join(' '); // First 2 words as artist
                    title = words.slice(2).join(' '); // Rest as title
                }
            }
        } else {
            // Single word search - treat as title with unknown artist
            title = term;
            artist = '';
        }
    }
    
    // Clean up the results
    artist = artist.replace(/[^\w\s&]/g, '').trim();
    title = title.replace(/[^\w\s&']/g, '').trim();
    
    console.log(`🔍 Parsed search: Artist="${artist}", Title="${title}"`);
    
    return { artist, title };
}

// Cache web results for faster future access
async function cacheWebResult(song) {
    try {
        // Add to runtime cache
        songs.push({
            id: song.id,
            title: song.title,
            artist: song.artist,
            lyrics: song.lyrics,
            source: song.source,
            cached: true,
            cachedAt: new Date().toISOString()
        });
        
        console.log(`📦 Cached "${song.title}" for future use`);
        
    } catch (error) {
        console.error('Error caching song:', error.message);
    }
}

// Auto-discover and cache popular songs
async function autoDiscoverSongs() {
    try {
        console.log('🔍 Auto-discovering popular songs...');
        
        const popularSongs = await webSearch.discoverPopularSongs();
        
        for (const songInfo of popularSongs.slice(0, 5)) { // Limit to 5 songs
            try {
                const lyrics = await webSearch.searchLyrics(songInfo.title, songInfo.artist);
                if (lyrics) {
                    await cacheWebResult(lyrics);
                }
                
                // Small delay to be respectful to web services
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`Failed to cache ${songInfo.title}: ${error.message}`);
            }
        }
        
        console.log(`✅ Auto-discovery complete! Added ${popularSongs.length} songs to cache`);
        
    } catch (error) {
        console.error('Auto-discovery error:', error.message);
    }
}

// Get song suggestions
async function getSongSuggestions(partialTitle) {
    try {
        return await webSearch.getSongSuggestions(partialTitle);
    } catch (error) {
        console.error('Error getting suggestions:', error.message);
        return [];
    }
}

// Get all available songs
function getAllSongs() {
    return songs.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist
    }));
}

// Add a new song (for future expansion)
function addSong(title, artist, lyrics) {
    const newSong = {
        id: songs.length + 1,
        title: title,
        artist: artist,
        lyrics: lyrics
    };
    
    songs.push(newSong);
    return newSong;
}

// Load songs from JSON file (optional)
function loadSongsFromFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            const loadedSongs = JSON.parse(data);
            songs.push(...loadedSongs);
            console.log(`✅ Loaded ${loadedSongs.length} songs from ${filePath}`);
        }
    } catch (error) {
        console.error('Error loading songs from file:', error.message);
    }
}

// Save songs to JSON file (optional)
function saveSongsToFile(filePath) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));
        console.log(`✅ Saved ${songs.length} songs to ${filePath}`);
    } catch (error) {
        console.error('Error saving songs to file:', error.message);
    }
}

module.exports = {
    searchSong,
    getAllSongs,
    addSong,
    loadSongsFromFile,
    saveSongsToFile,
    autoDiscoverSongs,
    getSongSuggestions
};
