const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { searchSong, autoDiscoverSongs, getSongSuggestions } = require('./songDatabase');
const { generatePDF } = require('./pdfGenerator');
const { ManualInputProcessor } = require('./manualInputProcessor');

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize manual input processor
const manualProcessor = new ManualInputProcessor();

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`🎵 Ready to provide song lyrics and chords!`);
    console.log(`🌐 Enhanced with manual input & URL processing! v3.0`);
    
    // Auto-discover popular songs on startup (optional)
    // setTimeout(autoDiscoverSongs, 5000); // Uncomment to enable auto-discovery
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Simple song search - any message that doesn't start with ! is treated as song search
    if (!message.content.startsWith('!')) {
        const userInput = message.content.trim();
        
        if (userInput.length > 0) {
            // Show searching indicator
            const searchMessage = await message.reply('🔍 Processing your input... (checking for URLs, lyrics, or song titles)');
            
            try {
                console.log('📥 User input received:', userInput);
                console.log('🔍 Input length:', userInput.length);
                console.log('🌐 Is URL?', userInput.startsWith('http'));
                
                // First try manual input processing (URLs or pasted lyrics)
                let song = await manualProcessor.processUserInput(userInput, searchMessage);
                
                // If not manual input, try regular song search
                if (!song) {
                    await searchMessage.edit('🔍 Searching for your song... (checking local database and web sources)');
                    song = await searchSong(userInput);
                }
                
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
                    
                    // Add source information
                    if (song.isWebResult) {
                        responseContent += `\n\n🌐 **Source**: Found on ${song.source}`;
                        if (song.disclaimer) {
                            responseContent += `\n⚠️ **Note**: ${song.disclaimer}`;
                        }
                    }
                    
                    if (song.isManualInput) {
                        responseContent += `\n\n📝 **Source**: User-provided content`;
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
                    const suggestions = await getSongSuggestions(userInput);
                    
                    let responseMessage = `❌ Sorry, I couldn't find "${userInput}" in my database or on the web.\n\n💡 **Try these options:**\n`;
                    
                    if (suggestions.length > 0) {
                        responseMessage += suggestions.slice(0, 3).map(s => `• ${s}`).join('\n');
                        responseMessage += `\n\n🔗 **Or try:**\n• Paste the full lyrics with chords directly\n• Share a URL to the song lyrics\n• Use format: "Artist - Song Title"`;
                    } else {
                        responseMessage += `• Search more specifically: "Artist - Song Title"\n• **Paste the full lyrics/chords directly**\n• **Share a URL to the song lyrics**\n• Check spelling and try again`;
                    }
                    
                    await searchMessage.edit(responseMessage);
                }
                
            } catch (error) {
                console.error('Error processing user input:', error);
                await searchMessage.edit('❌ Sorry, there was an error processing your request. Please try again!');
            }
        }
    }
    
    // Help command
    if (message.content === '!help') {
        await message.reply({
            content: `🎵 **Discord Song Bot Help** 🎵\n\n` +
                    `📝 **How to use:**\n` +
                    `• **Type a song title**: \`Blinding Lights\`\n` +
                    `• **Paste full lyrics & chords**: Copy/paste complete song content\n` +
                    `• **Share a URL**: Link to lyrics websites\n` +
                    `• **Specify artist**: \`The Weeknd - Blinding Lights\`\n\n` +
                    `🔗 **New Features:**\n` +
                    `• **URL Processing**: Paste links to chord/lyrics sites\n` +
                    `• **Manual Input**: Paste complete lyrics with chords\n` +
                    `• **Auto-Format**: Bot extracts title/artist automatically\n` +
                    `• **Smart Detection**: Recognizes URLs vs lyrics vs song titles\n\n` +
                    `🌐 **Search Sources:**\n` +
                    `• Manual input (most reliable)\n` +
                    `• URL content extraction\n` +
                    `• Local database\n` +
                    `• Web search\n\n` +
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
                    `User-provided content responsibility lies with the user. Ensure proper rights for distribution.`
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
                songList += `**🌐 Web Cache:**\n`;
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

    // Test URL processing command
    if (message.content.startsWith('!test ')) {
        const testURL = message.content.replace('!test ', '').trim();
        const testMessage = await message.reply(`🧪 Testing URL processing for: ${testURL}`);
        
        try {
            const isURL = manualProcessor.isURL(testURL);
            await testMessage.edit(`🧪 URL Detection: ${isURL ? '✅ Valid URL' : '❌ Not detected as URL'}\nInput: ${testURL}`);
        } catch (error) {
            await testMessage.edit(`❌ Test error: ${error.message}`);
        }
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
