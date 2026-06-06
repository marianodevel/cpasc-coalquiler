-- ============================================================
-- CPASC — Bolsa de Co-Alquiler
-- Schema completo — ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================


-- ------------------------------------------------------------
-- EXTENSIONES
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ------------------------------------------------------------
-- TABLA: profiles
-- Extiende auth.users con datos del dominio CPASC
-- ------------------------------------------------------------
CREATE TABLE profiles (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nombre_apellido text,
  matricula_nro   text,
  tomo            text,
  folio           text,
  email_contacto  text,
  telefono        text,
  localidad       text,
  rol             text NOT NULL DEFAULT 'abogado'
                    CHECK (rol IN ('abogado', 'moderador', 'admin')),
  activo          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- TABLA: avisos
-- ------------------------------------------------------------
CREATE TABLE avisos (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tipo_aviso       text NOT NULL CHECK (tipo_aviso IN ('ofrece', 'busca')),
  tipo_espacio     text NOT NULL CHECK (tipo_espacio IN ('Oficina privada', 'Cowork', 'Escritorio')),
  localidad        text NOT NULL,
  titulo           text NOT NULL,
  descripcion      text NOT NULL,
  contacto_visible text NOT NULL,
  caracteristicas  text[] NOT NULL DEFAULT '{}',
  estado           text NOT NULL DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente','aprobado','rechazado','retirado','expirado')),
  publicado_en     timestamptz,
  vence_en         timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- TABLA: moderaciones
-- Historial inmutable de decisiones
-- ------------------------------------------------------------
CREATE TABLE moderaciones (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  aviso_id       uuid REFERENCES avisos(id) ON DELETE CASCADE NOT NULL,
  moderador_id   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  decision       text NOT NULL CHECK (decision IN ('aprobado', 'rechazado', 'retirado')),
  motivo_rechazo text,
  decidido_en    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT motivo_requerido_al_rechazar
    CHECK (decision <> 'rechazado' OR (motivo_rechazo IS NOT NULL AND motivo_rechazo <> ''))
);


-- ------------------------------------------------------------
-- TABLA: declaraciones_juradas
-- ------------------------------------------------------------
CREATE TABLE declaraciones_juradas (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  perfil_id  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  aviso_id   uuid REFERENCES avisos(id) ON DELETE SET NULL,
  acepta_tyc boolean NOT NULL DEFAULT false,
  ip_origen  text,
  user_agent text,
  firmado_en timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- TABLA: audit_log
-- Append-only — solo triggers pueden insertar
-- ------------------------------------------------------------
CREATE TABLE audit_log (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id         uuid,
  accion           text NOT NULL,
  entidad          text NOT NULL,
  entidad_id       uuid,
  payload_anterior jsonb,
  payload_nuevo    jsonb,
  ip_address       text,
  ocurrido_en      timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------
CREATE INDEX idx_avisos_estado    ON avisos(estado);
CREATE INDEX idx_avisos_localidad ON avisos(localidad);
CREATE INDEX idx_avisos_perfil    ON avisos(perfil_id);
CREATE INDEX idx_avisos_vence     ON avisos(vence_en) WHERE estado = 'aprobado';
CREATE INDEX idx_audit_entidad    ON audit_log(entidad, entidad_id);


-- ------------------------------------------------------------
-- TRIGGER: auto-crear profile al registrarse
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (auth_user_id, email_contacto, rol)
  VALUES (NEW.id, NEW.email, 'abogado');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ------------------------------------------------------------
-- TRIGGER: updated_at automático
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_avisos_updated_at
  BEFORE UPDATE ON avisos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ------------------------------------------------------------
-- TRIGGER: publicado_en y vence_en al aprobar
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_publicado_vence()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = 'aprobado' AND OLD.estado <> 'aprobado' THEN
    NEW.publicado_en = now();
    NEW.vence_en     = now() + INTERVAL '90 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_avisos_publicado
  BEFORE UPDATE ON avisos
  FOR EACH ROW EXECUTE FUNCTION set_publicado_vence();


-- ------------------------------------------------------------
-- TRIGGER: audit_log en cambios de estado
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_cambio_estado_aviso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO audit_log (accion, entidad, entidad_id, payload_anterior, payload_nuevo)
    VALUES (
      'estado_cambiado',
      'avisos',
      NEW.id,
      jsonb_build_object('estado', OLD.estado),
      jsonb_build_object('estado', NEW.estado)
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_aviso_estado
  AFTER UPDATE ON avisos
  FOR EACH ROW EXECUTE FUNCTION log_cambio_estado_aviso();


-- ------------------------------------------------------------
-- ROW LEVEL SECURITY — habilitar en todas las tablas
-- ------------------------------------------------------------
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE avisos                ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderaciones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE declaraciones_juradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log             ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- POLÍTICAS RLS — profiles
-- ------------------------------------------------------------
CREATE POLICY "perfil_propio_select"
  ON profiles FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "moderador_ver_perfiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );

CREATE POLICY "perfil_propio_update"
  ON profiles FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (rol = 'abogado');


-- ------------------------------------------------------------
-- POLÍTICAS RLS — avisos
-- ------------------------------------------------------------
CREATE POLICY "anon_ver_aprobados"
  ON avisos FOR SELECT TO anon
  USING (estado = 'aprobado');

CREATE POLICY "auth_ver_avisos"
  ON avisos FOR SELECT TO authenticated
  USING (
    estado = 'aprobado'
    OR perfil_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );

CREATE POLICY "abogado_insertar_aviso"
  ON avisos FOR INSERT TO authenticated
  WITH CHECK (
    perfil_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "abogado_editar_pendiente"
  ON avisos FOR UPDATE TO authenticated
  USING (
    perfil_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    AND estado = 'pendiente'
  )
  WITH CHECK (estado = 'pendiente');

CREATE POLICY "moderador_cambiar_estado"
  ON avisos FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );


-- ------------------------------------------------------------
-- POLÍTICAS RLS — moderaciones
-- ------------------------------------------------------------
CREATE POLICY "moderador_ver_moderaciones"
  ON moderaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );

CREATE POLICY "moderador_insertar_moderacion"
  ON moderaciones FOR INSERT TO authenticated
  WITH CHECK (
    moderador_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );


-- ------------------------------------------------------------
-- POLÍTICAS RLS — declaraciones_juradas
-- ------------------------------------------------------------
CREATE POLICY "abogado_insertar_ddjj"
  ON declaraciones_juradas FOR INSERT TO authenticated
  WITH CHECK (
    perfil_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "abogado_ver_ddjj_propias"
  ON declaraciones_juradas FOR SELECT TO authenticated
  USING (
    perfil_id = (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );


-- ------------------------------------------------------------
-- POLÍTICAS RLS — audit_log
-- ------------------------------------------------------------
CREATE POLICY "moderador_ver_audit"
  ON audit_log FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.auth_user_id = auth.uid()
        AND p.rol IN ('moderador', 'admin')
    )
  );
