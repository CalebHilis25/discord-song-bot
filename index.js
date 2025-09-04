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
    console.log(`🎵 SINGLE INSTANCE - MANUAL INPUT ONLY - v4.0.0`);
    console.log(`🔗 URL + Lyrics Processing ONLY`);
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
            content: `🎵 **Song Bot v4.0.0** - Manual Input Only 🎵\n\n` +
                    `✅ **WORKS WITH:**\n` +
                    `🔗 URLs: \`https://tabs.ultimate-guitar.com/...\`\n` +
                    `📝 Pasted Lyrics: Full song with chords\n\n` +
                    `❌ **DOES NOT WORK:**\n` +
                    `• Song titles (like "Wonderwall")\n` +
                    `• Artist searches\n` +
                    `• Any web searching\n\n` +
                    `📄 **Output:** 2-column PDF with chords\n\n` +
                    `💡 **Just paste URL or complete lyrics!**`
        });
        return;
    }

    // Version check command
    if (input === '!version') {
        await message.reply(`🤖 Bot Version: 4.0.0\nMode: Manual Input Only\nTimestamp: ${new Date().toISOString()}`);
        return;
    }

    // Test command
    if (input.startsWith('!test ')) {
        const testInput = input.replace('!test ', '');
        const isURL = manualProcessor.isURL(testInput);
        const isLyrics = manualProcessor.looksLikeLyrics(testInput);
        
        await message.reply(`🧪 **Test Results:**\n` +
                           `Input: \`${testInput.substring(0, 50)}...\`\n` +
                           `URL Detection: ${isURL ? '✅' : '❌'}\n` +
                           `Lyrics Detection: ${isLyrics ? '✅' : '❌'}`);
        return;
    }

    // Main processing
    if (!input.startsWith('!') && input.length > 0) {
        const statusMsg = await message.reply('🔄 Processing...');
        
        try {
            console.log(`📥 Processing input: ${input.substring(0, 100)}...`);
            
            const song = await manualProcessor.processUserInput(input, statusMsg);
            
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
                    `• Paste a URL: \`https://tabs.ultimate-guitar.com/...\`\n` +
                    `• Paste complete lyrics with chords\n\n` +
                    `❌ **Won't work:**\n` +
                    `• Song titles like "Wonderwall"\n` +
                    `• Artist names\n` +
                    `• Searching by name`
                );
            }
            
        } catch (error) {
            console.error('❌ Processing error:', error);
            await statusMsg.edit('❌ Error processing your input!');
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
