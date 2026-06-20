/* =========================================================================
   Views — renderização de cada um dos 12 módulos do sistema.
   ========================================================================= */
(function () {
  "use strict";

  const S = window.Store;
  const U = window.UI;
  const esc = U.esc;

  function content() { return document.getElementById("content"); }

  /* ============================================================
     1) DASHBOARD
     ============================================================ */
  function dashboard() {
    const docs = S.allScopedDocuments();
    const counts = { valido: 0, a_vencer: 0, vencido: 0, pendente: 0, nao_aplicavel: 0 };
    docs.forEach(function (d) { counts[S.docStatus(d)]++; });

    const carriers = S.carriers(), drivers = S.drivers(), vehicles = S.vehicles(), trailers = S.trailers();
    function countStatus(list, type) {
      const r = { apto: 0, atencao: 0, pendente: 0, bloqueado: 0 };
      list.forEach(function (x) { r[S.entityStatus(type, x.id)]++; });
      return r;
    }
    const cSt = countStatus(carriers, "carrier"), dSt = countStatus(drivers, "driver"),
          vSt = countStatus(vehicles, "vehicle"), tSt = countStatus(trailers, "trailer");
    const alerts = S.alerts();

    let h = '<div class="page-head"><div><h2>Dashboard</h2><p>Visão geral do controle documental da frota.</p></div>' +
      '<div class="page-actions"><button class="btn btn-soft" data-nav="consulta">Nova consulta operacional</button>' +
      '<button class="btn btn-primary" data-nav="documentos">Gerenciar documentos</button></div></div>';

    // Cards de resumo de documentos
    h += '<div class="stat-grid">';
    h += U.statCard({ label: "Documentos válidos", value: counts.valido, dot: "#16A34A", color: "#16A34A" });
    h += U.statCard({ label: "A vencer (30 dias)", value: counts.a_vencer, dot: "#D97706", color: "#D97706" });
    h += U.statCard({ label: "Vencidos", value: counts.vencido, dot: "#DC2626", color: "#DC2626" });
    h += U.statCard({ label: "Pendentes", value: counts.pendente, dot: "#6B7280", color: "#6B7280" });
    h += "</div>";

    // Status operacional das entidades
    h += '<div class="card-grid">';
    h += entityStatusCard("Transportadoras", "transportadoras", carriers.length, cSt);
    h += entityStatusCard("Motoristas", "motoristas", drivers.length, dSt);
    h += entityStatusCard("Cavalos mecânicos", "veiculos", vehicles.length, vSt);
    h += entityStatusCard("Tanques / implementos", "tanques", trailers.length, tSt);
    h += "</div>";

    // Alertas
    h += '<div class="card mt-16"><div class="card-head"><h3>Alertas de vencimento</h3>' +
      '<span class="badge ' + (alerts.length ? "red" : "green") + '">' + alerts.length + ' alerta(s)</span></div><div class="card-body">';
    if (!alerts.length) {
      h += U.emptyState("Tudo em dia", "Não há documentos vencidos ou a vencer nos próximos 30 dias.", "✅");
    } else {
      alerts.slice(0, 8).forEach(function (a) {
        const isVenc = a.status === "vencido";
        h += '<div class="alert-row"><div class="ar-bar ' + (isVenc ? "red" : "amber") + '"></div>' +
          '<div class="alert-main"><div class="am-t">' + esc(a.typeName) + " · " + esc(a.entityLabel) + "</div>" +
          '<div class="am-s">' + esc(a.entityType) + " · vence em " + S.fmtDate(a.doc.expiration_date) + "</div></div>" +
          U.docBadge(a.status) +
          '<span class="muted mono nowrap" style="margin-left:10px;min-width:74px;text-align:right">' +
          (isVenc ? Math.abs(a.days) + " d atrás" : "em " + a.days + " d") + "</span></div>";
      });
      if (alerts.length > 8) {
        h += '<div style="text-align:center;margin-top:12px"><button class="btn btn-ghost btn-sm" data-nav="vencimentos">Ver todos os ' + alerts.length + " vencimentos</button></div>";
      }
    }
    h += "</div></div>";

    content().innerHTML = h;
  }

  function entityStatusCard(title, route, total, st) {
    const segs = [
      ["apto", st.apto, "#16A34A"], ["atencao", st.atencao, "#D97706"],
      ["pendente", st.pendente, "#6B7280"], ["bloqueado", st.bloqueado, "#DC2626"]
    ];
    let bar = '<div class="progress" style="display:flex">';
    segs.forEach(function (s) {
      if (s[1] > 0) bar += '<span style="background:' + s[2] + ';width:' + (s[1] / total * 100) + '%"></span>';
    });
    bar += "</div>";
    let legend = '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:12px">';
    segs.forEach(function (s) {
      legend += '<span class="muted" style="font-size:12px;display:flex;align-items:center;gap:6px">' +
        '<span class="stat-dot" style="background:' + s[2] + '"></span>' +
        S.OP_STATUS_META[s[0]].label + ": <strong style=\"color:var(--text)\">" + s[1] + "</strong></span>";
    });
    legend += "</div>";
    return '<div class="card"><div class="card-head"><h3>' + esc(title) + ' <span class="sub">(' + total + ")</span></h3>" +
      '<button class="link-btn" data-nav="' + route + '">Ver todos →</button></div>' +
      '<div class="card-body">' + bar + legend + "</div></div>";
  }

  /* ============================================================
     Helper genérico: célula de status operacional + resumo de docs
     ============================================================ */
  function docSummaryCell(type, id) {
    const sum = S.entityDocSummary(type, id);
    const parts = [];
    if (sum.vencido) parts.push(U.badge("red", sum.vencido + " venc."));
    if (sum.a_vencer) parts.push(U.badge("amber", sum.a_vencer + " a venc."));
    if (sum.pendente) parts.push(U.badge("gray", sum.pendente + " pend."));
    if (!parts.length) parts.push(U.badge("green", "Em dia"));
    return parts.join(" ");
  }

  /* ============================================================
     3) TRANSPORTADORAS
     ============================================================ */
  function transportadoras() {
    pageList({
      title: "Transportadoras",
      subtitle: "Empresas de transporte vinculadas e seus documentos corporativos.",
      addLabel: "Nova transportadora",
      onAdd: function () { carrierForm(); },
      filters: [statusFilter("f-carrier-status")],
      render: function (q) {
        let rows = S.carriers();
        const stf = val("f-carrier-status");
        rows = rows.filter(function (c) {
          if (q && ((c.trade_name || "") + (c.legal_name || "") + c.cnpj + (c.responsible_name || "")).toLowerCase().indexOf(q) < 0) return false;
          if (stf && S.entityStatus("carrier", c.id) !== stf) return false;
          return true;
        });
        return U.table([
          { label: "Transportadora", render: function (c) {
            return '<div class="row-main">' + esc(c.trade_name || c.legal_name) + '</div><div class="row-sub">' + esc(c.cnpj) + " · " + esc(S.carrierTypeLabel(c.carrier_type)) + "</div>";
          } },
          { label: "Responsável", render: function (c) { return esc(c.responsible_name || "—") + '<div class="row-sub">' + esc(c.phone || "") + "</div>"; } },
          { label: "Documentos", render: function (c) { return docSummaryCell("carrier", c.id); } },
          { label: "Status", render: function (c) { return U.opBadge(S.entityStatus("carrier", c.id)); } },
          { label: "", thClass: "text-right", className: "text-right", render: function (c) {
            return rowActions([
              ["Detalhes", function () { carrierDetail(c.id); }],
              ["Editar", function () { carrierForm(c.id); }],
              ["Excluir", function () { removeEntity("carriers", c.id, "Transportadora"); }, "danger"]
            ]);
          } }
        ], rows, { emptyTitle: "Nenhuma transportadora", emptyText: "Cadastre a primeira transportadora.", emptyEmoji: "🚛" });
      }
    });
  }

  function carrierForm(id) {
    const c = id ? S.byId("carriers", id) : {};
    U.openModal({
      title: id ? "Editar transportadora" : "Nova transportadora",
      body: U.buildForm([
        { name: "legal_name", label: "Razão social", required: true, full: true },
        { name: "trade_name", label: "Nome fantasia", full: true },
        { name: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00" },
        { name: "state_registration", label: "Inscrição estadual" },
        { name: "responsible_name", label: "Responsável" },
        { name: "phone", label: "Telefone" },
        { name: "email", label: "E-mail" },
        { name: "carrier_type", label: "Tipo", type: "select", options: [{ value: "terceiro", label: "Terceiro" }, { value: "propria", label: "Própria" }, { value: "agregado", label: "Agregado" }] },
        { name: "status", label: "Situação", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "bloqueado", label: "Bloqueado" }] },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], c),
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.legal_name) return U.toast("Informe a razão social", "error");
          data.id = c.id; data.company_id = c.company_id || S.currentCompanyId();
          S.upsert("carriers", data, "ca");
          U.closeModal(); U.toast("Transportadora salva", "success"); window.Router.reload();
        } }
      ]
    });
  }

  function carrierDetail(id) {
    const c = S.byId("carriers", id);
    const docs = S.docsFor("carrier", id);
    let body = '<div class="detail-grid" style="margin-bottom:18px">' +
      U.detailItem("Razão social", esc(c.legal_name)) + U.detailItem("CNPJ", esc(c.cnpj)) +
      U.detailItem("Inscrição estadual", esc(c.state_registration)) + U.detailItem("Tipo", esc(S.carrierTypeLabel(c.carrier_type))) +
      U.detailItem("Responsável", esc(c.responsible_name)) + U.detailItem("Telefone", esc(c.phone)) +
      U.detailItem("E-mail", esc(c.email)) +
      U.detailItem("Status operacional", U.opBadge(S.entityStatus("carrier", id))) + "</div>";
    body += docsMiniTable(docs);
    U.openModal({ title: c.trade_name || c.legal_name, body: body, buttons: [{ label: "Fechar", className: "btn-ghost", onClick: U.closeModal }] });
  }

  /* ============================================================
     4) MOTORISTAS
     ============================================================ */
  function motoristas() {
    pageList({
      title: "Motoristas",
      subtitle: "Condutores habilitados, CNH, MOPP, ASO e toxicológico.",
      addLabel: "Novo motorista",
      onAdd: function () { driverForm(); },
      filters: [carrierFilter("f-driver-carrier"), statusFilter("f-driver-status")],
      render: function (q) {
        let rows = S.drivers();
        const cf = val("f-driver-carrier"), stf = val("f-driver-status");
        rows = rows.filter(function (d) {
          if (q && (d.full_name + d.cpf + d.cnh_number).toLowerCase().indexOf(q) < 0) return false;
          if (cf && d.carrier_id !== cf) return false;
          if (stf && S.entityStatus("driver", d.id) !== stf) return false;
          return true;
        });
        return U.table([
          { label: "Motorista", render: function (d) {
            return '<div class="row-main">' + esc(d.full_name) + '</div><div class="row-sub">CPF ' + esc(d.cpf) + " · CNH " + esc(d.cnh_category) + "</div>";
          } },
          { label: "Transportadora", render: function (d) { return esc(S.carrierName(d.carrier_id)); } },
          { label: "Documentos", render: function (d) { return docSummaryCell("driver", d.id); } },
          { label: "Status", render: function (d) { return U.opBadge(S.entityStatus("driver", d.id)); } },
          { label: "", thClass: "text-right", className: "text-right", render: function (d) {
            return rowActions([
              ["Detalhes", function () { driverDetail(d.id); }],
              ["Editar", function () { driverForm(d.id); }],
              ["Excluir", function () { removeEntity("drivers", d.id, "Motorista"); }, "danger"]
            ]);
          } }
        ], rows, { emptyTitle: "Nenhum motorista", emptyText: "Cadastre o primeiro motorista.", emptyEmoji: "🧑‍✈️" });
      }
    });
  }

  function driverForm(id) {
    const d = id ? S.byId("drivers", id) : {};
    U.openModal({
      title: id ? "Editar motorista" : "Novo motorista",
      body: U.buildForm([
        { name: "full_name", label: "Nome completo", required: true, full: true },
        { name: "carrier_id", label: "Transportadora", type: "select", options: carrierOptions(), required: true },
        { name: "cpf", label: "CPF" },
        { name: "rg", label: "RG" },
        { name: "phone", label: "Telefone" },
        { name: "email", label: "E-mail" },
        { name: "cnh_number", label: "Nº CNH" },
        { name: "cnh_category", label: "Categoria CNH", type: "select", options: ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE"] },
        { name: "cnh_expiration_date", label: "Validade CNH", type: "date" },
        { name: "has_ear", label: "Possui EAR", type: "checkbox" },
        { name: "mopp_expiration_date", label: "Validade MOPP", type: "date" },
        { name: "aso_expiration_date", label: "Validade ASO", type: "date" },
        { name: "status", label: "Situação", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "bloqueado", label: "Bloqueado" }] },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], d),
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.full_name) return U.toast("Informe o nome", "error");
          data.id = d.id; data.company_id = d.company_id || S.currentCompanyId();
          S.upsert("drivers", data, "dr");
          U.closeModal(); U.toast("Motorista salvo", "success"); window.Router.reload();
        } }
      ]
    });
  }

  function driverDetail(id) {
    const d = S.byId("drivers", id);
    const docs = S.docsFor("driver", id);
    let body = '<div class="detail-grid" style="margin-bottom:18px">' +
      U.detailItem("Transportadora", esc(S.carrierName(d.carrier_id))) +
      U.detailItem("CPF", esc(d.cpf)) + U.detailItem("RG", esc(d.rg)) +
      U.detailItem("CNH", esc(d.cnh_number) + " (" + esc(d.cnh_category) + ")") +
      U.detailItem("Validade CNH", S.fmtDate(d.cnh_expiration_date)) +
      U.detailItem("EAR", d.has_ear ? "Sim" : "Não") +
      U.detailItem("Validade MOPP", S.fmtDate(d.mopp_expiration_date)) +
      U.detailItem("Validade ASO", S.fmtDate(d.aso_expiration_date)) +
      U.detailItem("Status operacional", U.opBadge(S.entityStatus("driver", id))) + "</div>";
    body += docsMiniTable(docs);
    U.openModal({ title: d.full_name, body: body, buttons: [{ label: "Fechar", className: "btn-ghost", onClick: U.closeModal }] });
  }

  /* ============================================================
     5) VEÍCULOS (cavalos mecânicos)
     ============================================================ */
  function veiculos() {
    pageList({
      title: "Veículos (cavalos mecânicos)",
      subtitle: "Cavalos mecânicos da frota e documentação veicular.",
      addLabel: "Novo veículo",
      onAdd: function () { vehicleForm(); },
      filters: [carrierFilter("f-veh-carrier"), statusFilter("f-veh-status")],
      render: function (q) {
        let rows = S.vehicles();
        const cf = val("f-veh-carrier"), stf = val("f-veh-status");
        rows = rows.filter(function (v) {
          if (q && (v.plate + v.brand + v.model).toLowerCase().indexOf(q) < 0) return false;
          if (cf && v.carrier_id !== cf) return false;
          if (stf && S.entityStatus("vehicle", v.id) !== stf) return false;
          return true;
        });
        return U.table([
          { label: "Placa", render: function (v) {
            return '<div class="row-main mono">' + esc(v.plate) + '</div><div class="row-sub">' + esc(v.brand) + " " + esc(v.model) + " · " + esc(v.year) + "</div>";
          } },
          { label: "Transportadora", render: function (v) { return esc(S.carrierName(v.carrier_id)); } },
          { label: "Documentos", render: function (v) { return docSummaryCell("vehicle", v.id); } },
          { label: "Status", render: function (v) { return U.opBadge(S.entityStatus("vehicle", v.id)); } },
          { label: "", thClass: "text-right", className: "text-right", render: function (v) {
            return rowActions([
              ["Detalhes", function () { vehicleDetail(v.id); }],
              ["Editar", function () { vehicleForm(v.id); }],
              ["Excluir", function () { removeEntity("vehicles", v.id, "Veículo"); }, "danger"]
            ]);
          } }
        ], rows, { emptyTitle: "Nenhum veículo", emptyText: "Cadastre o primeiro cavalo mecânico.", emptyEmoji: "🚚" });
      }
    });
  }

  function vehicleForm(id) {
    const v = id ? S.byId("vehicles", id) : {};
    U.openModal({
      title: id ? "Editar veículo" : "Novo veículo",
      body: U.buildForm([
        { name: "plate", label: "Placa", required: true },
        { name: "carrier_id", label: "Transportadora", type: "select", options: carrierOptions(), required: true },
        { name: "brand", label: "Marca" },
        { name: "model", label: "Modelo" },
        { name: "year", label: "Ano", type: "number" },
        { name: "renavam", label: "RENAVAM" },
        { name: "chassis", label: "Chassi" },
        { name: "vehicle_type", label: "Tipo", type: "select", options: [{ value: "cavalo_mecanico", label: "Cavalo mecânico" }, { value: "truck", label: "Truck" }, { value: "toco", label: "Toco" }, { value: "vanderleia", label: "Vanderléia" }, { value: "outro", label: "Outro" }] },
        { name: "status", label: "Situação", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "manutencao", label: "Manutenção" }, { value: "bloqueado", label: "Bloqueado" }] },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], v),
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.plate) return U.toast("Informe a placa", "error");
          data.id = v.id; data.company_id = v.company_id || S.currentCompanyId();
          data.year = Number(data.year) || null;
          S.upsert("vehicles", data, "ve");
          U.closeModal(); U.toast("Veículo salvo", "success"); window.Router.reload();
        } }
      ]
    });
  }

  function vehicleDetail(id) {
    const v = S.byId("vehicles", id);
    const docs = S.docsFor("vehicle", id);
    let body = '<div class="detail-grid" style="margin-bottom:18px">' +
      U.detailItem("Transportadora", esc(S.carrierName(v.carrier_id))) +
      U.detailItem("Marca/Modelo", esc(v.brand) + " " + esc(v.model)) +
      U.detailItem("Ano", esc(v.year)) + U.detailItem("RENAVAM", esc(v.renavam)) +
      U.detailItem("Chassi", esc(v.chassis)) +
      U.detailItem("Status operacional", U.opBadge(S.entityStatus("vehicle", id))) + "</div>";
    body += docsMiniTable(docs);
    U.openModal({ title: "Cavalo " + v.plate, body: body, buttons: [{ label: "Fechar", className: "btn-ghost", onClick: U.closeModal }] });
  }

  /* ============================================================
     6) TANQUES / IMPLEMENTOS
     ============================================================ */
  function tanques() {
    pageList({
      title: "Tanques / Implementos",
      subtitle: "Semirreboques-tanque, capacidade, compartimentos e inspeções.",
      addLabel: "Novo tanque",
      onAdd: function () { trailerForm(); },
      filters: [carrierFilter("f-tr-carrier"), statusFilter("f-tr-status")],
      render: function (q) {
        let rows = S.trailers();
        const cf = val("f-tr-carrier"), stf = val("f-tr-status");
        rows = rows.filter(function (t) {
          if (q && (t.plate + S.trailerTypeLabel(t.trailer_type)).toLowerCase().indexOf(q) < 0) return false;
          if (cf && t.carrier_id !== cf) return false;
          if (stf && S.entityStatus("trailer", t.id) !== stf) return false;
          return true;
        });
        return U.table([
          { label: "Placa", render: function (t) {
            return '<div class="row-main mono">' + esc(t.plate) + '</div><div class="row-sub">' + esc(S.trailerTypeLabel(t.trailer_type)) + " · " + ((t.total_capacity || 0) / 1000) + ".000 L · " + (t.compartments_count || 0) + " comp.</div>";
          } },
          { label: "Transportadora", render: function (t) { return esc(S.carrierName(t.carrier_id)); } },
          { label: "Documentos", render: function (t) { return docSummaryCell("trailer", t.id); } },
          { label: "Status", render: function (t) { return U.opBadge(S.entityStatus("trailer", t.id)); } },
          { label: "", thClass: "text-right", className: "text-right", render: function (t) {
            return rowActions([
              ["Detalhes", function () { trailerDetail(t.id); }],
              ["Editar", function () { trailerForm(t.id); }],
              ["Excluir", function () { removeEntity("trailers", t.id, "Tanque"); }, "danger"]
            ]);
          } }
        ], rows, { emptyTitle: "Nenhum tanque", emptyText: "Cadastre o primeiro tanque/implemento.", emptyEmoji: "🛢️" });
      }
    });
  }

  function trailerForm(id) {
    const t = id ? S.byId("trailers", id) : {};
    U.openModal({
      title: id ? "Editar tanque" : "Novo tanque/implemento",
      body: U.buildForm([
        { name: "plate", label: "Placa", required: true },
        { name: "carrier_id", label: "Transportadora", type: "select", options: carrierOptions(), required: true },
        { name: "trailer_type", label: "Tipo", type: "select", options: [{ value: "tanque", label: "Tanque" }, { value: "bitrem", label: "Bitrem" }, { value: "tanque_isotermico", label: "Tanque isotérmico" }, { value: "implemento", label: "Implemento" }, { value: "outro", label: "Outro" }] },
        { name: "total_capacity", label: "Capacidade (L)", type: "number" },
        { name: "compartments_count", label: "Compartimentos", type: "number" },
        { name: "renavam", label: "RENAVAM" },
        { name: "chassis", label: "Chassi" },
        { name: "allowed_products", label: "Produtos permitidos (vírgula)", full: true, placeholder: "Óleo Diesel S10, Gasolina Comum" },
        { name: "status", label: "Situação", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }, { value: "manutencao", label: "Manutenção" }, { value: "bloqueado", label: "Bloqueado" }] },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], Object.assign({}, t, { allowed_products: (t.allowed_products || []).join(", ") })),
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.plate) return U.toast("Informe a placa", "error");
          data.id = t.id; data.company_id = t.company_id || S.currentCompanyId();
          data.total_capacity = Number(data.total_capacity) || 0; data.compartments_count = Number(data.compartments_count) || 0;
          data.allowed_products = (data.allowed_products || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
          S.upsert("trailers", data, "tr");
          U.closeModal(); U.toast("Tanque salvo", "success"); window.Router.reload();
        } }
      ]
    });
  }

  function trailerDetail(id) {
    const t = S.byId("trailers", id);
    const docs = S.docsFor("trailer", id);
    let body = '<div class="detail-grid" style="margin-bottom:18px">' +
      U.detailItem("Transportadora", esc(S.carrierName(t.carrier_id))) +
      U.detailItem("Tipo", esc(S.trailerTypeLabel(t.trailer_type))) + U.detailItem("Capacidade", ((t.total_capacity || 0) / 1000) + ".000 L") +
      U.detailItem("Compartimentos", esc(t.compartments_count)) +
      U.detailItem("RENAVAM", esc(t.renavam)) +
      U.detailItem("Produtos permitidos", esc((t.allowed_products || []).join(", ") || "—")) +
      U.detailItem("Status operacional", U.opBadge(S.entityStatus("trailer", id))) + "</div>";
    body += docsMiniTable(docs);
    U.openModal({ title: "Tanque " + t.plate, body: body, buttons: [{ label: "Fechar", className: "btn-ghost", onClick: U.closeModal }] });
  }

  /* ============================================================
     7) DOCUMENTOS
     ============================================================ */
  function documentos() {
    let h = '<div class="page-head"><div><h2>Documentos</h2><p>Repositório central de todos os documentos da frota.</p></div>' +
      '<div class="page-actions"><button class="btn btn-primary" id="doc-add">Novo documento</button></div></div>';

    h += '<div class="filters">' +
      '<div class="search-box"><input id="f-doc-q" placeholder="Buscar por número, tipo ou entidade..." /></div>' +
      fieldSelect("f-doc-entity", "Vínculo", [{ value: "", label: "Todos" }, { value: "carrier", label: "Transportadora" }, { value: "driver", label: "Motorista" }, { value: "vehicle", label: "Veículo" }, { value: "trailer", label: "Tanque" }]) +
      fieldSelect("f-doc-status", "Status", [{ value: "", label: "Todos" }, { value: "valido", label: "Válido" }, { value: "a_vencer", label: "A vencer" }, { value: "vencido", label: "Vencido" }, { value: "pendente", label: "Pendente" }]) +
      "</div>";
    h += '<div class="card"><div id="doc-table"></div></div>';
    content().innerHTML = h;

    function renderTable() {
      const q = (val("f-doc-q") || "").toLowerCase();
      const ef = val("f-doc-entity"), stf = val("f-doc-status");
      let rows = S.allScopedDocuments().filter(function (d) {
        const label = ((d.file_name || "") + S.docTypeName(d.document_type_id) + S.entityLabel(d.entity_type, d.entity_id)).toLowerCase();
        if (q && label.indexOf(q) < 0) return false;
        if (ef && d.entity_type !== ef) return false;
        if (stf && S.docStatus(d) !== stf) return false;
        return true;
      });
      rows.sort(function (a, b) { return (S.daysUntil(a.expiration_date) || 9999) - (S.daysUntil(b.expiration_date) || 9999); });
      document.getElementById("doc-table").innerHTML = U.table([
        { label: "Documento", render: function (d) {
          return '<div class="row-main">' + esc(S.docTypeName(d.document_type_id)) + '</div><div class="row-sub mono">' + esc(d.file_name || "—") + "</div>";
        } },
        { label: "Vínculo", render: function (d) {
          return '<div>' + esc(S.entityLabel(d.entity_type, d.entity_id)) + '</div><div class="row-sub">' + esc(S.ENTITY_LABELS[d.entity_type]) + "</div>";
        } },
        { label: "Emissão", render: function (d) { return '<span class="mono">' + S.fmtDate(d.issue_date) + "</span>"; } },
        { label: "Validade", render: function (d) { return '<span class="mono">' + S.fmtDate(d.expiration_date) + "</span>"; } },
        { label: "Status", render: function (d) { return U.docBadge(S.docStatus(d)); } },
        { label: "", thClass: "text-right", className: "text-right", render: function (d) {
          return rowActions([
            ["Editar", function () { docForm(d.id); }],
            ["Excluir", function () { removeEntity("documents", d.id, "Documento"); }, "danger"]
          ]);
        } }
      ], rows, { emptyTitle: "Nenhum documento", emptyText: "Ajuste os filtros ou cadastre um novo documento.", emptyEmoji: "📄" });
    }
    renderTable();
    document.getElementById("f-doc-q").oninput = renderTable;
    document.getElementById("f-doc-entity").onchange = renderTable;
    document.getElementById("f-doc-status").onchange = renderTable;
    document.getElementById("doc-add").onclick = function () { docForm(); };
  }

  function docForm(id) {
    const d = id ? S.byId("documents", id) : { entity_type: "carrier" };
    const types = S.state().document_types;

    function entityOptionsFor(type) {
      if (type === "carrier") return S.carriers().map(function (x) { return { value: x.id, label: x.trade_name || x.legal_name }; });
      if (type === "driver") return S.drivers().map(function (x) { return { value: x.id, label: x.full_name }; });
      if (type === "vehicle") return S.vehicles().map(function (x) { return { value: x.id, label: x.plate + " · " + x.model }; });
      if (type === "trailer") return S.trailers().map(function (x) { return { value: x.id, label: x.plate + " · " + S.trailerTypeLabel(x.trailer_type) }; });
      return [];
    }
    function typeOptionsFor(type) {
      return types.filter(function (t) { return t.entity_type === type; })
        .map(function (t) { return { value: t.id, label: t.name }; });
    }

    U.openModal({
      title: id ? "Editar documento" : "Novo documento",
      body: U.buildForm([
        { name: "entity_type", label: "Tipo de vínculo", type: "select", required: true,
          options: [{ value: "carrier", label: "Transportadora" }, { value: "driver", label: "Motorista" }, { value: "vehicle", label: "Veículo" }, { value: "trailer", label: "Tanque" }] },
        { name: "entity_id", label: "Entidade", type: "select", required: true, options: entityOptionsFor(d.entity_type) },
        { name: "document_type_id", label: "Tipo de documento", type: "select", required: true, options: typeOptionsFor(d.entity_type) },
        { name: "file_name", label: "Arquivo / identificação", placeholder: "documento.pdf" },
        { name: "issue_date", label: "Data de emissão", type: "date" },
        { name: "expiration_date", label: "Data de validade", type: "date" },
        { name: "responsible_name", label: "Responsável" },
        { name: "na", label: "Marcar como não aplicável", type: "checkbox", value: d.status === "nao_aplicavel" },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], d),
      onMount: function () {
        const form = document.getElementById("entity-form");
        const etSel = form.elements["entity_type"];
        etSel.addEventListener("change", function () {
          const type = etSel.value;
          rebuildSelect(form.elements["entity_id"], entityOptionsFor(type));
          rebuildSelect(form.elements["document_type_id"], typeOptionsFor(type));
        });
      },
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.entity_id || !data.document_type_id) return U.toast("Selecione entidade e tipo", "error");
          data.id = d.id; data.company_id = d.company_id || S.currentCompanyId();
          data.status = data.na === true ? "nao_aplicavel" : null;
          delete data.na;
          S.upsert("documents", data, "d");
          U.closeModal(); U.toast("Documento salvo", "success"); window.Router.reload();
        } }
      ]
    });
  }

  function rebuildSelect(sel, options) {
    if (!sel) return;
    sel.innerHTML = options.map(function (o) { return '<option value="' + esc(o.value) + '">' + esc(o.label) + "</option>"; }).join("");
  }

  function docsMiniTable(docs) {
    if (!docs.length) return U.emptyState("Sem documentos", "Nenhum documento cadastrado para este registro.", "📄");
    return '<h4 style="font-size:13px;margin-bottom:8px;color:var(--text-2)">DOCUMENTOS (' + docs.length + ")</h4>" +
      U.table([
        { label: "Tipo", render: function (d) { return esc(S.docTypeName(d.document_type_id)); } },
        { label: "Validade", render: function (d) { return '<span class="mono">' + S.fmtDate(d.expiration_date) + "</span>"; } },
        { label: "Status", render: function (d) { return U.docBadge(S.docStatus(d)); } }
      ], docs);
  }

  /* ============================================================
     8) VENCIMENTOS
     ============================================================ */
  function vencimentos() {
    const alerts = S.alerts();
    const venc = alerts.filter(function (a) { return a.status === "vencido"; });
    const soon = alerts.filter(function (a) { return a.status === "a_vencer"; });

    let h = '<div class="page-head"><div><h2>Vencimentos</h2><p>Documentos vencidos e próximos do vencimento (30 dias).</p></div></div>';
    h += '<div class="stat-grid">' +
      U.statCard({ label: "Vencidos", value: venc.length, dot: "#DC2626", color: "#DC2626" }) +
      U.statCard({ label: "A vencer (30 dias)", value: soon.length, dot: "#D97706", color: "#D97706" }) +
      U.statCard({ label: "Total de alertas", value: alerts.length, dot: "#2563EB", color: "#2563EB" }) +
      "</div>";

    h += '<div class="filters"><div class="search-box"><input id="f-venc-q" placeholder="Buscar..." /></div>' +
      fieldSelect("f-venc-status", "Situação", [{ value: "", label: "Todas" }, { value: "vencido", label: "Vencido" }, { value: "a_vencer", label: "A vencer" }]) + "</div>";
    h += '<div class="card"><div id="venc-table"></div></div>';
    content().innerHTML = h;

    function render() {
      const q = (val("f-venc-q") || "").toLowerCase();
      const stf = val("f-venc-status");
      let rows = alerts.filter(function (a) {
        if (stf && a.status !== stf) return false;
        if (q && (a.typeName + a.entityLabel).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      document.getElementById("venc-table").innerHTML = U.table([
        { label: "Documento", render: function (a) { return '<div class="row-main">' + esc(a.typeName) + "</div>"; } },
        { label: "Entidade", render: function (a) {
          return '<div>' + esc(a.entityLabel) + '</div><div class="row-sub">' + esc(a.entityType) + "</div>";
        } },
        { label: "Validade", render: function (a) { return '<span class="mono">' + S.fmtDate(a.doc.expiration_date) + "</span>"; } },
        { label: "Prazo", render: function (a) {
          return a.status === "vencido"
            ? '<span class="badge red plain">' + Math.abs(a.days) + " dias atrás</span>"
            : '<span class="badge amber plain">em ' + a.days + ' dias</span>';
        } },
        { label: "Status", render: function (a) { return U.docBadge(a.status); } },
        { label: "", thClass: "text-right", className: "text-right", render: function (a) {
          return rowActions([["Renovar", function () { docForm(a.doc.id); }]]);
        } }
      ], rows, { emptyTitle: "Nenhum vencimento", emptyText: "Não há documentos vencidos ou a vencer.", emptyEmoji: "✅" });
    }
    render();
    document.getElementById("f-venc-q").oninput = render;
    document.getElementById("f-venc-status").onchange = render;
  }

  /* ============================================================
     9) CONSULTA OPERACIONAL
     ============================================================ */
  function consulta() {
    let h = '<div class="page-head"><div><h2>Consulta Operacional</h2><p>Verifique se um conjunto está liberado para carregar.</p></div></div>';
    h += '<div class="card"><div class="card-head"><h3>Montar conjunto</h3></div><div class="card-body">';
    h += '<div class="form-grid">' +
      fieldSelectFull("c-carrier", "Transportadora *", [{ value: "", label: "Selecione..." }].concat(S.carriers().map(function (c) { return { value: c.id, label: c.trade_name || c.legal_name }; }))) +
      fieldSelectFull("c-driver", "Motorista *", [{ value: "", label: "Selecione..." }]) +
      fieldSelectFull("c-vehicle", "Cavalo mecânico *", [{ value: "", label: "Selecione..." }]) +
      fieldSelectFull("c-trailer", "Tanque / implemento *", [{ value: "", label: "Selecione..." }]) +
      fieldSelectFull("c-base", "Base de carregamento (opcional)", [{ value: "", label: "Nenhuma" }].concat(S.loadingBases().map(function (b) { return { value: b.id, label: b.name }; }))) +
      '<label class="field"><span>Produto (opcional)</span><select name="c-product" id="c-product"><option value="">Nenhum</option><option>Óleo Diesel S10</option><option>Óleo Diesel S500</option><option>Gasolina Comum</option><option>Etanol Hidratado</option><option>Querosene</option></select></label>' +
      '<label class="field"><span>Data da operação</span><input type="date" id="c-date" value="2026-06-20" /></label>' +
      "</div>";
    h += '<div style="margin-top:16px;display:flex;gap:10px"><button class="btn btn-primary" id="c-run">Verificar liberação</button>' +
      '<button class="btn btn-ghost" id="c-clear">Limpar</button></div>';
    h += "</div></div>";
    h += '<div id="c-result"></div>';
    h += '<div id="c-history"></div>';
    content().innerHTML = h;
    renderConsultaHistory();

    // Filtra motoristas/veículos/tanques pela transportadora escolhida
    const carrierSel = document.getElementById("c-carrier");
    carrierSel.onchange = function () {
      const cid = carrierSel.value;
      rebuildSelect(document.getElementById("c-driver"), [{ value: "", label: "Selecione..." }].concat(
        S.drivers().filter(function (d) { return d.carrier_id === cid; }).map(function (d) { return { value: d.id, label: d.full_name }; })));
      rebuildSelect(document.getElementById("c-vehicle"), [{ value: "", label: "Selecione..." }].concat(
        S.vehicles().filter(function (v) { return v.carrier_id === cid; }).map(function (v) { return { value: v.id, label: v.plate + " · " + v.model }; })));
      rebuildSelect(document.getElementById("c-trailer"), [{ value: "", label: "Selecione..." }].concat(
        S.trailers().filter(function (t) { return t.carrier_id === cid; }).map(function (t) { return { value: t.id, label: t.plate + " · " + S.trailerTypeLabel(t.trailer_type) }; })));
    };

    document.getElementById("c-clear").onclick = function () { consulta(); };
    document.getElementById("c-run").onclick = function () {
      const sel = {
        carrier_id: val("c-carrier"), driver_id: val("c-driver"),
        vehicle_id: val("c-vehicle"), trailer_id: val("c-trailer"),
        loading_base_id: val("c-base"), product: val("c-product"), operation_date: val("c-date")
      };
      if (!sel.carrier_id || !sel.driver_id || !sel.vehicle_id || !sel.trailer_id) {
        return U.toast("Selecione transportadora, motorista, cavalo e tanque", "error");
      }
      renderConsultaResult(sel);
    };
  }

  const RESULT_META = {
    liberado: { tone: "green", ico: "✓", title: "Liberado para carregar", text: "Todos os itens do conjunto estão com documentação em dia." },
    liberado_atencao: { tone: "amber", ico: "!", title: "Liberado com atenção", text: "O conjunto pode operar, mas há documentos próximos do vencimento." },
    pendente: { tone: "gray", ico: "•", title: "Pendente", text: "Há documentos obrigatórios pendentes de cadastro." },
    bloqueado: { tone: "red", ico: "✕", title: "Bloqueado", text: "Há documentos vencidos ou exigências não atendidas. Carregamento não autorizado." }
  };

  function renderConsultaResult(sel) {
    const ev = S.evaluateOperation(sel);
    const m = RESULT_META[ev.result];
    let h = '<div class="result-banner ' + m.tone + '"><span class="rb-ico">' + m.ico + "</span>" +
      "<div><h3>" + m.title + "</h3><p>" + m.text + "</p></div></div>";

    h += '<div class="card-grid">';
    // Checklist
    h += '<div class="card"><div class="card-head"><h3>Verificação por item</h3></div><div class="card-body"><div class="check-list">';
    ev.checks.forEach(function (c) {
      const tone = S.OP_STATUS_META[c.status] ? S.OP_STATUS_META[c.status].tone : "gray";
      const icoMap = { green: "✓", amber: "!", red: "✕", gray: "•" };
      h += '<div class="check-row"><div class="check-ico ' + tone + '">' + icoMap[tone] + "</div>" +
        '<div class="check-main"><div class="cm-title">' + esc(c.scope) +
        (c.id ? ' <span class="muted" style="font-weight:400">· ' + esc(S.entityLabel(c.type, c.id)) + "</span>" : "") +
        '</div><div class="cm-sub">' + esc(c.message) + "</div></div>" +
        U.opBadge(c.status) + "</div>";
    });
    h += "</div></div></div>";

    // Resumo do conjunto + base
    h += '<div class="card"><div class="card-head"><h3>Conjunto avaliado</h3></div><div class="card-body"><div class="detail-grid">' +
      U.detailItem("Transportadora", esc(S.carrierName(sel.carrier_id))) +
      U.detailItem("Motorista", esc(S.driverName(sel.driver_id))) +
      U.detailItem("Cavalo", esc(S.vehicleLabel(sel.vehicle_id))) +
      U.detailItem("Tanque", esc(S.trailerLabel(sel.trailer_id))) +
      U.detailItem("Base", sel.loading_base_id ? esc(S.baseName(sel.loading_base_id)) : "—") +
      U.detailItem("Produto", sel.product ? esc(sel.product) : "—") +
      U.detailItem("Data", S.fmtDate(sel.operation_date)) + "</div>";

    if (ev.baseCheck) {
      const bc = ev.baseCheck;
      h += '<div style="margin-top:16px"><h4 style="font-size:13px;margin-bottom:8px;color:var(--text-2)">EXIGÊNCIAS DA BASE</h4>';
      if (bc.missing.blocked.length) {
        h += '<p class="muted" style="font-size:12.5px;margin-bottom:6px">Bloqueantes:</p><ul class="list-clean">';
        bc.missing.blocked.forEach(function (x) { h += "<li>" + esc(x) + "</li>"; });
        h += "</ul>";
      }
      if (bc.missing.attention.length) {
        h += '<p class="muted" style="font-size:12.5px;margin:8px 0 6px">Atenção:</p><ul class="list-clean">';
        bc.missing.attention.forEach(function (x) { h += "<li>" + esc(x) + "</li>"; });
        h += "</ul>";
      }
      if (!bc.missing.blocked.length && !bc.missing.attention.length) {
        h += '<p class="badge green">Todas as exigências documentais atendidas</p>';
      }
      h += "</div>";
    }
    h += '<div style="margin-top:16px"><button class="btn btn-soft btn-sm" id="c-save">Salvar consulta no histórico</button></div>';
    h += "</div></div></div>";

    document.getElementById("c-result").innerHTML = h;
    document.getElementById("c-result").scrollIntoView({ behavior: "smooth", block: "nearest" });
    document.getElementById("c-save").onclick = function () {
      const op = JSON.parse(JSON.stringify(sel));
      op.company_id = S.currentCompanyId();
      op.status = { liberado: "liberado", liberado_atencao: "atencao", pendente: "pendente", bloqueado: "bloqueado" }[ev.result];
      S.saveOperation(op);
      U.toast("Consulta salva no histórico", "success");
      renderConsultaHistory();
    };
  }

  const OP_RESULT_META = {
    liberado: { tone: "green", label: "Liberado" },
    atencao: { tone: "amber", label: "Liberado c/ atenção" },
    pendente: { tone: "gray", label: "Pendente" },
    bloqueado: { tone: "red", label: "Bloqueado" }
  };

  function renderConsultaHistory() {
    const ops = S.state().operations.filter(function (o) { return o.company_id === S.currentCompanyId(); });
    let h = '<div class="card mt-16"><div class="card-head"><h3>Histórico de consultas</h3><span class="sub">' + ops.length + " registro(s)</span></div><div>";
    h += U.table([
      { label: "Data", render: function (o) { return '<span class="mono">' + S.fmtDate(o.operation_date) + "</span>"; } },
      { label: "Transportadora", render: function (o) { return esc(S.carrierName(o.carrier_id)); } },
      { label: "Conjunto", render: function (o) {
        return '<div class="row-sub">' + esc(S.driverName(o.driver_id)) + " · " +
          esc(S.byId("vehicles", o.vehicle_id) ? S.byId("vehicles", o.vehicle_id).plate : "—") + " · " +
          esc(S.byId("trailers", o.trailer_id) ? S.byId("trailers", o.trailer_id).plate : "—") + "</div>";
      } },
      { label: "Base / Produto", render: function (o) {
        return '<div>' + esc(o.loading_base_id ? S.baseName(o.loading_base_id) : "—") + '</div><div class="row-sub">' + esc(o.product || "—") + "</div>";
      } },
      { label: "Resultado", render: function (o) {
        const m = OP_RESULT_META[o.status] || { tone: "gray", label: o.status };
        return U.badge(m.tone, m.label);
      } }
    ], ops, { emptyTitle: "Sem consultas", emptyText: "As consultas salvas aparecerão aqui.", emptyEmoji: "🔎" });
    h += "</div></div>";
    const el = document.getElementById("c-history");
    if (el) el.innerHTML = h;
  }

  /* ============================================================
     10) BASES DE CARREGAMENTO
     ============================================================ */
  function bases() {
    const list = S.loadingBases();
    let h = '<div class="page-head"><div><h2>Bases de Carregamento</h2><p>Exigências específicas por base — apoio à liberação operacional.</p></div>' +
      '<div class="page-actions"><button class="btn btn-primary" id="base-add">Nova base</button></div></div>';
    h += '<div class="card-grid">';
    list.forEach(function (b) {
      const reqs = S.state().loading_base_requirements.filter(function (r) { return r.loading_base_id === b.id; });
      h += '<div class="card"><div class="card-head"><div><h3>' + esc(b.name) + '</h3><span class="sub">' + esc(b.operator_name) + " · " + esc(b.city) + "/" + esc(b.state) + "</span></div>" +
        '<button class="link-btn" data-base-edit="' + b.id + '">Editar →</button></div><div class="card-body">';
      h += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' +
        flagChip("Integração", b.requires_integration) + flagChip("Agendamento", b.requires_scheduling) +
        flagChip("Cad. motorista", b.requires_driver_registration) + flagChip("Cad. veículo", b.requires_vehicle_registration) +
        flagChip("Cad. tanque", b.requires_trailer_registration) + "</div>";
      h += '<div class="dl" style="font-size:11.5px;color:var(--text-2);font-weight:600;margin-bottom:6px">EXIGÊNCIAS DOCUMENTAIS</div>';
      if (reqs.length) {
        h += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
        reqs.forEach(function (r) {
          h += '<span class="chip">' + esc(S.docTypeName(r.document_type_id)) + " · " + esc(S.ENTITY_LABELS[r.entity_type]) +
            (r.is_blocking ? ' <span class="badge red plain" style="margin-left:4px">bloqueia</span>' : "") + "</span>";
        });
        h += "</div>";
      } else { h += '<p class="muted" style="font-size:12.5px;margin-bottom:12px">Nenhuma exigência cadastrada.</p>'; }
      if (b.notes) h += '<p class="muted" style="font-size:12.5px;line-height:1.5">' + esc(b.notes) + "</p>";
      h += "</div></div>";
    });
    h += "</div>";
    content().innerHTML = h;

    document.getElementById("base-add").onclick = function () { baseForm(); };
    Array.prototype.forEach.call(document.querySelectorAll("[data-base-edit]"), function (el) {
      el.onclick = function () { baseForm(el.getAttribute("data-base-edit")); };
    });
  }

  function flagChip(label, on) {
    return '<span class="badge ' + (on ? "blue" : "gray") + '">' + (on ? "✓ " : "— ") + esc(label) + "</span>";
  }

  function baseForm(id) {
    const b = id ? S.byId("loading_bases", id) : {};
    U.openModal({
      title: id ? "Editar base" : "Nova base de carregamento",
      body: U.buildForm([
        { name: "name", label: "Nome da base", required: true, full: true },
        { name: "operator_name", label: "Operador / distribuidora" },
        { name: "city", label: "Cidade" },
        { name: "state", label: "UF" },
        { name: "base_type", label: "Tipo", type: "select", options: [{ value: "primaria", label: "Primária" }, { value: "secundaria", label: "Secundária" }, { value: "terminal", label: "Terminal" }, { value: "outro", label: "Outro" }] },
        { name: "requires_integration", label: "Exige integração", type: "checkbox" },
        { name: "requires_scheduling", label: "Exige agendamento", type: "checkbox" },
        { name: "requires_driver_registration", label: "Exige cadastro de motorista", type: "checkbox" },
        { name: "requires_vehicle_registration", label: "Exige cadastro de veículo", type: "checkbox" },
        { name: "requires_trailer_registration", label: "Exige cadastro de tanque", type: "checkbox" },
        { name: "status", label: "Situação", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }] },
        { name: "notes", label: "Observações", type: "textarea", full: true }
      ], b),
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: U.closeModal },
        { label: "Salvar", className: "btn-primary", onClick: function () {
          const data = U.readForm();
          if (!data.name) return U.toast("Informe o nome", "error");
          data.id = b.id; data.company_id = b.company_id || S.currentCompanyId();
          ["requires_integration", "requires_scheduling", "requires_driver_registration", "requires_vehicle_registration", "requires_trailer_registration"].forEach(function (k) { data[k] = data[k] === true; });
          S.upsert("loading_bases", data, "b");
          U.closeModal(); U.toast("Base salva", "success"); window.Router.reload();
        } }
      ]
    });
  }

  /* ============================================================
     11) RELATÓRIOS
     ============================================================ */
  function relatorios() {
    const docs = S.allScopedDocuments();
    const byStatus = { valido: 0, a_vencer: 0, vencido: 0, pendente: 0, nao_aplicavel: 0 };
    docs.forEach(function (d) { byStatus[S.docStatus(d)]++; });

    // Documentos por transportadora
    const carriers = S.carriers();
    const carrierRows = carriers.map(function (c) {
      let cd = 0, venc = 0, soon = 0;
      // documentos da transportadora + suas entidades
      function add(type, id) {
        S.docsFor(type, id).forEach(function (d) {
          cd++; const st = S.docStatus(d);
          if (st === "vencido") venc++; else if (st === "a_vencer") soon++;
        });
      }
      add("carrier", c.id);
      S.drivers().filter(function (d) { return d.carrier_id === c.id; }).forEach(function (d) { add("driver", d.id); });
      S.vehicles().filter(function (v) { return v.carrier_id === c.id; }).forEach(function (v) { add("vehicle", v.id); });
      S.trailers().filter(function (t) { return t.carrier_id === c.id; }).forEach(function (t) { add("trailer", t.id); });
      return { c: c, total: cd, venc: venc, soon: soon, status: S.entityStatus("carrier", c.id) };
    });

    let h = '<div class="page-head"><div><h2>Relatórios</h2><p>Indicadores consolidados do controle documental.</p></div>' +
      '<div class="page-actions"><button class="btn btn-ghost" id="rep-export">Exportar CSV</button></div></div>';

    h += '<div class="stat-grid">' +
      U.statCard({ label: "Total de documentos", value: docs.length, dot: "#2563EB" }) +
      U.statCard({ label: "Conformidade", value: Math.round((byStatus.valido) / Math.max(docs.length, 1) * 100) + "%", dot: "#16A34A", sub: byStatus.valido + " válidos de " + docs.length }) +
      U.statCard({ label: "Vencidos", value: byStatus.vencido, dot: "#DC2626", color: "#DC2626" }) +
      U.statCard({ label: "A vencer", value: byStatus.a_vencer, dot: "#D97706", color: "#D97706" }) +
      "</div>";

    // Distribuição por status
    h += '<div class="card"><div class="card-head"><h3>Distribuição por status documental</h3></div><div class="card-body">';
    const dist = [["valido", "Válido", "#16A34A"], ["a_vencer", "A vencer", "#D97706"], ["vencido", "Vencido", "#DC2626"], ["pendente", "Pendente", "#6B7280"], ["nao_aplicavel", "Não aplicável", "#9CA3AF"]];
    dist.forEach(function (d) {
      const pct = docs.length ? Math.round(byStatus[d[0]] / docs.length * 100) : 0;
      h += '<div style="margin-bottom:12px"><div class="flex-between" style="margin-bottom:5px"><span style="font-size:13px;font-weight:500">' + d[1] + '</span><span class="muted mono">' + byStatus[d[0]] + " (" + pct + '%)</span></div>' +
        '<div class="progress"><span style="background:' + d[2] + ";width:" + pct + '%"></span></div></div>';
    });
    h += "</div></div>";

    // Por transportadora
    h += '<div class="card mt-16"><div class="card-head"><h3>Documentos por transportadora</h3></div><div>' +
      U.table([
        { label: "Transportadora", render: function (r) { return '<div class="row-main">' + esc(r.c.trade_name || r.c.legal_name) + "</div>"; } },
        { label: "Total docs", className: "mono", render: function (r) { return r.total; } },
        { label: "A vencer", render: function (r) { return r.soon ? U.badge("amber", r.soon) : '<span class="muted">0</span>'; } },
        { label: "Vencidos", render: function (r) { return r.venc ? U.badge("red", r.venc) : '<span class="muted">0</span>'; } },
        { label: "Status", render: function (r) { return U.opBadge(r.status); } }
      ], carrierRows) + "</div></div>";

    content().innerHTML = h;
    document.getElementById("rep-export").onclick = function () { exportCSV(docs); };
  }

  function exportCSV(docs) {
    const head = ["Tipo", "Arquivo", "Vinculo", "Entidade", "Emissao", "Validade", "Status"];
    const lines = [head.join(";")];
    docs.forEach(function (d) {
      lines.push([
        S.docTypeName(d.document_type_id), d.file_name || "", S.ENTITY_LABELS[d.entity_type],
        S.entityLabel(d.entity_type, d.entity_id), d.issue_date || "", d.expiration_date || "",
        S.DOC_STATUS_META[S.docStatus(d)].label
      ].map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(";"));
    });
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "relatorio-documental.csv";
    a.click();
    U.toast("CSV exportado", "success");
  }

  /* ============================================================
     12) CONFIGURAÇÕES
     ============================================================ */
  function configuracoes() {
    const company = S.byId("companies", S.currentCompanyId());
    const types = S.state().document_types;
    const sess = S.session();

    let h = '<div class="page-head"><div><h2>Configurações</h2><p>Empresa ativa, tipos de documento e dados da demonstração.</p></div></div>';

    h += '<div class="card-grid">';
    // Empresa
    h += '<div class="card"><div class="card-head"><h3>Empresa ativa</h3></div><div class="card-body"><div class="detail-grid">' +
      U.detailItem("Razão social", esc(company.name)) + U.detailItem("Nome fantasia", esc(company.trade_name)) +
      U.detailItem("CNPJ", esc(company.cnpj)) + U.detailItem("E-mail", esc(company.email)) +
      U.detailItem("Telefone", esc(company.phone)) + "</div>" +
      '<p class="muted" style="margin-top:14px;font-size:12.5px">A plataforma é multiempresa: cada empresa enxerga apenas suas transportadoras, motoristas, veículos e tanques.</p></div></div>';

    // Usuário
    h += '<div class="card"><div class="card-head"><h3>Usuário</h3></div><div class="card-body"><div class="detail-grid">' +
      U.detailItem("Nome", esc(sess.user.name)) + U.detailItem("E-mail", esc(sess.user.email)) +
      U.detailItem("Perfil", esc(sess.user.role)) + "</div></div></div>";
    h += "</div>";

    // Tipos de documento
    h += '<div class="card mt-16"><div class="card-head"><h3>Tipos de documento</h3><span class="sub">' + types.length + " tipos</span></div><div>" +
      U.table([
        { label: "Tipo de documento", render: function (t) { return '<div class="row-main">' + esc(t.name) + '</div><div class="row-sub">' + esc(t.description || "") + "</div>"; } },
        { label: "Aplica-se a", render: function (t) { return '<span class="chip">' + esc(S.ENTITY_LABELS[t.entity_type]) + "</span>"; } },
        { label: "Obrigatório", render: function (t) { return t.is_required_default ? U.badge("blue", "Sim") : '<span class="muted">Não</span>'; } },
        { label: "Alerta", className: "mono", render: function (t) { return t.has_expiration ? (t.alert_days_before + " dias antes") : "sem validade"; } }
      ], types) + "</div></div>";

    // Zona de dados
    h += '<div class="card mt-16"><div class="card-head"><h3>Dados da demonstração</h3></div><div class="card-body">' +
      '<p class="muted" style="font-size:13px;margin-bottom:12px">Os dados são salvos no seu navegador (localStorage). Você pode restaurar a base mockada original a qualquer momento.</p>' +
      '<button class="btn btn-danger" id="reset-demo">Restaurar dados de demonstração</button></div></div>';

    content().innerHTML = h;
    document.getElementById("reset-demo").onclick = function () {
      U.confirm("Restaurar demonstração", "Isto descartará todas as alterações e voltará aos dados originais. Continuar?", function () {
        S.resetDemo(); U.toast("Dados restaurados", "success"); window.Router.reload();
      }, true);
    };
  }

  /* ============================================================
     Helpers de página/lista genérica
     ============================================================ */
  function pageList(cfg) {
    let h = '<div class="page-head"><div><h2>' + esc(cfg.title) + "</h2><p>" + esc(cfg.subtitle) + "</p></div>" +
      '<div class="page-actions"><button class="btn btn-primary" id="page-add">' + esc(cfg.addLabel) + "</button></div></div>";
    h += '<div class="filters"><div class="search-box"><input id="page-q" placeholder="Buscar..." /></div>' + (cfg.filters || []).join("") + "</div>";
    h += '<div class="card"><div id="page-table"></div></div>';
    content().innerHTML = h;

    function render() {
      const q = (val("page-q") || "").toLowerCase();
      document.getElementById("page-table").innerHTML = cfg.render(q);
      bindRowActions();
    }
    render();
    document.getElementById("page-add").onclick = cfg.onAdd;
    document.getElementById("page-q").oninput = render;
    Array.prototype.forEach.call(document.querySelectorAll("#content .filters select"), function (sel) {
      sel.onchange = render;
    });
    // re-render quando filtros mudam (já ligados acima); reexpõe render p/ row actions
    window.__pageRender = render;
  }

  // Ações de linha são registradas em um buffer e religadas após render.
  let actionBuffer = [];
  function rowActions(actions) {
    return actions.map(function (a) {
      const idx = actionBuffer.push(a[1]) - 1;
      const cls = a[2] === "danger" ? "link-btn danger" : "link-btn";
      return '<button class="' + cls + '" data-action="' + idx + '">' + esc(a[0]) + "</button>";
    }).join("");
  }
  function bindRowActions() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-action]"), function (el) {
      const idx = Number(el.getAttribute("data-action"));
      el.onclick = function () { if (actionBuffer[idx]) actionBuffer[idx](); };
    });
  }
  function clearActionBuffer() { actionBuffer = []; }

  function removeEntity(collection, id, label) {
    U.confirm("Excluir " + label.toLowerCase(), "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.", function () {
      S.remove(collection, id);
      U.toast(label + " excluído", "success");
      window.Router.reload();
    }, true);
  }

  /* ---------- helpers de filtros ---------- */
  function val(id) { const el = document.getElementById(id); return el ? el.value : ""; }
  function carrierOptions() { return S.carriers().map(function (c) { return { value: c.id, label: c.trade_name || c.legal_name }; }); }

  function fieldSelect(id, label, options) {
    let h = '<label class="field"><span>' + esc(label) + '</span><select id="' + id + '">';
    options.forEach(function (o) { h += '<option value="' + esc(o.value) + '">' + esc(o.label) + "</option>"; });
    return h + "</select></label>";
  }
  function fieldSelectFull(id, label, options) {
    let h = '<label class="field"><span>' + esc(label) + '</span><select id="' + id + '">';
    options.forEach(function (o) { h += '<option value="' + esc(o.value) + '">' + esc(o.label) + "</option>"; });
    return h + "</select></label>";
  }
  function statusFilter(id) {
    return fieldSelect(id, "Status operacional", [
      { value: "", label: "Todos" }, { value: "apto", label: "Apto" },
      { value: "atencao", label: "Atenção" }, { value: "pendente", label: "Pendente" }, { value: "bloqueado", label: "Bloqueado" }
    ]);
  }
  function carrierFilter(id) {
    return fieldSelect(id, "Transportadora", [{ value: "", label: "Todas" }].concat(carrierOptions()));
  }

  window.Views = {
    dashboard: dashboard, transportadoras: transportadoras, motoristas: motoristas,
    veiculos: veiculos, tanques: tanques, documentos: documentos, vencimentos: vencimentos,
    consulta: consulta, bases: bases, relatorios: relatorios, configuracoes: configuracoes,
    clearActionBuffer: clearActionBuffer
  };
})();
