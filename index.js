const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const https = require('https');
const http = require('http');
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

// User conversation state tracking
const userStates = new Map();

// Function to handle .txt file attachments
async function handleTxtFile(message, attachment) {
    const statusMsg = await message.reply('📎 Processing .txt file...');
    
    try {
        // Download file content
        const fileContent = await downloadFileContent(attachment.url);
        
        if (!fileContent || fileContent.trim().length === 0) {
            await statusMsg.edit('❌ File is empty or could not be read.');
            return;
        }
        
        console.log(`📄 File content length: ${fileContent.length} characters`);
        
        // Check if content looks like lyrics
        if (!manualProcessor.looksLikeLyrics(fileContent)) {
            await statusMsg.edit('❌ File content doesn\'t look like song lyrics. Please upload a .txt file with complete lyrics and chords.');
            return;
        }
        
        // Store file content and start conversation flow for title/artist
        const userId = message.author.id;
        const lyricsLines = fileContent.split('\n').filter(line => line.trim().length > 0);
        
        userStates.set(userId, {
            step: 'waiting_for_title',
            lyricsLines: lyricsLines,
            songTitle: null,
            artistName: null,
            isFromFile: true,
            fileName: attachment.name
        });
        
        await statusMsg.edit(`✅ **Lyrics loaded from ${attachment.name}!** Found ${lyricsLines.length} lines.\n\n🎵 Please enter the **song title**:`);
        
        console.log(`✅ Successfully loaded .txt file: ${attachment.name}`);
        
    } catch (error) {
        console.error('❌ Error processing .txt file:', error);
        await statusMsg.edit(`❌ Error processing file: ${error.message}`);
    }
}

// Function to download file content from URL
function downloadFileContent(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        client.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }
            
            let data = '';
            response.setEncoding('utf8');
            
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve(data);
            });
            
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Bot ready event
client.once('ready', async () => {
    console.log(`✅ Bot ONLINE: ${client.user.tag}`);
    console.log(`🎵 SINGLE INSTANCE - MANUAL LYRICS ONLY - v5.2.0`);
    console.log(`📰 Microsoft Word-Style Columns`);
    console.log(`📎 .txt File Support Enabled`);
    console.log(`❌ NO URL PROCESSING`);
    console.log(`❌ NO WEB SEARCH FUNCTIONALITY`);
    console.log(`🔥 REPLIT DEPLOYMENT ACTIVE`);
});

