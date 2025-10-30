// Ops Portal logic: list management + dashboard summaries from backend
const LS_KEY = "ops_rsas_v3";
const API = window.BACKEND_URL;
const byId = (id)=>document.getElementById(id);
let RSAS = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
let RAW = []; // backend rows

function save(){ localStorage.setItem(LS_KEY, JSON.stringify(RSAS)); renderList(); }
function toast(msg){ const t = byId("toast"); t.textContent = msg; t.classList.add("show"); setTimeout(()=> t.classList.remove("show"), 1200); }

async function loadData(){
  try{
    const res = await fetch(API, {cache:"no-store"});
    const json = await res.json();
    RAW = Array.isArray(json.data) ? json.data : [];
  }catch(e){ RAW = []; }
  renderDash();
}

function startOfDay(d=new Date()){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function daysAgo(n){ const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-n); return d; }

function renderDash(){
  const todayRows = RAW.filter(r=> new Date(r.timestamp) >= startOfDay());
  const todayAvg = avg(todayRows.map(r=> +r.overall||0));
  const todayCust = todayRows.reduce((a,r)=> a + (+r.customersServed||0), 0);

  byId("kpiTodayCount").textContent = todayRows.length || "0";
  byId("kpiTodayAvg").textContent = todayRows.length ? todayAvg.toFixed(1) : "—";
  // Top performer today
  const top = [...todayRows].sort((a,b)=> (+b.overall||0) - (+a.overall||0))[0];
  byId("kpiTodayTop").textContent = top ? `${top.name} (${(+top.overall).toFixed(1)})` : "—";
  byId("kpiTodayCust").textContent = todayCust || "0";

  // Top3 best & worst today
  const best = [...todayRows].sort((a,b)=> (+b.overall||0)-(+a.overall||0)).slice(0,3);
  const worst = [...todayRows].sort((a,b)=> (+a.overall||0)-(+b.overall||0)).slice(0,3);
  fillList("best3", best, true);
  fillList("worst3", worst, false);

  // Weekly & Monthly summaries (bottom)
  const weeklyRows = RAW.filter(r=> new Date(r.timestamp) >= daysAgo(7));
  const monthlyRows = RAW.filter(r=> new Date(r.timestamp) >= daysAgo(30));
  byId("weeklySummary").textContent = summaryText(weeklyRows);
  byId("monthlySummary").textContent = summaryText(monthlyRows);
}

function summaryText(rows){
  if(!rows.length) return "No ratings in this window.";
  const a = avg(rows.map(r=> +r.overall||0)).toFixed(1);
  const top = [...rows].sort((x,y)=> (+y.overall||0)-(+x.overall||0))[0];
  const nc = rows.filter(r=> (+r.overall||0) < 70).length;
  const cust = rows.reduce((s,r)=> s+(+r.customersServed||0),0);
  return `Ratings: ${rows.length} • Avg: ${a} • Top: ${top.name} (${(+top.overall).toFixed(1)}) • Needs Coaching: ${nc} • Customers Served: ${cust}`;
}

function avg(arr){ return arr.length? arr.reduce((a,b)=>a+b,0)/arr.length:0; }
function fillList(id, arr, good){
  const el = byId(id); el.innerHTML="";
  arr.forEach(r=>{
    const li = document.createElement("li");
    li.textContent = `${r.name} — ${(+r.overall||0).toFixed(1)}`;
    el.appendChild(li);
  });
}

function renderList(){
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

// events
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
    sessionStorage.setItem("current_rsa_v4", JSON.stringify(RSAS[idx]));
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

byId("search").addEventListener("input", renderList);

// init
renderList();
loadData();
setInterval(loadData, 5*60*1000);
