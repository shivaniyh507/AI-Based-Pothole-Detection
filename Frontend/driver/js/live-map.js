// ======================================
// RoadSafe AI - Live Map
// ======================================

let map;

function initMap() {

    // Default Location (Kanpur)

    const center = {

        lat: 26.4499,
        lng: 80.3319

    };

    map = new google.maps.Map(

        document.getElementById("map"),

        {

            zoom: 13,

            center: center,

            mapTypeControl: false,

            streetViewControl: false,

            fullscreenControl: true,

            zoomControl: true

        }

    );

    // Current Location Marker

    new google.maps.Marker({

        position: center,

        map,

        title: "Current Location",

        animation: google.maps.Animation.DROP,

        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"

    });

    // Dummy Pothole Data

    const potholes = [

        {

            lat:26.4524,

            lng:80.3345,

            level:"High",

            color:"red"

        },

        {

            lat:26.4465,

            lng:80.3262,

            level:"Medium",

            color:"orange"

        },

        {

            lat:26.4555,

            lng:80.3402,

            level:"Low",

            color:"green"

        }

    ];

    potholes.forEach((point)=>{

        new google.maps.Marker({

            position:{

                lat:point.lat,

                lng:point.lng

            },

            map,

            title:point.level+" Risk",

            icon:

            "http://maps.google.com/mapfiles/ms/icons/"+point.color+"-dot.png"

        });

    });

}

// ================================
// Current Location
// ================================

document

.getElementById("locationBtn")

.addEventListener("click",()=>{

if(navigator.geolocation){

navigator.geolocation.getCurrentPosition((pos)=>{

const loc={

lat:pos.coords.latitude,

lng:pos.coords.longitude

};

map.setCenter(loc);

new google.maps.Marker({

position:loc,

map,

animation:google.maps.Animation.BOUNCE,

title:"You are here"

});

});

}else{

alert("Geolocation not supported.");

}

});

// ================================
// Route Button
// ================================

document

.getElementById("routeBtn")

.addEventListener("click",()=>{

alert(

"Google Directions API will be connected in Backend."

);

});

// ================================
// Search
// ================================

const search=document.querySelector(".search-box input");

search.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

alert("Searching for: "+search.value);

}

});

// ================================
// Future Backend APIs
// ================================

async function loadPotholes(){

console.log("Fetching potholes from backend...");

}

async function loadRoutes(){

console.log("Fetching AI routes...");

}

loadPotholes();

loadRoutes();