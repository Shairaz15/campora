-- ============================================
-- CAMPORA - Campus Marketplace Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. USERS
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  semester TEXT,
  department TEXT,
  section TEXT,
  graduation_year INTEGER,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  id_card_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  transaction_type TEXT DEFAULT 'cash' CHECK (transaction_type IN ('cash','swap','both')),
  location_type TEXT DEFAULT 'in-campus' CHECK (location_type IN ('in-campus','escrow')),
  category TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','pending')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SWAPS
CREATE TABLE swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  proposer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proposed_product_id UUID REFERENCES products(id),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHATS
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, buyer_id, seller_id)
);

-- 6. MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ESCROW TRANSACTIONS
CREATE TABLE escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id),
  transaction_type TEXT CHECK (transaction_type IN ('cash','swap')),
  status TEXT DEFAULT 'held' CHECK (status IN ('held','admin_approved','completed','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNITY POSTS
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMMUNITY COMMENTS
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE swaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- PRODUCTS policies
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Sellers can create products" ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON products FOR DELETE USING (auth.uid() = seller_id);

-- OFFERS policies
CREATE POLICY "Offer participants can view" ON offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id));
CREATE POLICY "Buyers can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Offer participants can update" ON offers FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id));

-- SWAPS policies
CREATE POLICY "Swap participants can view" ON swaps FOR SELECT
  USING (auth.uid() = proposer_id OR auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id));
CREATE POLICY "Users can create swaps" ON swaps FOR INSERT WITH CHECK (auth.uid() = proposer_id);
CREATE POLICY "Swap participants can update" ON swaps FOR UPDATE
  USING (auth.uid() = proposer_id OR auth.uid() IN (SELECT seller_id FROM products WHERE id = product_id));

-- CHATS policies
CREATE POLICY "Chat participants can view" ON chats FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- MESSAGES policies
CREATE POLICY "Chat participants can view messages" ON messages FOR SELECT
  USING (auth.uid() IN (SELECT buyer_id FROM chats WHERE id = chat_id) OR auth.uid() IN (SELECT seller_id FROM chats WHERE id = chat_id));
CREATE POLICY "Chat participants can send messages" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ESCROW policies
CREATE POLICY "Escrow participants can view" ON escrow_transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
CREATE POLICY "Buyers can create escrow" ON escrow_transactions FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admin or buyer can update escrow" ON escrow_transactions FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin') OR auth.uid() = buyer_id);

-- COMMUNITY policies
CREATE POLICY "Community posts viewable by all" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Community comments viewable by all" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS (create manually in Supabase)
-- Bucket: products (public)
-- Bucket: id-cards (private, admin only)
-- Bucket: avatars (public)
-- ============================================
