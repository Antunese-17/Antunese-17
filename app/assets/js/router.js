/* =========================================================================
   Router — navegação por hash, menu lateral e título da página.
   Ícones de linha discretos (sem emojis), agrupados por seção.
   ========================================================================= */
(function () {
  "use strict";

  // Ícones de linha 24x24 (stroke = currentColor, definido no CSS).
  const ICON = {
    dashboard: '<path d="M3 13h8V3H3z"/><path d="M13 21h8V3h-8z"/><path d="M3 21h8v-4H3z"/>',
    carriers:  '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    drivers:   '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    vehicles:  '<path d="M3 7h10v8H3z"/><path d="M13 10h4l4 3v2h-8z"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
    trailers:  '<path d="M3 8h13v7H3z"/><path d="M16 11h5v4h-5z"/><circle cx="8" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
    documents: '<path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>',
    expirations:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
    query:     '<path d="M20 6 9 17l-5-5"/>',
    bases:     '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>',
    reports:   '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
    settings:  '<path d="M4 6h10"/><path d="M18 6h2"/><circle cx="16" cy="6" r="2"/><path d="M4 12h2"/><path d="M10 12h10"/><circle cx="8" cy="12" r="2"/><path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="18" r="2"/>'
  };
  function svg(name) { return '<svg viewBox="0 0 24 24">' + (ICON[name] || "") + "</svg>"; }

  const ROUTES = [
    { id: "dashboard",       label: "Dashboard",            section: "Geral",        icon: "dashboard",   view: "dashboard" },
    { id: "transportadoras", label: "Transportadoras",      section: "Cadastros",    icon: "carriers",    view: "transportadoras" },
    { id: "motoristas",      label: "Motoristas",           section: "Cadastros",    icon: "drivers",     view: "motoristas" },
    { id: "veiculos",        label: "Veículos",             section: "Cadastros",    icon: "vehicles",    view: "veiculos" },
    { id: "tanques",         label: "Tanques/Implementos",  section: "Cadastros",    icon: "trailers",    view: "tanques" },
    { id: "documentos",      label: "Documentos",           section: "Controle",     icon: "documents",   view: "documentos" },
    { id: "vencimentos",     label: "Vencimentos",          section: "Controle",     icon: "expirations", view: "vencimentos", alerts: true },
    { id: "consulta",        label: "Consulta Operacional", section: "Operação",     icon: "query",       view: "consulta" },
    { id: "bases",           label: "Bases de Carregamento",section: "Operação",     icon: "bases",       view: "bases" },
    { id: "relatorios",      label: "Relatórios",           section: "Análise",      icon: "reports",     view: "relatorios" },
    { id: "configuracoes",   label: "Configurações",        section: "Sistema",      icon: "settings",    view: "configuracoes" }
  ];

  let current = "dashboard";

  function buildNav() {
    const nav = document.getElementById("nav");
    nav.innerHTML = "";
    let lastSection = null;
    ROUTES.forEach(function (r) {
      if (r.section !== lastSection) {
        const sec = document.createElement("div");
        sec.className = "nav-section";
        sec.textContent = r.section;
        nav.appendChild(sec);
        lastSection = r.section;
      }
      const btn = document.createElement("button");
      btn.className = "nav-item" + (r.id === current ? " active" : "");
      btn.setAttribute("data-route", r.id);
      let badge = "";
      if (r.alerts) {
        const n = window.Store.alerts().length;
        if (n > 0) badge = '<span class="nav-badge">' + n + "</span>";
      }
      btn.innerHTML = '<span class="nav-ico">' + svg(r.icon) + '</span><span class="nav-label">' + r.label + "</span>" + badge;
      btn.onclick = function () { go(r.id); };
      nav.appendChild(btn);
    });
  }

  function go(routeId) {
    const route = ROUTES.find(function (r) { return r.id === routeId; }) || ROUTES[0];
    current = route.id;
    if (location.hash !== "#" + route.id) location.hash = route.id;
    render();
    document.getElementById("app").classList.remove("nav-open");
  }

  function render() {
    const route = ROUTES.find(function (r) { return r.id === current; }) || ROUTES[0];
    document.getElementById("page-title").textContent = route.label;
    window.Views.clearActionBuffer();
    Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (el) {
      el.classList.toggle("active", el.getAttribute("data-route") === current);
    });
    window.Views[route.view]();
    updateBell();
    bindNavData();
    window.UI.afterRender();
  }

  function reload() { render(); buildNav(); }

  function updateBell() {
    const n = window.Store.alerts().length;
    const bell = document.getElementById("bell-count");
    bell.textContent = n;
    bell.classList.toggle("zero", n === 0);
  }

  function bindNavData() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"), function (el) {
      el.onclick = function () { go(el.getAttribute("data-nav")); };
    });
  }

  function init() {
    buildNav();
    const hash = location.hash.replace("#", "");
    if (hash && ROUTES.some(function (r) { return r.id === hash; })) current = hash;
    render();
    window.addEventListener("hashchange", function () {
      const h = location.hash.replace("#", "");
      if (h && h !== current && ROUTES.some(function (r) { return r.id === h; })) { current = h; render(); }
    });
    document.getElementById("alert-bell").onclick = function () { go("vencimentos"); };
  }

  window.Router = { init: init, go: go, reload: reload, render: render };
})();
