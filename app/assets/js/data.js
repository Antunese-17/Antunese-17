/* =========================================================================
   Gestão Documental de Frota — Base de dados mockada (demonstração)
   Alinhada ao esquema relacional em /db/schema.sql (modelagem multiempresa).
   Data de referência da aplicação: 2026-06-20
   ========================================================================= */
(function () {
  "use strict";

  // ---- COMPANIES ----
  const companies = [
    { id: "co-1", name: "Atual Via Petro Distribuidora Ltda", trade_name: "Atual Via Petro", cnpj: "12.345.678/0001-90", email: "contato@atualviapetro.com.br", phone: "(16) 3500-1000", status: "ativo" },
    { id: "co-2", name: "Petro Sul Distribuidora S.A.", trade_name: "Petro Sul", cnpj: "98.765.432/0001-10", email: "contato@petrosul.com.br", phone: "(41) 3300-2000", status: "ativo" }
  ];

  // ---- USERS ----
  const users = [
    { id: "u-1", company_id: "co-1", name: "Administrador", email: "admin@atualviapetro.com.br", password_hash: "demo", role: "admin", status: "ativo" },
    { id: "u-2", company_id: "co-1", name: "Carla Documentação", email: "carla@atualviapetro.com.br", password_hash: "demo", role: "operador", status: "ativo" },
    { id: "u-3", company_id: "co-2", name: "Marcos Souza", email: "marcos@petrosul.com.br", password_hash: "demo", role: "admin", status: "ativo" }
  ];

  // ---- CARRIERS (transportadoras) ----
  const carriers = [
    { id: "ca-1", company_id: "co-1", legal_name: "Transportes Rodoluz Ltda", trade_name: "Rodoluz", cnpj: "10.111.222/0001-33", state_registration: "111.222.333.444", phone: "(16) 99888-1010", email: "op@rodoluz.com.br", responsible_name: "José Coordenador", carrier_type: "terceiro", status: "ativo", notes: "" },
    { id: "ca-2", company_id: "co-1", legal_name: "Log Sul Transportes Ltda", trade_name: "Log Sul", cnpj: "20.222.333/0001-44", state_registration: "222.333.444.555", phone: "(16) 99777-2020", email: "op@logsul.com.br", responsible_name: "Marina Gestora", carrier_type: "terceiro", status: "ativo", notes: "" },
    { id: "ca-3", company_id: "co-1", legal_name: "Via Norte Cargas Ltda", trade_name: "Via Norte", cnpj: "30.333.444/0001-55", state_registration: "333.444.555.666", phone: "(16) 99666-3030", email: "op@vianorte.com.br", responsible_name: "Carlos Supervisor", carrier_type: "agregado", status: "ativo", notes: "" },
    { id: "ca-4", company_id: "co-2", legal_name: "Sul Combustíveis Transp. Ltda", trade_name: "Sul Comb.", cnpj: "40.444.555/0001-66", state_registration: "444.555.666.777", phone: "(41) 99555-4040", email: "op@sulcomb.com.br", responsible_name: "Edson Responsável", carrier_type: "propria", status: "ativo", notes: "" }
  ];

  // ---- DRIVERS (motoristas) ----
  const drivers = [
    { id: "dr-1", company_id: "co-1", carrier_id: "ca-1", full_name: "José Almeida", cpf: "111.222.333-44", rg: "12.345.678-9", phone: "(16) 98000-0001", email: "", cnh_number: "01234567890", cnh_category: "E", cnh_expiration_date: "2027-01-10", has_ear: true, mopp_expiration_date: "2029-03-01", aso_expiration_date: "2026-07-01", status: "ativo", notes: "" },
    { id: "dr-2", company_id: "co-1", carrier_id: "ca-1", full_name: "Antônio Pereira", cpf: "222.333.444-55", rg: "23.456.789-0", phone: "(16) 98000-0002", email: "", cnh_number: "02345678901", cnh_category: "E", cnh_expiration_date: "2026-05-20", has_ear: true, mopp_expiration_date: "2028-01-10", aso_expiration_date: "2026-09-01", status: "ativo", notes: "" },
    { id: "dr-3", company_id: "co-1", carrier_id: "ca-2", full_name: "Roberto Lima", cpf: "333.444.555-66", rg: "34.567.890-1", phone: "(16) 98000-0003", email: "", cnh_number: "03456789012", cnh_category: "E", cnh_expiration_date: "2028-08-01", has_ear: true, mopp_expiration_date: "2029-09-01", aso_expiration_date: "2027-02-01", status: "ativo", notes: "" },
    { id: "dr-4", company_id: "co-1", carrier_id: "ca-2", full_name: "Sérgio Tavares", cpf: "444.555.666-77", rg: "45.678.901-2", phone: "(16) 98000-0004", email: "", cnh_number: "04567890123", cnh_category: "E", cnh_expiration_date: "2027-11-01", has_ear: true, mopp_expiration_date: "2029-04-01", aso_expiration_date: null, status: "ativo", notes: "Sem ASO cadastrado." },
    { id: "dr-5", company_id: "co-1", carrier_id: "ca-3", full_name: "Paulo Henrique", cpf: "555.666.777-88", rg: "56.789.012-3", phone: "(16) 98000-0005", email: "", cnh_number: "05678901234", cnh_category: "D", cnh_expiration_date: "2029-01-01", has_ear: true, mopp_expiration_date: null, aso_expiration_date: "2027-01-10", status: "ativo", notes: "" },
    { id: "dr-6", company_id: "co-2", carrier_id: "ca-4", full_name: "Edson Ramos", cpf: "666.777.888-99", rg: "67.890.123-4", phone: "(41) 98000-0006", email: "", cnh_number: "06789012345", cnh_category: "E", cnh_expiration_date: "2028-03-01", has_ear: true, mopp_expiration_date: "2030-01-01", aso_expiration_date: "2027-03-01", status: "ativo", notes: "" }
  ];

  // ---- VEHICLES (cavalos mecânicos) ----
  const vehicles = [
    { id: "ve-1", company_id: "co-1", carrier_id: "ca-1", plate: "RDL1A23", brand: "Scania", model: "R450", year: 2021, renavam: "00112233445", chassis: "9BS00000000000001", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" },
    { id: "ve-2", company_id: "co-1", carrier_id: "ca-1", plate: "RDL2B34", brand: "Volvo", model: "FH460", year: 2019, renavam: "00223344556", chassis: "9BS00000000000002", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" },
    { id: "ve-3", company_id: "co-1", carrier_id: "ca-2", plate: "LGS3C45", brand: "Mercedes-Benz", model: "Actros 2546", year: 2022, renavam: "00334455667", chassis: "9BS00000000000003", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" },
    { id: "ve-4", company_id: "co-1", carrier_id: "ca-2", plate: "LGS4D56", brand: "DAF", model: "XF 480", year: 2018, renavam: "00445566778", chassis: "9BS00000000000004", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" },
    { id: "ve-5", company_id: "co-1", carrier_id: "ca-3", plate: "VNC5E67", brand: "Iveco", model: "Hi-Way 440", year: 2020, renavam: "00556677889", chassis: "9BS00000000000005", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" },
    { id: "ve-6", company_id: "co-2", carrier_id: "ca-4", plate: "SCT6F78", brand: "Scania", model: "R500", year: 2023, renavam: "00667788990", chassis: "9BS00000000000006", vehicle_type: "cavalo_mecanico", status: "ativo", notes: "" }
  ];

  // ---- TRAILERS (tanques / implementos) ----
  const trailers = [
    { id: "tr-1", company_id: "co-1", carrier_id: "ca-1", plate: "RDL7G89", renavam: "10112233445", chassis: "9BT00000000000001", trailer_type: "tanque", total_capacity: 30000, compartments_count: 4, allowed_products: ["Óleo Diesel S10", "Óleo Diesel S500"], status: "ativo", notes: "" },
    { id: "tr-2", company_id: "co-1", carrier_id: "ca-1", plate: "RDL8H90", renavam: "10223344556", chassis: "9BT00000000000002", trailer_type: "tanque", total_capacity: 45000, compartments_count: 6, allowed_products: ["Gasolina Comum", "Etanol Hidratado"], status: "ativo", notes: "" },
    { id: "tr-3", company_id: "co-1", carrier_id: "ca-2", plate: "LGS9I01", renavam: "10334455667", chassis: "9BT00000000000003", trailer_type: "tanque", total_capacity: 30000, compartments_count: 4, allowed_products: ["Óleo Diesel S10"], status: "ativo", notes: "" },
    { id: "tr-4", company_id: "co-1", carrier_id: "ca-2", plate: "LGS1J12", renavam: "10445566778", chassis: "9BT00000000000004", trailer_type: "tanque", total_capacity: 20000, compartments_count: 3, allowed_products: ["Querosene"], status: "ativo", notes: "" },
    { id: "tr-5", company_id: "co-1", carrier_id: "ca-3", plate: "VNC2K23", renavam: "10556677889", chassis: "9BT00000000000005", trailer_type: "tanque", total_capacity: 45000, compartments_count: 6, allowed_products: ["Gasolina Comum"], status: "ativo", notes: "" },
    { id: "tr-6", company_id: "co-2", carrier_id: "ca-4", plate: "SCT3L34", renavam: "10667788990", chassis: "9BT00000000000006", trailer_type: "tanque", total_capacity: 30000, compartments_count: 4, allowed_products: ["Óleo Diesel S10"], status: "ativo", notes: "" }
  ];

  // ---- DOCUMENT TYPES (catálogo) ----
  const document_types = [
    { id: "dt-1",  name: "Licença de Operação (IBAMA)",      description: "Licença ambiental de operação",                  entity_type: "carrier", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-2",  name: "Cadastro ANP / TRR",               description: "Registro como TRR junto à ANP",                  entity_type: "carrier", is_required_default: true,  has_expiration: true, alert_days_before: 45 },
    { id: "dt-3",  name: "RNTRC / ANTT",                     description: "Registro Nacional de Transportadores",           entity_type: "carrier", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-4",  name: "Alvará de Funcionamento",          description: "Alvará municipal",                               entity_type: "carrier", is_required_default: false, has_expiration: true, alert_days_before: 30 },
    { id: "dt-5",  name: "Seguro RCTR-C / Ambiental",        description: "Seguro de responsabilidade civil/ambiental",     entity_type: "carrier", is_required_default: false, has_expiration: true, alert_days_before: 30 },
    { id: "dt-6",  name: "CNH",                              description: "Carteira Nacional de Habilitação",               entity_type: "driver",  is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-7",  name: "Curso MOPP",                       description: "Movimentação de Produtos Perigosos",             entity_type: "driver",  is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-8",  name: "ASO (Atestado Saúde Ocupacional)", description: "Atestado de saúde ocupacional",                  entity_type: "driver",  is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-9",  name: "Toxicológico",                     description: "Exame toxicológico",                             entity_type: "driver",  is_required_default: false, has_expiration: true, alert_days_before: 60 },
    { id: "dt-10", name: "CRLV (Veículo)",                   description: "Certificado de Registro e Licenciamento",        entity_type: "vehicle", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-11", name: "CIPP (Veículo)",                   description: "Certificado de Inspeção p/ Produtos Perigosos",  entity_type: "vehicle", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-12", name: "CRLV (Tanque)",                    description: "Certificado de Registro e Licenciamento",        entity_type: "trailer", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-13", name: "CIV (Inspeção Veicular)",          description: "Certificado de Inspeção Veicular",               entity_type: "trailer", is_required_default: true,  has_expiration: true, alert_days_before: 30 },
    { id: "dt-14", name: "CIPP (Tanque)",                    description: "Certificado de Inspeção p/ Produtos Perigosos",  entity_type: "trailer", is_required_default: false, has_expiration: true, alert_days_before: 30 },
    { id: "dt-15", name: "Teste Hidrostático",              description: "Teste hidrostático do tanque",                   entity_type: "trailer", is_required_default: false, has_expiration: true, alert_days_before: 60 },
    { id: "dt-16", name: "Calibração de Tanque",            description: "Aferição/calibração do tanque",                  entity_type: "trailer", is_required_default: false, has_expiration: true, alert_days_before: 60 }
  ];

  // ---- DOCUMENTS ----
  // status é recalculado pela aplicação a partir de expiration_date; o valor
  // aqui é apenas um snapshot. status "nao_aplicavel" força N/A.
  function doc(company_id, entity_type, entity_id, document_type_id, file_name, issue_date, expiration_date) {
    return { company_id, entity_type, entity_id, document_type_id, file_url: "#", file_name, issue_date, expiration_date, status: null, responsible_name: "Setor Documental", notes: "" };
  }
  const documents = [
    // Transportadoras
    doc("co-1", "carrier", "ca-1", "dt-1", "LO-2025-8841.pdf", "2025-09-01", "2026-09-01"),
    doc("co-1", "carrier", "ca-1", "dt-2", "ANP-TRR-1122.pdf", "2025-08-15", "2026-08-15"),
    doc("co-1", "carrier", "ca-1", "dt-3", "RNTRC-11223344.pdf", "2025-06-01", "2026-06-01"), // vencido
    doc("co-1", "carrier", "ca-1", "dt-5", "SEG-RC-7781.pdf", "2025-07-05", "2026-07-05"),     // a vencer
    doc("co-1", "carrier", "ca-2", "dt-1", "LO-2025-2299.pdf", "2025-10-10", "2026-10-10"),
    doc("co-1", "carrier", "ca-2", "dt-2", "ANP-TRR-3398.pdf", "2025-11-20", "2026-11-20"),
    doc("co-1", "carrier", "ca-2", "dt-3", "RNTRC-22334455.pdf", "2025-12-01", "2026-12-01"),
    doc("co-1", "carrier", "ca-3", "dt-1", "LO-2025-7712.pdf", "2025-04-01", "2026-04-01"),     // vencido
    doc("co-1", "carrier", "ca-3", "dt-3", "RNTRC-33445566.pdf", "2026-01-10", "2027-01-10"),
    doc("co-2", "carrier", "ca-4", "dt-2", "ANP-TRR-9981.pdf", "2026-01-15", "2027-01-15"),
    doc("co-2", "carrier", "ca-4", "dt-3", "RNTRC-44556677.pdf", "2026-03-01", "2027-03-01"),
    // Motoristas
    doc("co-1", "driver", "dr-1", "dt-6", "CNH-01234567890.pdf", "2022-01-10", "2027-01-10"),
    doc("co-1", "driver", "dr-1", "dt-7", "MOPP-7781.pdf", "2024-03-01", "2029-03-01"),
    doc("co-1", "driver", "dr-1", "dt-8", "ASO-2025-110.pdf", "2025-07-01", "2026-07-01"),       // a vencer
    doc("co-1", "driver", "dr-1", "dt-9", "TOX-55410.pdf", "2024-02-01", "2026-08-01"),
    doc("co-1", "driver", "dr-2", "dt-6", "CNH-02345678901.pdf", "2021-05-20", "2026-05-20"),    // vencido
    doc("co-1", "driver", "dr-2", "dt-7", "MOPP-7782.pdf", "2023-01-10", "2028-01-10"),
    doc("co-1", "driver", "dr-2", "dt-8", "ASO-2025-118.pdf", "2025-09-01", "2026-09-01"),
    doc("co-1", "driver", "dr-3", "dt-6", "CNH-03456789012.pdf", "2023-08-01", "2028-08-01"),
    doc("co-1", "driver", "dr-3", "dt-7", "MOPP-7783.pdf", "2024-09-01", "2029-09-01"),
    doc("co-1", "driver", "dr-3", "dt-8", "ASO-2026-004.pdf", "2026-02-01", "2027-02-01"),
    doc("co-1", "driver", "dr-4", "dt-6", "CNH-04567890123.pdf", "2022-11-01", "2027-11-01"),
    doc("co-1", "driver", "dr-4", "dt-7", "MOPP-7784.pdf", "2024-04-01", "2029-04-01"),          // dr-4 sem ASO (pendente)
    doc("co-1", "driver", "dr-5", "dt-6", "CNH-05678901234.pdf", "2024-01-01", "2029-01-01"),
    doc("co-1", "driver", "dr-5", "dt-8", "ASO-2026-020.pdf", "2026-01-10", "2027-01-10"),       // dr-5 sem MOPP (pendente)
    doc("co-2", "driver", "dr-6", "dt-6", "CNH-06789012345.pdf", "2023-03-01", "2028-03-01"),
    doc("co-2", "driver", "dr-6", "dt-7", "MOPP-7786.pdf", "2025-01-01", "2030-01-01"),
    doc("co-2", "driver", "dr-6", "dt-8", "ASO-2026-031.pdf", "2026-03-01", "2027-03-01"),
    // Veículos
    doc("co-1", "vehicle", "ve-1", "dt-10", "CRLV-2026-001.pdf", "2026-01-05", "2026-12-31"),
    doc("co-1", "vehicle", "ve-1", "dt-11", "CIPP-7741.pdf", "2025-08-01", "2026-08-01"),
    doc("co-1", "vehicle", "ve-2", "dt-10", "CRLV-2026-002.pdf", "2026-01-05", "2026-12-31"),
    doc("co-1", "vehicle", "ve-2", "dt-11", "CIPP-7742.pdf", "2025-05-01", "2026-05-01"),        // vencido
    doc("co-1", "vehicle", "ve-3", "dt-10", "CRLV-2026-003.pdf", "2026-02-01", "2026-12-31"),
    doc("co-1", "vehicle", "ve-3", "dt-11", "CIPP-7743.pdf", "2025-11-01", "2026-11-01"),
    doc("co-1", "vehicle", "ve-4", "dt-10", "CRLV-2026-004.pdf", "2026-01-20", "2026-12-31"),
    doc("co-1", "vehicle", "ve-4", "dt-11", "CIPP-7744.pdf", "2025-07-10", "2026-07-10"),        // a vencer
    doc("co-1", "vehicle", "ve-5", "dt-10", "CRLV-2026-005.pdf", "2026-02-15", "2026-12-31"),
    doc("co-1", "vehicle", "ve-5", "dt-11", "CIPP-7745.pdf", "2025-12-01", "2026-12-01"),
    doc("co-2", "vehicle", "ve-6", "dt-10", "CRLV-2026-006.pdf", "2026-03-01", "2026-12-31"),
    doc("co-2", "vehicle", "ve-6", "dt-11", "CIPP-7746.pdf", "2026-01-15", "2027-01-15"),
    // Tanques
    doc("co-1", "trailer", "tr-1", "dt-12", "CRLV-T-001.pdf", "2026-01-05", "2026-12-31"),
    doc("co-1", "trailer", "tr-1", "dt-13", "CIV-7701.pdf", "2025-07-01", "2026-07-01"),         // a vencer
    doc("co-1", "trailer", "tr-1", "dt-15", "TH-9901.pdf", "2023-04-01", "2028-04-01"),
    doc("co-1", "trailer", "tr-2", "dt-12", "CRLV-T-002.pdf", "2026-01-05", "2026-12-31"),
    doc("co-1", "trailer", "tr-2", "dt-13", "CIV-7702.pdf", "2025-03-01", "2026-03-01"),         // vencido
    doc("co-1", "trailer", "tr-3", "dt-12", "CRLV-T-003.pdf", "2026-02-01", "2026-12-31"),
    doc("co-1", "trailer", "tr-3", "dt-13", "CIV-7703.pdf", "2025-10-01", "2026-10-01"),
    doc("co-1", "trailer", "tr-4", "dt-12", "CRLV-T-004.pdf", "2026-01-10", "2026-12-31"),
    doc("co-1", "trailer", "tr-4", "dt-13", "CIV-7704.pdf", "2025-06-01", "2026-06-01"),         // vencido
    doc("co-1", "trailer", "tr-5", "dt-12", "CRLV-T-005.pdf", "2026-02-10", "2026-12-31"),
    doc("co-1", "trailer", "tr-5", "dt-13", "CIV-7705.pdf", "2025-12-01", "2026-12-01"),
    doc("co-2", "trailer", "tr-6", "dt-12", "CRLV-T-006.pdf", "2026-03-05", "2026-12-31"),
    doc("co-2", "trailer", "tr-6", "dt-13", "CIV-7706.pdf", "2026-01-20", "2027-01-20")
  ];
  // Atribui ids estáveis aos documentos
  documents.forEach(function (d, i) { d.id = "d-" + (i + 1); });

  // ---- LOADING BASES ----
  const loading_bases = [
    { id: "b-1", company_id: "co-1", name: "Base Paulínia — Vibra", operator_name: "Vibra Energia", city: "Paulínia", state: "SP", base_type: "primaria", requires_scheduling: true, requires_integration: true, requires_driver_registration: true, requires_vehicle_registration: true, requires_trailer_registration: true, notes: "Integração via portal obrigatória. Agendamento com 24h de antecedência.", status: "ativo" },
    { id: "b-2", company_id: "co-1", name: "Base Ribeirão Preto — Ipiranga", operator_name: "Ipiranga", city: "Ribeirão Preto", state: "SP", base_type: "secundaria", requires_scheduling: true, requires_integration: false, requires_driver_registration: true, requires_vehicle_registration: true, requires_trailer_registration: false, notes: "Cadastro prévio de motorista e veículo. Janela das 06h às 18h.", status: "ativo" },
    { id: "b-3", company_id: "co-2", name: "Base Araucária — Raízen", operator_name: "Raízen", city: "Araucária", state: "PR", base_type: "primaria", requires_scheduling: true, requires_integration: true, requires_driver_registration: true, requires_vehicle_registration: false, requires_trailer_registration: true, notes: "Integração eletrônica de notas. Exige toxicológico vigente.", status: "ativo" },
    { id: "b-4", company_id: "co-2", name: "Base Senador Canedo — Vibra", operator_name: "Vibra Energia", city: "Senador Canedo", state: "GO", base_type: "terminal", requires_scheduling: false, requires_integration: false, requires_driver_registration: true, requires_vehicle_registration: false, requires_trailer_registration: false, notes: "Carregamento por ordem de chegada. Cadastro prévio simples.", status: "ativo" }
  ];

  // ---- LOADING BASE REQUIREMENTS (join normalizado) ----
  function req(company_id, loading_base_id, document_type_id, entity_type, is_blocking, notes) {
    return { company_id, loading_base_id, document_type_id, entity_type, is_required: true, is_blocking, notes: notes || "" };
  }
  const loading_base_requirements = [
    req("co-1", "b-1", "dt-3", "carrier", true, "Obrigatório vigente"),
    req("co-1", "b-1", "dt-11", "vehicle", true, "Inspeção obrigatória"),
    req("co-1", "b-1", "dt-7", "driver", true, "Motorista habilitado"),
    req("co-1", "b-1", "dt-8", "driver", true, ""),
    req("co-1", "b-1", "dt-16", "trailer", false, "Recomendado"),
    req("co-1", "b-2", "dt-3", "carrier", true, ""),
    req("co-1", "b-2", "dt-10", "vehicle", true, ""),
    req("co-1", "b-2", "dt-13", "trailer", true, ""),
    req("co-1", "b-2", "dt-7", "driver", true, ""),
    req("co-2", "b-3", "dt-3", "carrier", true, ""),
    req("co-2", "b-3", "dt-11", "vehicle", true, ""),
    req("co-2", "b-3", "dt-7", "driver", true, ""),
    req("co-2", "b-3", "dt-9", "driver", true, "Exige toxicológico vigente"),
    req("co-2", "b-4", "dt-3", "carrier", true, ""),
    req("co-2", "b-4", "dt-10", "vehicle", true, ""),
    req("co-2", "b-4", "dt-7", "driver", true, "")
  ];
  loading_base_requirements.forEach(function (r, i) { r.id = "br-" + (i + 1); });

  // ---- OPERATIONS (consultas operacionais) ----
  const operations = [
    { id: "op-1", company_id: "co-1", carrier_id: "ca-1", driver_id: "dr-1", vehicle_id: "ve-1", trailer_id: "tr-1", loading_base_id: "b-2", product: "Óleo Diesel S10", operation_date: "2026-06-20", status: "bloqueado", notes: "RNTRC da transportadora vencido." },
    { id: "op-2", company_id: "co-1", carrier_id: "ca-2", driver_id: "dr-3", vehicle_id: "ve-3", trailer_id: "tr-3", loading_base_id: "b-2", product: "Gasolina Comum", operation_date: "2026-06-19", status: "liberado", notes: "" },
    { id: "op-3", company_id: "co-2", carrier_id: "ca-4", driver_id: "dr-6", vehicle_id: "ve-6", trailer_id: "tr-6", loading_base_id: "b-3", product: "Óleo Diesel S10", operation_date: "2026-06-18", status: "liberado", notes: "" }
  ];

  // ---- OPERATION CHECKS ----
  const operation_checks = [
    { id: "oc-1", operation_id: "op-1", entity_type: "carrier", entity_id: "ca-1", document_type_id: "dt-3", status: "bloqueado", message: "RNTRC vencido." },
    { id: "oc-2", operation_id: "op-1", entity_type: "driver", entity_id: "dr-1", document_type_id: null, status: "apto", message: "Documentação em dia." },
    { id: "oc-3", operation_id: "op-1", entity_type: "vehicle", entity_id: "ve-1", document_type_id: null, status: "apto", message: "CRLV e CIPP vigentes." },
    { id: "oc-4", operation_id: "op-1", entity_type: "trailer", entity_id: "tr-1", document_type_id: "dt-13", status: "atencao", message: "CIV próxima do vencimento." }
  ];

  window.SEED = {
    companies, users, carriers, drivers, vehicles, trailers,
    document_types, documents, loading_bases, loading_base_requirements,
    operations, operation_checks
  };
})();
