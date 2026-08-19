import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { JWT_SECRET } from '../middleware/auth.js';

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24h
  });
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Email and password must be valid strings.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const result = await query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'User account is inactive.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last_active timestamp
    await query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    setAuthCookie(res, token);

    const { password_hash, ...userOut } = user;

    return res.json({
      success: true,
      token,
      user: { ...userOut, username: user.email.split('@')[0] },
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Name, email, and password must be valid strings.' });
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanName || !cleanEmail || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (cleanPhone && !/^\d{11}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must contain exactly 11 numeric digits (0–9).'
      });
    }

    const hasMinLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 12 characters long and contain at least 1 uppercase letter (A–Z), 1 lowercase letter (a–z), 1 number (0–9), and 1 symbol/special character.'
      });
    }

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const id = `usr-${Date.now()}`;

    // 1. Insert into users table
    await query(
      `INSERT INTO users (id, name, email, password_hash, role, phone, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        cleanName,
        cleanEmail,
        hashedPassword,
        'customer',
        cleanPhone,
        'active',
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`
      ]
    );

    // 2. Ensure customer record exists
    const custExisting = await query('SELECT id FROM customers WHERE LOWER(email) = $1', [cleanEmail]);
    if (custExisting.rows.length === 0) {
      await query(
        `INSERT INTO customers (id, name, email, phone)
         VALUES ($1, $2, $3, $4)`,
        [`gst-${Date.now()}`, cleanName, cleanEmail, cleanPhone]
      );
    }

    const token = jwt.sign(
      { id, name: cleanName, email: cleanEmail, role: 'customer' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    setAuthCookie(res, token);

    const userOut = {
      id,
      name: cleanName,
      email: cleanEmail,
      role: 'customer',
      phone: cleanPhone,
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      username: cleanEmail.split('@')[0]
    };

    return res.status(201).json({
      success: true,
      token,
      user: userOut,
      message: 'Account registered successfully.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

export async function me(req, res) {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password_hash, ...userOut } = result.rows[0];
    return res.json({ success: true, user: { ...userOut, username: userOut.email.split('@')[0] } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving user profile.' });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, password } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Name must be a valid string.' });
    }
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (password !== undefined && typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password must be a valid string.' });
    }

    const existing = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const currentUser = existing.rows[0];
    const newName = name !== undefined ? name.trim() : currentUser.name;
    const newPhone = phone !== undefined && phone !== null ? phone.trim() : currentUser.phone;
    let newHash = currentUser.password_hash;

    if (password && password.trim() !== '') {
      const trimmedPass = password.trim();
      const hasMinLength = trimmedPass.length >= 12;
      const hasUpperCase = /[A-Z]/.test(trimmedPass);
      const hasLowerCase = /[a-z]/.test(trimmedPass);
      const hasNumber = /[0-9]/.test(trimmedPass);
      const hasSpecialChar = /[^A-Za-z0-9]/.test(trimmedPass);

      if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 12 characters long and contain at least 1 uppercase letter (A–Z), 1 lowercase letter (a–z), 1 number (0–9), and 1 symbol/special character.'
        });
      }
      const salt = bcrypt.genSaltSync(10);
      newHash = bcrypt.hashSync(trimmedPass, salt);
    }

    await query(
      `UPDATE users SET name = $1, phone = $2, password_hash = $3 WHERE id = $4`,
      [newName, newPhone, newHash, userId]
    );

    // Also update customer table phone/name if customer exists
    await query(
      `UPDATE customers SET name = $1, phone = $2 WHERE LOWER(email) = LOWER($3)`,
      [newName, newPhone, currentUser.email]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: userId,
        name: newName,
        email: currentUser.email,
        phone: newPhone,
        role: currentUser.role,
        avatar: currentUser.avatar,
        username: currentUser.email.split('@')[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

