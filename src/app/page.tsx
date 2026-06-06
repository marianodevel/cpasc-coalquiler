import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-8">
      <p>{user?.email ?? "Sin sesión"}</p>
      {user && <LogoutButton />}
    </main>
  );
}
