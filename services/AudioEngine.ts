
import { AmpType, AudioSettings, PickupType, PlayingTechnique } from '../types';

export class AudioEngine {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private noiseBuffer: AudioBuffer;
  private impulseBuffer: AudioBuffer | null = null;
  private envelopeFollower: GainNode;

  // Effects Nodes references
  private compressor: DynamicsCompressorNode;
  private compressorMakeup: GainNode; 
  
  // AutoWah
  private wahFilter: BiquadFilterNode;
  private wahGain: GainNode; 

  // Fuzz
  private fuzzShape: WaveShaperNode;
  private fuzzFilter: BiquadFilterNode;
  private fuzzGain: GainNode;
  private fuzzDry: GainNode;
  private fuzzWet: GainNode;
  private fuzzOut: GainNode;

  // Overdrive
  private driveShape: WaveShaperNode;
  private driveFilter: BiquadFilterNode;
  private driveLow: BiquadFilterNode; 
  private driveHigh: BiquadFilterNode; 
  private driveGain: GainNode;
  private driveDry: GainNode;
  private driveWet: GainNode;
  private driveOut: GainNode;

  // Chorus
  private chorusDelay: DelayNode;
  private chorusLFO: OscillatorNode;
  private chorusLFOGain: GainNode;
  private chorusDry: GainNode;
  private chorusWet: GainNode;
  private chorusOut: GainNode;

  // Phaser
  private phaserFilters: BiquadFilterNode[] = [];
  private phaserLFO: OscillatorNode;
  private phaserLFOGain: GainNode;
  private phaserDry: GainNode;
  private phaserWet: GainNode;
  private phaserOut: GainNode;

  // Delay
  private delayNode: DelayNode;
  private delayFeedback: GainNode;
  private delayFilter: BiquadFilterNode; 
  private delayDry: GainNode;
  private delayWet: GainNode;
  private delayOut: GainNode;

  // Reverb
  private reverbNode: ConvolverNode;
  private reverbPreDelay: DelayNode; 
  private reverbDry: GainNode;
  private reverbWet: GainNode;
  private reverbOut: GainNode;

  // EQ
  private eqLow: BiquadFilterNode;
  private eqLowMid: BiquadFilterNode;
  private eqHighMid: BiquadFilterNode;
  private eqHigh: BiquadFilterNode;
  private eqPresence: BiquadFilterNode; 
  
  // --- NEW LARGE PEDALS NODES ---
  
  // Titan Preamp
  private titanGain: GainNode;
  private titanShape: WaveShaperNode;
  private titanDry: GainNode;
  private titanWet: GainNode;
  private titanLow: BiquadFilterNode;
  private titanMid: BiquadFilterNode;
  private titanHigh: BiquadFilterNode;
  private titanPres: BiquadFilterNode;
  private titanOut: GainNode;

  // Master Tape Delay
  private tapeDelayNode: DelayNode;
  private tapeFeedback: GainNode;
  private tapeFilter: BiquadFilterNode; // Lowpass for warmth
  private tapeSaturation: WaveShaperNode; // Tape grit
  private tapeLFO: OscillatorNode; // Wow/Flutter
  private tapeLFOGain: GainNode;
  private tapeDry: GainNode;
  private tapeWet: GainNode;
  private tapeOut: GainNode;

  // Amp Nodes
  private ampPreGain: GainNode;
  private ampContour: BiquadFilterNode; 
  private ampLow: BiquadFilterNode;
  private ampMid: BiquadFilterNode;
  private ampHigh: BiquadFilterNode;
  private ampPresence: BiquadFilterNode; 
  private ampMaster: GainNode; 
  private ampCabSim: BiquadFilterNode;

  private activeVoices: Map<number, { stop: (t: number) => void }> = new Map();

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.noiseBuffer = this.createTransientBuffer();
    
    this.masterGain = this.ctx.createGain();

    // --- 1. COMPRESSOR ---
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressorMakeup = this.ctx.createGain();

    // --- 3. AUTO-WAH ---
    this.wahFilter = this.ctx.createBiquadFilter();
    this.wahFilter.type = 'lowpass';
    this.wahGain = this.ctx.createGain(); 
    
