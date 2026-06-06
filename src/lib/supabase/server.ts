import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Este cliente se usa en Server Components, Server Actions y Route Handlers
// Se ejecuta en el servidor — nunca llega al browser
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll puede fallar en Server Components de solo lectura.
            // Se puede ignorar si hay un middleware que refresca la sesión.
          }
        },
      },
    },
  );
}
