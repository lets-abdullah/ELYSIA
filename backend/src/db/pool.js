import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Fail-fast check for essential DB configuration if accessed directly
const requiredDbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDbVars = requiredDbVars.filter((v) => !process.env[v] || process.env[v].trim() === '');
if (missingDbVars.length > 0) {
  const errMsg = `❌ DB Pool Configuration Error: Missing required DB environment variables: ${missingDbVars.join(', ')}`;
  console.error(errMsg);
}

const isRemoteDb = process.env.DATABASE_URL
  ? true
  : process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST.toLowerCase());

const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'require' || isRemoteDb;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: process.env.VERCEL ? 5 : 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    }
  : {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: process.env.VERCEL ? 5 : 20, // max pool connections
      idleTimeoutMillis: 30000, // close idle clients after 30s
      connectionTimeoutMillis: 10000
    };

const pool = new Pool(poolConfig);


pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

/**
 * Execute a parameterized SQL query.
 * @param {string} text  — SQL statement
 * @param {Array}  params — query parameters
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

export async function testConnection() {
  try {
    const result = await query('SELECT NOW() AS now');
    console.log(`✅ PostgreSQL connected — server time: ${result.rows[0].now}`);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    console.error('   Make sure PostgreSQL is running and .env credentials are correct.');
    return false;
  }
}

export default pool;
