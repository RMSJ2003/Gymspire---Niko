// =========================
// START SOLO WORKOUT — 2-step flow
// Step 1: Pick muscles | Step 2: Choose one exercise per muscle
// =========================

// ── TOAST ─────────────────────────────────────────────────
function showToast(message, type = "warning") {
  const existing = document.getElementById("gymToast");
  if (existing) existing.remove();

  const colors = {
    error: { bg: "#d25353", icon: "✕" },
    success: { bg: "#22c55e", icon: "✓" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    warning: { bg: "#f59e0b", icon: "⚠" },
  };
  const { bg, icon } = colors[type] || colors.warning;

  const toast = document.createElement("div");
  toast.id = "gymToast";
  toast.style.cssText = `
    position:fixed; bottom:1.5rem; left:50%;
    transform:translateX(-50%) translateY(20px);
    background:${bg}; color:white;
    padding:0.75rem 1.4rem; border-radius:10px;
    font-family:'DM Sans',Arial,sans-serif; font-size:0.88rem; font-weight:600;
    display:flex; align-items:center; gap:0.55rem;
    box-shadow:0 8px 28px rgba(0,0,0,0.22); z-index:9999;
    max-width:90vw; opacity:0;
    transition:opacity 0.25s ease,transform 0.25s ease;
    pointer-events:none;
  `;
  toast.innerHTML = `<span style="font-size:1rem;flex-shrink:0">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// ── GYM STATUS CHECK ──────────────────────────────────────
async function checkGymStatus() {
  try {
    const res = await fetch("/api/v1/users/me");
    const data = await res.json();
    const gymStatus = data?.data?.data?.gymStatus || "offline";
    if (gymStatus !== "atGym" && gymStatus !== "logging") {
      showToast(
        "You're not checked in at the gym. Check in first so your attendance is recorded.",
        "warning",
      );
    }
  } catch (e) {
    /* silently fail */
  }
}
checkGymStatus();

// ── DATA ──────────────────────────────────────────────────
// muscles = [{ name, exerciseName, gifURL }, ...]
// Group into { muscleName: [{ exerciseName, gifURL }, ...] }
const rawMuscles = JSON.parse(
  document.getElementById("musclesData").textContent || "[]",
);

const grouped = {};
rawMuscles.forEach((m) => {
  if (!grouped[m.name]) grouped[m.name] = [];
  grouped[m.name].push({ exerciseName: m.exerciseName, gifURL: m.gifURL });
});

const muscleNames = Object.keys(grouped); // unique muscle names

// ── DOM REFS ──────────────────────────────────────────────
const muscleGrid = document.getElementById("muscleGrid");
const step1Card = document.getElementById("step1Card");
const step2Card = document.getElementById("step2Card");
const nextBtn = document.getElementById("nextBtn");
const backBtn = document.getElementById("backBtn");
const startBtn = document.getElementById("startBtn");
const exercisePickers = document.getElementById("exercisePickers");
const step1Message = document.getElementById("step1Message");
const step2Message = document.getElementById("step2Message");
const stepDot1 = document.getElementById("stepDot1");
const stepDot2 = document.getElementById("stepDot2");

// ── STEP 1: Render muscle chips ───────────────────────────
muscleNames.forEach((name) => {
  const exCount = grouped[name].length;
  const firstGif = grouped[name][0]?.gifURL || "/img/placeholder.gif";

  const chip = document.createElement("div");
  chip.className = "muscle-chip";
  chip.dataset.muscle = name;
  chip.innerHTML = `
    <div class="chip-check">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <div class="chip-gif">
      <img src="${firstGif}" alt="${name}" loading="lazy"/>
    </div>
    <span class="chip-name">${name}</span>
    <span class="chip-count">${exCount} exercise${exCount !== 1 ? "s" : ""}</span>
  `;

  chip.addEventListener("click", () => {
    chip.classList.toggle("selected");
    updateNextBtn();
  });

  muscleGrid.appendChild(chip);
});

function getSelectedMuscles() {
  return [...document.querySelectorAll(".muscle-chip.selected")].map(
    (c) => c.dataset.muscle,
  );
}

function updateNextBtn() {
  const selected = getSelectedMuscles();
  nextBtn.disabled = selected.length === 0;
  step1Message.textContent =
    selected.length > 0
      ? `${selected.length} muscle${selected.length > 1 ? "s" : ""} selected`
      : "";
}

// ── NEXT → Step 2 ─────────────────────────────────────────
nextBtn.addEventListener("click", () => {
  const selected = getSelectedMuscles();
  if (selected.length === 0) return;

  // Build exercise pickers for each selected muscle
  exercisePickers.innerHTML = "";

  selected.forEach((muscleName, idx) => {
    const exercises = grouped[muscleName] || [];

    const section = document.createElement("div");
    section.className = "exercise-section";
    section.style.animationDelay = `${idx * 0.07}s`;

    const title = document.createElement("div");
    title.className = "exercise-section-title";
    title.textContent = muscleName;
    section.appendChild(title);

    const options = document.createElement("div");
    options.className = "exercise-options";

    exercises.forEach((ex, i) => {
      const label = document.createElement("label");
      label.className = "exercise-option";

      label.innerHTML = `
        <input class="exercise-radio" type="radio"
          name="exercise_${muscleName.replace(/\s+/g, "_")}"
          value="${ex.exerciseName}"
          ${i === 0 ? "checked" : ""} />
        <span class="exercise-custom-radio"></span>
        <div class="exercise-gif">
          <img src="${ex.gifURL || "/img/placeholder.gif"}" alt="${ex.exerciseName}" loading="lazy"/>
        </div>
        <span class="exercise-label">${ex.exerciseName}</span>
      `;

      options.appendChild(label);
    });

    section.appendChild(options);
    exercisePickers.appendChild(section);
  });

  // Transition to step 2
  step1Card.classList.add("hidden");
  step2Card.classList.remove("hidden");
  step2Card.style.animation = "none";
  step2Card.offsetHeight; // reflow
  step2Card.style.animation = "";

  stepDot1.classList.remove("active");
  stepDot1.classList.add("done");
  stepDot1.querySelector(".step-num").textContent = "✓";
  stepDot2.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── BACK → Step 1 ─────────────────────────────────────────
backBtn.addEventListener("click", () => {
  step2Card.classList.add("hidden");
  step1Card.classList.remove("hidden");

  stepDot1.classList.add("active");
  stepDot1.classList.remove("done");
  stepDot1.querySelector(".step-num").textContent = "1";
  stepDot2.classList.remove("active");

  step2Message.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── START WORKOUT ──────────────────────────────────────────
startBtn.addEventListener("click", async () => {
  step2Message.textContent = "";
  step2Message.className = "step-message";

  // Collect one selected exercise per muscle
  const selected = getSelectedMuscles();
  const targets = [];

  for (const muscleName of selected) {
    const radioName = `exercise_${muscleName.replace(/\s+/g, "_")}`;
    const checked = document.querySelector(
      `input[name="${radioName}"]:checked`,
    );
    if (checked) {
      targets.push({ muscle: muscleName, exercise: checked.value });
    }
  }

  if (targets.length === 0) {
    step2Message.textContent = "⚠ No exercises selected.";
    return;
  }

  startBtn.disabled = true;
  startBtn.querySelector("span").textContent = "Starting...";

  try {
    const res = await fetch("/api/v1/workout-logs/solo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targets }),
    });
    const data = await res.json();

    if (data.status === "success") {
      step2Message.textContent = "✓ Workout started!";
      step2Message.classList.add("success");
      setTimeout(() => {
        window.location.href = `/workoutLogs/${data.data._id}`;
      }, 500);
    } else {
      step2Message.textContent = data.message || "Failed to start workout.";
      startBtn.disabled = false;
      startBtn.querySelector("span").textContent = "Start Workout";
    }
  } catch (err) {
    console.error(err);
    step2Message.textContent = "Something went wrong. Please try again.";
    startBtn.disabled = false;
    startBtn.querySelector("span").textContent = "Start Workout";
  }
});
