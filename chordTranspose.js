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

// Move normalizeEnharmonic function outside and fix it
function normalizeEnharmonic(note, targetKey) {
    // Handle double sharps first
    if (note.includes('##')) {
        const base = note[0];
        let idx = CHORDS_SHARP.indexOf(base);
        if (idx !== -1) {
            idx = (idx + 2) % 12;
            return CHORDS_SHARP[idx];
        }
    }
    
    // Handle double flats
    if (note.includes('bb')) {
        const base = note[0];
        let idx = CHORDS_SHARP.indexOf(base);
        if (idx !== -1) {
            idx = (idx - 2 + 12) % 12;
            return CHORDS_SHARP[idx];
        }
    }
    
    // Map unnatural notes to correct enharmonic equivalents
    const enharmonicMap = {
        'E#': 'F', 'B#': 'C', 'Cb': 'B', 'Fb': 'E'
    };
    
    if (enharmonicMap[note]) return enharmonicMap[note];
    
    // If it's already a standard note, return as is
    if (CHORDS_SHARP.includes(note)) return note;
    
    // If it's a flat, convert to sharp equivalent
    if (CHORDS_FLAT.includes(note)) {
        let idx = CHORDS_FLAT.indexOf(note);
        return CHORDS_SHARP[idx];
    }
    
    return note;
}

function transposeChord(chord, steps, targetKey = null) {
    // Handle slash chords (e.g., C/E, Am/G, F#/D#)
    const slashMatch = chord.match(/^([A-G][b#]*.*?)\/([A-G][b#]*)(.*)$/);
    if (slashMatch) {
        const [_, mainChord, bassNote, suffix] = slashMatch;
        const transposedMain = transposeChord(mainChord, steps, targetKey);
        // Normalize and transpose bass note
        let normalizedBass = normalizeEnharmonic(bassNote, targetKey);
        let bassIdx = CHORDS_SHARP.indexOf(normalizedBass);
        if (bassIdx === -1) {
            bassIdx = CHORDS_FLAT.indexOf(normalizedBass);
            if (bassIdx !== -1) normalizedBass = CHORDS_SHARP[bassIdx];
        }
        if (bassIdx !== -1 || CHORDS_SHARP.includes(normalizedBass)) {
            let finalBassIdx = CHORDS_SHARP.indexOf(normalizedBass);
            let newBassIdx = (finalBassIdx + steps + 12) % 12;
            let transposedBass = CHORDS_SHARP[newBassIdx];
            // Final normalization to ensure no double sharps/flats
            transposedBass = normalizeEnharmonic(transposedBass, targetKey);
            // Extra cleanup: replace any remaining double sharps/flats
            transposedBass = transposedBass.replace(/([A-G])##/g, (fullMatch, note) => {
                return normalizeEnharmonic(note + '##', targetKey);
            });
            transposedBass = transposedBass.replace(/([A-G])bb/g, (fullMatch, note) => {
                return normalizeEnharmonic(note + 'bb', targetKey);
            });
            return `${transposedMain}/${transposedBass}${suffix}`;
        }
        // Fallback if bass note couldn't be processed
        let cleanedBass = normalizeEnharmonic(bassNote, targetKey);
        cleanedBass = cleanedBass.replace(/([A-G])##/g, (fullMatch, note) => {
            return normalizeEnharmonic(note + '##', targetKey);
        });
        cleanedBass = cleanedBass.replace(/([A-G])bb/g, (fullMatch, note) => {
            return normalizeEnharmonic(note + 'bb', targetKey);
        });
        return `${transposedMain}/${cleanedBass}${suffix}`;
    }

    // Extract root and suffix (e.g. G#m7)
    const match = chord.match(/^([A-G][b#]*)(.*)$/);
    if (!match) return chord;
    
    let [_, root, suffix] = match;
    
    // Normalize the root note first
    root = normalizeEnharmonic(root, targetKey);
    
    // Get the index of the root note
    let idx = getChordIndex(root, false);
    if (idx === -1) {
        idx = getChordIndex(root, true);
    }
    
    if (idx === -1) return chord;
    
    // Calculate new index
    let newIdx = (idx + steps + 12) % 12;
    
    // Always use sharp notation for consistency
    let newRoot = CHORDS_SHARP[newIdx];
    
    // Normalize result to musically correct enharmonic
    newRoot = normalizeEnharmonic(newRoot, targetKey);
    
    return newRoot + suffix;
}

function transposeChordLine(line, fromKey, toKey) {
    // Normalize keys first
    fromKey = normalizeEnharmonic(fromKey);
    toKey = normalizeEnharmonic(toKey);
    
    // Calculate steps to transpose
    let fromIdx = getChordIndex(fromKey);
    if (fromIdx === -1) fromIdx = getChordIndex(fromKey, true);
    
    let toIdx = getChordIndex(toKey);
    if (toIdx === -1) toIdx = getChordIndex(toKey, true);
    
    if (fromIdx === -1 || toIdx === -1) return line;
    
    let steps = toIdx - fromIdx;
    
    // Replace chords in line - improved regex for better chord detection
    return line.replace(/\b([A-G][b#]*)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]*)?)\b/g, (match) => {
        let result = transposeChord(match, steps, toKey);
        
        // Final cleanup: replace any remaining double sharps/flats
        result = result.replace(/([A-G])##/g, (fullMatch, note) => {
            const normalized = normalizeEnharmonic(note + '##', toKey);
            return normalized;
        });
        result = result.replace(/([A-G])bb/g, (fullMatch, note) => {
            const normalized = normalizeEnharmonic(note + 'bb', toKey);
            return normalized;
        });
        
        return result;
    });
}

function transposeChordLineBySteps(line, steps) {
    // Replace chords in line by a number of half steps
    return line.replace(/\b([A-G][b#]*)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]*)?)\b/g, (match) => {
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