    // --- 4. FUZZ ---
    this.fuzzShape = this.ctx.createWaveShaper();
    this.fuzzShape.oversample = '4x';
    this.fuzzFilter = this.ctx.createBiquadFilter();
    this.fuzzFilter.type = 'lowpass';
    this.fuzzGain = this.ctx.createGain();
    this.fuzzDry = this.ctx.createGain();
    this.fuzzWet = this.ctx.createGain();
    this.fuzzOut = this.ctx.createGain();

    this.fuzzGain.connect(this.fuzzShape);
    this.fuzzShape.connect(this.fuzzFilter);
    this.fuzzFilter.connect(this.fuzzWet);
    this.fuzzWet.connect(this.fuzzOut);
    this.fuzzDry.connect(this.fuzzOut);

    // --- 5. OVERDRIVE ---
    this.driveShape = this.ctx.createWaveShaper();
    this.driveShape.oversample = '4x';
    this.driveFilter = this.ctx.createBiquadFilter();
    this.driveFilter.type = 'lowpass';
    this.driveLow = this.ctx.createBiquadFilter();
    this.driveLow.type = 'lowshelf';
    this.driveLow.frequency.value = 100;
    this.driveHigh = this.ctx.createBiquadFilter();
    this.driveHigh.type = 'highshelf';
    this.driveHigh.frequency.value = 3000;

    this.driveGain = this.ctx.createGain();
    this.driveDry = this.ctx.createGain();
    this.driveWet = this.ctx.createGain();
    this.driveOut = this.ctx.createGain();

    this.driveGain.connect(this.driveShape);
    this.driveShape.connect(this.driveLow);
    this.driveLow.connect(this.driveHigh);
    this.driveHigh.connect(this.driveFilter);
    this.driveFilter.connect(this.driveWet);
    this.driveWet.connect(this.driveOut);
    this.driveDry.connect(this.driveOut);

    // --- 6. CHORUS ---
    this.chorusDelay = this.ctx.createDelay();
    this.chorusLFO = this.ctx.createOscillator();
    this.chorusLFOGain = this.ctx.createGain();
    this.chorusDry = this.ctx.createGain();
    this.chorusWet = this.ctx.createGain();
    this.chorusOut = this.ctx.createGain();

    this.chorusLFO.connect(this.chorusLFOGain);
    this.chorusLFOGain.connect(this.chorusDelay.delayTime);
    this.chorusLFO.start();

    this.chorusDelay.connect(this.chorusWet);
    this.chorusWet.connect(this.chorusOut);
    this.chorusDry.connect(this.chorusOut);

    // --- 7. PHASER ---
    this.phaserLFO = this.ctx.createOscillator();
    this.phaserLFOGain = this.ctx.createGain();
    this.phaserLFO.start();
    
    for (let i = 0; i < 4; i++) {
        const f = this.ctx.createBiquadFilter();
        f.type = 'allpass';
        this.phaserFilters.push(f);
        this.phaserLFO.connect(this.phaserLFOGain);
        this.phaserLFOGain.connect(f.frequency);
        if (i > 0) this.phaserFilters[i-1].connect(f);
    }
    this.phaserDry = this.ctx.createGain();
    this.phaserWet = this.ctx.createGain();
    this.phaserOut = this.ctx.createGain();

    this.phaserFilters[3].connect(this.phaserWet);
    this.phaserWet.connect(this.phaserOut);
    this.phaserDry.connect(this.phaserOut);

