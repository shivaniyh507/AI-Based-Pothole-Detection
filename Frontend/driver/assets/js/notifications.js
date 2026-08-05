// ===============================
// RoadSafe AI Notifications
// ===============================

const markAll = document.getElementById("markAll");

markAll.addEventListener("click",()=>{

    const unread=document.querySelectorAll(".unread");

    unread.forEach(card=>{

        card.classList.remove("unread");

    });

    markAll.innerHTML="✔ All Read";

    markAll.disabled=true;

});

// ===============================
// Click Animation
// ===============================

document.querySelectorAll(".notification-card").forEach(card=>{

    card.addEventListener("click",()=>{

        card.style.transform="scale(.98)";

        setTimeout(()=>{

            card.style.transform="scale(1)";

        },150);

    });

});

// ===============================
// Future Backend Ready
// ===============================

async function loadNotifications(){

    console.log("Notifications API Ready");

}

loadNotifications();    