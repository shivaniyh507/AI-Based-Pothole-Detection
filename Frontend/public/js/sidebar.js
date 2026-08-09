/* =========================================================
   RoadSafe AI — sidebar.js
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
// Get Logged In User
// -------------------------------

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("userRole");
  const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "{}"
  );

  if (isLoggedIn !== "true" || !role) {
      window.location.href = "../auth/login.html";
      return;
  }  

  // Toggle menus by role
  if (role === "admin") {
    if (driverMenu) driverMenu.style.display = "none";
    if (adminMenu) adminMenu.style.display = "flex";
  } else {
    if (driverMenu) driverMenu.style.display = "flex";
    if (adminMenu) adminMenu.style.display = "none";
  }

  // Populate sidebar profile (Display only, non-clickable)
  const name = currentUser.fullName || (role === "admin" ? "System Administrator" : "Ritika Tripathi");
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
      sidebarAvatar.textContent = initials || (role === "admin" ? "SA" : "RT");
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
      (page === "settings" && currentPath.includes("settings"))
    ) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }

    // Navigation click
    item.addEventListener("click", function (e) {
      e.preventDefault();
      pageItems.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const targetPage = this.dataset.page;
      if (targetPage) {
        window.location.href = `${targetPage}.html`;
      }
    });
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

      if(mainContent){
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

  // Remove sidebar logout action for consistent topbar-only sign out handling.
};

// Execute on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  if (typeof window.initSidebar === "function") {
    window.initSidebar();
  }
});