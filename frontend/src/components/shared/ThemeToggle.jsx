import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? 'Switch to Light Theme (Teal & White)' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`p-2 sm:p-2.5 rounded-xl border transition duration-200 cursor-pointer flex items-center justify-center relative ${
        isDark
          ? 'bg-[#1E293B] text-amber-400 hover:text-amber-300 hover:bg-slate-800 border-slate-800'
          : 'bg-white text-[#0D5C55] hover:bg-slate-100 border-slate-200 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
