// Chord transposition utility
// Usage: transposeChordLine(line, fromKey, toKey)

const CHORDS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORDS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Key signatures and their preferred accidentals
const KEY_PREFERENCES = {
    // Major keys that prefer sharps
    'C': 'sharp', 'G': 'sharp', 'D': 'sharp', 'A': 'sharp', 'E': 'sharp', 'B': 'sharp', 'F#': 'sharp', 'C#': 'sharp',
    // Major keys that prefer flats  
    'F': 'flat', 'Bb': 'flat', 'Eb': 'flat', 'Ab': 'flat', 'Db': 'flat', 'Gb': 'flat', 'Cb': 'flat',
    // Minor keys that prefer sharps
    'Am': 'sharp', 'Em': 'sharp', 'Bm': 'sharp', 'F#m': 'sharp', 'C#m': 'sharp', 'G#m': 'sharp', 'D#m': 'sharp', 'A#m': 'sharp',
    // Minor keys that prefer flats
    'Dm': 'flat', 'Gm': 'flat', 'Cm': 'flat', 'Fm': 'flat', 'Bbm': 'flat', 'Ebm': 'flat', 'Abm': 'flat'
};

// Enharmonic equivalents to avoid double sharps/flats
const ENHARMONIC_MAP = {
    'A#': 'Bb', 'Bb': 'Bb',
    'C#': 'C#', 'Db': 'Db', 
    'D#': 'Eb', 'Eb': 'Eb',
    'F#': 'F#', 'Gb': 'Gb',
    'G#': 'Ab', 'Ab': 'Ab'
};

function getChordIndex(chord, useFlat = false) {
    const base = useFlat ? CHORDS_FLAT : CHORDS_SHARP;
    for (let i = 0; i < base.length; i++) {
        if (chord.startsWith(base[i])) return i;
    }
    return -1;
}

