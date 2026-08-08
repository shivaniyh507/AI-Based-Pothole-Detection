/**
 * RoadSafe AI — Core Utility Controller (common2.js)
 * Controls Command Palette, Toast System, Global Keyboard Shortcuts, & Sidebar Navigation
 */

document.addEventListener("DOMContentLoaded", () => {
  initSidebarActiveLink();
  initCommandPalette();
  initGlobalKeyboardShortcuts();
});

/* Highlight Active Sidebar Link based on current page URL */
function initSidebarActiveLink() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split("/").pop() || "dashboard2.html";

  const navLinks = document.querySelectorAll(".sidebar-nav .nav-item");
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && (href === pageName || (pageName === "" && href === "dashboard2.html"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* Command Palette Modal Controller (Ctrl + K) */
function initCommandPalette() {
  const modal = document.getElementById("commandPaletteModal");
  const backdrop = document.getElementById("commandPaletteBackdrop");
  const input = document.getElementById("commandPaletteInput");
  const globalSearchInput = document.getElementById("globalSearchInput");

  const openPalette = () => {
    if (modal) {
      modal.classList.add("active");
      if (input) {
        input.value = "";
        setTimeout(() => input.focus(), 100);
      }
    }
  };

  const closePalette = () => {
    if (modal) modal.classList.remove("active");
  };

  if (globalSearchInput) {
    globalSearchInput.addEventListener("click", openPalette);
    globalSearchInput.addEventListener("focus", openPalette);
  }

  if (backdrop) {
    backdrop.addEventListener("click", closePalette);
  }

  if (input) {
    input.addEventListener("input", (e) => {
      const filter = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll(".command-item");

      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        if (text.includes(filter)) {
          item.style.display = "flex";
        } else {
          item.style.display = "none";
        }
      });
    });
  }
}

/* Global Keyboard Shortcuts (Escape to close, Ctrl+K to search) */
function initGlobalKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const modal = document.getElementById("commandPaletteModal");
      if (modal && modal.classList.contains("active")) {
        modal.classList.remove("active");
      } else {
        const globalSearchInput = document.getElementById("globalSearchInput");
        if (globalSearchInput) globalSearchInput.click();
      }
    }

    if (e.key === "Escape") {
      const modal = document.getElementById("commandPaletteModal");
      if (modal) modal.classList.remove("active");
    }
  });
}

/* Floating Toast Notification System */
window.showToast = function (message, type = "purple") {
  let container = document.getElementById("roadiesToastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "roadiesToastContainer";
    container.className = "roadies-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `roadies-toast ${type}`;

  let iconClass = "fa-circle-info";
  if (type === "success") iconClass = "fa-circle-check";
  if (type === "danger") iconClass = "fa-triangle-exclamation";
  if (type === "purple") iconClass = "fa-shield-halved";

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
