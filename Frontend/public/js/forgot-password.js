/* =========================================================
   RoadSafe AI — forgot-password.js
   Step transitions (Email -> OTP -> New Password -> Success),
   resend countdown timer. No real backend — simulated for demo.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const steps = {
    1: document.getElementById("step1"),
    2: document.getElementById("step2"),
    3: document.getElementById("step3"),
    4: document.getElementById("step4"),
  };
  const stepDots  = document.querySelectorAll(".step-dot");
  const stepLines = document.querySelectorAll(".step-line");
  const stepper   = document.getElementById("stepper");

  function goToStep(n) {
    Object.keys(steps).forEach(function (key) {
      steps[key].classList.toggle("active", Number(key) === n);
    });
    if (n <= 3) {
      stepDots.forEach(function (dot) {
        const step = Number(dot.dataset.step);
        dot.classList.toggle("active", step === n);
        dot.classList.toggle("done", step < n);
      });
      stepLines.forEach(function (line) {
        const idx = Number(line.dataset.line);
        line.classList.toggle("done", idx < n);
      });
    } else if (stepper) {
      stepper.style.display = "none";
    }
  }

  const fpEmail    = document.getElementById("fpEmail");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpSentTo  = document.getElementById("otpSentTo");

  sendOtpBtn.addEventListener("click", function () {
    if (!fpEmail.value || !fpEmail.value.includes("@")) {
      fpEmail.style.borderColor = "var(--danger)";
      fpEmail.focus();
      return;
    }
    fpEmail.style.borderColor = "";
    const original = sendOtpBtn.innerHTML;
    sendOtpBtn.disabled = true;
    sendOtpBtn.innerHTML = '<svg class="icon spin"><use href="#i-spinner"/></svg> Sending';

    setTimeout(function () {
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = original;
      otpSentTo.textContent = "We've sent a 6-digit code to " + fpEmail.value;
      goToStep(2);
      startResendTimer();
    }, 800);
  });

  const resendTimer = document.getElementById("resendTimer");
  const resendLink  = document.getElementById("resendLink");
  let countdownInterval = null;

  function startResendTimer() {
    let seconds = 30;
    resendLink.classList.add("disabled");
    resendTimer.style.display = "inline";
    clearInterval(countdownInterval);
    countdownInterval = setInterval(function () {
      seconds--;
      const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
      const ss = String(seconds % 60).padStart(2, "0");
      resendTimer.textContent = `Resend OTP in ${mm}:${ss}`;
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        resendTimer.style.display = "none";
        resendLink.classList.remove("disabled");
      }
    }, 1000);
  }

  resendLink.addEventListener("click", function () {
    if (resendLink.classList.contains("disabled")) return;
    startResendTimer();
  });

  const otpCode      = document.getElementById("otpCode");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");

  verifyOtpBtn.addEventListener("click", function () {
    if (!otpCode.value || otpCode.value.length < 4) {
      otpCode.style.borderColor = "var(--danger)";
      otpCode.focus();
      return;
    }
    otpCode.style.borderColor = "";
    const original = verifyOtpBtn.innerHTML;
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.innerHTML = '<svg class="icon spin"><use href="#i-spinner"/></svg> Verifying';

    setTimeout(function () {
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.innerHTML = original;
      clearInterval(countdownInterval);
      goToStep(3);
    }, 800);
  });

  const newPassword        = document.getElementById("newPassword");
  const confirmNewPassword = document.getElementById("confirmNewPassword");
  const updatePasswordBtn  = document.getElementById("updatePasswordBtn");

  updatePasswordBtn.addEventListener("click", function () {
    if (!newPassword.value || newPassword.value.length < 6) {
      newPassword.style.borderColor = "var(--danger)";
      newPassword.focus();
      return;
    }
    if (newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.style.borderColor = "var(--danger)";
      confirmNewPassword.focus();
      return;
    }
    newPassword.style.borderColor = "";
    confirmNewPassword.style.borderColor = "";

    const original = updatePasswordBtn.innerHTML;
    updatePasswordBtn.disabled = true;
    updatePasswordBtn.innerHTML = '<svg class="icon spin"><use href="#i-spinner"/></svg> Updating';

    setTimeout(function () {
      updatePasswordBtn.disabled = false;
      updatePasswordBtn.innerHTML = original;
      goToStep(4);
    }, 800);
  });

});
