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

    // Debug HTML structure
    if (input.startsWith('!debhtml')) {
        const url = input.replace('!debhtml', '').trim() || 'https://arkjuander.com/lyrics-and-chords/one-thing-hillsong-worship';
        const testMsg = await message.reply(`🔍 **Debugging HTML Structure**\n\nURL: ${url}\nStatus: Fetching...`);
        
        try {
            const content = await manualProcessor.fetchURLContent(url);
            if (content) {
                // Find all div classes
                const divMatches = content.match(/<div[^>]*class="[^"]*"[^>]*>/g) || [];
                const classes = divMatches.map(div => {
                    const classMatch = div.match(/class="([^"]*)"/);
                    return classMatch ? classMatch[1] : 'no-class';
                }).slice(0, 20); // Limit to first 20
                
                // Look for song-area specifically
                const songAreaMatches = content.match(/song-area/gi) || [];
                
                let result = `**Div Classes Found (first 20):**\n`;
                result += classes.map(cls => `• ${cls}`).join('\n');
                result += `\n\n**Song-area matches:** ${songAreaMatches.length}`;
                
                if (songAreaMatches.length > 0) {
                    const songAreaContext = content.match(/.{0,100}song-area.{0,100}/gi);
                    result += `\n\n**Song-area context:**\n${songAreaContext?.[0] || 'Not found'}`;
                }
                
                await testMsg.edit(result);
            } else {
                await testMsg.edit('❌ Could not fetch content');
            }
        } catch (error) {
            await testMsg.edit(`❌ Error: ${error.message}`);
        }
        return;
    }

    // Simple network test
    if (input.startsWith('!testnet')) {
        const testMsg = await message.reply('🌐 Testing network connectivity...');
        
        try {
            const https = require('https');
            const testUrl = 'https://httpbin.org/get';
            
            const result = await new Promise((resolve, reject) => {
                const req = https.request(testUrl, { timeout: 10000 }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data));
                });
                req.on('error', reject);
                req.on('timeout', () => reject(new Error('Timeout')));
                req.end();
            });
            
            await testMsg.edit(`✅ Network connectivity OK!\nResponse length: ${result.length} chars`);
        } catch (error) {
            await testMsg.edit(`❌ Network test failed: ${error.message}`);
        }
        return;
    }

    // Test URL processing specifically
    if (input.startsWith('!testurl')) {
        const url = input.replace('!testurl', '').trim() || 'https://arkjuander.com/lyrics-and-chords/one-thing-hillsong-worship';
        const testMsg = await message.reply(`🧪 **Testing URL Processing**\n\nURL: ${url}\nStatus: Starting test...`);
        
        try {
            console.log('🧪 Starting URL test with:', url);
            
            // Test URL detection
            const isURL = manualProcessor.isURL(url);
            let result = `URL Detection: ${isURL ? '✅' : '❌'}\n\n`;
            
            if (isURL) {
                result += `🔗 **Step 1: URL Detection** ✅\n`;
                await testMsg.edit(result + `🌐 **Step 2: Fetching content...**`);
                
                // Test content fetching directly
                try {
                    const content = await manualProcessor.fetchURLContent(url);
                    if (content && content.length > 0) {
                        result += `📄 **Step 2: Content Fetch** ✅ (${content.length} chars)\n`;
                        await testMsg.edit(result + `🔍 **Step 3: Extracting lyrics...**`);
                        
                        // Test song extraction
                        const song = await manualProcessor.extractSongInfoFromHTML(content, url);
                        if (song) {
                            result += `🎵 **Step 3: Lyrics Extraction** ✅\n`;
                            result += `**Title:** ${song.title}\n`;
                            result += `**Artist:** ${song.artist}\n`;
                            result += `**Lines:** ${song.lyrics?.length || 0}\n`;
                            result += `**Sample:** ${song.lyrics?.slice(0, 2)?.join(' | ') || 'None'}`;
                        } else {
                            result += `🎵 **Step 3: Lyrics Extraction** ❌\n`;
                            result += `Content preview: ${content.substring(0, 200)}...`;
                        }
                    } else {
                        result += `📄 **Step 2: Content Fetch** ❌ (Empty response)`;
                    }
                } catch (fetchError) {
                    result += `📄 **Step 2: Content Fetch** ❌\n`;
                    result += `**Error:** ${fetchError.message}`;
                }
            } else {
                result += `❌ URL not recognized as supported site`;
            }
            
            await testMsg.edit(result);
        } catch (error) {
            console.error('URL Test Error:', error);
            await testMsg.edit(`❌ Test error: ${error.message}`);
        }
        return;
    }

    // Test URL processing command
    if (input.startsWith('!test ')) {
        const testInput = input.replace('!test ', '');
        const testMsg = await message.reply('🧪 Testing...');
        
        try {
            const isURL = manualProcessor.isURL(testInput);
            const isLyrics = manualProcessor.looksLikeLyrics(testInput);
            
            let result = `🧪 **Test Results:**\n` +
                        `Input: \`${testInput.substring(0, 50)}...\`\n` +
                        `URL Detection: ${isURL ? '✅' : '❌'}\n` +
                        `Lyrics Detection: ${isLyrics ? '✅' : '❌'}\n\n`;
            
            if (isURL) {
                result += `🔗 **Attempting URL processing...**\n`;
                await testMsg.edit(result + `Status: Processing URL...`);
                
                const song = await manualProcessor.processUserInput(testInput, testMsg);
                if (song) {
                    result += `✅ **SUCCESS!** Extracted: ${song.title} by ${song.artist}`;
                } else {
                    result += `❌ **FAILED** to extract content from URL`;
                }
            }
            
            await testMsg.edit(result);
        } catch (error) {
            await testMsg.edit(`❌ Test error: ${error.message}`);
        }
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
