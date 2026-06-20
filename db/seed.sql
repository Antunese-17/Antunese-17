-- =============================================================================
-- Gestão Documental de Frota — Dados de demonstração (PostgreSQL)
-- Execute após schema.sql.  Datas calibradas para referência 2026-06-20.
-- Usa subqueries por chave natural para resolver FKs (sem UUID hardcoded).
-- =============================================================================

-- Marcador de hash de senha para a demonstração (substituir por crypt() real).
CREATE OR REPLACE FUNCTION crypt_placeholder(plain TEXT)
RETURNS TEXT AS $$
  SELECT '$2a$06$demoHashPlaceholderDemoHashPlaceholderDe';
$$ LANGUAGE sql IMMUTABLE;

-- ---- COMPANIES ----
INSERT INTO companies (name, trade_name, cnpj, email, phone, status) VALUES
  ('Atual Via Petro Distribuidora Ltda', 'Atual Via Petro', '12.345.678/0001-90', 'contato@atualviapetro.com.br', '(16) 3500-1000', 'ativo'),
  ('Petro Sul Distribuidora S.A.', 'Petro Sul', '98.765.432/0001-10', 'contato@petrosul.com.br', '(41) 3300-2000', 'ativo');

-- ---- USERS ----
INSERT INTO users (company_id, name, email, password_hash, role, status)
SELECT id, 'Administrador', 'admin@atualviapetro.com.br', crypt_placeholder('demo'), 'admin', 'ativo' FROM companies WHERE trade_name = 'Atual Via Petro'
UNION ALL
SELECT id, 'Carla Documentação', 'carla@atualviapetro.com.br', crypt_placeholder('demo'), 'operador', 'ativo' FROM companies WHERE trade_name = 'Atual Via Petro'
UNION ALL
SELECT id, 'Marcos Souza', 'marcos@petrosul.com.br', crypt_placeholder('demo'), 'admin', 'ativo' FROM companies WHERE trade_name = 'Petro Sul';
-- Obs.: substitua crypt_placeholder() por um hash real (ex.: crypt('senha', gen_salt('bf'))).

-- ---- CARRIERS ----
INSERT INTO carriers (company_id, legal_name, trade_name, cnpj, state_registration, phone, email, responsible_name, carrier_type, status)
SELECT c.id, v.legal_name, v.trade_name, v.cnpj, v.ie, v.phone, v.email, v.resp, v.ctype, 'ativo'
FROM companies c
CROSS JOIN (VALUES
  ('Atual Via Petro', 'Transportes Rodoluz Ltda',      'Rodoluz',  '10.111.222/0001-33', '111.222.333.444', '(16) 99888-1010', 'op@rodoluz.com.br',  'José Coordenador', 'terceiro'),
  ('Atual Via Petro', 'Log Sul Transportes Ltda',      'Log Sul',  '20.222.333/0001-44', '222.333.444.555', '(16) 99777-2020', 'op@logsul.com.br',   'Marina Gestora',   'terceiro'),
  ('Atual Via Petro', 'Via Norte Cargas Ltda',         'Via Norte','30.333.444/0001-55', '333.444.555.666', '(16) 99666-3030', 'op@vianorte.com.br', 'Carlos Supervisor','agregado'),
  ('Petro Sul',       'Sul Combustíveis Transp. Ltda', 'Sul Comb.','40.444.555/0001-66', '444.555.666.777', '(41) 99555-4040', 'op@sulcomb.com.br',  'Edson Responsável','propria')
) AS v(company, legal_name, trade_name, cnpj, ie, phone, email, resp, ctype)
WHERE c.trade_name = v.company;

