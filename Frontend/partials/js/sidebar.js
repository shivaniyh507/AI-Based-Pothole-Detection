/* =========================================================
   ROADIES (RoadSafe AI) — sidebar.js
   Unified Driver Module Navigation & Auth Management
   ========================================================= */

window.initSidebar = function () {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const driverMenu = document.getElementById("driverMenu");
  const adminMenu = document.getElementById("adminMenu");

  const sidebarAvatar = document.getElementById("sidebarAvatar");
  const sidebarName = document.getElementById("sidebarName");
  const sidebarRole = document.getElementById("sidebarRole");

  const collapseBtn = document.getElementById("collapseBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const menuIcon = document.getElementById("menuIcon");

  // -------------------------------
  // Get Logged In User (Default for Demo)
  // -------------------------------

  let isLoggedIn = localStorage.getItem("isLoggedIn");
  let role = localStorage.getItem("userRole");
  let currentUser = JSON.parse(
    localStorage.getItem("currentUser") || "{}"
  );

  // Fallback to active demo driver session if not logged in
  if (isLoggedIn !== "true" || !role) {
    isLoggedIn = "true";
    role = "driver";
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", "driver");
  }

  if (!currentUser.fullName) {
    const savedName = localStorage.getItem("roadies_user_fullname") || "Archita Trivedi";
    currentUser = {
      fullName: savedName,
      email: "archita.trivedi@roadies.ai",
      role: role
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  // Toggle menus by role
  if (role === "admin") {
    if (driverMenu) driverMenu.style.display = "none";
    if (adminMenu) adminMenu.style.display = "flex";
  } else {
    if (driverMenu) driverMenu.style.display = "flex";
    if (adminMenu) adminMenu.style.display = "none";
  }

  // Populate sidebar profile
  const savedFullName = localStorage.getItem("roadies_user_fullname") || currentUser.fullName || "Archita Trivedi";
  const name = savedFullName;
  const roleText = role === "admin" ? "Administrator" : "Driver Account";

  if (sidebarName) sidebarName.textContent = name;
  if (sidebarRole) sidebarRole.textContent = roleText;

  if (sidebarAvatar) {
    if (currentUser.profilePicture || currentUser.avatar) {
      const src = currentUser.profilePicture || currentUser.avatar;
      sidebarAvatar.innerHTML = `<img src="${src}" alt="${name}">`;
    } else {
      const initials = name
        .trim()
        .split(" ")
        .map(w => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      sidebarAvatar.textContent = initials || "AT";
    }
  }

  // Highlight active menu item by checking current page filename
  const currentPath = window.location.pathname.toLowerCase();
  const pageItems = sidebar.querySelectorAll(".nav-item");

  pageItems.forEach(item => {
    const page = item.dataset.page;
    if (!page) return;

    if (
      currentPath.includes(page) ||
      (page === "dashboard" && currentPath.includes("dashboard")) ||
      (page === "live-map" && currentPath.includes("live-map")) ||
      (page === "scan-road" && currentPath.includes("scan-road")) ||
      (page === "my-reports" && currentPath.includes("my-reports"))
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Collapse functionality
  const savedCollapsed = localStorage.getItem("sidebarCollapsed");
  if (savedCollapsed === "true") {
    sidebar.classList.add("collapsed");
  }

  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      const mainContent = document.querySelector(".main-content");
      if (mainContent) {
        mainContent.classList.toggle("sidebar-collapsed");
      }
      localStorage.setItem("sidebarCollapsed", sidebar.classList.contains("collapsed"));
    });
  }

  // Mobile menu
  if (mobileMenuBtn && sidebarOverlay) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("show");
      sidebarOverlay.classList.toggle("show");
      if (menuIcon) {
        menuIcon.className = sidebar.classList.contains("show") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
      }
    });

    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      sidebarOverlay.classList.remove("show");
      if (menuIcon) menuIcon.className = "fa-solid fa-bars";
    });
  }
};

// Execute on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.initSidebar === "function") {
    window.initSidebar();
  }
});