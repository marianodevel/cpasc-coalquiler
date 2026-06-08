"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { avisoSchema } from "@/lib/validations";
import { LOCALIDADES } from "@/types";
import { publicarAviso } from "./actions";
import type { AvisoFormData } from "@/lib/validations";
import type { TipoEspacio } from "@/types";

interface Props {
  perfilId: string;
  datosIniciales: {
    tomo: string;
    folio: string;
    localidad: string;
  };
}

const PASOS = ["Tipo", "Datos", "Descripción", "Confirmación"];

export default function PublicarForm({ perfilId, datosIniciales }: Props) {
  const router = useRouter();
  const [paso, setPaso] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AvisoFormData>({
    resolver: zodResolver(avisoSchema),
    defaultValues: {
      tipo_aviso: undefined,
      tipo_espacio: undefined,
      localidad:
        (datosIniciales.localidad as import("@/types").Localidad) || undefined,
      tomo: datosIniciales.tomo,
      folio: datosIniciales.folio,
      caracteristicas: [],
    },
  });

  const tipoAviso = watch("tipo_aviso");
  const tipoEspacio = watch("tipo_espacio");

  // Campos a validar en cada paso antes de avanzar
  const camposPorPaso: (keyof AvisoFormData)[][] = [
    ["tipo_aviso", "tipo_espacio"],
    ["localidad", "titulo"],
    ["descripcion", "contacto_visible"],
    ["acepta_ddjj", "acepta_tyc"],
  ];

  async function avanzar() {
    const valido = await trigger(camposPorPaso[paso]);
    if (valido) setPaso((p) => p + 1);
  }

  function retroceder() {
    setPaso((p) => p - 1);
  }

  function agregarTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !tags.includes(val) && tags.length < 10) {
        const nuevos = [...tags, val];
        setTags(nuevos);
        setValue("caracteristicas", nuevos);
      }
      setTagInput("");
    }
  }

  function eliminarTag(tag: string) {
    const nuevos = tags.filter((t) => t !== tag);
    setTags(nuevos);
    setValue("caracteristicas", nuevos);
  }

  async function onSubmit(data: AvisoFormData) {
    setEnviando(true);
    const result = await publicarAviso(perfilId, data);
    if (result.success) {
      setEnviado(true);
    } else {
      alert(result.error);
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Aviso enviado
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tu aviso fue recibido y será revisado por el CPASC antes de
          publicarse.
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 hover:underline"
        >
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {PASOS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                i < paso
                  ? "bg-green-100 text-green-700"
                  : i === paso
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < paso ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i === paso ? "text-gray-900 font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < PASOS.length - 1 && (
              <div
                className={`h-px flex-1 ${i < paso ? "bg-green-200" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Paso 1 — Tipo */}
      {paso === 0 && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              ¿Qué querés publicar?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    value: "ofrece",
                    label: "Ofrezco espacio",
                    desc: "Tengo un lugar disponible",
                  },
                  {
                    value: "busca",
                    label: "Busco espacio",
                    desc: "Necesito un lugar",
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setValue("tipo_aviso", opt.value, { shouldValidate: true })
                  }
                  className={`text-left p-4 rounded-xl border transition-colors ${
                    tipoAviso === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-1 ${tipoAviso === opt.value ? "text-blue-700" : "text-gray-900"}`}
                  >
                    {opt.label}
                  </p>
                  <p
                    className={`text-xs ${tipoAviso === opt.value ? "text-blue-500" : "text-gray-400"}`}
                  >
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            {errors.tipo_aviso && (
              <p className="text-xs text-red-500 mt-2">
                {errors.tipo_aviso.message}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Tipo de espacio
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(
                ["Oficina privada", "Cowork", "Escritorio"] as TipoEspacio[]
              ).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setValue("tipo_espacio", opt, { shouldValidate: true })
                  }
                  className={`p-3 rounded-xl border text-center transition-colors ${
                    tipoEspacio === opt
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <p className="text-xs font-medium">{opt}</p>
                </button>
              ))}
            </div>
            {errors.tipo_espacio && (
              <p className="text-xs text-red-500 mt-2">
                {errors.tipo_espacio.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Paso 2 — Datos */}
      {paso === 1 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              {...register("titulo")}
              placeholder="Ej: Oficina privada en centro con sala de reuniones"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            />
            {errors.titulo && (
              <p className="text-xs text-red-500 mt-1">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localidad <span className="text-red-400">*</span>
            </label>
            <select
              {...register("localidad")}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
            >
              <option value="">Seleccioná una localidad</option>
              {LOCALIDADES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {errors.localidad && (
              <p className="text-xs text-red-500 mt-1">
                {errors.localidad.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tomo
              </label>
              <input
                {...register("tomo")}
                placeholder="Ej: IV"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Folio
              </label>
              <input
                {...register("folio")}
                placeholder="Ej: 312"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Paso 3 — Descripción */}
      {paso === 2 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("descripcion")}
              rows={5}
              placeholder="Describí el espacio: características, ambiente, condiciones de uso..."
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none"
            />
            {errors.descripcion && (
              <p className="text-xs text-red-500 mt-1">
                {errors.descripcion.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contacto visible <span className="text-red-400">*</span>
            </label>
            <input
              {...register("contacto_visible")}
              placeholder="Teléfono, email o nombre de contacto"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            />
            <p className="text-xs text-gray-400 mt-1">
              Este dato será visible públicamente sin requerir login.
            </p>
            {errors.contacto_visible && (
              <p className="text-xs text-red-500 mt-1">
                {errors.contacto_visible.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Características
            </label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg min-h-10">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => eliminarTag(tag)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={agregarTag}
                placeholder={
                  tags.length === 0 ? "Escribí y presioná Enter..." : ""
                }
                className="text-xs outline-none bg-transparent min-w-24 flex-1"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Ej: Sala de reuniones, Estacionamiento, Wi-Fi
            </p>
          </div>
        </div>
      )}

      {/* Paso 4 — Confirmación */}
      {paso === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">
              Vista previa
            </p>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {watch("titulo")}
            </p>
            <p className="text-xs text-gray-400 mb-2">
              {watch("localidad")} · {watch("tipo_espacio")}
            </p>
            <p className="text-sm text-gray-600 text-sm leading-relaxed">
              {watch("descripcion")}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-800 mb-2">
              Declaración jurada
            </p>
            <p className="text-xs text-amber-700 leading-relaxed mb-4">
              El/la suscripto/a declara bajo juramento que la información
              consignada es veraz, que se encuentra al día con sus obligaciones
              colegiales, y que el espacio descripto existe y está disponible en
              los términos indicados.
            </p>
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("acepta_ddjj")}
                  className="mt-0.5"
                />
                <span className="text-xs text-amber-800">
                  Firmo la declaración jurada y confirmo que los datos son
                  verídicos.
                </span>
              </label>
              {errors.acepta_ddjj && (
                <p className="text-xs text-red-500">
                  {errors.acepta_ddjj.message}
                </p>
              )}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("acepta_tyc")}
                  className="mt-0.5"
                />
                <span className="text-xs text-amber-800">
                  Acepto los Términos y Condiciones del CPASC.
                </span>
              </label>
              {errors.acepta_tyc && (
                <p className="text-xs text-red-500">
                  {errors.acepta_tyc.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex justify-between mt-8">
        {paso > 0 ? (
          <button
            type="button"
            onClick={retroceder}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Atrás
          </button>
        ) : (
          <div />
        )}

        {paso < PASOS.length - 1 ? (
          <button
            type="button"
            onClick={avanzar}
            className="text-sm font-medium bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 transition-colors"
          >
            Continuar →
          </button>
        ) : (
          <button
            type="submit"
            disabled={enviando}
            className="text-sm font-medium bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {enviando ? "Enviando..." : "Enviar al CPASC"}
          </button>
        )}
      </div>
    </form>
  );
}
