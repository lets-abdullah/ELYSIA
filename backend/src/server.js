import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { validateEnv } from './config/env.js';
import { query, testConnection } from './db/pool.js';

import authRoutes      from './routes/authRoutes.js';
import roomRoutes      from './routes/roomRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import customerRoutes  from './routes/customerRoutes.js';
import userRoutes      from './routes/userRoutes.js';
import reportRoutes    from './routes/reportRoutes.js';
import invoiceRoutes   from './routes/invoiceRoutes.js';
import { csrfProtection } from './middleware/csrf.js';

dotenv.config();

// ── 1. Startup Environment Validation ─────────────────────────────────────────
validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── 2. Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"]
      }
    },
    frameguard: { action: 'deny' },
    xContentTypeOptions: true,
    hidePoweredBy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// ── 3. CORS Configuration ─────────────────────────────────────────────────────
const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'];
const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter((url) => url && url !== '*')
  : [];
const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      
      // Check explicit allowed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Allow any localhost / 127.0.0.1 port and *.vercel.app preview URLs
      const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      const isVercel = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);
      
      if (isLocalhost || isVercel) {
        return callback(null, true);
      }
      
      return callback(null, false);
    },
    credentials: true
  })
);

// ── 4. Request Parsers & CSRF Protection ─────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(csrfProtection(allowedOrigins));

// ── 5. Rate Limiting for Authentication ───────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5,                   // 5 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/registration attempts from this IP. Please try again after 30 minutes.'
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/rooms',        roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers',    customerRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/reports',      reportRoutes);
app.use('/api/invoices',     invoiceRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'ELYSIA Hotel Management API',
    message: 'Backend server is active and running successfully.',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      reservations: '/api/reservations',
      auth: '/api/auth'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ status: 'online', service: 'ELYSIA API Gateway' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Grand Luxe Hotel Management API' });
});

// ── Ensure DB Schema & Seed on Vercel Serverless ──────────────────────────────
let dbInitPromise = null;
export async function ensureDbReady() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        await runSchema();
        await runSeed();
      } catch (err) {
        console.error('ensureDbReady error:', err.message);
        dbInitPromise = null; // reset to allow retry
      }
    })();
  }
  return dbInitPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureDbReady();
  } catch (e) {
    // proceed to request
  }
  next();
});

