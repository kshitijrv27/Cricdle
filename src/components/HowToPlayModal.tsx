import React from 'react';
import { X, ArrowUp, ArrowDown, Check, HelpCircle, Calendar } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              How to Play Cricdle
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm text-slate-300">
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Post-1960 Debut Rule:</strong> All mystery cricketers and eligible guesses are players who made their international debut in or after 1960. You can search or live-lookup ANY cricketer who debuted post-1960!
            </span>
          </div>

          <p>
            Guess the <strong className="text-white">mystery international cricketer</strong> in{' '}
            <strong className="text-emerald-400">6 guesses</strong>.
          </p>

          <p>
            After each guess, the color of the tiles and the direction arrows will reveal how close your guess was across all 6 columns:
          </p>

          {/* Color & Feedback Table */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Feedback Thresholds
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Runs Criteria */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="font-bold text-emerald-400 text-sm">🏏 Runs Feedback</div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    Green:
                  </span>
                  <span className="font-mono text-slate-200">Diff 0 to 1,000 runs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-amber-300">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    Yellow:
                  </span>
                  <span className="font-mono text-slate-200">Diff 1,001 to 4,000 runs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                    Grey:
                  </span>
                  <span className="font-mono text-slate-200">Diff &gt; 4,000 runs</span>
                </div>
              </div>

              {/* Wickets Criteria */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="font-bold text-emerald-400 text-sm">🎯 Wickets Feedback</div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-300">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    Green:
                  </span>
                  <span className="font-mono text-slate-200">Diff 0 to 100 wkts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-amber-300">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    Yellow:
                  </span>
                  <span className="font-mono text-slate-200">Diff 101 to 300 wkts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span className="w-3 h-3 rounded-full bg-slate-600 inline-block" />
                    Grey:
                  </span>
                  <span className="font-mono text-slate-200">Diff &gt; 300 wkts</span>
                </div>
              </div>
            </div>

            {/* Arrows */}
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 font-bold text-white mb-0.5">
                  <ArrowUp className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Up Arrow</span>
                </div>
                <span className="text-slate-400 text-[11px]">Mystery player has MORE</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 font-bold text-white mb-0.5">
                  <ArrowDown className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Down Arrow</span>
                </div>
                <span className="text-slate-400 text-[11px]">Mystery player has FEWER</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 font-bold text-white mb-0.5">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Match</span>
                </div>
                <span className="text-slate-400 text-[11px]">Exact stat match</span>
              </div>
            </div>
          </div>

          {/* Example */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Example Matchup
            </h3>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">
                Suppose the Mystery Player is <strong className="text-emerald-400">Shane Warne</strong> (3,154 Test runs, 708 Test wickets) and you guess <strong className="text-white">Rohit Sharma</strong> (4,301 Test runs, 2 Test wickets):
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-emerald-600 text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase opacity-80">Test Runs</div>
                    <div className="font-bold font-mono text-base">4,301 ▼</div>
                  </div>
                  <div className="text-right text-[11px] leading-tight opacity-90">
                    <div>Green (diff ~1,147 / close)</div>
                    <div>Mystery has fewer (▼)</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-700 text-white flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold uppercase opacity-80">Test Wickets</div>
                    <div className="font-bold font-mono text-base">2 ▲</div>
                  </div>
                  <div className="text-right text-[11px] leading-tight opacity-90">
                    <div>Grey (diff 706 &gt; 300)</div>
                    <div>Mystery has more (▲)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
