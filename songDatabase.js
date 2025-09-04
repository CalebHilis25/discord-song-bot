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
    
    // If not found locally, search the web
    console.log(`🌐 Searching web for "${searchTerm}"...`);
    
    try {
        const webResult = await webSearch.searchLyrics(searchTerm);
        
        if (webResult) {
            console.log(`✅ Found "${searchTerm}" on the web from ${webResult.source}`);
            
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
