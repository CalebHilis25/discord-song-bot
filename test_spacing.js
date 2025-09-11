const { generatePDF } = require('./pdfGenerator');

// Test data to verify increased section spacing
const testSong = {
    title: "Test Song - Increased Spacing",
    artist: "Test Artist",
    lyrics: [
        "[Verse 1]",
        "G       C       G",
        "This is the first verse line",
        "D       G",
        "This is the second verse line",
        "[Chorus]", 
        "C       G       D       G",
        "This is the chorus line one",
        "C       G       D       G",
        "This is the chorus line two",
        "[Verse 2]",
        "G       C       G", 
        "This is the second verse line",
        "D       G",
        "Another line in verse two",
        "[Bridge]",
        "Am      F       C       G",
        "This is the bridge section",
        "Am      F       C       G",
        "Bridge continues here"
    ]
};

console.log("🧪 Testing increased section spacing (3 empty lines between sections)...");

generatePDF(testSong)
    .then(filePath => {
        console.log("✅ Test PDF with increased spacing generated:", filePath);
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