app.get('/api/init', async (req, res) => {
  try {
    await runSchema();
    await runSeed();
    const userCount = await query('SELECT COUNT(*) FROM users');
    const roomCount = await query('SELECT COUNT(*) FROM rooms');
    res.json({
      success: true,
      message: 'Database schema and seed verified successfully.',
      usersCount: parseInt(userCount.rows[0].count, 10),
      roomsCount: parseInt(roomCount.rows[0].count, 10)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ── PostgreSQL schema auto-migration ──────────────────────────────────────────
async function runSchema() {
  const schemaPath = path.join(__dirname, 'db', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.warn('⚠️  schema.sql not found — skipping auto-migration.');
    return;
  }
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    await query(sql);
    console.log('✅ PostgreSQL schema applied (CREATE TABLE IF NOT EXISTS).');
  } catch (err) {
    console.error('❌ Schema migration failed:', err.message);
    throw err;
  }
}

// ── Seed default data (idempotent) ────────────────────────────────────────────
async function runSeed() {
  const bcrypt = (await import('bcryptjs')).default;

  // Seed users
  const userCount = await query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding default staff users...');
    const adminPass = process.env.SEED_ADMIN_PASSWORD;
    const managerPass = process.env.SEED_MANAGER_PASSWORD;
    const receptionPass = process.env.SEED_RECEPTIONIST_PASSWORD;

    if (adminPass && managerPass && receptionPass) {
      const salt = bcrypt.genSaltSync(10);
      const users = [
        ['usr-1', 'Alexander Wright', 'a.wright@grandluxe.com', bcrypt.hashSync(adminPass, salt),      'admin',        '+1 (555) 019-2831', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'],
        ['usr-2', 'Elena Rostova',    'e.rostova@grandluxe.com', bcrypt.hashSync(managerPass, salt),    'manager',      '+1 (555) 012-9844', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'],
        ['usr-3', 'Marcus Sterling',  'm.sterling@grandluxe.com', bcrypt.hashSync(receptionPass, salt), 'receptionist', '+1 (555) 014-3321', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80']
      ];
      for (const [id, name, email, hash, role, phone, avatar] of users) {
        await query(
          `INSERT INTO users (id, name, email, password_hash, role, phone, status, avatar)
           VALUES ($1,$2,$3,$4,$5,$6,'active',$7) ON CONFLICT (id) DO NOTHING`,
          [id, name, email, hash, role, phone, avatar]
        );
      }
      console.log('  ✅ 3 staff users seeded.');
    } else {
      console.log('  ℹ️ Staff user seeding skipped: SEED_ADMIN_PASSWORD, SEED_MANAGER_PASSWORD, or SEED_RECEPTIONIST_PASSWORD not set in environment.');
    }
  }

  // Seed rooms
  const roomCount = await query('SELECT COUNT(*) FROM rooms');
  if (parseInt(roomCount.rows[0].count, 10) === 0) {
    console.log('🌱 Seeding hotel room inventory...');
    const rooms = [
      ['ocean-bedroom',    '101', 1, 'Deluxe',            'Ocean View Deluxe Bedroom',    'California King Bed',              240, 2, ['High-Speed Wi-Fi','Smart TV','Marble Bath','Coffee Maker','Mini Bar','Air Conditioning'], 'Floor-to-ceiling glass paneling framing ocean views.',    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
      ['sanctuary-bedroom','102', 1, 'Standard',           'Sanctuary Garden Bedroom',     'Super King Bed with Silk Linens',  195, 2, ['Private Garden Terrace','Deep Soaking Tub','Artisanal Coffee Lab','Wi-Fi'],              'A private peaceful bedroom overlooking courtyard gardens.','https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'],
      ['ritual-bedroom',   '201', 2, 'Deluxe',            'Wellness Ritual Bedroom',      'Emperor Plush Custom Mattress',    210, 2, ['Black Marble Soaking Tub','Aromatherapy Shower','Acoustic Soundproofing','Wi-Fi'],      'Designed around personal care and relaxation.',           'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80'],
      ['skyward-bedroom',  '202', 2, 'Executive',          'Executive Skyward Bedroom',    'Master King Bed',                  320, 2, ['Executive Workstation','High-Speed Wi-Fi','Smart TV','Rain Shower','Espresso Bar'],       'High-floor executive bedroom with city skyline view.',    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
      ['imperial-bedroom', '301', 3, 'Presidential Suite', 'Imperial Master Bedroom',     'Grand Emperor King Bed',           450, 4, ['Private Jacuzzi','Walk-In Closet','24/7 Room Service','Smart TV','Wi-Fi'],               'Grand master bedroom with private balcony and jacuzzi.',  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
      ['horizon-bedroom',  '302', 3, 'Deluxe',            'Horizon Oceanfront Bedroom',   'Dual King Beds',                   280, 4, ['Beach Access','Outdoor Rain Shower','Private Sun Deck','Wi-Fi'],                        'Direct beach views with private sun terrace.',            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
      ['celestial-bedroom','401', 4, 'Executive',          'Celestial Sky Bedroom',        'Custom Stargazer King Bed',         210, 2, ['Skylight Glass Window','Ambient Lighting','Smart TV','Wi-Fi'],                          'Bedroom with skylight starry ceiling.',                   'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'],
      ['aurelia-bedroom',  '501', 5, 'Standard',           'Aurelia Royal Bedroom',        'California King Bed',              180, 2, ['Marble Bath','Private Balcony','Nespresso Coffee','Wi-Fi'],                             'Italian design with marble bath.',                        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'],
      ['terrace-bedroom',  '502', 5, 'Standard',           'Rooftop Terrace Bedroom',      'Queen Bed',                        165, 2, ['Rooftop Terrace Access','City View','Wi-Fi','Smart TV'],                                 'Access to private rooftop lounge.',                       'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'],
      ['penthouse-bedroom','601', 6, 'Presidential Suite', 'Grand Penthouse Suite',        'California Super King Bed',        650, 4, ['Private Pool','Panoramic View','Butler Service','24/7 Room Service','Smart TV','Wi-Fi'], 'The ultimate luxury experience atop the hotel.',          'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?auto=format&fit=crop&w=1200&q=80']
    ];

    for (const [id, num, floor, type, name, bed, price, cap, amenities, notes, image] of rooms) {
      await query(
        `INSERT INTO rooms (id, room_number, floor, type, name, bed_type, price, capacity, amenities, status, notes, image)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'available',$10,$11) ON CONFLICT (id) DO NOTHING`,
        [id, num, floor, type, name, bed, price, cap, JSON.stringify(amenities), notes, image]
      );
    }
    console.log('  ✅ 10 rooms seeded.');
  }

  // Seed initial activity log
  const logCount = await query("SELECT COUNT(*) FROM activity_logs WHERE id = 'log-init'");
  if (parseInt(logCount.rows[0].count, 10) === 0) {
    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ('log-init','System','Admin','System Initialized','Database','Hotel Management System PostgreSQL database ready.')`,
    );
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function bootstrap() {
  console.log('==================================================');
  console.log(' Grand Luxe Hotel Management API — Starting...');
  console.log('==================================================');

  const connected = await testConnection();
  if (!connected) {
    console.error('\n❌ Cannot start server — PostgreSQL is not reachable.');
    console.error('   1. Check database host and credentials in environment variables.');
    if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    return;
  }

  await runSchema();
  await runSeed();

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n==================================================');
      console.log(` ✅ Server running on port ${PORT}`);
      console.log(` 🗄️  Database: PostgreSQL (${process.env.DB_NAME || 'hotel_db'})`);
      console.log(` 🌐 Health Check: http://localhost:${PORT}/api/health`);
      console.log('==================================================\n');
    });
  }
}

// In local mode, run bootstrap immediately. In Vercel, run schema setup lazily or on first load.
bootstrap().catch((err) => {
  console.error('Bootstrap error:', err.message);
});

export default app;
