const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const { email, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, email, role, created_at, updated_at
    `;
    
    const values = [uuidv4(), email, passwordHash, role];
    
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
      SELECT id, email, role, created_at, updated_at 
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT id, email, role, created_at, updated_at
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
    const { email, role } = updateData;
    
    const query = `
      UPDATE users 
      SET email = COALESCE($2, email),
          role = COALESCE($3, role),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, role, created_at, updated_at
    `;
    
    const values = [id, email, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async changePassword(id, newPassword) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users 
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await db.query(query, [id, passwordHash]);
    return result.rows[0];
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
