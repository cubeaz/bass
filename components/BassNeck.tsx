import React, { useState } from 'react';
import { FRET_DISTANCES, STRING_NAMES, TOTAL_FRETS } from '../constants';
import { BassString } from './BassString';
import { NoteInfo, PlayingTechnique } from '../types';

interface BassNeckProps {
  onPlayNote: (info: NoteInfo, tech: PlayingTechnique) => void;
  currentTechnique: PlayingTechnique;
}

export const BassNeck: React.FC<BassNeckProps> = ({ onPlayNote, currentTechnique }) => {
  const [hoveredFret, setHoveredFret] = useState<{s: number, f: number} | null>(null);
  const [activeStrings, setActiveStrings] = useState<boolean[]>([false, false, false, false]);

  const handlePluck = (stringIdx: number, fret: number) => {
    // Visual feedback
    const newActive = [...activeStrings];
    newActive[stringIdx] = true;
    setActiveStrings(newActive);
    setTimeout(() => {
        const reset = [...activeStrings];
        reset[stringIdx] = false;
        setActiveStrings(reset); // This triggers re-render, might be too slow for fast playing but okay for demo
    }, 150);

    onPlayNote({
        stringIdx,
        fret,
        note: '', // calculated in parent or engine
        frequency: 0 // calculated in parent
    }, currentTechnique);
  };

  return (
    <div className="relative w-full h-[300px] bg-[#3e2723] rounded-r-xl overflow-hidden shadow-2xl select-none border-y-4 border-black">
        {/* Wood Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{backgroundImage: 'url(https://picsum.photos/1000/300?grayscale&blur=2)'}}></div>
        
        {/* Frets */}
        {FRET_DISTANCES.map((pos, i) => (
            <div 
                key={`fret-${i}`}
                className="absolute top-0 bottom-0 w-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 border-l border-gray-500 shadow-sm"
                style={{ left: `${pos * 96}%` }} // Scale to 96% of width to leave headstock room if needed
            >
                {/* Fret Markers */}
                {[3, 5, 7, 9, 12, 15, 17, 19].includes(i) && (
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#eecfa1] shadow-inner opacity-80 ${i === 12 ? 'flex gap-4' : ''}`}>
                       {i === 12 && <div className="absolute -left-3 w-4 h-4 rounded-full bg-[#eecfa1]"></div>} 
                       {i === 12 && <div className="absolute -right-3 w-4 h-4 rounded-full bg-[#eecfa1]"></div>} 
                    </div>
                )}
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/50">{i}</span>
            </div>
        ))}

        {/* Strings Container */}
        <div className="absolute inset-0 flex flex-col justify-center py-4">
            {[0, 1, 2, 3].map((stringIdx) => ( // G, D, A, E order visually top to bottom usually G is thinnest at bottom? No, on screen top is usually low E or high G depending on tab view. 
                // Standard view: Top string is G (thinnest), Bottom is E (thickest)
                <div key={stringIdx} className="relative flex-1 flex items-center group z-10">
                   {/* Interaction Zones per fret */}
                   {Array.from({length: TOTAL_FRETS + 1}).map((_, fretIdx) => {
                       const start = fretIdx === 0 ? 0 : FRET_DISTANCES[fretIdx - 1];
                       const end = FRET_DISTANCES[fretIdx];
                       const widthPercent = (end - start) * 96;
                       const leftPercent = start * 96;
                       
                       // Nut is special case at 0
                       const finalLeft = fretIdx === 0 ? 0 : FRET_DISTANCES[fretIdx-1] * 96;
                       const finalWidth = fretIdx === 0 ? FRET_DISTANCES[0] * 96 : (FRET_DISTANCES[fretIdx] - FRET_DISTANCES[fretIdx-1]) * 96;

                       return (
                           <div 
                                key={`zone-${stringIdx}-${fretIdx}`}
                                className="absolute h-full cursor-pointer hover:bg-white/5 transition-colors"
                                style={{
                                    left: `${finalLeft}%`,
                                    width: `${finalWidth}%`
                                }}
                                onMouseEnter={() => setHoveredFret({s: stringIdx, f: fretIdx})}
                                onMouseLeave={() => setHoveredFret(null)}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handlePluck(stringIdx, fretIdx);
                                }}
                           >
                               {/* Finger position indicator */}
                               {hoveredFret?.s === stringIdx && hoveredFret?.f === fretIdx && (
                                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500/30 border border-blue-400 blur-sm"></div>
                               )}
                           </div>
                       );
                   })}

                   {/* The Physical String */}
                   <div className="pointer-events-none w-full absolute px-2">
                       <BassString 
                            thickness={2 + (3 - stringIdx) * 1.5} 
                            vibrating={activeStrings[stringIdx]}
                            onPluck={() => {}} // Interaction handled by zones
                        />
                   </div>
                </div>
            ))}
        </div>
    </div>
  );
};
