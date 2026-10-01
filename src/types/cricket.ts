export type PlayingRole =
  | 'Batter'
  | 'Fast Bowler'
  | 'Spin Bowler'
  | 'All-Rounder'
  | 'Wicketkeeper-Batter';

export interface CricketPlayer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  role: PlayingRole;
  battingStyle: string;
  bowlingStyle: string;
  activeYears: string;
  debutYear: number;
  testRuns: number;
  testWickets: number;
  odiRuns: number;
  odiWickets: number;
  t20iRuns: number;
  t20iWickets: number;
  avatarUrl?: string;
  notableAchievements: string;
}

export interface StatComparison {
  diff: number;
  color: 'green' | 'yellow' | 'grey';
  direction: 'up' | 'down' | 'exact';
  mysteryVal: number;
  guessVal: number;
}

export interface GuessResult {
  player: CricketPlayer;
  testRuns: StatComparison;
  testWickets: StatComparison;
  odiRuns: StatComparison;
  odiWickets: StatComparison;
  t20iRuns: StatComparison;
  t20iWickets: StatComparison;
  countryMatch: boolean;
  roleMatch: 'exact' | 'partial' | 'none';
  isCorrect: boolean;
}

export type GameMode = 'daily' | 'unlimited';

export type GameStatus = 'in_progress' | 'won' | 'lost';

export interface UserGameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
  lastPlayedDate?: string;
}
