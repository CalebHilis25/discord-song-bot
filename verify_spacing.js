const { generatePDF } = require('./pdfGenerator');

const quickTest = {
    title: "Quick Spacing Test",
    artist: "Test",
    lyrics: [
        "[Verse 1]",
        "Line 1 of verse",
        "Line 2 of verse",
        "[Chorus]", 
        "Line 1 of chorus",
        "Line 2 of chorus",
        "[Verse 2]",
        "Line 1 of verse 2",
        "Line 2 of verse 2"
    ]
};

console.log("🔍 Quick test to verify 3 empty lines between sections...");

generatePDF(quickTest)
    .then(filePath => {
        console.log("✅ Verification test complete:", filePath);
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
