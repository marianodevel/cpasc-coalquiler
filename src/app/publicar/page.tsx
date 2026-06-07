import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublicarForm from "./PublicarForm";

export const metadata = {
  title: "Publicar aviso",
};

export default async function PublicarPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/publicar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, nombre_apellido, tomo, folio, localidad, activo")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) redirect("/");
  if (!profile.activo) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-gray-500">
          Tu cuenta está inactiva. Contactá al CPASC.
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900 mb-1">
          Publicar aviso
        </h1>
        <p className="text-sm text-gray-500">
          Tu aviso será revisado por el CPASC antes de publicarse.
        </p>
      </div>
      <PublicarForm
        perfilId={profile.id}
        datosIniciales={{
          tomo: profile.tomo ?? "",
          folio: profile.folio ?? "",
          localidad: profile.localidad ?? "",
        }}
      />
    </main>
  );
}
