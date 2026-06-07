"use server";

import { createClient } from "@/lib/supabase/server";
import { avisoSchema } from "@/lib/validations";
import { headers } from "next/headers";
import type { AvisoFormData } from "@/lib/validations";

export type PublicarResult =
  | { success: true; avisoId: string }
  | { success: false; error: string };

export async function publicarAviso(
  perfilId: string,
  data: AvisoFormData,
): Promise<PublicarResult> {
  // 1. Validar con Zod — defensa real del servidor
  const parsed = avisoSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Los datos del formulario son inválidos." };
  }

  const supabase = createClient();

  // 2. Verificar sesión activa
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Sesión expirada. Volvé a ingresar." };
  }

  // 3. Verificar que el perfilId corresponde al usuario autenticado
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, activo")
    .eq("auth_user_id", user.id)
    .eq("id", perfilId)
    .single();

  if (!profile) {
    return { success: false, error: "Perfil no encontrado." };
  }

  if (!profile.activo) {
    return {
      success: false,
      error: "Tu cuenta está inactiva. Contactá al CPASC.",
    };
  }

  // 4. Obtener IP para la declaración jurada
  const headersList = headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "desconocida";
  const userAgent = headersList.get("user-agent") ?? "";

  // 5. Insertar el aviso
  const { data: aviso, error: avisoError } = await supabase
    .from("avisos")
    .insert({
      perfil_id: perfilId,
      tipo_aviso: parsed.data.tipo_aviso,
      tipo_espacio: parsed.data.tipo_espacio,
      localidad: parsed.data.localidad,
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion,
      contacto_visible: parsed.data.contacto_visible,
      caracteristicas: parsed.data.caracteristicas,
    })
    .select("id")
    .single();

  if (avisoError || !aviso) {
    console.error("Error insertando aviso:", avisoError);
    return {
      success: false,
      error: "No se pudo guardar el aviso. Intentá de nuevo.",
    };
  }

  // 6. Insertar declaración jurada
  const { error: ddjjError } = await supabase
    .from("declaraciones_juradas")
    .insert({
      perfil_id: perfilId,
      aviso_id: aviso.id,
      acepta_tyc: true,
      ip_origen: ip,
      user_agent: userAgent,
    });

  if (ddjjError) {
    console.error("Error insertando DDJJ:", ddjjError);
  }

  // 7. Actualizar tomo/folio en el perfil si se completaron
  if (parsed.data.tomo || parsed.data.folio) {
    await supabase
      .from("profiles")
      .update({
        ...(parsed.data.tomo && { tomo: parsed.data.tomo }),
        ...(parsed.data.folio && { folio: parsed.data.folio }),
      })
      .eq("id", perfilId);
  }

  return { success: true, avisoId: aviso.id };
}
