// ==========================================================================
// ROADIES (Road Optimization And Detection Intelligent Evaluation System)
// Common Application Controller (common.js)
// Notification Drawer, Command Palette (Ctrl+K), Toast System, & Global UX Micro-Interactions
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNotificationDrawer();
  initCommandPalette();
  initGlobalKeyboardShortcuts();
  syncUserProfileHeader();
});

// ==========================================================================
// 1. Floating Toast Notification System
// ==========================================================================

window.showToast = function(message, type = "purple") {
  let container = document.querySelector(".roadies-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "roadies-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `roadies-toast ${type}`;
  
  let iconClass = "fa-solid fa-circle-info";
  if (type === "success") iconClass = "fa-solid fa-circle-check";
  if (type === "danger") iconClass = "fa-solid fa-triangle-exclamation";
  if (type === "purple") iconClass = "fa-solid fa-road";

  toast.innerHTML = `<i class="${iconClass}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Sync LocalStorage Profile Name across headers
function syncUserProfileHeader() {
  const savedName = localStorage.getItem("roadies_user_fullname");
  if (savedName) {
    const profileNames = document.querySelectorAll(".profile-info strong, #headerUserName");
    profileNames.forEach(el => {
      el.textContent = savedName;
    });
  }
}

// ==========================================================================
// 2. Topbar Notification Slide-Over Drawer
// ==========================================================================

function initNotificationDrawer() {
  const bellBtn = document.getElementById("notificationBellBtn");
  const drawer = document.getElementById("notificationDrawer");
  const drawerOverlay = document.getElementById("notificationDrawerOverlay");
  const closeBtn = document.getElementById("closeNotificationDrawer");
  const markAllBtn = document.getElementById("markAllNotificationsBtn");
  const badge = document.getElementById("notificationBadgeCount");

  if (!bellBtn || !drawer) return;

  // Toggle Drawer Open
  bellBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openDrawer();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }

  if (drawerOverlay) {
    drawerOverlay.addEventListener("click", closeDrawer);
  }

  // Mark All Read Action
  if (markAllBtn) {
    markAllBtn.addEventListener("click", () => {
      const unreadCards = drawer.querySelectorAll(".notification-item.unread");
      unreadCards.forEach((card) => {
        card.classList.remove("unread");
        const dot = card.querySelector(".unread-indicator");
        if (dot) dot.remove();
      });

      if (badge) {
        badge.textContent = "0";
        badge.style.display = "none";
      }

      markAllBtn.innerHTML = `<i class="fa-solid fa-check"></i> All Read`;
      markAllBtn.disabled = true;
      window.showToast("All notifications marked as read.", "success");
    });
  }

  function openDrawer() {
    drawer.classList.add("active");
    if (drawerOverlay) drawerOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    if (drawerOverlay) drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ==========================================================================
// 3. Command Palette (Ctrl+K / Cmd+K)
// ==========================================================================

function initCommandPalette() {
  const paletteModal = document.getElementById("commandPaletteModal");
  const paletteInput = document.getElementById("commandPaletteInput");
  const paletteBackdrop = document.getElementById("commandPaletteBackdrop");
  const searchBoxes = document.querySelectorAll(".search-box input");

  // Trigger Command Palette from search boxes or Ctrl+K shortcut
  searchBoxes.forEach((input) => {
    input.addEventListener("focus", (e) => {
      openPalette();
    });
  });

  if (paletteBackdrop) {
    paletteBackdrop.addEventListener("click", closePalette);
  }

  function openPalette() {
    if (!paletteModal) return;
    paletteModal.classList.add("active");
    if (paletteInput) {
      setTimeout(() => paletteInput.focus(), 50);
    }
  }

  function closePalette() {
    if (!paletteModal) return;
    paletteModal.classList.remove("active");
  }

  // Listen for Ctrl+K or Cmd+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (paletteModal && paletteModal.classList.contains("active")) {
        closePalette();
      } else {
        openPalette();
      }
    }

    if (e.key === "Escape" && paletteModal && paletteModal.classList.contains("active")) {
      closePalette();
    }
  });

  // Filter palette items dynamically
  if (paletteInput) {
    paletteInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = paletteModal.querySelectorAll(".command-item");

      items.forEach((item) => {
        const text = item.innerText.toLowerCase();
        item.style.display = text.includes(query) ? "flex" : "none";
      });
    });
  }
}

// Global Keyboard Accessibility
function initGlobalKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // ESC closes active drawers or modals
    if (e.key === "Escape") {
      const drawer = document.getElementById("notificationDrawer");
      const overlay = document.getElementById("notificationDrawerOverlay");
      if (drawer && drawer.classList.contains("active")) {
        drawer.classList.remove("active");
        if (overlay) overlay.classList.remove("active");
        document.body.style.overflow = "";
      }
    }
  });
}
