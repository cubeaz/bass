
import React, { useState, useEffect } from 'react';
import { FRET_DISTANCES, TOTAL_FRETS } from '../constants';
import { BassString } from './BassString';
import { NoteInfo, PickupType, PlayingTechnique, BassSkin } from '../types';

interface BassGuitarProps {
  onPlayNote: (info: NoteInfo, tech: PlayingTechnique) => void;
  currentTechnique: PlayingTechnique;
  pickupConfig: PickupType;
  tuningValues?: number[]; // Cents [E, A, D, G]
  onTune?: (stringIdx: number, val: number) => void;
  skin?: BassSkin;
}

// Skin Configurations
const SKIN_STYLES: Record<BassSkin, any> = {
    [BassSkin.CLASSIC]: {
        bodyBg: 'radial-gradient(circle at 45% 50%, #eecfa1 20%, #bf360c 50%, #1a0500 85%)',
        headstockBg: 'radial-gradient(circle at 30% 50%, #eecfa1, #c69c6d)',
        headstockBorder: '#b88a50',
        neckBg: 'linear-gradient(to right, #2a1b15, #4a3b32)',
        neckTexture: 'url("https://www.transparenttextures.com/patterns/dark-wood.png")',
        inlayColor: '#fdfcf5',
        fretColor: 'linear-gradient(to right, #888, #fff, #888)',
        pickguardBg: '#3e1c14',
        pickguardTexture: 'radial-gradient(#5d4037 2px, transparent 2px)',
        hardwareColor: 'gradient-to-b from-gray-200 via-white to-gray-400',
        hardwareBorder: 'gray-400',
        tunerColor: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #a0a0a0 100%)',
        knobColor: 'black',
        textColor: 'text-black',
        glow: 'none'
    },
    [BassSkin.MODERN]: {
        bodyBg: 'linear-gradient(145deg, #222 0%, #111 100%)',
        headstockBg: '#111',
        headstockBorder: '#333',
        neckBg: '#0a0a0a', // Ebony
        neckTexture: 'none',
        inlayColor: '#444', // Dark grey inlays
        fretColor: 'linear-gradient(to right, #555, #999, #555)', // Darker frets
        pickguardBg: '#000',
        pickguardTexture: 'none',
        hardwareColor: 'gradient-to-b from-gray-800 via-gray-600 to-black', // Black hardware
        hardwareBorder: 'gray-800',
        tunerColor: 'linear-gradient(135deg, #333 0%, #555 50%, #222 100%)',
        knobColor: '#1a1a1a',
        textColor: 'text-white/50',
        glow: 'none'
    },
    [BassSkin.VINTAGE]: {
        bodyBg: '#f0e6d2', // Cream White
        headstockBg: '#eecfa1', // Natural Maple
        headstockBorder: '#d4b483',
        neckBg: '#eecfa1', // Maple
        neckTexture: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
        inlayColor: 'black', // Black dots
        fretColor: 'linear-gradient(to right, #888, #fff, #888)',
        pickguardBg: 'linear-gradient(135deg, #d4af37, #aa8c2c)', // Gold Anodized
        pickguardTexture: 'url("https://www.transparenttextures.com/patterns/brushed-alum.png")',
        hardwareColor: 'gradient-to-b from-gray-200 via-white to-gray-400',
        hardwareBorder: 'gray-400',
        tunerColor: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #a0a0a0 100%)',
        knobColor: 'silver',
        textColor: 'text-black',
        glow: 'none'
    },
    [BassSkin.CYBER]: {
        bodyBg: 'linear-gradient(135deg, #240046 0%, #7b2cbf 50%, #f72585 100%)',
        headstockBg: 'linear-gradient(135deg, #240046, #3c096c)',
        headstockBorder: '#f72585',
        neckBg: '#10002b',
        neckTexture: 'none',
        inlayColor: '#00f5d4', // Neon Cyan
        fretColor: 'linear-gradient(to right, #f72585, #fff, #f72585)', // Neon Pink Frets
        pickguardBg: 'rgba(0, 0, 0, 0.6)',
        pickguardTexture: 'linear-gradient(45deg, transparent 45%, #00f5d4 50%, transparent 55%)', // Cyber lines
        hardwareColor: 'gradient-to-b from-cyan-400 via-cyan-200 to-cyan-600', // Neon Hardware
        hardwareBorder: 'cyan-500',
        tunerColor: 'linear-gradient(135deg, #4cc9f0 0%, #fff 50%, #4361ee 100%)',
        knobColor: '#f72585',
        textColor: 'text-cyan-400',
        glow: '0 0 20px rgba(247, 37, 133, 0.6)'
    }
};

