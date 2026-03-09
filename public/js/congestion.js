// ============================================================
// GYM CONGESTION PREDICTION
// Fetches from /api/v1/gymspire/congestion
// Renders hour bar chart, weekly day bubbles, recommendation
// ============================================================

const loadingState = document.getElementById("loadingState");
const contentWrap = document.getElementById("contentWrap");
const hourChart = document.getElementById("hourChart");
const dayChart = document.getElementById("dayChart");
const recTime = document.getElementById("recTime");
const recSub = document.getElementById("recSub");
const peakTimeEl = document.getElementById("peakTime");
const quietDayEl = document.getElementById("quietDay");
const totalRecordsEl = document.getElementById("totalRecords");
const lowDataBanner = document.getElementById("lowDataBanner");

// Color per congestion tier
const tierColors = {
  Empty: "#94a3b8",
  Quiet: "#22c55e",
  Moderate: "#f59e0b",
  Busy: "#f97316",
  Packed: "#d25353",
};

// Day index (0=Sun) → name
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayIdx = new Date().getDay();
const currentHour = new Date().getHours();

async function loadCongestion() {
  try {
    const res = await fetch("/api/v1/congestion");
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || "Failed to load");

    const d = json.data;

    // ── Low data warning ──────────────────────────────────
    if (!d.hasEnoughData) {
      lowDataBanner.classList.remove("hidden");
    }

    // ── Personal recommendation ───────────────────────────
    if (d.personalBest) {
      recTime.textContent = d.personalBest.time;
      recSub.textContent = `${d.personalBest.tier.emoji} ${d.personalBest.tier.label} — avg ${d.personalBest.avgVisitors} ${d.personalBest.avgVisitors === 1 ? "person" : "people"} at this time`;
    } else {
      recTime.textContent = "Not enough data yet";
      recSub.textContent =
        "Check in more often to get a personalised recommendation";
    }

    // ── Today's hour chart ────────────────────────────────
    const openHours = d.hourlyAvg.filter((h) => h.isOpen);
    const maxVisitors = Math.max(...openHours.map((h) => h.avgVisitors), 1);

    hourChart.innerHTML = "";

    openHours.forEach((h, idx) => {
      const isNow = h.hour === currentHour;
      const pct = Math.max((h.avgVisitors / maxVisitors) * 100, 3);
      const color = tierColors[h.tier.label] || "#94a3b8";
      const showLabel = h.avgVisitors >= 1;

      const row = document.createElement("div");
      row.className = "hour-row";
      row.style.animationDelay = `${idx * 0.04}s`;

      row.innerHTML = `
        <span class="hour-label ${isNow ? "current" : ""}">
          ${h.time}${isNow ? '<span class="now-badge">now</span>' : ""}
        </span>
        <div class="hour-bar-wrap">
          <div class="hour-bar ${isNow ? "current-bar" : ""}"
               style="width:${pct}%; background:${color};">
            <span class="hour-bar-label ${showLabel ? "visible" : ""}">
              ${h.tier.label}
            </span>
          </div>
        </div>
        <span class="hour-count">${h.avgVisitors > 0 ? `~${h.avgVisitors}` : "—"}</span>
      `;

      hourChart.appendChild(row);
    });

    // ── Weekly day bubbles ────────────────────────────────
    dayChart.innerHTML = "";

    d.dayMap.forEach((day, i) => {
      const isToday = i === todayIdx;
      const color = tierColors[day.tier.label] || "#f4f4f5";

      const col = document.createElement("div");
      col.className = "day-col";
      col.innerHTML = `
        <span class="day-name ${isToday ? "today" : ""}">${dayNames[i]}</span>
        <div class="day-bubble" style="background:${color}22; border: 2px solid ${color}55;"
             title="${day.tier.label} — avg ${day.avgVisitors} people">
          ${day.tier.emoji}
        </div>
        <span class="day-avg">${day.avgVisitors > 0 ? `~${day.avgVisitors}` : "—"}</span>
      `;

      dayChart.appendChild(col);
    });

    // ── Stats row ─────────────────────────────────────────
    peakTimeEl.textContent = d.peakHour?.time || "—";
    quietDayEl.textContent = d.bestDay?.name || "—";
    totalRecordsEl.textContent = d.totalRecords ?? "—";

    // ── Show content ──────────────────────────────────────
    loadingState.classList.add("hidden");
    contentWrap.classList.remove("hidden");
  } catch (err) {
    console.error("Congestion load error:", err);
    loadingState.innerHTML = `
      <p style="color:#d25353;font-weight:600;">
        ⚠️ Could not load congestion data. Please try again.
      </p>`;
  }
}

loadCongestion();
