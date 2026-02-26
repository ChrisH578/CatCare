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

selector.addEventListener("change", e => {
  currentCatId = e.target.value;
  save();
  renderDashboard();
});

addCatBtn.addEventListener("click", () => {
  renderAddCatForm();
});

// --- Katze hinzufügen ---
function addCat(name, birthdate, gender) {
  const newCat = {
    id: Date.now().toString(),
    name,
    birthdate,
    gender,
    data: {
      weight: [],
      food: [],
      play: [],
      sleep: [],
      vet: [],
      medication: []
    }
  };
  cats.push(newCat);
  currentCatId = newCat.id;
  save();
  renderSelector();
  renderDashboard();
}

// --- Dashboard ---
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
    ? `${cat.data.food[cat.data.food.length - 1].amount} g ${cat.data.food[cat.data.food.length - 1].type}`
    : "Kein Eintrag";

  const lastPlay = cat.data.play.length
    ? `${cat.data.play[cat.data.play.length - 1].duration} min ${cat.data.play[cat.data.play.length - 1].type}`
    : "Kein Eintrag";

  main.innerHTML = `
    <div class="card">
      <h2>${cat.name}</h2>
      <p>Letztes Gewicht: ${lastWeight}</p>
      <p>Letzte Fütterung: ${lastFood}</p>
      <p>Letztes Spiel: ${lastPlay}</p>
    </div>
  `;
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
      <button onclick="createCat()">Speichern</button>
    </div>
  `;
}

function createCat() {
  const name = document.getElementById("name").value;
  const birthdate = document.getElementById("birthdate").value;
  const gender = document.getElementById("gender").value;
  addCat(name, birthdate, gender);
}

// --- Weight Tracking ---
function renderWeight() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Gewicht hinzufügen</h2>
      <input id="weightValue" type="number" step="0.01" placeholder="Gewicht in kg">
      <button onclick="addWeight()">Speichern</button>
    </div>
    ${cat.data.weight.map(w => `
      <div class="card">
        ${w.date} – ${w.value} kg
      </div>
    `).join("")}
  `;
}

function addWeight() {
  const value = document.getElementById("weightValue").value;
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.weight.push({
    value,
    date: new Date().toLocaleDateString()
  });
  save();
  renderWeight();
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
      <button onclick="addFood()">Speichern</button>
    </div>
    ${cat.data.food.map(f => `
      <div class="card">
        ${f.date} – ${f.amount} g ${f.type}
      </div>
    `).join("")}
  `;
}

function addFood() {
  const type = document.getElementById("foodType").value;
  const amount = document.getElementById("foodAmount").value;
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.food.push({
    type,
    amount,
    date: new Date().toLocaleDateString()
  });
  save();
  renderFood();
}

// --- Placeholder für Play, Sleep, Vet, Meds ---
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
    ${cat.data.play.map(p => `
      <div class="card">
        ${p.date} – ${p.duration} min ${p.type} ${p.notes ? '- ' + p.notes : ''}
      </div>
    `).join("")}
  `;
}