// --- VISUAL COMPONENTS ---

const TunerPeg: React.FC<{ 
    index: number, 
    value: number, 
    onChange: (v: number) => void,
    x: number, y: number, rotation: number,
    skinStyle: any
}> = ({ value, onChange, x, y, rotation, skinStyle }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startVal, setStartVal] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDragging(true);
        setStartY(e.clientY);
        setStartVal(value);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaY = startY - e.clientY;
            let newVal = startVal + deltaY;
            newVal = Math.max(-200, Math.min(200, newVal));
            onChange(newVal);
        };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startY, startVal, onChange]);

    return (
        <div className="absolute z-30" style={{ left: x, top: y, transform: `rotate(${rotation}deg)` }}>
            {/* The Clover Key - Interactive */}
            <div 
                className="absolute -left-[55px] -top-[20px] w-[60px] h-[40px] cursor-grab active:cursor-grabbing group origin-right"
                onMouseDown={handleMouseDown}
                style={{ transform: `rotate(${value * 2}deg)` }}
                title="Drag up/down to tune"
            >
                <div className="w-full h-full shadow-md rounded-sm"
                     style={{ 
                         clipPath: 'path("M 5 10 C 0 5, 0 35, 5 30 L 15 25 L 45 25 L 45 15 L 15 15 L 5 10 Z")',
                         background: skinStyle.tunerColor,
                         boxShadow: skinStyle.glow
                     }}>
                </div>
            </div>
            {/* Post */}
            <div className={`w-8 h-8 rounded-full bg-${skinStyle.hardwareColor} border border-${skinStyle.hardwareBorder} shadow-lg flex items-center justify-center pointer-events-none`}>
                 <div className={`w-5 h-5 rounded-full shadow-inner border border-${skinStyle.hardwareBorder} bg-black/10`}>
                    <div className="w-[2px] h-full bg-black/30 mx-auto"></div>
                 </div>
            </div>
            {isDragging && (
                <div className="absolute -top-10 left-0 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                    {value > 0 ? '+' : ''}{Math.round(value)} cents
                </div>
            )}
        </div>
    );
};

