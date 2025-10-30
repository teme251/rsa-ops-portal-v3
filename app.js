// Ops Portal v5 — rating only, no dashboards, no shifts
const API = window.BACKEND_URL;
const byId = (id)=>document.getElementById(id);

// Stored lists
const LS_LIST = "ops_rsas_v5_list";        // the visible/managed RSA list (array of names)
const LS_MASTER = "ops_rsas_v5_master";    // dropdown master list of associates

let RSAS = JSON.parse(localStorage.getItem(LS_LIST) || "[]");
let MASTER = JSON.parse(localStorage.getItem(LS_MASTER) || "[]");

function saveList(){ localStorage.setItem(LS_LIST, JSON.stringify(RSAS)); renderList(); }
function saveMaster(){ localStorage.setItem(LS_MASTER, JSON.stringify(MASTER)); renderPicker(); }

function toast(msg){ const t=byId("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),1200); }

function renderList(){
  const q = (byId("search").value||"").toLowerCase();
  const body = byId("rsaBody"); body.innerHTML="";
  const items = RSAS.filter(n=> n.toLowerCase().includes(q));
  items.forEach((name, idx)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${name}</td>
      <td class="actions">
        <button class="primary" data-idx="${idx}" data-action="rate">Rate</button>
        <button class="ghost" data-idx="${idx}" data-action="edit">✏️ Edit</button>
        <button class="ghost" data-idx="${idx}" data-action="remove">❌ Remove</button>
      </td>`;
    body.appendChild(tr);
  });
  byId("empty").style.display = items.length ? "none":"block";
}

function renderPicker(){
  const sel = byId("rsaPicker");
  sel.innerHTML = "";
  const opt0 = new Option("Select existing associate…", "", true, true);
  sel.appendChild(opt0);

  MASTER.slice().sort((a,b)=>a.localeCompare(b)).forEach(n=>{
    sel.appendChild(new Option(n, n));
  });
  sel.appendChild(new Option("➕ Add new…", "__ADD_NEW__"));
}

byId("rsaPicker").addEventListener("change", (e)=>{
  const val = e.target.value;
  const nameInput = byId("newName");
  if(val === "__ADD_NEW__"){
    nameInput.style.display = "inline-block";
    nameInput.focus();
  } else {
    nameInput.style.display = "none";
    nameInput.value = "";
  }
});

byId("addBtn").addEventListener("click", ()=>{
  const selVal = byId("rsaPicker").value;
  let name = selVal;
  if(selVal === "__ADD_NEW__"){
    name = (byId("newName").value||"").trim();
    if(!name) return alert("Enter a new associate name.");
    // add to MASTER if not exists
    if(!MASTER.map(x=>x.toLowerCase()).includes(name.toLowerCase())){
      MASTER.push(name);
      saveMaster();
    }
  }
  if(!name) return alert("Pick an associate or add a new one.");

  // prevent duplicates in visible list
  if(RSAS.map(x=>x.toLowerCase()).includes(name.toLowerCase()))
    return alert("This associate is already in your list.");

  RSAS.push(name);
  saveList();
  byId("rsaPicker").value = "";
  byId("newName").value = "";
  byId("newName").style.display = "none";
  toast("Added");
});

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
    const newName = prompt("Edit name:", curr);
    if(newName && newName.trim()){
      if(RSAS.some((n,i)=> i!==idx && n.toLowerCase()===newName.trim().toLowerCase()))
        return alert("Duplicate name not allowed.");
      RSAS[idx] = newName.trim();
      saveList(); toast("Updated");
      // maintain MASTER too
      if(!MASTER.map(x=>x.toLowerCase()).includes(newName.toLowerCase())){
        MASTER.push(newName.trim()); saveMaster();
      }
    }
  }
  if(action==="remove"){
    if(confirm("Remove this RSA from your list?")){ RSAS.splice(idx,1); saveList(); toast("Removed"); }
  }
});

byId("search").addEventListener("input", renderList);

// init first run: create MASTER from RSAS if empty
if(MASTER.length===0 && RSAS.length>0){ MASTER = [...RSAS]; saveMaster(); }
renderPicker();
renderList();
