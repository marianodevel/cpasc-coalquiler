import { createClient } from "@/lib/supabase/server";
import AvisosListado from "@/components/avisos/AvisosListado";
import type { Aviso } from "@/types";

export default async function HomePage() {
  const supabase = createClient();

  const { data: avisos, error } = await supabase
    .from("avisos")
    .select("*, profiles(nombre_apellido)")
    .eq("estado", "aprobado")
    .order("publicado_en", { ascending: false });

  const { count: disponibles } = await supabase
    .from("avisos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobado")
    .eq("tipo_aviso", "ofrece");

  const { count: buscando } = await supabase
    .from("avisos")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprobado")
    .eq("tipo_aviso", "busca");

  return (
    <AvisosListado
      avisos={(avisos as Aviso[]) ?? []}
      stats={{
        disponibles: disponibles ?? 0,
        buscando: buscando ?? 0,
      }}
    />
  );
}
