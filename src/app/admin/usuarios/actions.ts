"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { Rol } from "@/types";

type UsuarioResult = { success: true } | { success: false; error: string };

// Verificación de moderador reutilizable
async function verificarModerador() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, rol")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile || !["moderador", "admin"].includes(profile.rol)) return null;
  return profile;
}

export async function activarUsuario(id: string): Promise<UsuarioResult> {
  const mod = await verificarModerador();
  if (!mod) return { success: false, error: "No autorizado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ activo: true })
    .eq("id", id);

  if (error) return { success: false, error: "No se pudo activar el usuario." };

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function desactivarUsuario(id: string): Promise<UsuarioResult> {
  const mod = await verificarModerador();
  if (!mod) return { success: false, error: "No autorizado." };

  // No permitir que el moderador se desactive a sí mismo
  if (id === mod.id) {
    return { success: false, error: "No podés desactivar tu propia cuenta." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ activo: false })
    .eq("id", id);

  if (error)
    return { success: false, error: "No se pudo desactivar el usuario." };

  revalidatePath("/admin/usuarios");
  return { success: true };
}

export async function cambiarRol(id: string, rol: Rol): Promise<UsuarioResult> {
  const mod = await verificarModerador();
  if (!mod) return { success: false, error: "No autorizado." };

  if (id === mod.id) {
    return { success: false, error: "No podés cambiar tu propio rol." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ rol }).eq("id", id);

  if (error) return { success: false, error: "No se pudo cambiar el rol." };

  revalidatePath("/admin/usuarios");
  return { success: true };
}
