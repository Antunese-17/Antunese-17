/* =========================================================================
   App — bootstrap: login, sessão, menu mobile e ligação dos componentes.
   ========================================================================= */
(function () {
  "use strict";

  const S = window.Store;

  function fillCompanies() {
    const sel = document.getElementById("login-company");
    sel.innerHTML = S.state().companies.map(function (c) {
      return '<option value="' + c.id + '">' + c.name + "</option>";
    }).join("");
  }

  function startApp() {
    const sess = S.session();
    const company = S.byId("companies", sess.companyId);
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("user-name").textContent = sess.user.name;
    document.getElementById("user-role").textContent = sess.user.role;
    document.getElementById("user-avatar").textContent = (sess.user.name || "U").charAt(0).toUpperCase();
    document.getElementById("active-company").textContent = company ? company.name : "—";
    window.Router.init();
  }

  function bindLogin() {
    fillCompanies();
    document.getElementById("login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const companyId = document.getElementById("login-company").value;
      if (!email) return window.UI.toast("Informe o e-mail", "error");
      S.login(email, companyId);
      startApp();
    });
  }

  function bindShell() {
    document.getElementById("logout-btn").addEventListener("click", function () {
      S.logout();
      document.getElementById("app").classList.add("hidden");
      document.getElementById("login-screen").classList.remove("hidden");
    });
    // menu mobile
    document.getElementById("menu-toggle").addEventListener("click", function () {
      document.getElementById("app").classList.toggle("nav-open");
    });
    document.getElementById("overlay").addEventListener("click", function () {
      document.getElementById("app").classList.remove("nav-open");
    });
    // modal: fechar
    document.getElementById("modal-close").addEventListener("click", window.UI.closeModal);
    document.getElementById("modal-backdrop").addEventListener("click", window.UI.closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        window.UI.closeModal();
        document.getElementById("app").classList.remove("nav-open");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindLogin();
    bindShell();
  });
})();
