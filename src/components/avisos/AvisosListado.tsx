"use client";

import { useState, useMemo } from "react";
import type { Aviso, TipoAviso, TipoEspacio } from "@/types";
import { LOCALIDADES } from "@/types";
import AvisoCard from "./AvisoCard";

interface Props {
  avisos: Aviso[];
  stats: {
    disponibles: number;
    buscando: number;
  };
}

export default function AvisosListado({ avisos, stats }: Props) {
  const [tab, setTab] = useState<TipoAviso>("ofrece");
  const [localidad, setLocalidad] = useState("");
  const [espacio, setEspacio] = useState("");

  const filtrados = useMemo(() => {
    return avisos.filter((a) => {
      if (a.tipo_aviso !== tab) return false;
      if (localidad && a.localidad !== localidad) return false;
      if (espacio && a.tipo_espacio !== espacio) return false;
      return true;
    });
  }, [avisos, tab, localidad, espacio]);

  function limpiarFiltros() {
    setLocalidad("");
    setEspacio("");
  }

  const hayFiltros = localidad !== "" || espacio !== "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Espacios para compartir en Santa Cruz
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          Encontrá o publicá espacios de co-alquiler entre colegas matriculados.
        </p>
        <div className="flex gap-4">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xl font-medium text-gray-900">
              {stats.disponibles}
            </p>
            <p className="text-xs text-gray-400">espacios disponibles</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xl font-medium text-gray-900">
              {stats.buscando}
            </p>
            <p className="text-xs text-gray-400">colegas buscando</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-center">
            <p className="text-xl font-medium text-gray-900">
              {LOCALIDADES.length}
            </p>
            <p className="text-xs text-gray-400">localidades</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <select
          value={localidad}
          onChange={(e) => setLocalidad(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-blue-400"
        >
          <option value="">Todas las localidades</option>
          {LOCALIDADES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={espacio}
          onChange={(e) => setEspacio(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-blue-400"
        >
          <option value="">Tipo de espacio</option>
          {(["Oficina privada", "Cowork", "Escritorio"] as TipoEspacio[]).map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ),
          )}
        </select>

        {hayFiltros && (
          <button
            onClick={limpiarFiltros}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Limpiar filtros
          </button>
        )}

        <span className="text-xs text-gray-400 ml-auto">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(
          [
            { value: "ofrece", label: "Espacios disponibles" },
            { value: "busca", label: "Busco espacio" },
          ] as { value: TipoAviso; label: string }[]
        ).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm px-4 py-2 border-b-2 transition-colors ${
              tab === t.value
                ? "border-blue-500 text-blue-600 font-medium"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Listado */}
      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No hay avisos con esos filtros.</p>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="text-xs text-blue-500 mt-2 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map((aviso) => (
            <AvisoCard key={aviso.id} aviso={aviso} />
          ))}
        </div>
      )}
    </div>
  );
}
