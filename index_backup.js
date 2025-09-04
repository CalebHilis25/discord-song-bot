const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
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

// Initialize manual input processor
const manualProcessor = new ManualInputProcessor();

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`🎵 Ready to process URLs and pasted lyrics!`);
    console.log(`🚫 Manual Input ONLY Mode - No web searching! v4.0`);
});

// Message handler
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Process input - any message that doesn't start with ! is treated as potential content
    if (!message.content.startsWith('!')) {
        const userInput = message.content.trim();
        
        if (userInput.length > 0) {
            // Show processing indicator
            const searchMessage = await message.reply('🔍 Processing your input... (checking for URLs or pasted lyrics)');
            
            try {
                console.log('📥 User input received:', userInput);
                console.log('🔍 Input length:', userInput.length);
                console.log('🌐 Is URL?', userInput.startsWith('http'));
                
                // ONLY try manual input processing (URLs or pasted lyrics) - NO WEB SEARCH
                let song = await manualProcessor.processUserInput(userInput, searchMessage);
                
                if (song) {
                    // Update search message
                    await searchMessage.edit('📄 Found content! Generating PDF...');
                    
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
                    
                    // Send response with PDF
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
                    // No manual input detected - provide clear instructions
                    let responseMessage = `❌ I can only process:\n\n` +
                        `🔗 **URLs**: Paste a link to chord/lyrics websites\n` +
                        `📝 **Complete Lyrics**: Paste the full song with chords\n\n` +
                        `**Examples:**\n` +
                        `• \`https://tabs.ultimate-guitar.com/tab/artist/song\`\n` +
                        `• Paste complete lyrics like:\n\`\`\`\n[Verse 1]\nG    D\nAmazing grace\nAm   C\nHow sweet...\`\`\`\n\n` +
                        `❌ **I no longer search by song title** - you must provide the actual content!`;
                    
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
        const version = require('./package.json').version;
        const timestamp = new Date().toISOString().split('T')[0]; // Just date, not full timestamp
        
        await message.reply({
            content: `🎵 **Discord Song Bot Help** v${version} 🎵\n` +
                    `*Last updated: ${timestamp}*\n\n` +
                    `📝 **How to use (2 methods only):**\n\n` +
                    `🔗 **Method 1: Paste URL**\n` +
                    `• Copy link from Ultimate Guitar, ChordU, etc.\n` +
                    `• Example: \`https://tabs.ultimate-guitar.com/tab/artist/song\`\n\n` +
                    `📝 **Method 2: Paste Complete Lyrics**\n` +
                    `• Copy the full song with chords from any source\n` +
                    `• Example:\n\`\`\`[Verse 1]\nG                D\nAmazing grace how sweet\nAm               C\nThe sound that saved...\`\`\`\n\n` +
                    `❌ **No longer supported:**\n` +
                    `• Song title searches\n` +
                    `• Artist searches\n` +
                    `• Web searching by name\n\n` +
                    `📄 **PDF Features:**\n` +
                    `• 2-column layout\n` +
                    `• Bold song titles\n` +
                    `• 11pt font size\n` +
                    `• Perfect chord formatting\n\n` +
                    `❓ **Commands:**\n` +
                    `• \`!help\` - Show this help\n` +
                    `• \`!test <url>\` - Test URL detection\n\n` +
                    `⚠️ **Legal Notice:**\n` +
                    `User-provided content responsibility lies with the user.`
        });
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
