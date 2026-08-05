/* =========================================================
   RoadSafe AI — Topbar.js
   ========================================================= */

window.initTopbar = function () {
  const profileDropdown = document.getElementById("profileDropdown");
  const profileBtn = document.getElementById("profileBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  const profileAvatar = document.getElementById("profileAvatar");
  const profileName = document.getElementById("profileName");
  const profileRole = document.getElementById("profileRole");

  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  const notificationBtn = document.getElementById("notificationBtn");
  const notificationCount = document.getElementById("notificationCount");
  const logoutBtn = document.getElementById("logoutBtn");

  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("userRole");
  const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "{}"
  );

  if (isLoggedIn !== "true" || !role) {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const dirParts = parts.slice(0, parts.length - 1);
      const frontendIdx = dirParts.findIndex(p => p.toLowerCase() === 'frontend');
      const dirsInsideFrontend = frontendIdx !== -1
        ? dirParts.slice(frontendIdx + 1)
        : dirParts.slice(1);
      const loginPath = '../'.repeat(dirsInsideFrontend.length) + 'auth/views/login.html';
      window.location.href = loginPath;
      return;
  }

  const fullName = currentUser.fullName || (role === "admin" ? "System Administrator" : "Ritika Tripathi");
  const roleTitle = role === "admin" ? "Administrator" : "Driver Account";

  if (profileName) profileName.textContent = fullName;
  if (profileRole) profileRole.textContent = roleTitle;

  if (profileAvatar) {
    if (currentUser.profilePicture || currentUser.avatar) {
      const src = currentUser.profilePicture || currentUser.avatar;
      profileAvatar.innerHTML = `<img src="${src}" alt="${fullName}">`;
    } else {
      const initials = fullName
        .trim()
        .split(" ")
        .map(w => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      profileAvatar.textContent = initials || (role === "admin" ? "SA" : "RT");
    }
  }

  // Page title & subtitle
  const title = document.body.dataset.title;
  const subtitle = document.body.dataset.subtitle;

  if (pageTitle && title) {
    pageTitle.textContent = title;
  }
  if (pageSubtitle) {
    if (subtitle) {
      pageSubtitle.style.display = "block";
      pageSubtitle.textContent = subtitle;
    } else {
      pageSubtitle.style.display = "none";
    }
  }

  // Notification count
  function updateBadge() {
    if (!notificationCount) return;
    const list = JSON.parse(
    localStorage.getItem("notifications") || "[]"
    );

    const unread = list.filter(n => !n.read).length;    

    if (unread > 0) {
      notificationCount.style.display = "flex";
      notificationCount.textContent = unread > 9 ? "9+" : unread;
    } else {
      notificationCount.style.display = "none";
    }
  }

  updateBadge();

  // Notification button click
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      const path = window.location.pathname;
      const pagesIdx = path.indexOf('/pages/');
      if (pagesIdx !== -1) {
        const afterPages = path.substring(pagesIdx + 7);
        const depth = afterPages.split('/').filter(Boolean).length;
        const prefix = '../'.repeat(depth);
        window.location.href = `${prefix}profile/notifications.html`;
      } else {
        window.location.href = "profile/notifications.html";
      }
    });
  }

  // Profile dropdown toggle
  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("open");
      }
    });
  }

  // Dropdown items navigation
  const dropdownItems = document.querySelectorAll(".dropdown-item[data-page]");
  dropdownItems.forEach(item => {
    item.addEventListener("click", (e) => {
      const page = item.dataset.page;
      if (!page) return;
      e.preventDefault();
      // Resolve path relative to driver/pages/ folder
      const path = window.location.pathname;
      const pagesIdx = path.indexOf('/pages/');
      if (pagesIdx !== -1) {
        const afterPages = path.substring(pagesIdx + 7);
        const depth = afterPages.split('/').filter(Boolean).length;
        const prefix = '../'.repeat(depth);
        window.location.href = `${prefix}profile/${page}.html`;
      } else {
        window.location.href = `profile/${page}.html`;
      }
    });
  });

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        localStorage.removeItem("currentUser");
        const parts = window.location.pathname.split('/').filter(Boolean);
        const dirParts = parts.slice(0, parts.length - 1);
        const frontendIdx = dirParts.findIndex(p => p.toLowerCase() === 'frontend');
        const dirsInsideFrontend = frontendIdx !== -1
          ? dirParts.slice(frontendIdx + 1)
          : dirParts.slice(1);
        const loginPath = '../'.repeat(dirsInsideFrontend.length) + 'auth/views/login.html';
        window.location.href = loginPath;
      }
    });
  }
};

// document.addEventListener("DOMContentLoaded", () => {
//   if (typeof window.initTopbar === "function") {
//     window.initTopbar();
//   }
// });