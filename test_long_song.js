const { generatePDF } = require('./pdfGenerator');

// Test data with lots of content to force column switching
const testSong = {
    title: "Long Song - Column Test",
    artist: "Test Artist",
    lyrics: [
        "[Verse 1]",
        "G       C       G",
        "This is line one of verse one",
        "D       G",
        "This is line two of verse one",
        "G       C       G",
        "This is line three of verse one",
        "D       G",
        "This is line four of verse one",
        "",
        "[Chorus]", 
        "C       G       D       G",
        "This is the chorus line one",
        "C       G       D       G",
        "This is the chorus line two",
        "C       G       D       G",
        "This is the chorus line three",
        "C       G       D       G",
        "This is the chorus line four",
        "",
        "[Verse 2]",
        "G       C       G", 
        "This is line one of verse two",
        "D       G",
        "This is line two of verse two",
        "G       C       G",
        "This is line three of verse two",
        "D       G",
        "This is line four of verse two",
        "",
        "[Chorus]",
        "C       G       D       G",
        "Chorus repeats line one",
        "C       G       D       G",
        "Chorus repeats line two",
        "C       G       D       G",
        "Chorus repeats line three",
        "C       G       D       G",
        "Chorus repeats line four",
        "",
        "[Bridge]",
        "Am      F       C       G",
        "This is the bridge section one",
        "Am      F       C       G",
        "This is the bridge section two",
        "Am      F       C       G",
        "This is the bridge section three",
        "Am      F       C       G",
        "This is the bridge section four",
        "",
        "[Final Chorus]",
        "C       G       D       G",
        "Final chorus line one",
        "C       G       D       G",
        "Final chorus line two",
        "C       G       D       G",
        "Final chorus line three",
        "C       G       D       G",
        "Final chorus line four",
        "",
        "[Outro]",
        "G       C       G",
        "Final outro line one",
        "D       G",
        "Final outro line two",
        "G       C       G",
        "Song ends here with line three",
        "D       G",
        "And finally line four"
    ]
};

console.log("🧪 Testing long song with forced column switching...");

generatePDF(testSong)
    .then(filePath => {
        console.log("✅ Long test PDF generated:", filePath);
    })
    .catch(error => {
        console.error("❌ Test failed:", error);
    });
