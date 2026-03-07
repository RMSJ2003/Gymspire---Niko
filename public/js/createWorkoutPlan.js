// ===== DATA =====
const exercises = window.exercises || [];
const exerciseIds = [];

// track selected exercise per muscle
const selectedByTarget = {};

// DOM elements
const targetGrid = document.getElementById("targetGrid");
const targetModal = document.getElementById("targetModal");
const closeTargetModal = document.getElementById("closeTargetModal");
const targetTitle = document.getElementById("targetTitle");
const targetExerciseList = document.getElementById("targetExerciseList");
const form = document.querySelector("#createWorkoutPlanForm");
const formMessage = document.querySelector("#formMessage");

const modal = document.getElementById("exerciseModal");
const closeModal = document.getElementById("closeModal");
const modalGif = document.getElementById("modalGif");
const modalInstructions = document.getElementById("modalInstructions");

// ===== GROUP EXERCISES =====
const grouped = {};

exercises.forEach((ex, index) => {
  if (!grouped[ex.target]) grouped[ex.target] = [];
  grouped[ex.target].push({ ...ex, index });
});

// ===== CREATE TARGET CARDS =====
Object.keys(grouped).forEach((target) => {
  const card = document.createElement("div");

  card.className = "target-card";
  card.textContent = target;
  card.dataset.target = target;

  card.onclick = () => openTargetModal(target);

  targetGrid.appendChild(card);
});

// ===== OPEN MODAL =====
function openTargetModal(target) {
  targetTitle.textContent = target;
  targetExerciseList.innerHTML = "";

  grouped[target].forEach((ex) => {
    const checked = selectedByTarget[target] === ex.exerciseId ? "checked" : "";

    const row = document.createElement("div");
    row.className = "exercise-row";

    if (checked) row.classList.add("selected");

    row.innerHTML = `
      <div class="exercise-left">
        <input type="radio" name="exercise-${target}" value="${ex.exerciseId}" ${checked}>
        <span class="exercise-name">${ex.name}</span>
      </div>
      <button class="info-btn" data-index="${ex.index}" type="button">i</button>
    `;

    const radio = row.querySelector("input");

    row.onclick = (e) => {
      if (e.target.classList.contains("info-btn")) return;

      selectedByTarget[target] = ex.exerciseId;

      // remove previous exercise from same muscle
      for (let i = exerciseIds.length - 1; i >= 0; i--) {
        const existing = exercises.find((e) => e.exerciseId === exerciseIds[i]);

        if (existing && existing.target === target) {
          exerciseIds.splice(i, 1);
        }
      }

      exerciseIds.push(ex.exerciseId);

      document
        .querySelectorAll(`input[name="exercise-${target}"]`)
        .forEach((r) => {
          r.checked = false;
          r.closest(".exercise-row").classList.remove("selected");
        });

      radio.checked = true;
      row.classList.add("selected");

      const card = document.querySelector(`[data-target="${target}"]`);
      if (card) card.classList.add("active");
    };

    targetExerciseList.appendChild(row);
  });

  attachInfoButtons();

  targetModal.classList.remove("hidden");
}

// ===== CLOSE TARGET MODAL =====
closeTargetModal.onclick = () => targetModal.classList.add("hidden");

// ===== INFO BUTTON =====
function attachInfoButtons() {
  document.querySelectorAll(".info-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();

      const ex = exercises[btn.dataset.index];

      modalGif.src = ex.gifURL || "";
      modalGif.style.display = ex.gifURL ? "block" : "none";

      modalInstructions.innerHTML =
        "<h4>Instructions:</h4><ul>" +
        ex.instructions.map((s) => `<li>${s}</li>`).join("") +
        "</ul>";

      modal.classList.remove("hidden");
    };
  });
}

// ===== CLOSE MODAL =====
closeModal.onclick = () => modal.classList.add("hidden");

modal.onclick = (e) => {
  if (e.target === modal) modal.classList.add("hidden");
};

// ===== FORM SUBMIT =====
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (exerciseIds.length === 0) {
    formMessage.textContent = "Please select at least one exercise.";
    formMessage.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/v1/workout-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });

    const data = await res.json();

    if (data.status === "success") {
      formMessage.textContent = "Workout plan created!";
      formMessage.style.color = "green";

      setTimeout(() => {
        window.location.href = "/workoutPlan";
      }, 600);
    } else {
      formMessage.textContent = data.message;
    }
  } catch (err) {
    formMessage.textContent = err.message;
    formMessage.style.color = "red";
  }
});
