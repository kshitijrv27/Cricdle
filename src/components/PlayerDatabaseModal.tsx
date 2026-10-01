import React, { useState, useMemo } from 'react';
import { X, Search, Database } from 'lucide-react';
import { CricketPlayer } from '../types/cricket';

interface PlayerDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: CricketPlayer[];
}

export const PlayerDatabaseModal: React.FC<PlayerDatabaseModalProps> = ({
  isOpen,
  onClose,
  players,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedDecade, setSelectedDecade] = useState('All');

  // Extract unique countries
  const countries = useMemo(() => {
    const list = Array.from(new Set(players.map((p) => p.country))).sort();
    return ['All', ...list];
  }, [players]);

  const roles = ['All', 'Batter', 'Fast Bowler', 'Spin Bowler', 'All-Rounder', 'Wicketkeeper-Batter'];
  const decades = [
    { label: 'All Decades (Post-1960)', value: 'All' },
    { label: '2020s Debuts', value: '2020' },
    { label: '2010s Debuts', value: '2010' },
    { label: '2000s Debuts', value: '2000' },
    { label: '1990s Debuts', value: '1990' },
    { label: '1980s Debuts', value: '1980' },
    { label: '1970s Debuts', value: '1970' },
    { label: '1960s Debuts', value: '1960' },
  ];

  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = selectedCountry === 'All' || player.country === selectedCountry;
      const matchesRole = selectedRole === 'All' || player.role === selectedRole;
      const matchesDecade =
        selectedDecade === 'All' ||
        (player.debutYear >= parseInt(selectedDecade, 10) &&
          player.debutYear < parseInt(selectedDecade, 10) + 10);

      return matchesSearch && matchesCountry && matchesRole && matchesDecade;
    });
  }, [players, searchTerm, selectedCountry, selectedRole, selectedDecade]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                Post-1960 International Cricketers Registry ({players.length} Players)
              </h2>
              <p className="text-xs text-slate-400">
                Verified, updated career statistics for cricketers who made their international debut in or after 1960
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter players by name or country..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  Country: {c}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  Role: {r}
                </option>
              ))}
            </select>

            <select
              value={selectedDecade}
              onChange={(e) => setSelectedDecade(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {decades.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table of Players */}
        <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/80">
                <th className="py-3 px-3">Player</th>
                <th className="py-3 px-2">Debut</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2 text-right">Test R</th>
                <th className="py-3 px-2 text-right">Test W</th>
                <th className="py-3 px-2 text-right">ODI R</th>
                <th className="py-3 px-2 text-right">ODI W</th>
                <th className="py-3 px-2 text-right">T20I R</th>
                <th className="py-3 px-2 text-right pr-3">T20I W</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono">
              {filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{player.flag}</span>
                      <div>
                        <div className="font-bold text-white font-sans text-xs">
                          {player.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {player.country} · {player.activeYears}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300 tabular-nums">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300 text-[11px]">
                      {player.debutYear}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-sans text-slate-300 text-[11px]">
                    <span className="text-emerald-400">{player.role}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-200 tabular-nums">
                    {player.testRuns.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-400 tabular-nums">
                    {player.testWickets}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-200 tabular-nums">
                    {player.odiRuns.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-400 tabular-nums">
                    {player.odiWickets}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-slate-200 tabular-nums">
                    {player.t20iRuns.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2 text-right pr-3 text-slate-400 tabular-nums">
                    {player.t20iWickets}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPlayers.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No cricketers match your current search/filters. You can search any post-1960 international player directly in the main guess bar!
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filteredPlayers.length} of {players.length} registered post-1960 players</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
