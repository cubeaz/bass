
import React from 'react';

interface PedalProps {
  name: string;
  color: string;
  children: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  variant?: 'normal' | 'large';
}

export const Pedal: React.FC<PedalProps> = ({ name, color, children, enabled, onToggle, variant = 'normal' }) => {
  // Count children to determine grid
  const childCount = React.Children.count(children);
  
  let widthClass = childCount > 4 ? 'w-48' : 'w-36';
  let gridClass = childCount > 4 ? 'grid-cols-3' : 'grid-cols-2';
  
  if (variant === 'large') {
      widthClass = 'w-72';
      gridClass = 'grid-cols-4';
  }

  return (
    <div className={`relative ${widthClass} h-64 ${color} rounded-lg shadow-2xl border-b-8 border-r-8 border-black/20 flex flex-col items-center p-2 transform transition-transform shrink-0 ${enabled ? 'scale-[1.02]' : 'scale-100 opacity-90'}`}>
      
      {/* Texture Overlay for Large Pedals */}
      {variant === 'large' && (
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:4px_100%] pointer-events-none opacity-20"></div>
      )}

      {/* Brand Name */}
      <div className="w-full text-center border-b-2 border-white/20 pb-1 mb-2 z-10">
        <h3 className={`font-black ${variant === 'large' ? 'text-lg tracking-widest' : 'text-xs tracking-tighter'} text-white/90 uppercase font-serif italic truncate px-1`}>{name}</h3>
      </div>

      {/* Controls Container */}
      <div className={`flex-1 w-full grid ${gridClass} gap-x-1 gap-y-2 place-items-center content-start z-10`}>
        {children}
      </div>

      {/* Decoration for Large Pedals */}
      {variant === 'large' && (
          <div className="w-full h-8 mb-2 bg-black/30 rounded flex items-center justify-center gap-2">
               <div className={`w-full h-[2px] ${enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
          </div>
      )}

      {/* Stomp Switch */}
      <div className="mt-auto mb-1 z-10 relative">
        <button 
          onClick={() => onToggle(!enabled)}
          className={`rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border-4 border-gray-400 shadow-lg active:scale-95 flex items-center justify-center outline-none ${variant === 'large' ? 'w-12 h-12' : 'w-10 h-10'}`}
        >
           <div className={`${variant === 'large' ? 'w-8 h-8' : 'w-6 h-6'} rounded-full border-2 border-gray-400/50`}></div>
        </button>
        
        {/* Status Light */}
        <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-colors duration-100 ${enabled ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-red-900'} border border-black/50`}></div>
      </div>
    </div>
  );
};
