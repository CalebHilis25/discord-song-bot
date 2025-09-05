const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
function ensureOutputDir() {
    const outputDir = path.join(__dirname, 'generated-pdfs');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    return outputDir;
}

// Generate PDF with 2-column layout, bold title, 11pt font
async function generatePDF(song) {
    return new Promise((resolve, reject) => {
        try {
            const outputDir = ensureOutputDir();
            const fileName = `${song.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
            const filePath = path.join(outputDir, fileName);
            
            // Create PDF document - 8.5 x 11 inches (US Letter)
            const doc = new PDFDocument({
                size: [612, 792], // 8.5" x 11" in points (72 points per inch)
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 40,
                    right: 40
                }
            });
            
            // Pipe to file
            doc.pipe(fs.createWriteStream(filePath));
            
            // Page dimensions
            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const columnWidth = (pageWidth - 20) / 2; // 20px gap between columns
            const leftColumnX = doc.page.margins.left;
            const rightColumnX = leftColumnX + columnWidth + 20;
            
            // Title - Bold and centered
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text(song.title.toUpperCase(), leftColumnX, doc.y, {
                   width: pageWidth,
                   align: 'center'
               });
            
            // Artist - Below title
            doc.fontSize(12)
               .font('Helvetica')
               .text(`by ${song.artist}`, leftColumnX, doc.y + 5, {
                   width: pageWidth,
                   align: 'center'
               });
            
            // Add some space
            doc.moveDown(2);
            
            // Set font for lyrics - 11pt as requested
            doc.fontSize(11)
               .font('Helvetica');
            
            // Split lyrics into two columns
            const lyrics = song.lyrics || [];
            const midPoint = Math.ceil(lyrics.length / 2);
            const leftColumn = lyrics.slice(0, midPoint);
            const rightColumn = lyrics.slice(midPoint);
            
            // Current Y position for both columns
            let currentY = doc.y;
            const startY = currentY;
            
            // Left Column
            doc.x = leftColumnX;
            doc.y = currentY;
            
            leftColumn.forEach(line => {
                // Check if line contains chords (has capital letters followed by spaces)
                const isChordLine = /^[A-G].*/.test(line.trim()) && !line.includes('[');
                
                if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
                    // Section headers (Verse, Chorus, etc.) - bold
                    doc.font('Helvetica-Bold')
                       .text(line, leftColumnX, doc.y, { width: columnWidth });
                    doc.font('Helvetica');
                } else if (isChordLine) {
                    // Chord lines - bold
                    doc.font('Helvetica-Bold')
                       .text(line, leftColumnX, doc.y, { width: columnWidth });
                    doc.font('Helvetica');
                } else {
                    // Regular lyrics
                    doc.text(line, leftColumnX, doc.y, { width: columnWidth });
                }
                
                // Add extra space after empty lines (song sections)
                if (line.trim() === '') {
                    doc.moveDown(0.5);
                }
            });
            
            // Right Column
            const rightColumnStartY = startY;
            doc.x = rightColumnX;
            doc.y = rightColumnStartY;
            
            rightColumn.forEach(line => {
                // Check if line contains chords
                const isChordLine = /^[A-G].*/.test(line.trim()) && !line.includes('[');
                
                if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
                    // Section headers - bold
                    doc.font('Helvetica-Bold')
                       .text(line, rightColumnX, doc.y, { width: columnWidth });
                    doc.font('Helvetica');
                } else if (isChordLine) {
                    // Chord lines - bold
                    doc.font('Helvetica-Bold')
                       .text(line, rightColumnX, doc.y, { width: columnWidth });
                    doc.font('Helvetica');
                } else {
                    // Regular lyrics
                    doc.text(line, rightColumnX, doc.y, { width: columnWidth });
                }
                
                // Add extra space after empty lines
                if (line.trim() === '') {
                    doc.moveDown(0.5);
                }
            });
            
            // Footer
            doc.fontSize(8)
               .font('Helvetica')
               .text(`Generated by Discord Song Bot - ${new Date().toLocaleDateString()}`, 
                     leftColumnX, doc.page.height - 30, {
                       width: pageWidth,
                       align: 'center'
                     });
            
            // Finalize PDF
            doc.end();
            
            // Wait for PDF to be written
            doc.on('end', () => {
                console.log(`✅ PDF generated: ${fileName}`);
                resolve(filePath);
            });
            
            doc.on('error', (error) => {
                console.error('PDF generation error:', error);
                reject(error);
            });
            
        } catch (error) {
            console.error('Error in generatePDF:', error);
            reject(error);
        }
    });
}

module.exports = {
    generatePDF
};
