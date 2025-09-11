// Chord transposition utility
// Usage: transposeChordLine(line, fromKey, toKey)

const CHORDS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHORDS_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function getChordIndex(chord, useFlat=false) {
    const base = useFlat ? CHORDS_FLAT : CHORDS_SHARP;
    for (let i = 0; i < base.length; i++) {
        if (chord.startsWith(base[i])) return i;
    }
    return -1;
}

function transposeChord(chord, steps) {
    // Extract root and suffix (e.g. G#m7)
    const match = chord.match(/^([A-G][b#]?)(.*)$/);
    if (!match) return chord;
    let [_, root, suffix] = match;
    // Use sharp or flat based on input
    const useFlat = root.includes('b');
    const base = useFlat ? CHORDS_FLAT : CHORDS_SHARP;
    let idx = getChordIndex(root, useFlat);
    if (idx === -1) return chord;
    let newIdx = (idx + steps + 12) % 12;
    let newRoot = base[newIdx];
    return newRoot + suffix;
}

function transposeChordLine(line, fromKey, toKey) {
    // Calculate steps to transpose
    const base = CHORDS_SHARP;
    let fromIdx = getChordIndex(fromKey);
    let toIdx = getChordIndex(toKey);
    if (fromIdx === -1 || toIdx === -1) return line;
    let steps = toIdx - fromIdx;
    // Replace chords in line
    return line.replace(/([A-G][b#]?)(m|maj|min|sus|aug|dim|add|[0-9]*)?/g, (match) => {
        return transposeChord(match, steps);
    });
}

function transposeChordLineBySteps(line, steps) {
    // Replace chords in line by a number of half steps
    return line.replace(/([A-G][b#]?)(m|maj|min|sus|aug|dim|add|[0-9]*)?/g, (match) => {
        return transposeChord(match, steps);
    });
}

module.exports = { transposeChordLine, transposeChordLineBySteps };
