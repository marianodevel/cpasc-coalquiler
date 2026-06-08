"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { moderacionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import type { ModeracionData } from "@/lib/validations";

export type ModerarResult =
  | { success: true }
  | { success: false; error: string };

export async function moderarAviso(
  data: ModeracionData,
): Promise<ModerarResult> {
  // 1. Validar con Zod
  const parsed = moderacionSchema.safeParse(data);
  if (!parsed.success) {
    const mensaje = parsed.error.issues[0]?.message ?? "Datos inválidos";

    return { success: false, error: mensaje };
  }

  // 2. Verificar que el usuario autenticado es moderador o admin
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, rol")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !["moderador", "admin"].includes(profile.rol)) {
    return { success: false, error: "No tenés permisos para moderar avisos." };
  }

  // 3. Usar el cliente admin para las operaciones de moderación
  const admin = createAdminClient();

  // 4. Registrar la decisión en moderaciones (inmutable)
  const { error: modError } = await admin.from("moderaciones").insert({
    aviso_id: parsed.data.aviso_id,
    moderador_id: profile.id,
    decision: parsed.data.decision,
    motivo_rechazo: parsed.data.motivo_rechazo ?? null,
  });

  if (modError) {
    console.error("Error insertando moderación:", modError);
    return { success: false, error: "No se pudo registrar la decisión." };
  }

  // 5. Actualizar estado del aviso
  // El trigger log_cambio_estado_aviso se dispara automáticamente acá
  const { error: avisoError } = await admin
    .from("avisos")
    .update({ estado: parsed.data.decision })
    .eq("id", parsed.data.aviso_id);

  if (avisoError) {
    console.error("Error actualizando estado:", avisoError);
    return {
      success: false,
      error: "Decisión registrada pero no se pudo actualizar el estado.",
    };
  }

  // 6. Revalidar caché de las páginas afectadas
  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true };
}