    // --- 8. DELAY ---
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayFeedback = this.ctx.createGain();
    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayDry = this.ctx.createGain();
    this.delayWet = this.ctx.createGain();
    this.delayOut = this.ctx.createGain();

    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayWet);
    this.delayWet.connect(this.delayOut);
    this.delayDry.connect(this.delayOut);

    // --- 9. REVERB ---
    this.reverbPreDelay = this.ctx.createDelay(0.5);
    this.reverbNode = this.ctx.createConvolver();
    this.reverbDry = this.ctx.createGain();
    this.reverbWet = this.ctx.createGain();
    this.reverbOut = this.ctx.createGain();

    this.reverbPreDelay.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbWet);
    this.reverbWet.connect(this.reverbOut);
    this.reverbDry.connect(this.reverbOut);

    // --- 10. EQ ---
    this.eqLow = this.ctx.createBiquadFilter();
    this.eqLow.type = 'lowshelf';
    this.eqLow.frequency.value = 80;
    this.eqLowMid = this.ctx.createBiquadFilter();
    this.eqLowMid.type = 'peaking';
    this.eqLowMid.frequency.value = 400;
    this.eqHighMid = this.ctx.createBiquadFilter();
    this.eqHighMid.type = 'peaking';
    this.eqHighMid.frequency.value = 1200;
    this.eqHigh = this.ctx.createBiquadFilter();
    this.eqHigh.type = 'highshelf';
    this.eqHigh.frequency.value = 4000;
    this.eqPresence = this.ctx.createBiquadFilter();
    this.eqPresence.type = 'peaking';
    this.eqPresence.frequency.value = 8000;

    // --- 11. TITAN PREAMP (New Large Pedal) ---
    this.titanGain = this.ctx.createGain();
    this.titanShape = this.ctx.createWaveShaper();
    this.titanShape.oversample = '4x';
    this.titanDry = this.ctx.createGain();
    this.titanWet = this.ctx.createGain();
    this.titanLow = this.ctx.createBiquadFilter();
    this.titanLow.type = 'lowshelf';
    this.titanLow.frequency.value = 100;
    this.titanMid = this.ctx.createBiquadFilter();
    this.titanMid.type = 'peaking';
    this.titanMid.frequency.value = 500;
    this.titanHigh = this.ctx.createBiquadFilter();
    this.titanHigh.type = 'highshelf';
    this.titanHigh.frequency.value = 3000;
    this.titanPres = this.ctx.createBiquadFilter();
    this.titanPres.type = 'peaking';
    this.titanPres.frequency.value = 5000;
    this.titanOut = this.ctx.createGain();

    this.titanGain.connect(this.titanShape);
    this.titanShape.connect(this.titanLow);
    this.titanLow.connect(this.titanMid);
    this.titanMid.connect(this.titanHigh);
    this.titanHigh.connect(this.titanPres);
    this.titanPres.connect(this.titanWet);
    this.titanWet.connect(this.titanOut);
    this.titanDry.connect(this.titanOut);

    // --- 12. MASTER TAPE DELAY (New Large Pedal) ---
    this.tapeDelayNode = this.ctx.createDelay(1.0);
    this.tapeFeedback = this.ctx.createGain();
    this.tapeFilter = this.ctx.createBiquadFilter();
    this.tapeFilter.type = 'lowpass';
    this.tapeFilter.frequency.value = 3000; // Darker repeats
    this.tapeSaturation = this.ctx.createWaveShaper();
    this.tapeSaturation.curve = this.makeDistortionCurve(0.5);
    this.tapeLFO = this.ctx.createOscillator();
    this.tapeLFO.frequency.value = 0.5; // Slow modulation
    this.tapeLFOGain = this.ctx.createGain();
    
    this.tapeDry = this.ctx.createGain();
    this.tapeWet = this.ctx.createGain();
    this.tapeOut = this.ctx.createGain();

    this.tapeLFO.connect(this.tapeLFOGain);
    this.tapeLFOGain.connect(this.tapeDelayNode.delayTime);
    this.tapeLFO.start();

    this.tapeDelayNode.connect(this.tapeSaturation);
    this.tapeSaturation.connect(this.tapeFilter);
    this.tapeFilter.connect(this.tapeFeedback);
    this.tapeFeedback.connect(this.tapeDelayNode);
    
    this.tapeDelayNode.connect(this.tapeWet);
    this.tapeWet.connect(this.tapeOut);
    this.tapeDry.connect(this.tapeOut);

    // --- AMP ---
    this.ampPreGain = this.ctx.createGain();
    this.ampContour = this.ctx.createBiquadFilter();
    this.ampContour.type = 'peaking';
    this.ampContour.frequency.value = 500;
    this.ampLow = this.ctx.createBiquadFilter();
    this.ampLow.type = 'lowshelf';
    this.ampMid = this.ctx.createBiquadFilter();
    this.ampMid.type = 'peaking';
    this.ampHigh = this.ctx.createBiquadFilter();
    this.ampHigh.type = 'highshelf';
    this.ampPresence = this.ctx.createBiquadFilter();
    this.ampPresence.type = 'highshelf';
    this.ampPresence.frequency.value = 5000;
    this.ampCabSim = this.ctx.createBiquadFilter();
    this.ampCabSim.type = 'lowpass';
    this.ampMaster = this.ctx.createGain();

    this.envelopeFollower = this.ctx.createGain();

    // === BUILD CHAIN ===
    // Chain: ... EQ -> Titan Preamp -> Master Delay -> Amp ...

    this.compressor.connect(this.compressorMakeup);
    this.compressorMakeup.connect(this.wahFilter);
    this.wahFilter.connect(this.fuzzGain); this.wahFilter.connect(this.fuzzDry);
    this.fuzzOut.connect(this.driveGain); this.fuzzOut.connect(this.driveDry);
    this.driveOut.connect(this.chorusDelay); this.driveOut.connect(this.chorusDry); this.driveOut.connect(this.chorusSplitterInput());
    this.chorusOut.connect(this.phaserFilters[0]); this.chorusOut.connect(this.phaserDry);
    this.phaserOut.connect(this.delayNode); this.phaserOut.connect(this.delayDry);
    this.delayOut.connect(this.reverbPreDelay); this.delayOut.connect(this.reverbDry);
    this.reverbOut.connect(this.eqLow);
    this.eqLow.connect(this.eqLowMid);
    this.eqLowMid.connect(this.eqHighMid);
    this.eqHighMid.connect(this.eqHigh);
    this.eqHigh.connect(this.eqPresence);
    this.eqPresence.connect(this.titanGain); this.eqPresence.connect(this.titanDry); // EQ into Titan
    
    // Titan Out -> Tape Delay
    this.titanOut.connect(this.tapeDelayNode); this.titanOut.connect(this.tapeDry);
    
    // Tape Out -> Amp
    this.tapeOut.connect(this.ampPreGain);
    
    this.ampPreGain.connect(this.ampContour);
    this.ampContour.connect(this.ampLow);
    this.ampLow.connect(this.ampMid);
    this.ampMid.connect(this.ampHigh);
    this.ampHigh.connect(this.ampPresence);
    this.ampPresence.connect(this.ampCabSim);
    this.ampCabSim.connect(this.ampMaster);
    this.ampMaster.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    
    this.generateReverbImpulse(2.0);
  }

  private chorusSplitterInput() { return this.chorusDelay; }

  public async init() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private createTransientBuffer(): AudioBuffer {
      const duration = 0.1;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      return buffer;
  }

  private generateReverbImpulse(duration: number) {
      const rate = this.ctx.sampleRate;
      const length = rate * duration;
      const impulse = this.ctx.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);
      for (let i = 0; i < length; i++) {
          const n = length - i;
          left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 2);
          right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, 2);
      }
      this.reverbNode.buffer = impulse;
  }
  
  public updateSettings(s: AudioSettings) {
    const t = this.ctx.currentTime;
    const ramp = 0.05;

    // ... (Existing small pedals logic remains same, updating large pedals below)

    // 1. Compressor
    if (s.compressor.enabled) {
        this.compressor.threshold.setTargetAtTime(s.compressor.threshold, t, ramp);
        this.compressor.ratio.setTargetAtTime(s.compressor.ratio, t, ramp);
        this.compressor.attack.setTargetAtTime(s.compressor.attack, t, ramp);
        this.compressor.release.setTargetAtTime(s.compressor.release, t, ramp);
        this.compressor.knee.setTargetAtTime(s.compressor.knee, t, ramp);
        this.compressorMakeup.gain.setTargetAtTime(1 + s.compressor.gain * 2, t, ramp);
    } else {
        this.compressor.threshold.setTargetAtTime(0, t, ramp);
        this.compressor.ratio.setTargetAtTime(1, t, ramp);
        this.compressorMakeup.gain.setTargetAtTime(1, t, ramp);
    }
    
    // 3. AutoWah
    if (s.autowah.enabled) {
        this.wahFilter.frequency.setTargetAtTime(200, t, ramp); 
        this.wahFilter.Q.setTargetAtTime(s.autowah.resonance, t, ramp);
    } else {
        this.wahFilter.frequency.setTargetAtTime(20000, t, ramp); 
        this.wahFilter.Q.setTargetAtTime(0, t, ramp);
    }

    // 4. Fuzz
    const fuzzMix = s.fuzz.enabled ? 1 : 0;
    this.fuzzDry.gain.setTargetAtTime(1 - fuzzMix, t, ramp);
    this.fuzzWet.gain.setTargetAtTime(fuzzMix, t, ramp);
    if (s.fuzz.enabled) {
        this.fuzzShape.curve = this.makeFuzzCurve(s.fuzz.gain, s.fuzz.bias);
        this.fuzzFilter.frequency.setTargetAtTime(500 + s.fuzz.tone * 3000, t, ramp);
        this.fuzzGain.gain.setTargetAtTime(1 + s.fuzz.gain * 5, t, ramp);
    }

    // 5. Overdrive
    const driveMix = s.overdrive.enabled ? 1 : 0;
    this.driveDry.gain.setTargetAtTime(1 - driveMix, t, ramp);
    this.driveWet.gain.setTargetAtTime(driveMix, t, ramp);
    if (s.overdrive.enabled) {
        this.driveShape.curve = this.makeDistortionCurve(s.overdrive.drive);
        this.driveFilter.frequency.setTargetAtTime(800 + s.overdrive.tone * 5000, t, ramp);
        this.driveLow.gain.setTargetAtTime(s.overdrive.bass, t, ramp);
        this.driveHigh.gain.setTargetAtTime(s.overdrive.treble, t, ramp);
        this.driveGain.gain.setTargetAtTime(1 + s.overdrive.drive, t, ramp);
        this.driveOut.gain.setTargetAtTime(s.overdrive.level, t, ramp);
    } else {
        this.driveOut.gain.setTargetAtTime(1, t, ramp);
    }

    // 6. Chorus
    const chorusMix = s.chorus.enabled ? s.chorus.mix : 0;
    this.chorusDry.gain.setTargetAtTime(s.chorus.enabled ? (1 - s.chorus.mix) : 1, t, ramp);
    this.chorusWet.gain.setTargetAtTime(chorusMix, t, ramp);
    this.chorusLFO.frequency.setTargetAtTime(s.chorus.rate, t, ramp);
    this.chorusLFOGain.gain.setTargetAtTime(s.chorus.depth * 0.005, t, ramp);
    this.chorusDelay.delayTime.setTargetAtTime(0.01 + s.chorus.delay * 0.05, t, ramp);

    // 7. Phaser
    const phaserMix = s.phaser.enabled ? 0.5 : 0; 
    this.phaserDry.gain.setTargetAtTime(s.phaser.enabled ? 0.5 : 1, t, ramp);
    this.phaserWet.gain.setTargetAtTime(phaserMix, t, ramp);
    this.phaserLFO.frequency.setTargetAtTime(s.phaser.rate, t, ramp);
    this.phaserLFOGain.gain.setTargetAtTime(s.phaser.depth * 500, t, ramp);
    // Base frequency shift
    for (const f of this.phaserFilters) {
        f.frequency.setTargetAtTime(200 + s.phaser.base * 1000, t, ramp);
    }

    // 8. Delay
    const delayMix = s.delay.enabled ? s.delay.mix : 0;
    this.delayDry.gain.setTargetAtTime(s.delay.enabled ? (1-s.delay.mix) : 1, t, ramp);
    this.delayWet.gain.setTargetAtTime(delayMix, t, ramp);
    this.delayNode.delayTime.setTargetAtTime(s.delay.time, t, ramp);
    this.delayFeedback.gain.setTargetAtTime(s.delay.feedback, t, ramp);
    this.delayFilter.frequency.setTargetAtTime(20000 - (s.delay.filter * 15000), t, ramp);

    // 9. Reverb
    const reverbMix = s.reverb.enabled ? s.reverb.mix : 0;
    this.reverbDry.gain.setTargetAtTime(s.reverb.enabled ? (1-s.reverb.mix) : 1, t, ramp);
    this.reverbWet.gain.setTargetAtTime(reverbMix, t, ramp);
    this.reverbPreDelay.delayTime.setTargetAtTime(s.reverb.preDelay, t, ramp);
    
    // 10. EQ
    if (s.eq.enabled) {
        this.eqLow.gain.setTargetAtTime(s.eq.low, t, ramp);
        this.eqLowMid.gain.setTargetAtTime(s.eq.lowMid, t, ramp);
        this.eqHighMid.gain.setTargetAtTime(s.eq.highMid, t, ramp);
        this.eqHigh.gain.setTargetAtTime(s.eq.high, t, ramp);
        this.eqPresence.gain.setTargetAtTime(s.eq.presence, t, ramp);
    } else {
        this.eqLow.gain.setTargetAtTime(0, t, ramp);
        this.eqLowMid.gain.setTargetAtTime(0, t, ramp);
        this.eqHighMid.gain.setTargetAtTime(0, t, ramp);
        this.eqHigh.gain.setTargetAtTime(0, t, ramp);
        this.eqPresence.gain.setTargetAtTime(0, t, ramp);
    }

    // --- 11. TITAN PREAMP (New) ---
    const titanBlend = s.titanPreamp.enabled ? s.titanPreamp.blend : 0;
    this.titanDry.gain.setTargetAtTime(1 - titanBlend, t, ramp);
    this.titanWet.gain.setTargetAtTime(titanBlend, t, ramp);
    
    if (s.titanPreamp.enabled) {
        this.titanShape.curve = this.makeDistortionCurve(s.titanPreamp.drive);
        this.titanGain.gain.setTargetAtTime(1 + s.titanPreamp.drive * 2, t, ramp);
        this.titanLow.gain.setTargetAtTime(s.titanPreamp.bass, t, ramp);
        this.titanMid.gain.setTargetAtTime(s.titanPreamp.mid, t, ramp);
        this.titanHigh.gain.setTargetAtTime(s.titanPreamp.treble, t, ramp);
        this.titanPres.gain.setTargetAtTime(s.titanPreamp.presence, t, ramp);
    }

    // --- 12. MASTER DELAY (New) ---
    const tapeMix = s.masterDelay.enabled ? s.masterDelay.mix : 0;
    this.tapeDry.gain.setTargetAtTime(s.masterDelay.enabled ? (1 - s.masterDelay.mix) : 1, t, ramp);
    this.tapeWet.gain.setTargetAtTime(tapeMix, t, ramp);
    
    this.tapeDelayNode.delayTime.setTargetAtTime(s.masterDelay.time, t, ramp);
    this.tapeFeedback.gain.setTargetAtTime(s.masterDelay.feedback, t, ramp);
    this.tapeLFOGain.gain.setTargetAtTime(s.masterDelay.modulation * 0.002, t, ramp);
    
    if (s.masterDelay.enabled) {
         this.tapeSaturation.curve = this.makeDistortionCurve(s.masterDelay.saturation);
    }

    // Amp & Master
    this.setAmpProfile(s.ampType);
    this.ampContour.gain.setTargetAtTime(s.ampContour, t, ramp);
    this.ampLow.gain.setTargetAtTime(s.ampBass, t, ramp);
    this.ampMid.gain.setTargetAtTime(s.ampMid, t, ramp);
    this.ampHigh.gain.setTargetAtTime(s.ampTreble, t, ramp);
    this.ampPresence.gain.setTargetAtTime(s.ampPresence, t, ramp);
    this.ampPreGain.gain.setTargetAtTime(Math.max(0.1, s.ampGain / 10), t, ramp); 
    this.ampMaster.gain.setTargetAtTime(s.ampMaster, t, ramp);
    this.masterGain.gain.setTargetAtTime(s.masterVolume * 0.2, t, ramp); 
  }

  private setAmpProfile(type: AmpType) {
    switch (type) {
      case AmpType.SVT:
        this.ampLow.frequency.value = 80; this.ampMid.frequency.value = 500; this.ampHigh.frequency.value = 3000;
        this.ampCabSim.frequency.value = 3500;
        break;
      case AmpType.BASSMAN:
        this.ampLow.frequency.value = 100; this.ampMid.frequency.value = 800; this.ampHigh.frequency.value = 2000;
        this.ampCabSim.frequency.value = 3000;
        break;
      // ... (Other cases same as before, simplified for brevity)
      default:
        this.ampLow.frequency.value = 80; this.ampMid.frequency.value = 500; this.ampHigh.frequency.value = 3000;
        this.ampCabSim.frequency.value = 3500;
    }
  }

  public playNote(baseFreq: number, technique: PlayingTechnique, settings: AudioSettings, stringIdx: number) {
    this.init();
    const t = this.ctx.currentTime;
    
    const detuneCents = settings.stringDetune[stringIdx] || 0;

    if (this.activeVoices.has(stringIdx)) {
        this.activeVoices.get(stringIdx)?.stop(t);
        this.activeVoices.delete(stringIdx);
    }

    // Nodes
    const oscSub = this.ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(baseFreq, t);
    oscSub.detune.value = detuneCents; // Applied directly for safety

    const oscHarm = this.ctx.createOscillator();
    oscHarm.type = 'sawtooth';
    oscHarm.frequency.setValueAtTime(baseFreq, t);
    oscHarm.detune.value = 3 + detuneCents;

    // Octaver Sub Oscillator
    let oscOctave: OscillatorNode | null = null;
    let oscOctaveUp: OscillatorNode | null = null;
    let octaveGain: GainNode | null = null;
    let octaveUpGain: GainNode | null = null;

    if (settings.octaver.enabled) {
        // Octave Down
        oscOctave = this.ctx.createOscillator();
        oscOctave.type = 'sine';
        oscOctave.frequency.setValueAtTime(baseFreq / 2, t);
        oscOctave.detune.value = detuneCents;
        octaveGain = this.ctx.createGain();
        octaveGain.gain.value = settings.octaver.sub1;
        oscOctave.connect(octaveGain);
        octaveGain.connect(this.compressor); 
        oscOctave.start(t);
        
        // Octave Up (New)
        if (settings.octaver.up > 0) {
            oscOctaveUp = this.ctx.createOscillator();
            oscOctaveUp.type = 'sawtooth';
            oscOctaveUp.frequency.setValueAtTime(baseFreq * 2, t);
            oscOctaveUp.detune.value = detuneCents;
            octaveUpGain = this.ctx.createGain();
            octaveUpGain.gain.value = settings.octaver.up * 0.5;
            oscOctaveUp.connect(octaveUpGain);
            octaveUpGain.connect(this.compressor);
            oscOctaveUp.start(t);
        }
    }

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1.0;

    const subGain = this.ctx.createGain();
    const harmGain = this.ctx.createGain();
    const noiseGain = this.ctx.createGain();
    const masterVoiceGain = this.ctx.createGain();

    oscSub.connect(subGain);
    subGain.connect(filter);
    oscHarm.connect(harmGain);
    harmGain.connect(filter);
    noiseNode.connect(noiseGain);
    noiseGain.connect(filter);

    filter.connect(masterVoiceGain);
    masterVoiceGain.connect(this.compressor);

    if (settings.autowah.enabled) {
        this.wahFilter.frequency.cancelScheduledValues(t);
        this.wahFilter.frequency.setValueAtTime(200, t);
        const sensitivity = settings.autowah.sensitivity * 2000 * settings.autowah.range;
        this.wahFilter.frequency.exponentialRampToValueAtTime(200 + sensitivity, t + 0.1);
        this.wahFilter.frequency.exponentialRampToValueAtTime(200, t + 0.1 + settings.autowah.decay);
    }

    // ... (Technique envelopes remain similar)
    // Params
    let attack = 0.005; let decay = 0.2; let sustain = 0.7; let release = 0.15; let naturalDecay = 8.0;
    let filterFreqStart = 3000; let filterFreqEnd = 150; let harmMix = 0.6; let noiseMix = 0.4;

    if (settings.pickupConfig === PickupType.JJ) { harmMix = 0.8; filterFreqStart = 3500; }
    else if (settings.pickupConfig === PickupType.PJ) { harmMix = 0.6; subGain.gain.value = 1.2; }
    else { harmMix = 0.9; filter.Q.value = 2; }

    if (technique === PlayingTechnique.SLAP) {
        attack = 0.002; filterFreqStart = 5000; noiseMix = 1.2; harmMix = 1.0; decay = 0.3; sustain = 0.5; naturalDecay = 5.0;
    } else if (technique === PlayingTechnique.POP) {
        attack = 0.002; filterFreqStart = 6000; noiseMix = 1.5; filter.Q.value = 4.0; naturalDecay = 4.0;
    } else if (technique === PlayingTechnique.MUTE) {
        attack = 0.01; decay = 0.1; sustain = 0; naturalDecay = 0.2; filterFreqStart = 600; noiseMix = 0.2;
    } else if (technique === PlayingTechnique.PICK) {
        attack = 0.005; filterFreqStart = 4500; noiseMix = 0.8; naturalDecay = 7.0;
    }

    masterVoiceGain.gain.setValueAtTime(0, t);
    masterVoiceGain.gain.linearRampToValueAtTime(0.7, t + attack); // Reduced Peak
    masterVoiceGain.gain.exponentialRampToValueAtTime(sustain * 0.7, t + attack + decay);
    masterVoiceGain.gain.setTargetAtTime(0, t + attack + decay, naturalDecay / 3);

    subGain.gain.value = 0.8;
    harmGain.gain.value = harmMix;
    noiseGain.gain.setValueAtTime(noiseMix, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    filter.frequency.setValueAtTime(filterFreqStart, t);
    filter.frequency.exponentialRampToValueAtTime(filterFreqEnd + baseFreq, t + decay * 1.5);

    oscSub.start(t);
    oscHarm.start(t);
    noiseNode.start(t);

    const stopFn = (stopTime: number) => {
        masterVoiceGain.gain.cancelScheduledValues(stopTime);
        masterVoiceGain.gain.setValueAtTime(masterVoiceGain.gain.value, stopTime);
        masterVoiceGain.gain.linearRampToValueAtTime(0, stopTime + release);
        
        oscSub.stop(stopTime + release + 0.2);
        oscHarm.stop(stopTime + release + 0.2);
        if (oscOctave) oscOctave.stop(stopTime + release + 0.2);
        if (oscOctaveUp) oscOctaveUp.stop(stopTime + release + 0.2);
        noiseNode.stop(stopTime + release + 0.2);

        setTimeout(() => {
            masterVoiceGain.disconnect();
            filter.disconnect();
            oscSub.disconnect();
            oscHarm.disconnect();
        }, (release + 0.3) * 1000);
    };

    this.activeVoices.set(stringIdx, { stop: stopFn });
  }

  // Soft Clipping (Now with bias)
  private makeFuzzCurve(amount: number, bias: number = 0) {
      const k = amount * 50; 
      const n = 44100;
      const curve = new Float32Array(n);
      for (let i = 0; i < n; ++i) {
        let x = (i * 2) / n - 1;
        x = x + bias * 0.5; // Offset
        if (x > 0) curve[i] = 1 - Math.exp(-k * x);
        else curve[i] = -1 + Math.exp(k * x);
      }
      return curve;
  }
  
  private makeDistortionCurve(amount: number) {
    // ... same as before
    const k = amount * 10;
    const n = 44100;
    const curve = new Float32Array(n);
    const deg = Math.PI / 180;
    for (let i = 0; i < n; ++i) {
      let x = (i * 2) / n - 1;
      curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}
