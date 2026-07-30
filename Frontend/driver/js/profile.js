// ==========================================================================
// ROADIES - User Profile Controller (profile.js)
// Prepared for FastAPI & PostgreSQL Auth Integration
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  // Handle Profile Info Form Submit
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("inputFullName").value.trim();
      const email = document.getElementById("inputEmail").value.trim();

      // Update DOM bindings
      const profileNameElem = document.getElementById("profileName");
      const headerUserNameElem = document.getElementById("headerUserName");

      if (profileNameElem) profileNameElem.textContent = fullName;
      if (headerUserNameElem) headerUserNameElem.textContent = fullName;

      alert(`Profile updated successfully!\n\nName: ${fullName}\nEmail: ${email}`);

      // Backend API Integration Point:
      // await fetch('/api/v1/user/profile', { method: 'PUT', body: JSON.stringify({ fullName, email }) });
    });
  }

  // Handle Password Security Form Submit
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const currentPass = document.getElementById("inputCurrentPass").value;
      const newPass = document.getElementById("inputNewPass").value;
      const confirmPass = document.getElementById("inputConfirmPass").value;

      if (newPass !== confirmPass) {
        alert("Error: New Password and Confirm Password do not match.");
        return;
      }

      if (newPass.length < 6) {
        alert("Error: Password must be at least 6 characters long.");
        return;
      }

      alert("Security password updated successfully!");
      passwordForm.reset();

      // Backend API Integration Point:
      // await fetch('/api/v1/user/change-password', { method: 'POST', body: JSON.stringify({ currentPass, newPass }) });
    });
  }
});
