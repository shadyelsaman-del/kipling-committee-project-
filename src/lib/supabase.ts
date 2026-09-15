import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
  );
}

// Server-only client using the service role key. All database and storage
// access for this app goes through Next.js server code (API routes / server
// components), never directly from the browser, so we don't need Supabase
// auth or row-level-security policies for the client.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const PAYMENT_SCREENSHOTS_BUCKET = "payment-screenshots";
