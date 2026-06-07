import type { Aviso } from "@/types";

export default function AvisoCard({ aviso }: { aviso: Aviso }) {
  const esofrece = aviso.tipo_aviso === "ofrece";

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-sm font-medium text-gray-900 leading-snug">
          {aviso.titulo}
        </h2>
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium shrink-0 ${
            esofrece ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}
        >
          {esofrece ? "Ofrece" : "Busca"}
        </span>
      </div>

      <div className="flex gap-4 mb-3 text-xs text-gray-400">
        <span>{aviso.localidad}</span>
        <span>{aviso.tipo_espacio}</span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
        {aviso.descripcion}
      </p>

      {aviso.caracteristicas.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {aviso.caracteristicas.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-md border border-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-blue-600">{aviso.contacto_visible}</span>
        <span className="text-xs text-gray-300">
          {aviso.publicado_en
            ? new Date(aviso.publicado_en).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
              })
            : ""}
        </span>
      </div>
    </article>
  );
}
