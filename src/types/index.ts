export type Rol = 'abogado' | 'moderador' | 'admin'
export type TipoAviso = 'ofrece' | 'busca'
export type TipoEspacio = 'Oficina privada' | 'Cowork' | 'Escritorio'
export type EstadoAviso = 'pendiente' | 'aprobado' | 'rechazado' | 'retirado' | 'expirado'
export type DecisionModeracion = 'aprobado' | 'rechazado' | 'retirado'

export const LOCALIDADES = [
  '28 de Noviembre',
  'Lago Posadas',
  'Caleta Olivia',
  'Comandante Luis Piedrabuena',
  'El Calafate',
  'El Chaltén',
  'Gobernador Gregores',
  'Hipólito Yrigoyen',
  'Jaramillo',
  'La Esperanza',
  'Las Heras',
  'Los Antiguos',
  'Perito Moreno',
  'Pico Truncado',
  'Puerto Deseado',
  'Puerto San Julián',
  'Puerto Santa Cruz',
  'Río Gallegos',
  'Río Turbio',
  'Tres Lagos',
  'Bajo Caracoles',
  'Cañadón Seco',
  'Koluel Kaike',
] as const

export type Localidad = (typeof LOCALIDADES)[number]

export interface Profile {
  id: string
  auth_user_id: string
  nombre_apellido: string | null
  matricula_nro: string | null
  tomo: string | null
  folio: string | null
  email_contacto: string | null
  telefono: string | null
  localidad: string | null
  rol: Rol
  activo: boolean
  created_at: string
  updated_at: string
}

export interface Aviso {
  id: string
  perfil_id: string | null
  tipo_aviso: TipoAviso
  tipo_espacio: TipoEspacio
  localidad: string
  titulo: string
  descripcion: string
  contacto_visible: string
  caracteristicas: string[]
  estado: EstadoAviso
  publicado_en: string | null
  vence_en: string | null
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'nombre_apellido' | 'tomo' | 'folio'>
}

export interface Moderacion {
  id: string
  aviso_id: string
  moderador_id: string | null
  decision: DecisionModeracion
  motivo_rechazo: string | null
  decidido_en: string
}

export interface DeclaracionJurada {
  id: string
  perfil_id: string | null
  aviso_id: string | null
  acepta_tyc: boolean
  ip_origen: string | null
  user_agent: string | null
  firmado_en: string
}
