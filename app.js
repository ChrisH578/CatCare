// --- Daten laden ---
let cats = JSON.parse(localStorage.getItem("cats")) || [];
let currentCatId = localStorage.getItem("currentCatId") || null;

// --- DOM Elemente ---
const main = document.getElementById("mainContent");
const selector = document.getElementById("catSelector");
const addCatBtn = document.getElementById("addCatBtn");

// --- Speichern ---
function save() {
  localStorage.setItem("cats", JSON.stringify(cats));
  localStorage.setItem("currentCatId", currentCatId);
}

// --- Katzen Dropdown ---
function renderSelector() {
  selector.innerHTML = "";
  cats.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    selector.appendChild(option);
  });
  selector.value = currentCatId;
}

// --- Dashboard / Startseite ---
function renderDashboard() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) {
    renderAddCatForm();
    return;
  }

  const lastWeight = cat.data.weight.length
    ? cat.data.weight[cat.data.weight.length - 1].value + " kg"
    : "Kein Eintrag";

  const lastFood = cat.data.food.length
    ? `${cat.data.food[cat.data.food.length - 1].amount} g ${cat.data.food[cat.data.food.length - 1].type} um ${cat.data.food[cat.data.food.length - 1].time}`
    : "Kein Eintrag";

  const lastPlay = cat.data.play.length
    ? `${cat.data.play[cat.data.play.length - 1].duration} min ${cat.data.play[cat.data.play.length - 1].type}`
    : "Kein Eintrag";

  let dashboardHTML = `
    <div class="card">
      ${cat.image ? `<img src="${cat.image}" class="cat-image">` : ''}
      <h2>${cat.name}</h2>
      <p>Letztes Gewicht: ${lastWeight}</p>
      <p>Letzte Fütterung: ${lastFood}</p>
      <p>Letztes Spiel: ${lastPlay}</p>
    </div>
  `;

  if (cat.data.weight.length > 0) {
    dashboardHTML += `
      <div class="card">
        <h3>Gewichtsverlauf</h3>
        <canvas id="weightChart"></canvas>
      </div>
    `;
  }

  main.innerHTML = dashboardHTML;

  if (cat.data.weight.length > 0) {
    renderWeightChart(cat);
  }
}

// --- Gewichtsdiagramm ---
function renderWeightChart(cat) {
  const ctx = document.getElementById("weightChart").getContext("2d");
  const labels = cat.data.weight.map(w => w.date);
  const data = cat.data.weight.map(w => parseFloat(w.value));
  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Gewicht in kg",
        data: data,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

// --- Add Cat Form ---
function renderAddCatForm() {
  main.innerHTML = `
    <div class="card">
      <h2>Neue Katze hinzufügen</h2>
      <input id="name" placeholder="Name"><br><br>
      <input id="birthdate" type="date"><br><br>
      <select id="gender">
        <option value="männlich">männlich</option>
        <option value="weiblich">weiblich</option>
      </select><br><br>
      <label>Bild auswählen: <input id="catImage" type="file" accept="image/*"></label><br><br>
      <button onclick="createCat()">Speichern</button>
    </div>
  `;
}

function createCat() {
  const name = document.getElementById("name").value;
  const birthdate = document.getElementById("birthdate").value;
  const gender = document.getElementById("gender").value;
  const imageInput = document.getElementById("catImage");

  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageBase64 = e.target.result;
      addCat(name, birthdate, gender, imageBase64);
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    addCat(name, birthdate, gender, null);
  }
}

function addCat(name, birthdate, gender, image) {
  const newCat = {
    id: Date.now().toString(),
    name,
    birthdate,
    gender,
    image: image,
    data: { weight: [], food: [], play: [], sleep: [], vet: [], medication: [] }
  };
  cats.push(newCat);
  currentCatId = newCat.id;
  save();
  renderSelector();
  renderDashboard();
}

