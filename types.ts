
export enum PickupType {
  JJ = 'J-J',
  PJ = 'P-J',
  MMJ = 'MM-J'
}

export enum AmpType {
  SVT = 'Ampeg SVT',
  BASSMAN = 'Fender Bassman',
  MARKBASS = 'Markbass',
  ORANGE = 'Orange AD200',
  GK = 'Gallien-Krueger',
  AGUILAR = 'Aguilar ToneHammer',
  TRACE = 'Trace Elliot',
  DARKGLASS = 'Darkglass MT',
  ACOUSTIC = 'Acoustic 360',
  B15 = 'Ampeg B-15N'
}

export enum PlayingTechnique {
  FINGER = 'Finger',
  SLAP = 'Slap',
  POP = 'Pop',
  MUTE = 'Mute',
  PICK = 'Pick'
}

export enum BassSkin {
  CLASSIC = 'Classic',
  MODERN = 'Modern',
  VINTAGE = 'Vintage',
  CYBER = 'Cyber'
}

export interface AudioSettings {
  masterVolume: number;
  
  // Appearance
  bassSkin: BassSkin;

  pickupConfig: PickupType;
  neckPickupVol: number;
  neckPickupTone: number;
  bridgePickupVol: number;
  bridgePickupTone: number;
  
  // Tuning (Cents offset per string: E, A, D, G)
  stringDetune: number[]; 

  // Expanded Amp Controls
  ampType: AmpType;
  ampGain: number;
  ampBass: number;
  ampMid: number;
  ampTreble: number;
  ampPresence: number; 
  ampMaster: number;  
  ampContour: number;  

  // Expanded Effects Chain
  compressor: { enabled: boolean, threshold: number, ratio: number, attack: number, release: number, knee: number, gain: number };
  octaver: { enabled: boolean, sub1: number, sub2: number, dry: number, up: number };
  autowah: { enabled: boolean, sensitivity: number, decay: number, range: number, resonance: number };
  fuzz: { enabled: boolean, gain: number, tone: number, gate: number, bias: number };
  overdrive: { enabled: boolean, drive: number, tone: number, level: number, bass: number, treble: number };
  chorus: { enabled: boolean, rate: number, depth: number, mix: number, delay: number };
  phaser: { enabled: boolean, rate: number, depth: number, feedback: number, base: number };
  delay: { enabled: boolean, time: number, feedback: number, mix: number, filter: number };
  reverb: { enabled: boolean, decay: number, size: number, mix: number, preDelay: number };
  eq: { enabled: boolean, low: number, lowMid: number, highMid: number, high: number, presence: number };

  // New Large Pedals
  titanPreamp: { enabled: boolean, drive: number, blend: number, bass: number, mid: number, treble: number, presence: number };
  masterDelay: { enabled: boolean, time: number, feedback: number, mix: number, saturation: number, modulation: number };
}

export interface NoteInfo {
  stringIdx: number;
  fret: number;
  note: string;
  frequency: number;
}
