-- =============================================================================
-- Gestão Documental de Frota — Esquema relacional (PostgreSQL)
-- Modelagem multiempresa (multi-tenant) para TRRs e operações de combustíveis.
--
-- Princípios:
--   * Toda tabela de negócio carrega company_id -> isolamento por empresa.
--   * Chaves primárias UUID (gen_random_uuid).
--   * created_at / updated_at em todas as tabelas (updated_at via trigger).
--   * Enums modelados como domínios TEXT + CHECK (fáceis de estender).
--   * Relacionamentos com ON DELETE coerente (CASCADE em dependentes,
--     RESTRICT onde a exclusão deve ser barrada).
--   * RLS preparada para multi-tenant (ver bloco final, comentado).
-- =============================================================================

-- Extensão para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Função utilitária: mantém updated_at atualizado
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1) COMPANIES — empresas que operam a plataforma (tenants)
-- =============================================================================
CREATE TABLE companies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,                       -- razão social
  trade_name  TEXT,                                -- nome fantasia
  cnpj        TEXT,
  email       TEXT,
  phone       TEXT,
  status      TEXT NOT NULL DEFAULT 'ativo'
              CHECK (status IN ('ativo', 'inativo', 'suspenso')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_companies_cnpj ON companies (cnpj) WHERE cnpj IS NOT NULL;

CREATE TRIGGER trg_companies_updated
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 2) USERS — usuários do sistema (vinculados a uma empresa)
-- =============================================================================
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  password_hash  TEXT NOT NULL,
  role           TEXT NOT NULL DEFAULT 'operador'
                 CHECK (role IN ('admin', 'gestor', 'operador', 'consulta')),
  status         TEXT NOT NULL DEFAULT 'ativo'
                 CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- E-mail único por empresa (a mesma pessoa pode existir em tenants distintos)
CREATE UNIQUE INDEX uq_users_company_email ON users (company_id, lower(email));
CREATE INDEX idx_users_company ON users (company_id);

CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 3) CARRIERS — transportadoras
-- =============================================================================
CREATE TABLE carriers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  legal_name         TEXT NOT NULL,                -- razão social
  trade_name         TEXT,                         -- nome fantasia
  cnpj               TEXT,
  state_registration TEXT,                         -- inscrição estadual
  phone              TEXT,
  email              TEXT,
  responsible_name   TEXT,                         -- responsável/contato
  carrier_type       TEXT NOT NULL DEFAULT 'terceiro'
                     CHECK (carrier_type IN ('propria', 'terceiro', 'agregado')),
  status             TEXT NOT NULL DEFAULT 'ativo'
                     CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_carriers_company ON carriers (company_id);
CREATE UNIQUE INDEX uq_carriers_company_cnpj
  ON carriers (company_id, cnpj) WHERE cnpj IS NOT NULL;

CREATE TRIGGER trg_carriers_updated
  BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 4) DRIVERS — motoristas
-- =============================================================================
CREATE TABLE drivers (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id           UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  carrier_id           UUID NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
  full_name            TEXT NOT NULL,
  cpf                  TEXT,
  rg                   TEXT,
  phone                TEXT,
  email                TEXT,
  cnh_number           TEXT,
  cnh_category         TEXT CHECK (cnh_category IN ('A','B','C','D','E','AB','AC','AD','AE')),
  cnh_expiration_date  DATE,
  has_ear              BOOLEAN NOT NULL DEFAULT false,   -- exerce atividade remunerada
  mopp_expiration_date DATE,
  aso_expiration_date  DATE,
  status               TEXT NOT NULL DEFAULT 'ativo'
                       CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_drivers_company ON drivers (company_id);
CREATE INDEX idx_drivers_carrier ON drivers (carrier_id);
CREATE UNIQUE INDEX uq_drivers_company_cpf
  ON drivers (company_id, cpf) WHERE cpf IS NOT NULL;

CREATE TRIGGER trg_drivers_updated
  BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 5) VEHICLES — cavalos mecânicos / veículos tratores
-- =============================================================================
CREATE TABLE vehicles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  carrier_id    UUID NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
  plate         TEXT NOT NULL,
  brand         TEXT,
  model         TEXT,
  year          INTEGER CHECK (year BETWEEN 1950 AND 2100),
  renavam       TEXT,
  chassis       TEXT,
  vehicle_type  TEXT NOT NULL DEFAULT 'cavalo_mecanico'
                CHECK (vehicle_type IN ('cavalo_mecanico', 'truck', 'toco', 'vanderleia', 'outro')),
  status        TEXT NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo', 'inativo', 'manutencao', 'bloqueado')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_vehicles_company ON vehicles (company_id);