-- ---- DRIVERS ----
INSERT INTO drivers (company_id, carrier_id, full_name, cpf, rg, phone, cnh_number, cnh_category, cnh_expiration_date, has_ear, mopp_expiration_date, aso_expiration_date, status)
SELECT ca.company_id, ca.id, v.full_name, v.cpf, v.rg, v.phone, v.cnh, v.cat, v.cnh_exp::date, v.ear, v.mopp_exp::date, v.aso_exp::date, 'ativo'
FROM carriers ca
JOIN (VALUES
  ('Rodoluz',  'José Almeida',     '111.222.333-44', '12.345.678-9', '(16) 98000-0001', '01234567890', 'E', '2027-01-10', true, '2029-03-01', '2026-07-01'),
  ('Rodoluz',  'Antônio Pereira',  '222.333.444-55', '23.456.789-0', '(16) 98000-0002', '02345678901', 'E', '2026-05-20', true, '2028-01-10', '2026-09-01'),
  ('Log Sul',  'Roberto Lima',     '333.444.555-66', '34.567.890-1', '(16) 98000-0003', '03456789012', 'E', '2028-08-01', true, '2029-09-01', '2027-02-01'),
  ('Log Sul',  'Sérgio Tavares',   '444.555.666-77', '45.678.901-2', '(16) 98000-0004', '04567890123', 'E', '2027-11-01', true, '2029-04-01', NULL),
  ('Via Norte','Paulo Henrique',   '555.666.777-88', '56.789.012-3', '(16) 98000-0005', '05678901234', 'D', '2029-01-01', true, NULL,         '2027-01-10'),
  ('Sul Comb.','Edson Ramos',      '666.777.888-99', '67.890.123-4', '(41) 98000-0006', '06789012345', 'E', '2028-03-01', true, '2030-01-01', '2027-03-01')
) AS v(carrier, full_name, cpf, rg, phone, cnh, cat, cnh_exp, ear, mopp_exp, aso_exp)
  ON ca.trade_name = v.carrier;

-- ---- VEHICLES ----
INSERT INTO vehicles (company_id, carrier_id, plate, brand, model, year, renavam, chassis, vehicle_type, status)
SELECT ca.company_id, ca.id, v.plate, v.brand, v.model, v.yr, v.renavam, v.chassis, 'cavalo_mecanico', 'ativo'
FROM carriers ca
JOIN (VALUES
  ('Rodoluz',  'RDL1A23', 'Scania',        'R450',        2021, '00112233445', '9BS00000000000001'),
  ('Rodoluz',  'RDL2B34', 'Volvo',         'FH460',       2019, '00223344556', '9BS00000000000002'),
  ('Log Sul',  'LGS3C45', 'Mercedes-Benz', 'Actros 2546', 2022, '00334455667', '9BS00000000000003'),
  ('Log Sul',  'LGS4D56', 'DAF',           'XF 480',      2018, '00445566778', '9BS00000000000004'),
  ('Via Norte','VNC5E67', 'Iveco',         'Hi-Way 440',  2020, '00556677889', '9BS00000000000005'),
  ('Sul Comb.','SCT6F78', 'Scania',        'R500',        2023, '00667788990', '9BS00000000000006')
) AS v(carrier, plate, brand, model, yr, renavam, chassis)
  ON ca.trade_name = v.carrier;

-- ---- TRAILERS ----
INSERT INTO trailers (company_id, carrier_id, plate, renavam, chassis, trailer_type, total_capacity, compartments_count, allowed_products, status)
SELECT ca.company_id, ca.id, v.plate, v.renavam, v.chassis, 'tanque', v.cap, v.comp, v.prods, 'ativo'
FROM carriers ca
JOIN (VALUES
  ('Rodoluz',  'RDL7G89', '10112233445', '9BT00000000000001', 30000, 4, ARRAY['Óleo Diesel S10','Óleo Diesel S500']),
  ('Rodoluz',  'RDL8H90', '10223344556', '9BT00000000000002', 45000, 6, ARRAY['Gasolina Comum','Etanol Hidratado']),
  ('Log Sul',  'LGS9I01', '10334455667', '9BT00000000000003', 30000, 4, ARRAY['Óleo Diesel S10']),
  ('Log Sul',  'LGS1J12', '10445566778', '9BT00000000000004', 20000, 3, ARRAY['Querosene']),
  ('Via Norte','VNC2K23', '10556677889', '9BT00000000000005', 45000, 6, ARRAY['Gasolina Comum']),
  ('Sul Comb.','SCT3L34', '10667788990', '9BT00000000000006', 30000, 4, ARRAY['Óleo Diesel S10'])
) AS v(carrier, plate, renavam, chassis, cap, comp, prods)
  ON ca.trade_name = v.carrier;

