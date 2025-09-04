const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { searchSong, autoDiscoverSongs, getSongSuggestions } = require('./songDatabase');
const { generatePDF } = require('./pdfGenerator');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`🎵 Ready to provide song lyrics and chords!`);
    console.log(`🌐 Web search capabilities enabled! v2.0`);
    
    // Auto-discover popular songs on startup (optional)
    // setTimeout(autoDiscoverSongs, 5000); // Uncomment to enable auto-discovery
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Simple song search - any message that doesn't start with ! is treated as song search
    if (!message.content.startsWith('!')) {
        const songTitle = message.content.trim();
        
        if (songTitle.length > 0) {
            // Show searching indicator
            const searchMessage = await message.reply('🔍 Searching for your song... (checking local database and web sources)');
            
            try {
                // Search for the song (now includes web search)
                const song = await searchSong(songTitle);
                
                if (song) {
                    // Update search message
                    await searchMessage.edit('📄 Found song! Generating PDF...');
                    
                    // Generate PDF
                    const pdfPath = await generatePDF(song);
                    
                    // Create attachment
                    const attachment = new AttachmentBuilder(pdfPath, {
                        name: `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                    });
                    
                    // Prepare response message
                    let responseContent = `🎵 **${song.title}** by ${song.artist}\n\n📄 Here's your PDF with lyrics and chords!\n✨ Format: 2 columns, bold title, 11pt font`;
                    
                    // Add source information if it's a web result
                    if (song.isWebResult) {
                        responseContent += `\n\n� **Source**: Found on ${song.source}`;
                        if (song.disclaimer) {
                            responseContent += `\n⚠️ **Note**: ${song.disclaimer}`;
                        }
                    }
                    
                    // Send response with lyrics preview and PDF
                    await message.reply({
                        content: responseContent,
                        files: [attachment]
                    });
                    
                    // Delete search message
                    await searchMessage.delete();
                    
                    // Clean up generated file after sending
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(pdfPath);
                        } catch (err) {
                            console.log('Could not delete temp file:', err.message);
                        }
                    }, 5000);
                    
                } else {
                    // Try to get suggestions
                    const suggestions = await getSongSuggestions(songTitle);
                    
                    let responseMessage = `❌ Sorry, I couldn't find "${songTitle}" in my database or on the web.\n\n💡 **Suggestions:**\n`;
                    
                    if (suggestions.length > 0) {
                        responseMessage += suggestions.slice(0, 3).map(s => `• ${s}`).join('\n');
                        responseMessage += `\n\n� Try searching with more specific terms like "artist - song title"`;
                    } else {
                        responseMessage += `• Try being more specific with artist name\n• Check spelling\n• Use format: "Artist - Song Title"`;
                    }
                    
                    await searchMessage.edit(responseMessage);
                }
                
            } catch (error) {
                console.error('Error processing song request:', error);
                await searchMessage.edit('❌ Sorry, there was an error processing your request. Please try again!');
            }
        }
    }
    
    // Help command
    if (message.content === '!help') {
        await message.reply({
            content: `🎵 **Discord Song Bot Help** 🎵\n\n` +
                    `📝 **How to use:**\n` +
                    `• Just type any song title to search\n` +
                    `• Example: \`Blinding Lights\`\n` +
                    `• Example: \`The Weeknd - Blinding Lights\`\n` +
                    `• Example: \`Wonderwall Oasis\`\n\n` +
                    `🌐 **Search Sources:**\n` +
                    `• Local database (fastest)\n` +
                    `• Web search (automatic)\n` +
                    `• Popular songs cache\n\n` +
                    `📄 **PDF Features:**\n` +
                    `• 2-column layout\n` +
                    `• Bold song titles\n` +
                    `• 11pt font size\n` +
                    `• Lyrics with chords\n` +
                    `• Ready to download\n\n` +
                    `❓ **Commands:**\n` +
                    `• \`!help\` - Show this help message\n` +
                    `• \`!list\` - Show available songs\n` +
                    `• \`!discover\` - Auto-discover popular songs\n\n` +
                    `⚠️ **Legal Notice:**\n` +
                    `Web-sourced lyrics are for educational/personal use. Ensure proper rights for commercial distribution.`
        });
    }
    
    // List available songs
    if (message.content === '!list') {
        const { getAllSongs } = require('./songDatabase');
        const songs = getAllSongs();
        
        if (songs.length > 0) {
            const localSongs = songs.filter(s => !s.cached);
            const cachedSongs = songs.filter(s => s.cached);
            
            let songList = `🎵 **Available Songs** (${songs.length} total):\n\n`;
            
            if (localSongs.length > 0) {
                songList += `**📁 Local Database:**\n`;
                songList += localSongs.map(song => `• **${song.title}** by ${song.artist}`).join('\n');
                songList += '\n\n';
            }
            
            if (cachedSongs.length > 0) {
                songList += `**� Web Cache:**\n`;
                songList += cachedSongs.slice(0, 10).map(song => `• **${song.title}** by ${song.artist}`).join('\n');
                if (cachedSongs.length > 10) {
                    songList += `\n• ... and ${cachedSongs.length - 10} more`;
                }
            }
            
            songList += `\n\n💡 Just type the song title to get lyrics and PDF!`;
            
            await message.reply({ content: songList });
        } else {
            await message.reply('📝 No songs available yet. Try searching for a song to add it to the cache!');
        }
    }
    
    // Manual discovery command
    if (message.content === '!discover') {
        const discoveryMessage = await message.reply('🔍 Discovering popular songs from the web...');
        
        try {
            await autoDiscoverSongs();
            await discoveryMessage.edit('✅ Auto-discovery complete! New songs have been added to the cache. Use `!list` to see them.');
        } catch (error) {
            console.error('Discovery error:', error);
            await discoveryMessage.edit('❌ Error during auto-discovery. Please try again later.');
        }
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
