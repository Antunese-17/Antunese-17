/* =========================================================================
   Gestão Documental de Frota — Base de dados mockada (demonstração)
   Data de referência da aplicação: 2026-06-20
   ========================================================================= */
(function () {
  "use strict";

  // ---- COMPANIES (empresas que operam a plataforma) ----
  const companies = [
    { id: "co-1", name: "Atual Via Petro", cnpj: "12.345.678/0001-90", segment: "TRR", city: "Ribeirão Preto/SP" },
    { id: "co-2", name: "Petro Sul Distribuidora", cnpj: "98.765.432/0001-10", segment: "TRR", city: "Curitiba/PR" }
  ];

  // ---- USERS ----
  const users = [
    { id: "u-1", company_id: "co-1", name: "Administrador", email: "admin@atualviapetro.com.br", role: "Admin" },
    { id: "u-2", company_id: "co-1", name: "Carla Documentação", email: "carla@atualviapetro.com.br", role: "Operador Documental" },
    { id: "u-3", company_id: "co-2", name: "Marcos Souza", email: "marcos@petrosul.com.br", role: "Admin" }
  ];

  // ---- CARRIERS (transportadoras) ----
  const carriers = [
    { id: "ca-1", company_id: "co-1", name: "Transportes Rodoluz Ltda", cnpj: "10.111.222/0001-33", antt: "RNTRC 11223344", contact: "(16) 99888-1010", city: "Ribeirão Preto/SP" },
    { id: "ca-2", company_id: "co-1", name: "Log Sul Transportes", cnpj: "20.222.333/0001-44", antt: "RNTRC 22334455", contact: "(16) 99777-2020", city: "Sertãozinho/SP" },
    { id: "ca-3", company_id: "co-1", name: "Via Norte Cargas", cnpj: "30.333.444/0001-55", antt: "RNTRC 33445566", contact: "(16) 99666-3030", city: "Franca/SP" },
    { id: "ca-4", company_id: "co-2", name: "Sul Combustíveis Transp.", cnpj: "40.444.555/0001-66", antt: "RNTRC 44556677", contact: "(41) 99555-4040", city: "Curitiba/PR" }
  ];

  // ---- DRIVERS (motoristas) ----
  const drivers = [
    { id: "dr-1", carrier_id: "ca-1", name: "José Almeida", cpf: "111.222.333-44", cnh: "01234567890", cnh_cat: "E" },
    { id: "dr-2", carrier_id: "ca-1", name: "Antônio Pereira", cpf: "222.333.444-55", cnh: "02345678901", cnh_cat: "E" },
    { id: "dr-3", carrier_id: "ca-2", name: "Roberto Lima", cpf: "333.444.555-66", cnh: "03456789012", cnh_cat: "E" },
    { id: "dr-4", carrier_id: "ca-2", name: "Sérgio Tavares", cpf: "444.555.666-77", cnh: "04567890123", cnh_cat: "E" },
    { id: "dr-5", carrier_id: "ca-3", name: "Paulo Henrique", cpf: "555.666.777-88", cnh: "05678901234", cnh_cat: "D" },
    { id: "dr-6", carrier_id: "ca-4", name: "Edson Ramos", cpf: "666.777.888-99", cnh: "06789012345", cnh_cat: "E" }
  ];

  // ---- VEHICLES (cavalos mecânicos) ----
  const vehicles = [
    { id: "ve-1", carrier_id: "ca-1", plate: "RDL-1A23", brand: "Scania", model: "R450", year: 2021, renavam: "00112233445" },
    { id: "ve-2", carrier_id: "ca-1", plate: "RDL-2B34", brand: "Volvo", model: "FH460", year: 2019, renavam: "00223344556" },
    { id: "ve-3", carrier_id: "ca-2", plate: "LGS-3C45", brand: "Mercedes-Benz", model: "Actros 2546", year: 2022, renavam: "00334455667" },
    { id: "ve-4", carrier_id: "ca-2", plate: "LGS-4D56", brand: "DAF", model: "XF 480", year: 2018, renavam: "00445566778" },
    { id: "ve-5", carrier_id: "ca-3", plate: "VNC-5E67", brand: "Iveco", model: "Hi-Way 440", year: 2020, renavam: "00556677889" },
    { id: "ve-6", carrier_id: "ca-4", plate: "SCT-6F78", brand: "Scania", model: "R500", year: 2023, renavam: "00667788990" }
  ];

  // ---- TRAILERS (tanques / implementos) ----
  const trailers = [
    { id: "tr-1", carrier_id: "ca-1", plate: "RDL-7G89", type: "Tanque", capacity: 30000, compartments: 4, year: 2020 },
    { id: "tr-2", carrier_id: "ca-1", plate: "RDL-8H90", type: "Tanque", capacity: 45000, compartments: 6, year: 2018 },
    { id: "tr-3", carrier_id: "ca-2", plate: "LGS-9I01", type: "Tanque", capacity: 30000, compartments: 4, year: 2021 },
    { id: "tr-4", carrier_id: "ca-2", plate: "LGS-1J12", type: "Tanque", capacity: 20000, compartments: 3, year: 2017 },
    { id: "tr-5", carrier_id: "ca-3", plate: "VNC-2K23", type: "Tanque", capacity: 45000, compartments: 6, year: 2019 },
    { id: "tr-6", carrier_id: "ca-4", plate: "SCT-3L34", type: "Tanque", capacity: 30000, compartments: 4, year: 2022 }
  ];

  // ---- DOCUMENT TYPES ----
  // applies_to: carrier | driver | vehicle | trailer | base
  const document_types = [
    { id: "dt-1", name: "Licença de Operação (IBAMA)", applies_to: ["carrier"], validity_days: 365 },
    { id: "dt-2", name: "Cadastro ANP / TRR", applies_to: ["carrier"], validity_days: 365 },
    { id: "dt-3", name: "RNTRC / ANTT", applies_to: ["carrier"], validity_days: 365 },
    { id: "dt-4", name: "Alvará de Funcionamento", applies_to: ["carrier"], validity_days: 365 },
    { id: "dt-5", name: "CNH", applies_to: ["driver"], validity_days: 1825 },
    { id: "dt-6", name: "Curso MOPP", applies_to: ["driver"], validity_days: 1825 },
    { id: "dt-7", name: "ASO (Atestado Saúde Ocupacional)", applies_to: ["driver"], validity_days: 365 },
    { id: "dt-8", name: "Toxicológico", applies_to: ["driver"], validity_days: 900 },
    { id: "dt-9", name: "CRLV", applies_to: ["vehicle", "trailer"], validity_days: 365 },
    { id: "dt-10", name: "CIPP / Certificado Inspeção", applies_to: ["vehicle", "trailer"], validity_days: 365 },
    { id: "dt-11", name: "CIV (Inspeção Veicular)", applies_to: ["trailer"], validity_days: 365 },
    { id: "dt-12", name: "Calibração de Tanque", applies_to: ["trailer"], validity_days: 1825 },
    { id: "dt-13", name: "Seguro RCTR-C / Ambiental", applies_to: ["carrier", "vehicle"], validity_days: 365 },
    { id: "dt-14", name: "Teste Hidrostático", applies_to: ["trailer"], validity_days: 1825 }
  ];

  // ---- DOCUMENTS ----
  // entity_type: carrier | driver | vehicle | trailer | base | operation
  // status_override: "nao_aplicavel" força N/A; senão é calculado pela validade.
  const documents = [
    // Transportadora Rodoluz (ca-1) — em dia, mas seguro a vencer
    { id: "d-1", entity_type: "carrier", entity_id: "ca-1", type_id: "dt-1", number: "LO-2025-8841", emissao: "2025-09-01", validade: "2026-09-01" },
    { id: "d-2", entity_type: "carrier", entity_id: "ca-1", type_id: "dt-2", number: "ANP-TRR-1122", emissao: "2025-08-15", validade: "2026-08-15" },
    { id: "d-3", entity_type: "carrier", entity_id: "ca-1", type_id: "dt-3", number: "RNTRC-11223344", emissao: "2025-06-01", validade: "2026-06-01" }, // vencido (16d)
    { id: "d-4", entity_type: "carrier", entity_id: "ca-1", type_id: "dt-13", number: "SEG-RC-7781", emissao: "2025-07-05", validade: "2026-07-05" }, // a vencer

    // Log Sul (ca-2)
    { id: "d-5", entity_type: "carrier", entity_id: "ca-2", type_id: "dt-1", number: "LO-2025-2299", emissao: "2025-10-10", validade: "2026-10-10" },
    { id: "d-6", entity_type: "carrier", entity_id: "ca-2", type_id: "dt-2", number: "ANP-TRR-3398", emissao: "2025-11-20", validade: "2026-11-20" },
    { id: "d-7", entity_type: "carrier", entity_id: "ca-2", type_id: "dt-3", number: "RNTRC-22334455", emissao: "2025-12-01", validade: "2026-12-01" },
    { id: "d-8", entity_type: "carrier", entity_id: "ca-2", type_id: "dt-13", number: "SEG-RC-5540", emissao: "2025-12-15", validade: "2026-12-15" },

    // Via Norte (ca-3) — pendência: sem ANP
    { id: "d-9", entity_type: "carrier", entity_id: "ca-3", type_id: "dt-1", number: "LO-2025-7712", emissao: "2025-04-01", validade: "2026-04-01" }, // vencido
    { id: "d-10", entity_type: "carrier", entity_id: "ca-3", type_id: "dt-3", number: "RNTRC-33445566", emissao: "2026-01-10", validade: "2027-01-10" },

    // Sul Combustíveis (ca-4)
    { id: "d-11", entity_type: "carrier", entity_id: "ca-4", type_id: "dt-1", number: "LO-2026-0091", emissao: "2026-02-01", validade: "2027-02-01" },
    { id: "d-12", entity_type: "carrier", entity_id: "ca-4", type_id: "dt-2", number: "ANP-TRR-9981", emissao: "2026-01-15", validade: "2027-01-15" },
    { id: "d-13", entity_type: "carrier", entity_id: "ca-4", type_id: "dt-3", number: "RNTRC-44556677", emissao: "2026-03-01", validade: "2027-03-01" },

    // Motoristas
    { id: "d-20", entity_type: "driver", entity_id: "dr-1", type_id: "dt-5", number: "CNH-01234567890", emissao: "2022-01-10", validade: "2027-01-10" },
    { id: "d-21", entity_type: "driver", entity_id: "dr-1", type_id: "dt-6", number: "MOPP-7781", emissao: "2024-03-01", validade: "2029-03-01" },
    { id: "d-22", entity_type: "driver", entity_id: "dr-1", type_id: "dt-7", number: "ASO-2025-110", emissao: "2025-07-01", validade: "2026-07-01" }, // a vencer
    { id: "d-23", entity_type: "driver", entity_id: "dr-1", type_id: "dt-8", number: "TOX-55410", emissao: "2024-02-01", validade: "2026-08-01" },

    { id: "d-24", entity_type: "driver", entity_id: "dr-2", type_id: "dt-5", number: "CNH-02345678901", emissao: "2021-05-20", validade: "2026-05-20" }, // CNH vencida
    { id: "d-25", entity_type: "driver", entity_id: "dr-2", type_id: "dt-6", number: "MOPP-7782", emissao: "2023-01-10", validade: "2028-01-10" },
    { id: "d-26", entity_type: "driver", entity_id: "dr-2", type_id: "dt-7", number: "ASO-2025-118", emissao: "2025-09-01", validade: "2026-09-01" },
    { id: "d-27", entity_type: "driver", entity_id: "dr-2", type_id: "dt-8", number: "TOX-55418", emissao: "2024-06-01", validade: "2026-12-01" },

    { id: "d-28", entity_type: "driver", entity_id: "dr-3", type_id: "dt-5", number: "CNH-03456789012", emissao: "2023-08-01", validade: "2028-08-01" },
    { id: "d-29", entity_type: "driver", entity_id: "dr-3", type_id: "dt-6", number: "MOPP-7783", emissao: "2024-09-01", validade: "2029-09-01" },
    { id: "d-30", entity_type: "driver", entity_id: "dr-3", type_id: "dt-7", number: "ASO-2026-004", emissao: "2026-02-01", validade: "2027-02-01" },
    { id: "d-31", entity_type: "driver", entity_id: "dr-3", type_id: "dt-8", number: "TOX-55430", emissao: "2025-01-01", validade: "2027-07-01" },

    { id: "d-32", entity_type: "driver", entity_id: "dr-4", type_id: "dt-5", number: "CNH-04567890123", emissao: "2022-11-01", validade: "2027-11-01" },
    { id: "d-33", entity_type: "driver", entity_id: "dr-4", type_id: "dt-6", number: "MOPP-7784", emissao: "2024-04-01", validade: "2029-04-01" },
    // dr-4 sem ASO (pendente)
    { id: "d-34", entity_type: "driver", entity_id: "dr-5", type_id: "dt-5", number: "CNH-05678901234", emissao: "2024-01-01", validade: "2029-01-01" },
    { id: "d-35", entity_type: "driver", entity_id: "dr-5", type_id: "dt-7", number: "ASO-2026-020", emissao: "2026-01-10", validade: "2027-01-10" },
    { id: "d-36", entity_type: "driver", entity_id: "dr-6", type_id: "dt-5", number: "CNH-06789012345", emissao: "2023-03-01", validade: "2028-03-01" },
    { id: "d-37", entity_type: "driver", entity_id: "dr-6", type_id: "dt-6", number: "MOPP-7786", emissao: "2025-01-01", validade: "2030-01-01" },
    { id: "d-38", entity_type: "driver", entity_id: "dr-6", type_id: "dt-7", number: "ASO-2026-031", emissao: "2026-03-01", validade: "2027-03-01" },

    // Veículos (cavalos)
    { id: "d-40", entity_type: "vehicle", entity_id: "ve-1", type_id: "dt-9", number: "CRLV-2026-001", emissao: "2026-01-05", validade: "2026-12-31" },
    { id: "d-41", entity_type: "vehicle", entity_id: "ve-1", type_id: "dt-10", number: "CIPP-7741", emissao: "2025-08-01", validade: "2026-08-01" },
    { id: "d-42", entity_type: "vehicle", entity_id: "ve-2", type_id: "dt-9", number: "CRLV-2026-002", emissao: "2026-01-05", validade: "2026-12-31" },
    { id: "d-43", entity_type: "vehicle", entity_id: "ve-2", type_id: "dt-10", number: "CIPP-7742", emissao: "2025-05-01", validade: "2026-05-01" }, // vencido
    { id: "d-44", entity_type: "vehicle", entity_id: "ve-3", type_id: "dt-9", number: "CRLV-2026-003", emissao: "2026-02-01", validade: "2026-12-31" },
    { id: "d-45", entity_type: "vehicle", entity_id: "ve-3", type_id: "dt-10", number: "CIPP-7743", emissao: "2025-11-01", validade: "2026-11-01" },
    { id: "d-46", entity_type: "vehicle", entity_id: "ve-4", type_id: "dt-9", number: "CRLV-2026-004", emissao: "2026-01-20", validade: "2026-12-31" },
    { id: "d-47", entity_type: "vehicle", entity_id: "ve-4", type_id: "dt-10", number: "CIPP-7744", emissao: "2025-07-10", validade: "2026-07-10" }, // a vencer
    { id: "d-48", entity_type: "vehicle", entity_id: "ve-5", type_id: "dt-9", number: "CRLV-2026-005", emissao: "2026-02-15", validade: "2026-12-31" },
    { id: "d-49", entity_type: "vehicle", entity_id: "ve-5", type_id: "dt-10", number: "CIPP-7745", emissao: "2025-12-01", validade: "2026-12-01" },
    { id: "d-50", entity_type: "vehicle", entity_id: "ve-6", type_id: "dt-9", number: "CRLV-2026-006", emissao: "2026-03-01", validade: "2026-12-31" },
    { id: "d-51", entity_type: "vehicle", entity_id: "ve-6", type_id: "dt-10", number: "CIPP-7746", emissao: "2026-01-15", validade: "2027-01-15" },

    // Tanques / implementos
    { id: "d-60", entity_type: "trailer", entity_id: "tr-1", type_id: "dt-9", number: "CRLV-T-001", emissao: "2026-01-05", validade: "2026-12-31" },
    { id: "d-61", entity_type: "trailer", entity_id: "tr-1", type_id: "dt-11", number: "CIV-7701", emissao: "2025-07-01", validade: "2026-07-01" }, // a vencer
    { id: "d-62", entity_type: "trailer", entity_id: "tr-1", type_id: "dt-14", number: "TH-9901", emissao: "2023-04-01", validade: "2028-04-01" },
    { id: "d-63", entity_type: "trailer", entity_id: "tr-1", type_id: "dt-12", number: "CAL-3301", emissao: "2024-06-01", validade: "2029-06-01" },
    { id: "d-64", entity_type: "trailer", entity_id: "tr-2", type_id: "dt-9", number: "CRLV-T-002", emissao: "2026-01-05", validade: "2026-12-31" },
    { id: "d-65", entity_type: "trailer", entity_id: "tr-2", type_id: "dt-11", number: "CIV-7702", emissao: "2025-03-01", validade: "2026-03-01" }, // vencido
    { id: "d-66", entity_type: "trailer", entity_id: "tr-2", type_id: "dt-14", number: "TH-9902", emissao: "2022-04-01", validade: "2027-04-01" },
    { id: "d-67", entity_type: "trailer", entity_id: "tr-3", type_id: "dt-9", number: "CRLV-T-003", emissao: "2026-02-01", validade: "2026-12-31" },
    { id: "d-68", entity_type: "trailer", entity_id: "tr-3", type_id: "dt-11", number: "CIV-7703", emissao: "2025-10-01", validade: "2026-10-01" },
    { id: "d-69", entity_type: "trailer", entity_id: "tr-3", type_id: "dt-14", number: "TH-9903", emissao: "2023-09-01", validade: "2028-09-01" },
    { id: "d-70", entity_type: "trailer", entity_id: "tr-4", type_id: "dt-9", number: "CRLV-T-004", emissao: "2026-01-10", validade: "2026-12-31" },
    { id: "d-71", entity_type: "trailer", entity_id: "tr-4", type_id: "dt-11", number: "CIV-7704", emissao: "2025-06-01", validade: "2026-06-01" }, // vencido
    { id: "d-72", entity_type: "trailer", entity_id: "tr-5", type_id: "dt-9", number: "CRLV-T-005", emissao: "2026-02-10", validade: "2026-12-31" },
    { id: "d-73", entity_type: "trailer", entity_id: "tr-5", type_id: "dt-11", number: "CIV-7705", emissao: "2025-12-01", validade: "2026-12-01" },
    { id: "d-74", entity_type: "trailer", entity_id: "tr-5", type_id: "dt-14", number: "TH-9905", emissao: "2024-01-01", validade: "2029-01-01" },
    { id: "d-75", entity_type: "trailer", entity_id: "tr-6", type_id: "dt-9", number: "CRLV-T-006", emissao: "2026-03-05", validade: "2026-12-31" },
    { id: "d-76", entity_type: "trailer", entity_id: "tr-6", type_id: "dt-11", number: "CIV-7706", emissao: "2026-01-20", validade: "2027-01-20" }
  ];

  // ---- LOADING BASES ----
  const loading_bases = [
    { id: "b-1", name: "Base Paulínia — Vibra", operator: "Vibra Energia", city: "Paulínia/SP" },
    { id: "b-2", name: "Base Ribeirão Preto — Ipiranga", operator: "Ipiranga", city: "Ribeirão Preto/SP" },
    { id: "b-3", name: "Base Araucária — Raízen", operator: "Raízen", city: "Araucária/PR" },
    { id: "b-4", name: "Base Senador Canedo — Vibra", operator: "Vibra Energia", city: "Senador Canedo/GO" }
  ];

  // ---- LOADING BASE REQUIREMENTS ----
  const loading_base_requirements = [
    {
      id: "br-1", base_id: "b-1", integration: true, scheduling: true, pre_register: true,
      required_docs: ["RNTRC / ANTT", "CIPP / Certificado Inspeção", "MOPP", "ASO", "Calibração de Tanque"],
      notes: "Integração via portal SAP obrigatória. Agendamento com 24h de antecedência. Tanque deve ter calibração vigente e lacres íntegros."
    },
    {
      id: "br-2", base_id: "b-2", integration: false, scheduling: true, pre_register: true,
      required_docs: ["RNTRC / ANTT", "CRLV", "CIV (Inspeção Veicular)", "MOPP"],
      notes: "Cadastro prévio do motorista e veículo no sistema da base. Janela de carregamento das 06h às 18h."
    },
    {
      id: "br-3", base_id: "b-3", integration: true, scheduling: true, pre_register: true,
      required_docs: ["RNTRC / ANTT", "CIPP / Certificado Inspeção", "MOPP", "Toxicológico", "Seguro RCTR-C / Ambiental"],
      notes: "Integração eletrônica de notas. Exige toxicológico vigente e curso de direção defensiva. Bloqueio automático para documentos vencidos."
    },
    {
      id: "br-4", base_id: "b-4", integration: false, scheduling: false, pre_register: true,
      required_docs: ["RNTRC / ANTT", "CRLV", "MOPP"],
      notes: "Carregamento por ordem de chegada. Cadastro prévio simples. Sem integração eletrônica obrigatória."
    }
  ];

  // ---- OPERATIONS (consultas operacionais salvas) ----
  const operations = [
    {
      id: "op-1", carrier_id: "ca-1", driver_id: "dr-1", vehicle_id: "ve-1", trailer_id: "tr-1",
      base_id: "b-2", product: "Óleo Diesel S10", date: "2026-06-20", result: "atencao"
    },
    {
      id: "op-2", carrier_id: "ca-2", driver_id: "dr-3", vehicle_id: "ve-3", trailer_id: "tr-3",
      base_id: "b-3", product: "Gasolina Comum", date: "2026-06-19", result: "liberado"
    },
    {
      id: "op-3", carrier_id: "ca-1", driver_id: "dr-2", vehicle_id: "ve-2", trailer_id: "tr-2",
      base_id: "b-1", product: "Óleo Diesel S500", date: "2026-06-18", result: "bloqueado"
    }
  ];

  // ---- OPERATION CHECKS (resultado detalhado das consultas salvas) ----
  const operation_checks = [
    { id: "oc-1", operation_id: "op-1", scope: "Transportadora", status: "atencao", message: "RNTRC vencido há 19 dias." },
    { id: "oc-2", operation_id: "op-1", scope: "Motorista", status: "apto", message: "Documentação em dia." },
    { id: "oc-3", operation_id: "op-1", scope: "Cavalo", status: "apto", message: "CRLV e CIPP vigentes." },
    { id: "oc-4", operation_id: "op-1", scope: "Tanque", status: "atencao", message: "CIV vence em breve." },

    { id: "oc-5", operation_id: "op-2", scope: "Transportadora", status: "apto", message: "Documentação em dia." },
    { id: "oc-6", operation_id: "op-2", scope: "Motorista", status: "apto", message: "Documentação em dia." },
    { id: "oc-7", operation_id: "op-2", scope: "Cavalo", status: "apto", message: "Documentação em dia." },
    { id: "oc-8", operation_id: "op-2", scope: "Tanque", status: "apto", message: "Documentação em dia." },

    { id: "oc-9", operation_id: "op-3", scope: "Motorista", status: "bloqueado", message: "CNH vencida." },
    { id: "oc-10", operation_id: "op-3", scope: "Tanque", status: "bloqueado", message: "CIV vencida." }
  ];

  window.SEED = {
    companies, users, carriers, drivers, vehicles, trailers,
    document_types, documents, loading_bases, loading_base_requirements,
    operations, operation_checks
  };
})();
