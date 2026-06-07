import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Navbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-gray-900">
            CPASC — Co-Alquiler
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-xs text-gray-400">{user.email}</span>
              <Link
                href="/publicar"
                className="text-sm font-medium bg-blue-600 text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 transition-colors"
              >
                Publicar aviso
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                href="/login?redirect=/publicar"
                className="text-sm font-medium bg-blue-600 text-white rounded-lg px-4 py-1.5 hover:bg-blue-700 transition-colors"
              >
                Publicar aviso
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
