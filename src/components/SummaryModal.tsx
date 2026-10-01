import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, XCircle, Share2, Check, RotateCcw, Award } from 'lucide-react';
import { CricketPlayer, GuessResult, GameMode } from '../types/cricket';
import { generateShareText } from '../utils/gameLogic';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  mysteryPlayer: CricketPlayer;
  guesses: GuessResult[];
  mode: GameMode;
  dayNumber: number;
  onPlayAgainUnlimited: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  won,
  mysteryPlayer,
  guesses,
  mode,
  dayNumber,
  onPlayAgainUnlimited,
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (isOpen && won) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24'],
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }
  }, [isOpen, won]);

  // Countdown timer to next midnight UTC for daily challenge
  useEffect(() => {
    if (mode !== 'daily') return;

    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const text = generateShareText(guesses, won, mode, dayNumber);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header banner */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl mb-3 shadow-lg bg-slate-800/80 border border-slate-700">
            {won ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-amber-500" />
            )}
          </div>
          <h2 className="text-2xl font-black text-white font-['Outfit']">
            {won ? 'Century! You Guessed It!' : 'Out! Better Luck Next Innings'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {won
              ? `Solved in ${guesses.length} of 6 tries.`
              : 'The mystery cricketer remained unbeaten today.'}
          </p>
        </div>

        {/* Revealed Player Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-5 shadow-inner">
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-3xl shadow-md">
              {mysteryPlayer.flag}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                Mystery Player Revealed
              </div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {mysteryPlayer.name}
              </h3>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{mysteryPlayer.country}</span>
                <span>·</span>
                <span>{mysteryPlayer.role}</span>
                <span>·</span>
                <span>{mysteryPlayer.activeYears}</span>
              </div>
            </div>
          </div>

          {/* Stats Summary Matrix */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs mb-3.5">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Test Career
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {mysteryPlayer.testRuns.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">runs</span>
              </div>
              <div className="font-mono text-sm font-bold text-slate-300">
                {mysteryPlayer.testWickets} <span className="text-[10px] text-slate-400 font-sans">wkts</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                ODI Career
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {mysteryPlayer.odiRuns.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">runs</span>
              </div>
              <div className="font-mono text-sm font-bold text-slate-300">
                {mysteryPlayer.odiWickets} <span className="text-[10px] text-slate-400 font-sans">wkts</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                T20I Career
              </div>
              <div className="font-mono text-sm font-bold text-emerald-400">
                {mysteryPlayer.t20iRuns.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">runs</span>
              </div>
              <div className="font-mono text-sm font-bold text-slate-300">
                {mysteryPlayer.t20iWickets} <span className="text-[10px] text-slate-400 font-sans">wkts</span>
              </div>
            </div>
          </div>

          {/* Notable Achievements */}
          <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{mysteryPlayer.notableAchievements}</span>
          </div>
        </div>

        {/* Share & Play Again Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleShare}
            className="w-full flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Score</span>
              </>
            )}
          </button>

          {mode === 'unlimited' ? (
            <button
              onClick={() => {
                onPlayAgainUnlimited();
                onClose();
              }}
              className="w-full sm:w-auto py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Next Player</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto text-center py-2 px-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Next Daily Player
              </div>
              <div className="font-mono font-bold text-sm text-emerald-400">
                {timeLeft || '00:00:00'}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          View Grid
        </button>
      </div>
    </div>
  );
};
