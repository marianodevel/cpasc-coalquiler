import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import PanelMod from "./PanelMod";

export const metadata = {
  title: "Panel de moderación",
};

export default async function AdminPage() {
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

  const { data: avisos } = await admin
    .from("avisos")
    .select(
      `
      id, tipo_aviso, tipo_espacio, localidad, titulo,
      descripcion, contacto_visible, caracteristicas,
      estado, created_at,
      profiles ( nombre_apellido, tomo, folio, email_contacto )
    `,
    )
    .in("estado", ["pendiente", "aprobado", "rechazado"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Panel de moderación
          </h1>
          <p className="text-sm text-gray-500">
            Revisá y aprobá los avisos enviados por los abogados matriculados.
          </p>
        </div>

        <a
          href="/admin/usuarios"
          className="text-sm text-blue-600 hover:underline transition-colors"
        >
          Gestionar usuarios →
        </a>
      </div>
      <PanelMod avisos={avisos ?? []} />
    </main>
  );
}
