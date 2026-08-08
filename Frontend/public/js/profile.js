/* ==========================================================
   RoadSafe AI
   Driver Profile
   Only Name & Profile Picture Editable
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       USER DATA
    ========================================= */

    const role = localStorage.getItem("userRole") || "driver";

    let currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
    );

    if (!currentUser.fullName) {
        window.location.href = "../auth/login.html";
            return;
    }    

    /* =========================================
       ELEMENTS
    ========================================= */

    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const editButtonGroup = document.getElementById("editButtonGroup");

    const fullName = document.getElementById("fullName");

    const email = document.getElementById("email");
    const phone = document.getElementById("phone");

    const city = document.getElementById("city");
    const state = document.getElementById("state");

    const vehicleNumber = document.getElementById("vehicleNumber");
    const vehicleType = document.getElementById("vehicleType");
    const licenseNumber = document.getElementById("licenseNumber");
    const driverStatus = document.getElementById("driverStatus");

    const profileNameElement =
    role === "admin"
        ? document.getElementById("adminName")
        : document.getElementById("driverName");


    const employeeId = document.getElementById("employeeId");
    const department = document.getElementById("department");
    const designation = document.getElementById("designation");
    const adminRole = document.getElementById("adminRole");
    const officeAddress = document.getElementById("officeAddress");
    const permissionsContainer = document.getElementById("permissionsContainer");    

    const profileImage = document.getElementById("profileImage");
    const profileInitials = document.getElementById("profileInitials");

    const photoInput = document.getElementById("profilePhotoInput");
    const changePhotoBtn = document.getElementById("changePhotoBtn");

    let selectedImage = null;

    /* =========================================
       LOAD PROFILE
    ========================================= */

    function loadProfile() {

        const name =
            currentUser.fullName ||
            "Ritika Tripathi";

        if (profileNameElement)
              profileNameElement.textContent = name;

        if (fullName)
            fullName.value = name;

        if (email)
            email.value =
                currentUser.email ||
                "rtktripathi2227@gmail.com";

        if (phone)
            phone.value =
                currentUser.phone ||
                "+919876543219";

        if (city)
            city.value =
                currentUser.city ||
                "Kanpur";

        if (state)
            state.value =
                currentUser.state ||
                "Uttar Pradesh";

        if (vehicleNumber)
            vehicleNumber.value =
                currentUser.vehicleNumber ||
                "UP32AB4589";

        if (vehicleType)
            vehicleType.value =
                currentUser.vehicleType ||
                "Car";

        if (licenseNumber)
            licenseNumber.value =
                currentUser.licenseNumber ||
                "UP1420230004587";

        if (driverStatus)
            driverStatus.value =
                currentUser.status ||
                "Active";

        updateAvatar(
            currentUser.profilePicture,
            name
        );

        if (role === "admin") {

            if (employeeId)
                employeeId.value = currentUser.employeeId || "";

            if (department)
                department.value = currentUser.department || "";

            if (designation)
                designation.value = currentUser.designation || "";

            if (adminRole)
                adminRole.value = currentUser.role || "";

            if (officeAddress)
                officeAddress.value = currentUser.officeAddress || "";

            if (permissionsContainer && Array.isArray(currentUser.permissions)) {

                permissionsContainer.innerHTML =
                    currentUser.permissions.map(permission => `
                        <span class="permission-chip">
                            <i class="fa-solid fa-check"></i>
                            ${permission}
                        </span>
                    `).join("");

            }

        }        

    }

        /* =========================================
       AVATAR
    ========================================= */

    function updateAvatar(imageSrc, name) {

        if (imageSrc) {

            profileImage.src = imageSrc;
            profileImage.style.display = "block";
            profileInitials.style.display = "none";

        } else {

            profileImage.style.display = "none";
            profileInitials.style.display = "flex";

            const initials = name
                .trim()
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .substring(0,2)
                .toUpperCase();

            profileInitials.textContent = initials;

        }

    }

    /* =========================================
       LOCK FIELDS
    ========================================= */

    function lockFields() {

        const lockedFields = role === "admin"
            ? [
                email,
                phone,
                employeeId,
                department,
                designation,
                adminRole,
                officeAddress
            ]
            : [
                email,
                phone,
                vehicleNumber,
                vehicleType,
                licenseNumber,
                driverStatus
            ];        

        lockedFields.forEach(field => {

            if(!field) return;

            field.readOnly = true;
            field.disabled = true;

            field.classList.add("locked-field");

            email.readOnly = true;
            email.disabled = false;

            phone.readOnly = true;
            phone.disabled = false;

            email.classList.add("locked-field");
            phone.classList.add("locked-field");            

            field.style.pointerEvents = "none";
            field.style.caretColor = "transparent";
            field.style.userSelect = "none";

        });

        if(fullName){

            fullName.readOnly = true;
            fullName.disabled = false;

        }

    }

    /* =========================================
       ENABLE EDIT
    ========================================= */

    function enableEdit(){

        fullName.readOnly = false;
        fullName.focus();

        editBtn.style.display = "none";
        editButtonGroup.style.display = "flex";

    }

    /* =========================================
       PHOTO CHANGE
    ========================================= */

    if(changePhotoBtn){

        changePhotoBtn.addEventListener("click",()=>{

            photoInput.click();

        });

    }

    if(photoInput){

        photoInput.addEventListener("change",(e)=>{

            const file = e.target.files[0];

            if(!file) return;

            const reader = new FileReader();

            reader.onload=function(event){

                selectedImage = event.target.result;

                updateAvatar(
                    selectedImage,
                    fullName.value
                );

            }

            reader.readAsDataURL(file);

        });

    }

        /* =========================================
       SAVE PROFILE
    ========================================= */

    function saveProfile() {

        currentUser.fullName = fullName.value.trim();

        if (role !== "admin") {
            currentUser.city = city ? city.value : "";
            currentUser.state = state ? state.value : "";
        }

        if (selectedImage) {

            currentUser.profilePicture = selectedImage;

        }

        localStorage.setItem(
                "currentUser",
                 JSON.stringify(currentUser)
        );

        if (profileNameElement) {
              profileNameElement.textContent = currentUser.fullName;
        }

        fullName.readOnly = true;

        lockFields();

        editBtn.style.display = "inline-flex";
        editButtonGroup.style.display = "none";

        if (typeof RoadSafeCommon !== "undefined") {

            RoadSafeCommon.showToast(
                "Profile Updated Successfully"
            );

        }

    }

    /* =========================================
       CANCEL EDIT
    ========================================= */

    function cancelEdit() {

        loadProfile();

        lockFields();

        selectedImage = null;

        fullName.readOnly = true;

        editBtn.style.display = "inline-flex";
        editButtonGroup.style.display = "none";

    }

    /* =========================================
       BUTTON EVENTS
    ========================================= */

    if (editBtn) {

        editBtn.addEventListener(
            "click",
            enableEdit
        );

    }

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            saveProfile
        );

    }

    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            cancelEdit
        );

    }

    /* =========================================
       INITIAL LOAD
    ========================================= */

    loadProfile();

    lockFields();

        /* =========================================
       SIDEBAR / TOPBAR SYNC
    ========================================= */

    function syncProfileUI() {

        const name =
            currentUser.fullName ||
            (role === "admin"
                ? "System Administrator"
                : "Driver");

        /* Sidebar */

        const sidebarName = document.getElementById("sidebarName");

        if (sidebarName) {
            sidebarName.textContent = name;
        }

        /* Topbar */

        const topbarName = document.getElementById("profileName");

        if (topbarName) {
            topbarName.textContent = name;
        }

        const topbarAvatar = document.getElementById("profileAvatar");

        if (topbarAvatar) {

          if (currentUser.profilePicture) {

              topbarAvatar.innerHTML =
                  `<img src="${currentUser.profilePicture}" alt="${name}">`;

          } else {

              const initials = name
                 .split(" ")
                  .map(word => word[0])
                  .join("")
                  .substring(0,2)
                  .toUpperCase();

              topbarAvatar.textContent = initials;

          }

      }      

    }

    syncProfileUI();

});