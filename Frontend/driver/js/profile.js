// ==========================================================================
// ROADIES - User Profile Controller (profile.js)
// Prepared for FastAPI & PostgreSQL Auth Integration
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  // Load saved profile name from LocalStorage
  const savedName = localStorage.getItem("roadies_user_fullname");
  if (savedName) {
    const fullNameInput = document.getElementById("inputFullName");
    const profileNameElem = document.getElementById("profileName");
    const headerUserNameElem = document.getElementById("headerUserName");

    if (fullNameInput) fullNameInput.value = savedName;
    if (profileNameElem) profileNameElem.textContent = savedName;
    if (headerUserNameElem) headerUserNameElem.textContent = savedName;
  }

  // Handle Profile Info Form Submit
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("inputFullName").value.trim();
      const email = document.getElementById("inputEmail").value.trim();

      // Update LocalStorage and DOM bindings
      localStorage.setItem("roadies_user_fullname", fullName);

      const profileNameElem = document.getElementById("profileName");
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
        alert(`Profile updated successfully!\nName: ${fullName}\nEmail: ${email}`);
      }
    });
  }

  // Handle Password Security Form Submit
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newPass = document.getElementById("inputNewPass").value;
      const confirmPass = document.getElementById("inputConfirmPass").value;

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
