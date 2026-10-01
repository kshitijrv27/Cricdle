import React from 'react';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import { GuessResult, StatComparison } from '../types/cricket';

interface GuessGridProps {
  guesses: GuessResult[];
  maxGuesses?: number;
}

export const GuessGrid: React.FC<GuessGridProps> = ({
  guesses,
  maxGuesses = 6,
}) => {
  const emptyRowsCount = Math.max(0, maxGuesses - guesses.length);

  return (
    <div className="w-full max-w-5xl mx-auto my-6 overflow-x-auto">
      <div className="min-w-[800px] bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800/80">
          <div className="col-span-3 text-left pl-2">Player / Country</div>
          <div className="col-span-1.5 col-span-2">Test Runs</div>
          <div className="col-span-1">Test Wkts</div>
          <div className="col-span-1.5 col-span-2">ODI Runs</div>
          <div className="col-span-1">ODI Wkts</div>
          <div className="col-span-1.5 col-span-2">T20I Runs</div>
          <div className="col-span-1">T20I Wkts</div>
        </div>

        {/* Existing Guesses */}
        <div className="divide-y divide-slate-800/40 mt-2">
          {guesses.map((guess, idx) => (
            <GuessRow key={`${guess.player.id}-${idx}`} guess={guess} index={idx} />
          ))}

          {/* Empty Placeholder Rows */}
          {Array.from({ length: emptyRowsCount }).map((_, idx) => (
            <EmptyRow key={`empty-${idx}`} guessNumber={guesses.length + idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface GuessRowProps {
  guess: GuessResult;
  index: number;
}

const GuessRow: React.FC<GuessRowProps> = ({ guess, index }) => {
  return (
    <div
      className="grid grid-cols-12 gap-2 py-2.5 items-center transition-all animate-[flipIn_0.4s_ease-out]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Player Identity Column */}
      <div className="col-span-3 flex items-center gap-2.5 min-w-0 pr-1">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0">
          {guess.player.flag}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
            <span className="truncate">{guess.player.name}</span>
            {guess.isCorrect && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
            <span
              className={
                guess.countryMatch
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400'
              }
            >
              {guess.player.country}
            </span>
            <span>·</span>
            <span
              className={
                guess.roleMatch === 'exact'
                  ? 'text-emerald-400 font-semibold'
                  : guess.roleMatch === 'partial'
                  ? 'text-amber-400'
                  : 'text-slate-500'
              }
            >
              {guess.player.role}
            </span>
          </div>
        </div>
      </div>

      {/* 6 Stat Columns */}
      <div className="col-span-2">
        <StatTile
          comparison={guess.testRuns}
          label="Test R"
          unit="runs"
          isRuns={true}
        />
      </div>

      <div className="col-span-1">
        <StatTile
          comparison={guess.testWickets}
          label="Test W"
          unit="wkts"
          isRuns={false}
        />
      </div>

      <div className="col-span-2">
        <StatTile
          comparison={guess.odiRuns}
          label="ODI R"
          unit="runs"
          isRuns={true}
        />
      </div>

      <div className="col-span-1">
        <StatTile
          comparison={guess.odiWickets}
          label="ODI W"
          unit="wkts"
          isRuns={false}
        />
      </div>

      <div className="col-span-2">
        <StatTile
          comparison={guess.t20iRuns}
          label="T20I R"
          unit="runs"
          isRuns={true}
        />
      </div>

      <div className="col-span-1">
        <StatTile
          comparison={guess.t20iWickets}
          label="T20I W"
          unit="wkts"
          isRuns={false}
        />
      </div>
    </div>
  );
};

interface StatTileProps {
  comparison: StatComparison;
  label: string;
  unit: 'runs' | 'wkts';
  isRuns: boolean;
}

const StatTile: React.FC<StatTileProps> = ({
  comparison,
  unit,
}) => {
  const { color, direction, guessVal, diff } = comparison;

  let bgClass = 'bg-slate-700/80 border-slate-600 text-slate-100';
  let badgeText = 'Far (>4000)';

  if (color === 'green') {
    bgClass = 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40';
    badgeText = comparison.diff === 0 ? 'Exact Match' : 'Close (0–1000)';
  } else if (color === 'yellow') {
    bgClass = 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-950/40';
    badgeText = 'Medium (1001–4000)';
  }

  // Adjust badge text for wickets
  if (unit === 'wkts') {
    if (color === 'green') {
      badgeText = comparison.diff === 0 ? 'Exact' : 'Close (0–100)';
    } else if (color === 'yellow') {
      badgeText = 'Medium (101–300)';
    } else {
      badgeText = 'Far (>300)';
    }
  }

  return (
    <div
      className={`h-14 rounded-xl border flex flex-col items-center justify-center p-1.5 transition-transform hover:scale-[1.02] cursor-default ${bgClass}`}
      title={`${guessVal.toLocaleString()} ${unit} (${badgeText}, Diff: ${diff.toLocaleString()})`}
    >
      <div className="flex items-center gap-1 font-mono font-bold text-sm sm:text-base tabular-nums">
        <span>{guessVal.toLocaleString()}</span>
        {direction === 'up' && (
          <span className="flex items-center text-white/90" title="Mystery player has MORE">
            <ArrowUp className="w-4 h-4 stroke-[3]" />
          </span>
        )}
        {direction === 'down' && (
          <span className="flex items-center text-white/90" title="Mystery player has FEWER">
            <ArrowDown className="w-4 h-4 stroke-[3]" />
          </span>
        )}
        {direction === 'exact' && (
          <span className="flex items-center text-white" title="Exact match!">
            <Check className="w-4 h-4 stroke-[3]" />
          </span>
        )}
      </div>

      <div className="text-[10px] font-medium tracking-tight opacity-90 truncate max-w-full">
        {direction === 'exact' ? (
          'MATCH'
        ) : direction === 'up' ? (
          `+${diff.toLocaleString()}`
        ) : (
          `-${diff.toLocaleString()}`
        )}
      </div>
    </div>
  );
};

const EmptyRow: React.FC<{ guessNumber: number }> = ({ guessNumber }) => {
  return (
    <div className="grid grid-cols-12 gap-2 py-2.5 items-center opacity-30">
      <div className="col-span-3 flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
          {guessNumber}
        </div>
        <span className="text-xs font-medium text-slate-500">Empty Guess</span>
      </div>

      <div className="col-span-2 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
      <div className="col-span-1 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
      <div className="col-span-2 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
      <div className="col-span-1 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
      <div className="col-span-2 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
      <div className="col-span-1 h-14 rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20" />
    </div>
  );
};
