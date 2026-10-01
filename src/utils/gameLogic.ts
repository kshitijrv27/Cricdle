import { CricketPlayer, GuessResult, StatComparison, UserGameStats } from '../types/cricket';
import { CRICKET_PLAYERS } from '../data/cricketPlayers';

/**
 * Compare runs according to game rules:
 * - 0 to 1000 diff: green
 * - 1001 to 4000 diff: yellow
 * - > 4000 diff: grey
 * Arrow indicates where the Mystery Player lies relative to Guess.
 */
export function compareRuns(mystery: number, guess: number): StatComparison {
  const diff = Math.abs(mystery - guess);
  let color: 'green' | 'yellow' | 'grey';

  if (diff <= 1000) {
    color = 'green';
  } else if (diff <= 4000) {
    color = 'yellow';
  } else {
    color = 'grey';
  }

  let direction: 'up' | 'down' | 'exact';
  if (mystery > guess) {
    direction = 'up';
  } else if (mystery < guess) {
    direction = 'down';
  } else {
    direction = 'exact';
  }

  return {
    diff,
    color,
    direction,
    mysteryVal: mystery,
    guessVal: guess,
  };
}

/**
 * Compare wickets according to game rules:
 * - 0 to 100 diff: green
 * - 101 to 300 diff: yellow
 * - > 300 diff: grey
 */
export function compareWickets(mystery: number, guess: number): StatComparison {
  const diff = Math.abs(mystery - guess);
  let color: 'green' | 'yellow' | 'grey';

  if (diff <= 100) {
    color = 'green';
  } else if (diff <= 300) {
    color = 'yellow';
  } else {
    color = 'grey';
  }

  let direction: 'up' | 'down' | 'exact';
  if (mystery > guess) {
    direction = 'up';
  } else if (mystery < guess) {
    direction = 'down';
  } else {
    direction = 'exact';
  }

  return {
    diff,
    color,
    direction,
    mysteryVal: mystery,
    guessVal: guess,
  };
}

/**
 * Evaluate role similarity
 */
function evaluateRoleMatch(mysteryRole: string, guessRole: string): 'exact' | 'partial' | 'none' {
  if (mysteryRole === guessRole) return 'exact';

  const isMysteryBowler = mysteryRole.includes('Bowler');
  const isGuessBowler = guessRole.includes('Bowler');
  if (isMysteryBowler && isGuessBowler) return 'partial';

  const isMysteryBat = mysteryRole === 'Batter' || mysteryRole === 'Wicketkeeper-Batter';
  const isGuessBat = guessRole === 'Batter' || guessRole === 'Wicketkeeper-Batter';
  if (isMysteryBat && isGuessBat) return 'partial';

  if (mysteryRole === 'All-Rounder' || guessRole === 'All-Rounder') return 'partial';

  return 'none';
}

/**
 * Evaluates a guess against the mystery player
 */
export function evaluateGuess(mystery: CricketPlayer, guess: CricketPlayer): GuessResult {
  const isCorrect = mystery.id === guess.id;
  const countryMatch = mystery.country.toLowerCase() === guess.country.toLowerCase();
  const roleMatch = evaluateRoleMatch(mystery.role, guess.role);

  return {
    player: guess,
    testRuns: compareRuns(mystery.testRuns, guess.testRuns),
    testWickets: compareWickets(mystery.testWickets, guess.testWickets),
    odiRuns: compareRuns(mystery.odiRuns, guess.odiRuns),
    odiWickets: compareWickets(mystery.odiWickets, guess.odiWickets),
    t20iRuns: compareRuns(mystery.t20iRuns, guess.t20iRuns),
    t20iWickets: compareWickets(mystery.t20iWickets, guess.t20iWickets),
    countryMatch,
    roleMatch,
    isCorrect,
  };
}

/**
 * Get daily mystery player deterministically based on date string
 */
export function getDailyPlayer(dateStr?: string): { player: CricketPlayer; dayNumber: number } {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  // Epoch anchor date for daily numbering
  const epoch = new Date('2025-01-01').getTime();
  const current = new Date(targetDate).getTime();
  const dayIndex = Math.max(0, Math.floor((current - epoch) / (1000 * 60 * 60 * 24)));

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < targetDate.length; i++) {
    hash = (hash << 5) - hash + targetDate.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  const playerIndex = (positiveHash + dayIndex) % CRICKET_PLAYERS.length;

  return {
    player: CRICKET_PLAYERS[playerIndex],
    dayNumber: dayIndex + 1,
  };
}

/**
 * Get random player for unlimited practice mode
 */
export function getRandomPlayer(excludeId?: string): CricketPlayer {
  const pool = excludeId
    ? CRICKET_PLAYERS.filter((p) => p.id !== excludeId)
    : CRICKET_PLAYERS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

const STATS_STORAGE_KEY = 'cricdle_user_stats';

export function loadUserStats(): UserGameStats {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Failed to load user stats:', err);
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function saveUserStats(stats: UserGameStats): void {
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats:', err);
  }
}

export function updateUserStatsOnGameEnd(
  won: boolean,
  guessesUsed: number,
  todayStr: string
): UserGameStats {
  const current = loadUserStats();

  const newStats: UserGameStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    gamesWon: won ? current.gamesWon + 1 : current.gamesWon,
    currentStreak: won ? current.currentStreak + 1 : 0,
    maxStreak: won
      ? Math.max(current.maxStreak, current.currentStreak + 1)
      : current.maxStreak,
    guessDistribution: { ...current.guessDistribution },
    lastPlayedDate: todayStr,
  };

  if (won && guessesUsed >= 1 && guessesUsed <= 6) {
    const key = guessesUsed as 1 | 2 | 3 | 4 | 5 | 6;
    newStats.guessDistribution[key] = (newStats.guessDistribution[key] || 0) + 1;
  }

  saveUserStats(newStats);
  return newStats;
}

/**
 * Generate share text with emoji grid
 */
export function generateShareText(
  guesses: GuessResult[],
  won: boolean,
  mode: 'daily' | 'unlimited',
  dayNumber: number
): string {
  const countStr = won ? `${guesses.length}/6` : 'X/6';
  const title = mode === 'daily' ? `Cricdle Daily #${dayNumber}` : 'Cricdle Unlimited';

  const rows = guesses.map((g) => {
    if (g.isCorrect) {
      return '🟩🟩🟩🟩🟩🟩';
    }
    const colorEmoji = (comp: StatComparison) => {
      if (comp.color === 'green') return '🟩';
      if (comp.color === 'yellow') return '🟨';
      return '⬛';
    };

    return [
      colorEmoji(g.testRuns),
      colorEmoji(g.testWickets),
      colorEmoji(g.odiRuns),
      colorEmoji(g.odiWickets),
      colorEmoji(g.t20iRuns),
      colorEmoji(g.t20iWickets),
    ].join('');
  });

  return `${title} ${countStr}\n\n${rows.join('\n')}\n\nPlay: Cricdle - Cricket Wordle`;
}
