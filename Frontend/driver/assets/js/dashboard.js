document.addEventListener("DOMContentLoaded", () => {
  const mapBox = document.getElementById("map");
  if (mapBox) {
    mapBox.innerHTML = `
      <div class="map-placeholder">
        <i class="fa-solid fa-map-location-dot"></i>
        <p>Google Map will load here</p>
      </div>
    `;
  }
});