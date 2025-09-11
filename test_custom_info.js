const { generatePDF } = require('./pdfGenerator');

// Test the new conversation flow with custom title and artist
const testCustomSong = {
    title: "My Custom Song Title",
    artist: "My Custom Artist",
    lyrics: [
        "[Verse 1]",
        "G       C       G",
        "This is a test song line",
        "D       G",
        "With custom title and artist",
        "[Chorus]", 
        "C       G       D       G",
        "The title should show on the PDF",
        "C       G       D       G",
        "Along with the artist name"
    ]
};

console.log("🧪 Testing custom title and artist in PDF generation...");

generatePDF(testCustomSong)
    .then(filePath => {
        console.log("✅ Custom title/artist test PDF generated:", filePath);
        console.log(`📄 PDF should show: "${testCustomSong.title}" by "${testCustomSong.artist}"`);
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
