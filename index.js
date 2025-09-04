const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { searchSong } = require('./songDatabase');
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
client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`🎵 Ready to provide song lyrics and chords!`);
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Simple song search - any message that doesn't start with ! is treated as song search
    if (!message.content.startsWith('!')) {
        const songTitle = message.content.trim();
        
        if (songTitle.length > 0) {
            try {
                // Search for the song
                const song = searchSong(songTitle);
                
                if (song) {
                    // Generate PDF
                    const pdfPath = await generatePDF(song);
                    
                    // Create attachment
                    const attachment = new AttachmentBuilder(pdfPath, {
                        name: `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                    });
                    
                    // Send response with lyrics preview and PDF
                    await message.reply({
                        content: `🎵 **${song.title}** by ${song.artist}\n\n` +
                                `📄 Here's your PDF with lyrics and chords!\n` +
                                `✨ Format: 2 columns, bold title, 11pt font`,
                        files: [attachment]
                    });
                    
                    // Clean up generated file after sending
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(pdfPath);
                        } catch (err) {
                            console.log('Could not delete temp file:', err.message);
                        }
                    }, 5000);
                    
                } else {
                    await message.reply(`❌ Sorry, I couldn't find "${songTitle}" in my database.\n\n` +
                                       `💡 Try searching for popular songs or check the spelling!`);
                }
                
            } catch (error) {
                console.error('Error processing song request:', error);
                await message.reply('❌ Sorry, there was an error processing your request. Please try again!');
            }
        }
    }
    
    // Help command
    if (message.content === '!help') {
        await message.reply({
            content: `🎵 **Discord Song Bot Help** 🎵\n\n` +
                    `📝 **How to use:**\n` +
                    `• Just type any song title to search\n` +
                    `• Example: \`Wonderwall\`\n` +
                    `• Example: \`Bohemian Rhapsody\`\n\n` +
                    `📄 **PDF Features:**\n` +
                    `• 2-column layout\n` +
                    `• Bold song titles\n` +
                    `• 11pt font size\n` +
                    `• Lyrics with chords\n` +
                    `• Ready to download\n\n` +
                    `❓ **Commands:**\n` +
                    `• \`!help\` - Show this help message\n` +
                    `• \`!list\` - Show available songs`
        });
    }
    
    // List available songs
    if (message.content === '!list') {
        const { getAllSongs } = require('./songDatabase');
        const songs = getAllSongs();
        
        if (songs.length > 0) {
            const songList = songs.map(song => `• **${song.title}** by ${song.artist}`).join('\n');
            await message.reply({
                content: `🎵 **Available Songs** (${songs.length} total):\n\n${songList}\n\n` +
                        `💡 Just type the song title to get lyrics and PDF!`
            });
        } else {
            await message.reply('📝 No songs available yet. Add some songs to the database!');
        }
    }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
