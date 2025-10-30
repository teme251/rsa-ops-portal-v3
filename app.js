// Ops Portal v5.1 — robust Add RSA flow (dropdown or new), no shifts, rating-only
const API = window.BACKEND_URL;
const byId = (id)=>document.getElementById(id);

// Local storage keys
const LS_LIST   = "ops_rsas_v5_list";     // visible/managed RSA list (array of names)
const LS_MASTER = "ops_rsas_v5_master";   // dropdown master list (array of names)

// State
let RSAS   = JSON.parse(localStorage.getItem(LS_LIST)   || "[]");
let MASTER = JSON.parse(localStorage.getItem(LS_MASTER) || "[]");

// Utilities
const norm = s => (s||"").trim();
const key  = s => norm(s).toLowerCase();
const uniqueMerge = (...arrays) => {
  const seen = new Set(), out=[];
  arrays.flat().forEach(n=>{
    const k = key(n);
    if(k && !seen.has(k)){ seen.add(k); out.push(norm(n)); }
  });
  return out;
};

function saveList(){ localStorage.setItem(LS_LIST, JSON.stringify(RSAS)); renderList(); }
function saveMaster(){ localStorage.setItem(LS_MASTER, JSON.stringify(MASTER)); renderPicker(); }
function toast(msg){ const t=byId("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1200); }

// Build dropdown
function renderPicker(){
  const sel = byId("rsaPicker");
  sel.innerHTML = "";
  sel.appendChild(new Option("— Select existing —", ""));
  MASTER.slice().sort((a,b)=>a.localeCompare(b)).forEach(n=>{
    sel.appendChild(new Option(n, n));
  });
}

// Build visible list
function renderList(){
  const q = (byId("search").value||"").toLowerCase();
  const body = byId("rsaBody"); body.innerHTML="";
  const items = RSAS.filter(n=> n.toLowerCase().includes(q));
  items.forEach((name, idx)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td class="actions">
        <button class="primary" data-idx="${idx}" data-action="rate">Rate</button>
        <button class="ghost" data-idx="${idx}" data-action="edit">✏️ Edit</button>
        <button class="ghost" data-idx="${idx}" data-action="remove">❌ Remove</button>
      </td>`;
    body.appendChild(tr);
  });
  byId("empty").style.display = items.length ? "none" : "block";
}

// Add handler — accepts either picker value OR newName input
function handleAdd(){
  const selVal  = norm(byId("rsaPicker").value);
  const typed   = norm(byId("newName").value);

  // Prefer typed new name if present; else use selected
  const chosen = typed || selVal;
  if(!chosen){
    alert("Pick an existing associate from the dropdown OR type a new name.");
    return;
  }

  // Prevent duplicates in visible list
  if(RSAS.some(n=> key(n)===key(chosen))){
    alert("This associate is already in your list.");
    return;
  }

  // If it's a new name (not in MASTER), add to master
  if(!MASTER.some(n=> key(n)===key(chosen))){
    MASTER.push(chosen);
    saveMaster();
  }

  RSAS.push(chosen);
  saveList();
  byId("rsaPicker").value = "";
  byId("newName").value = "";
  toast("Added");
}

// Bootstrap master list from backend data (names already rated)
// This makes the dropdown useful even on first run.
async function bootstrapMasterFromBackend(){
  try{
    const res = await fetch(API, {cache:"no-store"});
    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    const backendNames = uniqueMerge(rows.map(r=> r.name || ""));
    // Merge existing MASTER, RSAS, and backend names
    MASTER = uniqueMerge(MASTER, RSAS, backendNames);
    saveMaster();
  }catch(e){
    // If fetch fails, still render whatever we have
    renderPicker();
  }
}

// Events
byId("addBtn").addEventListener("click", handleAdd);
byId("newName").addEventListener("keydown", (e)=>{ if(e.key==="Enter"){ e.preventDefault(); handleAdd(); } });
byId("rsaBody").addEventListener("click", (e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const idx = +btn.dataset.idx; const action = btn.dataset.action;
  if(action==="rate"){
    const name = RSAS[idx];
    sessionStorage.setItem("current_rsa_v5", JSON.stringify({name}));
    location.href = "rate.html";
  }
  if(action==="edit"){
    const curr = RSAS[idx];
    const newName = norm(prompt("Edit name:", curr));
    if(newName){
      if(RSAS.some((n,i)=> i!==idx && key(n)===key(newName))){
        alert("Duplicate name not allowed."); return;
      }
      RSAS[idx] = newName; saveList(); toast("Updated");
      if(!MASTER.some(n=> key(n)===key(newName))){ MASTER.push(newName); saveMaster(); }
    }
  }
  if(action==="remove"){
    if(confirm("Remove this RSA from your list?")){ RSAS.splice(idx,1); saveList(); toast("Removed"); }
  }
});
byId("search").addEventListener("input", renderList);

// Init sequence
(function init(){
  // If MASTER empty but RSAS has values, seed MASTER from RSAS
  if(MASTER.length===0 && RSAS.length>0){ MASTER = uniqueMerge(RSAS); saveMaster(); }
  renderPicker();
  renderList();
  // Try to augment master list from backend
  bootstrapMasterFromBackend();
})();
