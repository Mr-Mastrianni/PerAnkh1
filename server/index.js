/* Simple Media API server for Per Ankh
 * Endpoints:
 *  GET  /api/health                 → { ok: true }
 *  GET  /api/media                  → list media metadata
 *  POST /api/media  (multipart)     → upload one or more files (field: files)
 *  DELETE /api/media/:id            → delete file by id
 *  Static files served at /uploads  → uploaded files
 */

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Paths
const ROOT = path.resolve(__dirname, '..');
const UPLOAD_DIR = path.join(ROOT, 'uploads', 'media');
const DATA_DIR = path.join(__dirname, 'data');
const MEDIA_DB_PATH = path.join(DATA_DIR, 'media.json');
const ANALYTICS_DB_PATH = path.join(DATA_DIR, 'analytics.json');

// Ensure folders
await fs.ensureDir(UPLOAD_DIR);
await fs.ensureDir(DATA_DIR);
if (!(await fs.pathExists(MEDIA_DB_PATH))) await fs.writeJson(MEDIA_DB_PATH, []);
if (!(await fs.pathExists(ANALYTICS_DB_PATH))) await fs.writeJson(ANALYTICS_DB_PATH, { events: [] });

// CORS for local dev (vite on 5173)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^A-Za-z0-9._-]/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

function readMediaDb() {
  return fs.readJson(MEDIA_DB_PATH);
}
function writeMediaDb(data) {
  return fs.writeJson(MEDIA_DB_PATH, data, { spaces: 2 });
}

async function readAnalyticsDb() {
  return fs.readJson(ANALYTICS_DB_PATH);
}
async function writeAnalyticsDb(data) {
  return fs.writeJson(ANALYTICS_DB_PATH, data, { spaces: 2 });
}

// Helpers
function isAdminPath(p = '') {
  try {
    const v = String(p).toLowerCase();
    return v.startsWith('/admin') || v.includes('admin-');
  } catch { return false; }
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uploads: '/uploads', version: 1 });
});

// List media
app.get('/api/media', async (_req, res) => {
  const items = await readMediaDb();
  res.json(items);
});

// Upload media
app.post('/api/media', upload.array('files', 20), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
  const items = await readMediaDb();
  const saved = files.map((f) => {
    const id = uuid();
    const record = {
      id,
      name: f.originalname,
      storedName: path.basename(f.filename),
      size: f.size,
      type: f.mimetype,
      uploadDate: new Date().toISOString(),
      url: `/uploads/media/${path.basename(f.filename)}`,
    };
    items.push(record);
    return record;
  });
  await writeMediaDb(items);
  res.json(saved);
});