// Message handler
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const input = message.content.trim();
    
    // Check for .txt file attachments first
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (attachment.name.toLowerCase().endsWith('.txt')) {
                console.log(`📎 Processing .txt file: ${attachment.name}`);
                await handleTxtFile(message, attachment);
                return;
            }
        }
    }
    
    // Cancel command - to cancel current conversation
    if (input === '!cancel') {
        const userId = message.author.id;
        if (userStates.has(userId)) {
            userStates.delete(userId);
            await message.reply('✅ **Cancelled current song processing.** You can start over by pasting new lyrics!');
        } else {
            await message.reply('❌ **No active song processing to cancel.**');
        }
        return;
    }

    // Help command
    if (input === '!help') {
        await message.reply({
            content: `🎵 **Song Bot v5.1.0** - Microsoft Word-Style Columns 🎵\n\n` +
                    `✅ **HOW IT WORKS:**\n` +
                    `1. Paste lyrics or upload .txt file\n` +
                    `2. Bot will ask for song title\n` +
                    `3. Bot will ask for artist name\n` +
                    `4. Get your professional PDF!\n\n` +
                    `📰 **FEATURES:**\n` +
                    `• Word-Style Columns (left to right flow)\n` +
                    `• Bold chords and section headers\n` +
                    `• Custom title and artist on PDF\n` +
                    `• 3 lines spacing between sections\n\n` +
                    `✅ **WORKS WITH:**\n` +
                    `• Pasted Lyrics: Full song with chords\n` +
                    `• .txt Files: Upload lyrics file\n\n` +
                    `❌ **DOES NOT WORK:**\n` +
                    `• URLs (disabled for security)\n` +
                    `• Song title searches\n` +
                    `• Artist searches\n` +
                    `• Any web searching\n\n` +
                    `💡 **Just paste lyrics and follow the prompts!**`
        });
        return;
    }

    // Version check command
    if (input === '!version') {
        await message.reply(`🤖 Bot Version: 5.2.0\n📰 Microsoft Word-Style Columns\n📎 .txt File Support\n🎵 Custom Song Title & Artist Input\nTimestamp: ${new Date().toISOString()}`);
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
        const userId = message.author.id;
        const userState = userStates.get(userId);
        
        // Handle conversation flow for song info
        if (userState) {
            if (userState.step === 'waiting_for_title') {
                userState.songTitle = input.trim();
                userState.step = 'waiting_for_artist';
                userStates.set(userId, userState);
                
                await message.reply(`✅ Song title: **"${userState.songTitle}"**\n\n🎤 Now please enter the **artist name**:`);
                return;
            }
            else if (userState.step === 'waiting_for_artist') {
                userState.artistName = input.trim();
                userState.step = 'processing';
                userStates.set(userId, userState);
                
                // Now process the lyrics with the provided title and artist
                const statusMsg = await message.reply(`✅ Artist: **${userState.artistName}**\n\n📄 Generating PDF for **"${userState.songTitle}"** by **${userState.artistName}**...`);
                
                try {
                    // Create custom song object with user-provided title and artist
                    const customSong = {
                        title: userState.songTitle,
                        artist: userState.artistName,
                        lyrics: userState.lyricsLines
                    };
                    
                    const pdfPath = await generatePDF(customSong);
                    const attachment = new AttachmentBuilder(pdfPath, {
                        name: `${customSong.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                    });
                    
                    await message.reply({
                        content: `🎵 **${customSong.title}** by **${customSong.artist}**\n📄 Here's your PDF!`,
                        files: [attachment]
                    });
                    
                    await statusMsg.delete();
                    
                    setTimeout(() => {
                        try { fs.unlinkSync(pdfPath); } catch (e) {}
                    }, 5000);
                    
                } catch (error) {
                    console.error('❌ PDF generation error:', error);
                    await statusMsg.edit('❌ Error generating PDF!');
                }
                
                // Clear user state
                // Prompt for chord transposition
                userState.step = 'waiting_for_transpose_option';
                userStates.set(userId, userState);
                await message.reply('🔄 Would you like to transpose the chords?\n- Reply with a target key (e.g., C, D, E, F, G, A, B)\n- Or reply with "+1" or "-1" to transpose up/down by a half step\n- Or type "no" to skip.');
                return;
            }
            else if (userState.step === 'waiting_for_transpose_option') {
                const option = input.trim().toUpperCase();
                if (option === 'NO' || option === 'N') {
                    await message.reply('✅ Transposition skipped. Enjoy your PDF!');
                    userStates.delete(userId);
                    return;
                }
                // Chromatic half step up/down (always use chromatic logic)
                if (option === '+1' || option === '-1') {
                    const steps = option === '+1' ? 1 : -1;
                    const { transposeChordLineBySteps } = require('./chordTranspose');
                    const transposedLyrics = userState.lyricsLines.map(line => {
                        return transposeChordLineBySteps(line, steps);
                    });
                    const transposedSong = {
                        title: userState.songTitle,
                        artist: userState.artistName,
                        lyrics: transposedLyrics
                    };
                    const statusMsg = await message.reply(`🎼 Chromatic transposition ${steps > 0 ? 'up' : 'down'} by a half step...`);
                    try {
                        const pdfPath = await generatePDF(transposedSong);
                        const attachment = new AttachmentBuilder(pdfPath, {
                            name: `${transposedSong.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                        });
                        await message.reply({
                            content: `🎵 **${transposedSong.title}** by **${transposedSong.artist}**\n📄 Here's your chromatically transposed PDF!`,
                            files: [attachment]
                        });
                        await statusMsg.delete();
                        setTimeout(() => {
                            try { fs.unlinkSync(pdfPath); } catch (e) {}
                        }, 5000);
                    } catch (error) {
                        console.error('❌ Transposed PDF generation error:', error);
                        await statusMsg.edit('❌ Error generating transposed PDF!');
                    }
                    userStates.delete(userId);
                    return;
                }
                // Key-based transposition
                const validKeys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','DB','EB','GB','AB','BB'];
                if (!validKeys.includes(option)) {
                    await message.reply('❌ Invalid option. Please reply with a valid key (C, D, E, F, G, A, B, etc.), "+1"/"-1" for half step, or "no" to skip.');
                    return;
                }
                // Ask for original key
                userState.step = 'waiting_for_original_key';
                userState.targetKey = option;
                userStates.set(userId, userState);
                await message.reply('🎼 What is the original key of the song? (e.g., C, D, E, F, G, A, B)');
                return;
            }
            else if (userState.step === 'waiting_for_original_key') {
                const fromKey = input.trim().toUpperCase();
                const validKeys = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','DB','EB','GB','AB','BB'];
                if (!validKeys.includes(fromKey)) {
                    await message.reply('❌ Invalid key. Please reply with a valid key (C, D, E, F, G, A, B, etc.).');
                    return;
                }
                // Transpose all chord lines
                const { transposeChordLine } = require('./chordTranspose');
                const transposedLyrics = userState.lyricsLines.map(line => {
                    // Only transpose chord lines
                    const { isChordLine } = require('./pdfGenerator');
                    if (isChordLine(line)) {
                        return transposeChordLine(line, fromKey, userState.targetKey);
                    }
                    return line;
                });
                // Generate transposed PDF
                const transposedSong = {
                       title: userState.songTitle,
                    artist: userState.artistName,
                    lyrics: transposedLyrics
                };
                const statusMsg = await message.reply(`🎼 Transposing chords from ${fromKey} to ${userState.targetKey}...`);
                try {
                    const pdfPath = await generatePDF(transposedSong);
                    const attachment = new AttachmentBuilder(pdfPath, {
                        name: `${transposedSong.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
                    });
                    await message.reply({
                        content: `🎵 **${transposedSong.title}** by **${transposedSong.artist}**\n📄 Here's your transposed PDF!`,
                        files: [attachment]
                    });
                    await statusMsg.delete();
                    setTimeout(() => {
                        try { fs.unlinkSync(pdfPath); } catch (e) {}
                    }, 5000);
                } catch (error) {
                    console.error('❌ Transposed PDF generation error:', error);
                    await statusMsg.edit('❌ Error generating transposed PDF!');
                }
                userStates.delete(userId);
                return;
            }
        }
        
        // Initial lyrics processing - check if it looks like lyrics
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
            
            // Lyrics look good - now ask for song title and artist
            const lyricsLines = input.split('\n').filter(line => line.trim().length > 0);
            
            // Store lyrics and start conversation flow
            userStates.set(userId, {
                step: 'waiting_for_title',
                lyricsLines: lyricsLines,
                songTitle: null,
                artistName: null
            });
            
            await statusMsg.edit(`✅ **Lyrics received!** Found ${lyricsLines.length} lines.\n\n🎵 Please enter the **song title**:`);
            
        } catch (error) {
            console.error('❌ Processing error:', error);
            await statusMsg.edit('❌ Error processing your input!');
        }
    }
});


// Express keep-alive web server for UptimeRobot
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot is alive!'));
app.listen(3000, () => console.log('Web server running on port 3000'));

client.login(process.env.DISCORD_TOKEN);
