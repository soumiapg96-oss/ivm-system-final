const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { first_name, last_name, email, phone, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (id, first_name, last_name, email, phone, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, first_name, last_name, email, phone, role, created_at, updated_at
    `;
    
    const values = [uuidv4(), first_name, last_name, email, phone, passwordHash, role];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, first_name, last_name, email, phone, role, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT id, first_name, last_name, email, phone, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM users';
    
    const [result, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);
    
    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  static async update(id, updateData) {
    const { first_name, last_name, email, phone, role } = updateData;
    
    const query = `
      UPDATE users 
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          role = COALESCE($6, role),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, first_name, last_name, email, phone, role, created_at, updated_at
    `;
    
    const values = [id, first_name, last_name, email, phone, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async changePassword(userId, currentPassword, newPassword) {
    // First, get the user to verify current password
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }

    // Get the password hash from the database
    const passwordQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const passwordResult = await db.query(passwordQuery, [userId]);
    const passwordHash = passwordResult.rows[0]?.password_hash;

    if (!passwordHash) {
      return false;
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, passwordHash);
    if (!isValidPassword) {
      return false;
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2';
    await db.query(query, [newPasswordHash, userId]);

    return true;
  }

  static async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  // Refresh token methods
  static async saveRefreshToken(userId, token, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (token) DO UPDATE SET
        expires_at = EXCLUDED.expires_at
    `;
    
    await db.query(query, [userId, token, expiresAt]);
  }

  static async findRefreshToken(token) {
    const query = `
      SELECT rt.*, u.id as user_id, u.email, u.role
      FROM refresh_tokens rt
      JOIN users u ON rt.user_id = u.id
      WHERE rt.token = $1 AND rt.expires_at > NOW()
    `;
    
    const result = await db.query(query, [token]);
    return result.rows[0];
  }

  static async deleteRefreshToken(token) {
    const query = 'DELETE FROM refresh_tokens WHERE token = $1';
    await db.query(query, [token]);
  }

  static async deleteAllRefreshTokens(userId) {
    const query = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    await db.query(query, [userId]);
  }

  static async cleanupExpiredTokens() {
    const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
    await db.query(query);
  }
}

module.exports = User;
