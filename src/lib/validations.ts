import { z } from "zod";
import { LOCALIDADES } from "@/types";

// ------------------------------------------------------------
// Schema: aviso
// ------------------------------------------------------------
export const avisoSchema = z.object({
  tipo_aviso: z.enum(["ofrece", "busca"], {
    error: "Seleccioná un tipo de aviso",
  }),

  tipo_espacio: z.enum(["Oficina privada", "Cowork", "Escritorio"], {
    error: "Seleccioná el tipo de espacio",
  }),

  localidad: z.enum(LOCALIDADES, {
    error: "Seleccioná una localidad",
  }),

  titulo: z
    .string()
    .min(10, "El título debe tener al menos 10 caracteres")
    .max(120, "El título no puede superar los 120 caracteres"),

  descripcion: z
    .string()
    .min(30, "La descripción debe tener al menos 30 caracteres")
    .max(800, "La descripción no puede superar los 800 caracteres"),

  contacto_visible: z.string().min(5, "El contacto es obligatorio"),

  caracteristicas: z
    .array(z.string().min(1).max(40))
    .max(10, "Máximo 10 características"),

  tomo: z.string().optional(),
  folio: z.string().optional(),

  acepta_ddjj: z.literal(true, {
    error: "Debés firmar la declaración jurada",
  }),

  acepta_tyc: z.literal(true, {
    error: "Debés aceptar los términos y condiciones",
  }),
});

export type AvisoFormData = z.infer<typeof avisoSchema>;

// ------------------------------------------------------------
// Schema: perfil
// ------------------------------------------------------------
export const perfilSchema = z.object({
  nombre_apellido: z.string().min(3, "Nombre y apellido requerido"),
  matricula_nro: z.string().optional(),
  tomo: z.string().optional(),
  folio: z.string().optional(),
  telefono: z.string().optional(),
  localidad: z.enum(LOCALIDADES).optional(),
});

export type PerfilFormData = z.infer<typeof perfilSchema>;

// ------------------------------------------------------------
// Schema: moderación
// ------------------------------------------------------------
export const moderacionSchema = z
  .object({
    aviso_id: z.string().uuid(),
    decision: z.enum(["aprobado", "rechazado", "retirado"]),
    motivo_rechazo: z.string().optional(),
  })
  .refine(
    (data) =>
      data.decision !== "rechazado" ||
      (data.motivo_rechazo && data.motivo_rechazo.length >= 10),
    {
      message:
        "El motivo de rechazo es obligatorio y debe tener al menos 10 caracteres",
      path: ["motivo_rechazo"],
    },
  );

export type ModeracionData = z.infer<typeof moderacionSchema>;
