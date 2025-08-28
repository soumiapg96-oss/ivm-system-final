const db = require('../config/database');
const { snakeToCamel } = require('../utils/fieldConverter');

class Product {
  static async create(productData) {
    const { name, sku, categoryId, quantity, price, lowStockThreshold, description, active = true } = productData;
    
    const query = `
      INSERT INTO products (name, sku, category_id, quantity, price, low_stock_threshold, description, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING id, name, sku, category_id, quantity, price, low_stock_threshold, description, active, created_at, updated_at
    `;
    
    const values = [name, sku, categoryId, quantity, price, lowStockThreshold, description, active];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Category does not exist');
      }
      if (error.code === '23505') { // Unique violation
        throw new Error('SKU already exists');
      }
      throw error;
    }
  }

  static async findById(id, includeDeleted = false) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    
    if (!includeDeleted) {
      query += ' AND p.deleted_at IS NULL';
    }
    
    const result = await db.query(query, [id]);
    return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    const {
      categoryId,
      search,
      active,
      minPrice,
      maxPrice,
      inStock,
      lowStock
    } = filters;

    let whereConditions = ['p.deleted_at IS NULL'];
    let values = [];
    let valueIndex = 1;

    if (categoryId) {
      whereConditions.push(`p.category_id = $${valueIndex}`);
      values.push(categoryId);
      valueIndex++;
    }

    if (search) {
      whereConditions.push(`(p.name ILIKE $${valueIndex} OR p.description ILIKE $${valueIndex})`);
      values.push(`%${search}%`);
      valueIndex++;
    }

    if (active !== undefined) {
      whereConditions.push(`p.active = $${valueIndex}`);
      values.push(active);
      valueIndex++;
    }

    if (minPrice !== undefined) {
      whereConditions.push(`p.price >= $${valueIndex}`);
      values.push(minPrice);
      valueIndex++;
    }

    if (maxPrice !== undefined) {
      whereConditions.push(`p.price <= $${valueIndex}`);
      values.push(maxPrice);
      valueIndex++;
    }

    if (inStock !== undefined) {
      if (inStock) {
        whereConditions.push(`p.quantity > 0`);
      } else {
        whereConditions.push(`p.quantity = 0`);
      }
    }

    if (lowStock !== undefined) {
      if (lowStock) {
        whereConditions.push(`p.quantity <= p.low_stock_threshold`);
      } else {
        whereConditions.push(`p.quantity > p.low_stock_threshold`);
      }
    }

    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(' AND ');
    
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*)
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `;
    
    const [result, countResult] = await Promise.all([
      db.query(query, [...values, limit, offset]),
      db.query(countQuery, values)
    ]);
    
    return {
      products: snakeToCamel(result.rows),
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  static async update(id, updateData) {
    const { name, sku, categoryId, price, lowStockThreshold, description, active } = updateData;
    
    const query = `
      UPDATE products 
      SET name = COALESCE($2, name),
          sku = COALESCE($3, sku),
          category_id = COALESCE($4, category_id),
          price = COALESCE($5, price),
          low_stock_threshold = COALESCE($6, low_stock_threshold),
          description = COALESCE($7, description),
          active = COALESCE($8, active),
          updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, name, sku, category_id, quantity, price, low_stock_threshold, description, active, created_at, updated_at
    `;
    
    const values = [id, name, sku, categoryId, price, lowStockThreshold, description, active];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0] ? snakeToCamel(result.rows[0]) : null;
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Category does not exist');
      }
      if (error.code === '23505') { // Unique violation
        throw new Error('SKU already exists');
      }
      throw error;
    }
  }

  static async softDelete(id) {
    const query = `
      UPDATE products 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async hardDelete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateQuantity(id, quantityChange, reasonCode, reasonDescription, userId) {
    // Start a transaction
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get current product
      const productQuery = 'SELECT quantity FROM products WHERE id = $1 AND deleted_at IS NULL';
      const productResult = await client.query(productQuery, [id]);
      
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      const currentQuantity = productResult.rows[0].quantity;
      const newQuantity = currentQuantity + quantityChange;
      
      if (newQuantity < 0) {
        throw new Error('Insufficient stock');
      }
      
      // Update product quantity
      const updateQuery = `
        UPDATE products 
        SET quantity = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, quantity
      `;
      await client.query(updateQuery, [id, newQuantity]);
      
      // Create transaction record
      const transactionQuery = `
        INSERT INTO product_transactions (product_id, quantity_change, reason_code, reason_description, previous_quantity, new_quantity, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      await client.query(transactionQuery, [
        id, quantityChange, reasonCode, reasonDescription, currentQuantity, newQuantity, userId
      ]);
      
      // Create audit trail record
      const auditQuery = `
        INSERT INTO quantity_history (product_id, user_id, change, reason, previous_quantity, new_quantity)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      await client.query(auditQuery, [
        id, userId, quantityChange, reasonCode, currentQuantity, newQuantity
      ]);
      
      await client.query('COMMIT');
      
      return { id, quantity: newQuantity };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getLowStock(threshold = null) {
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL AND p.quantity <= p.low_stock_threshold
    `;
    
    if (threshold !== null) {
      query += ` AND p.quantity <= $1`;
    }
    
    query += ' ORDER BY p.quantity ASC';
    
    const result = await db.query(query, threshold !== null ? [threshold] : []);
    return result.rows;
  }

  static async getOutOfStock() {
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL AND p.quantity = 0
      ORDER BY p.updated_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async getTransactions(productId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT pt.*, u.email as created_by_email
      FROM product_transactions pt
      LEFT JOIN users u ON pt.created_by = u.id
      WHERE pt.product_id = $1
      ORDER BY pt.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM product_transactions WHERE product_id = $1';
    
    const [result, countResult] = await Promise.all([
      db.query(query, [productId, limit, offset]),
      db.query(countQuery, [productId])
    ]);
    
    return {
      transactions: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }

  static async getInventorySummary() {
    const query = `
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN quantity <= low_stock_threshold AND quantity > 0 THEN 1 END) as low_stock,
        COUNT(CASE WHEN active = true THEN 1 END) as active_products,
        SUM(quantity * price) as total_value
      FROM products 
      WHERE deleted_at IS NULL
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }

  static async getStockLevelsReport() {
    const query = `
      SELECT 
        p.id,
        p.name,
        c.name as category_name,
        p.quantity,
        p.low_stock_threshold,
        p.price,
        (p.quantity * p.price) as total_value,
        CASE 
          WHEN p.quantity = 0 THEN 'Out of Stock'
          WHEN p.quantity <= p.low_stock_threshold THEN 'Low Stock'
          ELSE 'In Stock'
        END as stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.deleted_at IS NULL
      ORDER BY p.quantity ASC, p.name ASC
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  static async getInventoryValueByCategory() {
    const query = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        COUNT(p.id) as product_count,
        SUM(p.quantity) as total_quantity,
        SUM(p.quantity * p.price) as total_value,
        AVG(p.price) as average_price,
        COUNT(CASE WHEN p.quantity = 0 THEN 1 END) as out_of_stock_count,
        COUNT(CASE WHEN p.quantity <= p.low_stock_threshold AND p.quantity > 0 THEN 1 END) as low_stock_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.deleted_at IS NULL
      GROUP BY c.id, c.name
      ORDER BY total_value DESC NULLS LAST
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  static async getQuantityHistory(productId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        qh.*,
        u.email as user_email,
        p.name as product_name
      FROM quantity_history qh
      LEFT JOIN users u ON qh.user_id = u.id
      LEFT JOIN products p ON qh.product_id = p.id
      WHERE qh.product_id = $1
      ORDER BY qh.timestamp DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM quantity_history WHERE product_id = $1';
    
    const [result, countResult] = await Promise.all([
      db.query(query, [productId, limit, offset]),
      db.query(countQuery, [productId])
    ]);
    
    return {
      history: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    };
  }
}

module.exports = Product;