-- ---- DOCUMENT_TYPES (catálogo global) ----
INSERT INTO document_types (name, description, entity_type, is_required_default, has_expiration, alert_days_before) VALUES
  ('Licença de Operação (IBAMA)',       'Licença ambiental de operação',                 'carrier', true,  true, 30),
  ('Cadastro ANP / TRR',                'Registro como TRR junto à ANP',                 'carrier', true,  true, 45),
  ('RNTRC / ANTT',                      'Registro Nacional de Transportadores',          'carrier', true,  true, 30),
  ('Alvará de Funcionamento',           'Alvará municipal',                              'carrier', false, true, 30),
  ('Seguro RCTR-C / Ambiental',         'Seguro de responsabilidade civil/ambiental',    'carrier', false, true, 30),
  ('CNH',                               'Carteira Nacional de Habilitação',              'driver',  true,  true, 30),
  ('Curso MOPP',                        'Movimentação Operacional de Produtos Perigosos','driver',  true,  true, 30),
  ('ASO (Atestado Saúde Ocupacional)',  'Atestado de saúde ocupacional',                 'driver',  true,  true, 30),
  ('Toxicológico',                      'Exame toxicológico',                            'driver',  false, true, 60),
  ('CRLV (Veículo)',                    'Certificado de Registro e Licenciamento',       'vehicle', true,  true, 30),
  ('CIPP (Veículo)',                    'Certificado de Inspeção p/ Produtos Perigosos', 'vehicle', true,  true, 30),
  ('CRLV (Tanque)',                     'Certificado de Registro e Licenciamento',       'trailer', true,  true, 30),
  ('CIV (Inspeção Veicular)',           'Certificado de Inspeção Veicular',              'trailer', true,  true, 30),
  ('CIPP (Tanque)',                     'Certificado de Inspeção p/ Produtos Perigosos', 'trailer', false, true, 30),
  ('Teste Hidrostático',                'Teste hidrostático do tanque',                  'trailer', false, true, 60),
  ('Calibração de Tanque',              'Aferição/calibração do tanque',                 'trailer', false, true, 60);

-- ---- DOCUMENTS (amostra: válidos, a vencer e vencidos) ----
-- Transportadoras
INSERT INTO documents (company_id, entity_type, entity_id, document_type_id, file_name, issue_date, expiration_date, status, responsible_name)
SELECT ca.company_id, 'carrier', ca.id, dt.id, v.fname, v.issue::date, v.exp::date, v.st, 'Setor Documental'
FROM carriers ca
JOIN (VALUES
  ('Rodoluz',  'Licença de Operação (IBAMA)', 'LO-2025-8841.pdf',     '2025-09-01', '2026-09-01', 'valido'),
  ('Rodoluz',  'Cadastro ANP / TRR',          'ANP-TRR-1122.pdf',     '2025-08-15', '2026-08-15', 'valido'),
  ('Rodoluz',  'RNTRC / ANTT',                'RNTRC-11223344.pdf',   '2025-06-01', '2026-06-01', 'vencido'),
  ('Rodoluz',  'Seguro RCTR-C / Ambiental',   'SEG-RC-7781.pdf',      '2025-07-05', '2026-07-05', 'a_vencer'),
  ('Log Sul',  'Licença de Operação (IBAMA)', 'LO-2025-2299.pdf',     '2025-10-10', '2026-10-10', 'valido'),
  ('Log Sul',  'Cadastro ANP / TRR',          'ANP-TRR-3398.pdf',     '2025-11-20', '2026-11-20', 'valido'),
  ('Log Sul',  'RNTRC / ANTT',                'RNTRC-22334455.pdf',   '2025-12-01', '2026-12-01', 'valido'),
  ('Via Norte','Licença de Operação (IBAMA)', 'LO-2025-7712.pdf',     '2025-04-01', '2026-04-01', 'vencido'),
  ('Via Norte','RNTRC / ANTT',                'RNTRC-33445566.pdf',   '2026-01-10', '2027-01-10', 'valido'),
  ('Sul Comb.','Cadastro ANP / TRR',          'ANP-TRR-9981.pdf',     '2026-01-15', '2027-01-15', 'valido'),
  ('Sul Comb.','RNTRC / ANTT',                'RNTRC-44556677.pdf',   '2026-03-01', '2027-03-01', 'valido')
) AS v(carrier, dtype, fname, issue, exp, st)
  ON ca.trade_name = v.carrier
