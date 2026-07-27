// ===============================
// RoadSafe AI - My Reports
// ===============================

const searchInput = document.getElementById("searchReport");
const statusFilter = document.getElementById("statusFilter");
const reportTable = document.getElementById("reportTable");

// ===============================
// Search
// ===============================

searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    const rows = reportTable.querySelectorAll("tr");

    rows.forEach(row => {

        row.style.display = row.innerText.toLowerCase().includes(value)
            ? ""
            : "none";

    });

});

// ===============================
// Status Filter
// ===============================

statusFilter.addEventListener("change", () => {

    const status = statusFilter.value;

    const rows = reportTable.querySelectorAll("tr");

    rows.forEach(row => {

        if(status==="All"){

            row.style.display="";

            return;

        }

        row.style.display=row.innerText.includes(status)
            ?""
            :"none";

    });

});

// ===============================
// Delete
// ===============================

document.querySelectorAll(".deleteBtn").forEach(btn=>{

    btn.addEventListener("click",()=>{

        if(confirm("Delete this report?")){

            btn.closest("tr").remove();

            updateStats();

        }

    });

});

// ===============================
// View
// ===============================

document.querySelectorAll(".viewBtn").forEach(btn=>{

    btn.addEventListener("click",()=>{

        alert(
`RoadSafe AI

Location : GT Road

Severity : High

Status : Pending

Confidence : 96%

This is a demo preview.
Backend integration will be added later.`
        );

    });

});

// ===============================
// Stats Counter
// ===============================

function updateStats(){

    const rows=[...reportTable.querySelectorAll("tr")];

    document.getElementById("totalReports").innerText=rows.length;

    document.getElementById("pendingReports").innerText=
        rows.filter(r=>r.innerText.includes("Pending")).length;

    document.getElementById("verifiedReports").innerText=
        rows.filter(r=>r.innerText.includes("Verified")).length;

    document.getElementById("resolvedReports").innerText=
        rows.filter(r=>r.innerText.includes("Resolved")).length;

}

updateStats();


// ===============================
// Export CSV
// ===============================

function exportCSV(){

    let csv=[];

    document.querySelectorAll("table tr").forEach(row=>{

        let cols=row.querySelectorAll("th,td");

        let data=[];

        cols.forEach(col=>{

            data.push(col.innerText);

        });

        csv.push(data.join(","));

    });

    const blob=new Blob([csv.join("\n")],{type:"text/csv"});

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="RoadSafeAI_Reports.csv";

    a.click();

}

// ===============================
// Dummy API Ready
// ===============================

async function loadReports(){

    console.log("Backend API will be connected here.");

}