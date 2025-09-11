// Simple Microsoft Word style column rendering - line by line flow with section spacing
function renderInWordStyleColumns(doc, lines, leftColumnX, rightColumnX, columnWidth) {
    const startY = doc.y;
    const bottomMargin = 80;
    const maxY = doc.page.height - bottomMargin;
    
    let currentX = leftColumnX;  // Start in left column
    let currentY = startY;
    let isRightColumn = false;
    
    console.log(`📰 Simple Word-style columns with section spacing: startY=${startY}, maxY=${maxY}`);
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Calculate height needed for this line
        const lineHeight = doc.currentLineHeight();
        
        // Check if this line will fit in current column
        const willFitInCurrentColumn = (currentY + lineHeight) <= maxY;
        
        // If line won't fit and we're in left column, switch to right
        if (!willFitInCurrentColumn && !isRightColumn) {
            console.log(`🔄 Switching to right column at line ${i}: "${trimmedLine.substring(0, 30)}..."`);
            currentX = rightColumnX;
            currentY = startY;
            isRightColumn = true;
        }
        // If line won't fit and we're in right column, new page
        else if (!willFitInCurrentColumn && isRightColumn) {
            console.log(`📄 New page needed at line ${i}`);
            doc.addPage();
            currentX = leftColumnX;
            currentY = doc.y;
            isRightColumn = false;
        }
        
        // Set position and render the line
        doc.x = currentX;
        doc.y = currentY;
        
        if (trimmedLine === '') {
            // Empty line - spacing (from section spacing feature)
            currentY += lineHeight * 0.6;
            console.log(`📏 Empty line spacing at y=${currentY.toFixed(1)}`);
        } else if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
            // Section headers - BOLD
            doc.font('Helvetica-Bold');
            doc.text(line, currentX, currentY, { width: columnWidth });
            doc.font('Helvetica');
            currentY = doc.y + (lineHeight * 0.1); // Small space after headers
        } else if (isChordLine(trimmedLine)) {
            // Chord lines - BOLD
            doc.font('Helvetica-Bold');
            doc.text(line, currentX, currentY, { width: columnWidth });
            doc.font('Helvetica');
            currentY = doc.y;
        } else {
            // Lyrics - NORMAL font
            doc.font('Helvetica');
            doc.text(line, currentX, currentY, { width: columnWidth });
            currentY = doc.y;
        }
        
        console.log(`📝 Line ${i}: "${trimmedLine.substring(0, 20)}..." at y=${currentY.toFixed(1)} in ${isRightColumn ? 'RIGHT' : 'LEFT'} column`);
    }
    
    console.log(`✅ Simple Word-style rendering complete. Final position: column=${isRightColumn ? 'right' : 'left'}, y=${currentY}`);
}
