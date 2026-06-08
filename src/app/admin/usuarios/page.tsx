import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ListaUsuarios from "./ListaUsuarios";

export const metadata = {
  title: "Usuarios",
};

export default async function UsuariosPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, rol")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !["moderador", "admin"].includes(profile.rol)) {
    redirect("/");
  }

  const admin = createAdminClient();

  const { data: usuarios } = await admin
    .from("profiles")
    .select(
      "id, nombre_apellido, email_contacto, matricula_nro, tomo, folio, localidad, rol, activo, created_at",
    )
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Usuarios matriculados
          </h1>
          <p className="text-sm text-gray-500">
            Gestioná el acceso de los abogados al sistema.
          </p>
        </div>

        <a
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Volver al panel
        </a>
      </div>
      <ListaUsuarios usuarios={usuarios ?? []} perfilActualId={profile.id} />
    </main>
  );
}
