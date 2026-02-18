import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  label: string;
  value: number; // 0 to 10
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'silver' | 'black' | 'gold' | 'vintage';
}

export const Knob: React.FC<KnobProps> = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 10,
  size = 'md',
  color = 'silver'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  // Map value to rotation (-135deg to 135deg)
  const percentage = (value - min) / (max - min);
  const rotation = -135 + (percentage * 270);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartVal(value);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const range = max - min;
      const deltaVal = (deltaY / 100) * range; // 100px drag = full range
      let newVal = startVal + deltaVal;
      newVal = Math.max(min, Math.min(max, newVal));
      onChange(Number(newVal.toFixed(1)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startVal, min, max, onChange]);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const styles: Record<string, string> = {
    silver: 'bg-gradient-to-br from-gray-200 to-gray-500 border-gray-400',
    black: 'bg-gradient-to-br from-gray-700 to-black border-gray-800',
    gold: 'bg-gradient-to-br from-yellow-200 to-yellow-600 border-yellow-700',
    vintage: 'bg-[#f0e6d2] border-[#5c4033] shadow-inner' // Cream knob
  };

  const indicatorColor = color === 'black' ? 'bg-white' : 'bg-black';

  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        ref={knobRef}
        className={`relative rounded-full border-2 shadow-xl cursor-ns-resize ${sizeClasses[size]} ${styles[color]}`}
        onMouseDown={handleMouseDown}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Indicator Line */}
        <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-1 h-[30%] ${indicatorColor} rounded-full`}></div>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-gray-700 select-none text-center">{label}</span>
      <span className="text-[10px] text-gray-500 font-mono select-none">{value.toFixed(1)}</span>
    </div>
  );
};
