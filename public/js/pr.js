/* pr.js */

const exercises = window.exercises || [];

const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeBtn = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const modalBody = document.getElementById("modalBody");

/* ==========================================
   GROUP EXERCISES BY TARGET
========================================== */
const grouped = {};
exercises.forEach((ex) => {
  if (!grouped[ex.target]) grouped[ex.target] = [];
  grouped[ex.target].push(ex);
});

/* ==========================================
   BUILD MUSCLE GROUP CARDS
========================================== */
Object.keys(grouped)
  .sort()
  .forEach((target) => {
    const card = document.createElement("div");
    card.className = "target-card";
    card.textContent = target;
    card.addEventListener("click", () => openTargetModal(target));
    targetGrid.appendChild(card);
  });

/* ==========================================
   OPEN MODAL — load exercises that have a PR
========================================== */
async function openTargetModal(target) {
  targetTitle.textContent = target;
  targetModal.classList.remove("hidden");

  // Show loading state
  modalBody.innerHTML = `<div class="pr-loading">Loading exercises...</div>`;

  const exercisesInGroup = grouped[target] || [];

  // Fetch PR status for each exercise in parallel
  const results = await Promise.all(
    exercisesInGroup.map(async (ex) => {
      try {
        const res = await fetch(
          `/api/v1/prs/exercise/${encodeURIComponent(ex.name)}`,
          { credentials: "include" },
        );
        const data = await res.json();
        return { ex, pr: data.status === "success" ? data.data : null };
      } catch {
        return { ex, pr: null };
      }
    }),
  );

  // Only keep exercises that have a PR
  const withPR = results.filter((r) => r.pr !== null);

  modalBody.innerHTML = "";

  if (withPR.length === 0) {
    modalBody.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🏋️</div>
        <p>No personal records yet for <strong>${target}</strong>.</p>
        <p style="margin-top:0.4rem;font-size:0.82rem;color:#bbb;">Complete workouts with these exercises to set your first PR!</p>
      </div>`;
    return;
  }

  withPR.forEach(({ ex, pr }) => {
    const row = document.createElement("div");
    row.className = "exercise-row";
    row.innerHTML = `
      <span>${ex.name}</span>
      <button class="view-pr-btn">View PR</button>
    `;

    row
      .querySelector(".view-pr-btn")
      .addEventListener("click", () => showPRCard(pr, ex.name));

    modalBody.appendChild(row);
  });
}

/* ==========================================
   SHOW PR CARD INSIDE MODAL
========================================== */
function showPRCard(pr, exerciseName) {
  const date = new Date(pr.date).toDateString();

  modalBody.innerHTML = `
    <button class="view-pr-btn" id="backToList" style="margin:0 0 1rem 0;">
      ← Back
    </button>
    <div class="pr-card">
      <div class="pr-card-header">
        <span>🏆</span>
        <strong>Personal Record</strong>
      </div>
      <div class="pr-card-exercise">${pr.exercise || exerciseName}</div>
      <div class="pr-stats">
        <div class="pr-stat">
          <span class="pr-stat-label">Weight</span>
          <span class="pr-stat-value">${pr.weight} <small style="font-size:0.65rem;color:#93c5fd">${pr.unit || "LB"}</small></span>
        </div>
        <div class="pr-stat">
          <span class="pr-stat-label">Reps</span>
          <span class="pr-stat-value">${pr.reps}</span>
        </div>
      </div>
      <div class="pr-date">📅 ${date}</div>
    </div>
  `;

  document.getElementById("backToList").addEventListener("click", () => {
    openTargetModal(targetTitle.textContent);
  });
}

/* ==========================================
   CLOSE MODAL
========================================== */
closeBtn.addEventListener("click", () => {
  targetModal.classList.add("hidden");
  modalBody.innerHTML = "";
});

targetModal.addEventListener("click", (e) => {
  if (e.target === targetModal) {
    targetModal.classList.add("hidden");
    modalBody.innerHTML = "";
  }
});