JOIN document_types dt ON dt.name = v.dtype AND dt.entity_type = 'carrier';

-- Motoristas
INSERT INTO documents (company_id, entity_type, entity_id, document_type_id, file_name, issue_date, expiration_date, status, responsible_name)
SELECT d.company_id, 'driver', d.id, dt.id, v.fname, v.issue::date, v.exp::date, v.st, 'Setor Documental'
FROM drivers d
JOIN (VALUES
  ('José Almeida',    'CNH',                              'CNH-01234567890.pdf', '2022-01-10', '2027-01-10', 'valido'),
  ('José Almeida',    'Curso MOPP',                       'MOPP-7781.pdf',       '2024-03-01', '2029-03-01', 'valido'),
  ('José Almeida',    'ASO (Atestado Saúde Ocupacional)', 'ASO-2025-110.pdf',    '2025-07-01', '2026-07-01', 'a_vencer'),
  ('Antônio Pereira', 'CNH',                              'CNH-02345678901.pdf', '2021-05-20', '2026-05-20', 'vencido'),
  ('Antônio Pereira', 'Curso MOPP',                       'MOPP-7782.pdf',       '2023-01-10', '2028-01-10', 'valido'),
  ('Antônio Pereira', 'ASO (Atestado Saúde Ocupacional)', 'ASO-2025-118.pdf',    '2025-09-01', '2026-09-01', 'valido'),
  ('Roberto Lima',    'CNH',                              'CNH-03456789012.pdf', '2023-08-01', '2028-08-01', 'valido'),
  ('Roberto Lima',    'Curso MOPP',                       'MOPP-7783.pdf',       '2024-09-01', '2029-09-01', 'valido'),
  ('Roberto Lima',    'ASO (Atestado Saúde Ocupacional)', 'ASO-2026-004.pdf',    '2026-02-01', '2027-02-01', 'valido'),
  ('Sérgio Tavares',  'CNH',                              'CNH-04567890123.pdf', '2022-11-01', '2027-11-01', 'valido'),
  ('Sérgio Tavares',  'Curso MOPP',                       'MOPP-7784.pdf',       '2024-04-01', '2029-04-01', 'valido')
) AS v(driver, dtype, fname, issue, exp, st)
  ON d.full_name = v.driver
JOIN document_types dt ON dt.name = v.dtype AND dt.entity_type = 'driver';

-- Veículos
INSERT INTO documents (company_id, entity_type, entity_id, document_type_id, file_name, issue_date, expiration_date, status, responsible_name)
SELECT ve.company_id, 'vehicle', ve.id, dt.id, v.fname, v.issue::date, v.exp::date, v.st, 'Setor Documental'
FROM vehicles ve
JOIN (VALUES
  ('RDL1A23', 'CRLV (Veículo)', 'CRLV-2026-001.pdf', '2026-01-05', '2026-12-31', 'valido'),
  ('RDL1A23', 'CIPP (Veículo)', 'CIPP-7741.pdf',     '2025-08-01', '2026-08-01', 'valido'),
  ('RDL2B34', 'CRLV (Veículo)', 'CRLV-2026-002.pdf', '2026-01-05', '2026-12-31', 'valido'),
  ('RDL2B34', 'CIPP (Veículo)', 'CIPP-7742.pdf',     '2025-05-01', '2026-05-01', 'vencido'),
  ('LGS3C45', 'CRLV (Veículo)', 'CRLV-2026-003.pdf', '2026-02-01', '2026-12-31', 'valido'),
  ('LGS3C45', 'CIPP (Veículo)', 'CIPP-7743.pdf',     '2025-11-01', '2026-11-01', 'valido'),
  ('LGS4D56', 'CRLV (Veículo)', 'CRLV-2026-004.pdf', '2026-01-20', '2026-12-31', 'valido'),
  ('LGS4D56', 'CIPP (Veículo)', 'CIPP-7744.pdf',     '2025-07-10', '2026-07-10', 'a_vencer'),
  ('VNC5E67', 'CRLV (Veículo)', 'CRLV-2026-005.pdf', '2026-02-15', '2026-12-31', 'valido'),
  ('VNC5E67', 'CIPP (Veículo)', 'CIPP-7745.pdf',     '2025-12-01', '2026-12-01', 'valido'),
  ('SCT6F78', 'CRLV (Veículo)', 'CRLV-2026-006.pdf', '2026-03-01', '2026-12-31', 'valido'),
  ('SCT6F78', 'CIPP (Veículo)', 'CIPP-7746.pdf',     '2026-01-15', '2027-01-15', 'valido')
) AS v(plate, dtype, fname, issue, exp, st)
  ON upper(ve.plate) = v.plate
