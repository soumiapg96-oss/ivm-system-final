const db = require('../config/database');
const { snakeToCamel } = require('../utils/fieldConverter');

class Category {
  static async create(categoryData) {
    const { name, description } = categoryData;
    
    const query = `
      INSERT INTO categories (name, description, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING id, name, description, created_at, updated_at
    `;
    
    const values = [name, description];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
  }

  static async findByName(name) {
    const query = 'SELECT * FROM categories WHERE name = $1';
    const result = await db.query(query, [name]);
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 10, search = null) {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let countWhereClause = '';
    let values = [limit, offset];
    let countValues = [];
    
    if (search) {
      whereClause = 'WHERE c.name ILIKE $3';
      countWhereClause = 'WHERE name ILIKE $1';
      values.push(`%${search}%`);
      countValues.push(`%${search}%`);
    }
    
    const query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countQuery = `SELECT COUNT(*) FROM categories ${countWhereClause}`;
    
    const [result, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, countValues)
    ]);
    
    return {
      categories: snakeToCamel(result.rows),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  static async update(id, updateData) {
    const { name, description } = updateData;
    
    const query = `
      UPDATE categories 
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, description, created_at, updated_at
    `;
    
    const values = [id, name, description];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  static async delete(id) {
    // Check if category has products
    const checkQuery = 'SELECT COUNT(*) FROM products WHERE category_id = $1';
    const checkResult = await db.query(checkQuery, [id]);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('Cannot delete category with existing products');
    }
    
    const query = 'DELETE FROM categories WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getAllWithProductCount() {
    const query = `
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `;
    const result = await db.query(query);
    return snakeToCamel(result.rows);
  }
}

module.exports = Category;
