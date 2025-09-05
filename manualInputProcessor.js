// Manual lyrics processor for song lyrics
// No URL processing - lyrics only for security

class ManualInputProcessor {
    constructor() {
        console.log('📝 Manual lyrics processor initialized - No URL access');
    }

    // Check if input looks like song lyrics
    looksLikeLyrics(input) {
        console.log('🔍 Checking if input looks like lyrics...');
        
        // Basic checks for lyrics format
        const lines = input.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length < 3) {
            console.log('❌ Too few lines for lyrics');
            return false;
        }
        
        if (input.length < 50) {
            console.log('❌ Too short for lyrics');
            return false;
        }
        
        // Look for song structure indicators
        const hasStructure = /\b(verse|chorus|bridge|intro|outro|refrain)\b/i.test(input) ||
                           /\[[^\]]+\]/g.test(input) || // [Verse 1], [Chorus], etc.
                           lines.length > 8; // Long enough to be lyrics
        
        // Look for chord patterns
        const hasChords = /\b[A-G](?:#|b)?(?:maj|min|m|aug|dim|sus|add)?[0-9]?\b/.test(input);
        
        // Check for repeated patterns (common in songs)
        const hasRepeats = input.toLowerCase().includes('repeat') ||
                          input.toLowerCase().includes('x2') ||
                          input.toLowerCase().includes('x3') ||
                          input.toLowerCase().includes('x4');
        
        console.log(`📊 Lyrics analysis: lines=${lines.length}, structure=${hasStructure}, chords=${hasChords}, repeats=${hasRepeats}`);
        
        return hasStructure || hasChords || hasRepeats;
    }

    // Process lyrics text input
    async processLyricsText(input, message) {
        try {
            console.log('📝 Processing lyrics text...');
            if (message) await message.edit('📝 Processing lyrics... Analyzing song structure...');
            
            const trimmedInput = input.trim();
            
            if (!this.looksLikeLyrics(trimmedInput)) {
                console.log('❌ Input does not look like lyrics');
                return null;
            }
            
            // Extract title and artist from the lyrics content
            const songInfo = this.extractSongInfoFromLyrics(trimmedInput);
            
            if (songInfo) {
                if (message) await message.edit('✅ Successfully processed lyrics! Generating PDF...');
                console.log('✅ Lyrics processed:', songInfo.title, 'by', songInfo.artist);
                return songInfo;
            } else {
                console.log('❌ Could not extract song info from lyrics');
                return null;
            }
            
        } catch (error) {
            console.error('Lyrics processing error:', error.message);
            if (message) await message.edit(`❌ Error processing lyrics: ${error.message}`);
            return null;
        }
    }

    // Extract song information from lyrics text
    extractSongInfoFromLyrics(lyricsText) {
        try {
            console.log('🔍 Extracting song info from lyrics text...');
            
            // Split into lines
            const lines = lyricsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            // Try to extract title and artist from first few lines
            let title = 'Manual Input Song';
            let artist = 'Unknown Artist';
            
            // Look for title patterns in first few lines
            for (let i = 0; i < Math.min(lines.length, 5); i++) {
                const line = lines[i];
                
                // Check if line looks like a title (shorter, no chords, capitalized)
                if (line.length < 50 && 
                    !/\b[A-G](?:#|b)?(?:maj|min|m|aug|dim|sus|add)?[0-9]?\b/.test(line) &&
                    !line.toLowerCase().includes('verse') &&
                    !line.toLowerCase().includes('chorus') &&
                    !line.toLowerCase().includes('bridge') &&
                    line.includes(' ')) {
                    
                    // Check if it has "by" or "-" indicating artist
                    if (line.toLowerCase().includes(' by ')) {
                        const parts = line.split(/\s+by\s+/i);
                        if (parts.length === 2) {
                            title = parts[0].trim();
                            artist = parts[1].trim();
                            break;
                        }
                    } else if (line.includes(' - ')) {
                        const parts = line.split(' - ');
                        if (parts.length === 2) {
                            title = parts[0].trim();
                            artist = parts[1].trim();
                            break;
                        }
                    } else {
                        // Assume it's just a title
                        title = line;
                    }
                }
            }
            
            // Clean up extracted lyrics
            const cleanedLyrics = this.cleanLyricsContent(lyricsText);
            
            if (cleanedLyrics && cleanedLyrics.length > 20) {
                console.log(`🎵 Found lyrics content, length: ${cleanedLyrics.length}`);
                
                return {
                    id: Date.now(),
                    title: title,
                    artist: artist,
                    lyrics: cleanedLyrics.split('\n'),
                    source: "Manual input",
                    disclaimer: "Manually entered content - ensure you have proper rights for distribution",
                    isWebResult: false,
                    isManualInput: true
                };
            }

            console.log('❌ No suitable lyrics content found');
            return null;
            
        } catch (error) {
            console.error('Lyrics extraction error:', error.message);
            return null;
        }
    }

    // Clean and format lyrics content
    cleanLyricsContent(lyricsText) {
        try {
            // Split into lines and clean up
            const lines = lyricsText.split('\n').map(line => line.trim());
            const cleanedLines = [];
            
            for (const line of lines) {
                // Skip empty lines initially, we'll add them back for structure
                if (line.length === 0) {
                    cleanedLines.push('');
                    continue;
                }
                
                // Clean up common formatting issues
                let cleanLine = line
                    .replace(/\s+/g, ' ') // Multiple spaces to single space
                    .trim();
                
                // Format section headers consistently
                if (/^\[.*\]$/.test(cleanLine) || 
                    /^(verse|chorus|bridge|intro|outro|refrain)/i.test(cleanLine)) {
                    if (!cleanLine.startsWith('[')) {
                        cleanLine = `[${cleanLine.replace(/[:\[\]]/g, '')}]`;
                    }
                    cleanLine = cleanLine.toUpperCase();
                }
                
                cleanedLines.push(cleanLine);
            }
            
            // Join and clean up excessive line breaks
            let result = cleanedLines.join('\n')
                .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive line breaks
                .trim();
            
            console.log(`🧹 Cleaned lyrics, original: ${lyricsText.length} chars, cleaned: ${result.length} chars`);
            
            return result;
            
        } catch (error) {
            console.error('Lyrics cleaning error:', error.message);
            return lyricsText; // Return original if cleaning fails
        }
    }
}

module.exports = { ManualInputProcessor };
