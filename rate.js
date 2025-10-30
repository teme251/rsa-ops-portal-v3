// Rate page with dropdowns (1–10), hidden backend URL, back/home buttons

// RSA info from session
const RSA = JSON.parse(sessionStorage.getItem("current_rsa_v3") || "null");
if (!RSA) {
  alert("No RSA selected. Returning to home.");
  location.href = "index.html";
}

// weights for each category
const WEIGHTS = {
  customerInteraction: 0.2,
  upsellCompliance: 0.25,
  productKnowledge: 0.15,
  transparencyEthics: 0.2,
  efficiency: 0.1,
  teamCollab: 0.1,
};

// checklist items
const CHECKLIST_ITEMS = [
  "Greeted customer within 10 seconds",
  "Verified ID & payment clearly",
  "Explained insurance options neutrally",
  "Explained fuel/EV policy accurately",
  "Offered upgrade only if beneficial",
  "Reviewed total cost before payment",
  "Closed courteously & asked for questions",
];

const byId = id => document.getElementById(id);
byId("who").innerHTML = `<h3 style="margin:0">${RSA.name}</h3><span class="badge">${RSA.shift}</span>`;

// rating categories
const ratingDefs = [
  ["customerInteraction", "Customer Interaction"],
  ["upsellCompliance", "Upselling Compliance"],
  ["productKnowledge", "Product Knowledge"],
  ["transparencyEthics", "Transparency & Ethics"],
  ["efficiency", "Efficiency"],
  ["teamCollab", "Team Collaboration"],
];

const ratingsEl = byId("ratings");
ratingDefs.forEach(([key, label]) => {
  const wrap = document.createElement("div");
  wrap.innerHTML = `<label>${label}<br>
  <select id="${key}">
    ${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}" ${i === 6 ? "selected" : ""}>${i + 1}</option>`).join("")}
  </select></label>`;
  ratingsEl.appendChild(wrap);
});

const chkEl = byId("checklist");
CHECKLIST_ITEMS.forEach((txt, i) => {
  const id = "c_" + i;
  const wrap = document.createElement("label");
  wrap.innerHTML = `<input type="checkbox" id="${id}" checked> ${txt}`;
  chkEl.appendChild(wrap);
});

// calculate weighted score
function weightedScore(scores) {
  let sum = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) sum += (scores[k] / 10) * w;
  return +(sum * 100).toFixed(1);
}

// ✅ New backend URL
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxdegGrWMt0YlWMic9BURoZPczXgWb4Cx5IiXmEp9hJcUpKwVKpNhHU9khNxTKfRX_-Yw/exec";

byId("submitBtn").addEventListener("click", async () => {
  const scores = Object.fromEntries(ratingDefs.map(([k]) => [k, +byId(k).value]));
  const checklist = CHECKLIST_ITEMS.map((_, i) => byId("c_" + i).checked);
  const notes = (byId("notes").value || "").trim();
  const overall = weightedScore(scores);

  const payload = {
    type: "submit_rating",
    data: {
      name: RSA.name,
      shift: RSA.shift,
      timestamp: new Date().toISOString(),
      scores,
      checklist,
      notes,
      overall,
    },
  };

  const t = byId("toast");

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("HTTP " + res.status);

    t.textContent = "✅ Submitted";
    t.classList.add("show");
    setTimeout(() => {
      t.classList.remove("show");
      location.href = "index.html";
    }, 900);
  } catch (e) {
    alert("Submit failed: " + e.message);
  }
});
