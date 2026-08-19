import dotenv from 'dotenv';

dotenv.config();

const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

export function validateEnv() {
  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    missing.push('JWT_SECRET');
  }

  // Require either DATABASE_URL or individual DB_* variables
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    const requiredDbVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    for (const envVar of requiredDbVars) {
      if (!process.env[envVar] || process.env[envVar].trim() === '') {
        missing.push(envVar);
      }
    }
  }

  if (missing.length > 0) {
    const errorMsg = `\n❌ FATAL: Missing or empty required environment variable(s):\n   - ${missing.join('\n   - ')}\n\nPlease ensure all required variables are set in your environment or .env file (either DATABASE_URL or DB_HOST, DB_NAME, DB_USER, DB_PASSWORD) before starting the application.\n`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}


export const env = {
  JWT_SECRET: process.env.JWT_SECRET,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT, 10),
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
