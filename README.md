## Kipling Food Orders

Food ordering app for Kipling, Class F 2027 committee. Students browse
restaurants and menus, place an order, and upload a payment screenshot.
Ordering is only open on Saturdays (delivery Sunday) and Mondays (delivery
Tuesday).

### Stack

- Next.js (App Router, TypeScript, Tailwind)
- Supabase (Postgres database + Storage for payment screenshots)

### Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run `supabase/schema.sql`. This creates the
   `restaurants`, `menu_items`, `orders`, `order_items` tables and a private
   `payment-screenshots` storage bucket.
3. Copy `.env.local.example` to `.env.local` and fill in:
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API.
     The **service role key** is used because all database/storage access
     happens server-side in Next.js API routes and server components — never
     from the browser — so no client-side Supabase auth or RLS policies are
     needed for the MVP.
   - `ADMIN_PASSWORD`: the single shared password for the committee admin
     dashboard at `/admin`.
4. Edit `src/lib/payment-config.ts` with the real Instapay/Telda handles.
5. `npm install && npm run dev`.

### Adding restaurants and menu items

For now, add rows directly in the Supabase table editor (`restaurants`,
`menu_items`). A dedicated admin UI for managing the menu can be added later.

### App structure

- `/` — landing page
- `/order` — restaurant list (server-side gated to Saturday/Monday only)
- `/order/[restaurantId]` — menu + cart
- `/checkout` — student details, payment instructions, screenshot upload
- `/status` — order status lookup by phone number
- `/admin` — shared-password login
- `/admin/dashboard` — orders grouped by delivery date, screenshots, status updates
