import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { validatePassword } from '../utils/passwordPolicy.js';

const ALLOWED_ROLES = ['admin', 'manager', 'receptionist', 'customer'];

export async function getAllUsers(req, res) {
  try {
    const result = await query(
      `SELECT id, name, email, role, phone, status, avatar, token_version, password_changed_at, last_active, created_at
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
        tokenVersion: u.token_version,
        passwordChangedAt: u.password_changed_at,
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

    // Validate password policy
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
        missingRequirements: passwordValidation.missingRequirements
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
    const hashedPassword = bcrypt.hashSync(password.trim(), salt);
    const id = `usr-${Date.now()}`;

    await query(
      `INSERT INTO users (id, name, email, password_hash, role, phone, status, avatar, token_version, password_changed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        id,
        cleanName,
        cleanEmail,
        hashedPassword,
        cleanRole,
        cleanPhone,
        cleanStatus,
        avatar && avatar.trim() ? avatar.trim() : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        1
      ]
    );

    // Log activity
    const adminName = req.user ? req.user.name : 'Admin';
    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, adminName, req.user?.role || 'Admin', 'Create User', 'Staff', `Created new user ${cleanName} (${cleanEmail}) with role '${cleanRole}'.`]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: { id, name: cleanName, email: cleanEmail, role: cleanRole }
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user in database.' });
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
      return res.status(404).json({ success: false, message: 'User not found in system database.' });
    }

    const u = existing.rows[0];
    const targetEmail = email !== undefined ? email.trim().toLowerCase() : u.email;
    const emailChanged = targetEmail !== u.email.toLowerCase();

    // If email is changing, verify no collision with another user
    if (emailChanged) {
      const emailCollision = await query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
        [targetEmail, id]
      );
      if (emailCollision.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Another user account with this email address already exists.'
        });
      }
    }

    let hashedPassword = u.password_hash;
    let passwordChanged = false;

    if (password && password.trim() !== '' && password.trim() !== '__unchanged__') {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message,
          missingRequirements: passwordValidation.missingRequirements
        });
      }
      const salt = bcrypt.genSaltSync(10);
      hashedPassword = bcrypt.hashSync(password.trim(), salt);
      passwordChanged = true;
    }

    const shouldInvalidateSessions = passwordChanged || emailChanged;
    const cleanName = name !== undefined ? name.trim() : u.name;
    const cleanRole = role !== undefined ? role.trim().toLowerCase() : u.role;
    const cleanPhone = phone !== undefined && phone !== null ? phone.trim() : u.phone;
    const cleanAvatar = avatar !== undefined && avatar !== null ? avatar.trim() : u.avatar;
    const cleanStatus = status !== undefined && status !== null ? status.trim().toLowerCase() : u.status;

    if (shouldInvalidateSessions) {
      await query(
        `UPDATE users SET
          name                = $2,
          email               = $3,
          password_hash       = $4,
          role                = $5,
          phone               = $6,
          avatar              = $7,
          status              = $8,
          token_version       = COALESCE(token_version, 1) + 1,
          password_changed_at = NOW()
         WHERE id = $1`,
        [id, cleanName, targetEmail, hashedPassword, cleanRole, cleanPhone, cleanAvatar, cleanStatus]
      );
    } else {
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
        [id, cleanName, targetEmail, hashedPassword, cleanRole, cleanPhone, cleanAvatar, cleanStatus]
      );
    }

    // Log admin activity
    const adminName = req.user ? req.user.name : 'Admin';
    const detailMsg = passwordChanged && emailChanged
      ? `Updated email to '${targetEmail}' and reset password for user ${cleanName}. Old sessions invalidated.`
      : passwordChanged
      ? `Updated password for user ${cleanName}. Old sessions invalidated.`
      : emailChanged
      ? `Updated email to '${targetEmail}' for user ${cleanName}. Old sessions invalidated.`
      : `Updated profile details for user ${cleanName}.`;

    await query(
      `INSERT INTO activity_logs (id, user_name, user_role, action, module, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`log-${Date.now()}`, adminName, req.user?.role || 'Admin', 'Update User Credentials', 'Staff', detailMsg]
    );

    return res.json({
      success: true,
      message: shouldInvalidateSessions
        ? 'User login credentials updated successfully. Existing sessions have been invalidated.'
        : 'User updated successfully.',
      user: {
        id,
        name: cleanName,
        email: targetEmail,
        role: cleanRole,
        phone: cleanPhone,
        status: cleanStatus
      }
    });
  } catch (error) {
    console.error('updateUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user in database.' });
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

