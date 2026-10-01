import React from 'react';
import { X, BarChart3, Flame } from 'lucide-react';
import { UserGameStats } from '../types/cricket';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserGameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const maxFreq = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Your Statistics
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Primary Metric Tiles */}
        <div className="grid grid-cols-4 gap-2 text-center mb-6">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-white font-mono">{stats.gamesPlayed}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
              Played
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-emerald-400 font-mono">{winRate}%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
              Win Rate
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-0.5">
              <span>{stats.currentStreak}</span>
              <Flame className="w-3.5 h-3.5 text-amber-400 inline" />
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
              Streak
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-white font-mono">{stats.maxStreak}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
              Max Streak
            </div>
          </div>
        </div>

        {/* Guess Distribution Histogram */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
            Guess Distribution
          </h3>
          {([1, 2, 3, 4, 5, 6] as const).map((guessNum) => {
            const count = stats.guessDistribution[guessNum] || 0;
            const percentage = Math.max(7, Math.round((count / maxFreq) * 100));

            return (
              <div key={guessNum} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-slate-400 font-mono font-bold">{guessNum}</span>
                <div className="flex-1 bg-slate-950 rounded-md overflow-hidden h-6 flex items-center">
                  <div
                    className={`h-full flex items-center justify-end px-2 text-white font-mono font-bold transition-all ${
                      count > 0 ? 'bg-emerald-600' : 'bg-slate-800 text-slate-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors text-xs"
        >
          Close
        </button>
      </div>
    </div>
  );
};