CREATE INDEX idx_vehicles_carrier ON vehicles (carrier_id);
CREATE UNIQUE INDEX uq_vehicles_company_plate ON vehicles (company_id, upper(plate));

CREATE TRIGGER trg_vehicles_updated
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 6) TRAILERS — tanques / implementos
-- =============================================================================
CREATE TABLE trailers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  carrier_id         UUID NOT NULL REFERENCES carriers (id) ON DELETE CASCADE,
  plate              TEXT NOT NULL,
  renavam            TEXT,
  chassis            TEXT,
  trailer_type       TEXT NOT NULL DEFAULT 'tanque'
                     CHECK (trailer_type IN ('tanque', 'bitrem', 'tanque_isotermico', 'implemento', 'outro')),
  total_capacity     INTEGER,                      -- capacidade total em litros
  compartments_count INTEGER DEFAULT 1,            -- número de compartimentos
  allowed_products   TEXT[],                       -- produtos permitidos (array)
  status             TEXT NOT NULL DEFAULT 'ativo'
                     CHECK (status IN ('ativo', 'inativo', 'manutencao', 'bloqueado')),
  notes              TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_trailers_company ON trailers (company_id);
CREATE INDEX idx_trailers_carrier ON trailers (carrier_id);
CREATE UNIQUE INDEX uq_trailers_company_plate ON trailers (company_id, upper(plate));

CREATE TRIGGER trg_trailers_updated
  BEFORE UPDATE ON trailers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 7) DOCUMENT_TYPES — catálogo de tipos de documento
--    entity_type indica a qual entidade o tipo se aplica.
-- =============================================================================
CREATE TABLE document_types (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  description         TEXT,
  entity_type         TEXT NOT NULL
                      CHECK (entity_type IN ('carrier','driver','vehicle','trailer','base')),
  is_required_default BOOLEAN NOT NULL DEFAULT false,  -- obrigatório por padrão
  has_expiration      BOOLEAN NOT NULL DEFAULT true,   -- controla validade?
  alert_days_before   INTEGER NOT NULL DEFAULT 30,     -- antecedência do alerta
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_document_types_entity ON document_types (entity_type);

CREATE TRIGGER trg_document_types_updated
  BEFORE UPDATE ON document_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 8) DOCUMENTS — documentos vinculados a qualquer entidade
--    Vínculo polimórfico: (entity_type, entity_id).
--    O status é calculado pela aplicação a partir de expiration_date /
--    has_expiration / alert_days_before, mas é persistido como snapshot.
-- =============================================================================
CREATE TABLE documents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  entity_type      TEXT NOT NULL
                   CHECK (entity_type IN ('carrier','driver','vehicle','trailer','base','operation')),
  entity_id        UUID NOT NULL,                  -- id da entidade vinculada
  document_type_id UUID NOT NULL REFERENCES document_types (id) ON DELETE RESTRICT,
  file_url         TEXT,
  file_name        TEXT,
  issue_date       DATE,
  expiration_date  DATE,
  status           TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('valido','a_vencer','vencido','pendente','nao_aplicavel')),
  responsible_name TEXT,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documents_company ON documents (company_id);
CREATE INDEX idx_documents_entity ON documents (entity_type, entity_id);
CREATE INDEX idx_documents_type ON documents (document_type_id);
CREATE INDEX idx_documents_expiration ON documents (expiration_date);

CREATE TRIGGER trg_documents_updated
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 9) LOADING_BASES — bases de carregamento
-- =============================================================================
CREATE TABLE loading_bases (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                    UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  name                          TEXT NOT NULL,
  operator_name                 TEXT,              -- distribuidora/operador
  city                          TEXT,
  state                         TEXT,              -- UF
  base_type                     TEXT NOT NULL DEFAULT 'primaria'
                                CHECK (base_type IN ('primaria','secundaria','terminal','outro')),
  requires_scheduling           BOOLEAN NOT NULL DEFAULT false,
  requires_integration          BOOLEAN NOT NULL DEFAULT false,
  requires_driver_registration  BOOLEAN NOT NULL DEFAULT false,
  requires_vehicle_registration BOOLEAN NOT NULL DEFAULT false,
  requires_trailer_registration BOOLEAN NOT NULL DEFAULT false,
  notes                         TEXT,
  status                        TEXT NOT NULL DEFAULT 'ativo'
                                CHECK (status IN ('ativo','inativo')),
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loading_bases_company ON loading_bases (company_id);

CREATE TRIGGER trg_loading_bases_updated
  BEFORE UPDATE ON loading_bases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 10) LOADING_BASE_REQUIREMENTS — exigências documentais por base
