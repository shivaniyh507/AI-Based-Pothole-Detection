/**
 * RoadSafe AI — Route History Controller (route-history2.js)
 */

document.addEventListener("DOMContentLoaded", () => {
  const table = document.querySelector(".data-table");
  if (!table) return;

  const rerouteBtns = table.querySelectorAll("a.btn");
  rerouteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.showToast) {
        window.showToast("Loading trip parameters into RoadSafe AI Route Planner...", "purple");
      }
    });
  });
});
