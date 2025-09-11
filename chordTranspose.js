// Chord transposition utility
// Usage: transposeChordLine(line, fromKey, toKey)

const CHORDS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORDS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Keys that prefer flats
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
        let transposedBass = transposeChord(bassNote, steps, targetKey);
        // Normalize double sharps/flats in bass note
        transposedBass = normalizeEnharmonic(transposedBass, targetKey);
        return `${transposedMain}/${transposedBass}${suffix}`;
    }
// Normalize double sharps/flats and choose correct enharmonic equivalent
function normalizeEnharmonic(note, targetKey) {
    // Remove double sharps/flats
    note = note.replace('##', '');
    note = note.replace('bb', '');
    // Map unnatural notes to correct enharmonic equivalents
    const enharmonicMap = {
        'E#': 'F', 'B#': 'C', 'Cb': 'B', 'Fb': 'E'
    };
    // Always use sharps for accidentals
    if (enharmonicMap[note]) {
        return enharmonicMap[note];
    }
    // If it's a natural note, keep as is
    if (CHORDS_SHARP.includes(note) && !note.includes('#') && !note.includes('b')) {
        return note;
    }
    // If it's a sharp, keep as is
    if (CHORDS_SHARP.includes(note) && note.includes('#')) {
        return note;
    }
    // If it's a flat, convert to sharp
    if (CHORDS_FLAT.includes(note) && note.includes('b')) {
        let idx = CHORDS_FLAT.indexOf(note);
        return CHORDS_SHARP[idx];
    }
    return note;
}

    // Extract root and suffix (e.g. G#m7)
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    
    let [_, root, suffix] = match;
    
    // Get the index of the root note
    let idx = getChordIndex(root, false);
    if (idx === -1) {
        idx = getChordIndex(root, true);
    }
    
    if (idx === -1) return chord;
    
    // Calculate new index
    let newIdx = (idx + steps + 12) % 12;
    
    // Get both sharp and flat options
    let sharp = CHORDS_SHARP[newIdx];
    let flat = CHORDS_FLAT[newIdx];
    let newRoot;
    
    // Choose the best option
    if (!sharp.includes('#') && !sharp.includes('b')) {
        // Natural note - always use it
        newRoot = sharp;
    } else {
        // Accidental - always use sharp
        newRoot = sharp;
    }
    // Normalize result to musically correct enharmonic
    newRoot = normalizeEnharmonic(newRoot, targetKey);
    return newRoot + suffix;
}

function transposeChordLine(line, fromKey, toKey) {
    // Calculate steps to transpose
    let fromIdx = getChordIndex(fromKey);
    if (fromIdx === -1) fromIdx = getChordIndex(fromKey, true);
    
    let toIdx = getChordIndex(toKey);
    if (toIdx === -1) toIdx = getChordIndex(toKey, true);
    
    if (fromIdx === -1 || toIdx === -1) return line;
    
    let steps = toIdx - fromIdx;
    
    // Replace chords in line - improved regex for better chord detection
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