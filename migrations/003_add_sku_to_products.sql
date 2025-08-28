-- Add SKU field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;

-- Create index for SKU field for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Update existing products with a default SKU if they don't have one
UPDATE products 
SET sku = CONCAT('SKU-', LPAD(id::text, 6, '0'))
WHERE sku IS NULL OR sku = '';
