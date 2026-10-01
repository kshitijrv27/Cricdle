import React, { useState, useEffect } from 'react';
import { X, Database, Server, Cpu, CheckCircle2, Globe, Loader2, Plus, Sparkles } from 'lucide-react';
import { CricketPlayer } from '../types/cricket';

interface DataArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer?: (player: CricketPlayer) => void;
  totalPlayersCount?: number;
}

export const DataArchitectureModal: React.FC<DataArchitectureModalProps> = ({
  isOpen,
  onClose,
  onAddPlayer,
  totalPlayersCount = 162,
}) => {
  const [cricsheetStatus, setCricsheetStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [lookupName, setLookupName] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<{ success: boolean; message: string; player?: CricketPlayer } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const checkCricsheet = async () => {
      setCheckingStatus(true);
      try {
        const res = await fetch('/api/cricsheet/status');
        const data = await res.json();
        setCricsheetStatus(data);
      } catch (err: any) {
        setCricsheetStatus({ status: 'offline', error: err.message });
      } finally {
        setCheckingStatus(false);
      }
    };

    checkCricsheet();
  }, [isOpen]);

  const handleTestIngest = async () => {
    if (!lookupName.trim() || isLookingUp) return;
    setIsLookingUp(true);
    setLookupResult(null);

    try {
      const res = await fetch('/api/lookup-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: lookupName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.found) {
        setLookupResult({ success: false, message: data.error || 'Player not found or debuted pre-1960.' });
      } else {
        setLookupResult({
          success: true,
          message: `Successfully pulled official career stats for ${data.player.name} (${data.player.country}, Debut ${data.player.debutYear})! Added to active registry.`,
          player: data.player,
        });
        if (onAddPlayer) {
          onAddPlayer(data.player);
        }
      }
    } catch (err: any) {
      setLookupResult({ success: false, message: 'Network error connecting to ingestion pipeline.' });
    } finally {
      setIsLookingUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                Real-Time Cricket Stats & Cricsheet Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Direct answer & live connection status for international cricket data
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

        <div className="space-y-5 text-sm text-slate-300">
          {/* Live Cricsheet Connection Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  Live Cricsheet & Database Sync Status
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {checkingStatus ? (
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Pinging Cricsheet.org...
                  </span>
                ) : cricsheetStatus?.status === 'connected' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Cricsheet Connection Active (HTTP {cricsheetStatus.cricsheetHttpCode})
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">Local AI Pipeline Active</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-sans uppercase">Currently Indexed</div>
                <div className="text-base font-bold text-white mt-0.5">{totalPlayersCount} Players</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-sans uppercase">Cricsheet Register</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">18,554 IDs</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 font-sans uppercase">Eligible Scope</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">Debuts &ge; 1960</div>
              </div>
            </div>
          </div>

          {/* Test Ingestion Tool */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
            <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Live Ingestion: Add ANY Post-1960 International Cricketer
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Type the name of any international cricketer (from any era post-1960) to test pulling their official records directly into your game database:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={lookupName}
                onChange={(e) => setLookupName(e.target.value)}
                placeholder="e.g. Shamar Joseph, Gus Atkinson, Kamindu Mendis, Henry Olonga..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTestIngest();
                }}
              />
              <button
                type="button"
                disabled={isLookingUp || lookupName.trim().length < 2}
                onClick={handleTestIngest}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Pulling Records...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Fetch & Add</span>
                  </>
                )}
              </button>
            </div>

            {lookupResult && (
              <div
                className={`mt-3 p-3 rounded-lg text-xs flex items-start gap-2 ${
                  lookupResult.success
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border border-red-500/40 text-red-200'
                }`}
              >
                {lookupResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{lookupResult.message}</span>
              </div>
            )}
          </div>

          {/* Detailed Question Answer */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              How to Add All ~2,200 International Players in Practice
            </h3>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                <strong>1. The Cricsheet Data Structure:</strong> Cricsheet does not run a search REST API with endpoints like <code>/players?search=Rohit</code>. Instead, it publishes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><code>people.csv</code>: A flat registry of all 18,554 players with debut dates and cross-platform IDs.</li>
                <li>Ball-by-ball zip archives (over 200MB of raw JSON) containing individual match files.</li>
              </ul>

              <p>
                <strong>2. Why Not Bundle All 2,200 Players into Client JS?</strong>
                If every single cricketer who debuted since 1960 (including associate nation players from 30+ countries) were downloaded in the initial bundle, the page size would exceed 4–6MB, causing slow loading on mobile phones.
              </p>

              <p>
                <strong>3. The Production Solution (Hybrid Real-Time Ingestion):</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li><strong>Tier 1 (Instant Registry):</strong> We pre-bundle the top 160+ most famous international players for instant 0ms autocomplete.</li>
                <li><strong>Tier 2 (Live Real-Time Resolver):</strong> When anyone searches for any of the other 2,000+ international post-1960 cricketers, the backend endpoint (<code>/api/lookup-player</code>) pulls their verified Test/ODI/T20I career stats on the fly and permanently adds them to your local database!</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
