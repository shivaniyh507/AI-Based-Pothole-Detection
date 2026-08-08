/**
 * RoadSafe AI — Scan Road & AI Pothole Detection Module (scan2.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  initFileUploadDropzone();
  setupFormActionListeners();
});

function initFileUploadDropzone() {
  const dropzone = document.getElementById("uploadDropzone");
  const fileInput = document.getElementById("fileInput");
  const uploadPromptView = document.getElementById("uploadPromptView");
  const previewView = document.getElementById("previewView");
  const previewImage = document.getElementById("previewImage");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  });

  function handleFileSelection(file) {
    if (!file.type.startsWith("image/")) {
      if (window.showToast) window.showToast("Please upload an image file.", "danger");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (previewImage) previewImage.src = evt.target.result;
      if (uploadPromptView) uploadPromptView.style.display = "none";
      if (previewView) previewView.style.display = "block";
      simulateAiDetectionProcess();
    };
    reader.readAsDataURL(file);
  }
}

function simulateAiDetectionProcess() {
  const boundingBox = document.getElementById("aiBoundingBox");
  const confBadge = document.getElementById("aiConfidenceBadge");
  const submitBtn = document.getElementById("submitReportBtn");

  if (window.showToast) window.showToast("YOLO v8 Model Analyzing Road Surface...", "purple");

  setTimeout(() => {
    if (boundingBox) boundingBox.style.display = "block";
    if (confBadge) confBadge.innerText = "96.4% AI Match";
    if (submitBtn) submitBtn.disabled = false;
    if (window.showToast) window.showToast("Pothole Detected! High Hazard Score: 88", "danger");
  }, 1200);
}

function setupFormActionListeners() {
  const submitBtn = document.getElementById("submitReportBtn");
  const cancelBtn = document.getElementById("cancelUploadBtn");

  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      if (window.showToast) window.showToast("Pothole report successfully saved to database!", "success");

      // Save sample report to localStorage
      const newReport = {
        id: "REP-" + Math.floor(100 + Math.random() * 900),
        location: "Mall Road Junction, Kanpur",
        severity: "High",
        status: "Pending Verification",
        date: new Date().toISOString().split("T")[0]
      };

      const existing = JSON.parse(localStorage.getItem("roadsafe_reports") || "[]");
      existing.unshift(newReport);
      localStorage.setItem("roadsafe_reports", JSON.stringify(existing));

      setTimeout(() => {
        window.location.href = "my-reports2.html";
      }, 1000);
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      location.reload();
    });
  }
}
