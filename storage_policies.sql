-- Storage Policies for Campora
-- Run this in Supabase SQL Editor AFTER creating the storage buckets

-- Allow authenticated users to upload to products bucket
CREATE POLICY "Allow authenticated uploads to products" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products');

-- Allow public read access to products bucket
CREATE POLICY "Allow public read access to products" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'products');

-- Allow users to delete their own uploads from products
CREATE POLICY "Allow users to delete own product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to upload avatars
CREATE POLICY "Allow authenticated uploads to avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Allow public read access to avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload ID cards
CREATE POLICY "Allow authenticated uploads to id-cards" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'id-cards');

-- Allow admin to read ID cards (admin checks via app logic)
CREATE POLICY "Allow authenticated read id-cards" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'id-cards');
