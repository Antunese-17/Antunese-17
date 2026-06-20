/* =========================================================================
   Store — estado, persistência (localStorage), cálculo de status e queries.
   Alinhado ao esquema relacional em /db/schema.sql.
   ========================================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "gdf_state_v2";
  // Data de referência fixa para coerência da demonstração.
  const TODAY = new Date("2026-06-20T00:00:00");
  const DEFAULT_ALERT_DAYS = 30;

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
     valido | a_vencer | vencido | pendente | nao_aplicavel */
  function docStatus(doc) {
    if (!doc) return "pendente";
    if (doc.status === "nao_aplicavel") return "nao_aplicavel";
    const type = byId("document_types", doc.document_type_id);
    if (type && type.has_expiration === false) return "valido";
    if (!doc.expiration_date) return "pendente";
    const alertDays = type ? (type.alert_days_before || DEFAULT_ALERT_DAYS) : DEFAULT_ALERT_DAYS;
    const dleft = daysUntil(doc.expiration_date);
    if (dleft < 0) return "vencido";
    if (dleft <= alertDays) return "a_vencer";
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

  // Tipos de documento obrigatórios por padrão para uma entidade.
  function requiredTypeIds(entityType) {
    return state.document_types
      .filter(function (t) { return t.entity_type === entityType && t.is_required_default; })
      .map(function (t) { return t.id; });
  }

  function docsFor(entityType, entityId) {
    return state.documents.filter(function (d) {
      return d.entity_type === entityType && d.entity_id === entityId;
    });
  }

  // Status operacional de uma entidade a partir dos seus documentos.
  function entityStatus(entityType, entityId) {
    // Status administrativo bloqueia/inativa de forma explícita.
    const ent = byId(collectionFor(entityType), entityId);
    if (ent && (ent.status === "bloqueado")) return "bloqueado";
    if (ent && (ent.status === "inativo")) return "pendente";

    const docs = docsFor(entityType, entityId);
    const required = requiredTypeIds(entityType);
    let worst = "apto";
    const rank = { apto: 0, pendente: 1, atencao: 2, bloqueado: 3 };
    function bump(s) { if (rank[s] > rank[worst]) worst = s; }

    docs.forEach(function (d) {
      const st = docStatus(d);
      if (st === "vencido") bump("bloqueado");
      else if (st === "a_vencer") bump("atencao");
      else if (st === "pendente") bump("pendente");
    });
    required.forEach(function (typeId) {
      const has = docs.some(function (d) { return d.document_type_id === typeId; });
      if (!has) bump("pendente");
    });
    return worst;
  }

  function collectionFor(entityType) {
    return { carrier: "carriers", driver: "drivers", vehicle: "vehicles", trailer: "trailers", base: "loading_bases" }[entityType];
  }

  // Conta documentos por status para uma entidade (inclui pendências por ausência).
  function entityDocSummary(entityType, entityId) {
    const docs = docsFor(entityType, entityId);
    const sum = { valido: 0, a_vencer: 0, vencido: 0, pendente: 0, nao_aplicavel: 0, total: docs.length };
    docs.forEach(function (d) { sum[docStatus(d)]++; });
    requiredTypeIds(entityType).forEach(function (typeId) {
      const has = docs.some(function (d) { return d.document_type_id === typeId; });
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
    return state.drivers.filter(function (d) { return d.company_id === session.companyId; });
  }
  function vehicles() {
    return state.vehicles.filter(function (v) { return v.company_id === session.companyId; });
  }
  function trailers() {
    return state.trailers.filter(function (t) { return t.company_id === session.companyId; });
  }
  function loadingBases() {
    return state.loading_bases.filter(function (b) { return b.company_id === session.companyId; });
  }

  function allScopedDocuments() {
    return state.documents.filter(function (d) { return d.company_id === session.companyId; });
  }

  /* ---------------- Lookups ---------------- */
  function carrierName(id) { const c = byId("carriers", id); return c ? (c.trade_name || c.legal_name) : "—"; }
  function docTypeName(id) { const t = byId("document_types", id); return t ? t.name : "—"; }
  function baseName(id) { const b = byId("loading_bases", id); return b ? b.name : "—"; }
  function driverName(id) { const d = byId("drivers", id); return d ? d.full_name : "—"; }
  function vehicleLabel(id) { const v = byId("vehicles", id); return v ? (v.plate + " · " + v.model) : "—"; }
  function trailerLabel(id) { const t = byId("trailers", id); return t ? (t.plate + " · " + trailerTypeLabel(t.trailer_type)) : "—"; }

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
  const TRAILER_TYPE_LABELS = { tanque: "Tanque", bitrem: "Bitrem", tanque_isotermico: "Tanque isotérmico", implemento: "Implemento", outro: "Outro" };
  const CARRIER_TYPE_LABELS = { propria: "Própria", terceiro: "Terceiro", agregado: "Agregado" };
  function trailerTypeLabel(t) { return TRAILER_TYPE_LABELS[t] || t || "Tanque"; }
  function carrierTypeLabel(t) { return CARRIER_TYPE_LABELS[t] || t || "—"; }

  /* ---------------- Consulta operacional ---------------- */
  function evaluateOperation(sel) {
    const checks = [];
    const rank = { apto: 0, pendente: 1, atencao: 2, bloqueado: 3 };
    let worst = "apto";
    function reg(scope, type, id) {
      if (!id) return;
      const st = entityStatus(type, id);
      const sum = entityDocSummary(type, id);
      let msg;
      if (st === "bloqueado") msg = sum.vencido ? (sum.vencido + " documento(s) vencido(s).") : "Entidade bloqueada.";
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

    // Exigências da base (se selecionada)
    let baseCheck = null;
    if (sel.loading_base_id) {
      const missing = baseRequirementGaps(sel);
      let st = "apto";
      if (missing.blocked.length) st = "bloqueado";
      else if (missing.attention.length) st = "atencao";
      baseCheck = { missing: missing, status: st };
      if (rank[st] > rank[worst]) worst = st;
      checks.push({
        scope: "Exigências da base", status: st, type: "base", id: sel.loading_base_id,
        message: st === "apto" ? "Exigências atendidas." :
                 (missing.blocked.length ? missing.blocked.length + " exigência(s) bloqueante(s)." :
                  missing.attention.length + " ponto(s) de atenção.")
      });
    }

    const resultMap = { apto: "liberado", atencao: "liberado_atencao", pendente: "pendente", bloqueado: "bloqueado" };
    return { result: resultMap[worst], worst: worst, checks: checks, baseCheck: baseCheck };
  }

  // Confronta as exigências normalizadas da base com os documentos do conjunto.
  function baseRequirementGaps(sel) {
    const blocked = [], attention = [];
    const reqs = state.loading_base_requirements.filter(function (r) {
      return r.loading_base_id === sel.loading_base_id && r.is_required;
    });
    const entityIdByType = {
      carrier: sel.carrier_id, driver: sel.driver_id, vehicle: sel.vehicle_id, trailer: sel.trailer_id
    };
    reqs.forEach(function (r) {
      const eid = entityIdByType[r.entity_type];
      const typeName = docTypeName(r.document_type_id);
      if (!eid) {
        if (r.is_blocking) blocked.push(typeName + " (entidade não informada)");
        return;
      }
      const docs = docsFor(r.entity_type, eid).filter(function (d) { return d.document_type_id === r.document_type_id; });
      let best = null;
      docs.forEach(function (d) {
        const st = docStatus(d);
        if (best === null || statusScore(st) < statusScore(best)) best = st;
      });
      if (best === null) { (r.is_blocking ? blocked : attention).push(typeName + " (ausente)"); }
      else if (best === "vencido") { (r.is_blocking ? blocked : attention).push(typeName + " (vencido)"); }
      else if (best === "a_vencer") { attention.push(typeName + " (a vencer)"); }
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
          typeName: docTypeName(d.document_type_id),
          days: daysUntil(d.expiration_date)
        });
      }
    });
    list.sort(function (a, b) { return (a.days || 0) - (b.days || 0); });
    return list;
  }

  /* ---------------- CRUD genérico ---------------- */
  function genId(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 8); }

  function upsert(collection, obj, prefix) {
    const now = new Date().toISOString();
    if (!obj.id) {
      obj.id = genId(prefix || "x");
      obj.created_at = now; obj.updated_at = now;
      state[collection].push(obj);
    } else {
      obj.updated_at = now;
      const i = state[collection].findIndex(function (x) { return x.id === obj.id; });
      if (i >= 0) { obj.created_at = state[collection][i].created_at || now; state[collection][i] = obj; }
      else state[collection].push(obj);
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
    op.created_at = new Date().toISOString();
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
      { id: "u-guest", name: "Usuário Demo", email: email, role: "consulta", company_id: companyId };
    session.user = user;
    session.companyId = companyId || user.company_id || state.companies[0].id;
    return session;
  }
  function logout() { session = { user: null, companyId: null }; }
  function setCompany(id) { session.companyId = id; }

  window.Store = {
    state: function () { return state; },
    session: function () { return session; },
    TODAY: TODAY,
    // datas
    fmtDate: fmtDate, daysUntil: daysUntil, parseDate: parseDate,
    // status
    docStatus: docStatus, DOC_STATUS_META: DOC_STATUS_META,
    entityStatus: entityStatus, OP_STATUS_META: OP_STATUS_META,
    entityDocSummary: entityDocSummary, docsFor: docsFor, requiredTypeIds: requiredTypeIds,
    // escopo
    carriers: carriers, drivers: drivers, vehicles: vehicles, trailers: trailers, loadingBases: loadingBases,
    allScopedDocuments: allScopedDocuments, carrierIds: carrierIds,
    // lookups
    byId: byId, carrierName: carrierName, docTypeName: docTypeName, baseName: baseName,
    driverName: driverName, vehicleLabel: vehicleLabel, trailerLabel: trailerLabel,
    entityLabel: entityLabel, ENTITY_LABELS: ENTITY_LABELS,
    trailerTypeLabel: trailerTypeLabel, carrierTypeLabel: carrierTypeLabel,
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
