export const STRING_TUNINGS = [41.203, 55.000, 73.416, 97.999]; // E1, A1, D2, G2 (High Precision)
export const STRING_NAMES = ['E', 'A', 'D', 'G'];
export const TOTAL_FRETS = 20;

// Accurate fret spacing constant (rule of 18)
export const FRET_DISTANCES = Array.from({ length: TOTAL_FRETS + 1 }, (_, i) => {
  return 1 - Math.pow(1 / 1.059463, i);
});

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getFrequency = (stringBaseFreq: number, fret: number) => {
  // 12-TET Standard Formula
  return stringBaseFreq * Math.pow(2, fret / 12);
};

export const getNoteName = (stringIndex: number, fret: number) => {
  // Base semitones from C0
  // E1 = 28, A1 = 33, D2 = 38, G2 = 43
  const baseSemitones = [28, 33, 38, 43]; 
  const totalSemitones = baseSemitones[stringIndex] + fret;
  const noteIdx = totalSemitones % 12;
  const octave = Math.floor(totalSemitones / 12);
  return `${NOTE_NAMES[noteIdx]}${octave}`;
};