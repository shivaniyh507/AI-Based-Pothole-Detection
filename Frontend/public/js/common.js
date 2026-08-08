/* =========================================================
   RoadSafe AI — common.js (v2)
   Shared across all pages: mobile sidebar toggle, sidebar collapse,
   profile dropdown (My Profile / Settings / Sign Out), language +
   theme switching with persistence, toast helper.
   ========================================================= */

const RoadSafeCommon = (function () {

  const LANG_KEY  = "roadsafe-lang";
  const THEME_KEY = "roadsafe-theme";

  function getLang()  { return localStorage.getItem(LANG_KEY)  || "en"; }
  function getTheme() { return localStorage.getItem(THEME_KEY) || "light"; }

  function applyLang(lang) {
    document.querySelectorAll("[data-en]").forEach(function (el) {
      const text = lang === "hi" ? el.dataset.hi : el.dataset.en;
      if (text) el.textContent = text;
    });
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark-mode", theme === "dark");
    const themeSelect = document.getElementById("themePref");
    if (themeSelect) themeSelect.value = theme;
  }

  function setLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    applyLang(lang);
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    if (message) {
      const span = toast.querySelector("span");
      if (span) span.textContent = message;
    }
    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  function loadMarkup(containerSelector, partialPath, callback) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    fetch(partialPath)
      .then(res => res.text())
      .then(html => {
        container.innerHTML = html;
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch(() => {
        console.warn(`Failed to load partial: ${partialPath}`);
      });
  }

  function loadSidebar() {
    loadMarkup("#sidebar-container", "../partials/sidebar.html", window.initSidebar);
  }

  function loadTopbar(title, subtitle) {
    loadMarkup("#topbar", "../partials/topbar.html", function () {
      if (title) document.body.dataset.title = title;
      if (subtitle) document.body.dataset.subtitle = subtitle;
      if (typeof window.initTopbar === "function") {
        window.initTopbar();
      }
    });
  }

  window.loadSidebar = loadSidebar;
  window.loadTopbar = loadTopbar;

  function initMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    if (!toggleBtn || !sidebar) return;

    let overlay = document.querySelector(".sidebar-overlay-mobile");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay-mobile";
      document.body.appendChild(overlay);
    }
    const close = () => { sidebar.classList.remove("show"); overlay.classList.remove("show"); };
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
      overlay.classList.toggle("show");
    });
    overlay.addEventListener("click", close);
  }

  function initSidebarCollapse() {
    const btn = document.getElementById("sidebarCollapseBtn");
    const sidebar = document.getElementById("sidebar");
    if (!btn || !sidebar) return;
    btn.addEventListener("click", function () {
      sidebar.classList.toggle("collapsed");
      btn.innerHTML = sidebar.classList.contains("collapsed")
        ? '<svg class="icon"><use href="#i-chevron-right"/></svg>'
        : '<svg class="icon"><use href="#i-chevron-left"/></svg>';
    });
  }

  // function initProfileDropdown() {
  //   const trigger  = document.getElementById("profileTriggerBtn");
  //   const dropdown = document.getElementById("profileDropdown");
  //   if (!trigger || !dropdown) return;

  //   trigger.addEventListener("click", function (e) {
  //     e.stopPropagation();
  //     dropdown.classList.toggle("show");
  //     trigger.classList.toggle("open");
  //   });
  //   document.addEventListener("click", function (e) {
  //     if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
  //       dropdown.classList.remove("show");
  //       trigger.classList.remove("open");
  //     }
  //   });
  // }

  function initLangToggle() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
    });
    applyLang(getLang());
  }

  function initThemeToggle() {
    applyTheme(getTheme());
    const themeSelect = document.getElementById("themePref");
    if (themeSelect) {
      themeSelect.addEventListener("change", function () { setTheme(themeSelect.value); });
    }
  }

  function init() {
    initMobileSidebar();
    initSidebarCollapse();
    // initProfileDropdown();
    initLangToggle();
    initThemeToggle();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { getLang, getTheme, setLang, setTheme, showToast };
})();