// Delete media
app.delete('/api/media/:id', async (req, res) => {
  const id = req.params.id;
  const items = await readMediaDb();
  const idx = items.findIndex((m) => m.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const item = items[idx];
  items.splice(idx, 1);
  await writeMediaDb(items);
  // Try to remove file
  try {
    await fs.remove(path.join(UPLOAD_DIR, item.storedName));
  } catch {}
  res.json({ ok: true });
});

// --- Analytics -----------------------------------------------------------

// Track an analytics event (pageview etc.)
app.post('/api/analytics/track', async (req, res) => {
  try {
    const { type = 'pageview', path: pagePath = '/', page, referrer, device, sessionId } = req.body || {};
    const ua = req.headers['user-agent'] || '';
    // Ignore admin routes from tracking
    const finalPath = pagePath || page || '/';
    if (isAdminPath(finalPath)) return res.json({ ok: true, ignored: true });
    const event = {
      id: uuid(),
      ts: Date.now(),
      type,
      path: finalPath,
      referrer: referrer || req.headers.referer || '',
      device: device || ua,
      sessionId: sessionId || uuid(),
      ip: req.ip,
    };
    const db = await readAnalyticsDb();
    db.events.push(event);
    await writeAnalyticsDb(db);
    res.json({ ok: true, eventId: event.id });
  } catch (e) {
    res.status(500).json({ error: 'failed_to_track' });
  }
});

// Helpers
function filterEvents(events, period) {
  const now = Date.now();
  const map = { '1d': 864e5, '7d': 7 * 864e5, '30d': 30 * 864e5, '90d': 90 * 864e5, '1y': 365 * 864e5 };
  const windowMs = map[period] || map['7d'];
  const from = now - windowMs;
  return events.filter((e) => e.ts >= from && !isAdminPath(e.path));
}

// Summary stats
app.get('/api/analytics/summary', async (req, res) => {
  const period = req.query.period || '7d';
  const { events } = await readAnalyticsDb();
  const evs = filterEvents(events, period);
  const pageviews = evs.length;
  const sessions = new Set(evs.map((e) => e.sessionId)).size;
  // Approximate bounce: sessions with only 1 event in window
  const countsBySession = evs.reduce((m, e) => (m.set(e.sessionId, (m.get(e.sessionId) || 0) + 1), m), new Map());
  const bounces = Array.from(countsBySession.values()).filter((c) => c === 1).length;
  const bounceRate = sessions ? Math.round((bounces / sessions) * 1000) / 10 : 0;
  res.json({ visitors: sessions, pageViews: pageviews, avgSession: null, bounceRate, newMembers: null, mobileTraffic: null });
});

// Timeseries for visitors chart
app.get('/api/analytics/timeseries', async (req, res) => {
  const period = req.query.period || '7d';
  const { events } = await readAnalyticsDb();
  const evs = filterEvents(events, period);
  // Bucket by hour/day depending on period
  let buckets = [];
  if (period === '1d') {
    buckets = Array.from({ length: 24 }, (_, i) => ({ label: `${i}:00`, value: 0 }));
    evs.forEach((e) => {
      const d = new Date(e.ts);
      buckets[d.getHours()].value += 1;
    });
  } else {
    const days = { '7d': 7, '30d': 30, '90d': 12, '1y': 12 };
    const count = days[period] || 7;
    const now = new Date();
    buckets = Array.from({ length: count }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (count - 1 - i));
      return { label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), key: d.toDateString(), value: 0 };
    });
    evs.forEach((e) => {
      const key = new Date(e.ts).toDateString();
      const b = buckets.find((b) => b.key === key);
      if (b) b.value += 1;
    });
  }
  res.json({ labels: buckets.map((b) => b.label), values: buckets.map((b) => b.value) });
});

// Top pages
app.get('/api/analytics/top-pages', async (req, res) => {
  const period = req.query.period || '7d';
  const { events } = await readAnalyticsDb();
  const evs = filterEvents(events, period);
  const counts = evs.reduce((m, e) => (m.set(e.path, (m.get(e.path) || 0) + 1), m), new Map());
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  res.json(top.map(([path, count]) => ({ path, count })));
});

// Sources (derived from referrer)
app.get('/api/analytics/sources', async (req, res) => {
  const period = req.query.period || '7d';
  const { events } = await readAnalyticsDb();
  const evs = filterEvents(events, period);
  function sourceOf(r) {
    if (!r) return 'Direct';
    try {
      const h = new URL(r).hostname;
      if (h.includes('google')) return 'Search';
      if (h.includes('facebook') || h.includes('twitter') || h.includes('instagram')) return 'Social';
      return 'Referral';
    } catch {
      return 'Referral';
    }
  }
  const counts = evs.reduce((m, e) => (m.set(sourceOf(e.referrer), (m.get(sourceOf(e.referrer)) || 0) + 1), m), new Map());
  const out = Array.from(counts.entries()).map(([source, count]) => ({ source, count }));
  res.json(out);
});

// Devices (rough heuristic on UA)
app.get('/api/analytics/devices', async (req, res) => {
  const period = req.query.period || '7d';
  const { events } = await readAnalyticsDb();
  const evs = filterEvents(events, period);
  function deviceOf(ua = '') { return /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop'; }
  const counts = evs.reduce((m, e) => (m.set(deviceOf(e.device), (m.get(deviceOf(e.device)) || 0) + 1), m), new Map());
  const out = Array.from(counts.entries()).map(([device, count]) => ({ device, count }));
  res.json(out);
});

// Realtime (last 20)
app.get('/api/analytics/realtime', async (req, res) => {
  const { events } = await readAnalyticsDb();
  const last = events.slice(-50).reverse().slice(0, 20).map((e) => ({
    time: new Date(e.ts).toLocaleTimeString(),
    page: e.path,
    location: '—',
    device: /Mobile|Android|iPhone/i.test(e.device || '') ? 'Mobile' : 'Desktop',
    duration: '—'
  }));
  res.json(last);
});

app.listen(PORT, () => {
  console.log(`Media API listening on http://localhost:${PORT}`);
});


