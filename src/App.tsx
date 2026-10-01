/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { GuessInput } from './components/GuessInput';
import { GuessGrid } from './components/GuessGrid';
import { CluesPanel } from './components/CluesPanel';
import { SummaryModal } from './components/SummaryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { DataArchitectureModal } from './components/DataArchitectureModal';
import { PlayerDatabaseModal } from './components/PlayerDatabaseModal';
import { StatsModal } from './components/StatsModal';
import {
  CricketPlayer,
  GuessResult,
  GameMode,
  GameStatus,
  UserGameStats,
} from './types/cricket';
import {
  evaluateGuess,
  getDailyPlayer,
  getRandomPlayer,
  loadUserStats,
  updateUserStatsOnGameEnd,
} from './utils/gameLogic';
import {
  playBatHit,
  playTilePop,
  playVictoryChime,
  playGameOverChime,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/audio';
import pitchBg from './assets/images/cricket_stadium_pitch_1790852525104.jpg';
import ballBadge from './assets/images/cricket_ball_badge_1790852538732.jpg';
import { Dices, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { CRICKET_PLAYERS } from './data/cricketPlayers';

export default function App() {
  const [mode, setMode] = useState<GameMode>('daily');
  const [dailyInfo, setDailyInfo] = useState<{ player: CricketPlayer; dayNumber: number }>(() =>
    getDailyPlayer()
  );
  const [mysteryPlayer, setMysteryPlayer] = useState<CricketPlayer>(() => dailyInfo.player);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('in_progress');
  const [userStats, setUserStats] = useState<UserGameStats>(() => loadUserStats());
  const [soundActive, setSoundActive] = useState<boolean>(() => isSoundEnabled());

  // Player registry including custom/live looked-up players
  const [availablePlayers, setAvailablePlayers] = useState<CricketPlayer[]>(() => {
    try {
      const savedCustom = localStorage.getItem('cricdle_custom_players');
      if (savedCustom) {
        const customList: CricketPlayer[] = JSON.parse(savedCustom);
        const existingIds = new Set(CRICKET_PLAYERS.map((p) => p.id));
        const nonDuplicateCustom = customList.filter((p) => !existingIds.has(p.id) && p.debutYear >= 1960);
        return [...CRICKET_PLAYERS, ...nonDuplicateCustom];
      }
    } catch {
      // ignore
    }
    return CRICKET_PLAYERS;
  });

  // Modals state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showDataArchModal, setShowDataArchModal] = useState(false);
  const [showPlayerDBModal, setShowPlayerDBModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Add dynamic player from live lookup
  const handleAddDynamicPlayer = useCallback((newPlayer: CricketPlayer) => {
    if (newPlayer.debutYear < 1960) return;
    setAvailablePlayers((prev) => {
      if (prev.some((p) => p.id === newPlayer.id)) return prev;
      const updated = [...prev, newPlayer];
      try {
        const customOnly = updated.filter((p) => !CRICKET_PLAYERS.some((cp) => cp.id === p.id));
        localStorage.setItem('cricdle_custom_players', JSON.stringify(customOnly));
      } catch (err) {
        console.error('Failed to save custom player:', err);
      }
      return updated;
    });
  }, []);

  // Initialize or restore Daily game state
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const dailyData = getDailyPlayer(todayStr);
    setDailyInfo(dailyData);

    if (mode === 'daily') {
      setMysteryPlayer(dailyData.player);
      const storageKey = `cricdle_daily_guesses_${todayStr}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedGuesses: GuessResult[] = JSON.parse(saved);
          setGuesses(parsedGuesses);

          const hasWon = parsedGuesses.some((g) => g.isCorrect);
          if (hasWon) {
            setGameStatus('won');
            setShowSummaryModal(true);
          } else if (parsedGuesses.length >= 6) {
            setGameStatus('lost');
            setShowSummaryModal(true);
          } else {
            setGameStatus('in_progress');
          }
          return;
        }
      } catch (err) {
        console.error('Error loading saved daily guesses:', err);
      }
      setGuesses([]);
      setGameStatus('in_progress');
    }
  }, [mode]);

  // Handle mode change
  const handleModeChange = (newMode: GameMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setShowSummaryModal(false);

    if (newMode === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      const dailyData = getDailyPlayer(todayStr);
      setMysteryPlayer(dailyData.player);
      const storageKey = `cricdle_daily_guesses_${todayStr}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedGuesses: GuessResult[] = JSON.parse(saved);
          setGuesses(parsedGuesses);
          const hasWon = parsedGuesses.some((g) => g.isCorrect);
          if (hasWon) {
            setGameStatus('won');
          } else if (parsedGuesses.length >= 6) {
            setGameStatus('lost');
          } else {
            setGameStatus('in_progress');
          }
          return;
        }
      } catch {
        // ignore
      }
      setGuesses([]);
      setGameStatus('in_progress');
    } else {
      // Unlimited mode
      const randomP = getRandomPlayer();
      setMysteryPlayer(randomP);
      setGuesses([]);
      setGameStatus('in_progress');
    }
  };

  // Start new unlimited game
  const handleNewUnlimitedGame = useCallback(() => {
    const nextPlayer = getRandomPlayer(mysteryPlayer.id);
    setMysteryPlayer(nextPlayer);
    setGuesses([]);
    setGameStatus('in_progress');
    setShowSummaryModal(false);
  }, [mysteryPlayer.id]);

  // Handle a new guess
  const handleGuess = (guessedPlayer: CricketPlayer) => {
    if (gameStatus !== 'in_progress' || guesses.length >= 6) return;

    playBatHit();
    playTilePop(guesses.length);

    const result = evaluateGuess(mysteryPlayer, guessedPlayer);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);

    // Save daily progress
    if (mode === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem(`cricdle_daily_guesses_${todayStr}`, JSON.stringify(newGuesses));
      } catch (err) {
        console.error('Failed to save daily guess:', err);
      }
    }

    if (result.isCorrect) {
      setGameStatus('won');
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedStats = updateUserStatsOnGameEnd(true, newGuesses.length, todayStr);
      setUserStats(updatedStats);
      setTimeout(() => {
        playVictoryChime();
        setShowSummaryModal(true);
      }, 500);
    } else if (newGuesses.length >= 6) {
      setGameStatus('lost');
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedStats = updateUserStatsOnGameEnd(false, 6, todayStr);
      setUserStats(updatedStats);
      setTimeout(() => {
        playGameOverChime();
        setShowSummaryModal(true);
      }, 500);
    }
  };

  // Handle sound toggle
  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  // Random guess helper for fun
  const handleRandomGuess = () => {
    const guessedIds = guesses.map((g) => g.player.id);
    const available = availablePlayers.filter((p) => !guessedIds.includes(p.id));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      handleGuess(pick);
    }
  };

  const guessedPlayerIds = guesses.map((g) => g.player.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-x-hidden">
      {/* Stadium Pitch Background Layer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20 bg-cover bg-center mix-blend-luminosity filter blur-[1px]"
        style={{ backgroundImage: `url(${pitchBg})` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />

      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        dayNumber={dailyInfo.dayNumber}
        soundEnabled={soundActive}
        onToggleSound={handleToggleSound}
        onOpenHowToPlay={() => setShowHowToPlayModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenDataArch={() => setShowDataArchModal(true)}
        onOpenPlayerDB={() => setShowPlayerDBModal(true)}
        onNewUnlimitedGame={handleNewUnlimitedGame}
        isGameOver={gameStatus !== 'in_progress'}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-6">
        {/* Hero Banner / Instructions Kicker */}
        <div className="text-center max-w-2xl mx-auto mb-3">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <img
              src={ballBadge}
              alt="Cricdle Emblem"
              className="w-6 h-6 rounded-full shadow-md object-cover border border-emerald-500/40"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {mode === 'daily'
                ? `Daily International Challenge #${dailyInfo.dayNumber}`
                : 'Unlimited International Practice'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Outfit']">
            Guess the Mystery Cricketer
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 text-balance">
            Compare Test, ODI & T20I runs and wickets in 6 tries. Limited to international players who debuted{' '}
            <strong className="text-emerald-400 font-semibold">post-1960</strong>.
          </p>

          {/* Quick Legend Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Green: Runs ≤ 1,000 / Wkts ≤ 100
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Yellow: Runs 1,001–4,000 / Wkts 101–300
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
              Grey: Runs &gt; 4,000 / Wkts &gt; 300
            </span>
          </div>
        </div>

        {/* Input Bar */}
        <GuessInput
          onGuess={handleGuess}
          guessedPlayerIds={guessedPlayerIds}
          disabled={gameStatus !== 'in_progress'}
          guessNumber={guesses.length + 1}
          availablePlayers={availablePlayers}
          onAddDynamicPlayer={handleAddDynamicPlayer}
        />

        {/* Quick Actions (Random Pick helper + How to play button) */}
        {gameStatus === 'in_progress' && (
          <div className="flex items-center justify-center gap-3 mb-2 text-xs">
            <button
              onClick={handleRandomGuess}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900/60"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Random Post-1960 Player</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-900/60"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>View Rule Details</span>
            </button>
          </div>
        )}

        {/* Progressive Clues Panel */}
        <CluesPanel mysteryPlayer={mysteryPlayer} guessCount={guesses.length} />

        {/* The 6-Column Guess Grid */}
        <GuessGrid guesses={guesses} maxGuesses={6} />

        {/* Game Finished Floating Bar if closed modal */}
        {gameStatus !== 'in_progress' && !showSummaryModal && (
          <div className="w-full max-w-xl mx-auto my-4 p-4 bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-[fadeIn_0.3s_ease-out]">
            <div>
              <div className="text-xs uppercase font-bold text-emerald-400">
                {gameStatus === 'won' ? 'Victory!' : 'Game Over'}
              </div>
              <div className="text-sm font-bold text-white">
                Mystery Player: {mysteryPlayer.name} ({mysteryPlayer.country}, Debut {mysteryPlayer.debutYear})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSummaryModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                View Summary
              </button>
              {mode === 'unlimited' && (
                <button
                  onClick={handleNewUnlimitedGame}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                >
                  Next Round
                </button>
              )}
            </div>
          </div>
        )}

        {/* Real-Time Database Explainer Box */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-xs text-slate-400 max-w-3xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60">
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Search Any International Player Post-1960</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Our database covers post-1960 international cricketers. Can&apos;t find someone? Type their name and click &ldquo;Search live database&rdquo; to fetch their career stats!
              </p>
            </div>
            <button
              onClick={() => setShowDataArchModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>View Data Pipeline</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-4 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Cricdle · International Cricket Wordle · Post-1960 Debuts · Test, ODI & T20I Stats
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setShowHowToPlayModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Rules
            </button>
            <span>·</span>
            <button
              onClick={() => setShowPlayerDBModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              Player Registry ({availablePlayers.length})
            </button>
            <span>·</span>
            <button
              onClick={() => setShowDataArchModal(true)}
              className="hover:text-slate-300 transition-colors"
            >
              API Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        won={gameStatus === 'won'}
        mysteryPlayer={mysteryPlayer}
        guesses={guesses}
        mode={mode}
        dayNumber={dailyInfo.dayNumber}
        onPlayAgainUnlimited={handleNewUnlimitedGame}
      />

      <HowToPlayModal
        isOpen={showHowToPlayModal}
        onClose={() => setShowHowToPlayModal(false)}
      />

      <DataArchitectureModal
        isOpen={showDataArchModal}
        onClose={() => setShowDataArchModal(false)}
        onAddPlayer={handleAddDynamicPlayer}
        totalPlayersCount={availablePlayers.length}
      />

      <PlayerDatabaseModal
        isOpen={showPlayerDBModal}
        onClose={() => setShowPlayerDBModal(false)}
        players={availablePlayers}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        stats={userStats}
      />
    </div>
  );
}
