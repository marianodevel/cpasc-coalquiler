import { createClient } from "@supabase/supabase-js";

// Cliente con service_role — bypasea RLS completamente
// SOLO usar en Server Components, Server Actions o Route Handlers
// NUNCA importar desde un Client Component ('use client')

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
