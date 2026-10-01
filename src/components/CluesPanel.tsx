import React from 'react';
import { Lock, Unlock, KeyRound } from 'lucide-react';
import { CricketPlayer } from '../types/cricket';

interface CluesPanelProps {
  mysteryPlayer: CricketPlayer;
  guessCount: number;
}

export const CluesPanel: React.FC<CluesPanelProps> = ({
  mysteryPlayer,
  guessCount,
}) => {
  const clue1Unlocked = guessCount >= 3;
  const clue2Unlocked = guessCount >= 4;
  const clue3Unlocked = guessCount >= 5;

  return (
    <div className="w-full max-w-4xl mx-auto my-3 px-2">
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Progressive Clues</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Unlocks automatically on guesses 3, 4 & 5
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Clue 1: Country */}
          <div
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              clue1Unlocked
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-400">Clue 1 (Guess 3)</span>
              {clue1Unlocked ? (
                <Unlock className="w-3 h-3 text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-slate-600" />
              )}
            </div>
            {clue1Unlocked ? (
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span>{mysteryPlayer.flag}</span>
                <span>Country: {mysteryPlayer.country}</span>
              </div>
            ) : (
              <span className="italic">Locked until Guess 3</span>
            )}
          </div>

          {/* Clue 2: Role & Style */}
          <div
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              clue2Unlocked
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-400">Clue 2 (Guess 4)</span>
              {clue2Unlocked ? (
                <Unlock className="w-3 h-3 text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-slate-600" />
              )}
            </div>
            {clue2Unlocked ? (
              <div className="font-semibold text-white truncate">
                Role: <span className="text-emerald-400">{mysteryPlayer.role}</span> ({mysteryPlayer.battingStyle})
              </div>
            ) : (
              <span className="italic">Locked until Guess 4</span>
            )}
          </div>

          {/* Clue 3: Active Years */}
          <div
            className={`p-2.5 rounded-lg border text-xs transition-all ${
              clue3Unlocked
                ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-400">Clue 3 (Guess 5)</span>
              {clue3Unlocked ? (
                <Unlock className="w-3 h-3 text-emerald-400" />
              ) : (
                <Lock className="w-3 h-3 text-slate-600" />
              )}
            </div>
            {clue3Unlocked ? (
              <div className="font-semibold text-white">
                Active Era: <span className="text-amber-400">{mysteryPlayer.activeYears}</span>
              </div>
            ) : (
              <span className="italic">Locked until Guess 5</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