JOIN document_types dt ON dt.name = v.dtype AND dt.entity_type = 'vehicle';

-- Tanques
INSERT INTO documents (company_id, entity_type, entity_id, document_type_id, file_name, issue_date, expiration_date, status, responsible_name)
SELECT tr.company_id, 'trailer', tr.id, dt.id, v.fname, v.issue::date, v.exp::date, v.st, 'Setor Documental'
FROM trailers tr
JOIN (VALUES
  ('RDL7G89', 'CRLV (Tanque)',      'CRLV-T-001.pdf', '2026-01-05', '2026-12-31', 'valido'),
  ('RDL7G89', 'CIV (Inspeção Veicular)', 'CIV-7701.pdf','2025-07-01', '2026-07-01', 'a_vencer'),
  ('RDL7G89', 'Teste Hidrostático', 'TH-9901.pdf',    '2023-04-01', '2028-04-01', 'valido'),
  ('RDL8H90', 'CRLV (Tanque)',      'CRLV-T-002.pdf', '2026-01-05', '2026-12-31', 'valido'),
  ('RDL8H90', 'CIV (Inspeção Veicular)', 'CIV-7702.pdf','2025-03-01', '2026-03-01', 'vencido'),
  ('LGS9I01', 'CRLV (Tanque)',      'CRLV-T-003.pdf', '2026-02-01', '2026-12-31', 'valido'),
  ('LGS9I01', 'CIV (Inspeção Veicular)', 'CIV-7703.pdf','2025-10-01', '2026-10-01', 'valido'),
  ('LGS1J12', 'CRLV (Tanque)',      'CRLV-T-004.pdf', '2026-01-10', '2026-12-31', 'valido'),
  ('LGS1J12', 'CIV (Inspeção Veicular)', 'CIV-7704.pdf','2025-06-01', '2026-06-01', 'vencido'),
  ('VNC2K23', 'CRLV (Tanque)',      'CRLV-T-005.pdf', '2026-02-10', '2026-12-31', 'valido'),
  ('VNC2K23', 'CIV (Inspeção Veicular)', 'CIV-7705.pdf','2025-12-01', '2026-12-01', 'valido'),
  ('SCT3L34', 'CRLV (Tanque)',      'CRLV-T-006.pdf', '2026-03-05', '2026-12-31', 'valido'),
  ('SCT3L34', 'CIV (Inspeção Veicular)', 'CIV-7706.pdf','2026-01-20', '2027-01-20', 'valido')
) AS v(plate, dtype, fname, issue, exp, st)
  ON upper(tr.plate) = v.plate
JOIN document_types dt ON dt.name = v.dtype AND dt.entity_type = 'trailer';

-- ---- LOADING_BASES ----
INSERT INTO loading_bases (company_id, name, operator_name, city, state, base_type, requires_scheduling, requires_integration, requires_driver_registration, requires_vehicle_registration, requires_trailer_registration, status)
SELECT c.id, v.name, v.op, v.city, v.uf, v.btype, v.sched, v.integ, v.drv, v.veh, v.trl, 'ativo'
FROM companies c
JOIN (VALUES
  ('Atual Via Petro', 'Base Paulínia — Vibra',          'Vibra Energia', 'Paulínia',        'SP', 'primaria',  true,  true,  true,  true,  true),
  ('Atual Via Petro', 'Base Ribeirão Preto — Ipiranga', 'Ipiranga',      'Ribeirão Preto',  'SP', 'secundaria',true,  false, true,  true,  false),
  ('Petro Sul',       'Base Araucária — Raízen',        'Raízen',        'Araucária',       'PR', 'primaria',  true,  true,  true,  false, true),
  ('Petro Sul',       'Base Senador Canedo — Vibra',    'Vibra Energia', 'Senador Canedo',  'GO', 'terminal',  false, false, true,  false, false)
) AS v(company, name, op, city, uf, btype, sched, integ, drv, veh, trl)
  ON c.trade_name = v.company;

