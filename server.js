/* ══════════════════════════════════════════
   VoxArena — Backend Server
   Port: 3001
   Endpoint: POST /speak → Murf AI voice generation
   ══════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const axios   = require('axios');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────
app.use(express.json());

// Allow requests from the frontend dev server (port 5500) and any localhost
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'VoxArena Backend', version: '1.0.0' });
});

// ── POST /speak ─────────────────────────────────────────────────────
/**
 * Body:  { text: string, voiceId?: string }
 * Returns: { audioUrl: string }
 */
app.post('/speak', async (req, res) => {
  const { text, voiceId = 'en-US-natalie' } = req.body;

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Missing or empty "text" field in request body.' });
  }

  if (!process.env.MURF_API_KEY) {
    console.error('[VoxArena] MURF_API_KEY is not set in environment.');
    return res.status(500).json({ error: 'Server misconfiguration: API key not set.' });
  }

  // Truncate very long texts to avoid API limits (Murf limit ~3000 chars)
  const safeText = text.trim().slice(0, 3000);

  console.log(`[VoxArena] /speak called → voiceId="${voiceId}", text="${safeText.slice(0, 80)}..."`);

  try {
    const murfResponse = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      {
        voiceId,
        style:       'Conversational',
        text:        safeText,
        rate:        0,
        pitch:       0,
        sampleRate:  24000,
        format:      'MP3',
        channelType: 'MONO',
      },
      {
        headers: {
          'api-key':      process.env.MURF_API_KEY,
          'Content-Type': 'application/json',
          'Accept':       'application/json',
        },
        timeout: 30000, // 30 seconds
      }
    );

    // Murf returns the audio URL in audioFile field
    const audioUrl =
      murfResponse.data?.audioFile ||
      murfResponse.data?.audio_file ||
      murfResponse.data?.url ||
      null;

    if (!audioUrl) {
      console.error('[VoxArena] Murf response missing audio URL:', JSON.stringify(murfResponse.data));
      return res.status(502).json({
        error: 'Murf AI returned a response but no audio URL was found.',
        raw:   murfResponse.data,
      });
    }

    console.log(`[VoxArena] Audio generated successfully → ${audioUrl}`);
    return res.json({ audioUrl });

  } catch (err) {
    if (err.response) {
      // Murf API returned an error response
      const status  = err.response.status;
      const message = err.response.data?.message || err.response.data?.error || 'Unknown Murf API error';
      console.error(`[VoxArena] Murf API error ${status}: ${message}`);
      return res.status(502).json({
        error:   `Murf API error (${status}): ${message}`,
        details: err.response.data,
      });
    } else if (err.code === 'ECONNABORTED') {
      console.error('[VoxArena] Murf API request timed out.');
      return res.status(504).json({ error: 'Murf API request timed out. Try again.' });
    } else {
      console.error('[VoxArena] Unexpected error:', err.message);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
  }
});

// ── Start server ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  VoxArena Backend running on :${PORT}  ║`);
  console.log(`╚══════════════════════════════════════╝`);
  console.log(`► Health:  http://localhost:${PORT}/health`);
  console.log(`► Speak:   POST http://localhost:${PORT}/speak\n`);
});
