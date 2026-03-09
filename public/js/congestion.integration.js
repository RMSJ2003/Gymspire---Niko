// ============================================================
// 1. ADD THIS CARD TO dashboard.pug (inside .dashboard grid)
// ============================================================

//- Gym Congestion Card
// .card
//   h3 🏋️ Gym Congestion
//   p.card-desc See the best time to visit based on real member data
//   .card-actions
//     a.card-link(href='/congestion') View Predictions

// ============================================================
// 2. ADD ROUTE TO your view router (e.g. viewRouter.js)
// ============================================================

const congestionController = require("../controllers/congestionController");

// Page route
router.get("/congestion", authController.protect, (req, res) => {
  res.render("congestion", {
    title: "Gym Congestion",
    user: req.user,
  });
});

// API routes (mount in app.js)
// app.use("/api/v1/gymspire/congestion", require("./routes/congestionRouter"));

// ============================================================
// 3. DASHBOARD CARD — live congestion indicator
//    Fetches /api/v1/gymspire/congestion/now
//    Add this script to dashboard.js or inline on dashboard
// ============================================================

async function loadCongestionWidget() {
  try {
    const res = await fetch("/api/v1/gymspire/congestion/now");
    const json = await res.json();
    const d = json.data;

    const widget = document.getElementById("congestionWidget");
    if (!widget) return;

    widget.innerHTML = `
      <span style="font-size:1.3rem">${d.tier.emoji}</span>
      <div>
        <div style="font-weight:700;font-size:0.88rem;">${d.tier.label} right now</div>
        <div style="font-size:0.75rem;color:#888;">~${d.actualLoad} people · predicted avg ${d.predictedLoad}</div>
      </div>
    `;
  } catch (e) {
    /* silent */
  }
}

loadCongestionWidget();
