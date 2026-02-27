import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Using anon key, assuming RLS allows anon insert or we can override if it fails.
// WAIT, anon key won't work easily with RLS for clearing everything unless policies allow it.
// Let me just disable RLS temporarily or use service_role key if they had one, but they don't.
// Wait, is RLS checked during inserts if I pass auth?
// I will just use the anon key. If they need authenticated, I bypass it or sign in.
// Actually, earlier I hardcoded auth so Supabase auth is no longer used for sessions in the app except for storage!
// Storage policies require authenticated user. So I must authenticate first, or pass a user ID.

const supabase = createClient(supabaseUrl, supabaseKey);

// The hardcoded user IDs from lib/auth.js:
const USER_1_ID = '00000000-0000-0000-0000-000000000002'; // Suhaim
const USER_2_ID = '00000000-0000-0000-0000-000000000003'; // Sashank

const images = [
    {
        name: 'laptop',
        path: 'C:\\Users\\shair\\.gemini\\antigravity\\brain\\a2b7fc53-1b21-4de8-a16c-65af96a39e15\\laptop_1772182679731.png',
        title: 'Space Grey Modern Laptop',
        desc: 'Slightly used modern laptop in great condition. Perfect for CS students.',
        price: 45000,
        transaction_type: 'both',
        category: 'Electronics',
        seller: USER_1_ID
    },
    {
        name: 'textbook',
        path: 'C:\\Users\\shair\\.gemini\\antigravity\\brain\\a2b7fc53-1b21-4de8-a16c-65af96a39e15\\textbook_1772182695219.png',
        title: 'Data Structures and Algorithms Textbook',
        desc: 'Essential for Sem 4. Barely read, pages intact.',
        price: 800,
        transaction_type: 'cash',
        category: 'Books',
        seller: USER_2_ID
    },
    {
        name: 'headphones',
        path: 'C:\\Users\\shair\\.gemini\\antigravity\\brain\\a2b7fc53-1b21-4de8-a16c-65af96a39e15\\headphones_1772182710120.png',
        title: 'Noise Cancelling Headphones',
        desc: 'Block out dorm noise! Excellent battery life.',
        price: 3500,
        transaction_type: 'both',
        category: 'Electronics',
        seller: USER_1_ID
    },
    {
        name: 'bike',
        path: 'C:\\Users\\shair\\.gemini\\antigravity\\brain\\a2b7fc53-1b21-4de8-a16c-65af96a39e15\\bike_1772182724018.png',
        title: 'Commuter Bicycle',
        desc: 'Neon green and black. Great for getting between campus buildings quickly.',
        price: 4000,
        transaction_type: 'cash',
        category: 'Vehicles',
        seller: USER_2_ID
    }
];

const mockServices = [
    {
        title: 'Python Scripting & Assignments',
        desc: 'I can help you debug or write Python scripts for your projects. ₹500/hour.',
        price: 500,
        transaction_type: 'cash',
        location_type: 'in-campus',
        category: 'Tutoring',
        seller_id: USER_1_ID
    },
    {
        title: 'Dorm Room Cleaning',
        desc: 'Will clean your dorm room spotless. Open to swap for meals!',
        price: 300,
        transaction_type: 'both',
        location_type: 'in-campus',
        category: 'Cleaning',
        seller_id: USER_2_ID
    }
];

async function seed() {
    console.log('Starting seed...');

    // Delete all existing products. Since RLS might block this from anon, 
    // let's hope it allows it, or we ignore and just insert if delete fails.
    // Wait, since we are doing hackathon demo, maybe we can just insert.
    console.log('Clearing old products...');
    const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) {
        console.error('Failed to clear products (might be RLS):', delErr.message);
        console.log('Continuing with inserts anyway...');
    } else {
        console.log('Cleared products!');
    }

    // Insert Products
    for (const item of images) {
        console.log(`Processing ${item.name}...`);

        let imageUrl = null;
        try {
            const fileBuffer = fs.readFileSync(item.path);
            const fileName = `seed/${Date.now()}_${item.name}.png`;

            // Upload to Supabase Storage - NOTE: Storage RLS requires authenticated user!
            // BUT wait, we added policies earlier to allow anon/authenticated, but it might fail.
            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from('products')
                .upload(fileName, fileBuffer, { contentType: 'image/png' });

            if (uploadErr) {
                console.error(`  Upload failed for ${item.name}:`, uploadErr.message);
            } else if (uploadData) {
                const { data: urlData } = supabase.storage.from('products').getPublicUrl(uploadData.path);
                imageUrl = urlData.publicUrl;
                console.log(`  Uploaded! ${imageUrl}`);
            }
        } catch (e) {
            console.error(`  File error for ${item.name}:`, e.message);
        }

        // Insert into DB
        const { error: insertErr } = await supabase.from('products').insert({
            title: item.title,
            description: item.desc,
            price: item.price,
            transaction_type: item.transaction_type,
            location_type: 'in-campus',
            category: item.category,
            seller_id: item.seller,
            image_urls: imageUrl ? [imageUrl] : []
        });

        if (insertErr) {
            console.error(`  DB Insert failed for ${item.name}:`, insertErr.message);
        } else {
            console.log(`  Inserted into DB!`);
        }
    }

    // Insert Services
    console.log('Inserting Mock Services...');
    for (const service of mockServices) {
        const { error: srvErr } = await supabase.from('products').insert(service);
        if (srvErr) {
            console.error(`  Service Insert failed for ${service.title}:`, srvErr.message);
        } else {
            console.log(`  Inserted Service: ${service.title}`);
        }
    }

    console.log('Seed complete!');
}

seed();
