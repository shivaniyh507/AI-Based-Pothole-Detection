// =============================
// RoadSafe AI - Scan Road
// =============================

const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const previewVideo = document.getElementById("previewVideo");
const placeholder = document.getElementById("placeholder");
const scanBtn = document.getElementById("scanBtn");

// Result Fields

const potholes = document.getElementById("potholes");
const severity = document.getElementById("severity");
const confidence = document.getElementById("confidence");
const condition = document.getElementById("condition");
const recommendation = document.getElementById("recommendation");

// =============================
// Preview Image / Video
// =============================

fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    placeholder.style.display = "none";

    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image")) {

        previewImage.src = url;
        previewImage.style.display = "block";
        previewVideo.style.display = "none";

    }

    else if (file.type.startsWith("video")) {

        previewVideo.src = url;
        previewVideo.style.display = "block";
        previewImage.style.display = "none";

    }

});

// =============================
// Dummy AI Scan
// =============================

scanBtn.addEventListener("click", () => {

    if (previewImage.style.display === "none" &&
        previewVideo.style.display === "none") {

        alert("Please upload an image or video first.");

        return;

    }

    scanBtn.innerHTML =
        `<i class="fa-solid fa-spinner fa-spin"></i> Scanning...`;

    scanBtn.disabled = true;

    setTimeout(() => {

        const potholeCount = Math.floor(Math.random() * 6);

        const confidenceValue =
            Math.floor(Math.random() * 10) + 90;

        potholes.innerText = potholeCount;

        confidence.innerText = confidenceValue + "%";

        if (potholeCount == 0) {

            severity.innerText = "None";
            severity.style.color = "#16a34a";

            condition.innerText = "Excellent";

            recommendation.innerText =
                "Road looks safe. Continue driving.";

        }

        else if (potholeCount <= 2) {

            severity.innerText = "Low";
            severity.style.color = "#22c55e";

            condition.innerText = "Good";

            recommendation.innerText =
                "Minor potholes detected. Drive carefully.";

        }

        else if (potholeCount <= 4) {

            severity.innerText = "Medium";
            severity.style.color = "#f59e0b";

            condition.innerText = "Moderate";

            recommendation.innerText =
                "Reduce speed and stay alert.";

        }

        else {

            severity.innerText = "High";
            severity.style.color = "#ef4444";

            condition.innerText = "Poor";

            recommendation.innerText =
                "Avoid this road if possible.";

        }

        scanBtn.innerHTML =
            `<i class="fa-solid fa-check"></i> Scan Complete`;

        scanBtn.style.background = "#16a34a";

    }, 2500);

});

// =============================
// Drag & Drop
// =============================

const dropArea = document.getElementById("dropArea");

["dragenter", "dragover"].forEach(event => {

    dropArea.addEventListener(event, e => {

        e.preventDefault();

        dropArea.style.background = "#eef5ff";

    });

});

["dragleave", "drop"].forEach(event => {

    dropArea.addEventListener(event, e => {

        e.preventDefault();

        dropArea.style.background = "white";

    });

});

dropArea.addEventListener("drop", e => {

    const file = e.dataTransfer.files[0];

    if (!file) return;

    fileInput.files = e.dataTransfer.files;

    fileInput.dispatchEvent(new Event("change"));

});