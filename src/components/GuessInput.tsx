import React, { useState, useRef, useEffect } from 'react';
import { Search, UserCheck, Loader2, Globe, AlertCircle } from 'lucide-react';
import { CricketPlayer } from '../types/cricket';

interface GuessInputProps {
  onGuess: (player: CricketPlayer) => void;
  guessedPlayerIds: string[];
  disabled: boolean;
  guessNumber: number;
  availablePlayers: CricketPlayer[];
  onAddDynamicPlayer: (player: CricketPlayer) => void;
}

export const GuessInput: React.FC<GuessInputProps> = ({
  onGuess,
  guessedPlayerIds,
  disabled,
  guessNumber,
  availablePlayers,
  onAddDynamicPlayer,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter players based on input query
  const filteredPlayers = React.useMemo(() => {
    if (!query.trim()) return [];
    const cleanQuery = query.toLowerCase().trim();
    return availablePlayers.filter((player) => {
      const isAlreadyGuessed = guessedPlayerIds.includes(player.id);
      if (isAlreadyGuessed) return false;

      const matchesName = player.name.toLowerCase().includes(cleanQuery);
      const matchesCountry = player.country.toLowerCase().includes(cleanQuery);
      const matchesCode = player.countryCode.toLowerCase().includes(cleanQuery);
      const matchesRole = player.role.toLowerCase().includes(cleanQuery);

      return matchesName || matchesCountry || matchesCode || matchesRole;
    }).slice(0, 8);
  }, [query, guessedPlayerIds, availablePlayers]);

  useEffect(() => {
    setSelectedIndex(0);
    setLookupError(null);
  }, [query]);

  const handleSelect = (player: CricketPlayer) => {
    onGuess(player);
    setQuery('');
    setIsOpen(false);
    setLookupError(null);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleLiveLookup = async () => {
    if (!query.trim() || isSearchingLive) return;
    setIsSearchingLive(true);
    setLookupError(null);

    try {
      const res = await fetch('/api/lookup-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.found) {
        setLookupError(data.error || 'Could not find international cricketer post-1960.');
        setIsSearchingLive(false);
        return;
      }

      const player: CricketPlayer = data.player;
      onAddDynamicPlayer(player);
      handleSelect(player);
    } catch (err: any) {
      setLookupError('Network error looking up player. Please try again.');
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown' && filteredPlayers.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredPlayers.length);
    } else if (e.key === 'ArrowUp' && filteredPlayers.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPlayers.length) % filteredPlayers.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPlayers.length > 0 && filteredPlayers[selectedIndex]) {
        handleSelect(filteredPlayers[selectedIndex]);
      } else if (query.trim().length >= 3) {
        handleLiveLookup();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto my-4">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Guess {Math.min(guessNumber, 6)} of 6
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <span className="text-emerald-400 font-bold">Post-1960</span> International Debuts
        </span>
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Game finished'
              : 'Search any cricketer debuted post-1960 (e.g. Shane Warne, Rohit Sharma, Botham)...'
          }
          className="w-full pl-11 pr-24 py-3 bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 rounded-xl text-slate-100 placeholder-slate-500 text-sm shadow-inner transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
          spellCheck="false"
        />

        <div className="absolute right-2 flex items-center">
          <button
            type="button"
            disabled={disabled || (!filteredPlayers[selectedIndex] && query.trim().length < 3)}
            onClick={() => {
              if (filteredPlayers[selectedIndex]) {
                handleSelect(filteredPlayers[selectedIndex]);
              } else {
                handleLiveLookup();
              }
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1"
          >
            {isSearchingLive ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <span>Guess</span>
                <UserCheck className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (filteredPlayers.length > 0 || query.trim().length >= 2) && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 max-h-84 overflow-y-auto divide-y divide-slate-800/60"
        >
          {filteredPlayers.map((player, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => handleSelect(player)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                  isSelected ? 'bg-slate-800/90 text-white' : 'hover:bg-slate-800/50 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0" role="img" aria-label={player.country}>
                    {player.flag}
                  </span>
                  <div className="truncate">
                    <div className="text-sm font-semibold truncate text-white flex items-center gap-2">
                      <span>{player.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                        Debut: {player.debutYear}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{player.country}</span>
                      <span>·</span>
                      <span className="text-emerald-400">{player.role}</span>
                      <span>·</span>
                      <span>{player.activeYears}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono tabular-nums hidden sm:block">
                  <div>T: {player.testRuns}r / {player.testWickets}w</div>
                  <div>ODI: {player.odiRuns}r / {player.odiWickets}w</div>
                </div>
              </button>
            );
          })}

          {/* Dynamic live lookup button for any unlisted post-1960 international player */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            <button
              type="button"
              disabled={isSearchingLive}
              onClick={handleLiveLookup}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2"
            >
              {isSearchingLive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Looking up {query} in international post-1960 records...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    Search live database for &ldquo;{query}&rdquo; (Post-1960 International Debuts)
                  </span>
                </>
              )}
            </button>
          </div>

          {lookupError && (
            <div className="p-3 bg-red-950/40 border-t border-red-900/50 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
