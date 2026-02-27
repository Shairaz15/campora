-- Seed script for Campora Demo
-- Run this in Supabase SQL Editor

-- Drop the foreign key linking public.users to auth.users (we use hardcoded auth)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Clear old users with these emails (from previous signups)
DELETE FROM users WHERE email IN ('shairaz102938@gmail.com', 'suhaim10293847@gmail.com', 'sashank10293847@gmail.com');

-- Insert demo users with fixed UUIDs
INSERT INTO users (id, name, email, phone, semester, department, section, graduation_year, role, is_verified)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Shairaz (Admin)', 'shairaz102938@gmail.com', '8618136168', '4', 'CSE', 'H', 2028, 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'Suhaim', 'suhaim10293847@gmail.com', '9876543210', '4', 'CSE', 'H', 2028, 'student', true),
  ('00000000-0000-0000-0000-000000000003', 'Sashank', 'sashank10293847@gmail.com', '9876543211', '4', 'ECE', 'A', 2028, 'student', true)
ON CONFLICT (id) DO NOTHING;

-- Clear existing products
DELETE FROM products;

-- Insert demo products (Student 1 - Suhaim)
INSERT INTO products (seller_id, title, description, price, transaction_type, location_type, category, status)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Space Grey Modern Laptop', 'Slightly used modern laptop in great condition. Perfect for CS students. 16GB RAM, 512GB SSD.', 45000, 'both', 'in-campus', 'Electronics', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Noise Cancelling Headphones', 'Block out dorm noise! Excellent battery life, Bluetooth 5.0. Used for 3 months.', 3500, 'both', 'in-campus', 'Electronics', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Python Scripting & Assignments', 'I can help you debug or write Python scripts for your projects. Available evenings.', 500, 'cash', 'in-campus', 'Tutoring', 'active');

-- Insert demo products (Student 2 - Sashank)
INSERT INTO products (seller_id, title, description, price, transaction_type, location_type, category, status)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Data Structures & Algorithms Textbook', 'Essential for Sem 4. Barely read, all pages intact. Cormen CLRS edition.', 800, 'cash', 'in-campus', 'Books', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'Commuter Bicycle', 'Neon green and black. Great for getting between campus buildings quickly. Includes lock.', 4000, 'cash', 'in-campus', 'Vehicles', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'Dorm Room Cleaning Service', 'Will clean your dorm room spotless. Open to swap for meals! Available weekends.', 300, 'both', 'in-campus', 'Cleaning', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'Circuit Design Lab Kit', 'Full ECE lab kit with breadboard, components, multimeter. Selling at semester end.', 1200, 'swap', 'in-campus', 'Lab Equipment', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Graphic Design for Projects', 'Canva/Figma expert. Can make posters, presentations, and project reports look professional.', 400, 'cash', 'in-campus', 'Creative', 'active');
