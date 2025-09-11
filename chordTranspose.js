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
        transposedBass = transposedBass.replace('##', '');
        transposedBass = transposedBass.replace('bb', '');
        // If result is F#, G#, etc., prefer natural if possible
        if (transposedBass === 'F#') transposedBass = 'G';
        if (transposedBass === 'C#') transposedBass = 'D';
        if (transposedBass === 'G#') transposedBass = 'A';
        if (transposedBass === 'D#') transposedBass = 'E';
        if (transposedBass === 'A#') transposedBass = 'B';
        if (transposedBass === 'E#') transposedBass = 'F';
        if (transposedBass === 'B#') transposedBass = 'C';
        return `${transposedMain}/${transposedBass}${suffix}`;
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
        // Accidental - choose based on context
        if (targetKey && FLAT_KEYS.includes(targetKey)) {
            newRoot = flat;
        } else if (root.includes('b')) {
            newRoot = flat;
        } else if (root.includes('#')) {
            newRoot = sharp;
        } else {
            // For natural roots going to accidentals, avoid double sharps/flats
            newRoot = sharp.length <= flat.length ? sharp : flat;
        }
    }
    
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