
// Ops Portal logic (list, add, edit, remove, route to rating)
const LS_KEY = "ops_rsas_v3";
const byId = id => document.getElementById(id);
let RSAS = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(RSAS)); render(); }
function toast(msg){ const t = byId("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(()=> t.classList.remove("show"), 1200); }

function render(){
  const q = (byId("search").value||"").toLowerCase();
  const body = byId("rsaBody"); body.innerHTML="";
  const items = RSAS.filter(r=> r.name.toLowerCase().includes(q));
  items.forEach((r, idx)=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.name}</td><td><span class="badge">${r.shift}</span></td>
      <td class="actions">
        <button class="primary" data-idx="${idx}" data-action="rate">Rate</button>
        <button class="ghost" data-idx="${idx}" data-action="edit">✏️ Edit</button>
        <button class="ghost" data-idx="${idx}" data-action="remove">❌ Remove</button>
      </td>`;
    body.appendChild(tr);
  });
  byId("empty").style.display = items.length ? "none" : "block";
}

byId("addBtn").addEventListener("click", ()=>{
  const name = byId("newName").value.trim();
  const shift = byId("newShift").value;
  if(!name) return alert("Enter a name");
  RSAS.push({name, shift});
  byId("newName").value = "";
  save();
});

byId("rsaBody").addEventListener("click", (e)=>{
  const btn = e.target.closest("button"); if(!btn) return;
  const idx = +btn.dataset.idx; const action = btn.dataset.action;
  if(action==="rate"){
    sessionStorage.setItem("current_rsa_v3", JSON.stringify(RSAS[idx]));
    location.href = "rate.html";
  }
  if(action==="edit"){
    const newName = prompt("Edit name:", RSAS[idx].name);
    if(newName && newName.trim()){ RSAS[idx].name = newName.trim(); save(); toast("Updated"); }
  }
  if(action==="remove"){
    if(confirm("Remove this RSA from your list?")){ RSAS.splice(idx,1); save(); toast("Removed"); }
  }
});

byId("search").addEventListener("input", render);
render();
