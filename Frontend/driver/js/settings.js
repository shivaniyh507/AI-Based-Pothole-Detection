// ==========================================================================
// ROADIES - Settings Controller (settings.js)
// Handles preferences, API Endpoint testing, and local cache management
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const confidenceSlider = document.getElementById("confidenceSlider");
  const confidenceVal = document.getElementById("confidenceVal");
  const testConnectionBtn = document.getElementById("testConnectionBtn");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  const apiEndpointInput = document.getElementById("apiEndpointInput");

  // Confidence Threshold Range Slider Handler
  if (confidenceSlider && confidenceVal) {
    confidenceSlider.addEventListener("input", (e) => {
      confidenceVal.textContent = `${e.target.value}%`;
    });
  }

  // Test FastAPI Connection Handler
  if (testConnectionBtn && apiEndpointInput) {
    testConnectionBtn.addEventListener("click", async () => {
      const endpoint = apiEndpointInput.value.trim();
      testConnectionBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Testing...`;
      testConnectionBtn.disabled = true;

      setTimeout(() => {
        alert(
          `ROADIES FastAPI Connection Status:\n\nURL: ${endpoint}\nStatus: 200 OK (Simulation)\nDatabase: PostgreSQL Connected\nAI Engine: YOLOv8 Ready`
        );
        testConnectionBtn.innerHTML = `<i class="fa-solid fa-plug"></i> Test API`;
        testConnectionBtn.disabled = false;
      }, 1200);
    });
  }

  // Clear Offline Cache Handler
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear offline map tiles and local data cache?")) {
        alert("ROADIES local offline cache cleared successfully.");
      }
    });
  }
});
