-- Insert default admin user (password: Admin123!)
INSERT INTO users (id, email, password_hash, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@inventory.com', '$2a$10$BZJ33nJJiA8R1Um6erT03etma2QvvQO8/YATUW0VNgZp3gm32DDM.', 'admin');

-- Insert sample categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports', 'Sports equipment and accessories'),
('Automotive', 'Automotive parts and accessories'),
('Health & Beauty', 'Health and beauty products'),
('Toys & Games', 'Toys and entertainment items'),
('Office Supplies', 'Office and stationery items'),
('Food & Beverages', 'Food and beverage products');

-- Insert sample products with varied stock levels and values
INSERT INTO products (name, category_id, quantity, price, low_stock_threshold, description, active) VALUES 
-- Electronics (High value items)
('Laptop', 1, 15, 999.99, 5, 'High-performance laptop for work and gaming', true),
('Smartphone', 1, 25, 699.99, 8, 'Latest smartphone with advanced features', true),
('Wireless Headphones', 1, 5, 149.99, 3, 'Noise-cancelling wireless headphones', true),
('Tablet', 1, 8, 399.99, 4, '10-inch tablet with high-resolution display', true),
('Gaming Console', 1, 3, 499.99, 2, 'Next-gen gaming console', true),

-- Clothing (Medium value items)
('T-Shirt', 2, 100, 19.99, 20, 'Comfortable cotton t-shirt', true),
('Jeans', 2, 50, 49.99, 10, 'Classic blue jeans', true),
('Running Shoes', 2, 8, 79.99, 4, 'Comfortable running shoes', true),
('Winter Jacket', 2, 12, 89.99, 5, 'Warm winter jacket', true),
('Dress Shirt', 2, 30, 39.99, 8, 'Professional dress shirt', true),

-- Books (Low value items)
('Programming Book', 3, 30, 29.99, 5, 'Learn JavaScript programming', true),
('Fiction Novel', 3, 45, 14.99, 10, 'Bestselling fiction novel', true),
('Cookbook', 3, 20, 24.99, 5, 'Collection of recipes', true),
('History Book', 3, 15, 19.99, 5, 'World history textbook', true),
('Science Magazine', 3, 60, 4.99, 15, 'Monthly science magazine', true),

-- Home & Garden
('Garden Tool Set', 4, 10, 89.99, 3, 'Complete set of garden tools', true),
('Coffee Maker', 4, 12, 59.99, 4, 'Automatic coffee maker', true),
('Blender', 4, 8, 39.99, 3, 'High-speed blender', true),
('Plant Pot', 4, 25, 12.99, 8, 'Ceramic plant pot', true),
('LED Light Bulb', 4, 100, 8.99, 20, 'Energy-efficient LED bulb', true),

-- Sports
('Basketball', 5, 20, 24.99, 5, 'Official size basketball', true),
('Tennis Racket', 5, 15, 89.99, 5, 'Professional tennis racket', true),
('Yoga Mat', 5, 30, 19.99, 8, 'Non-slip yoga mat', true),
('Dumbbells Set', 5, 5, 149.99, 2, 'Adjustable dumbbells set', true),
('Soccer Ball', 5, 25, 34.99, 8, 'Professional soccer ball', true),

-- Automotive
('Motor Oil', 6, 40, 29.99, 10, 'Synthetic motor oil', true),
('Car Battery', 6, 8, 89.99, 3, '12V car battery', true),
('Tire Pressure Gauge', 6, 50, 9.99, 15, 'Digital tire pressure gauge', true),
('Windshield Wipers', 6, 35, 19.99, 10, 'Universal windshield wipers', true),
('Car Air Freshener', 6, 80, 4.99, 20, 'Long-lasting car air freshener', true),

-- Health & Beauty
('Shampoo', 7, 60, 12.99, 15, 'Natural hair care shampoo', true),
('Toothbrush', 7, 100, 3.99, 25, 'Electric toothbrush', true),
('Face Cream', 7, 25, 24.99, 8, 'Anti-aging face cream', true),
('Vitamins', 7, 45, 19.99, 12, 'Multivitamin supplements', true),
('Hand Sanitizer', 7, 120, 5.99, 30, 'Alcohol-based hand sanitizer', true),

-- Toys & Games
('Board Game', 8, 20, 29.99, 8, 'Family board game', true),
('Puzzle', 8, 15, 19.99, 5, '1000-piece jigsaw puzzle', true),
('Action Figure', 8, 40, 14.99, 12, 'Collectible action figure', true),
('Building Blocks', 8, 10, 49.99, 3, 'Educational building blocks', true),
('Video Game', 8, 30, 59.99, 8, 'Popular video game', true),

-- Office Supplies
('Printer Paper', 9, 200, 9.99, 50, 'A4 printer paper (500 sheets)', true),
('Pen Set', 9, 80, 12.99, 20, 'Professional pen set', true),
('Stapler', 9, 25, 8.99, 8, 'Office stapler', true),
('Notebook', 9, 100, 4.99, 25, 'Spiral-bound notebook', true),
('Desk Lamp', 9, 15, 34.99, 5, 'LED desk lamp', true),

-- Food & Beverages
('Coffee Beans', 10, 50, 15.99, 12, 'Premium coffee beans', true),
('Tea Bags', 10, 100, 8.99, 25, 'Assorted tea bags', true),
('Snack Bars', 10, 150, 2.99, 40, 'Healthy snack bars', true),
('Bottled Water', 10, 300, 1.99, 75, 'Spring water bottles', true),
('Energy Drink', 10, 80, 3.99, 20, 'High-energy drink', true);
