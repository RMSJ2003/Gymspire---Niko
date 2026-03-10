// ==================================================
// COACH FATIGUE DASHBOARD — coachFatigue.js
// Loaded ONLY on coachDashboard. Does not touch checkin.
//
// Calls: GET /api/v1/workout-logs/members
//   → returns [{ _id, username, pfpUrl, logs: [...last 5 done logs] }]
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("fatigueTbody");
  if (!tbody) return;
  loadFatigueTable();
});

async function loadFatigueTable() {
  const tbody = document.getElementById("fatigueTbody");

  try {
    const res = await fetch("/api/v1/workout-logs/members");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    const members = json.data || [];

    if (!members.length) {
      tbody.innerHTML = `
        <tr class="fatigue-empty">
          <td colspan="4">No members found.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = members.map(buildRow).join("");
  } catch (err) {
    console.error("[coachFatigue] Error:", err);
    tbody.innerHTML = `
      <tr class="fatigue-empty">
        <td colspan="4">Failed to load member data. Please refresh.</td>
      </tr>`;
  }
}

// ── Build a single <tr> ───────────────────────────────────────────────
function buildRow(member) {
  const avatar = member.pfpUrl
    ? `<img class="fatigue-avatar" src="${member.pfpUrl}" alt="${member.username}" onerror="this.onerror=null;this.src='/img/default-user.png'">`
    : `<img class="fatigue-avatar" src="/img/default-user.png" alt="${member.username}" onerror="this.onerror=null;this.src='/img/default-user.png'">`;

  const logs = member.logs || [];

  const { lastText, lastClass } = computeLastSession(logs[0]);
  const { trendHTML } = computeTrend(logs);
  const { statusHTML } = computeStatus(logs[0], logs);

  return `
    <tr>
      <td>
        <div class="fatigue-member">
          ${avatar}
          <span class="fatigue-name">${member.username}</span>
        </div>
      </td>
      <td><span class="fatigue-last ${lastClass}">${lastText}</span></td>
      <td>${trendHTML}</td>
      <td>${statusHTML}</td>
    </tr>
  `;
}

// ── Last session label ────────────────────────────────────────────────
function computeLastSession(lastLog) {
  if (!lastLog) return { lastText: "No sessions yet", lastClass: "overdue" };

  const diffDays = Math.floor(
    (Date.now() - new Date(lastLog.date)) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return { lastText: "Today", lastClass: "" };
  if (diffDays === 1) return { lastText: "Yesterday", lastClass: "" };
  if (diffDays <= 3) return { lastText: `${diffDays} days ago`, lastClass: "" };
  return { lastText: `${diffDays} days ago`, lastClass: "overdue" };
}

// ── Trend from last 2 sessions ────────────────────────────────────────
function computeTrend(logs) {
  if (!logs.length)
    return {
      trendHTML: `<span class="fatigue-trend trend-new">— No data</span>`,
    };
  if (logs.length === 1)
    return { trendHTML: `<span class="fatigue-trend trend-new">★ New</span>` };

  const vol = (log) =>
    log.totalVolume ?? (log.exercises ? log.exercises.length : 1);

  const recent = vol(logs[0]);
  const prev = vol(logs[1]);

  if (recent > prev)
    return {
      trendHTML: `<span class="fatigue-trend trend-up">↗ Improving</span>`,
    };
  if (recent < prev)
    return {
      trendHTML: `<span class="fatigue-trend trend-down">↘ Declining</span>`,
    };
  return {
    trendHTML: `<span class="fatigue-trend trend-flat">— Stalled</span>`,
  };
}

// ── Status pill ───────────────────────────────────────────────────────
// Factors in BOTH recency (days since last session) AND trend (improving/declining)
function computeStatus(lastLog, logs) {
  if (!lastLog)
    return {
      statusHTML: `<span class="fatigue-status status-danger">🚨 Needs Attention</span>`,
    };
  if (logs.length <= 1)
    return {
      statusHTML: `<span class="fatigue-status status-new">✦ Just Started</span>`,
    };

  const diffDays = Math.floor(
    (Date.now() - new Date(lastLog.date)) / (1000 * 60 * 60 * 24),
  );

  // Determine trend
  const vol = (log) =>
    log.totalVolume ?? (log.exercises ? log.exercises.length : 1);
  const recent = vol(logs[0]);
  const prev = vol(logs[1]);
  const isImproving = recent > prev;
  const isDeclining = recent < prev;

  // Overdue — regardless of trend
  if (diffDays > 5)
    return {
      statusHTML: `<span class="fatigue-status status-danger">🚨 Needs Attention</span>`,
    };

  // Active but declining
  if (diffDays <= 2 && isDeclining)
    return {
      statusHTML: `<span class="fatigue-status status-warn">⚠️ Declining</span>`,
    };

  // Active and improving or stalled
  if (diffDays <= 2)
    return {
      statusHTML: `<span class="fatigue-status status-ok">✅ On Track</span>`,
    };

  // 3–5 days inactive
  return {
    statusHTML: `<span class="fatigue-status status-warn">⚠️ Check In</span>`,
  };
}
