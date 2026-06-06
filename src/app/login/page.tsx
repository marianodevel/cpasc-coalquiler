import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Ingresar",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya tiene sesión, redirigir
  if (user) {
    redirect(searchParams.redirect ?? "/");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8">
          <div className="w-2 h-2 rounded-full bg-blue-500 mb-4" />
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Bolsa de Co-Alquiler
          </h1>
          <p className="text-sm text-gray-500">
            Ingresá con tu email para publicar o gestionar tus avisos.
          </p>
        </div>

        <LoginForm redirectTo={searchParams.redirect} />

        <p className="text-xs text-gray-400 mt-6">
          Solo abogados matriculados en el CPASC pueden publicar avisos. La
          consulta del listado es pública.
        </p>
      </div>
    </main>
  );
}
