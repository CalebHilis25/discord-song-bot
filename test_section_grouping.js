const { generatePDF } = require('./pdfGenerator');

// Test data with multiple sections to test section header grouping
const testSong = {
    title: "Test Song - Section Headers",
    artist: "Test Artist",
    lyrics: [
        "[Verse 1]",
        "G       C       G",
        "This is the first verse line",
        "D       G",
        "This is the second verse line",
        "",
        "[Chorus]", 
        "C       G       D       G",
        "This is the chorus line one",
        "C       G       D       G",
        "This is the chorus line two",
        "",
        "[Verse 2]",
        "G       C       G", 
        "This is the second verse line",
        "D       G",
        "Another line in verse two",
        "",
        "[Bridge]",
        "Am      F       C       G",
        "This is the bridge section",
        "Am      F       C       G",
        "Bridge continues here",
        "",
        "[Outro]",
        "G       C       G",
        "Final outro line",
        "D       G",
        "Song ends here"
    ]
};

console.log("🧪 Testing section header grouping with content...");

generatePDF(testSong)
    .then(filePath => {
        console.log("✅ Test PDF with section grouping generated:", filePath);
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
