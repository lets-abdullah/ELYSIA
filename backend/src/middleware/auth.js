import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim() === '') {
  console.error('❌ FATAL: JWT_SECRET environment variable is missing or empty.');
}

export async function verifyToken(req, res, next) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET is not configured.' });
  }

  let token = null;

  // 1. Try extracting from httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization: Bearer <token>
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token_version is still valid in database
    if (decoded.id) {
      const userRes = await query('SELECT id, role, status, token_version FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User account no longer exists.' });
      }
      const dbUser = userRes.rows[0];
      if (dbUser.status !== 'active') {
        return res.status(403).json({ success: false, message: 'User account is inactive.' });
      }
      const currentVersion = dbUser.token_version || 1;
      const tokenVersion = decoded.tokenVersion || 1;
      if (tokenVersion < currentVersion) {
        return res.status(401).json({
          success: false,
          message: 'Your session has been invalidated due to a credential update. Please log in again with your new credentials.'
        });
      }
      req.user = { ...decoded, role: dbUser.role };
    } else {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }
    const roleLower = req.user.role ? req.user.role.toLowerCase() : '';
    const allowedLower = allowedRoles.map((r) => r.toLowerCase());

    if (!allowedLower.includes(roleLower)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission.`
      });
    }
    next();
  };
}

export { JWT_SECRET };