function addPlay() {
  const type = document.getElementById("playType").value;
  const duration = document.getElementById("playDuration").value;
  const cat = cats.find(c => c.id === currentCatId);
  cat.data.play.push({
    type,
    duration,
    date: new Date().toLocaleDateString(),
    notes: ""
  });
  save();
  renderPlay();
}
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
    ${cat.data.sleep.map(s => `
      <div class="card">
        ${s.date} – ${s.duration} Stunden
      </div>
    `).join("")}
  `;
}

function addSleep() {
  const start = document.getElementById("sleepStart").value;
  const end = document.getElementById("sleepEnd").value;
  if (!start || !end) return alert("Bitte Start- und Endzeit eingeben");

  const startDate = new Date("1970-01-01T" + start);
  const endDate = new Date("1970-01-01T" + end);
  let diff = (endDate - startDate) / 1000 / 60 / 60; // Stunden
  if (diff < 0) diff += 24; // Über Mitternacht

  const cat = cats.find(c => c.id === currentCatId);
  cat.data.sleep.push({
    start,
    end,
    duration: diff.toFixed(2),
    date: new Date().toLocaleDateString()
  });
  save();
  renderSleep();
}
function renderVet() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  main.innerHTML = `
    <div class="card">
      <h2>Tierarztbesuch hinzufügen</h2>
      <label>Datum: <input type="date" id="vetDate"></label><br><br>
      <input id="vetReason" placeholder="Grund des Besuchs"><br><br>
      <input id="vetDiagnosis" placeholder="Diagnose"><br><br>
      <input id="vetNotes" placeholder="Notizen"><br><br>
      <button onclick="addVet()">Speichern</button>
    </div>
    ${cat.data.vet.map(v => `
      <div class="card">
        ${v.date} – ${v.reason} – ${v.diagnosis} ${v.notes ? '- ' + v.notes : ''}
      </div>
    `).join("")}
  `;
}

function addVet() {
  const date = document.getElementById("vetDate").value;
  const reason = document.getElementById("vetReason").value;
  const diagnosis = document.getElementById("vetDiagnosis").value;
  const notes = document.getElementById("vetNotes").value;

  if (!date || !reason) return alert("Bitte Datum und Grund eingeben");

  const cat = cats.find(c => c.id === currentCatId);
  cat.data.vet.push({
    date,
    reason,
    diagnosis,
    notes
  });
  save();
  renderVet();
}
function renderMeds() {
  const cat = cats.find(c => c.id === currentCatId);
  if (!cat) return;

  const activeMeds = cat.data.medication.filter(m => m.status === "aktiv");
  const archivedMeds = cat.data.medication.filter(m => m.status === "abgeschlossen");

  main.innerHTML = `
    <div class="card">
      <h2>Medikament hinzufügen</h2>
      <input id="medName" placeholder="Name">
      <input id="medDose" placeholder="Dosierung / Frequenz">
      <label>Start: <input type="date" id="medStart"></label>
      <label>Ende: <input type="date" id="medEnd"></label><br><br>
      <input id="medNotes" placeholder="Notizen"><br><br>
      <button onclick="addMed()">Speichern</button>
    </div>

    <h3>Aktive Medikamente</h3>
    ${activeMeds.map(m => `
      <div class="card">
        ${m.name} – ${m.dose} – ${m.start} bis ${m.end}
        <button onclick="completeMed('${m.date}')">Abschließen</button>
      </div>
    `).join("")}

    <h3>Archiv</h3>
    ${archivedMeds.map(m => `
      <div class="card">
        ${m.name} – ${m.dose} – ${m.start} bis ${m.end}
      </div>
    `).join("")}
  `;
}

function addMed() {
  const name = document.getElementById("medName").value;
  const dose = document.getElementById("medDose").value;
  const start = document.getElementById("medStart").value;
  const end = document.getElementById("medEnd").value;
  const notes = document.getElementById("medNotes").value;

  if (!name || !dose || !start) return alert("Bitte Name, Dosierung und Startdatum eingeben");

  const cat = cats.find(c => c.id === currentCatId);
  const newMed = {
    name,
    dose,
    start,
    end: end || "",
    notes,
    status: "aktiv",
    date: Date.now().toString()
  };
  cat.data.medication.push(newMed);
  save();
  renderMeds();
}

function completeMed(date) {
  const cat = cats.find(c => c.id === currentCatId);
  const med = cat.data.medication.find(m => m.date === date);
  if (med) med.status = "abgeschlossen";
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
function exportData() {
  const blob = new Blob([JSON.stringify(cats)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "catcare_backup.json";
  a.click();
}
function importData(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    cats = JSON.parse(e.target.result);
    save();
    renderSelector();
    renderDashboard();
  };
  reader.readAsText(file);
}

// --- Navigation ---
document.querySelectorAll(".bottom-nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const page = btn.dataset.page;
    if (page === "dashboard") renderDashboard();
    if (page === "weight") renderWeight();
    if (page === "food") renderFood();
    if (page === "play") renderPlay();
    if (page === "sleep") renderSleep();
    if (page === "vet") renderVet();
    if (page === "meds") renderMeds();
    if (page === "settings") renderSettings();
  });
});

// --- Initial ---
renderSelector();
renderDashboard();

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}