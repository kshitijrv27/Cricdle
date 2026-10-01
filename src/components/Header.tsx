import React from 'react';
import { Volume2, VolumeX, HelpCircle, BarChart3, Database, Sparkles, RefreshCw } from 'lucide-react';
import { GameMode } from '../types/cricket';

interface HeaderProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  dayNumber: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHowToPlay: () => void;
  onOpenStats: () => void;
  onOpenDataArch: () => void;
  onOpenPlayerDB: () => void;
  onNewUnlimitedGame?: () => void;
  isGameOver: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  dayNumber,
  soundEnabled,
  onToggleSound,
  onOpenHowToPlay,
  onOpenStats,
  onOpenDataArch,
  onOpenPlayerDB,
  onNewUnlimitedGame,
  isGameOver,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <span className="text-lg font-black text-white">🏏</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-black tracking-tight text-white font-['Outfit']">
              CRICDLE
            </h1>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest hidden sm:inline">
              Cricket Wordle
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Mode Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => onModeChange('daily')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mode === 'daily'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daily #{dayNumber}
            </button>
            <button
              onClick={() => onModeChange('unlimited')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mode === 'unlimited'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlimited
            </button>
          </div>

          {mode === 'unlimited' && isGameOver && onNewUnlimitedGame && (
            <button
              onClick={onNewUnlimitedGame}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
              title="Play Next Mystery Player"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Next Player</span>
            </button>
          )}
        </div>

        {/* Zone 3: Primary Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenPlayerDB}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            title="Browse 100+ Player Stats Database"
            aria-label="Player Database"
          >
            <Database className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenDataArch}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap"
            title="How stats database and real-time feeds work"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Data Architecture</span>
          </button>

          <button
            onClick={onOpenStats}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            title="Your Stats & Streaks"
            aria-label="Statistics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHowToPlay}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            title="How to Play"
            aria-label="How to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
