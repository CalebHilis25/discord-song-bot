const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

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

// Initialize processors
const manualProcessor = new ManualInputProcessor();

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot ONLINE: ${client.user.tag}`);
    console.log(`🎵 SINGLE INSTANCE - MANUAL LYRICS ONLY - v5.0.0`);
    console.log(`� LYRICS PASTING ONLY`);
    console.log(`❌ NO URL PROCESSING`);
    console.log(`❌ NO WEB SEARCH FUNCTIONALITY`);
    console.log(`🚫 LOCAL BOT STOPPED - RAILWAY ONLY`);
});

// Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const input = message.content.trim();
    
    // Help command
    if (input === '!help') {
        await message.reply({
            content: `🎵 **Song Bot v5.0.0** - Manual Lyrics Only 🎵\n\n` +
                    `✅ **WORKS WITH:**\n` +
                    ` Pasted Lyrics: Full song with chords\n\n` +
                    `❌ **DOES NOT WORK:**\n` +
                    `• URLs (disabled for security)\n` +
                    `• Song titles (like "Wonderwall")\n` +
                    `• Artist searches\n` +
                    `• Any web searching\n\n` +
                    `📄 **Output:** 2-column PDF with chords\n\n` +
                    `💡 **Just paste complete lyrics with chords!**`
        });
        return;
    }

    // Version check command
    if (input === '!version') {
        await message.reply(`🤖 Bot Version: 5.0.0\nMode: Manual Lyrics Only\nTimestamp: ${new Date().toISOString()}`);
        return;
    }

    // Test lyrics processing command
    if (input.startsWith('!test ')) {
        const testInput = input.replace('!test ', '');
        const testMsg = await message.reply('🧪 Testing...');
        
        try {
            const isLyrics = manualProcessor.looksLikeLyrics(testInput);
            
            let result = `🧪 **Test Results:**\n` +
                        `Input: \`${testInput.substring(0, 50)}...\`\n` +
                        `Lyrics Detection: ${isLyrics ? '✅' : '❌'}\n\n`;
            
            if (isLyrics) {
                result += `� **Attempting lyrics processing...**\n`;
                await testMsg.edit(result + `Status: Processing lyrics...`);
                
                const song = await manualProcessor.processLyricsText(testInput, testMsg);
                if (song) {
                    result += `✅ **SUCCESS!** Processed: ${song.title} by ${song.artist}`;
                } else {
                    result += `❌ **FAILED** to process lyrics text`;
                }
            } else {
                result += `❌ **Input doesn't look like lyrics.** Please paste complete song lyrics with chords.`;
            }
            
            await testMsg.edit(result);
        } catch (error) {
            await testMsg.edit(`❌ Test error: ${error.message}`);
        }
        return;
    }

    // Main processing - LYRICS ONLY
    if (!input.startsWith('!') && input.length > 0) {
        const statusMsg = await message.reply('🔄 Processing lyrics...');
        
        try {
            console.log(`📥 Processing lyrics input: ${input.substring(0, 100)}...`);
            
            // Check if input looks like lyrics
            if (!manualProcessor.looksLikeLyrics(input)) {
                await statusMsg.edit(
                    `❌ **This doesn't look like song lyrics!**\n\n` +
                    `✅ **Please paste:**\n` +
                    `• Complete song lyrics with chords\n` +
                    `• Multiple lines of text\n` +
                    `• Verse/Chorus structure\n\n` +
                    `❌ **URLs are disabled for security reasons**\n` +
                    `❌ **Song titles won't work - paste full lyrics!**`
                );
                return;
            }
            
            const song = await manualProcessor.processLyricsText(input, statusMsg);
            
            if (song) {
                await statusMsg.edit('📄 Generating PDF...');
                
                const pdfPath = await generatePDF(song);
                const attachment = new AttachmentBuilder(pdfPath, {
                    name: `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                });
                
                await message.reply({
                    content: `🎵 **${song.title}** by ${song.artist}\n📄 Here's your PDF!`,
                    files: [attachment]
                });
                
                await statusMsg.delete();
                
                setTimeout(() => {
                    try { fs.unlinkSync(pdfPath); } catch (e) {}
                }, 5000);
                
            } else {
                await statusMsg.edit(
                    `❌ **Can't process this input!**\n\n` +
                    `✅ **Try:**\n` +
                    `• Paste complete lyrics with chords\n` +
                    `• Include verse/chorus structure\n` +
                    `• Make sure it's actual song lyrics\n\n` +
                    `❌ **Won't work:**\n` +
                    `• URLs (disabled)\n` +
                    `• Song titles like "Wonderwall"\n` +
                    `• Artist names\n` +
                    `• Short text snippets`
                );
            }
            
        } catch (error) {
            console.error('❌ Processing error:', error);
            await statusMsg.edit('❌ Error processing your input!');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
