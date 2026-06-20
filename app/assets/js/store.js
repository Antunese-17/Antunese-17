/* =========================================================================
   Store — estado, persistência (localStorage), cálculo de status e queries.
   ========================================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "gdf_state_v1";
  // Data de referência fixa para coerência da demonstração.
  const TODAY = new Date("2026-06-20T00:00:00");
  const SOON_DAYS = 30; // janela de "a vencer"

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignora */ }
    return clone(window.SEED);
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  let state = load();
  let session = { user: null, companyId: null };

  /* ---------------- Datas ---------------- */
  function parseDate(s) { return s ? new Date(s + "T00:00:00") : null; }
  function daysBetween(a, b) { return Math.round((a - b) / 86400000); }
  function fmtDate(s) {
    if (!s) return "—";
    const d = parseDate(s);
    return d.toLocaleDateString("pt-BR");
  }
  function daysUntil(s) {
    const d = parseDate(s);
    if (!d) return null;
    return daysBetween(d, TODAY);
  }

  /* ---------------- Status de documento ----------------
     Retorna: valido | a_vencer | vencido | pendente | nao_aplicavel */
  function docStatus(doc) {
    if (!doc) return "pendente";
    if (doc.status_override === "nao_aplicavel") return "nao_aplicavel";
    if (!doc.validade) return "pendente";
    const dleft = daysUntil(doc.validade);
    if (dleft < 0) return "vencido";
    if (dleft <= SOON_DAYS) return "a_vencer";
    return "valido";
  }

  const DOC_STATUS_META = {
    valido:        { label: "Válido",        tone: "green" },
    a_vencer:      { label: "A vencer",      tone: "amber" },
    vencido:       { label: "Vencido",       tone: "red" },
    pendente:      { label: "Pendente",      tone: "gray" },
    nao_aplicavel: { label: "Não aplicável", tone: "gray" }
  };

  /* ---------------- Status operacional de entidade ----------------
     apto | atencao | pendente | bloqueado */
  const OP_STATUS_META = {
    apto:      { label: "Apto",      tone: "green" },
    atencao:   { label: "Atenção",   tone: "amber" },
    pendente:  { label: "Pendente",  tone: "gray" },
    bloqueado: { label: "Bloqueado", tone: "red" }
  };

  // Documentos obrigatórios por tipo de entidade (para detectar pendências).
  const REQUIRED_BY_ENTITY = {
    carrier: ["dt-1", "dt-2", "dt-3"],      // Licença, ANP/TRR, RNTRC
    driver: ["dt-5", "dt-6", "dt-7"],        // CNH, MOPP, ASO
    vehicle: ["dt-9", "dt-10"],              // CRLV, CIPP
    trailer: ["dt-9", "dt-11"]               // CRLV, CIV
  };

  function docsFor(entityType, entityId) {
    return state.documents.filter(function (d) {
      return d.entity_type === entityType && d.entity_id === entityId;
    });
  }

  // Avalia o status operacional de uma entidade a partir dos seus documentos.
  function entityStatus(entityType, entityId) {
    const docs = docsFor(entityType, entityId);
    const required = REQUIRED_BY_ENTITY[entityType] || [];
    let worst = "apto";
    const rank = { apto: 0, pendente: 1, atencao: 2, bloqueado: 3 };
    function bump(s) { if (rank[s] > rank[worst]) worst = s; }

    // Documentos existentes
    docs.forEach(function (d) {
      const st = docStatus(d);
      if (st === "vencido") bump("bloqueado");
      else if (st === "a_vencer") bump("atencao");
      else if (st === "pendente") bump("pendente");
    });
    // Obrigatórios ausentes => pendente
    required.forEach(function (typeId) {
      const has = docs.some(function (d) { return d.type_id === typeId; });
      if (!has) bump("pendente");
    });
    return worst;
  }

  // Conta documentos por status para uma entidade.
  function entityDocSummary(entityType, entityId) {
    const docs = docsFor(entityType, entityId);
    const sum = { valido: 0, a_vencer: 0, vencido: 0, pendente: 0, nao_aplicavel: 0, total: docs.length };
    docs.forEach(function (d) { sum[docStatus(d)]++; });
    // Pendências por ausência
    const required = REQUIRED_BY_ENTITY[entityType] || [];
    required.forEach(function (typeId) {
      const has = docs.some(function (d) { return d.type_id === typeId; });
      if (!has) sum.pendente++;
    });
    return sum;
  }

  /* ---------------- Escopo por empresa ---------------- */
  function currentCompanyId() { return session.companyId; }

  function carriers() {
    return state.carriers.filter(function (c) { return c.company_id === session.companyId; });
  }
  function carrierIds() { return carriers().map(function (c) { return c.id; }); }

  function drivers() {
    const ids = carrierIds();
    return state.drivers.filter(function (d) { return ids.indexOf(d.carrier_id) >= 0; });
  }
  function vehicles() {
    const ids = carrierIds();
    return state.vehicles.filter(function (v) { return ids.indexOf(v.carrier_id) >= 0; });
  }
  function trailers() {
    const ids = carrierIds();
    return state.trailers.filter(function (t) { return ids.indexOf(t.carrier_id) >= 0; });
  }

  function allScopedDocuments() {
    // Documentos cujas entidades pertencem à empresa atual.
    const cIds = carrierIds();
    const dIds = drivers().map(function (x) { return x.id; });
    const vIds = vehicles().map(function (x) { return x.id; });
    const tIds = trailers().map(function (x) { return x.id; });
    return state.documents.filter(function (d) {
      if (d.entity_type === "carrier") return cIds.indexOf(d.entity_id) >= 0;
      if (d.entity_type === "driver") return dIds.indexOf(d.entity_id) >= 0;
      if (d.entity_type === "vehicle") return vIds.indexOf(d.entity_id) >= 0;
      if (d.entity_type === "trailer") return tIds.indexOf(d.entity_id) >= 0;
      if (d.entity_type === "base") return true;
      return false;
    });
  }

  /* ---------------- Lookups ---------------- */
  function carrierName(id) { const c = byId("carriers", id); return c ? c.name : "—"; }
  function docTypeName(id) { const t = byId("document_types", id); return t ? t.name : "—"; }
  function baseName(id) { const b = byId("loading_bases", id); return b ? b.name : "—"; }
  function driverName(id) { const d = byId("drivers", id); return d ? d.name : "—"; }
  function vehicleLabel(id) { const v = byId("vehicles", id); return v ? (v.plate + " · " + v.model) : "—"; }
  function trailerLabel(id) { const t = byId("trailers", id); return t ? (t.plate + " · " + t.type) : "—"; }

  function byId(collection, id) {
    return state[collection].find(function (x) { return x.id === id; });
  }

  function entityLabel(type, id) {
    if (type === "carrier") return carrierName(id);
    if (type === "driver") return driverName(id);
    if (type === "vehicle") { const v = byId("vehicles", id); return v ? v.plate : "—"; }
    if (type === "trailer") { const t = byId("trailers", id); return t ? t.plate : "—"; }
    if (type === "base") return baseName(id);
    return "—";
  }
  const ENTITY_LABELS = { carrier: "Transportadora", driver: "Motorista", vehicle: "Veículo", trailer: "Tanque", base: "Base", operation: "Operação" };

  /* ---------------- Consulta operacional ----------------
     Avalia conjunto: transportadora + motorista + cavalo + tanque (+ base, produto). */
  function evaluateOperation(sel) {
    const checks = [];
    const rank = { apto: 0, pendente: 1, atencao: 2, bloqueado: 3 };
    let worst = "apto";
    function reg(scope, type, id) {
      if (!id) { return; }
      const st = entityStatus(type, id);
      const sum = entityDocSummary(type, id);
      let msg;
      if (st === "bloqueado") msg = sum.vencido + " documento(s) vencido(s).";
      else if (st === "atencao") msg = sum.a_vencer + " documento(s) a vencer.";
      else if (st === "pendente") msg = "Documento obrigatório pendente.";
      else msg = "Documentação em dia.";
      checks.push({ scope: scope, status: st, message: msg, type: type, id: id });
      if (rank[st] > rank[worst]) worst = st;
    }
    reg("Transportadora", "carrier", sel.carrier_id);
    reg("Motorista", "driver", sel.driver_id);
    reg("Cavalo mecânico", "vehicle", sel.vehicle_id);
    reg("Tanque / implemento", "trailer", sel.trailer_id);

    // Verificação contra exigências da base (se selecionada)
    let baseCheck = null;
    if (sel.base_id) {
      const req = state.loading_base_requirements.find(function (r) { return r.base_id === sel.base_id; });
      if (req) {
        const missing = baseRequirementGaps(sel, req);
        let st = "apto";
        if (missing.blocked.length) st = "bloqueado";
        else if (missing.attention.length) st = "atencao";
        baseCheck = { req: req, missing: missing, status: st };
        if (rank[st] > rank[worst]) worst = st;
        checks.push({
          scope: "Exigências da base", status: st, type: "base", id: sel.base_id,
          message: st === "apto" ? "Exigências atendidas." :
                   (missing.blocked.length ? missing.blocked.length + " exigência(s) bloqueante(s)." :
                    missing.attention.length + " ponto(s) de atenção.")
        });
      }
    }

    // Mapeia o pior status para o resultado operacional.
    const resultMap = { apto: "liberado", atencao: "liberado_atencao", pendente: "pendente", bloqueado: "bloqueado" };
    return { result: resultMap[worst], worst: worst, checks: checks, baseCheck: baseCheck };
  }

  // Verifica se os documentos exigidos pela base estão presentes/vigentes.
  function baseRequirementGaps(sel, req) {
    const blocked = [], attention = [];
    const entityList = [
      ["carrier", sel.carrier_id], ["driver", sel.driver_id],
      ["vehicle", sel.vehicle_id], ["trailer", sel.trailer_id]
    ];
    req.required_docs.forEach(function (docName) {
      // Encontra o tipo de documento por nome aproximado.
      const type = state.document_types.find(function (t) {
        return t.name.toLowerCase().indexOf(docName.toLowerCase()) >= 0 ||
               docName.toLowerCase().indexOf(t.name.toLowerCase().split(" ")[0]) >= 0;
      });
      if (!type) return;
      let best = null; // melhor status encontrado entre as entidades aplicáveis
      entityList.forEach(function (pair) {
        const et = pair[0], eid = pair[1];
        if (!eid) return;
        if (type.applies_to.indexOf(et) < 0) return;
        const docs = docsFor(et, eid).filter(function (d) { return d.type_id === type.id; });
        docs.forEach(function (d) {
          const st = docStatus(d);
          if (best === null || statusScore(st) < statusScore(best)) best = st;
        });
      });
      if (best === null) blocked.push(docName + " (ausente)");
      else if (best === "vencido") blocked.push(docName + " (vencido)");
      else if (best === "a_vencer") attention.push(docName + " (a vencer)");
    });
    return { blocked: blocked, attention: attention };
  }
  function statusScore(st) { return { valido: 0, a_vencer: 1, pendente: 2, vencido: 3 }[st] || 2; }

  /* ---------------- Alertas globais ---------------- */
  function alerts() {
    const docs = allScopedDocuments();
    const list = [];
    docs.forEach(function (d) {
      const st = docStatus(d);
      if (st === "vencido" || st === "a_vencer") {
        list.push({
          doc: d, status: st,
          entityLabel: entityLabel(d.entity_type, d.entity_id),
          entityType: ENTITY_LABELS[d.entity_type],
          typeName: docTypeName(d.type_id),
          days: daysUntil(d.validade)
        });
      }
    });
    list.sort(function (a, b) { return (a.days || 0) - (b.days || 0); });
    return list;
  }

  /* ---------------- CRUD genérico ---------------- */
  function genId(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 8); }

  function upsert(collection, obj, prefix) {
    if (!obj.id) {
      obj.id = genId(prefix || "x");
      state[collection].push(obj);
    } else {
      const i = state[collection].findIndex(function (x) { return x.id === obj.id; });
      if (i >= 0) state[collection][i] = obj; else state[collection].push(obj);
    }
    persist();
    return obj;
  }
  function remove(collection, id) {
    state[collection] = state[collection].filter(function (x) { return x.id !== id; });
    persist();
  }
  function saveOperation(op) {
    op.id = genId("op");
    state.operations.unshift(op);
    persist();
    return op;
  }
  function resetDemo() {
    state = clone(window.SEED);
    persist();
  }

  /* ---------------- Sessão ---------------- */
  function login(email, companyId) {
    const user = state.users.find(function (u) { return u.email === email; }) ||
      { id: "u-guest", name: "Usuário Demo", email: email, role: "Operador" };
    session.user = user;
    session.companyId = companyId || user.company_id || state.companies[0].id;
    return session;
  }
  function logout() { session = { user: null, companyId: null }; }
  function setCompany(id) { session.companyId = id; }

  window.Store = {
    state: function () { return state; },
    session: function () { return session; },
    TODAY: TODAY, SOON_DAYS: SOON_DAYS,
    // datas
    fmtDate: fmtDate, daysUntil: daysUntil, parseDate: parseDate,
    // status
    docStatus: docStatus, DOC_STATUS_META: DOC_STATUS_META,
    entityStatus: entityStatus, OP_STATUS_META: OP_STATUS_META,
    entityDocSummary: entityDocSummary, docsFor: docsFor,
    REQUIRED_BY_ENTITY: REQUIRED_BY_ENTITY,
    // escopo
    carriers: carriers, drivers: drivers, vehicles: vehicles, trailers: trailers,
    allScopedDocuments: allScopedDocuments, carrierIds: carrierIds,
    // lookups
    byId: byId, carrierName: carrierName, docTypeName: docTypeName, baseName: baseName,
    driverName: driverName, vehicleLabel: vehicleLabel, trailerLabel: trailerLabel,
    entityLabel: entityLabel, ENTITY_LABELS: ENTITY_LABELS,
    // consulta operacional
    evaluateOperation: evaluateOperation,
    // alertas
    alerts: alerts,
    // crud
    upsert: upsert, remove: remove, saveOperation: saveOperation, resetDemo: resetDemo, persist: persist,
    // sessão
    login: login, logout: logout, setCompany: setCompany, currentCompanyId: currentCompanyId
  };
})();