--     Join normalizado: (base, tipo de documento, entidade alvo).
-- =============================================================================
CREATE TABLE loading_base_requirements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  loading_base_id  UUID NOT NULL REFERENCES loading_bases (id) ON DELETE CASCADE,
  document_type_id UUID NOT NULL REFERENCES document_types (id) ON DELETE CASCADE,
  entity_type      TEXT NOT NULL
                   CHECK (entity_type IN ('carrier','driver','vehicle','trailer')),
  is_required      BOOLEAN NOT NULL DEFAULT true,
  is_blocking      BOOLEAN NOT NULL DEFAULT true,  -- bloqueia carregamento se faltar
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lbr_company ON loading_base_requirements (company_id);
CREATE INDEX idx_lbr_base ON loading_base_requirements (loading_base_id);
CREATE UNIQUE INDEX uq_lbr_base_type_entity
  ON loading_base_requirements (loading_base_id, document_type_id, entity_type);

CREATE TRIGGER trg_lbr_updated
  BEFORE UPDATE ON loading_base_requirements
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 11) OPERATIONS — consultas operacionais (conjunto avaliado)
-- =============================================================================
CREATE TABLE operations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  carrier_id       UUID REFERENCES carriers (id) ON DELETE SET NULL,
  driver_id        UUID REFERENCES drivers (id) ON DELETE SET NULL,
  vehicle_id       UUID REFERENCES vehicles (id) ON DELETE SET NULL,
  trailer_id       UUID REFERENCES trailers (id) ON DELETE SET NULL,
  loading_base_id  UUID REFERENCES loading_bases (id) ON DELETE SET NULL,
  product          TEXT,
  operation_date   DATE NOT NULL DEFAULT current_date,
  status           TEXT NOT NULL DEFAULT 'pendente'
                   CHECK (status IN ('liberado','atencao','pendente','bloqueado')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_operations_company ON operations (company_id);
CREATE INDEX idx_operations_carrier ON operations (carrier_id);
CREATE INDEX idx_operations_date ON operations (operation_date);

CREATE TRIGGER trg_operations_updated
  BEFORE UPDATE ON operations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 12) OPERATION_CHECKS — itens verificados em cada consulta
-- =============================================================================
CREATE TABLE operation_checks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id     UUID NOT NULL REFERENCES operations (id) ON DELETE CASCADE,
  entity_type      TEXT NOT NULL
                   CHECK (entity_type IN ('carrier','driver','vehicle','trailer','base')),
  entity_id        UUID,
  document_type_id UUID REFERENCES document_types (id) ON DELETE SET NULL,
  status           TEXT NOT NULL
                   CHECK (status IN ('apto','atencao','pendente','bloqueado')),
  message          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_operation_checks_operation ON operation_checks (operation_id);

-- =============================================================================
-- RELACIONAMENTOS (resumo)
--   companies 1—N users, carriers, vehicles, trailers, drivers,
--             loading_bases, documents, operations, loading_base_requirements
--   carriers  1—N drivers, vehicles, trailers
--   document_types 1—N documents, loading_base_requirements
--   loading_bases  1—N loading_base_requirements
--   operations     1—N operation_checks
--   documents.(entity_type, entity_id) -> vínculo polimórfico
-- =============================================================================

-- =============================================================================
-- MULTI-TENANT / RLS (Row Level Security) — pronto para ativar no futuro.
-- Estratégia: o app define a empresa do contexto em uma GUC
--   SET app.current_company_id = '<uuid>';
-- e as políticas restringem cada linha à empresa corrente.
-- Descomente para habilitar (ex.: Supabase / Postgres gerenciado).
-- -----------------------------------------------------------------------------
-- DO $$
-- DECLARE t TEXT;
-- BEGIN
--   FOREACH t IN ARRAY ARRAY[
--     'users','carriers','drivers','vehicles','trailers','documents',
--     'loading_bases','loading_base_requirements','operations'
--   ] LOOP
--     EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
--     EXECUTE format($f$
--       CREATE POLICY tenant_isolation ON %I
--       USING (company_id = current_setting('app.current_company_id', true)::uuid)
--       WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);
--     $f$, t);
--   END LOOP;
-- END $$;
-- operation_checks herda o escopo via operation_id -> operations.company_id.
