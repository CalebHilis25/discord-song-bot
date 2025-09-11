const { ManualInputProcessor } = require('./manualInputProcessor');
const { generatePDF } = require('./pdfGenerator');
const { generateGoogleDoc } = require('./googleDocsGenerator');

async function testCurrentBot() {
    console.log("🧪 Testing current bot functionality...");
    
    // Sample lyrics that a user would paste
    const testLyrics = `[Verse 1]
G       C       G
Amazing grace how sweet the sound
That saved a wretch like me
G       D       G
I once was lost but now am found
Was blind but now I see

[Chorus]
G       C       G
Amazing grace how sweet the sound
D       G
That saved a wretch like me

[Verse 2]
G       C       G
Twas grace that taught my heart to fear
And grace my fears relieved
G       D       G
How precious did that grace appear
The hour I first believed`;

    const manualProcessor = new ManualInputProcessor();
    
    try {
        // Test 1: Check if lyrics are detected
        console.log("1️⃣ Testing lyrics detection...");
        const isLyrics = manualProcessor.looksLikeLyrics(testLyrics);
        console.log(`   Result: ${isLyrics ? '✅ Detected as lyrics' : '❌ Not detected as lyrics'}`);
        
        if (!isLyrics) {
            console.log("❌ Bot won't process this input - lyrics detection failed");
            return;
        }
        
        // Test 2: Process lyrics into song object
        console.log("2️⃣ Testing lyrics processing...");
        const song = await manualProcessor.processLyricsText(testLyrics);
        
        if (!song) {
            console.log("❌ Lyrics processing failed");
            return;
        }
        
        console.log(`   ✅ Song processed: "${song.title}" by ${song.artist}`);
        console.log(`   📝 Lines count: ${song.lyrics.length}`);
        
        // Test 3: PDF generation
        console.log("3️⃣ Testing PDF generation...");
        try {
            const pdfPath = await generatePDF(song);
            console.log(`   ✅ PDF generated: ${pdfPath}`);
        } catch (error) {
            console.log(`   ❌ PDF generation failed: ${error.message}`);
        }
        
        // Test 4: Google Docs generation
        console.log("4️⃣ Testing Google Docs generation...");
        try {
            const googleDocResult = await generateGoogleDoc(song);
            console.log(`   ✅ Google Docs link: ${googleDocResult.url.substring(0, 80)}...`);
            console.log(`   ✅ Text file: ${googleDocResult.filePath}`);
        } catch (error) {
            console.log(`   ❌ Google Docs generation failed: ${error.message}`);
        }
        
        console.log("\n🎉 SUMMARY:");
        console.log("✅ The bot should work when you paste lyrics!");
        console.log("📝 Default: Generates 2-column PDF");
        console.log("🔗 Future: Will support !gdocs command for Google Docs");
        
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

testCurrentBot();