// --- Weight Tracking ---
function renderWeights() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Gewicht hinzufügen</h2>
      <input id="weightValue" type="number" placeholder="Gewicht in kg">
      <button onclick="addWeight()">Speichern</button>
    </div>
    <ul id="weightList">
      ${cat.data.weight.map((w, index) => `<li>${w.value} kg (${w.date}) <button onclick="deleteWeight(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addWeight() {
  const value = document.getElementById("weightValue").value;
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.weight.push({ value, date: new Date().toLocaleDateString() });
  save();
  renderWeights();
}

function deleteWeight(index) {
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.weight.splice(index, 1);
  save();
  renderWeights();
}

// --- Food Tracking ---
function renderFood() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Fütterung hinzufügen</h2>
      <input id="foodType" placeholder="Futterart (Nass/Trocken/Snack)">
      <input id="foodAmount" type="number" placeholder="Menge in g">
      <input id="foodTime" type="time">
      <button onclick="addFood()">Speichern</button>
    </div>
    <ul id="foodList">
      ${cat.data.food.map((f, index) => `<li>${f.date} – ${f.amount} g ${f.type} um ${f.time} <button onclick="deleteFood(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addFood() {
  const type = document.getElementById("foodType").value;
  const amount = document.getElementById("foodAmount").value;
  const time = document.getElementById("foodTime").value || "–";
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.food.push({ type, amount, time, date: new Date().toLocaleDateString() });
  save();
  renderFood();
}

function deleteFood(index) {
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.food.splice(index, 1);
  save();
  renderFood();
}

// --- Play Tracking ---
function renderPlay() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Spielzeit hinzufügen</h2>
      <input id="playType" placeholder="Art des Spiels (Laser/Feder/Ball)">
      <input id="playDuration" type="number" placeholder="Dauer in Minuten">
      <button onclick="addPlay()">Speichern</button>
    </div>
    <ul id="playList">
      ${cat.data.play.map((p, index) => `<li>${p.date} – ${p.duration} min ${p.type} <button onclick="deletePlay(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addPlay() {
  const type = document.getElementById("playType").value;
  const duration = document.getElementById("playDuration").value;
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.play.push({ type, duration, date: new Date().toLocaleDateString(), notes: "" });
  save();
  renderPlay();
}

function deletePlay(index) {
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.play.splice(index, 1);
  save();
  renderPlay();
}

// --- Sleep Tracking ---
function renderSleep() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Schlaf hinzufügen</h2>
      <label>Von: <input type="time" id="sleepStart"></label><br><br>
      <label>Bis: <input type="time" id="sleepEnd"></label><br><br>
      <button onclick="addSleep()">Speichern</button>
    </div>
    <ul id="sleepList">
      ${cat.data.sleep.map((s,index)=>`<li>${s.date} – ${s.duration} h <button onclick="deleteSleep(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addSleep() {
  const start = document.getElementById("sleepStart").value;
  const end = document.getElementById("sleepEnd").value;
  if (!start || !end) return alert("Bitte Start- und Endzeit eingeben");
  let diff = (new Date("1970-01-01T"+end) - new Date("1970-01-01T"+start))/1000/60/60;
  if(diff<0) diff+=24;
  const cat = cats.find(c=>c.id===currentCatId);
  cat.data.sleep.push({start,end,duration:diff.toFixed(2),date:new Date().toLocaleDateString()});
  save();
  renderSleep();
}

function deleteSleep(index){ const cat=cats.find(c=>c.id===currentCatId); cat.data.sleep.splice(index,1); save(); renderSleep(); }

// --- Vet Tracking ---
function renderVet() {
  const cat=cats.find(c=>c.id===currentCatId);
  if(!cat) return;
  main.innerHTML = `
    <div class="card">
      <h2>Tierarztbesuch hinzufügen</h2>
      <label>Datum: <input type="date" id="vetDate"></label><br><br>
      <input id="vetReason" placeholder="Grund"><br><br>
      <input id="vetDiagnosis" placeholder="Diagnose"><br><br>
      <input id="vetNotes" placeholder="Notizen"><br><br>
      <button onclick="addVet()">Speichern</button>
    </div>
    <ul id="vetList">
      ${cat.data.vet.map((v,index)=>`<li>${v.date} – ${v.reason} – ${v.diagnosis} <button onclick="deleteVet(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addVet() {
  const date=document.getElementById("vetDate").value;
  const reason=document.getElementById("vetReason").value;
  const diagnosis=document.getElementById("vetDiagnosis").value;
  const notes=document.getElementById("vetNotes").value;
  if(!date||!reason)return alert("Bitte Datum und Grund eingeben");
  const cat=cats.find(c=>c.id===currentCatId);
  cat.data.vet.push({date,reason,diagnosis,notes});
  save();
  renderVet();
}

function deleteVet(index){ const cat=cats.find(c=>c.id===currentCatId); cat.data.vet.splice(index,1); save(); renderVet(); }

// --- Meds Tracking ---
function renderMeds() {
  const cat=cats.find(c=>c.id===currentCatId);
  if(!cat) return;
  const active=cat.data.medication.filter(m=>m.status==="aktiv");
  const archived=cat.data.medication.filter(m=>m.status==="abgeschlossen");

  main.innerHTML=`
    <div class="card">
      <h2>Medikament hinzufügen</h2>
      <input id="medName" placeholder="Name">
      <input id="medDose" placeholder="Dosierung / Frequenz">
      <label>Start: <input type="date" id="medStart"></label>
      <label>Ende: <input type="date" id="medEnd"></label><br><br>
      <input id="medNotes" placeholder="Notizen"><br><br>
      <button onclick="addMed()">Speichern</button>
    </div>
    <h3>Aktiv</h3><ul>
      ${active.map((m,index)=>`<li>${m.name} – ${m.dose} <button onclick="completeMed('${m.date}')">Abschließen</button><button onclick="deleteMed(${index})" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
    <h3>Archiv</h3><ul>
      ${archived.map((m,index)=>`<li>${m.name} – ${m.dose} <button onclick="deleteMed(${index},true)" class="deleteBtn">❌</button></li>`).join("")}
    </ul>
  `;
}

function addMed() {
  const name=document.getElementById("medName").value;
  const dose=document.getElementById("medDose").value;
  const start=document.getElementById("medStart").value;
  const end=document.getElementById("medEnd").value;
  const notes=document.getElementById("medNotes").value;
  if(!name||!dose||!start)return alert("Bitte Name, Dosierung und Startdatum eingeben");
  const cat=cats.find(c=>c.id===currentCatId);
  cat.data.medication.push({name,dose,start,end:end||"",notes,status:"aktiv",date:Date.now().toString()});
  save();
  renderMeds();
}

function completeMed(date){ const cat=cats.find(c=>c.id===currentCatId); const med=cat.data.medication.find(m=>m.date===date); if(med)med.status="abgeschlossen"; save(); renderMeds(); }

function deleteMed(index,archived=false){
  const cat=cats.find(c=>c.id===currentCatId);
  if(!cat) return;
  if(archived){
    const meds=cat.data.medication.filter(m=>m.status==="abgeschlossen");
    const m=meds[index];
    const i=cat.data.medication.findIndex(x=>x.date===m.date);
    if(i!==-1)cat.data.medication.splice(i,1);
  } else {
    const meds=cat.data.medication.filter(m=>m.status==="aktiv");
    const m=meds[index];
    const i=cat.data.medication.findIndex(x=>x.date===m.date);
    if(i!==-1)cat.data.medication.splice(i,1);
  }
  save();
  renderMeds();
}

// --- Settings ---
function renderSettings() {
  main.innerHTML = `
    <div class="card">
      <h2>Einstellungen</h2>
      <button onclick="toggleTheme()">Dark / Light wechseln</button>
      <br><br>
      <button onclick="exportData()">Backup exportieren</button>
      <input type="file" onchange="importData(event)">
    </div>
  `;
}

function toggleTheme() { document.body.classList.toggle("light"); }
function exportData() { const blob=new Blob([JSON.stringify(cats)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="catcare_backup.json"; a.click(); }
function importData(event){ const file=event.target.files[0]; const reader=new FileReader(); reader.onload=function(e){ cats=JSON.parse(e.target.result); save(); renderSelector(); renderDashboard(); }; reader.readAsText(file); }

// --- Navigation ---
document.querySelectorAll(".bottom-nav button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const page=btn.dataset.page;
    if(page==="dashboard") renderDashboard();
    if(page==="weight") renderWeights();
    if(page==="food") renderFood();
    if(page==="play") renderPlay();
    if(page==="sleep") renderSleep();
    if(page==="vet") renderVet();
    if(page==="meds") renderMeds();
    if(page==="settings") renderSettings();
  });
});

// --- Initial ---
renderSelector();
renderDashboard();

// --- Service Worker ---
if('serviceWorker' in navigator){ navigator.serviceWorker.register('service-worker.js'); }