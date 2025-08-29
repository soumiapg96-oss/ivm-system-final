-- Add name and phone fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Update existing users to have default names
UPDATE users 
SET first_name = 'Admin', last_name = 'User' 
WHERE first_name IS NULL AND role = 'admin';

UPDATE users 
SET first_name = 'User', last_name = 'Account' 
WHERE first_name IS NULL AND role = 'user';

-- Make first_name and last_name required for new users
ALTER TABLE users 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;
