import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';

const ALLOWED_ROLES = ['admin', 'manager', 'receptionist', 'customer'];

export async function getAllUsers(req, res) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, status, avatar, last_active, created_at
       FROM users
       WHERE LOWER(role) IN ('admin', 'manager', 'receptionist')
       ORDER BY created_at ASC`
    );

    const staffUsers = result.rows.map((u) => {
      const rawRole = (u.role || '').toLowerCase();
      let formattedRole = 'Receptionist';
      if (rawRole === 'admin') formattedRole = 'Admin';
      else if (rawRole === 'manager') formattedRole = 'Manager';

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: formattedRole,
        phone: u.phone || '',
        status: u.status === 'active' ? 'Active' : 'Inactive',
        avatar: u.avatar,
        lastActive: u.last_active,
        createdAt: u.created_at,
        username: u.email.split('@')[0]
      };
    });

    return res.json({ success: true, users: staffUsers, staff: staffUsers });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, phone, avatar, status } = req.body;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof role !== 'string'
    ) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role must be valid strings.' });
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
      return res.status(400).json({ success: false, message: 'Avatar must be a valid string.' });
    }
    if (status !== undefined && status !== null && typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Status must be a valid string.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = role.trim().toLowerCase();
    const cleanStatus = status ? status.trim().toLowerCase() : 'active';
    const cleanPhone = phone ? phone.trim() : '';

    if (!cleanName || !cleanEmail || !password.trim() || !cleanRole) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required.' });
    }

    const trimmedPassword = password.trim();
    const hasMinLength = trimmedPassword.length >= 12;
    const hasUpperCase = /[A-Z]/.test(trimmedPassword);
    const hasLowerCase = /[a-z]/.test(trimmedPassword);
    const hasNumber = /[0-9]/.test(trimmedPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(trimmedPassword);

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 12 characters long and contain at least 1 uppercase letter (A–Z), 1 lowercase letter (a–z), 1 number (0–9), and 1 symbol/special character.'
      });
    }

    if (!ALLOWED_ROLES.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Allowed roles: ${ALLOWED_ROLES.join(', ')}.`
      });
    }

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(trimmedPassword, salt);
    const id = `usr-${Date.now()}`;

    await query(
      `INSERT INTO users (id, name, email, password_hash, role, phone, status, avatar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        cleanName,
        cleanEmail,
        hashedPassword,
        cleanRole,
        cleanPhone,
        cleanStatus,
        avatar && avatar.trim() ? avatar.trim() : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      ]
    );

    // Log activity
    const adminName = req.user ? req.user.name : 'Admin';
    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, adminName, 'Admin', 'Create User', 'Staff', `Created new user ${cleanName} with role '${cleanRole}'.`]
    );

    return res.status(201).json({ success: true, message: 'User created successfully.', user: { id, name: cleanName, email: cleanEmail, role: cleanRole } });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, phone, avatar, status } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Name must be a valid string.' });
    }
    if (email !== undefined && typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email must be a valid string.' });
    }
    if (password !== undefined && typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password must be a valid string.' });
    }
    if (role !== undefined && typeof role !== 'string') {
      return res.status(400).json({ success: false, message: 'Role must be a valid string.' });
    }
    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({ success: false, message: 'Phone must be a valid string.' });
    }
    if (avatar !== undefined && avatar !== null && typeof avatar !== 'string') {
      return res.status(400).json({ success: false, message: 'Avatar must be a valid string.' });
    }
    if (status !== undefined && status !== null && typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Status must be a valid string.' });
    }

    if (role && !ALLOWED_ROLES.includes(role.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role '${role}'. Allowed roles: ${ALLOWED_ROLES.join(', ')}.`
      });
    }

    const existing = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const u = existing.rows[0];
    let hashedPassword = u.password_hash;
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
      hashedPassword = bcrypt.hashSync(trimmedPass, salt);
    }

    await query(
      `UPDATE users SET
        name          = $2,
        email         = $3,
        password_hash = $4,
        role          = $5,
        phone         = $6,
        avatar        = $7,
        status        = $8
       WHERE id = $1`,
      [
        id,
        name !== undefined ? name.trim() : u.name,
        email !== undefined ? email.trim().toLowerCase() : u.email,
        hashedPassword,
        role !== undefined ? role.trim().toLowerCase() : u.role,
        phone !== undefined && phone !== null ? phone.trim() : u.phone,
        avatar !== undefined && avatar !== null ? avatar.trim() : u.avatar,
        status !== undefined && status !== null ? status.trim().toLowerCase() : u.status
      ]
    );

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const existing = await query('SELECT id FROM users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}

