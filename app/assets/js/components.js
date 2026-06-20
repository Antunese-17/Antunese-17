/* =========================================================================
   Components — helpers de UI: badges, tabelas, cards, modal, toast, formulários.
   ========================================================================= */
(function () {
  "use strict";

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function docBadge(status) {
    const m = window.Store.DOC_STATUS_META[status] || { label: status, tone: "gray" };
    return '<span class="badge ' + m.tone + '">' + esc(m.label) + "</span>";
  }
  function opBadge(status) {
    const m = window.Store.OP_STATUS_META[status] || { label: status, tone: "gray" };
    return '<span class="badge ' + m.tone + '">' + esc(m.label) + "</span>";
  }
  function badge(tone, label, plain) {
    return '<span class="badge ' + tone + (plain ? " plain" : "") + '">' + esc(label) + "</span>";
  }

  function statCard(opts) {
    return '' +
      '<div class="stat-card">' +
        '<div class="stat-label">' +
          (opts.dot ? '<span class="stat-dot" style="background:' + opts.dot + '"></span>' : "") +
          esc(opts.label) +
        "</div>" +
        '<div class="stat-value" ' + (opts.color ? 'style="color:' + opts.color + '"' : "") + ">" + esc(opts.value) + "</div>" +
        (opts.sub ? '<div class="stat-sub">' + esc(opts.sub) + "</div>" : "") +
      "</div>";
  }

  // Renderiza tabela. columns: [{key,label,render?,className?}], rows: array, opts.empty
  function table(columns, rows, opts) {
    opts = opts || {};
    if (!rows.length) {
      return emptyState(opts.emptyTitle || "Nenhum registro", opts.emptyText || "Não há dados para exibir.", opts.emptyEmoji);
    }
    let h = '<div class="table-wrap"><table class="data"><thead><tr>';
    columns.forEach(function (c) {
      h += "<th" + (c.thClass ? ' class="' + c.thClass + '"' : "") + ">" + esc(c.label) + "</th>";
    });
    h += "</tr></thead><tbody>";
    rows.forEach(function (row) {
      h += "<tr>";
      columns.forEach(function (c) {
        const val = c.render ? c.render(row) : esc(row[c.key]);
        h += "<td" + (c.className ? ' class="' + c.className + '"' : "") + ">" + val + "</td>";
      });
      h += "</tr>";
    });
    h += "</tbody></table></div>";
    return h;
  }

  function emptyState(title, text, emoji) {
    return '<div class="empty"><span class="emoji">' + (emoji || "📭") + "</span>" +
      "<h4>" + esc(title) + "</h4><p>" + esc(text) + "</p></div>";
  }

  function detailItem(label, value) {
    return '<div class="detail-item"><div class="dl">' + esc(label) + '</div><div class="dv">' + (value || "—") + "</div></div>";
  }

  /* ---------------- Modal ---------------- */
  let modalConfirm = null;
  function openModal(opts) {
    document.getElementById("modal-title").textContent = opts.title || "";
    document.getElementById("modal-body").innerHTML = opts.body || "";
    const foot = document.getElementById("modal-foot");
    foot.innerHTML = "";
    (opts.buttons || []).forEach(function (b) {
      const btn = document.createElement("button");
      btn.className = "btn " + (b.className || "btn-ghost");
      btn.textContent = b.label;
      btn.onclick = b.onClick;
      foot.appendChild(btn);
    });
    document.getElementById("modal-root").classList.remove("hidden");
    if (opts.onMount) opts.onMount();
  }
  function closeModal() {
    document.getElementById("modal-root").classList.add("hidden");
    modalConfirm = null;
  }

  function confirm(title, message, onYes, danger) {
    openModal({
      title: title,
      body: '<p style="font-size:14px;color:var(--text)">' + esc(message) + "</p>",
      buttons: [
        { label: "Cancelar", className: "btn-ghost", onClick: closeModal },
        { label: danger ? "Excluir" : "Confirmar", className: danger ? "btn-danger" : "btn-primary", onClick: function () { closeModal(); onYes(); } }
      ]
    });
  }

  /* ---------------- Form builder ----------------
     fields: [{name,label,type,options?,value?,required?,full?,placeholder?}] */
  function buildForm(fields, values) {
    values = values || {};
    let h = '<form id="entity-form"><div class="form-grid">';
    fields.forEach(function (f) {
      const v = values[f.name] !== undefined ? values[f.name] : (f.value !== undefined ? f.value : "");
      h += '<label class="field' + (f.full ? " full" : "") + '"><span>' + esc(f.label) + (f.required ? " *" : "") + "</span>";
      if (f.type === "select") {
        h += '<select name="' + f.name + '"' + (f.required ? " required" : "") + ">";
        (f.options || []).forEach(function (o) {
          const val = typeof o === "object" ? o.value : o;
          const lbl = typeof o === "object" ? o.label : o;
          h += '<option value="' + esc(val) + '"' + (String(val) === String(v) ? " selected" : "") + ">" + esc(lbl) + "</option>";
        });
        h += "</select>";
      } else if (f.type === "textarea") {
        h += '<textarea name="' + f.name + '"' + (f.required ? " required" : "") + ' placeholder="' + esc(f.placeholder || "") + '">' + esc(v) + "</textarea>";
      } else if (f.type === "checkbox") {
        h += '<select name="' + f.name + '"><option value="true"' + (v === true || v === "true" ? " selected" : "") + ">Sim</option>" +
             '<option value="false"' + (!v || v === "false" ? " selected" : "") + ">Não</option></select>";
      } else {
        h += '<input type="' + (f.type || "text") + '" name="' + f.name + '" value="' + esc(v) + '"' +
             (f.required ? " required" : "") + ' placeholder="' + esc(f.placeholder || "") + '" />';
      }
      h += "</label>";
    });
    h += "</div></form>";
    return h;
  }
  function readForm() {
    const form = document.getElementById("entity-form");
    if (!form) return {};
    const data = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.value === "true") data[el.name] = true;
      else if (el.value === "false") data[el.name] = false;
      else data[el.name] = el.value;
    });
    return data;
  }

  /* ---------------- Toast ---------------- */
  function toast(message, type) {
    const root = document.getElementById("toast-root");
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = (type === "success" ? "✓ " : type === "error" ? "⚠ " : "") + esc(message);
    root.appendChild(el);
    setTimeout(function () { el.style.opacity = "0"; el.style.transition = "opacity .3s"; }, 2600);
    setTimeout(function () { el.remove(); }, 3000);
  }

  window.UI = {
    esc: esc, docBadge: docBadge, opBadge: opBadge, badge: badge,
    statCard: statCard, table: table, emptyState: emptyState, detailItem: detailItem,
    openModal: openModal, closeModal: closeModal, confirm: confirm,
    buildForm: buildForm, readForm: readForm, toast: toast
  };
})();
