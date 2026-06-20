/* =========================================================================
   Router — navegação por hash, menu lateral e título da página.
   ========================================================================= */
(function () {
  "use strict";

  const ROUTES = [
    { id: "dashboard",       label: "Dashboard",            icon: "▣", view: "dashboard" },
    { id: "transportadoras", label: "Transportadoras",      icon: "🚛", view: "transportadoras" },
    { id: "motoristas",      label: "Motoristas",           icon: "🧑‍✈️", view: "motoristas" },
    { id: "veiculos",        label: "Veículos",             icon: "🚚", view: "veiculos" },
    { id: "tanques",         label: "Tanques/Implementos",  icon: "🛢️", view: "tanques" },
    { id: "documentos",      label: "Documentos",           icon: "📄", view: "documentos" },
    { id: "vencimentos",     label: "Vencimentos",          icon: "⏰", view: "vencimentos", alerts: true },
    { id: "consulta",        label: "Consulta Operacional", icon: "✅", view: "consulta" },
    { id: "bases",           label: "Bases de Carregamento",icon: "🏭", view: "bases" },
    { id: "relatorios",      label: "Relatórios",           icon: "📊", view: "relatorios" },
    { id: "configuracoes",   label: "Configurações",        icon: "⚙️", view: "configuracoes" }
  ];

  let current = "dashboard";

  function buildNav() {
    const nav = document.getElementById("nav");
    nav.innerHTML = "";
    ROUTES.forEach(function (r) {
      const btn = document.createElement("button");
      btn.className = "nav-item" + (r.id === current ? " active" : "");
      btn.setAttribute("data-route", r.id);
      let badge = "";
      if (r.alerts) {
        const n = window.Store.alerts().length;
        if (n > 0) badge = '<span class="nav-badge">' + n + "</span>";
      }
      btn.innerHTML = '<span class="nav-ico">' + r.icon + "</span><span>" + r.label + "</span>" + badge;
      btn.onclick = function () { go(r.id); };
      nav.appendChild(btn);
    });
  }

  function go(routeId) {
    const route = ROUTES.find(function (r) { return r.id === routeId; }) || ROUTES[0];
    current = route.id;
    if (location.hash !== "#" + route.id) location.hash = route.id;
    render();
    // fecha menu mobile
    document.getElementById("app").classList.remove("nav-open");
  }

  function render() {
    const route = ROUTES.find(function (r) { return r.id === current; }) || ROUTES[0];
    document.getElementById("page-title").textContent = route.label;
    window.Views.clearActionBuffer();
    // marca item ativo
    Array.prototype.forEach.call(document.querySelectorAll(".nav-item"), function (el) {
      el.classList.toggle("active", el.getAttribute("data-route") === current);
    });
    window.Views[route.view]();
    updateBell();
    bindNavData();
  }

  function reload() { render(); buildNav(); }

  function updateBell() {
    const n = window.Store.alerts().length;
    const bell = document.getElementById("bell-count");
    bell.textContent = n;
    bell.classList.toggle("zero", n === 0);
  }

  // Liga botões com atributo data-nav (atalhos dentro das views).
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
