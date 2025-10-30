// Rate page v5 — no shifts, checklist first, 1–10 chips, default 1 customer
const RSA = JSON.parse(sessionStorage.getItem("current_rsa_v5") || "null");
if(!RSA){ alert("No RSA selected. Returning to home."); location.href="index.html"; }
const BACKEND_URL = window.BACKEND_URL;

// weights
const WEIGHTS = {
  customerInteraction: 0.2,
  upsellCompliance: 0.25,
  productKnowledge: 0.15,
  transparencyEthics: 0.2,
  efficiency: 0.1,
  teamCollab: 0.1,
};

// checklist
const CHECKLIST_ITEMS = [
  "Greeted customer within 10 seconds",
  "Verified ID & payment clearly",
  "Explained insurance options neutrally",
  "Explained fuel/EV policy accurately",
  "Offered upgrade only if beneficial",
  "Reviewed total cost before payment",
  "Closed courteously & asked for questions"
];

// categories
const ratingDefs = [
  ["customerInteraction","Customer Interaction"],
  ["upsellCompliance","Upselling Compliance"],
  ["productKnowledge","Product Knowledge"],
  ["transparencyEthics","Transparency & Ethics"],
  ["efficiency","Efficiency"],
  ["teamCollab","Team Collaboration"]
];

const byId = id => document.getElementById(id);
byId("who").innerHTML = `<h3 style="margin:0">${RSA.name}</h3><span class="badge">Rating</span>`;

// build checklist (unchecked)
const chkEl = byId("checklist");
CHECKLIST_ITEMS.forEach((txt,i)=>{
  const id = "c_"+i;
  const wrap = document.createElement("label");
  wrap.innerHTML = `<input type="checkbox" id="${id}"> ${txt}`;
  chkEl.appendChild(wrap);
});

// chip color class by value
function chipClass(v){
  v = Math.max(0, Math.min(10, v|0));
  return "label-c"+v;
}

// build chips 1–10
const ratingsEl = byId("ratings");
ratingDefs.forEach(([key,label])=>{
  const section = document.createElement("div");
  let chips = "";
  for(let v=1; v<=10; v++){
    chips += `
      <input type="radio" name="${key}" id="${key}_${v}" value="${v}" ${v===7?'checked':''}>
      <label for="${key}_${v}" class="${chipClass(v)}">${v}</label>
    `;
  }
  section.innerHTML = `
    <div class="section-sub" style="margin:0 0 6px 0">${label}</div>
    <div class="rate-chips">${chips}</div>
  `;
  ratingsEl.appendChild(section);
});

function getScore(name){
  const sel = document.querySelector(`input[name="${name}"]:checked`);
  return sel ? +sel.value : 7;
}
function weightedScore(scores){
  let sum=0; for(const [k,w] of Object.entries(WEIGHTS)) sum += (scores[k]/10)*w;
  return +(sum*100).toFixed(1);
}

byId("submitBtn").addEventListener("click", async ()=>{
  const scores = Object.fromEntries(ratingDefs.map(([k])=>[k, getScore(k)]));
  const checklist = CHECKLIST_ITEMS.map((_,i)=> byId("c_"+i).checked);
  const notes = (byId("notes").value||"").trim();
  const customersServed = Math.max(1, +(byId("cust").value||1)); // default at least 1
  const overall = weightedScore(scores);

  const payload = {
    type: "submit_rating",
    data: {
      name: RSA.name,
      timestamp: new Date().toISOString(),
      scores, checklist, notes, customersServed, overall,
      shift: "" // kept blank to match sheet columns
    }
  };

  const t = byId("toast");
  try{
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {"Content-Type":"text/plain;charset=utf-8"}, // no preflight
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error("HTTP "+res.status);
    t.textContent = "✅ Submitted"; t.classList.add("show");
    setTimeout(()=>{ t.classList.remove("show"); location.href="index.html"; }, 900);
  }catch(e){
    alert("Submit failed: "+e.message);
  }
});
