// Rate page — checklist first (unchecked), categories 1–10 chips, customers served

const RSA = JSON.parse(sessionStorage.getItem("current_rsa_v4") || "null");
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

// checklist (all UNCHECKED by default)
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

// header who
byId("who").innerHTML = `<h3 style="margin:0">${RSA.name}</h3><span class="badge">${RSA.shift}</span>`;

// build checklist
const chkEl = byId("checklist");
CHECKLIST_ITEMS.forEach((txt,i)=>{
  const id = "c_"+i;
  const wrap = document.createElement("label");
  wrap.innerHTML = `<input type="checkbox" id="${id}"> ${txt}`;
  chkEl.appendChild(wrap);
});

// build 1–10 chips for each category (radio inputs)
const ratingsEl = byId("ratings");
ratingDefs.forEach(([key,label])=>{
  const section = document.createElement("div");
  const chips = Array.from({length:10}, (_,i)=>{
    const val = i+1;
    return `
      <input type="radio" name="${key}" id="${key}_${val}" value="${val}" ${val===7?'checked':''}>
      <label for="${key}_${val}">${val}</label>
    `;
  }).join("");
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
  const customersServed = +(byId("cust").value||0);
  const overall = weightedScore(scores);

  const payload = {
    type: "submit_rating",
    data: {
      name: RSA.name, shift: RSA.shift, timestamp: new Date().toISOString(),
      scores, checklist, notes, customersServed, overall
    }
  };

  const t = byId("toast");
  try{
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {"Content-Type":"text/plain;charset=utf-8"}, // avoid preflight
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error("HTTP "+res.status);
    t.textContent = "✅ Submitted"; t.classList.add("show");
    setTimeout(()=>{ t.classList.remove("show"); location.href="index.html"; }, 900);
  }catch(e){
    alert("Submit failed: "+e.message);
  }
});
