// ==========================================================================
// ROADIES - User Profile Controller (profile.js)
// Prepared for FastAPI & PostgreSQL Auth Integration
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  // Ensure default demo session if currentUser is missing
  let currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (!currentUser.fullName) {
    const savedName = localStorage.getItem("roadies_user_fullname") || "Archita Trivedi";
    currentUser = {
      fullName: savedName,
      email: "archita.trivedi@roadies.ai",
      phone: "+91 98765 43210",
      role: "driver"
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  // Load saved profile name from LocalStorage
  const savedName = localStorage.getItem("roadies_user_fullname") || currentUser.fullName;
  if (savedName) {
    const fullNameInput = document.getElementById("inputFullName") || document.getElementById("fullName");
    const profileNameElem = document.getElementById("profileName") || document.getElementById("driverName");
    const headerUserNameElem = document.getElementById("headerUserName");

    if (fullNameInput) fullNameInput.value = savedName;
    if (profileNameElem) profileNameElem.textContent = savedName;
    if (headerUserNameElem) headerUserNameElem.textContent = savedName;
  }

  // Handle Profile Info Form Submit
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullNameInput = document.getElementById("inputFullName") || document.getElementById("fullName");
      const fullName = fullNameInput ? fullNameInput.value.trim() : "Archita Trivedi";

      // Update LocalStorage and DOM bindings
      localStorage.setItem("roadies_user_fullname", fullName);
      currentUser.fullName = fullName;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      const profileNameElem = document.getElementById("profileName") || document.getElementById("driverName");
      const headerUserNameElem = document.getElementById("headerUserName");

      if (profileNameElem) profileNameElem.textContent = fullName;
      if (headerUserNameElem) headerUserNameElem.textContent = fullName;

      // Update header profile pills across all elements
      document.querySelectorAll(".profile-info strong, #headerUserName").forEach(el => {
        el.textContent = fullName;
      });

      if (window.showToast) {
        window.showToast(`Profile changes saved for ${fullName}`, "success");
      } else {
        alert(`Profile updated successfully!\nName: ${fullName}`);
      }
    });
  }

  // Handle Password Security Form Submit
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPassElem = document.getElementById("inputNewPass");
      const confirmPassElem = document.getElementById("inputConfirmPass");

      const newPass = newPassElem ? newPassElem.value : "";
      const confirmPass = confirmPassElem ? confirmPassElem.value : "";

      if (newPass !== confirmPass) {
        if (window.showToast) {
          window.showToast("Error: Passwords do not match.", "danger");
        } else {
          alert("Error: Passwords do not match.");
        }
        return;
      }

      if (newPass.length < 6) {
        if (window.showToast) {
          window.showToast("Password must be at least 6 characters long.", "danger");
        } else {
          alert("Password must be at least 6 characters long.");
        }
        return;
      }

      if (window.showToast) {
        window.showToast("Security password updated successfully!", "success");
      } else {
        alert("Security password updated successfully!");
      }
      passwordForm.reset();
    });
  }
});
