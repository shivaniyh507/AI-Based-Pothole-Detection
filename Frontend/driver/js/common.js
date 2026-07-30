// ==========================================================================
// ROADIES (Road Optimization And Detection Intelligent Evaluation System)
// Common Application Controller (common.js)
// Notification Drawer, Command Palette (Ctrl+K), & Global UX Micro-Interactions
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNotificationDrawer();
  initCommandPalette();
  initGlobalKeyboardShortcuts();
});

// ==========================================================================
// 1. Topbar Notification Slide-Over Drawer
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
// 2. Command Palette (Ctrl+K / Cmd+K)
// ==========================================================================

function initCommandPalette() {
  const paletteModal = document.getElementById("commandPaletteModal");
  const paletteInput = document.getElementById("commandPaletteInput");
  const paletteBackdrop = document.getElementById("commandPaletteBackdrop");
  const searchBoxes = document.querySelectorAll(".search-box input");

  // Trigger Command Palette from search boxes or Ctrl+K shortcut
  searchBoxes.forEach((input) => {
    input.addEventListener("focus", (e) => {
      // If focused, show palette
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
