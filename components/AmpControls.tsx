
import React from 'react';
import { AmpType } from '../types';
import { Knob } from './Knob';

interface AmpControlsProps {
    type: AmpType;
    gain: number;
    setGain: (v: number) => void;
    bass: number;
    setBass: (v: number) => void;
    mid: number;
    setMid: (v: number) => void;
    treble: number;
    setTreble: (v: number) => void;
    // New Props
    presence: number;
    setPresence: (v: number) => void;
    master: number;
    setMaster: (v: number) => void;
    contour: number;
    setContour: (v: number) => void;
}

export const AmpControls: React.FC<AmpControlsProps> = ({ 
    type, gain, setGain, bass, setBass, mid, setMid, treble, setTreble,
    presence, setPresence, master, setMaster, contour, setContour
}) => {
  let bgClass = '';
  let logo = '';
  let knobColor: 'black' | 'vintage' | 'gold' | 'silver' = 'black';
  let logoClass = 'text-white';
  let containerBorder = 'border-gray-600';

  // Styles map (same as before)
  switch (type) {
    case AmpType.SVT:
        bgClass = 'bg-[#1a1a1a]'; logo = 'CLASSIC SVT'; knobColor = 'black'; logoClass = 'text-white font-bold tracking-widest'; break;
    case AmpType.BASSMAN:
        bgClass = 'bg-[#dcccba]'; containerBorder = 'border-[#8b5a2b]'; logo = 'BASSMAN'; knobColor = 'vintage'; logoClass = 'text-[#5c4033] font-serif tracking-wide'; break;
    case AmpType.MARKBASS:
        bgClass = 'bg-[#facc15]'; containerBorder = 'border-black'; logo = 'MarkBass'; knobColor = 'black'; logoClass = 'text-black font-extrabold italic'; break;
    case AmpType.ORANGE:
        bgClass = 'bg-[#ff6600]'; containerBorder = 'border-white'; logo = 'AD200B'; knobColor = 'black'; logoClass = 'text-white font-mono font-bold text-xl'; break;
    case AmpType.GK:
        bgClass = 'bg-gray-800'; containerBorder = 'border-gray-500'; logo = '800RB'; knobColor = 'silver'; logoClass = 'text-gray-300 font-mono tracking-tighter'; break;
    case AmpType.AGUILAR:
        bgClass = 'bg-[#e5e7eb]'; containerBorder = 'border-gray-400'; logo = 'TONE HAMMER'; knobColor = 'black'; logoClass = 'text-black font-sans font-semibold tracking-[0.2em] text-xs'; break;
    case AmpType.TRACE:
        bgClass = 'bg-[#052e16]'; containerBorder = 'border-[#22c55e]'; logo = 'TRACE ELLIOT'; knobColor = 'silver'; logoClass = 'text-[#22c55e] font-sans font-bold tracking-wider'; break;
    case AmpType.DARKGLASS:
        bgClass = 'bg-[#171717]'; containerBorder = 'border-gray-700'; logo = 'MICROTUBES'; knobColor = 'black'; logoClass = 'text-gray-400 font-light tracking-[0.3em] uppercase'; break;
    case AmpType.ACOUSTIC:
        bgClass = 'bg-[#0f172a]'; containerBorder = 'border-blue-400'; logo = '360'; knobColor = 'silver'; logoClass = 'text-blue-300 font-bold text-2xl font-serif italic'; break;
    case AmpType.B15:
        bgClass = 'bg-[#2a3038]'; containerBorder = 'border-gray-600'; logo = 'PORTAFLEX'; knobColor = 'vintage'; logoClass = 'text-blue-200 font-serif font-bold tracking-wide italic'; break;
  }

  return (
    <div className={`w-full p-4 lg:p-6 rounded-lg border-4 shadow-2xl relative flex flex-col items-center gap-4 ${bgClass} ${containerBorder}`}>
       {type === AmpType.SVT && <div className="absolute inset-0 bg-[radial-gradient(circle,_#333_1px,_transparent_1px)] bg-[length:4px_4px] opacity-20 pointer-events-none"></div>}
       {type === AmpType.BASSMAN && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] opacity-30 pointer-events-none"></div>}
       {type === AmpType.B15 && <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)] opacity-10 pointer-events-none"></div>}

       <div className={`z-10 px-4 py-1 rounded border border-white/10 mb-2 ${type === AmpType.BASSMAN ? 'bg-[#f0e6d2]/80' : 'bg-black/50'}`}>
           <h2 className={`${logoClass}`}>{logo}</h2>
       </div>

       <div className="z-10 flex flex-wrap justify-center gap-4 lg:gap-8">
           {/* Input Stage */}
           <div className="flex gap-2">
                <Knob label="Gain" value={gain} onChange={setGain} color={knobColor} size="md" />
                <Knob label="Contour" value={contour} min={-10} max={10} onChange={setContour} color={knobColor} size="md" />
           </div>
           
           <div className="hidden md:block w-px h-16 bg-black/20 mx-2"></div>
           
           {/* EQ Stage */}
           <div className="flex gap-2">
                <Knob label="Bass" value={bass} min={-10} max={10} onChange={setBass} color={knobColor} size="md" />
                <Knob label="Mid" value={mid} min={-10} max={10} onChange={setMid} color={knobColor} size="md" />
                <Knob label="Treble" value={treble} min={-10} max={10} onChange={setTreble} color={knobColor} size="md" />
           </div>

           <div className="hidden md:block w-px h-16 bg-black/20 mx-2"></div>

           {/* Output Stage */}
           <div className="flex gap-2">
                <Knob label="Presence" value={presence} min={-10} max={10} onChange={setPresence} color={knobColor} size="md" />
                <Knob label="Master" value={master} onChange={setMaster} color={knobColor} size="md" />
           </div>
       </div>
       
       <div className={`absolute right-4 top-4 w-3 h-3 lg:w-4 lg:h-4 rounded-full animate-pulse shadow-[0_0_15px_currentColor] ${type === AmpType.TRACE ? 'bg-green-500 text-green-500' : type === AmpType.ACOUSTIC ? 'bg-blue-500 text-blue-500' : 'bg-red-500 text-red-500'}`}></div>
    </div>
  );
};
