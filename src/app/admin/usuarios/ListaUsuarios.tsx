"use client";

import { useState } from "react";
import { activarUsuario, desactivarUsuario, cambiarRol } from "./actions";
import type { Rol } from "@/types";

interface Usuario {
  id: string;
  nombre_apellido: string | null;
  email_contacto: string | null;
  matricula_nro: string | null;
  tomo: string | null;
  folio: string | null;
  localidad: string | null;
  rol: Rol;
  activo: boolean;
  created_at: string;
}

interface Props {
  usuarios: Usuario[];
  perfilActualId: string;
}

export default function ListaUsuarios({
  usuarios: iniciales,
  perfilActualId,
}: Props) {
  const [usuarios, setUsuarios] = useState(iniciales);
  const [cargando, setCargando] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.toLowerCase();
    return (
      u.nombre_apellido?.toLowerCase().includes(q) ||
      u.email_contacto?.toLowerCase().includes(q) ||
      u.localidad?.toLowerCase().includes(q) ||
      u.matricula_nro?.toLowerCase().includes(q)
    );
  });

  async function toggleActivo(u: Usuario) {
    setCargando(u.id);
    const action = u.activo ? desactivarUsuario : activarUsuario;
    const result = await action(u.id);
    if (result.success) {
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, activo: !x.activo } : x)),
      );
    } else {
      alert(result.error);
    }
    setCargando(null);
  }

  async function handleRol(u: Usuario, rol: Rol) {
    setCargando(u.id);
    const result = await cambiarRol(u.id, rol);
    if (result.success) {
      setUsuarios((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, rol } : x)),
      );
    } else {
      alert(result.error);
    }
    setCargando(null);
  }

  const esSelf = (id: string) => id === perfilActualId;

  return (
    <div>
      {/* Buscador y stats */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email, localidad o matrícula..."
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
        />
        <div className="flex gap-4 shrink-0 text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-900">
              {usuarios.filter((u) => u.activo).length}
            </span>{" "}
            activos
          </span>
          <span>
            <span className="font-medium text-gray-900">
              {usuarios.filter((u) => !u.activo).length}
            </span>{" "}
            inactivos
          </span>
          <span>
            <span className="font-medium text-gray-900">{usuarios.length}</span>{" "}
            total
          </span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Usuario
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Matrícula
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Localidad
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Rol
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Estado
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
              filtrados.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-gray-100 last:border-0 ${
                    !u.activo ? "opacity-50" : ""
                  } ${esSelf(u.id) ? "bg-blue-50" : ""}`}
                >
                  {/* Usuario */}
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {u.nombre_apellido ?? "Sin nombre"}
                      {esSelf(u.id) && (
                        <span className="ml-2 text-xs text-blue-500">
                          (vos)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{u.email_contacto}</p>
                  </td>

                  {/* Matrícula */}
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {u.tomo && u.folio
                      ? `T° ${u.tomo} F° ${u.folio}`
                      : (u.matricula_nro ?? (
                          <span className="text-gray-300">—</span>
                        ))}
                  </td>

                  {/* Localidad */}
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {u.localidad ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3">
                    <select
                      value={u.rol}
                      disabled={esSelf(u.id) || cargando === u.id}
                      onChange={(e) => handleRol(u, e.target.value as Rol)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white outline-none focus:border-blue-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="abogado">Abogado</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-md font-medium ${
                        u.activo
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActivo(u)}
                      disabled={esSelf(u.id) || cargando === u.id}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        u.activo
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {cargando === u.id
                        ? "..."
                        : u.activo
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