function normalizeKey(key) {
    // Handle common key variations
    if (key.toLowerCase().endsWith('m') || key.toLowerCase().endsWith('min')) {
        return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase().replace('min', 'm');
    }
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function getBestEnharmonic(note, targetKey, originalNote) {
    if (!note.includes('#') && !note.includes('b')) {
        return note; // Natural note
    }
    
    const keyPref = KEY_PREFERENCES[normalizeKey(targetKey)] || 'sharp';
    const originalPref = originalNote.includes('b') ? 'flat' : 'sharp';
    
    // Get both enharmonic options
    let sharpVersion = CHORDS_SHARP.find(n => CHORDS_SHARP.indexOf(n) === CHORDS_FLAT.indexOf(note));
    let flatVersion = CHORDS_FLAT.find(n => CHORDS_FLAT.indexOf(n) === CHORDS_SHARP.indexOf(note));
    
    if (!sharpVersion) sharpVersion = note;
    if (!flatVersion) flatVersion = note;
    
    // Avoid double sharps/flats by preferring simpler notation
    if (sharpVersion.length > 2 || flatVersion.length > 2) {
        return sharpVersion.length <= flatVersion.length ? sharpVersion : flatVersion;
    }
    
    // Use key signature preference, fallback to original preference
    if (keyPref === 'flat') {
        return flatVersion;
    } else if (keyPref === 'sharp') {
        return sharpVersion;
    } else {
        return originalPref === 'flat' ? flatVersion : sharpVersion;
    }
}

function transposeChord(chord, steps, targetKey = null) {
    // Handle empty or invalid input
    if (!chord || typeof chord !== 'string') return chord;
    
    // Handle slash chords (e.g., C/E, Am7/G)
    const slashMatch = chord.match(/^([A-G][b#]?(?:[^/]*?))\/([A-G][b#]?)(.*)$/);
    if (slashMatch) {
        const [_, mainChord, bassNote, suffix] = slashMatch;
        const transposedMain = transposeChord(mainChord, steps, targetKey);
        const transposedBass = transposeChord(bassNote, steps, targetKey);
        return `${transposedMain}/${transposedBass}${suffix}`;
    }

    // Extract root note and chord suffix
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    
    let [_, root, suffix] = match;
    
    // Get index - try sharp array first, then flat array
    let idx = -1;
    let isOriginalFlat = root.includes('b');
    
    if (isOriginalFlat) {
        idx = getChordIndex(root, true); // Try flat first for flat notes
        if (idx === -1) idx = getChordIndex(root, false);
    } else {
        idx = getChordIndex(root, false); // Try sharp first for sharp/natural notes
        if (idx === -1) idx = getChordIndex(root, true);
    }
    
    if (idx === -1) return chord;
    
    // Calculate new index
    let newIdx = (idx + steps + 12) % 12;
    
    // Get both possible new notes
    let newRootSharp = CHORDS_SHARP[newIdx];
    let newRootFlat = CHORDS_FLAT[newIdx];
    
    // Choose the best enharmonic
    let bestNote = newRootSharp;
    if (newRootSharp !== newRootFlat) {
        bestNote = getBestEnharmonic(
            isOriginalFlat ? newRootFlat : newRootSharp,
            targetKey,
            root
        );
    }
    
    return bestNote + suffix;
}

function transposeChordLine(line, fromKey, toKey) {
    // Validate inputs
    if (!line || !fromKey || !toKey) return line;
    
    // Normalize key names
    fromKey = normalizeKey(fromKey);
    toKey = normalizeKey(toKey);
    
    // Calculate steps to transpose
    let fromIdx = getChordIndex(fromKey, false);
    if (fromIdx === -1) fromIdx = getChordIndex(fromKey, true);
    
    let toIdx = getChordIndex(toKey, false);
    if (toIdx === -1) toIdx = getChordIndex(toKey, true);
    
    if (fromIdx === -1 || toIdx === -1) return line;
    
    let steps = toIdx - fromIdx;
    
    // Comprehensive regex for chord recognition
    // Matches: C, Cm, Cmaj7, C#m7b5, C/E, Csus4add9, etc.
    const chordRegex = /\b([A-G][b#]?)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]?)?)\b/g;
    
    return line.replace(chordRegex, (match) => {
        return transposeChord(match, steps, toKey);
    });
}

function transposeChordLineBySteps(line, steps) {
    // Validate inputs
    if (!line || typeof steps !== 'number') return line;
    
    // Normalize steps to be within -11 to +11 range
    steps = ((steps % 12) + 12) % 12;
    if (steps > 6) steps -= 12; // Prefer smaller intervals
    
    const chordRegex = /\b([A-G][b#]?)([mM]?(?:aj|in|sus[24]?|aug|dim|add)?[0-9]*(?:[b#][0-9]+)*(?:\/[A-G][b#]?)?)\b/g;
    
    return line.replace(chordRegex, (match) => {
        return transposeChord(match, steps);
    });
}

// Helper function to validate if a string is a valid key
function isValidKey(key) {
    const normalizedKey = normalizeKey(key);
    return CHORDS_SHARP.some(note => normalizedKey.startsWith(note)) || 
           CHORDS_FLAT.some(note => normalizedKey.startsWith(note));
}

// Helper function to get all possible keys
function getAllKeys() {
    const majorKeys = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B', 'Cb'];
    const minorKeys = majorKeys.map(key => key + 'm');
    return [...majorKeys, ...minorKeys];
}

// Helper function to transpose by interval names
function transposeByInterval(line, fromKey, interval) {
    const intervalSteps = {
        'unison': 0, 'minor2nd': 1, 'major2nd': 2, 'minor3rd': 3, 'major3rd': 4,
        'perfect4th': 5, 'tritone': 6, 'perfect5th': 7, 'minor6th': 8, 'major6th': 9,
        'minor7th': 10, 'major7th': 11, 'octave': 12
    };
    
    const steps = intervalSteps[interval.toLowerCase()];
    if (steps === undefined) return line;
    
    return transposeChordLineBySteps(line, steps);
}

module.exports = { 
    transposeChordLine, 
    transposeChordLineBySteps,
    transposeByInterval,
    isValidKey,
    getAllKeys,
    normalizeKey
};