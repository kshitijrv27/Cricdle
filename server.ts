import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory cache of dynamically looked-up cricketers
const dynamicPlayersCache = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: Cricsheet connection status & telemetry
  app.get('/api/cricsheet/status', async (req, res) => {
    try {
      // Test real connection to Cricsheet.org
      const cricsheetResp = await fetch('https://cricsheet.org/', { method: 'HEAD' });
      const isCricsheetReachable = cricsheetResp.ok;

      res.json({
        status: isCricsheetReachable ? 'connected' : 'offline',
        cricsheetHttpCode: cricsheetResp.status,
        provider: 'Cricsheet Open Data + Live AI Stat Grounding',
        cachedPlayersCount: dynamicPlayersCache.size,
        registryFormat: 'Tests, ODIs, T20Is (Post-1960 Debuts)',
        cricsheetRegisterUrl: 'https://cricsheet.org/register/people.csv',
        lastChecked: new Date().toISOString(),
      });
    } catch (err: any) {
      res.json({
        status: 'degraded',
        error: err.message,
        provider: 'Local Registry + AI Resolver',
        cachedPlayersCount: dynamicPlayersCache.size,
        lastChecked: new Date().toISOString(),
      });
    }
  });

  // API Route: Look up any international cricketer who debuted post-1960
  app.post('/api/lookup-player', async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Please provide a valid player name.' });
      }

      const cleanQuery = name.trim().toLowerCase();

      // Check cache first
      if (dynamicPlayersCache.has(cleanQuery)) {
        return res.json({ found: true, player: dynamicPlayersCache.get(cleanQuery), cached: true });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({
          error: 'Gemini API key is not configured for dynamic lookups. Using local database.',
        });
      }

      const ai = new GoogleGenAI();

      const prompt = `You are an expert international cricket statistician and historian.
Given the cricket player query: "${name.trim()}".
Task:
1. Identify if this person played international cricket (Tests, ODIs, or T20Is) for any recognized national team (ICC Full Member or Associate).
2. Determine their international debut year.
3. If they made their international debut in or after 1960 (i.e., debutYear >= 1960), provide their accurate official career statistics across Tests, ODIs, and T20Is up to the latest known records (2024-2026).
4. If they made their international debut before 1960 (e.g., Don Bradman in 1928, Len Hutton in 1937), set debutedPost1960 to false.
5. If they never played international cricket at all, set isInternationalCricketer to false.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isInternationalCricketer: { type: Type.BOOLEAN },
              debutedPost1960: { type: Type.BOOLEAN },
              debutYear: { type: Type.INTEGER },
              canonicalName: { type: Type.STRING },
              country: { type: Type.STRING },
              countryCode: { type: Type.STRING },
              flagEmoji: { type: Type.STRING },
              role: {
                type: Type.STRING,
                enum: ['Batter', 'Fast Bowler', 'Spin Bowler', 'All-Rounder', 'Wicketkeeper-Batter'],
              },
              battingStyle: { type: Type.STRING },
              bowlingStyle: { type: Type.STRING },
              activeYears: { type: Type.STRING },
              testRuns: { type: Type.INTEGER },
              testWickets: { type: Type.INTEGER },
              odiRuns: { type: Type.INTEGER },
              odiWickets: { type: Type.INTEGER },
              t20iRuns: { type: Type.INTEGER },
              t20iWickets: { type: Type.INTEGER },
              notableAchievements: { type: Type.STRING },
            },
            required: [
              'isInternationalCricketer',
              'debutedPost1960',
              'debutYear',
              'canonicalName',
              'country',
              'countryCode',
              'flagEmoji',
              'role',
              'battingStyle',
              'bowlingStyle',
              'activeYears',
              'testRuns',
              'testWickets',
              'odiRuns',
              'odiWickets',
              't20iRuns',
              't20iWickets',
              'notableAchievements',
            ],
          },
        },
      });

      const text = response.text?.trim();
      if (!text) {
        return res.status(404).json({ error: 'No data returned for player.' });
      }

      const data = JSON.parse(text);

      if (!data.isInternationalCricketer) {
        return res.status(404).json({
          error: `"${name}" was not found as a recognized international cricketer.`,
        });
      }

      if (!data.debutedPost1960 || data.debutYear < 1960) {
        return res.status(400).json({
          error: `${data.canonicalName} made their international debut in ${data.debutYear} (pre-1960). Only post-1960 international cricketers are eligible.`,
          debutYear: data.debutYear,
        });
      }

      // Format player object matching Cricdle schema
      const player = {
        id: data.canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: data.canonicalName,
        country: data.country,
        countryCode: data.countryCode,
        flag: data.flagEmoji || '🏏',
        role: data.role,
        battingStyle: data.battingStyle,
        bowlingStyle: data.bowlingStyle,
        activeYears: data.activeYears,
        debutYear: data.debutYear,
        testRuns: Math.max(0, data.testRuns),
        testWickets: Math.max(0, data.testWickets),
        odiRuns: Math.max(0, data.odiRuns),
        odiWickets: Math.max(0, data.odiWickets),
        t20iRuns: Math.max(0, data.t20iRuns),
        t20iWickets: Math.max(0, data.t20iWickets),
        notableAchievements: data.notableAchievements,
      };

      // Cache the result
      dynamicPlayersCache.set(cleanQuery, player);
      dynamicPlayersCache.set(player.name.toLowerCase(), player);
      dynamicPlayersCache.set(player.id, player);

      return res.json({ found: true, player, cached: false });
    } catch (err: any) {
      console.error('Player lookup error:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to lookup player statistics.',
      });
    }
  });

  // Mount Vite or static dist
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Cricdle server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
