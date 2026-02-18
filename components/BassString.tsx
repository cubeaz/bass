import React from 'react';

interface BassStringProps {
  thickness: number;
  vibrating: boolean;
  onPluck: (y: number) => void;
}

export const BassString: React.FC<BassStringProps> = ({ thickness, vibrating, onPluck }) => {
  return (
    <div 
      className="relative w-full flex items-center group cursor-pointer"
      style={{ height: '30px' }} // Wider hit area
      onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeX = (e.clientX - rect.left) / rect.width;
          onPluck(relativeX);
      }}
    >
      {/* The String Core */}
      <div 
        className={`w-full relative shadow-[0_4px_4px_rgba(0,0,0,0.5)] transition-transform duration-75 will-change-transform ${vibrating ? 'animate-vibrate' : ''}`}
        style={{ 
          height: `${thickness}px`,
          transform: vibrating ? 'scaleY(1.2)' : 'scaleY(1)',
        }}
      >
        {/* Metallic Wound Texture */}
        <div className="w-full h-full rounded-full" 
             style={{ 
               // Complex gradient to simulate a wound nickel string (Light-Dark-Light cylinder effect)
               background: `
                 repeating-linear-gradient(
                   90deg, 
                   rgba(255,255,255,0.1) 0px, 
                   rgba(0,0,0,0.2) 1px, 
                   transparent 2px
                 ),
                 linear-gradient(
                   to bottom, 
                   #888 0%, 
                   #e0e0e0 40%, 
                   #silver 50%, 
                   #444 100%
                 )
               `,
               boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
             }}>
        </div>
      </div>
      
      {/* Vibration Animation Style Injection */}
      <style>{`
        @keyframes vibrate {
          0% { transform: translateY(0) scaleY(1); }
          25% { transform: translateY(-1px) scaleY(1.2); }
          50% { transform: translateY(0) scaleY(1); }
          75% { transform: translateY(1px) scaleY(1.2); }
          100% { transform: translateY(0) scaleY(1); }
        }
        .animate-vibrate {
          animation: vibrate 0.05s infinite linear;
        }
      `}</style>
    </div>
  );
};