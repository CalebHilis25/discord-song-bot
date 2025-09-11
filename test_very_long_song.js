// Test with extremely long content to force multiple pages
const pdfGenerator = require('./pdfGenerator');

const testSong = {
    title: "Very Long Multi-Page Song",
    artist: "Footer Testing Band",
    lyrics: []
};

// Generate lots of content to force multiple pages
for (let verse = 1; verse <= 8; verse++) {
    testSong.lyrics.push(`Verse ${verse}:`);
    for (let line = 1; line <= 8; line++) {
        testSong.lyrics.push(`G    C    Am   F`);
        testSong.lyrics.push(`This is verse ${verse} line ${line} with enough content to fill pages`);
    }
    testSong.lyrics.push(``);
    
    testSong.lyrics.push(`Chorus ${verse}:`);
    for (let line = 1; line <= 6; line++) {
        testSong.lyrics.push(`D    G    C    Am`);
        testSong.lyrics.push(`Chorus ${verse} line ${line} testing footer placement and numbering`);
    }
    testSong.lyrics.push(``);
}

// Add bridge
testSong.lyrics.push(`Bridge:`);
for (let line = 1; line <= 10; line++) {
    testSong.lyrics.push(`Em   Am   D    G`);
    testSong.lyrics.push(`Bridge line ${line} should create enough content for multiple pages`);
}
testSong.lyrics.push(``);

// Add outro
testSong.lyrics.push(`Outro:`);
for (let line = 1; line <= 6; line++) {
    testSong.lyrics.push(`F    C    G    Am`);
    testSong.lyrics.push(`Final outro line ${line} completing our very long test song`);
}

async function testVeryLongSong() {
    try {
        console.log('🧪 Testing with very long song to force multiple pages...');
        console.log(`📝 Generated ${testSong.lyrics.length} lines of content`);
        const pdfPath = await pdfGenerator.generatePDF(testSong);
        console.log(`✅ Very long PDF generated: ${pdfPath}`);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testVeryLongSong();
