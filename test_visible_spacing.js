const { generatePDF } = require('./pdfGenerator');

const spacingTest = {
    title: "Visible Spacing Test",
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

console.log("🔍 Testing VISIBLE spacing - increased empty line height...");

generatePDF(spacingTest)
    .then(filePath => {
        console.log("✅ Visible spacing test complete:", filePath);
        console.log("📄 Check the PDF - you should see much more space between sections now!");
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
