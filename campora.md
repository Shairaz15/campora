# Campora — Development Context & Progress

> A verified campus economy platform: buy, sell, swap, escrow, community — built on Next.js + Supabase.

---

## Phase 1 ✅ — Architecture & Planning
**What was done:**
- Read and analyzed the full PRD for the campus marketplace MVP
- Designed **9-table SQL schema** with Row Level Security policies
- Planned **Next.js App Router** folder structure with route groups
- Designed auth flow: **Phone OTP** login with hardcoded admin phone number (`+911234567890`)
- Defined role-based access: middleware guards for `/admin/*` routes

**Key decisions:**
- Login is phone number + OTP only (no email/password login)  
- Admin is detected by hardcoded phone number for demo purposes
- `.edu` email is validated during signup profile step (not for login)
- Escrow is fully simulated — status transitions only, no real payments

---

## Phase 2 ✅ — Project Scaffolding
**What was done:**
- Scaffolded Next.js 15 with App Router + Tailwind CSS
- Installed `@supabase/supabase-js` and `@supabase/ssr`
- Created Supabase client infrastructure:
  - `lib/supabase/client.js` — browser client
  - `lib/supabase/server.js` — server component client
  - `lib/supabase/middleware.js` — auth middleware helper
- Created `middleware.js` — Next.js route protection
- Created `.env.local` with placeholder Supabase credentials
- Created `lib/utils.js` — constants (admin phone, categories, services) + helpers

---

## Phase 3 ✅ — Database Schema
**What was done:**
- Created `schema.sql` with all 9 tables:
  1. `users` — profiles with role, verification status
  2. `products` — listings with transaction_type, location_type
  3. `offers` — cash offers on products
  4. `swaps` — swap proposals between products
  5. `chats` — conversation threads per product
  6. `messages` — individual chat messages
  7. `escrow_transactions` — simulated escrow with status flow
  8. `community_posts` — community board posts with upvotes
  9. `community_comments` — comments on posts
- All RLS policies written and included in the SQL file

---

## Phase 4 ✅ — Authentication System
**What was done:**
- **Login page** (`app/login/page.js`): Phone number input → OTP verification → redirect to marketplace/admin
- **Signup page** (`app/signup/page.js`): 3-step flow (Phone → OTP → Profile with .edu email validation)
- Admin auto-detected by matching hardcoded phone number `+911234567890`
- Auth callback route (`app/auth/callback/route.js`) for email verification links
- Middleware gracefully skips when Supabase URL is not yet configured

---

## Phase 5 ✅ — Core Marketplace Features
**What was done:**
- **Landing page** (`app/page.js`): Hero section, feature cards, CTA buttons
- **Navbar** (`components/Navbar.js`): Responsive with mobile hamburger, active link highlights, admin link visibility
- **Marketplace** (`app/(main)/marketplace/page.js`): Search, category filter pills, services toggle panel, product grid
- **Product Card** (`components/ProductCard.js`): Image, transaction badge, price, location tag
- **Product Detail** (`app/(main)/product/[id]/page.js`): Image gallery, seller info, Make Offer / Propose Swap / Chat buttons
- **Sell Page** (`app/(main)/sell/page.js`): Create listing with title, description, category, transaction type, price, location

---

## Phase 6 ✅ — Transaction Systems
**What was done:**
- **Offer Modal** (`components/OfferModal.js`): Creates offer record + sends notification to chat
- **Swap Modal** (`components/SwapModal.js`): Select own product to swap + send message
- **Escrow trigger**: In chat, accepted offers show "Use Escrow" button → creates `escrow_transactions` with status `held`
- Full **escrow status flow**: held → admin_approved → completed/rejected

---

## Phase 7 ✅ — Chat System
**What was done:**
- **Chat List** (`app/(main)/chat/page.js`): All conversations with product thumbnails
- **Chat Room** (`app/(main)/chat/[id]/page.js`): Real-time messaging via Supabase Realtime
  - Offer accept/reject buttons for sellers
  - Swap accept/reject buttons for sellers
  - Escrow initiation button for buyers
  - Message bubbles with timestamps

---

## Phase 8 ✅ — Admin Dashboard
**What was done:**
- **Admin Dashboard** (`app/admin/page.js`): Stats cards (pending escrow, ID verification, users, products)
- **Escrow Management** (`app/admin/escrow/page.js`): Filter by status, view buyer/seller details, approve/reject
- **ID Verification** (`app/admin/verify/page.js`): Pending verification queue + all students list + verify/reject actions

---

## Phase 9 ✅ — Community & Profile
**What was done:**
- **Community Page** (`app/(main)/community/page.js`): Create posts, category tags, upvote system, expandable comments
- **Profile Page** (`app/(main)/profile/page.js`): Avatar, stats (buys/sells/swaps), badges (Verified, Active Seller, Top Trader), editable profile fields

---

## Phase 10 ✅ — Polish & Verification
**What was done:**
- Fixed Supabase client/server to gracefully handle placeholder credentials during build
- Fixed `useSearchParams()` Suspense boundary error in signup page
- **Build passes** on Next.js 16.1.6 (Turbopack)
- **Pushed to GitHub** at https://github.com/Shairaz15/campora

**Remaining for user:**
- Add real Supabase credentials to `.env.local`
- Run SQL schema in Supabase SQL Editor
- Deploy to Vercel

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS + custom dark theme |
| Auth | Supabase Auth (Phone OTP) |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Security | Row Level Security |
| Deploy | Vercel + Supabase |

## File Structure
```
app/
├── layout.js, page.js, globals.css
├── login/page.js
├── signup/page.js
├── auth/callback/route.js
├── (main)/
│   ├── layout.js
│   ├── marketplace/page.js
│   ├── product/[id]/page.js
│   ├── sell/page.js
│   ├── chat/page.js, chat/[id]/page.js
│   ├── community/page.js
│   └── profile/page.js
├── admin/
│   ├── layout.js, page.js
│   ├── escrow/page.js
│   └── verify/page.js
components/
├── Navbar.js, ProductCard.js
├── OfferModal.js, SwapModal.js
lib/
├── supabase/ (client.js, server.js, middleware.js)
├── utils.js
middleware.js
schema.sql
```

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
