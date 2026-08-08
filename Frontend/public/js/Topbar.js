/* =========================================================
   RoadSafe AI — Topbar.js
   ========================================================= */

window.initTopbar = function () {

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const profileDropdown = document.getElementById("profileDropdown");
    const profileBtn = document.getElementById("profileBtn");

    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileRole = document.getElementById("profileRole");

    const pageTitle = document.getElementById("pageTitle");
    const pageSubtitle = document.getElementById("pageSubtitle");

    const notificationBtn = document.getElementById("notificationBtn");
    const notificationCount = document.getElementById("notificationCount");

    const notificationPreview =
        document.getElementById("notificationPreview");

    const previewList =
        document.getElementById("previewList");

    const previewCount =
        document.getElementById("previewCount");

    const viewAllNotifications =
        document.getElementById("viewAllNotifications");

    const logoutBtn =
        document.getElementById("logoutBtn");

    /* =====================================================
       AUTH CHECK
    ====================================================== */

    const isLoggedIn =
        localStorage.getItem("isLoggedIn");

    const role =
        localStorage.getItem("userRole");

    const currentUser = JSON.parse(

        localStorage.getItem("currentUser") || "{}"

    );

    if (isLoggedIn !== "true" || !role) {

        window.location.href = "../auth/login.html";

        return;

    }

    /* =====================================================
       PROFILE
    ====================================================== */

    const fullName =
        currentUser.fullName ||
        (role === "admin"
            ? "System Administrator"
            : "Ritika Tripathi");

    const roleTitle =
        role === "admin"
            ? "Administrator"
            : "Driver Account";

    if (profileName)
        profileName.textContent = fullName;

    if (profileRole)
        profileRole.textContent = roleTitle;

    if (profileAvatar) {

        if (currentUser.profilePicture || currentUser.avatar) {

            const src =
                currentUser.profilePicture ||
                currentUser.avatar;

            profileAvatar.innerHTML =
                `<img src="${src}" alt="${fullName}">`;

        }

        else {

            const initials =
                fullName
                    .trim()
                    .split(" ")
                    .map(w => w[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

            profileAvatar.textContent =
                initials ||
                (role === "admin" ? "SA" : "RT");

        }

    }

    /* =====================================================
       PAGE TITLE
    ====================================================== */

    const title =
        document.body.dataset.title;

    const subtitle =
        document.body.dataset.subtitle;

    if (pageTitle && title)
        pageTitle.textContent = title;

    if (pageSubtitle) {

        if (subtitle) {

            pageSubtitle.style.display = "block";

            pageSubtitle.textContent = subtitle;

        }

        else {

            pageSubtitle.style.display = "none";

        }

    }

    /* =====================================================
       NOTIFICATION BADGE
    ====================================================== */
// Notification count
      function updateBadge() {

          if (!notificationCount) return;

          let allNotifications = {};

          if (window.RoadSafeData) {

              allNotifications = window.RoadSafeData.getNotifications();

          } else {

              allNotifications = JSON.parse(
                  localStorage.getItem("roadsafe_notifications") || "{}"
              );

          }

          const roleNotifications = allNotifications[role] || [];

          const unread = roleNotifications.filter(n => !n.read).length;

          if (unread > 0) {

              notificationCount.style.display = "flex";
              notificationCount.textContent = unread > 9 ? "9+" : unread;

          } else {

              notificationCount.style.display = "none";

          }

          loadPreview();

      }      
    /* =====================================================
       LOAD NOTIFICATION PREVIEW
    ====================================================== */

function loadPreview() {

    if (!previewList) return;

    let allNotifications = {};

    if (window.RoadSafeData) {
        allNotifications = window.RoadSafeData.getNotifications();
    } else {
        allNotifications = JSON.parse(
            localStorage.getItem("roadsafe_notifications") || "{}"
        );
    }

    let notifications = allNotifications[role] || [];

    // Latest first
    notifications = notifications.sort((a, b) => b.id - a.id);

    const latest = notifications.slice(0, 3);

    previewList.innerHTML = "";

    const unread = notifications.filter(n => !n.read).length;

    if (previewCount) {
        previewCount.textContent = unread;
    }

    if (latest.length === 0) {

        previewList.innerHTML = `
            <div class="preview-empty">
                <i class="fa-regular fa-bell"></i>
                <p>No new notifications</p>
            </div>
        `;

        return;
    }

    latest.forEach(item => {

        let icon = "fa-bell";

        if (item.category === "alert")
            icon = "fa-triangle-exclamation";

        else if (item.category === "report")
            icon = "fa-file-lines";

        else if (item.category === "system")
            icon = "fa-gear";

        previewList.innerHTML += `

        <div class="preview-item">

            <div class="preview-icon ${item.category}">
                <i class="fa-solid ${icon}"></i>
            </div>

            <div class="preview-content">

                <h4>
                    ${item.title}
                    ${!item.read ? '<span class="preview-dot"></span>' : ''}
                </h4>

                <p>${item.message}</p>

                <span>${item.time}</span>

            </div>

        </div>

        `;

    });

}

        /* =====================================================
       NOTIFICATION EVENTS
    ====================================================== */

    if (notificationBtn) {

        // Mobile → Direct Notifications Page
        if (window.innerWidth <= 768) {

            notificationBtn.addEventListener("click", () => {

                window.location.href = "notifications.html";

            });

        }

        // Desktop
        else {

            let hideTimer;

            notificationBtn.addEventListener("mouseenter", () => {

                clearTimeout(hideTimer);

                updateBadge();   

                loadPreview();

                if (notificationPreview)
                    notificationPreview.classList.add("show");

            });

            notificationBtn.addEventListener("mouseleave", () => {

                hideTimer = setTimeout(() => {

                    if (
                        notificationPreview &&
                        !notificationPreview.matches(":hover")
                    ) {

                        notificationPreview.classList.remove("show");

                    }

                }, 150);

            });

            if (notificationPreview) {

                notificationPreview.addEventListener("mouseenter", () => {

                    clearTimeout(hideTimer);

                });

                notificationPreview.addEventListener("mouseleave", () => {

                    notificationPreview.classList.remove("show");

                });

            }

            notificationBtn.addEventListener("click", () => {

                window.location.href = "notifications.html";

            });

        }

    }

    /* =====================================================
       VIEW ALL
    ====================================================== */

    if (viewAllNotifications) {

        viewAllNotifications.addEventListener("click", () => {

            window.location.href = "notifications.html";

        });

    }


    updateBadge();
    loadPreview();

    window.addEventListener("storage", () => {

        updateBadge();
        loadPreview();

    });    

    /* =====================================================
       PROFILE DROPDOWN
    ====================================================== */

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

    /* =====================================================
       PROFILE MENU NAVIGATION
    ====================================================== */

    document
        .querySelectorAll(".dropdown-item[data-page]")
        .forEach(item => {

            item.addEventListener("click", () => {

                const page = item.dataset.page;

                if (page) {

                    window.location.href = `${page}.html`;

                }

            });

        });

    /* =====================================================
       LOGOUT
    ====================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            if (!confirm("Are you sure you want to sign out?"))
                return;

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userRole");
            localStorage.removeItem("currentUser");

            window.location.href = "../auth/login.html";

        });

    }

};

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    if (typeof window.initTopbar === "function") {

        window.initTopbar();

    }

});

