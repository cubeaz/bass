
import React, { useState, useEffect } from 'react';
import { BassGuitar } from './components/BassGuitar';
import { Knob } from './components/Knob';
import { Switch } from './components/Switch'; // Assuming Switch is available or use Knob for toggle
import { Pedal } from './components/Pedal';
import { AmpControls } from './components/AmpControls';
import { AudioEngine } from './services/AudioEngine';
import { AmpType, AudioSettings, NoteInfo, PickupType, PlayingTechnique, BassSkin } from './types';
import { STRING_TUNINGS, getFrequency } from './constants';
import { Mic2, Music, Zap, Speaker, Volume2, Palette } from 'lucide-react';

const audioEngine = new AudioEngine();

const App: React.FC = () => {
  const [settings, setSettings] = useState<AudioSettings>({
    masterVolume: 0.6,
    
    // Default Skin
    bassSkin: BassSkin.CLASSIC,

    pickupConfig: PickupType.JJ,
    neckPickupVol: 10,
    neckPickupTone: 8.5,
    bridgePickupVol: 10,
    bridgePickupTone: 8.5,
    stringDetune: [0, 0, 0, 0], 
    
    // Expanded Amp Settings
    ampType: AmpType.SVT,
    ampGain: 6,
    ampBass: 2,
    ampMid: -1,
    ampTreble: 3,
    ampPresence: 5,
    ampMaster: 8,
    ampContour: 0,

    // Expanded Pedal Settings
    compressor: { enabled: true, threshold: -20, ratio: 4, attack: 0.05, release: 0.2, knee: 10, gain: 2 },
    octaver: { enabled: false, sub1: 1, sub2: 0, dry: 1, up: 0 },
    autowah: { enabled: false, sensitivity: 0.5, decay: 0.3, range: 1, resonance: 5 },
    fuzz: { enabled: false, gain: 0.5, tone: 0.5, gate: 0, bias: 0 },
    overdrive: { enabled: true, drive: 2, tone: 6, level: 1, bass: 0, treble: 0 },
    chorus: { enabled: false, rate: 1.5, depth: 0.5, mix: 0.5, delay: 0.2 },
    phaser: { enabled: false, rate: 2, depth: 0.8, feedback: 0.5, base: 0.2 },
    delay: { enabled: false, time: 0.3, feedback: 0.4, mix: 0.3, filter: 0.2 },
    reverb: { enabled: false, decay: 2, size: 0.8, mix: 0.3, preDelay: 0.05 },
    eq: { enabled: false, low: 0, lowMid: 0, highMid: 0, high: 0, presence: 0 },

    // New Large Pedals
    titanPreamp: { enabled: false, drive: 3, blend: 0.8, bass: 2, mid: 1, treble: 4, presence: 5 },
    masterDelay: { enabled: false, time: 0.4, feedback: 0.3, mix: 0.4, saturation: 2, modulation: 1 }
  });

  const [technique, setTechnique] = useState<PlayingTechnique>(PlayingTechnique.FINGER);

  useEffect(() => {
    audioEngine.updateSettings(settings);
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        switch(e.key.toLowerCase()) {
            case 's': setTechnique(PlayingTechnique.SLAP); break;
            case 'p': setTechnique(PlayingTechnique.POP); break;
            case 'm': setTechnique(PlayingTechnique.MUTE); break;
        }
    };
    const handleKeyUp = () => {
        setTechnique(PlayingTechnique.FINGER);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handlePlayNote = (info: NoteInfo) => {
    const freq = getFrequency(STRING_TUNINGS[info.stringIdx], info.fret);
    audioEngine.playNote(freq, technique, settings, info.stringIdx);
  };

  const updateSetting = (category: keyof AudioSettings, param: string, val: any) => {
      setSettings(prev => {
          if (typeof prev[category] === 'object' && prev[category] !== null && !Array.isArray(prev[category])) {
              return { ...prev, [category]: { ...(prev[category] as any), [param]: val } };
          }
          return { ...prev, [category]: val };
      });
  };

  const updateTopLevel = (key: keyof AudioSettings, val: any) => {
      setSettings(prev => ({ ...prev, [key]: val }));
  };
  
  const handleTune = (idx: number, val: number) => {
      const newDetune = [...settings.stringDetune];
      newDetune[idx] = val;
      updateTopLevel('stringDetune', newDetune);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden p-2 lg:p-4">
      <div className="max-w-[1400px] mx-auto space-y-4 lg:space-y-8 flex flex-col">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-gray-800 pb-4 gap-4 lg:gap-0">
            <div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    GROOVEMASTER PRO
                </h1>
                <p className="text-gray-400 text-xs lg:text-sm mt-1">10-FX Pedalboard & 10 Amp Heads</p>
            </div>
            <div className="flex gap-4 items-center w-full lg:w-auto justify-between lg:justify-end">
                 
                 {/* Master Volume with Conspicuous Label */}
                 <div className="flex items-center gap-4 mr-4 relative">
                    <div className="hidden lg:block absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-extrabold text-sm px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-bounce whitespace-nowrap z-50 pointer-events-none">
                       ▼ 这里可以调节全局音量
                    </div>
                    {/* Mobile Label */}
                    <span className="lg:hidden text-yellow-500 font-bold text-xs whitespace-nowrap">这里可以调节全局音量 -></span>
                    
                    <Volume2 size={24} className="text-gray-300" />
                    <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={settings.masterVolume} 
                        onChange={(e) => updateTopLevel('masterVolume', parseFloat(e.target.value))}
                        className="w-32 lg:w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-purple-400"
                    />
                 </div>

                 <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
                    <Music size={16} className="text-purple-400" />
                    <span className="text-xs font-bold uppercase text-gray-300">Technique: <span className="text-white">{technique}</span></span>
                 </div>
            </div>
        </header>

        {/* Studio/Instrument View */}
        <section className="relative bg-[#0a0a0a] rounded-xl border border-gray-800 shadow-2xl p-2 lg:p-4">
            
            {/* Header / Skin Selector Bar */}
            <div className="absolute top-0 left-0 right-0 flex justify-between items-start px-4 z-20">
                 <div className="bg-gray-800 px-3 py-1 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-gray-400 rounded-b-lg border-b border-x border-gray-700">
                    Fender Jazz Bass '62
                </div>
                
                {/* SKIN SELECTOR */}
                <div className="flex flex-col items-end mt-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-400 mb-1">
                        <Palette size={12} />
                        <span>点击这里切换外观风格</span>
                    </div>
                    <div className="flex gap-1 bg-gray-800/80 p-1 rounded-lg border border-gray-700 backdrop-blur-sm">
                        {[BassSkin.CLASSIC, BassSkin.MODERN, BassSkin.VINTAGE, BassSkin.CYBER].map((skin) => (
                            <button
                                key={skin}
                                onClick={() => updateTopLevel('bassSkin', skin)}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                                    settings.bassSkin === skin 
                                    ? 'bg-purple-600 text-white shadow-md' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                {skin}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto pb-4 custom-scrollbar -mx-2 lg:mx-0 px-2 lg:px-0 pt-16">
                <div className="min-w-[1200px]">
                    <BassGuitar 
                        onPlayNote={handlePlayNote} 
                        currentTechnique={technique}
                        pickupConfig={settings.pickupConfig}
                        tuningValues={settings.stringDetune}
                        onTune={handleTune}
                        skin={settings.bassSkin}
                    />
                </div>
            </div>
            
            {/* Bass Controls */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 bg-[#181818] p-4 lg:p-6 rounded-xl border border-gray-800">
                 <div className="flex flex-col gap-4">
                    <h3 className="text-gray-400 uppercase text-xs font-bold flex items-center gap-2">
                        <Mic2 size={20} /> Pickup Wiring
                        <span className="normal-case font-bold text-lg text-yellow-500/90 ml-2 tracking-wide">这里可以调整线圈类型</span>
                    </h3>
                    <div className="flex gap-2 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
                        {[PickupType.JJ, PickupType.PJ, PickupType.MMJ].map(type => (
                            <button 
                                key={type}
                                onClick={() => updateTopLevel('pickupConfig', type)}
                                className={`px-4 py-2 rounded font-bold text-xs lg:text-sm transition-all whitespace-nowrap ${settings.pickupConfig === type ? 'bg-orange-700 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                 </div>

                 <div className="flex gap-4 lg:gap-8 justify-center lg:justify-end overflow-x-auto pb-2 lg:pb-0">
                     <div className="flex gap-2 lg:gap-4 bg-black/20 p-2 lg:p-4 rounded-xl border border-white/5 relative min-w-max">
                        <div className="text-center text-[10px] text-gray-500 mb-2 w-full absolute -top-2 lg:-top-3 left-0 bg-[#181818] px-1 w-auto mx-auto right-0">NECK</div>
                        <Knob label="Vol" value={settings.neckPickupVol} onChange={(v) => updateTopLevel('neckPickupVol', v)} size="sm" color="gold" />
                        <Knob label="Tone" value={settings.neckPickupTone} onChange={(v) => updateTopLevel('neckPickupTone', v)} size="sm" color="gold" />
                     </div>
                     <div className="flex gap-2 lg:gap-4 bg-black/20 p-2 lg:p-4 rounded-xl border border-white/5 relative min-w-max">
                        <div className="text-center text-[10px] text-gray-500 mb-2 w-full absolute -top-2 lg:-top-3 left-0 bg-[#181818] px-1 w-auto mx-auto right-0">BRIDGE</div>
                        <Knob label="Vol" value={settings.bridgePickupVol} onChange={(v) => updateTopLevel('bridgePickupVol', v)} size="sm" color="gold" />
                        <Knob label="Tone" value={settings.bridgePickupTone} onChange={(v) => updateTopLevel('bridgePickupTone', v)} size="sm" color="gold" />
                     </div>
                 </div>
            </div>
        </section>

        {/* 10-Pedal Signal Chain */}
        <section className="bg-[#202020] p-4 lg:p-6 rounded-xl border border-gray-700 relative overflow-hidden shadow-xl order-last lg:order-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-40 pointer-events-none"></div>
            <div className="relative z-10">
                <h3 className="text-gray-400 uppercase text-xs font-bold flex items-center gap-2 mb-4 lg:mb-6">
                    <Zap size={20} /> FX Chain (12 Units)
                    <span className="normal-case font-bold text-lg text-yellow-500/90 ml-2 tracking-wide">这些是效果器</span>
                </h3>
                {/* Horizontal Scroll Container */}
                <div className="overflow-x-auto pb-6 custom-scrollbar">
                    <div className="flex flex-nowrap gap-3 lg:gap-4 min-w-max px-2">
                        
                        {/* 1. COMPRESSOR */}
                        <Pedal name="Comp" color="bg-red-700" enabled={settings.compressor.enabled} onToggle={(v) => updateSetting('compressor', 'enabled', v)}>
                            <Knob label="Thresh" value={Math.abs(settings.compressor.threshold)/5} max={10} onChange={(v) => updateSetting('compressor', 'threshold', -v*5)} size="sm" color="black" />
                            <Knob label="Ratio" value={settings.compressor.ratio} max={10} onChange={(v) => updateSetting('compressor', 'ratio', v)} size="sm" color="black" />
                            <Knob label="Attack" value={settings.compressor.attack * 100} max={10} onChange={(v) => updateSetting('compressor', 'attack', v/100)} size="sm" color="black" />
                            <Knob label="Knee" value={settings.compressor.knee} max={40} onChange={(v) => updateSetting('compressor', 'knee', v)} size="sm" color="black" />
                            <Knob label="MakeUp" value={settings.compressor.gain} max={10} onChange={(v) => updateSetting('compressor', 'gain', v)} size="sm" color="black" />
                        </Pedal>

                        {/* 2. OCTAVER */}
                        <Pedal name="Octave" color="bg-blue-900" enabled={settings.octaver.enabled} onToggle={(v) => updateSetting('octaver', 'enabled', v)}>
                            <Knob label="Sub 1" value={settings.octaver.sub1 * 10} max={10} onChange={(v) => updateSetting('octaver', 'sub1', v/10)} size="sm" color="black" />
                            <Knob label="Sub 2" value={settings.octaver.sub2 * 10} max={10} onChange={(v) => updateSetting('octaver', 'sub2', v/10)} size="sm" color="black" />
                            <Knob label="Up" value={settings.octaver.up * 10} max={10} onChange={(v) => updateSetting('octaver', 'up', v/10)} size="sm" color="black" />
                            <Knob label="Dry" value={settings.octaver.dry * 10} max={10} onChange={(v) => updateSetting('octaver', 'dry', v/10)} size="sm" color="black" />
                        </Pedal>

                        {/* 3. AUTO-WAH */}
                        <Pedal name="FunkWah" color="bg-purple-700" enabled={settings.autowah.enabled} onToggle={(v) => updateSetting('autowah', 'enabled', v)}>
                            <Knob label="Sens" value={settings.autowah.sensitivity * 10} max={10} onChange={(v) => updateSetting('autowah', 'sensitivity', v/10)} size="sm" color="black" />
                            <Knob label="Decay" value={settings.autowah.decay * 10} max={10} onChange={(v) => updateSetting('autowah', 'decay', v/10)} size="sm" color="black" />
                            <Knob label="Q" value={settings.autowah.resonance} max={20} onChange={(v) => updateSetting('autowah', 'resonance', v)} size="sm" color="black" />
                            <Knob label="Range" value={settings.autowah.range} max={5} onChange={(v) => updateSetting('autowah', 'range', v)} size="sm" color="black" />
                        </Pedal>

                        {/* 4. FUZZ */}
                        <Pedal name="BigFuzz" color="bg-gray-300" enabled={settings.fuzz.enabled} onToggle={(v) => updateSetting('fuzz', 'enabled', v)}>
                            <Knob label="Gain" value={settings.fuzz.gain * 10} max={10} onChange={(v) => updateSetting('fuzz', 'gain', v/10)} size="sm" color="black" />
                            <Knob label="Tone" value={settings.fuzz.tone * 10} max={10} onChange={(v) => updateSetting('fuzz', 'tone', v/10)} size="sm" color="black" />
                            <Knob label="Bias" value={settings.fuzz.bias * 10} max={10} onChange={(v) => updateSetting('fuzz', 'bias', v/10)} size="sm" color="black" />
                            <Knob label="Gate" value={settings.fuzz.gate * 10} max={10} onChange={(v) => updateSetting('fuzz', 'gate', v/10)} size="sm" color="black" />
                        </Pedal>

                        {/* 5. OVERDRIVE */}
                        <Pedal name="Screamer" color="bg-green-600" enabled={settings.overdrive.enabled} onToggle={(v) => updateSetting('overdrive', 'enabled', v)}>
                            <Knob label="Drive" value={settings.overdrive.drive} max={10} onChange={(v) => updateSetting('overdrive', 'drive', v)} size="sm" color="black" />
                            <Knob label="Tone" value={settings.overdrive.tone} max={10} onChange={(v) => updateSetting('overdrive', 'tone', v)} size="sm" color="black" />
                            <Knob label="Bass" value={settings.overdrive.bass + 10} min={0} max={20} onChange={(v) => updateSetting('overdrive', 'bass', v - 10)} size="sm" color="black" />
                            <Knob label="Treb" value={settings.overdrive.treble + 10} min={0} max={20} onChange={(v) => updateSetting('overdrive', 'treble', v - 10)} size="sm" color="black" />
                            <Knob label="Level" value={settings.overdrive.level} max={2} onChange={(v) => updateSetting('overdrive', 'level', v)} size="sm" color="black" />
                        </Pedal>

                        {/* 6. CHORUS */}
                        <Pedal name="Chorus" color="bg-indigo-500" enabled={settings.chorus.enabled} onToggle={(v) => updateSetting('chorus', 'enabled', v)}>
                            <Knob label="Rate" value={settings.chorus.rate} max={10} onChange={(v) => updateSetting('chorus', 'rate', v)} size="sm" color="black" />
                            <Knob label="Depth" value={settings.chorus.depth * 10} max={10} onChange={(v) => updateSetting('chorus', 'depth', v/10)} size="sm" color="black" />
                            <Knob label="Delay" value={settings.chorus.delay * 10} max={10} onChange={(v) => updateSetting('chorus', 'delay', v/10)} size="sm" color="black" />
                            <Knob label="Mix" value={settings.chorus.mix * 10} max={10} onChange={(v) => updateSetting('chorus', 'mix', v/10)} size="sm" color="black" />
                        </Pedal>

                        {/* 7. PHASER */}
                        <Pedal name="Phaser" color="bg-orange-600" enabled={settings.phaser.enabled} onToggle={(v) => updateSetting('phaser', 'enabled', v)}>
                            <Knob label="Rate" value={settings.phaser.rate} max={10} onChange={(v) => updateSetting('phaser', 'rate', v)} size="sm" color="black" />
                            <Knob label="Depth" value={settings.phaser.depth * 10} max={10} onChange={(v) => updateSetting('phaser', 'depth', v/10)} size="sm" color="black" />
                            <Knob label="Feed" value={settings.phaser.feedback * 10} max={10} onChange={(v) => updateSetting('phaser', 'feedback', v/10)} size="sm" color="black" />
                            <Knob label="Base" value={settings.phaser.base * 10} max={10} onChange={(v) => updateSetting('phaser', 'base', v/10)} size="sm" color="black" />
                        </Pedal>

                         {/* 8. DELAY */}
                         <Pedal name="Delay" color="bg-teal-700" enabled={settings.delay.enabled} onToggle={(v) => updateSetting('delay', 'enabled', v)}>
                            <Knob label="Time" value={settings.delay.time * 10} max={10} onChange={(v) => updateSetting('delay', 'time', v/10)} size="sm" color="black" />
                            <Knob label="F.Back" value={settings.delay.feedback * 10} max={10} onChange={(v) => updateSetting('delay', 'feedback', v/10)} size="sm" color="black" />
                            <Knob label="Filter" value={settings.delay.filter * 10} max={10} onChange={(v) => updateSetting('delay', 'filter', v/10)} size="sm" color="black" />
                            <Knob label="Mix" value={settings.delay.mix * 10} max={10} onChange={(v) => updateSetting('delay', 'mix', v/10)} size="sm" color="black" />
                        </Pedal>

                        {/* 9. REVERB */}
                        <Pedal name="Reverb" color="bg-slate-500" enabled={settings.reverb.enabled} onToggle={(v) => updateSetting('reverb', 'enabled', v)}>
                            <Knob label="Decay" value={settings.reverb.decay} max={10} onChange={(v) => updateSetting('reverb', 'decay', v)} size="sm" color="black" />
                            <Knob label="Size" value={settings.reverb.size * 10} max={10} onChange={(v) => updateSetting('reverb', 'size', v/10)} size="sm" color="black" />
                            <Knob label="Pre" value={settings.reverb.preDelay * 100} max={10} onChange={(v) => updateSetting('reverb', 'preDelay', v/100)} size="sm" color="black" />
                            <Knob label="Mix" value={settings.reverb.mix * 10} max={10} onChange={(v) => updateSetting('reverb', 'mix', v/10)} size="sm" color="black" />
                        </Pedal>

                        {/* 10. EQ */}
                        <Pedal name="EQ-6" color="bg-gray-200" enabled={settings.eq.enabled} onToggle={(v) => updateSetting('eq', 'enabled', v)}>
                            <Knob label="Low" value={settings.eq.low + 10} min={0} max={20} onChange={(v) => updateSetting('eq', 'low', v - 10)} size="sm" color="black" />
                            <Knob label="L-Mid" value={settings.eq.lowMid + 10} min={0} max={20} onChange={(v) => updateSetting('eq', 'lowMid', v - 10)} size="sm" color="black" />
                            <Knob label="H-Mid" value={settings.eq.highMid + 10} min={0} max={20} onChange={(v) => updateSetting('eq', 'highMid', v - 10)} size="sm" color="black" />
                            <Knob label="High" value={settings.eq.high + 10} min={0} max={20} onChange={(v) => updateSetting('eq', 'high', v - 10)} size="sm" color="black" />
                            <Knob label="Pres" value={settings.eq.presence + 10} min={0} max={20} onChange={(v) => updateSetting('eq', 'presence', v - 10)} size="sm" color="black" />
                        </Pedal>

                        {/* 11. TITAN PREAMP (Large) */}
                        <Pedal name="Titan Pre" color="bg-[#1a1a1a]" enabled={settings.titanPreamp.enabled} onToggle={(v) => updateSetting('titanPreamp', 'enabled', v)} variant="large">
                            <Knob label="Drive" value={settings.titanPreamp.drive} max={10} onChange={(v) => updateSetting('titanPreamp', 'drive', v)} size="md" color="silver" />
                            <Knob label="Blend" value={settings.titanPreamp.blend * 10} max={10} onChange={(v) => updateSetting('titanPreamp', 'blend', v/10)} size="md" color="silver" />
                            <Knob label="Bass" value={settings.titanPreamp.bass + 10} min={0} max={20} onChange={(v) => updateSetting('titanPreamp', 'bass', v - 10)} size="md" color="silver" />
                            <Knob label="Mid" value={settings.titanPreamp.mid + 10} min={0} max={20} onChange={(v) => updateSetting('titanPreamp', 'mid', v - 10)} size="md" color="silver" />
                            <Knob label="Treb" value={settings.titanPreamp.treble + 10} min={0} max={20} onChange={(v) => updateSetting('titanPreamp', 'treble', v - 10)} size="md" color="silver" />
                            <Knob label="Pres" value={settings.titanPreamp.presence + 10} min={0} max={20} onChange={(v) => updateSetting('titanPreamp', 'presence', v - 10)} size="md" color="silver" />
                        </Pedal>

                        {/* 12. MASTER DELAY (Large) */}
                        <Pedal name="Master Tape" color="bg-[#0f172a]" enabled={settings.masterDelay.enabled} onToggle={(v) => updateSetting('masterDelay', 'enabled', v)} variant="large">
                            <Knob label="Time" value={settings.masterDelay.time * 10} max={10} onChange={(v) => updateSetting('masterDelay', 'time', v/10)} size="md" color="vintage" />
                            <Knob label="Feed" value={settings.masterDelay.feedback * 10} max={10} onChange={(v) => updateSetting('masterDelay', 'feedback', v/10)} size="md" color="vintage" />
                            <Knob label="Sat" value={settings.masterDelay.saturation * 10} max={10} onChange={(v) => updateSetting('masterDelay', 'saturation', v/10)} size="md" color="vintage" />
                            <Knob label="Mod" value={settings.masterDelay.modulation * 10} max={10} onChange={(v) => updateSetting('masterDelay', 'modulation', v/10)} size="md" color="vintage" />
                            <Knob label="Mix" value={settings.masterDelay.mix * 10} max={10} onChange={(v) => updateSetting('masterDelay', 'mix', v/10)} size="md" color="vintage" />
                        </Pedal>
                    </div>
                </div>
            </div>
        </section>

        {/* Amplifier */}
        <section className="bg-[#181818] p-4 lg:p-6 rounded-xl border border-gray-800 flex flex-col gap-4 lg:gap-6 shadow-xl">
             <h3 className="text-gray-400 uppercase text-xs font-bold flex items-center gap-2">
                <Speaker size={20} /> Amplifier Head
                <span className="normal-case font-bold text-lg text-yellow-500/90 ml-2 tracking-wide">这里是对总体的音色进行调节，点击上面那一栏可以切换不同的风格</span>
            </h3>
            {/* Scrollable Amp Selector */}
            <div className="flex gap-2 bg-black rounded p-1 border border-gray-700 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
                {Object.values(AmpType).map((amp) => (
                    <button 
                        key={amp} 
                        onClick={() => updateTopLevel('ampType', amp)} 
                        className={`flex-none px-3 py-2 text-[10px] uppercase font-bold rounded transition-colors whitespace-nowrap ${settings.ampType === amp ? 'bg-gray-700 text-white shadow-md' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        {amp.split(' ')[0]}
                    </button>
                ))}
            </div>
            <AmpControls 
                type={settings.ampType}
                gain={settings.ampGain} setGain={(v) => updateTopLevel('ampGain', v)}
                bass={settings.ampBass} setBass={(v) => updateTopLevel('ampBass', v)}
                mid={settings.ampMid} setMid={(v) => updateTopLevel('ampMid', v)}
                treble={settings.ampTreble} setTreble={(v) => updateTopLevel('ampTreble', v)}
                presence={settings.ampPresence} setPresence={(v) => updateTopLevel('ampPresence', v)}
                master={settings.ampMaster} setMaster={(v) => updateTopLevel('ampMaster', v)}
                contour={settings.ampContour} setContour={(v) => updateTopLevel('ampContour', v)}
            />
        </section>
      </div>
    </div>
  );
};

export default App;