-- ---- LOADING_BASE_REQUIREMENTS (exigências por base) ----
INSERT INTO loading_base_requirements (company_id, loading_base_id, document_type_id, entity_type, is_required, is_blocking, notes)
SELECT lb.company_id, lb.id, dt.id, dt.entity_type, true, v.blocking, v.notes
FROM loading_bases lb
JOIN (VALUES
  ('Base Paulínia — Vibra',          'RNTRC / ANTT',                       true,  'Obrigatório vigente'),
  ('Base Paulínia — Vibra',          'CIPP (Veículo)',                     true,  'Inspeção obrigatória'),
  ('Base Paulínia — Vibra',          'Curso MOPP',                         true,  'Motorista habilitado'),
  ('Base Paulínia — Vibra',          'ASO (Atestado Saúde Ocupacional)',   true,  NULL),
  ('Base Paulínia — Vibra',          'Calibração de Tanque',               false, 'Recomendado'),
  ('Base Ribeirão Preto — Ipiranga', 'RNTRC / ANTT',                       true,  NULL),
  ('Base Ribeirão Preto — Ipiranga', 'CRLV (Veículo)',                     true,  NULL),
  ('Base Ribeirão Preto — Ipiranga', 'CIV (Inspeção Veicular)',            true,  NULL),
  ('Base Ribeirão Preto — Ipiranga', 'Curso MOPP',                         true,  NULL),
  ('Base Araucária — Raízen',        'RNTRC / ANTT',                       true,  NULL),
  ('Base Araucária — Raízen',        'CIPP (Veículo)',                     true,  NULL),
  ('Base Araucária — Raízen',        'Curso MOPP',                         true,  NULL),
  ('Base Araucária — Raízen',        'Toxicológico',                       true,  'Exige toxicológico vigente'),
  ('Base Senador Canedo — Vibra',    'RNTRC / ANTT',                       true,  NULL),
  ('Base Senador Canedo — Vibra',    'CRLV (Veículo)',                     true,  NULL),
  ('Base Senador Canedo — Vibra',    'Curso MOPP',                         true,  NULL)
) AS v(base, dtype, blocking, notes)
  ON lb.name = v.base
JOIN document_types dt ON dt.name = v.dtype;

-- ---- OPERATIONS + OPERATION_CHECKS (consulta de exemplo) ----
WITH op AS (
  INSERT INTO operations (company_id, carrier_id, driver_id, vehicle_id, trailer_id, loading_base_id, product, operation_date, status, notes)
  SELECT ca.company_id, ca.id, d.id, ve.id, tr.id, lb.id, 'Óleo Diesel S10', DATE '2026-06-20', 'bloqueado',
         'Consulta de exemplo: RNTRC da transportadora vencido.'
  FROM carriers ca
  JOIN drivers  d  ON d.full_name = 'José Almeida'
  JOIN vehicles ve ON upper(ve.plate) = 'RDL1A23'
  JOIN trailers tr ON upper(tr.plate) = 'RDL7G89'
  JOIN loading_bases lb ON lb.name = 'Base Ribeirão Preto — Ipiranga'
  WHERE ca.trade_name = 'Rodoluz'
  RETURNING id, carrier_id, driver_id, vehicle_id, trailer_id
)
INSERT INTO operation_checks (operation_id, entity_type, entity_id, status, message)
SELECT op.id, 'carrier', op.carrier_id, 'bloqueado', 'RNTRC vencido.' FROM op
UNION ALL SELECT op.id, 'driver',  op.driver_id,  'apto',    'Documentação em dia.' FROM op
UNION ALL SELECT op.id, 'vehicle', op.vehicle_id, 'apto',    'CRLV e CIPP vigentes.' FROM op
UNION ALL SELECT op.id, 'trailer', op.trailer_id, 'atencao', 'CIV próxima do vencimento.' FROM op;

-- =============================================================================
-- Nota: a função crypt_placeholder() acima é apenas um marcador para o seed.
-- Em produção, gere o hash com pgcrypto:
--   password_hash = crypt('senha', gen_salt('bf'))
-- e remova a definição abaixo.
-- =============================================================================
