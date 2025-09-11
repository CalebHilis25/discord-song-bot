// Chord transposition utility
// Usage: transposeChordLine(line, fromKey, toKey)

const CHORDS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORDS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Key signatures for better enharmonic spelling
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];

function getChordIndex(chord, useFlat = false) {
    const base = useFlat ? CHORDS_FLAT : CHORDS_SHARP;
    for (let i = 0; i < base.length; i++) {
        if (chord.startsWith(base[i])) return i;
    }
    return -1;
}

function transposeChord(chord, steps, targetKey = null) {
    // Handle slash chords (e.g., C/E)
    const slashMatch = chord.match(/^([A-G][b#]?[^/]*?)\/([A-G][b#]?)(.*)$/);
    if (slashMatch) {
        const [_, mainChord, bassNote, suffix] = slashMatch;
        const transposedMain = transposeChord(mainChord, steps, targetKey);
        const transposedBass = transposeChord(bassNote, steps, targetKey);
        return `${transposedMain}/${transposedBass}${suffix}`;
    }

    // Extract root and suffix (e.g. G#m7)
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    
    let [_, root, suffix] = match;
    let idxSharp = getChordIndex(root, false);
    let idxFlat = getChordIndex(root, true);
    let idx = root.includes('b') ? idxFlat : idxSharp;
    
    if (idx === -1) return chord;
    
    let newIdx = (idx + steps + 12) % 12;
    
    // Choose between sharp and flat based on target key or original preference
    let sharp = CHORDS_SHARP[newIdx];
    let flat = CHORDS_FLAT[newIdx];
    let newRoot = sharp;
    
    if (!sharp.includes('#') && !sharp.includes('b')) {
        newRoot = sharp; // natural note
    } else if (targetKey && FLAT_KEYS.includes(targetKey)) {
        newRoot = flat; // prefer flats for flat keys
    } else if (root.includes('#')) {
        newRoot = sharp; // maintain sharp preference
    } else if (root.includes('b')) {
        newRoot = flat; // maintain flat preference
    } else {
        newRoot = sharp; // default to sharp for natural roots going to accidentals
    }
    
    return newRoot + suffix;
}

function transposeChordLine(line, fromKey, toKey) {
    // Calculate steps to transpose
    let fromIdx = getChordIndex(fromKey);
    let toIdx = getChordIndex(toKey);
    
    if (fromIdx === -1 || toIdx === -1) return line;
    
    let steps = toIdx - fromIdx;
    
    // Improved regex pattern to catch more chord types including slash chords
    return line.replace(/\b([A-G][b#]?)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]?)?)\b/g, (match) => {
        return transposeChord(match, steps, toKey);
    });
}

function transposeChordLineBySteps(line, steps) {
    // Replace chords in line by a number of half steps
    return line.replace(/\b([A-G][b#]?)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]?)?)\b/g, (match) => {
        return transposeChord(match, steps);
    });
}

// Helper function to validate if a string is a valid key
function isValidKey(key) {
    return CHORDS_SHARP.includes(key) || CHORDS_FLAT.includes(key);
}

module.exports = { 
    transposeChordLine, 
    transposeChordLineBySteps,
    isValidKey 
};