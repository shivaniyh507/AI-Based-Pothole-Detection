// ==========================================================================
// RoadSafe AI - Scan Road Controller
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const uploadActionBtn = document.getElementById("uploadActionBtn");
  const cameraActionBtn = document.getElementById("cameraActionBtn");
  const previewImage = document.getElementById("previewImage");
  const previewVideo = document.getElementById("previewVideo");
  const placeholder = document.getElementById("placeholder");
  const scanBtn = document.getElementById("scanBtn");
  const generateReportBtn = document.getElementById("generateReportBtn");
  const dropArea = document.getElementById("dropArea");

  // Result fields
  const potholes = document.getElementById("potholes");
  const severity = document.getElementById("severity");
  const confidence = document.getElementById("confidence");
  const condition = document.getElementById("condition");
  const recommendation = document.getElementById("recommendation");
  const statusText = document.getElementById("statusText");

  // Trigger file browser
  if (browseBtn) {
    browseBtn.addEventListener("click", () => fileInput.click());
  }

  if (uploadActionBtn) {
    uploadActionBtn.addEventListener("click", () => fileInput.click());
  }

  if (cameraActionBtn) {
    cameraActionBtn.addEventListener("click", () => {
      alert("Camera stream initialized. Position camera towards road surface.");
    });
  }

  // Handle File Input Selection
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      placeholder.style.display = "none";
      const url = URL.createObjectURL(file);

      if (file.type.startsWith("image")) {
        previewImage.src = url;
        previewImage.style.display = "block";
        previewVideo.style.display = "none";
      } else if (file.type.startsWith("video")) {
        previewVideo.src = url;
        previewVideo.style.display = "block";
        previewImage.style.display = "none";
      }

      if (statusText) {
        statusText.textContent = "Media Ready for Detection";
      }
    });
  }

  // Drag & Drop Handling
  if (dropArea) {
    ["dragenter", "dragover"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        dropArea.style.backgroundColor = "var(--bg-purple-soft)";
      });
    });

    ["dragleave", "drop"].forEach((event) => {
      dropArea.addEventListener(event, (e) => {
        e.preventDefault();
        dropArea.style.backgroundColor = "var(--bg-main)";
      });
    });

    dropArea.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (!file) return;

      fileInput.files = e.dataTransfer.files;
      fileInput.dispatchEvent(new Event("change"));
    });
  }

  // Run AI Detection Scan Simulation
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      if (
        previewImage.style.display === "none" &&
        previewVideo.style.display === "none"
      ) {
        alert("Please upload an image or video file first.");
        return;
      }

      scanBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Running YOLO Detection...`;
      scanBtn.disabled = true;

      setTimeout(() => {
        const count = Math.floor(Math.random() * 5) + 1;
        const confidenceVal = Math.floor(Math.random() * 8) + 91;

        if (potholes) potholes.textContent = count;
        if (confidence) confidence.textContent = `${confidenceVal}%`;

        if (count <= 1) {
          if (severity) {
            severity.textContent = "Low Hazard";
            severity.className = "badge-tag badge-success-soft";
          }
          if (condition) condition.textContent = "Good Road Condition";
          if (recommendation) {
            recommendation.textContent = "Minor road surface wear. Safe for normal driving speeds.";
          }
        } else if (count <= 3) {
          if (severity) {
            severity.textContent = "Medium Hazard";
            severity.className = "badge-tag badge-warning-soft";
          }
          if (condition) condition.textContent = "Moderate Damage";
          if (recommendation) {
            recommendation.textContent = "Multiple shallow potholes detected. Reduce speed to 40 km/h.";
          }
        } else {
          if (severity) {
            severity.textContent = "High Hazard";
            severity.className = "badge-tag badge-danger-soft";
          }
          if (condition) condition.textContent = "Severe Surface Degradation";
          if (recommendation) {
            recommendation.textContent = "Critical pothole cluster detected. Reroute via safer alternative.";
          }
        }

        if (statusText) statusText.textContent = "Scan Complete";
        scanBtn.innerHTML = `<i class="fa-solid fa-check"></i> Scan Complete`;
        scanBtn.disabled = false;
      }, 2000);
    });
  }

  // Generate Report Button Action
  if (generateReportBtn) {
    generateReportBtn.addEventListener("click", () => {
      alert("New Pothole Detection Report generated and saved to 'My Reports'.");
      window.location.href = "my-reports.html";
    });
  }

  // Quick Action Shortcuts
  const quickStartScan = document.getElementById("quickStartScan");
  const quickOpenCamera = document.getElementById("quickOpenCamera");
  const quickViewReports = document.getElementById("quickViewReports");

  if (quickStartScan && browseBtn) {
    quickStartScan.addEventListener("click", () => browseBtn.click());
  }

  if (quickOpenCamera && cameraActionBtn) {
    quickOpenCamera.addEventListener("click", () => cameraActionBtn.click());
  }

  if (quickViewReports) {
    quickViewReports.addEventListener("click", () => {
      window.location.href = "my-reports.html";
    });
  }
});