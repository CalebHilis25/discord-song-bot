const fs = require('fs');
const path = require('path');

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

// Search for a song by title (case-insensitive, partial match)
function searchSong(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    return songs.find(song => 
        song.title.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
    );
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
    saveSongsToFile
};
