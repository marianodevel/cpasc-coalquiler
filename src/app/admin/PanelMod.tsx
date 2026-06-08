"use client";

import { useState } from "react";
import { moderarAviso } from "./actions";

type EstadoFiltro = "pendiente" | "aprobado" | "rechazado" | "todos";

interface AvisoMod {
  id: string;
  tipo_aviso: string;
  tipo_espacio: string;
  localidad: string;
  titulo: string;
  descripcion: string;
  contacto_visible: string;
  caracteristicas: string[];
  estado: string;
  created_at: string;
  profiles: {
    nombre_apellido: string | null;
    tomo: string | null;
    folio: string | null;
    email_contacto: string | null;
  } | null;
}

export default function PanelMod({
  avisos: avisosIniciales,
}: {
  avisos: AvisoMod[];
}) {
  const [avisos, setAvisos] = useState(avisosIniciales);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<EstadoFiltro>("pendiente");
  const [motivo, setMotivo] = useState("");
  const [cargando, setCargando] = useState(false);

  const filtrados = avisos.filter((a) =>
    filtro === "todos" ? true : a.estado === filtro,
  );

  const aviso = avisos.find((a) => a.id === seleccionado) ?? null;

  const pendientes = avisos.filter((a) => a.estado === "pendiente").length;

  async function moderar(decision: "aprobado" | "rechazado" | "retirado") {
    if (!seleccionado) return;
    if (decision === "rechazado" && !motivo.trim()) {
      alert("El motivo de rechazo es obligatorio.");
      return;
    }

    setCargando(true);
    const result = await moderarAviso({
      aviso_id: seleccionado,
      decision,
      motivo_rechazo: decision === "rechazado" ? motivo : undefined,
    });

    if (result.success) {
      setAvisos((prev) =>
        prev.map((a) =>
          a.id === seleccionado ? { ...a, estado: decision } : a,
        ),
      );
      setMotivo("");
      setSeleccionado(null);
    } else {
      alert(result.error);
    }
    setCargando(false);
  }

  return (
    <div className="grid grid-cols-3 gap-6" style={{ minHeight: "600px" }}>
      {/* Columna izquierda — cola */}
      <div className="col-span-1 flex flex-col gap-3">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-medium text-amber-600">{pendientes}</p>
            <p className="text-xs text-gray-400">pendientes</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xl font-medium text-green-600">
              {avisos.filter((a) => a.estado === "aprobado").length}
            </p>
            <p className="text-xs text-gray-400">aprobados</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(
            [
              { value: "pendiente", label: "Pendientes" },
              { value: "aprobado", label: "Aprobados" },
              { value: "todos", label: "Todos" },
            ] as { value: EstadoFiltro; label: string }[]
          ).map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${
                filtro === f.value
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="flex flex-col gap-2 overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-8">
              Sin avisos en esta categoría.
            </p>
          ) : (
            filtrados.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSeleccionado(a.id);
                  setMotivo("");
                }}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  seleccionado === a.id
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p
                    className={`text-xs font-medium leading-snug line-clamp-2 ${
                      seleccionado === a.id ? "text-blue-800" : "text-gray-900"
                    }`}
                  >
                    {a.titulo}
                  </p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                      a.estado === "pendiente"
                        ? "bg-amber-100 text-amber-700"
                        : a.estado === "aprobado"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {a.localidad} · {a.tipo_espacio}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Columna derecha — detalle */}
      <div className="col-span-2">
        {!aviso ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p className="text-sm">Seleccioná un aviso para revisarlo</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-medium text-gray-900 mb-1">
                  {aviso.titulo}
                </h2>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{aviso.localidad}</span>
                  <span>{aviso.tipo_espacio}</span>
                  <span>
                    {new Date(aviso.created_at).toLocaleDateString("es-AR")}
                  </span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${
                  aviso.estado === "pendiente"
                    ? "bg-amber-100 text-amber-700"
                    : aviso.estado === "aprobado"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {aviso.estado}
              </span>
            </div>

            {/* Contenido */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">
                Descripción
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {aviso.descripcion}
              </p>
            </div>

            {aviso.caracteristicas.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {aviso.caracteristicas.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">
                Contacto visible
              </p>
              <p className="text-sm text-blue-600">{aviso.contacto_visible}</p>
            </div>

            {/* Datos del abogado */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Abogado/a solicitante
              </p>
              <p className="text-sm font-medium text-gray-900">
                {aviso.profiles?.nombre_apellido ?? "Sin nombre"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {aviso.profiles?.tomo && aviso.profiles?.folio
                  ? `T° ${aviso.profiles.tomo} F° ${aviso.profiles.folio}`
                  : "Matrícula no completada"}
              </p>
              <p className="text-xs text-gray-400">
                {aviso.profiles?.email_contacto}
              </p>
            </div>

            {/* Acciones */}
            {aviso.estado === "pendiente" && (
              <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Motivo (obligatorio al rechazar)
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder="Describí el motivo si vas a rechazar el aviso..."
                    rows={2}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => moderar("aprobado")}
                    disabled={cargando}
                    className="flex-1 text-sm font-medium bg-green-600 text-white rounded-lg px-4 py-2 hover:bg-green-700 disabled:opacity-40 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => moderar("rechazado")}
                    disabled={cargando}
                    className="flex-1 text-sm font-medium border border-red-300 text-red-600 rounded-lg px-4 py-2 hover:bg-red-50 disabled:opacity-40 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            )}

            {aviso.estado === "aprobado" && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => moderar("retirado")}
                  disabled={cargando}
                  className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  Retirar aviso
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
