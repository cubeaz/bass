import React from 'react';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-20 bg-gray-800 rounded-lg shadow-inner relative border-2 border-gray-600 transition-colors ${checked ? 'shadow-[0_0_10px_rgba(255,0,0,0.5)]' : ''}`}
      >
        {/* Toggle Body */}
        <div className={`absolute left-1/2 -translate-x-1/2 w-8 h-12 bg-gradient-to-b from-gray-300 to-gray-500 rounded transition-all duration-200 ${checked ? 'top-1' : 'bottom-1'}`}>
          <div className="w-full h-1 bg-gray-400 mt-2"></div>
          <div className="w-full h-1 bg-gray-400 mt-1"></div>
        </div>
        
        {/* LED */}
        <div className={`absolute top-[-10px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${checked ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-red-900'}`}></div>
      </button>
      <span className="text-xs font-bold uppercase text-gray-700 select-none">{label}</span>
    </div>
  );
};