export const BassGuitar: React.FC<BassGuitarProps> = ({ 
    onPlayNote, 
    currentTechnique, 
    pickupConfig,
    tuningValues = [0,0,0,0], 
    onTune = () => {},
    skin = BassSkin.CLASSIC
}) => {
  const [hoveredFret, setHoveredFret] = useState<{s: number, f: number} | null>(null);
  const [activeStrings, setActiveStrings] = useState<boolean[]>([false, false, false, false]);

  const activeSkin = SKIN_STYLES[skin];

  const handlePluck = (stringIdx: number, fret: number) => {
    const newActive = [...activeStrings];
    newActive[stringIdx] = true;
    setActiveStrings(newActive);
    setTimeout(() => {
        const reset = [...activeStrings];
        reset[stringIdx] = false;
        setActiveStrings(reset); 
    }, 200);
    onPlayNote({ stringIdx, fret, note: '', frequency: 0 }, currentTechnique);
  };

  const stringGauges = [5, 4, 3, 2];

  return (
    <div className="w-full flex justify-center py-10 overflow-hidden select-none transition-colors duration-500">
        
        {/* INSTRUMENT CONTAINER */}
        <div className="relative flex w-[1200px] h-[360px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]" style={{ filter: skin === BassSkin.CYBER ? 'drop-shadow(0 0 15px rgba(247, 37, 133, 0.4))' : '' }}>
            
            {/* 1. HEADSTOCK */}
            <div className="w-[220px] h-[200px] absolute left-0 top-1/2 -translate-y-1/2 z-10">
                <div className="w-full h-full rounded-l-3xl shadow-xl relative overflow-hidden"
                     style={{ 
                         clipPath: 'path("M 20 50 C 0 80, 0 150, 40 180 C 80 200, 220 180, 220 180 L 220 20 L 180 20 C 180 20, 160 0, 120 10 C 80 20, 60 40, 20 50 Z")',
                         background: activeSkin.headstockBg,
                         borderRight: `2px solid ${activeSkin.headstockBorder}`,
                         boxShadow: activeSkin.glow
                     }}>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <div className={`absolute right-8 top-12 transform -rotate-6 opacity-80 pointer-events-none ${activeSkin.textColor}`}>
                         <span className="font-serif font-black text-2xl tracking-tighter block leading-none">Fender</span>
                         <span className="font-sans text-[8px] uppercase tracking-widest block text-right">Jazz Bass</span>
                    </div>
                </div>

                {/* --- CHINESE LABEL: TUNERS --- */}
                <div className={`absolute -top-8 left-4 text-lg font-bold pointer-events-none whitespace-nowrap shadow-black drop-shadow-md ${activeSkin.textColor === 'text-black' ? 'text-yellow-100/90' : 'text-white'}`}>
                    旋转以微调音高
                </div>

                {/* Interactive Tuners */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <TunerPeg index={3} value={tuningValues[3]} onChange={(v) => onTune(3, v)} x={50} y={130} rotation={-15} skinStyle={activeSkin} />
                    <TunerPeg index={2} value={tuningValues[2]} onChange={(v) => onTune(2, v)} x={90} y={100} rotation={-10} skinStyle={activeSkin} />
                    <TunerPeg index={1} value={tuningValues[1]} onChange={(v) => onTune(1, v)} x={130} y={80} rotation={-5} skinStyle={activeSkin} />
                    <TunerPeg index={0} value={tuningValues[0]} onChange={(v) => onTune(0, v)} x={170} y={75} rotation={0} skinStyle={activeSkin} />
                    
                    {/* String Tree */}
                    <div className={`absolute right-16 top-10 w-3 h-3 rounded-full bg-${activeSkin.hardwareColor} shadow-md border border-${activeSkin.hardwareBorder} z-20 flex items-center justify-center pointer-events-none`}>
                        <div className="w-2 h-0.5 bg-black/50"></div>
                    </div>
                </div>
            </div>

            {/* 2. NECK */}
            <div className="absolute left-[218px] top-1/2 -translate-y-1/2 w-[700px] h-[80px] z-20 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                 <div className="w-full h-full relative overflow-hidden border-y border-black/50"
                      style={{ 
                          background: activeSkin.neckBg,
                          backgroundImage: activeSkin.neckTexture !== 'none' ? `${activeSkin.neckTexture}, ${activeSkin.neckBg}` : activeSkin.neckBg,
                          backgroundBlendMode: 'multiply'
                      }}>
                     
                     {FRET_DISTANCES.map((pos, i) => {
                        const isDot = [3, 5, 7, 9, 15, 17, 19].includes(i);
                        const isDouble = i === 12;
                        if (!isDot && !isDouble) return null;
                        const prevPos = i === 0 ? 0 : FRET_DISTANCES[i-1];
                        const centerPos = ((prevPos + pos) / 2) * 96;
                        return (
                            <div key={`inlay-${i}`} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${centerPos}%` }}>
                                {isDouble ? (
                                    <div className="flex gap-4">
                                         <div className="w-4 h-4 rounded-full shadow-inner" style={{ background: activeSkin.inlayColor, boxShadow: activeSkin.glow }}></div>
                                         <div className="w-4 h-4 rounded-full shadow-inner" style={{ background: activeSkin.inlayColor, boxShadow: activeSkin.glow }}></div>
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 rounded-full shadow-inner" style={{ background: activeSkin.inlayColor, boxShadow: activeSkin.glow }}></div>
                                )}
                            </div>
                        )
                     })}

                     {FRET_DISTANCES.map((pos, i) => (
                        <div 
                            key={`fretwire-${i}`}
                            className="absolute top-0 bottom-0 w-[3px] shadow-[2px_0_3px_rgba(0,0,0,0.4)] z-10"
                            style={{ left: `${pos * 96}%`, background: activeSkin.fretColor }}
                        ></div>
                     ))}
                 </div>
                 
                 <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#e8e6d1] shadow-md border-r border-gray-300 z-30"></div>

                 {/* --- CHINESE LABEL: STRINGS --- */}
                 <div className={`absolute -top-10 left-1/2 -translate-x-1/2 text-lg font-bold pointer-events-none whitespace-nowrap shadow-black drop-shadow-md ${activeSkin.textColor === 'text-black' ? 'text-yellow-100/90' : 'text-white'}`}>
                    点击弦以演奏
                 </div>
                 
                 <div className="absolute inset-0 z-40 flex flex-col">
                    {[0, 1, 2, 3].map((stringIdx) => (
                        <div key={stringIdx} className="flex-1 flex relative">
                            {Array.from({length: TOTAL_FRETS + 1}).map((_, fretIdx) => {
                                const start = fretIdx === 0 ? 0 : FRET_DISTANCES[fretIdx - 1];
                                const end = FRET_DISTANCES[fretIdx];
                                const width = (end - start) * 96;
                                const left = fretIdx === 0 ? 0 : FRET_DISTANCES[fretIdx-1] * 96;
                                return (
                                    <div 
                                        key={`z-${stringIdx}-${fretIdx}`}
                                        className="absolute h-full cursor-pointer hover:bg-white/10"
                                        style={{ left: `${left}%`, width: `${width}%` }}
                                        onMouseDown={(e) => { e.stopPropagation(); handlePluck(stringIdx, fretIdx); }}
                                        onMouseEnter={() => setHoveredFret({s: stringIdx, f: fretIdx})}
                                        onMouseLeave={() => setHoveredFret(null)}
                                    >
                                        {hoveredFret?.s === stringIdx && hoveredFret?.f === fretIdx && (
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_10px_cyan]"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                 </div>
            </div>

            {/* 3. BODY */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[340px] z-10">
                 <div className="w-full h-full relative"
                      style={{ 
                          clipPath: 'path("M 80 50 C 0 0, 0 150, 40 200 C 50 240, 60 300, 100 320 C 150 350, 250 330, 300 320 C 380 300, 400 250, 400 170 C 400 90, 380 40, 300 20 C 240 0, 150 20, 120 40 C 100 0, 50 0, 80 50 Z")',
                          background: activeSkin.bodyBg,
                          boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)' 
                      }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none"></div>

                    {/* PICKGUARD */}
                    <div className="absolute top-[160px] left-[80px] w-[180px] h-[140px] opacity-90 rounded-full border border-white/20"
                         style={{ 
                             clipPath: 'ellipse(60% 40% at 50% 50%)',
                             backgroundColor: activeSkin.pickguardBg,
                             backgroundImage: activeSkin.pickguardTexture !== 'none' ? activeSkin.pickguardTexture : undefined,
                             backgroundSize: activeSkin.pickguardTexture.includes('gradient') ? undefined : '10px 10px',
                             transform: 'rotate(-10deg)',
                             boxShadow: activeSkin.glow
                         }}>
                    </div>

                    {/* CONTROL PLATE */}
                    <div className={`absolute bottom-[40px] right-[80px] w-[140px] h-[50px] bg-${activeSkin.hardwareColor} rounded-full shadow-lg border border-${activeSkin.hardwareBorder} transform rotate-10 flex items-center justify-around px-4 z-30 pointer-events-none`}>
                         {[1,2,3].map(k => (
                             <div key={k} className={`w-8 h-8 rounded-full bg-black shadow-[2px_2px_5px_rgba(0,0,0,0.5)] border-2 border-gray-700 relative`} style={{background: activeSkin.knobColor}}>
                                 <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-white"></div>
                             </div>
                         ))}
                         <div className="w-6 h-6 rounded-full bg-[#1a1a1a] border-2 border-gray-400 shadow-inner"></div>
                    </div>

                    {/* DYNAMIC PICKUPS */}
                    <div className="absolute inset-0 pointer-events-none">
                        
                        {/* NECK POSITION */}
                        {pickupConfig === PickupType.PJ ? (
                            // Split Coil (P-Bass)
                            <>
                                <div className="absolute left-[100px] top-[130px] w-[20px] h-[45px] bg-black rounded-sm shadow-md border border-gray-700 flex flex-col justify-around items-center py-1 z-20">
                                    {[0,1].map(i => <div key={i} className="w-3 h-3 rounded-full bg-gray-400 border border-black/50"></div>)}
                                </div>
                                <div className="absolute left-[125px] top-[175px] w-[20px] h-[45px] bg-black rounded-sm shadow-md border border-gray-700 flex flex-col justify-around items-center py-1 z-20">
                                    {[0,1].map(i => <div key={i} className="w-3 h-3 rounded-full bg-gray-400 border border-black/50"></div>)}
                                </div>
                            </>
                        ) : (
                            // Single Coil (Jazz)
                            <div className="absolute left-[110px] top-[135px] w-[20px] h-[90px] bg-black rounded-md shadow-md border border-gray-700 flex flex-col justify-around py-2 items-center z-20">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm border border-black/50"></div>
                                ))}
                            </div>
                        )}

                        {/* BRIDGE POSITION */}
                        {pickupConfig === PickupType.MMJ ? (
                            // Humbucker (MM)
                            <div className="absolute left-[250px] top-[132px] w-[45px] h-[96px] bg-black rounded-md shadow-md border border-gray-700 flex flex-row justify-between px-1 py-2 z-20">
                                <div className="flex flex-col justify-between h-full">
                                    {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-gray-400 border border-black/50"></div>)}
                                </div>
                                <div className="flex flex-col justify-between h-full">
                                    {[...Array(4)].map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-gray-400 border border-black/50"></div>)}
                                </div>
                            </div>
                        ) : (
                            // Single Coil (Jazz)
                            <div className="absolute left-[260px] top-[135px] w-[22px] h-[94px] bg-black rounded-md shadow-md border border-gray-700 flex flex-col justify-around py-2 items-center z-20">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm border border-black/50"></div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BRIDGE */}
                    <div className={`absolute right-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[100px] bg-${activeSkin.hardwareColor} rounded-lg shadow-xl border border-${activeSkin.hardwareBorder} z-20 flex flex-col justify-between py-2 px-1`}>
                        {[0,1,2,3].map(i => (
                             <div key={i} className="w-full h-4 relative">
                                 <div className={`absolute right-1 w-4 h-4 rounded-full bg-${activeSkin.hardwareColor} shadow-sm border border-black/20`}></div>
                                 <div className="absolute right-6 top-1/2 -translate-y-1/2 w-full h-1 bg-black/30"></div>
                             </div>
                        ))}
                    </div>

                    {/* --- CHINESE LABEL: BODY --- */}
                    <div className={`absolute bottom-10 right-20 text-lg font-bold pointer-events-none whitespace-nowrap rotate-12 shadow-black drop-shadow-md ${activeSkin.textColor === 'text-black' ? 'text-yellow-100/90' : 'text-white'}`}>
                        这里也可以按
                    </div>

                    <div className="absolute inset-0 z-50 flex flex-col justify-center pl-[280px]">
                        {[0,1,2,3].map(idx => (
                            <div key={idx} 
                                 className="h-8 w-full cursor-pointer hover:bg-white/5"
                                 onMouseDown={(e) => {
                                     e.stopPropagation();
                                     handlePluck(idx, 0); 
                                 }}
                            ></div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* 4. STRINGS */}
            <div className="absolute left-[50px] right-[40px] top-1/2 -translate-y-1/2 h-[76px] z-50 pointer-events-none flex flex-col justify-between py-[2px]">
                 {[0, 1, 2, 3].map((stringIdx) => (
                    <BassString 
                        key={stringIdx}
                        thickness={stringGauges[stringIdx]}
                        vibrating={activeStrings[stringIdx]}
                        onPluck={() => {}} 
                    />
                 ))}
            </div>

        </div>
    </div>
  );
};
